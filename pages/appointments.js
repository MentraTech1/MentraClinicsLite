window.Module_Appointments = function({ clinicId, userId, showToast }) {
    const { useState, useEffect } = React;

    // تواريخ افتراضية (من بداية الشهر الحالي إلى اليوم)
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // حالات النظام
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // الفلاتر والإحصائيات
    const [filters, setFilters] = useState({
        search: '',
        status: 'all', 
        dateFrom: firstDayOfMonth,
        dateTo: today
    });

    const [stats, setStats] = useState({
        totalAppts: 0,
        completedAppts: 0,
        totalRevenue: 0 
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // ==========================================
    // حالات نافذة الإضافة المودال (مع البحث الحي)
    // ==========================================
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // حالة مخصصة للبحث الحي عن المرضى
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [formData, setFormData] = useState({
        patient_id: '',
        date: today,
        time: '10:00',
        type: 'new', 
        notes: ''
    });

    // فلترة المرضى أثناء الكتابة (أول 10 نتائج فقط للحفاظ على الأداء)
    const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) || 
        (p.phone && p.phone.includes(patientSearchTerm))
    ).slice(0, 10);

    // ==========================================
    // جلب البيانات والإحصائيات
    // ==========================================
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (!window.db) return;

                const allPatients = await window.db.patients.where('user_id').equals(userId).toArray();
                setPatients(allPatients);

                let allAppts = await window.db.appointments.where('user_id').equals(userId).toArray();
                allAppts = allAppts.filter(appt => appt.date >= filters.dateFrom && appt.date <= filters.dateTo);

                if (filters.status !== 'all') {
                    allAppts = allAppts.filter(appt => appt.status === filters.status);
                }

                let apptsWithNames = allAppts.map(appt => {
                    const patient = allPatients.find(p => p.id === Number(appt.patient_id));
                    return { ...appt, patient_name: patient ? patient.name : 'مريض غير معروف', phone: patient ? patient.phone : '' };
                });

                if (filters.search.trim() !== '') {
                    apptsWithNames = apptsWithNames.filter(appt => 
                        appt.patient_name.includes(filters.search) || appt.phone.includes(filters.search)
                    );
                }

                apptsWithNames.sort((a, b) => new Date(b.date) - new Date(a.date));
                setAppointments(apptsWithNames);

                const invoices = await window.db.invoices.where('user_id').equals(userId).toArray();
                const periodInvoices = invoices.filter(inv => inv.date >= filters.dateFrom && inv.date <= filters.dateTo);
                const calculatedRevenue = periodInvoices.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);

                setStats({
                    totalAppts: apptsWithNames.length,
                    completedAppts: apptsWithNames.filter(a => a.status === 'completed').length,
                    totalRevenue: calculatedRevenue
                });

                setCurrentPage(1);

            } catch (error) {
                console.error("خطأ في جلب المواعيد:", error);
                showToast("حدث خطأ أثناء تحميل البيانات", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, filters, refreshTrigger]);

    // ==========================================
    // منطق الـ Pagination
    // ==========================================
    const totalPages = Math.ceil(appointments.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = appointments.slice(indexOfFirstItem, indexOfLastItem);

    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    // ==========================================
    // العمليات: إضافة وتحديث وحذف
    // ==========================================
    const handleAddAppointment = async (e) => {
        e.preventDefault();
        if (!formData.patient_id) return showToast("الرجاء اختيار مريض صحيح من القائمة", "error");

        try {
            await window.db.appointments.add({
                patient_id: Number(formData.patient_id),
                doctor_id: userId,
                user_id: userId,
                date: formData.date,
                time: formData.time,
                status: 'pending',
                type: formData.type,
                notes: formData.notes,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            if(window.ClinicQueries) await window.ClinicQueries.logAction(userId, 'CREATE_APPT', 'appointments', 0);

            showToast("تم حجز الموعد بنجاح", "success");
            setIsModalOpen(false);
            setFormData({ ...formData, notes: '', patient_id: '' });
            setPatientSearchTerm(''); 
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error(error);
            showToast("فشل حجز الموعد", "error");
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await window.db.appointments.update(id, { 
                status: newStatus,
                updated_at: new Date().toISOString()
            });
            showToast("تم تحديث حالة الموعد", "success");
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            showToast("حدث خطأ أثناء التحديث", "error");
        }
    };

    const handleDelete = async (id) => {
        if(confirm("هل أنت متأكد من إلغاء وحذف هذا الموعد نهائياً؟")) {
            try {
                await window.db.appointments.delete(id);
                showToast("تم حذف الموعد", "success");
                setRefreshTrigger(prev => prev + 1);
            } catch (error) {
                showToast("فشل الحذف", "error");
            }
        }
    };

    const openAddModal = () => {
        setIsModalOpen(true);
        setPatientSearchTerm('');
        setFormData({ ...formData, patient_id: '', notes: '' });
    };

    // ==========================================
    // واجهة المستخدم (UI) - Mobile Optimized
    // ==========================================
    return (
        <div className="space-y-4 md:space-y-6 animate-view pb-24 md:pb-10">
            
            {/* الهيدر وزر الإضافة */}
            <div className="flex flex-col gap-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm md:flex-row md:justify-between md:items-center">
                <div className="text-center md:text-right">
                    <h2 className="text-xl md:text-2xl font-black text-[#0284C7] flex items-center justify-center md:justify-start gap-2">
                        <i className="fas fa-calendar-check"></i> إدارة الحجوزات
                    </h2>
                    <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">متابعة مواعيد المرضى وإحصائيات العيادة</p>
                </div>
                <button onClick={openAddModal} className="w-full md:w-auto bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-6 py-3.5 md:py-3 rounded-xl font-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 active:scale-95">
                    <i className="fas fa-plus"></i> حجز موعد جديد
                </button>
            </div>

            {/* إحصائيات الأرباح الذكية (Mobile Grid) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div className="bg-white p-3 md:p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center text-center md:text-right gap-2 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center text-lg md:text-xl"><i className="fas fa-list-ul"></i></div>
                    <div>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400">إجمالي المواعيد</p>
                        <h4 className="text-lg md:text-xl font-black text-slate-700">{stats.totalAppts}</h4>
                    </div>
                </div>
                <div className="bg-white p-3 md:p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center text-center md:text-right gap-2 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-lg md:text-xl"><i className="fas fa-check-double"></i></div>
                    <div>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400">المكتملة</p>
                        <h4 className="text-lg md:text-xl font-black text-slate-700">{stats.completedAppts}</h4>
                    </div>
                </div>
                <div className="col-span-2 md:col-span-1 bg-gradient-to-l from-emerald-500 to-teal-400 p-4 md:p-5 rounded-xl shadow-lg flex items-center justify-center md:justify-start gap-4 text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl border border-white/30 hidden md:flex"><i className="fas fa-hand-holding-usd"></i></div>
                    <div className="text-center md:text-right">
                        <p className="text-[10px] md:text-xs font-bold text-emerald-50 mb-1">أرباح الكشوفات (بالنطاق)</p>
                        <h4 className="text-2xl font-black">{stats.totalRevenue} <span className="text-sm font-bold">ج.م</span></h4>
                    </div>
                </div>
            </div>

            {/* شريط الفلاتر (مُحسّن للموبايل) */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3 relative z-10">
                <div className="relative w-full">
                    <input type="text" placeholder="بحث باسم المريض أو الهاتف..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none transition-colors" />
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full">
                    <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="w-full md:w-1/3 bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl focus:ring-[#0EA5E9] focus:border-[#0EA5E9] block p-3 font-bold outline-none cursor-pointer">
                        <option value="all">جميع الحالات</option>
                        <option value="pending">قيد الانتظار</option>
                        <option value="completed">تم الكشف</option>
                        <option value="cancelled">ملغي</option>
                    </select>
                    <div className="flex gap-2 w-full md:w-2/3">
                        <div className="w-1/2 relative">
                            <span className="absolute -top-2 right-2 bg-white px-1 text-[10px] font-bold text-slate-400">من</span>
                            <input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-600 outline-none" />
                        </div>
                        <div className="w-1/2 relative">
                            <span className="absolute -top-2 right-2 bg-white px-1 text-[10px] font-bold text-slate-400">إلى</span>
                            <input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-600 outline-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* قائمة المواعيد (تصميم الكروت للموبايل / جدول للكمبيوتر) */}
            {loading ? (
                <div className="flex justify-center p-10"><i className="fas fa-spinner fa-spin text-3xl text-[#0EA5E9]"></i></div>
            ) : appointments.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <i className="fas fa-calendar-times text-5xl text-slate-300 mb-4"></i>
                    <h3 className="text-lg font-bold text-slate-600">لا توجد مواعيد</h3>
                    <p className="text-sm text-slate-400 mt-1">جرب تغيير التواريخ أو الفلاتر</p>
                </div>
            ) : (
                <div className="bg-transparent md:bg-white md:rounded-2xl md:border border-slate-100 md:shadow-sm overflow-hidden">
                    
                    {/* تصميم الجوال (Cards) */}
                    <div className="md:hidden space-y-3">
                        {currentItems.map((appt) => (
                            <div key={appt.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                                    <div>
                                        <h3 className="font-black text-[#0284C7] text-base">{appt.patient_name}</h3>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${appt.type === 'new' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {appt.type === 'new' ? 'كشف جديد' : 'استشارة / متابعة'}
                                        </span>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-700 text-sm">{appt.date}</div>
                                        <div className="text-xs text-sky-600 font-black flex items-center justify-end gap-1 mt-1"><i className="far fa-clock"></i> {appt.time || 'غير محدد'}</div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center pt-1">
                                    <div>
                                        {appt.status === 'pending' && <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold"><i className="fas fa-hourglass-half mr-1"></i> انتظار</span>}
                                        {appt.status === 'completed' && <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold"><i className="fas fa-check mr-1"></i> تم الكشف</span>}
                                        {appt.status === 'cancelled' && <span className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold"><i className="fas fa-times mr-1"></i> ملغي</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        {appt.status === 'pending' && (
                                            <button onClick={() => handleUpdateStatus(appt.id, 'completed')} className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center active:scale-95"><i className="fas fa-check"></i></button>
                                        )}
                                        <button onClick={() => handleDelete(appt.id)} className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center active:scale-95"><i className="fas fa-trash-alt"></i></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* تصميم الكمبيوتر (Table) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">تاريخ ووقت الحجز</th>
                                    <th className="px-6 py-4">اسم المريض</th>
                                    <th className="px-6 py-4">نوع الكشف</th>
                                    <th className="px-6 py-4">الحالة</th>
                                    <th className="px-6 py-4 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {currentItems.map((appt) => (
                                    <tr key={appt.id} className="hover:bg-sky-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700">{appt.date}</div>
                                            <div className="text-xs text-sky-600 font-black flex items-center gap-1 mt-1"><i className="far fa-clock"></i> {appt.time || 'غير محدد'}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-[#0284C7]">{appt.patient_name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${appt.type === 'new' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {appt.type === 'new' ? 'كشف جديد' : 'استشارة / متابعة'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {appt.status === 'pending' && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold"><i className="fas fa-hourglass-half mr-1"></i> انتظار</span>}
                                            {appt.status === 'completed' && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold"><i className="fas fa-check mr-1"></i> تم الكشف</span>}
                                            {appt.status === 'cancelled' && <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold"><i className="fas fa-times mr-1"></i> ملغي</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center space-x-2 space-x-reverse">
                                            {appt.status === 'pending' && (
                                                <button onClick={() => handleUpdateStatus(appt.id, 'completed')} title="تحديد كمكتمل" className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"><i className="fas fa-check"></i></button>
                                            )}
                                            <button onClick={() => handleDelete(appt.id)} title="حذف" className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors"><i className="fas fa-trash-alt"></i></button>
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

            {/* نافذة حجز موعد جديد (Modal) مُحسّنة للموبايل */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-0 md:p-4">
                    <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl animate-view overflow-visible pb-safe">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-sky-50 rounded-t-3xl md:rounded-t-2xl">
                            <h3 className="text-lg font-black text-[#0284C7]">حجز موعد جديد</h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><i className="fas fa-times"></i></button>
                        </div>
                        <form onSubmit={handleAddAppointment} className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
                            
                            {/* حقل البحث الحي */}
                            <div className="relative">
                                <label className="block text-sm font-bold text-slate-700 mb-2">ابحث واختر المريض <span className="text-rose-500">*</span></label>
                                {patients.length === 0 ? (
                                    <div className="text-xs text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100 font-bold">يجب إضافة مريض أولاً من قسم "سجل المرضى"</div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="اكتب الاسم أو الهاتف..."
                                            value={patientSearchTerm}
                                            onChange={(e) => {
                                                setPatientSearchTerm(e.target.value);
                                                setIsDropdownOpen(true);
                                                if(e.target.value === '') setFormData({...formData, patient_id: ''});
                                            }}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                            className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none"
                                        />
                                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                        
                                        {/* القائمة المنسدلة */}
                                        {isDropdownOpen && patientSearchTerm && (
                                            <ul className="absolute z-[1000] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                                {filteredPatients.length > 0 ? (
                                                    filteredPatients.map(p => (
                                                        <li
                                                            key={p.id}
                                                            onMouseDown={() => {
                                                                setFormData({...formData, patient_id: p.id});
                                                                setPatientSearchTerm(`${p.name} (${p.phone || '-'})`);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className="p-4 hover:bg-sky-50 cursor-pointer border-b border-slate-50 text-sm font-bold text-slate-700 transition-colors"
                                                        >
                                                            {p.name} <span className="text-xs text-slate-400 block mt-1">رقم: {p.phone || 'لا يوجد'}</span>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="p-4 text-sm text-slate-400 text-center font-bold">لا يوجد مريض يطابق بحثك</li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">التاريخ <span className="text-rose-500">*</span></label>
                                    <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">الوقت المتوقع <span className="text-rose-500">*</span></label>
                                    <input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">نوع الكشف</label>
                                <div className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                    <label className="flex items-center gap-3 cursor-pointer font-bold text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-100 flex-1">
                                        <input type="radio" name="type" value="new" checked={formData.type === 'new'} onChange={e => setFormData({...formData, type: e.target.value})} className="accent-[#0EA5E9] w-4 h-4" /> كشف جديد
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer font-bold text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-100 flex-1">
                                        <input type="radio" name="type" value="follow_up" checked={formData.type === 'follow_up'} onChange={e => setFormData({...formData, type: e.target.value})} className="accent-[#0EA5E9] w-4 h-4" /> استشارة / متابعة
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">ملاحظات (اختياري)</label>
                                <textarea rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none resize-none" placeholder="اكتب أي ملاحظات هنا..."></textarea>
                            </div>

                            <button type="submit" disabled={!formData.patient_id} className="w-full bg-[#0284C7] hover:bg-sky-700 text-white font-black py-4 rounded-xl transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/30 text-lg active:scale-95">
                                حفظ الحجز
                            </button>
                        </form>
                    </div>
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
                        <a href="tel:01211934816" className="w-full sm:w-auto justify-center bg-amber-400 text-slate-900 px-5 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-amber-300 transition-all active:scale-95 shadow-md">
                            <i className="fas fa-shopping-cart text-base"></i>
                            <span>طلب النسخة (المبيعات)</span>
                        </a>
                        <a href="https://wa.me/201211934816" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto justify-center bg-white/10 backdrop-blur-sm border border-white/25 px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/20 transition-all active:scale-95">
                            <i className="fab fa-whatsapp text-emerald-400 text-base"></i>
                            <span>الدعم الفني</span>
                        </a>
                    </div>
                </div>
            </div>

        </div>
    );
};