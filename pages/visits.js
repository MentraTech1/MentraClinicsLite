window.Module_Visits = function({ clinicId, userId, showToast }) {
    const { useState, useEffect, useRef } = React;

    const today = new Date().toISOString().split('T')[0];

    // ==========================================
    // States (الحالات)
    // ==========================================
    const [visits, setVisits] = useState([]);
    const [patients, setPatients] = useState([]);
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [clinicInfo, setClinicInfo] = useState({});

    // Pagination (Limit 3)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const [searchQuery, setSearchQuery] = useState('');

    // Modal States
    const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
    const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
    
    // Visit Form Data
    const [formData, setFormData] = useState({
        patient_id: '', date: today, visit_type: 'new',
        chief_complaint: '', diagnosis: '', notes: ''
    });

    // Vitals (العلامات الحيوية)
    const [vitals, setVitals] = useState({
        blood_pressure: '', temperature: '', heart_rate: '', weight: ''
    });

    // Prescription Builder
    const [rxItems, setRxItems] = useState([]);
    const [currentRxInput, setCurrentRxInput] = useState({
        catalog_id: '', dosage: '', frequency: '', duration: '', instructions: ''
    });

    // ==========================================
    // حالات البحث الحي (Live Search)
    // ==========================================
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

    const [catalogSearchTerm, setCatalogSearchTerm] = useState('');
    const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);

    // فلترة المرضى (أول 10 فقط)
    const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) || 
        (p.phone && p.phone.includes(patientSearchTerm))
    ).slice(0, 10);

    // فلترة الأدوية والأشعة (أول 10 فقط)
    const filteredCatalog = catalog.filter(c => 
        c.name.toLowerCase().includes(catalogSearchTerm.toLowerCase())
    ).slice(0, 10);


    // Quick Patient Stats
    const [patientStats, setPatientStats] = useState(null);

    // Print Data
    const [printData, setPrintData] = useState(null);

    // ==========================================
    // Data Fetching
    // ==========================================
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (!window.db) return;

                // بيانات العيادة للطباعة
                const clinic = await window.db.clinic_info.toCollection().first();
                const session = JSON.parse(localStorage.getItem('MentraClinics_Session') || '{}');
                setClinicInfo({ ...clinic, doctor_name: session.name });

                // المرضى والأدوية
                const allPatients = await window.db.patients.where('user_id').equals(userId).toArray();
                setPatients(allPatients);

                const allCatalog = await window.db.medical_catalog.where('user_id').equals(userId).toArray();
                setCatalog(allCatalog);

                // الكشوفات
                let allVisits = await window.db.visits.where('user_id').equals(userId).toArray();
                
                // دمج الأسماء
                let visitsWithData = allVisits.map(visit => {
                    const patient = allPatients.find(p => p.id === Number(visit.patient_id));
                    return { ...visit, patient_name: patient ? patient.name : 'مريض غير معروف' };
                });

                // البحث
                if (searchQuery.trim() !== '') {
                    visitsWithData = visitsWithData.filter(v => v.patient_name.includes(searchQuery));
                }

                // ترتيب من الأحدث
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

    // ==========================================
    // Pagination Logic
    // ==========================================
    const totalPages = Math.ceil(visits.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = visits.slice(indexOfFirstItem, indexOfLastItem);

    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    // ==========================================
    // Smart Patient Stats Logic
    // ==========================================
    useEffect(() => {
        if (!formData.patient_id) {
            setPatientStats(null);
            return;
        }

        const loadStats = async () => {
            const patient = patients.find(p => p.id === Number(formData.patient_id));
            if (!patient) return;

            const previousVisits = await window.db.visits.where('patient_id').equals(Number(patient.id)).toArray();
            
            // حساب العمر
            let age = 'غير محدد';
            if (patient.birth_date) {
                const ageDifMs = Date.now() - new Date(patient.birth_date).getTime();
                age = Math.abs(new Date(ageDifMs).getUTCFullYear() - 1970) + ' سنة';
            }

            setPatientStats({
                age,
                blood_type: patient.blood_type || '-',
                visitsCount: previousVisits.length,
                lastVisit: previousVisits.length > 0 ? previousVisits.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : 'هذه الزيارة الأولى'
            });
        };

        loadStats();
    }, [formData.patient_id]);

    // ==========================================
    // Prescription Builder Logic
    // ==========================================
    const addRxItem = () => {
        if (!currentRxInput.catalog_id) return showToast("اختر العلاج أو الإجراء أولاً", "error");
        
        const catalogItem = catalog.find(c => c.id === Number(currentRxInput.catalog_id));
        
        setRxItems([...rxItems, { 
            ...currentRxInput, 
            catalog_name: catalogItem.name,
            catalog_type: catalogItem.type
        }]);
        
        setCurrentRxInput({ catalog_id: '', dosage: '', frequency: '', duration: '', instructions: '' });
        setCatalogSearchTerm('');
    };

    const removeRxItem = (index) => {
        const newItems = [...rxItems];
        newItems.splice(index, 1);
        setRxItems(newItems);
    };

    // ==========================================
    // Quick Add Catalog Logic
    // ==========================================
    const handleQuickAddCatalog = async (e) => {
        e.preventDefault();
        const name = e.target.name.value;
        const type = e.target.type.value;

        try {
            const newId = await window.db.medical_catalog.add({
                name, type,
                user_id: userId,
                is_active: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            showToast("تمت إضافة الصنف للقائمة", "success");
            
            const newCatalog = await window.db.medical_catalog.where('user_id').equals(userId).toArray();
            setCatalog(newCatalog);
            setCurrentRxInput({ ...currentRxInput, catalog_id: newId });
            setCatalogSearchTerm(name);
            setIsQuickAddModalOpen(false);
        } catch (error) {
            showToast("فشل الإضافة للقائمة", "error");
        }
    };

    // ==========================================
    // Save Full Visit Logic
    // ==========================================
    const handleSaveVisit = async (e) => {
        e.preventDefault();
        if (!formData.patient_id) return showToast("الرجاء اختيار مريض صحيح من القائمة", "error");

        try {
            // 1. حفظ الكشف
            const visitId = await window.db.visits.add({
                ...formData,
                patient_id: Number(formData.patient_id),
                doctor_id: userId,
                user_id: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            // 2. حفظ العلامات الحيوية
            if (vitals.blood_pressure || vitals.temperature || vitals.weight) {
                await window.db.vitals.add({
                    ...vitals,
                    visit_id: visitId, patient_id: Number(formData.patient_id), user_id: userId,
                    created_at: new Date().toISOString()
                });
            }

            // 3. حفظ الروشتة والأدوية
            if (rxItems.length > 0) {
                const prescriptionId = await window.db.prescriptions.add({
                    visit_id: visitId, patient_id: Number(formData.patient_id), doctor_id: userId, user_id: userId,
                    date: formData.date, status: 'issued', created_at: new Date().toISOString()
                });

                const itemsToSave = rxItems.map(item => ({
                    prescription_id: prescriptionId,
                    catalog_id: Number(item.catalog_id),
                    user_id: userId,
                    dosage: item.dosage, frequency: item.frequency, duration: item.duration, instructions: item.instructions,
                    created_at: new Date().toISOString()
                }));

                await window.db.prescription_items.bulkAdd(itemsToSave);
            }

            showToast("تم حفظ الكشف والروشتة بنجاح", "success");
            closeModals();
            setRefreshTrigger(prev => prev + 1);

        } catch (error) {
            console.error(error);
            showToast("حدث خطأ أثناء الحفظ", "error");
        }
    };

    const closeModals = () => {
        setIsVisitModalOpen(false);
        setFormData({ patient_id: '', date: today, visit_type: 'new', chief_complaint: '', diagnosis: '', notes: '' });
        setVitals({ blood_pressure: '', temperature: '', heart_rate: '', weight: '' });
        setRxItems([]);
        setPatientStats(null);
        setPatientSearchTerm('');
        setCatalogSearchTerm('');
    };

    // ==========================================
    // Smart Print Logic
    // ==========================================
    const handlePrint = async (visit) => {
        try {
            const patient = patients.find(p => p.id === visit.patient_id);
            const prescription = await window.db.prescriptions.where('visit_id').equals(visit.id).first();
            
            let medications = [];
            if (prescription) {
                const items = await window.db.prescription_items.where('prescription_id').equals(prescription.id).toArray();
                medications = items.map(item => {
                    const c = catalog.find(cat => cat.id === item.catalog_id);
                    return { ...item, drug_name: c ? c.name : 'دواء' };
                });
            }

            setPrintData({
                clinic: clinicInfo,
                patient: patient,
                visit: visit,
                medications: medications
            });

            setTimeout(() => {
                window.print();
            }, 500);

        } catch (error) {
            showToast("خطأ في تجهيز الروشتة للطباعة", "error");
        }
    };

    const handleDelete = async (id) => {
        if(confirm("هل أنت متأكد من حذف هذا الكشف الطبي بالكامل (شاملاً الروشتة)؟")) {
            await window.db.visits.delete(id);
            setRefreshTrigger(prev => prev + 1);
            showToast("تم حذف الكشف", "success");
        }
    };

    // ==========================================
    // UI Render
    // ==========================================
    return (
        <div className="space-y-4 md:space-y-6 animate-view pb-24 md:pb-10 print:m-0 print:p-0 max-w-6xl mx-auto">
            
            {/* ====== واجهة النظام (تُخفى أثناء الطباعة) ====== */}
            <div className="print:hidden space-y-4 md:space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-center md:text-right w-full md:w-auto">
                        <h2 className="text-xl md:text-2xl font-black text-[#0284C7] flex items-center justify-center md:justify-start gap-2">
                            <i className="fas fa-stethoscope"></i> سجل الكشوفات والتقارير
                        </h2>
                        <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">كتابة الروشتات، التشخيص، وتاريخ الزيارات</p>
                    </div>
                    <button onClick={() => setIsVisitModalOpen(true)} className="w-full md:w-auto bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-6 py-3.5 md:py-3 rounded-xl font-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 active:scale-95">
                        <i className="fas fa-file-medical"></i> كشف / روشتة جديدة
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="relative w-full md:w-1/2">
                        <input type="text" placeholder="بحث باسم المريض..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none transition-colors" />
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    </div>
                </div>

                {/* Data List (Cards for Mobile, Table for Desktop) */}
                {loading ? (
                    <div className="flex justify-center p-10"><i className="fas fa-spinner fa-spin text-3xl text-[#0EA5E9]"></i></div>
                ) : visits.length === 0 ? (
                    <div className="text-center p-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <i className="fas fa-notes-medical text-5xl text-slate-300 mb-4"></i>
                        <h3 className="text-lg font-bold text-slate-600">لا توجد كشوفات</h3>
                    </div>
                ) : (
                    <div className="bg-transparent md:bg-white md:rounded-2xl md:border border-slate-100 md:shadow-sm overflow-hidden">
                        
                        {/* تصميم الموبايل (Cards) */}
                        <div className="md:hidden space-y-3">
                            {currentItems.map((visit) => (
                                <div key={visit.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                                        <div>
                                            <h3 className="font-black text-[#0284C7] text-base">{visit.patient_name}</h3>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${visit.visit_type === 'new' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {visit.visit_type === 'new' ? 'كشف جديد' : 'متابعة'}
                                            </span>
                                        </div>
                                        <div className="text-left font-bold text-slate-700 text-sm">
                                            {visit.date}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold">التشخيص:</p>
                                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{visit.diagnosis || 'بدون تشخيص'}</p>
                                    </div>

                                    <div className="flex gap-2 pt-2 mt-1 border-t border-slate-50">
                                        <button onClick={() => handlePrint(visit)} className="flex-1 bg-[#0284C7] text-white py-2.5 rounded-lg font-bold text-xs shadow-md active:scale-95 flex items-center justify-center gap-2">
                                            <i className="fas fa-print"></i> طباعة الروشتة
                                        </button>
                                        <button onClick={() => handleDelete(visit.id)} className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center active:scale-95">
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* تصميم الكمبيوتر (Table) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">التاريخ والنوع</th>
                                        <th className="px-6 py-4">المريض</th>
                                        <th className="px-6 py-4">التشخيص (Diagnosis)</th>
                                        <th className="px-6 py-4 text-center">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentItems.map((visit) => (
                                        <tr key={visit.id} className="hover:bg-sky-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-700">{visit.date}</div>
                                                <div className="text-xs text-slate-400">{visit.visit_type === 'new' ? 'كشف جديد' : 'متابعة'}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-[#0284C7]">{visit.patient_name}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-600 max-w-xs truncate" title={visit.diagnosis}>{visit.diagnosis || '-'}</td>
                                            <td className="px-6 py-4 text-center space-x-2 space-x-reverse">
                                                <button onClick={() => handlePrint(visit)} title="طباعة الروشتة" className="px-3 py-1.5 rounded-lg bg-[#0284C7] text-white hover:bg-sky-700 font-bold text-xs transition-colors shadow-md">
                                                    <i className="fas fa-print ml-1"></i> طباعة الروشتة
                                                </button>
                                                <button onClick={() => handleDelete(visit.id)} title="حذف" className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors"><i className="fas fa-trash-alt"></i></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between rounded-xl md:rounded-none mt-3 md:mt-0 shadow-sm md:shadow-none">
                                <button onClick={prevPage} disabled={currentPage === 1} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                                    <i className="fas fa-chevron-right md:ml-1"></i> <span className="hidden md:inline">السابق</span>
                                </button>
                                <span className="text-sm font-bold text-slate-500">
                                    صفحة <span className="text-[#0284C7] text-lg mx-1">{currentPage}</span> من {totalPages}
                                </span>
                                <button onClick={nextPage} disabled={currentPage === totalPages} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                                    <span className="hidden md:inline">التالي</span> <i className="fas fa-chevron-left md:mr-1"></i>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ====== إعلان النسخة المدفوعة ====== */}
                <div className="mt-8 bg-gradient-to-r from-[#0f766e] to-[#0284c7] rounded-3xl p-5 md:p-6 text-white shadow-lg relative overflow-hidden text-right" dir="rtl">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mt-20 blur-2xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-teal-400/20 rounded-full blur-xl"></div>
                    
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5 md:gap-6">
                        <div className="flex flex-col md:flex-row items-center text-center md:text-right gap-4 w-full lg:w-auto">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner animate-pulse">
                                <i className="fas fa-stethoscope text-teal-200"></i>
                            </div>
                            <div>
                                <h4 className="font-black text-lg md:text-xl tracking-wide">ارتقِ بإدارة عيادتك للمستوى الاحترافي</h4>
                                <p className="text-teal-50 text-xs md:text-sm mt-1 font-medium opacity-90 leading-relaxed">
                                    أنت تستخدم النسخة المحدودة (Lite). تواصل معنا الآن لتفعيل إدارة ملفات المرضى الإلكترونية والروشتات الذكية.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            <a href="tel:01211934816" className="w-full sm:w-auto justify-center bg-amber-400 text-slate-900 px-5 py-3.5 md:py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-amber-300 transition-all active:scale-95 shadow-md">
                                <i className="fas fa-shopping-cart text-base"></i>
                                <span>طلب النسخة (المبيعات)</span>
                            </a>
                            <a href="https://wa.me/201211934816" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto justify-center bg-white/10 backdrop-blur-sm border border-white/25 px-5 py-3.5 md:py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/20 transition-all active:scale-95">
                                <i className="fab fa-whatsapp text-emerald-400 text-base"></i>
                                <span>الدعم الفني</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* ====== نافذة الكشف الطبي (المعقدة) Mobile First ====== */}
            {isVisitModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[900] flex items-end md:items-center justify-center p-0 md:p-4 print:hidden">
                    <div className="bg-white w-full md:max-w-5xl md:rounded-2xl rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl animate-view overflow-hidden pb-safe">
                        
                        {/* Header */}
                        <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-l from-[#0284C7] to-[#0EA5E9] text-white shrink-0">
                            <h3 className="text-lg md:text-xl font-black flex items-center gap-2"><i className="fas fa-user-md"></i> كشف طبي وروشتة</h3>
                            <button onClick={closeModals} className="bg-white/20 hover:bg-white text-white hover:text-[#0284C7] w-8 h-8 rounded-full md:rounded-lg flex items-center justify-center transition-colors shadow-sm"><i className="fas fa-times"></i></button>
                        </div>

                        {/* Body (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
                            <form id="visitForm" onSubmit={handleSaveVisit} className="space-y-4 md:space-y-6">
                                
                                {/* 1. بيانات المريض */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">ابحث واختر المريض <span className="text-rose-500">*</span></label>
                                            {patients.length === 0 ? (
                                                <div className="text-xs text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100 font-bold">يجب إضافة مريض أولاً من قسم "سجل المرضى"</div>
                                            ) : (
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="ابحث بالاسم أو رقم الهاتف..."
                                                        value={patientSearchTerm}
                                                        onChange={(e) => {
                                                            setPatientSearchTerm(e.target.value);
                                                            setIsPatientDropdownOpen(true);
                                                            if(e.target.value === '') setFormData({...formData, patient_id: ''});
                                                        }}
                                                        onFocus={() => setIsPatientDropdownOpen(true)}
                                                        onBlur={() => setTimeout(() => setIsPatientDropdownOpen(false), 200)}
                                                        className="w-full p-3.5 md:p-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none"
                                                    />
                                                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                                    
                                                    {isPatientDropdownOpen && patientSearchTerm && (
                                                        <ul className="absolute z-[1000] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                                            {filteredPatients.length > 0 ? (
                                                                filteredPatients.map(p => (
                                                                    <li
                                                                        key={p.id}
                                                                        onMouseDown={() => {
                                                                            setFormData({...formData, patient_id: p.id});
                                                                            setPatientSearchTerm(`${p.name} (${p.phone || '-'})`);
                                                                            setIsPatientDropdownOpen(false);
                                                                        }}
                                                                        className="p-4 md:p-3 hover:bg-sky-50 cursor-pointer border-b border-slate-50 text-sm font-bold text-slate-700 transition-colors"
                                                                    >
                                                                        {p.name} <span className="text-[10px] md:text-xs text-slate-400 block md:inline">({p.phone || 'لا يوجد رقم'})</span>
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li className="p-4 md:p-3 text-sm text-slate-400 text-center font-bold">لا يوجد مريض يطابق بحثك</li>
                                                            )}
                                                        </ul>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 md:gap-2">
                                            <div>
                                                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">التاريخ</label>
                                                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3.5 md:p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">نوع الكشف</label>
                                                <select value={formData.visit_type} onChange={e => setFormData({...formData, visit_type: e.target.value})} className="w-full p-3.5 md:p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none">
                                                    <option value="new">كشف جديد</option>
                                                    <option value="follow_up">متابعة / استشارة</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* إحصائية ذكية */}
                                    {patientStats && (
                                        <div className="mt-4 p-3 bg-sky-50 border border-sky-100 rounded-xl flex flex-wrap gap-2 md:gap-4 text-xs font-bold text-sky-800">
                                            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-sky-50"><i className="fas fa-birthday-cake text-sky-500"></i> العمر: {patientStats.age}</span>
                                            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-sky-50"><i className="fas fa-tint text-rose-500"></i> الفصيلة: {patientStats.blood_type}</span>
                                            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-sky-50"><i className="fas fa-history text-amber-500"></i> الزيارات: {patientStats.visitsCount}</span>
                                            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-sky-50 w-full sm:w-auto"><i className="fas fa-calendar-alt text-emerald-500"></i> آخر زيارة: {patientStats.lastVisit}</span>
                                        </div>
                                    )}
                                </div>

                                {/* 2. العلامات الحيوية (Vitals) */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <h4 className="text-xs md:text-sm font-black text-slate-700 mb-3 flex items-center gap-2"><i className="fas fa-heartbeat text-rose-500"></i> العلامات الحيوية (Vitals)</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-[10px] text-slate-400 font-bold mb-1">الضغط</label>
                                            <input type="text" placeholder="120/80" value={vitals.blood_pressure} onChange={e=>setVitals({...vitals, blood_pressure: e.target.value})} className="w-full p-3.5 md:p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none text-center dir-ltr" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-400 font-bold mb-1">الحرارة</label>
                                            <input type="text" placeholder="37.5" value={vitals.temperature} onChange={e=>setVitals({...vitals, temperature: e.target.value})} className="w-full p-3.5 md:p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none text-center dir-ltr" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-400 font-bold mb-1">النبض</label>
                                            <input type="text" placeholder="bpm" value={vitals.heart_rate} onChange={e=>setVitals({...vitals, heart_rate: e.target.value})} className="w-full p-3.5 md:p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none text-center dir-ltr" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-400 font-bold mb-1">الوزن</label>
                                            <input type="text" placeholder="kg" value={vitals.weight} onChange={e=>setVitals({...vitals, weight: e.target.value})} className="w-full p-3.5 md:p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none text-center dir-ltr" />
                                        </div>
                                    </div>
                                </div>

                                {/* 3. التشخيص والشكوى */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">الشكوى الرئيسية (C.C)</label>
                                        <textarea rows="2" value={formData.chief_complaint} onChange={e=>setFormData({...formData, chief_complaint: e.target.value})} className="w-full p-3 md:p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none resize-none"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">التشخيص (Diagnosis)</label>
                                        <textarea rows="2" value={formData.diagnosis} onChange={e=>setFormData({...formData, diagnosis: e.target.value})} className="w-full p-3 md:p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none resize-none"></textarea>
                                    </div>
                                </div>

                                {/* 4. بناء الروشتة الذكي (Responsive Builder) */}
                                <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm relative overflow-visible">
                                    <h4 className="text-xs md:text-sm font-black text-emerald-700 mb-3 flex items-center gap-2"><i className="fas fa-pills"></i> الروشتة الطبية (Rx)</h4>
                                    
                                    <div className="flex flex-col md:flex-row gap-3 bg-emerald-50/50 p-3 md:p-4 rounded-xl border border-emerald-100">
                                        
                                        {/* الصف الأول: البحث والإضافة السريعة */}
                                        <div className="w-full md:flex-1 relative">
                                            <label className="block text-[10px] md:text-xs font-bold text-emerald-700 mb-1">ابحث عن الدواء / الإجراء</label>
                                            <div className="flex gap-2 relative">
                                                <div className="relative w-full">
                                                    <input
                                                        type="text"
                                                        placeholder="اكتب اسم العلاج..."
                                                        value={catalogSearchTerm}
                                                        onChange={(e) => {
                                                            setCatalogSearchTerm(e.target.value);
                                                            setIsCatalogDropdownOpen(true);
                                                            if(e.target.value === '') setCurrentRxInput({...currentRxInput, catalog_id: ''});
                                                        }}
                                                        onFocus={() => setIsCatalogDropdownOpen(true)}
                                                        onBlur={() => setTimeout(() => setIsCatalogDropdownOpen(false), 200)}
                                                        className="w-full p-3.5 md:p-2 bg-white border border-emerald-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none"
                                                    />
                                                    {isCatalogDropdownOpen && catalogSearchTerm && (
                                                        <ul className="absolute z-[1000] w-full mt-1 bg-white border border-emerald-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                                            {filteredCatalog.length > 0 ? (
                                                                filteredCatalog.map(c => (
                                                                    <li
                                                                        key={c.id}
                                                                        onMouseDown={() => {
                                                                            setCurrentRxInput({...currentRxInput, catalog_id: c.id});
                                                                            setCatalogSearchTerm(c.name);
                                                                            setIsCatalogDropdownOpen(false);
                                                                        }}
                                                                        className="p-4 md:p-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 text-sm font-bold text-slate-700 transition-colors flex items-center gap-2"
                                                                    >
                                                                        <span className="text-lg">{c.type === 'drug' ? '💊' : '🔬'}</span> {c.name}
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li className="p-4 text-sm text-slate-400 text-center font-bold">غير موجود في الدليل</li>
                                                            )}
                                                        </ul>
                                                    )}
                                                </div>
                                                <button type="button" onClick={() => setIsQuickAddModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white w-12 md:w-10 rounded-xl font-bold flex items-center justify-center shrink-0 active:scale-95 shadow-sm" title="إضافة صنف للقاعدة">
                                                    <i className="fas fa-plus"></i>
                                                </button>
                                            </div>
                                        </div>

                                        {/* الصف الثاني: تفاصيل الجرعة والإدراج */}
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <div className="flex-1 md:w-24">
                                                <label className="block text-[10px] md:text-xs font-bold text-emerald-700 mb-1">الجرعة</label>
                                                <input type="text" placeholder="قرص" value={currentRxInput.dosage} onChange={e=>setCurrentRxInput({...currentRxInput, dosage: e.target.value})} className="w-full p-3.5 md:p-2 bg-white border border-emerald-200 rounded-xl text-sm font-bold outline-none" />
                                            </div>
                                            <div className="flex-1 md:w-28">
                                                <label className="block text-[10px] md:text-xs font-bold text-emerald-700 mb-1">التكرار</label>
                                                <input type="text" placeholder="كل 8 س" value={currentRxInput.frequency} onChange={e=>setCurrentRxInput({...currentRxInput, frequency: e.target.value})} className="w-full p-3.5 md:p-2 bg-white border border-emerald-200 rounded-xl text-sm font-bold outline-none" />
                                            </div>
                                            <div className="flex-1 md:w-24 hidden sm:block">
                                                <label className="block text-[10px] md:text-xs font-bold text-emerald-700 mb-1">المدة</label>
                                                <input type="text" placeholder="5 أيام" value={currentRxInput.duration} onChange={e=>setCurrentRxInput({...currentRxInput, duration: e.target.value})} className="w-full p-3.5 md:p-2 bg-white border border-emerald-200 rounded-xl text-sm font-bold outline-none" />
                                            </div>
                                        </div>
                                        
                                        <div className="w-full md:w-auto mt-2 md:mt-0 flex items-end">
                                            <button type="button" onClick={addRxItem} disabled={!currentRxInput.catalog_id} className="w-full md:w-auto bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-6 py-3.5 md:py-2 rounded-xl font-bold transition-colors border border-emerald-300 disabled:opacity-50 active:scale-95 shadow-sm">إدراج للروشتة</button>
                                        </div>
                                    </div>

                                    {/* قائمة الأدوية المدرجة */}
                                    {rxItems.length > 0 && (
                                        <ul className="mt-4 space-y-2">
                                            {rxItems.map((item, index) => (
                                                <li key={index} className="flex justify-between items-center bg-white border border-emerald-200 p-3 rounded-xl shadow-sm">
                                                    <div>
                                                        <span className="font-bold text-slate-700 dir-ltr text-right block text-sm md:text-base">{item.catalog_type === 'drug' ? '💊' : '🔬'} {item.catalog_name}</span>
                                                        <span className="text-[10px] md:text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded mt-1 inline-block border border-slate-100">{item.dosage} | {item.frequency} {item.duration && `| ${item.duration}`}</span>
                                                    </div>
                                                    <button type="button" onClick={() => removeRxItem(index)} className="text-rose-500 hover:text-rose-700 bg-rose-50 w-10 h-10 rounded-xl flex items-center justify-center active:scale-95"><i className="fas fa-trash"></i></button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                            </form>
                        </div>

                        {/* Footer - Save Button */}
                        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                            <button type="submit" disabled={!formData.patient_id} form="visitForm" className="w-full bg-[#0284C7] hover:bg-[#0EA5E9] text-white font-black py-4 rounded-xl shadow-lg shadow-sky-500/30 transition-all text-base md:text-lg disabled:opacity-50 active:scale-95">
                                <i className="fas fa-save mr-2"></i> حفظ الكشف وإنهاء الزيارة
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== نافذة الإضافة السريعة للدليل (Quick Add Catalog) ====== */}
            {isQuickAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-end md:items-center justify-center p-0 md:p-4 print:hidden">
                    <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-emerald-200 pb-safe">
                        <div className="p-4 md:p-5 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center rounded-t-3xl md:rounded-t-2xl">
                            <h4 className="font-black text-emerald-700 text-sm md:text-base"><i className="fas fa-plus-circle"></i> إضافة سريعة للدليل</h4>
                            <button onClick={() => setIsQuickAddModalOpen(false)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm"><i className="fas fa-times"></i></button>
                        </div>
                        <form onSubmit={handleQuickAddCatalog} className="p-5 md:p-6 space-y-4">
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">الاسم التجاري / اسم التحليل</label>
                                <input type="text" name="name" required className="w-full p-3.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none dir-ltr text-right" />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">النوع</label>
                                <select name="type" className="w-full p-3.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none">
                                    <option value="drug">دواء (Drug)</option>
                                    <option value="lab">تحليل معملي (Lab)</option>
                                    <option value="xray">أشعة (X-Ray)</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 md:py-3 rounded-xl mt-2 active:scale-95 shadow-lg shadow-emerald-500/30">حفظ وإدراج</button>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* تصميم الروشتة الاحترافي (يظهر فقط عند الطباعة) */}
            {/* ========================================== */}
            {printData && (
                <div className="hidden print:block w-full min-h-screen bg-white text-black p-8 font-sans">
                    <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
                        <div className="text-right">
                            <h1 className="text-2xl font-black">{printData.clinic.doctor_name}</h1>
                            <h2 className="text-sm font-bold mt-1 text-gray-700">{printData.clinic.clinic_name}</h2>
                        </div>
                        <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center text-2xl font-black">
                            Rx
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-8 bg-gray-100 p-3 rounded">
                        <div className="font-bold text-sm">اسم المريض: <span className="text-lg underline underline-offset-4 ml-2">{printData.patient?.name}</span></div>
                        <div className="font-bold text-sm">التاريخ: {printData.visit?.date}</div>
                    </div>

                    <div className="relative min-h-[400px]">
                        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-[20rem] font-serif">Rx</div>
                        
                        <div className="relative z-10 space-y-6">
                            {printData.medications && printData.medications.length > 0 ? (
                                printData.medications.map((med, index) => (
                                    <div key={index} className="flex flex-col mb-4">
                                        <div className="text-xl font-bold dir-ltr flex items-center gap-2">
                                            <span className="text-sm text-gray-400">-{index + 1}</span> {med.drug_name}
                                        </div>
                                        <div className="text-sm font-semibold text-gray-700 pr-6 mt-1 flex gap-4">
                                            <span>الجرعة: {med.dosage}</span>
                                            <span>التكرار: {med.frequency}</span>
                                            {med.duration && <span>المدة: {med.duration}</span>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-400 italic mt-20">لا يوجد أدوية مصروفة في هذا الكشف.</div>
                            )}
                        </div>
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 border-t-2 border-black pt-4 text-center pb-4 text-xs font-bold">
                        <p>العنوان: {printData.clinic.address || '_____________________'}</p>
                        <p className="mt-1">رقم الهاتف: {printData.clinic.phone || '_____________________'}</p>
                        <p className="mt-2 text-[10px] text-gray-500">تم إنشاء هذه الروشتة بواسطة نظام MentraClinics الإلكتروني</p>
                    </div>
                </div>
            )}

        </div>
    );
};