window.Module_Patients = function({ clinicId, userId, showToast }) {
    const { useState, useEffect } = React;

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // الفلاتر
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination (Limit 3)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // نافذة إضافة/تعديل مريض
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null, name: '', phone: '', national_id: '', 
        gender: 'male', birth_date: '', blood_type: '', address: ''
    });

    // نافذة الملف الطبي (التاريخ المرضي والروشتات)
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [patientHistory, setPatientHistory] = useState({ info: null, visits: [] });
    const [historyLoading, setHistoryLoading] = useState(false);

    // ==========================================
    // جلب بيانات المرضى (مع البحث)
    // ==========================================
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
    // منطق الـ Pagination
    // ==========================================
    const totalPages = Math.ceil(patients.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = patients.slice(indexOfFirstItem, indexOfLastItem);

    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    // ==========================================
    // حساب العمر
    // ==========================================
    const calculateAge = (birthDate) => {
        if (!birthDate) return 'غير محدد';
        const ageDifMs = Date.now() - new Date(birthDate).getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970) + ' سنة';
    };

    // ==========================================
    // إضافة / تعديل مريض
    // ==========================================
    const handleSavePatient = async (e) => {
        e.preventDefault();
        try {
            const patientData = {
                name: formData.name,
                phone: formData.phone,
                national_id: formData.national_id,
                gender: formData.gender,
                birth_date: formData.birth_date,
                blood_type: formData.blood_type,
                address: formData.address,
                user_id: userId,
                updated_at: new Date().toISOString(),
                is_active: 1
            };

            if (isEditing) {
                await window.db.patients.update(formData.id, patientData);
                showToast("تم تحديث بيانات المريض بنجاح", "success");
            } else {
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
        if(confirm("هل أنت متأكد من حذف هذا المريض نهائياً؟ سيتم حذف بياناته لكن ستبقى الفواتير المرتبطة به لأغراض حسابية.")) {
            try {
                await window.db.patients.delete(id);
                showToast("تم حذف المريض", "success");
                setRefreshTrigger(prev => prev + 1);
            } catch (error) {
                showToast("فشل عملية الحذف", "error");
            }
        }
    };

    // ==========================================
    // فتح الملف الطبي
    // ==========================================
    const openPatientHistory = async (patient) => {
        setIsHistoryModalOpen(true);
        setHistoryLoading(true);
        try {
            const allVisits = await window.db.visits.where('user_id').equals(userId).toArray();
            const patientVisits = allVisits.filter(v => v.patient_id === patient.id).sort((a, b) => new Date(b.date) - new Date(a.date));

            const allPrescriptions = await window.db.prescriptions.where('user_id').equals(userId).toArray();
            const allPrescriptionItems = await window.db.prescription_items.where('user_id').equals(userId).toArray();
            const medicalCatalog = await window.db.medical_catalog.where('user_id').equals(userId).toArray();

            const enrichedVisits = patientVisits.map(visit => {
                const prescription = allPrescriptions.find(p => p.visit_id === visit.id);
                let medications = [];

                if (prescription) {
                    const items = allPrescriptionItems.filter(item => item.prescription_id === prescription.id);
                    medications = items.map(item => {
                        const drugInfo = medicalCatalog.find(d => d.id === item.catalog_id);
                        return { ...item, drug_name: drugInfo ? drugInfo.name : 'دواء غير مسجل (نص حر)' };
                    });
                }
                return { ...visit, prescription_notes: prescription?.notes, medications };
            });

            setPatientHistory({ info: patient, visits: enrichedVisits });
        } catch (error) {
            console.error(error);
            showToast("فشل جلب الملف الطبي للمريض", "error");
        } finally {
            setHistoryLoading(false);
        }
    };

    // ==========================================
    // واجهة المستخدم (UI) - Mobile Optimized
    // ==========================================
    return (
        <div className="space-y-4 md:space-y-6 animate-view pb-24 md:pb-10 max-w-6xl mx-auto">
            
            {/* الهيدر وزر الإضافة */}
            <div className="flex flex-col gap-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm md:flex-row md:justify-between md:items-center">
                <div className="text-center md:text-right">
                    <h2 className="text-xl md:text-2xl font-black text-[#0284C7] flex items-center justify-center md:justify-start gap-2">
                        <i className="fas fa-users"></i> سجل المرضى
                    </h2>
                    <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">إدارة الملفات الطبية، والبحث السريع</p>
                </div>
                <button onClick={openAddModal} className="w-full md:w-auto bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-6 py-3.5 md:py-3 rounded-xl font-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 active:scale-95 text-sm md:text-base">
                    <i className="fas fa-user-plus"></i> إضافة مريض جديد
                </button>
            </div>

            {/* شريط البحث */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative z-10">
                <div className="relative">
                    <input type="text" placeholder="ابحث باسم المريض أو رقم الهاتف..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3.5 md:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none transition-colors" />
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
                </div>
            </div>

            {/* قائمة المرضى */}
            {loading ? (
                <div className="flex justify-center p-10"><i className="fas fa-spinner fa-spin text-3xl text-[#0EA5E9]"></i></div>
            ) : patients.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <i className="fas fa-folder-open text-5xl text-slate-300 mb-4"></i>
                    <h3 className="text-lg font-bold text-slate-600">لا يوجد مرضى</h3>
                    <p className="text-sm text-slate-400 mt-1">لم يتم العثور على أي مرضى مسجلين</p>
                </div>
            ) : (
                <div className="bg-transparent md:bg-white md:rounded-2xl md:border border-slate-100 md:shadow-sm overflow-hidden flex flex-col">
                    
                    {/* تصميم الموبايل (Cards) */}
                    <div className="md:hidden space-y-3">
                        {currentItems.map((patient) => (
                            <div key={patient.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md shrink-0 ${patient.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                            <i className={`fas ${patient.gender === 'male' ? 'fa-male' : 'fa-female'} text-2xl`}></i>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-[#0284C7] text-base leading-tight">{patient.name}</h3>
                                            <p className="font-bold text-slate-600 text-xs mt-1 dir-ltr text-right">{patient.phone || 'بدون هاتف'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs font-bold text-slate-600">
                                    <div className="flex items-center gap-1"><i className="fas fa-birthday-cake text-sky-400"></i> {calculateAge(patient.birth_date)}</div>
                                    <div className="flex items-center gap-1"><i className="fas fa-tint text-rose-400"></i> الفصيلة: {patient.blood_type || '-'}</div>
                                    <div className="col-span-2 text-[10px] text-slate-400 mt-1">تاريخ التسجيل: {patient.created_at.split('T')[0]}</div>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => openPatientHistory(patient)} className="flex-1 bg-[#0284C7] text-white py-2.5 rounded-lg font-bold text-xs shadow-md active:scale-95 flex items-center justify-center gap-1">
                                        <i className="fas fa-file-medical-alt"></i> الملف الطبي
                                    </button>
                                    <button onClick={() => openEditModal(patient)} className="w-10 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg flex items-center justify-center active:scale-95">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button onClick={() => handleDelete(patient.id)} className="w-10 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg flex items-center justify-center active:scale-95">
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
                                    <th className="px-6 py-4">اسم المريض</th>
                                    <th className="px-6 py-4">رقم الهاتف</th>
                                    <th className="px-6 py-4">العمر / النوع</th>
                                    <th className="px-6 py-4 text-center">فصيلة الدم</th>
                                    <th className="px-6 py-4 text-center">الإجراءات والملف الطبي</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {currentItems.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-sky-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${patient.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                                    <i className={`fas ${patient.gender === 'male' ? 'fa-male' : 'fa-female'} text-lg`}></i>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#0284C7] text-base">{patient.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold">مضاف في: {patient.created_at.split('T')[0]}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-600 dir-ltr text-right">{patient.phone || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="block font-bold text-slate-700">{calculateAge(patient.birth_date)}</span>
                                            <span className="text-xs text-slate-400">{patient.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {patient.blood_type ? (
                                                <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-lg font-black text-xs border border-rose-200">{patient.blood_type}</span>
                                            ) : <span className="text-slate-300">-</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center space-x-2 space-x-reverse">
                                            <button onClick={() => openPatientHistory(patient)} title="الملف الطبي والروشتات" className="px-3 py-1.5 rounded-lg bg-[#0284C7] text-white hover:bg-sky-700 font-bold text-xs transition-colors shadow-md">
                                                <i className="fas fa-file-medical-alt ml-1"></i> الملف الطبي
                                            </button>
                                            <button onClick={() => openEditModal(patient)} title="تعديل بيانات المريض" className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-colors"><i className="fas fa-edit"></i></button>
                                            <button onClick={() => handleDelete(patient.id)} title="حذف" className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors"><i className="fas fa-trash-alt"></i></button>
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
                            <span className="text-sm font-bold text-slate-500">صفحة <span className="text-[#0284C7] text-lg mx-1">{currentPage}</span> من {totalPages}</span>
                            <button onClick={nextPage} disabled={currentPage === totalPages} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                                <span className="hidden md:inline">التالي</span> <i className="fas fa-chevron-left md:mr-1"></i>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================== */}
            {/* نافذة الملف الطبي (Patient History) */}
            {/* ========================================== */}
            {isHistoryModalOpen && patientHistory.info && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-0 md:p-6">
                    <div className="bg-white w-full md:rounded-3xl rounded-t-3xl md:max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-view overflow-hidden pb-safe">
                        
                        {/* Header Profile */}
                        <div className="bg-gradient-to-l from-[#0284C7] to-[#0EA5E9] p-5 md:p-6 text-white flex justify-between items-start shrink-0 relative overflow-hidden">
                            <div className="absolute right-0 top-0 opacity-10 text-8xl md:text-9xl -mt-5 -mr-10"><i className="fas fa-heartbeat"></i></div>
                            <div className="relative z-10 flex gap-3 md:gap-4 items-center">
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl md:text-3xl border border-white/30 backdrop-blur-md shrink-0">
                                    <i className={`fas ${patientHistory.info.gender === 'male' ? 'fa-male' : 'fa-female'}`}></i>
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black truncate max-w-[200px] md:max-w-full">{patientHistory.info.name}</h2>
                                    <p className="text-sky-100 text-xs md:text-sm mt-1 font-bold flex flex-wrap gap-2">
                                        <span><i className="fas fa-calendar-alt"></i> {calculateAge(patientHistory.info.birth_date)}</span>
                                        <span><i className="fas fa-phone-alt"></i> {patientHistory.info.phone || '-'}</span>
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="relative z-10 bg-white/20 hover:bg-white text-white hover:text-sky-700 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors shrink-0"><i className="fas fa-times"></i></button>
                        </div>

                        {/* Body - Timeline */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
                            <h3 className="font-black text-slate-700 mb-6 flex items-center gap-2 text-sm md:text-base"><i className="fas fa-history text-[#0EA5E9]"></i> السجل الطبي والزيارات السابقة</h3>
                            
                            {historyLoading ? (
                                <div className="text-center py-10"><i className="fas fa-spinner fa-spin text-3xl text-[#0EA5E9]"></i></div>
                            ) : patientHistory.visits.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 border-dashed">
                                    <i className="fas fa-file-medical text-4xl text-slate-300 mb-3"></i>
                                    <p className="text-slate-500 font-bold text-sm">لا يوجد سجل طبي أو كشوفات لهذا المريض.</p>
                                </div>
                            ) : (
                                <div className="space-y-6 relative before:absolute before:inset-0 before:mr-5 md:before:ml-5 md:before:mr-auto before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-sky-300 before:to-slate-200">
                                    {patientHistory.visits.map((visit, index) => (
                                        <div key={visit.id} className="relative flex items-start md:items-center justify-between md:justify-normal md:odd:flex-row-reverse group gap-3 md:gap-0">
                                            {/* Icon */}
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 bg-sky-100 text-[#0284C7] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 mt-1 md:mt-0">
                                                <i className="fas fa-stethoscope text-sm"></i>
                                            </div>
                                            
                                            {/* Card */}
                                            <div className="w-full md:w-[calc(50%-2.5rem)] bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="bg-sky-50 text-sky-600 text-[10px] font-black px-2 py-1 rounded-lg border border-sky-100"><i className="fas fa-calendar-day ml-1"></i> {visit.date}</span>
                                                    <span className="text-[10px] font-bold text-slate-400">{visit.visit_type === 'new' ? 'كشف جديد' : 'متابعة'}</span>
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <h4 className="text-xs md:text-sm font-black text-slate-700">التشخيص (Diagnosis):</h4>
                                                    <p className="text-xs md:text-sm text-slate-600 font-semibold mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">{visit.diagnosis || 'لم يتم تسجيل تشخيص'}</p>
                                                </div>

                                                {/* Medications Section */}
                                                {visit.medications && visit.medications.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-slate-100 border-dashed">
                                                        <h4 className="text-[11px] md:text-xs font-black text-emerald-600 mb-2 flex items-center gap-1"><i className="fas fa-pills"></i> الروشتة المصروفة:</h4>
                                                        <ul className="space-y-2">
                                                            {visit.medications.map((med, i) => (
                                                                <li key={i} className="bg-emerald-50/50 p-2 md:p-2.5 rounded-lg border border-emerald-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 md:gap-0">
                                                                    <span className="font-bold text-xs md:text-sm text-slate-700 dir-ltr text-right">{med.drug_name}</span>
                                                                    <span className="text-[9px] md:text-[10px] font-bold bg-white text-emerald-600 px-2 py-1 rounded shadow-sm self-start sm:self-auto border border-emerald-100">{med.dosage} | {med.frequency}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* نافذة إضافة / تعديل مريض (Form Modal) */}
            {/* ========================================== */}
            {isFormModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-0 md:p-4">
                    <div className="bg-white w-full md:max-w-2xl rounded-t-3xl md:rounded-2xl shadow-2xl animate-view overflow-hidden pb-safe max-h-[90vh] flex flex-col">
                        <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-sky-50 shrink-0">
                            <h3 className="text-base md:text-lg font-black text-[#0284C7]">{isEditing ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}</h3>
                            <button onClick={() => setIsFormModalOpen(false)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><i className="fas fa-times"></i></button>
                        </div>
                        <form onSubmit={handleSavePatient} className="p-5 md:p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">الاسم الرباعي <span className="text-rose-500">*</span></label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">رقم الهاتف (واتساب)</label>
                                    <input type="tel" dir="ltr" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none text-right" />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">تاريخ الميلاد</label>
                                    <input type="date" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">النوع</label>
                                        <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none">
                                            <option value="male">ذكر</option>
                                            <option value="female">أنثى</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">فصيلة الدم</label>
                                        <select value={formData.blood_type} onChange={e => setFormData({...formData, blood_type: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none dir-ltr text-right">
                                            <option value="">غير معروف</option>
                                            <option value="A+">A+</option><option value="A-">A-</option>
                                            <option value="B+">B+</option><option value="B-">B-</option>
                                            <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                            <option value="O+">O+</option><option value="O-">O-</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">محل الإقامة / العنوان (اختياري)</label>
                                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-3 mt-6">
                                <button type="submit" className="w-full md:flex-1 bg-[#0284C7] hover:bg-sky-700 text-white font-black py-3.5 rounded-xl transition-colors shadow-lg shadow-sky-500/30 active:scale-95 text-base">
                                    {isEditing ? 'حفظ التعديلات' : 'إضافة المريض'}
                                </button>
                                <button type="button" onClick={() => setIsFormModalOpen(false)} className="w-full md:flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-3.5 rounded-xl transition-colors active:scale-95 text-base">
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ====== إعلان النسخة المدفوعة ====== */}
            <div className="mt-6 md:mt-8 bg-gradient-to-r from-[#0f766e] to-[#0284c7] rounded-3xl p-5 md:p-6 text-white shadow-lg relative overflow-hidden text-right" dir="rtl">
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
    );
};