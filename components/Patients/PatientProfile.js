window.PatientProfile = function({ patient, goBack, userId, showToast, calculateAge }) {
    const { useState, useEffect } = React;

    const [activeTab, setActiveTab] = useState('visits');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    const [visits, setVisits] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [clinicInfo, setClinicInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    useEffect(() => {
        const fetchPatientData = async () => {
            setLoading(true);
            try {
                if (!window.db) return;

                const clinic = await window.db.clinic_info.toCollection().first();
                setClinicInfo(clinic);

                const allVisits = await window.db.visits.where('patient_id').equals(patient.id).toArray();
                const allPrescriptions = await window.db.prescriptions.where('patient_id').equals(patient.id).toArray();
                const allPrescriptionItems = await window.db.prescription_items.where('user_id').equals(userId).toArray();
                const catalog = await window.db.medical_catalog.where('user_id').equals(userId).toArray();

                const enrichedVisits = allVisits.map(visit => {
                    const prescription = allPrescriptions.find(p => p.visit_id === visit.id);
                    let meds = [];
                    if (prescription) {
                        const items = allPrescriptionItems.filter(item => item.prescription_id === prescription.id);
                        meds = items.map(item => {
                            const drug = catalog.find(d => d.id === item.catalog_id);
                            return { ...item, drug_name: drug ? drug.name : 'دواء حر' };
                        });
                    }
                    return { ...visit, prescription_notes: prescription?.notes, medications: meds };
                });

                const patientInvoices = await window.db.invoices.where('patient_id').equals(patient.id).toArray();
                
                // جلب كل المواعيد (لعرض السجل الكامل في التبويب)
                const allAppointments = await window.db.appointments.where('patient_id').equals(patient.id).toArray();

                enrichedVisits.sort((a, b) => new Date(b.date) - new Date(a.date));
                patientInvoices.sort((a, b) => new Date(b.date) - new Date(a.date));
                allAppointments.sort((a, b) => new Date(b.date) - new Date(a.date)); // الأحدث أولاً

                setVisits(enrichedVisits);
                setInvoices(patientInvoices);
                setAppointments(allAppointments);

            } catch (error) {
                showToast("حدث خطأ في جلب بيانات المريض", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchPatientData();
    }, [patient.id, userId, refreshTrigger]);

    useEffect(() => { setCurrentPage(1); }, [activeTab, dateRange]);

    const handleDateChange = (e) => setDateRange({ ...dateRange, [e.target.name]: e.target.value });

    // ==========================================
    // دوال إدارة المواعيد داخل ملف المريض
    // ==========================================
    const handleUpdateApptStatus = async (id, newStatus) => {
        try {
            await window.db.appointments.update(id, { status: newStatus, updated_at: new Date().toISOString() });
            showToast("تم تحديث حالة الموعد", "success");
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            showToast("حدث خطأ أثناء التحديث", "error");
        }
    };

    const handleDeleteAppt = async (id) => {
        if(confirm("هل أنت متأكد من حذف هذا الموعد نهائياً؟")) {
            try {
                await window.db.appointments.delete(id);
                showToast("تم حذف الموعد", "success");
                setRefreshTrigger(prev => prev + 1);
            } catch (error) {
                showToast("فشل الحذف", "error");
            }
        }
    };

    // الفلاتر
    const filteredVisits = visits.filter(v => (!dateRange.from || v.date >= dateRange.from) && (!dateRange.to || v.date <= dateRange.to));
    const filteredPrescriptions = filteredVisits.filter(v => v.medications && v.medications.length > 0);
    const filteredInvoices = invoices.filter(i => (!dateRange.from || i.date >= dateRange.from) && (!dateRange.to || i.date <= dateRange.to));

    let activeData = [];
    if (activeTab === 'visits') activeData = filteredVisits;
    else if (activeTab === 'prescriptions') activeData = filteredPrescriptions;
    else if (activeTab === 'financials') activeData = filteredInvoices;
    else if (activeTab === 'appointments') activeData = appointments; 

    const totalPages = Math.ceil(activeData.length / itemsPerPage) || 1;
    const currentItems = activeData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

    if (loading) return <div className="flex justify-center items-center h-64"><i className="fas fa-spinner fa-spin text-4xl text-[#0EA5E9]"></i></div>;

    // حساب المواعيد المعلقة فقط لعرضها في الإحصائيات العلوية
    const pendingCount = appointments.filter(app => app.status !== 'completed' && app.status !== 'cancelled').length;

    const statsObj = {
        visitsCount: filteredVisits.length,
        appsCount: pendingCount,
        totalRevenue: filteredInvoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0)
    };

    return (
        <div className="animate-view max-w-5xl mx-auto space-y-8 pb-10 relative">
            
            <window.PatientProfile_Header 
                patient={patient} calculateAge={calculateAge} goBack={goBack} 
                setIsBookingModalOpen={setIsBookingModalOpen} stats={statsObj} 
            />

            <window.PatientProfile_Content 
                activeTab={activeTab} setActiveTab={setActiveTab} 
                dateRange={dateRange} handleDateChange={handleDateChange} 
                currentItems={currentItems} setSelectedPrescription={setSelectedPrescription} 
                totalPages={totalPages} currentPage={currentPage} 
                nextPage={nextPage} prevPage={prevPage}
                handleUpdateApptStatus={handleUpdateApptStatus} 
                handleDeleteAppt={handleDeleteAppt}
            />

            {isBookingModalOpen && (
                <window.PatientProfile_BookModal 
                    setIsBookingModalOpen={setIsBookingModalOpen} patient={patient} 
                    userId={userId} showToast={showToast} refreshData={() => setRefreshTrigger(prev=>prev+1)} 
                />
            )}
            
            {selectedPrescription && (
                <window.PatientProfile_RxModal 
                    prescription={selectedPrescription} patient={patient} 
                    close={() => setSelectedPrescription(null)} clinicInfo={clinicInfo} 
                />
            )}

        </div>
    );
};