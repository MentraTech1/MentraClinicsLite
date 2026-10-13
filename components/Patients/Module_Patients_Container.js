
window.Module_Patients_Container = function({ clinicId, userId, showToast }) {
    const { useState, useEffect } = React;

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null, name: '', phone: '', national_id: '', 
        gender: 'male', birth_date: '', blood_type: '', address: ''
    });

    // التحكم في عرض ملف المريض الكامل
    const [selectedPatient, setSelectedPatient] = useState(null);

    // ==========================================
    // جلب بيانات المرضى
    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            try {
                if (!window.db) return;
                let allPatients = await window.db.patients.where('user_id').equals(userId).toArray();

                if (searchQuery.trim() !== '') {
                    const query = searchQuery.toLowerCase();
                    allPatients = allPatients.filter(p => 
                        p.name.toLowerCase().includes(query) || 
                        (p.phone && p.phone.includes(query))
                    );
                }

                allPatients.sort((a, b) => b.id - a.id);
                setPatients(allPatients);
                if(searchQuery) setCurrentPage(1);

            } catch (error) {
                console.error(error);
                showToast("حدث خطأ أثناء تحميل سجل المرضى", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, [userId, searchQuery, refreshTrigger]);

    // ==========================================
    // Pagination Logic للقائمة الرئيسية
    const totalPages = Math.ceil(patients.length / itemsPerPage) || 1;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = patients.slice(indexOfFirstItem, indexOfLastItem);

    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    // ==========================================
    // حساب العمر
    const calculateAge = (birthDate) => {
        if (!birthDate) return 'غير محدد';
        const ageDifMs = Date.now() - new Date(birthDate).getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970) + ' سنة';
    };

    // ==========================================
    // عمليات الـ CRUD
    const handleSavePatient = async (e) => {
        e.preventDefault();
        try {
            const patientData = { ...formData, user_id: userId, updated_at: new Date().toISOString(), is_active: 1 };
            
            if (isEditing) {
                await window.db.patients.update(formData.id, patientData);
                showToast("تم تحديث بيانات المريض بنجاح", "success");
            } else {
                delete patientData.id;
                // السطر التالي يضمن حفظ تاريخ التسجيل للمرضى الجدد
                patientData.created_at = new Date().toISOString(); 
                
                if(formData.phone) {
                    const exist = await window.db.patients.where('phone').equals(formData.phone).first();
                    if(exist) return showToast("رقم الهاتف مسجل لمريض آخر", "error");
                }
                await window.db.patients.add(patientData);
                showToast("تم إضافة المريض بنجاح", "success");
            }
            setIsFormModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error(error);
            showToast("حدث خطأ أثناء الحفظ", "error");
        }
    };

    const openEditModal = (patient) => {
        setFormData(patient);
        setIsEditing(true);
        setIsFormModalOpen(true);
    };

    const openAddModal = () => {
        setFormData({ id: null, name: '', phone: '', national_id: '', gender: 'male', birth_date: '', blood_type: '', address: '' });
        setIsEditing(false);
        setIsFormModalOpen(true);
    };

    const handleDelete = async (id) => {
        if(confirm("هل أنت متأكد من حذف هذا المريض نهائياً؟ ستفقد جميع كشوفاته وفواتيره.")) {
            try {
                await window.db.patients.delete(id);
                showToast("تم حذف المريض", "success");
                setRefreshTrigger(prev => prev + 1);
            } catch (error) {
                showToast("فشل عملية الحذف", "error");
            }
        }
    };

    const viewPatientProfile = (patient) => {
        setSelectedPatient(patient);
    };

    // إذا تم اختيار مريض، اعرض ملفه بالكامل
    if (selectedPatient) {
        return (
            <window.PatientProfile 
                patient={selectedPatient} 
                goBack={() => setSelectedPatient(null)} 
                userId={userId} 
                showToast={showToast}
                calculateAge={calculateAge}
            />
        );
    }

    // الشاشة الافتراضية (سجل المرضى)
    return (
        <div className="space-y-4 md:space-y-6 animate-view pb-24 md:pb-10 max-w-6xl mx-auto">
            
            <window.PatientsHeader 
                openAddModal={openAddModal} 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
            />
            
            <window.PatientsList 
                loading={loading}
                patientsLength={patients.length}
                currentItems={currentItems}
                calculateAge={calculateAge}
                viewPatientProfile={viewPatientProfile}
                openEditModal={openEditModal}
                handleDelete={handleDelete}
                totalPages={totalPages}
                currentPage={currentPage}
                prevPage={prevPage}
                nextPage={nextPage}
            />

            {isFormModalOpen && (
                <window.PatientFormModal 
                    setIsFormModalOpen={setIsFormModalOpen}
                    isEditing={isEditing}
                    formData={formData}
                    setFormData={setFormData}
                    handleSavePatient={handleSavePatient}
                />
            )}

            <window.PatientsPromoBanner />
        </div>
    );
};