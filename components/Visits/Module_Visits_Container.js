
window.Module_Visits_Container = function({ clinicId, userId, showToast }) {
    const { useState, useEffect } = React;
    const today = new Date().toISOString().split('T')[0];

    // ==========================================
    // الحالات (States)
    const [currentView, setCurrentView] = useState('list'); // 'list' أو 'form'
    
    const [visits, setVisits] = useState([]);
    const [patients, setPatients] = useState([]);
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [clinicInfo, setClinicInfo] = useState({});

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const [searchQuery, setSearchQuery] = useState('');

    const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
    
    // بيانات الكشف (Form)
    const [formData, setFormData] = useState({
        id: null, patient_id: '', date: today, visit_type: 'new', chief_complaint: '', diagnosis: '', notes: ''
    });
    const [vitals, setVitals] = useState({ id: null, blood_pressure: '', temperature: '', heart_rate: '', weight: '' });
    const [rxItems, setRxItems] = useState([]);
    
    // بيانات الفاتورة المباشرة للكشف
    const [invoiceData, setInvoiceData] = useState({
        id: null, isEnabled: true, total_amount: '', paid_amount: '', payment_method: 'cash'
    });

    const [currentRxInput, setCurrentRxInput] = useState({ catalog_id: '', custom_name: '', dosage: '', frequency: '', duration: '', instructions: '' });

    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
    const [catalogSearchTerm, setCatalogSearchTerm] = useState('');
    const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);

    const [patientStats, setPatientStats] = useState(null);
    const [printData, setPrintData] = useState(null);

    const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) || (p.phone && p.phone.includes(patientSearchTerm))).slice(0, 10);
    const filteredCatalog = catalog.filter(c => c.name.toLowerCase().includes(catalogSearchTerm.toLowerCase())).slice(0, 10);

    // ==========================================
    // جلب البيانات الأساسية
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (!window.db) return;
                const clinic = await window.db.clinic_info.toCollection().first();
                const session = JSON.parse(localStorage.getItem('MentraClinics_Session') || '{}');
                setClinicInfo({ ...clinic, doctor_name: session.name });

                const allPatients = await window.db.patients.where('user_id').equals(userId).toArray();
                setPatients(allPatients);

                const allCatalog = await window.db.medical_catalog.where('user_id').equals(userId).toArray();
                setCatalog(allCatalog);

                let allVisits = await window.db.visits.where('user_id').equals(userId).toArray();
                let visitsWithData = allVisits.map(visit => {
                    const patient = allPatients.find(p => p.id === Number(visit.patient_id));
                    return { ...visit, patient_name: patient ? patient.name : 'مريض غير معروف' };
                });

                if (searchQuery.trim() !== '') {
                    visitsWithData = visitsWithData.filter(v => v.patient_name.includes(searchQuery));
                }

                visitsWithData.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
                setVisits(visitsWithData);
                if(searchQuery) setCurrentPage(1);

            } catch (error) {
                console.error(error);
                showToast("حدث خطأ أثناء تحميل الكشوفات", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, refreshTrigger, searchQuery]);

    const totalPages = Math.ceil(visits.length / itemsPerPage) || 1;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = visits.slice(indexOfFirstItem, indexOfLastItem);
    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    // ==========================================
    // إحصائيات المريض اللحظية
    useEffect(() => {
        if (!formData.patient_id) { setPatientStats(null); return; }
        const loadStats = async () => {
            const patient = patients.find(p => p.id === Number(formData.patient_id));
            if (!patient) return;
            const previousVisits = await window.db.visits.where('patient_id').equals(Number(patient.id)).toArray();
            let age = 'غير محدد';
            if (patient.birth_date) {
                const ageDifMs = Date.now() - new Date(patient.birth_date).getTime();
                age = Math.abs(new Date(ageDifMs).getUTCFullYear() - 1970) + ' سنة';
            }
            setPatientStats({
                age, blood_type: patient.blood_type || '-', visitsCount: previousVisits.length,
                lastVisit: previousVisits.length > 0 ? previousVisits.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : 'هذه الزيارة الأولى'
            });
        };
        loadStats();
    }, [formData.patient_id]);

    // ==========================================
    // التنقل بين الشاشات
    const openNewVisit = () => {
        setFormData({ id: null, patient_id: '', date: today, visit_type: 'new', chief_complaint: '', diagnosis: '', notes: '' });
        setVitals({ id: null, blood_pressure: '', temperature: '', heart_rate: '', weight: '' });
        setRxItems([]);
        setPatientSearchTerm('');
        setCatalogSearchTerm('');
        setInvoiceData({ id: null, isEnabled: true, total_amount: '', paid_amount: '', payment_method: 'cash' });
        setCurrentView('form');
    };

    const openEditVisit = async (visit) => {
        setLoading(true);
        try {
            setFormData({
                id: visit.id, patient_id: visit.patient_id, date: visit.date, visit_type: visit.visit_type,
                chief_complaint: visit.chief_complaint, diagnosis: visit.diagnosis, notes: visit.notes
            });
            const patient = patients.find(p => p.id === visit.patient_id);
            setPatientSearchTerm(patient ? patient.name : '');

            const v = await window.db.vitals.where('visit_id').equals(visit.id).first();
            if (v) setVitals(v); else setVitals({ id: null, blood_pressure: '', temperature: '', heart_rate: '', weight: '' });

            const rx = await window.db.prescriptions.where('visit_id').equals(visit.id).first();
            if (rx) {
                const items = await window.db.prescription_items.where('prescription_id').equals(rx.id).toArray();
                const enrichedRx = items.map(item => {
                    const c = catalog.find(cat => cat.id === item.catalog_id);
                    return { ...item, catalog_name: c ? c.name : 'صنف مسجل', catalog_type: c ? c.type : 'drug' };
                });
                setRxItems(enrichedRx);
            } else {
                setRxItems([]);
            }

            // جلب الفاتورة المرتبطة إن وجدت
            const existingInv = await window.db.invoices.where('visit_id').equals(visit.id).first();
            if (existingInv) {
                setInvoiceData({
                    id: existingInv.id, isEnabled: true, total_amount: existingInv.total_amount,
                    paid_amount: existingInv.paid_amount, payment_method: existingInv.payment_method || 'cash'
                });
            } else {
                setInvoiceData({ id: null, isEnabled: false, total_amount: '', paid_amount: '', payment_method: 'cash' });
            }

            setCurrentView('form');
        } catch(error) {
            showToast("تعذر جلب بيانات الكشف للتعديل", "error");
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => { setCurrentView('list'); };

    // ==========================================
    // باني الروشتة (يدعم الكتابة الحرة والدليل)
    const addRxItem = async (activeType = 'drug') => {
        const itemName = catalogSearchTerm.trim() || currentRxInput.custom_name?.trim();
        if (!itemName) return showToast("يرجى كتابة أو اختيار اسم الصنف", "error");

        let targetCatalogId = currentRxInput.catalog_id;

        // إذا كتب الطبيب الصنف يدوياً ولم يختره من الدليل، نقوم بإدراجه تلقائياً في الدليل
        if (!targetCatalogId) {
            const existing = catalog.find(c => c.name.toLowerCase() === itemName.toLowerCase() && c.type === activeType);
            if (existing) {
                targetCatalogId = existing.id;
            } else {
                targetCatalogId = await window.db.medical_catalog.add({
                    name: itemName, type: activeType, user_id: userId, is_active: 1,
                    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
                });
                const updatedCatalog = await window.db.medical_catalog.where('user_id').equals(userId).toArray();
                setCatalog(updatedCatalog);
            }
        }

        setRxItems([...rxItems, {
            ...currentRxInput,
            catalog_id: targetCatalogId,
            catalog_name: itemName,
            catalog_type: activeType
        }]);

        setCurrentRxInput({ catalog_id: '', custom_name: '', dosage: '', frequency: '', duration: '', instructions: '' });
        setCatalogSearchTerm('');
    };

    const removeRxItem = (index) => {
        const newItems = [...rxItems]; newItems.splice(index, 1); setRxItems(newItems);
    };

    const handleQuickAddCatalog = async (e) => {
        e.preventDefault();
        const name = e.target.name.value; const type = e.target.type.value;
        try {
            const newId = await window.db.medical_catalog.add({ name, type, user_id: userId, is_active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
            showToast("تمت إضافة الصنف للقائمة", "success");
            const newCatalog = await window.db.medical_catalog.where('user_id').equals(userId).toArray();
            setCatalog(newCatalog);
            setCurrentRxInput({ ...currentRxInput, catalog_id: newId });
            setCatalogSearchTerm(name);
            setIsQuickAddModalOpen(false);
        } catch (error) { showToast("فشل الإضافة للقائمة", "error"); }
    };

    // ==========================================
    // الحفظ النهائي (الكشف + الروشتة + الفاتورة + الموعد)
    const handleSaveVisit = async (e, linkWithAppointment) => {
        e.preventDefault();
        if (!formData.patient_id) return showToast("الرجاء اختيار مريض صحيح من القائمة", "error");

        try {
            let currentVisitId = formData.id;

            if (currentVisitId) {
                // حالة التعديل
                const visitDataToUpdate = { ...formData, patient_id: Number(formData.patient_id), updated_at: new Date().toISOString() };
                delete visitDataToUpdate.id; 
                await window.db.visits.update(currentVisitId, visitDataToUpdate);

                if (vitals.blood_pressure || vitals.temperature || vitals.weight) {
                    if (vitals.id) await window.db.vitals.update(vitals.id, { ...vitals });
                    else await window.db.vitals.add({ ...vitals, visit_id: currentVisitId, patient_id: Number(formData.patient_id), user_id: userId, created_at: new Date().toISOString() });
                }

                let rx = await window.db.prescriptions.where('visit_id').equals(currentVisitId).first();
                let rxId = rx ? rx.id : null;
                
                if (!rxId && rxItems.length > 0) {
                    rxId = await window.db.prescriptions.add({ visit_id: currentVisitId, patient_id: Number(formData.patient_id), doctor_id: userId, user_id: userId, date: formData.date, status: 'issued', created_at: new Date().toISOString() });
                }

                if (rxId) {
                    await window.db.prescription_items.where('prescription_id').equals(rxId).delete();
                    if (rxItems.length > 0) {
                        const itemsToSave = rxItems.map(item => ({ prescription_id: rxId, catalog_id: Number(item.catalog_id), user_id: userId, dosage: item.dosage, frequency: item.frequency, duration: item.duration, instructions: item.instructions, created_at: new Date().toISOString() }));
                        await window.db.prescription_items.bulkAdd(itemsToSave);
                    }
                }

            } else {
                // حالة الإنشاء الجديد
                const visitData = { ...formData, patient_id: Number(formData.patient_id), doctor_id: userId, user_id: userId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
                delete visitData.id;
                currentVisitId = await window.db.visits.add(visitData);
                
                if (vitals.blood_pressure || vitals.temperature || vitals.weight) {
                    const vitalsData = { ...vitals, visit_id: currentVisitId, patient_id: Number(formData.patient_id), user_id: userId, created_at: new Date().toISOString() };
                    delete vitalsData.id;
                    await window.db.vitals.add(vitalsData);
                }

                if (rxItems.length > 0) {
                    const prescriptionId = await window.db.prescriptions.add({ visit_id: currentVisitId, patient_id: Number(formData.patient_id), doctor_id: userId, user_id: userId, date: formData.date, status: 'issued', created_at: new Date().toISOString() });
                    const itemsToSave = rxItems.map(item => ({ prescription_id: prescriptionId, catalog_id: Number(item.catalog_id), user_id: userId, dosage: item.dosage, frequency: item.frequency, duration: item.duration, instructions: item.instructions, created_at: new Date().toISOString() }));
                    await window.db.prescription_items.bulkAdd(itemsToSave);
                }
            }

            // ============== حفظ الفاتورة التلقائية ==============
            if (invoiceData.isEnabled && Number(invoiceData.total_amount) > 0) {
                const total = Number(invoiceData.total_amount);
                const paid = Number(invoiceData.paid_amount || total);
                const paymentStatus = paid >= total ? 'paid' : (paid > 0 ? 'partial' : 'unpaid');

                const invoicePayload = {
                    patient_id: Number(formData.patient_id),
                    visit_id: currentVisitId,
                    doctor_id: userId,
                    user_id: userId,
                    date: formData.date,
                    total_amount: total,
                    paid_amount: paid,
                    payment_status: paymentStatus,
                    payment_method: invoiceData.payment_method,
                    updated_at: new Date().toISOString()
                };

                if (invoiceData.id) {
                    await window.db.invoices.update(invoiceData.id, invoicePayload);
                } else {
                    invoicePayload.created_at = new Date().toISOString();
                    await window.db.invoices.add(invoicePayload);
                }
            }

            // ============== ربط الموعد ==============
            if (linkWithAppointment) {
                const existingAppt = await window.db.appointments.where({ patient_id: Number(formData.patient_id), date: formData.date }).first();
                if (existingAppt) {
                    await window.db.appointments.update(existingAppt.id, { status: 'completed', updated_at: new Date().toISOString() });
                } else {
                    await window.db.appointments.add({
                        date: formData.date, patient_id: Number(formData.patient_id), doctor_id: userId, user_id: userId,
                        status: 'completed', type: formData.visit_type, notes: 'تم الإنشاء تلقائياً من الكشف الطبي',
                        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
                    });
                }
            }

            showToast("تم حفظ الكشف والروشتة والفاتورة بنجاح", "success");
            goBack();
            setRefreshTrigger(prev => prev + 1);
        } catch (error) { 
            console.error(error);
            showToast("حدث خطأ أثناء الحفظ", "error"); 
        }
    };

    const handlePrint = async (visit) => {
        try {
            const patient = patients.find(p => p.id === visit.patient_id);
            const prescription = await window.db.prescriptions.where('visit_id').equals(visit.id).first();
            let medications = [];
            if (prescription) {
                const items = await window.db.prescription_items.where('prescription_id').equals(prescription.id).toArray();
                medications = items.map(item => {
                    const c = catalog.find(cat => cat.id === item.catalog_id);
                    return { ...item, drug_name: c ? c.name : 'صنف مسجل' };
                });
            }
            setPrintData({ clinic: clinicInfo, patient, visit, medications });
            setTimeout(() => { window.print(); }, 500);
        } catch (error) { showToast("خطأ في تجهيز الروشتة للطباعة", "error"); }
    };

    const handleDelete = async (id) => {
        if(confirm("هل أنت متأكد من حذف هذا الكشف الطبي بالكامل (شاملاً الروشتة والفاتورة)؟")) {
            await window.db.visits.delete(id);
            // حذف الفاتورة المرتبطة بالكشف إن وجدت
            const linkedInv = await window.db.invoices.where('visit_id').equals(id).first();
            if (linkedInv) await window.db.invoices.delete(linkedInv.id);

            setRefreshTrigger(prev => prev + 1);
            showToast("تم حذف الكشف والفاتورة المرتبطة", "success");
        }
    };

    // ==========================================
    // واجهة العرض
    if (currentView === 'form') {
        return (
            <div className="animate-view pb-24 md:pb-10 print:m-0 print:p-0 max-w-5xl mx-auto">
                {window.VisitFormPage ? (
                    <window.VisitFormPage 
                        goBack={goBack} handleSaveVisit={handleSaveVisit}
                        formData={formData} setFormData={setFormData}
                        vitals={vitals} setVitals={setVitals}
                        patients={patients} filteredPatients={filteredPatients}
                        patientSearchTerm={patientSearchTerm} setPatientSearchTerm={setPatientSearchTerm}
                        isPatientDropdownOpen={isPatientDropdownOpen} setIsPatientDropdownOpen={setIsPatientDropdownOpen}
                        patientStats={patientStats}
                        catalog={catalog} filteredCatalog={filteredCatalog}
                        catalogSearchTerm={catalogSearchTerm} setCatalogSearchTerm={setCatalogSearchTerm}
                        isCatalogDropdownOpen={isCatalogDropdownOpen} setIsCatalogDropdownOpen={setIsCatalogDropdownOpen}
                        currentRxInput={currentRxInput} setCurrentRxInput={setCurrentRxInput}
                        rxItems={rxItems} addRxItem={addRxItem} removeRxItem={removeRxItem}
                        setIsQuickAddModalOpen={setIsQuickAddModalOpen}
                        invoiceData={invoiceData} setInvoiceData={setInvoiceData}
                    />
                ) : (
                    <div className="flex justify-center p-12 bg-white rounded-3xl shadow-sm"><i className="fas fa-spinner fa-spin text-4xl text-[#0EA5E9]"></i></div>
                )}
                
                {isQuickAddModalOpen && window.QuickAddCatalogModal && (
                    <window.QuickAddCatalogModal 
                        setIsQuickAddModalOpen={setIsQuickAddModalOpen}
                        handleQuickAddCatalog={handleQuickAddCatalog}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6 animate-view pb-24 md:pb-10 print:m-0 print:p-0 max-w-6xl mx-auto">
            <div className="print:hidden space-y-4 md:space-y-6">
                
                {window.VisitsHeader && <window.VisitsHeader openNewVisit={openNewVisit} />}
                
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="relative w-full md:w-1/2">
                        <input type="text" placeholder="بحث باسم المريض..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none transition-colors" />
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    </div>
                </div>

                {window.VisitsList && (
                    <window.VisitsList 
                        loading={loading} visitsLength={visits.length} currentItems={currentItems}
                        handlePrint={handlePrint} handleDelete={handleDelete} openEditVisit={openEditVisit}
                        totalPages={totalPages} currentPage={currentPage} prevPage={prevPage} nextPage={nextPage}
                    />
                )}
                
                {window.VisitsPromoBanner && <window.VisitsPromoBanner />}
            </div>

            {printData && window.PrintTemplate && <window.PrintTemplate printData={printData} />}
        </div>
    );
};