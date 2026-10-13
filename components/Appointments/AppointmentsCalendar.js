window.AppointmentsCalendar = function({ allAppointments, handleUpdateStatus, handleDelete }) {
    const { useState, useMemo, useEffect } = React;
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [viewingDay, setViewingDay] = useState(null);

    // حالة الترقيم (Pagination - ليميت 3)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // حالة نافذة التعديل
    const [editingAppt, setEditingAppt] = useState(null);
    const [editFormData, setEditFormData] = useState({
        date: '', time: '', type: 'new', status: 'pending', notes: ''
    });

    // إعادة ضبط الصفحة إلى 1 عند تغيير اليوم
    useEffect(() => {
        setCurrentPage(1);
    }, [viewingDay]);

    // دوال التقويم
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const dayNames = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
    const fullDayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

    // مصفوفة أيام الشهر
    const days = useMemo(() => {
        const arr = [];
        for (let i = 0; i < firstDayIndex; i++) arr.push(null);
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            arr.push({ day: i, dateStr: dateStr });
        }
        return arr;
    }, [currentMonth, firstDayIndex, daysInMonth]);

    // حساب عدد المواعيد لكل يوم
    const appointmentsCountByDate = useMemo(() => {
        const map = {};
        allAppointments.forEach(app => {
            if (app.date && app.status !== 'cancelled') {
                map[app.date] = (map[app.date] || 0) + 1;
            }
        });
        return map;
    }, [allAppointments]);

    const getArabicDayName = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return fullDayNames[d.getDay()] || '';
    };

    // فتح نافذة التعديل
    const handleOpenEdit = (appt) => {
        setEditingAppt(appt);
        setEditFormData({
            date: appt.date || '',
            time: appt.time || '',
            type: appt.type || 'new',
            status: appt.status || 'pending',
            notes: appt.notes || ''
        });
    };

    // حفظ التعديل في قاعدة البيانات وتحديث الشاشة فورياً
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editingAppt) return;
        try {
            await window.db.appointments.update(editingAppt.id, {
                date: editFormData.date,
                time: editFormData.time,
                type: editFormData.type,
                status: editFormData.status,
                notes: editFormData.notes,
                updated_at: new Date().toISOString()
            });

            // تحديث العرض في الحاوية الأم
            if (handleUpdateStatus) {
                await handleUpdateStatus(editingAppt.id, editFormData.status);
            }
            setEditingAppt(null);
        } catch (err) {
            console.error("خطأ أثناء تعديل الموعد:", err);
        }
    };

    // =========================================================
    // 1. العرض المستقل: جدول مواعيد اليوم بنظام Limit 3
    // =========================================================
    if (viewingDay) {
        const dayAppointments = allAppointments
            .filter(app => app.date === viewingDay)
            .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

        const dayStats = {
            total: dayAppointments.length,
            completed: dayAppointments.filter(a => a.status === 'completed').length,
            pending: dayAppointments.filter(a => a.status === 'pending' || a.status === 'waiting').length
        };

        // Pagination
        const totalPages = Math.ceil(dayAppointments.length / itemsPerPage) || 1;
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = dayAppointments.slice(indexOfFirstItem, indexOfLastItem);

        const nextPage = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1); };
        const prevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1); };

        return (
            <div className="space-y-6 animate-view">
                {/* هيدر صفحة اليوم */}
                <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-sky-50 text-[#0284C7] px-3 py-1 rounded-lg text-xs font-black">
                                {getArabicDayName(viewingDay)}
                            </span>
                            <span className="text-xs font-bold text-slate-400 dir-ltr inline-block">
                                {viewingDay}
                            </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800">
                            جدول زيارات ومواعيد اليوم
                        </h2>
                    </div>

                    <button 
                        onClick={() => setViewingDay(null)}
                        className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <i className="fas fa-arrow-right"></i> العودة للتقويم الشهري
                    </button>
                </div>

                {/* إحصائيات سريعة */}
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                        <span className="text-[10px] md:text-xs font-bold text-slate-400 block mb-1">إجمالي الحجوزات</span>
                        <span className="text-xl md:text-2xl font-black text-slate-800">{dayStats.total}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                        <span className="text-[10px] md:text-xs font-bold text-amber-500 block mb-1">في الانتظار</span>
                        <span className="text-xl md:text-2xl font-black text-amber-600">{dayStats.pending}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                        <span className="text-[10px] md:text-xs font-bold text-emerald-500 block mb-1">تم الكشف</span>
                        <span className="text-xl md:text-2xl font-black text-emerald-600">{dayStats.completed}</span>
                    </div>
                </div>

                {/* نظام الجدول للزيارات */}
                {dayAppointments.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-300 text-2xl">
                            <i className="fas fa-calendar-day"></i>
                        </div>
                        <h3 className="font-black text-slate-700 text-lg mb-1">لا توجد مواعيد في هذا اليوم</h3>
                        <p className="text-xs md:text-sm text-slate-400 font-bold mb-5">يمكنك حجز موعد جديد أو تصفح أيام أخرى</p>
                        <button 
                            onClick={() => setViewingDay(null)} 
                            className="bg-[#0284C7] text-white px-6 py-2.5 rounded-xl font-bold text-xs active:scale-95 transition-transform"
                        >
                            اختيار يوم آخر
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">الوقت</th>
                                        <th className="px-6 py-4">اسم المريض</th>
                                        <th className="px-6 py-4">الهاتف</th>
                                        <th className="px-6 py-4">نوع الكشف</th>
                                        <th className="px-6 py-4">ملاحظات</th>
                                        <th className="px-6 py-4 text-center">الحالة</th>
                                        <th className="px-6 py-4 text-center">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentItems.map((appt) => (
                                        <tr key={appt.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 font-black text-slate-800 dir-ltr text-right">
                                                <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700">
                                                    <i className="far fa-clock mr-1 text-[#0284C7]"></i>
                                                    {appt.time || 'غير محدد'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-black text-[#0284C7]">
                                                {appt.patient_name}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-500 dir-ltr text-right">
                                                {appt.phone || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                    appt.type === 'new' 
                                                        ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                                                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                }`}>
                                                    {appt.type === 'new' ? 'كشف جديد' : 'متابعة'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate" title={appt.notes}>
                                                {appt.notes || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-black inline-flex items-center gap-1 ${
                                                    appt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    appt.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {appt.status === 'completed' ? 'تم الكشف' : appt.status === 'cancelled' ? 'ملغي' : 'انتظار'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {(appt.status === 'pending' || appt.status === 'waiting') && (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(appt.id, 'completed')} 
                                                            title="تأكيد الكشف"
                                                            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center active:scale-95"
                                                        >
                                                            <i className="fas fa-check text-xs"></i>
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleOpenEdit(appt)} 
                                                        title="تعديل الموعد"
                                                        className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284C7] hover:bg-[#0284C7] hover:text-white transition-colors flex items-center justify-center active:scale-95"
                                                    >
                                                        <i className="fas fa-edit text-xs"></i>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(appt.id)} 
                                                        title="حذف الموعد"
                                                        className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center active:scale-95"
                                                    >
                                                        <i className="fas fa-trash-alt text-xs"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* شريط ترقيم الصفحات (Pagination) - Limit 3 */}
                        {totalPages > 1 && (
                            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                                <button 
                                    onClick={prevPage} 
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white transition-colors disabled:opacity-40 active:scale-95 flex items-center gap-1"
                                >
                                    <i className="fas fa-chevron-right"></i> السابق
                                </button>
                                <span className="text-xs font-bold text-slate-500">
                                    صفحة <span className="text-[#0284C7] font-black mx-1">{currentPage}</span> من {totalPages}
                                </span>
                                <button 
                                    onClick={nextPage} 
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white transition-colors disabled:opacity-40 active:scale-95 flex items-center gap-1"
                                >
                                    التالي <i className="fas fa-chevron-left"></i>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* نافذة تعديل الموعد (Modal) */}
                {editingAppt && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-view overflow-hidden">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-sky-50">
                                <h3 className="text-base font-black text-[#0284C7]">
                                    <i className="fas fa-edit ml-1"></i> تعديل موعد: {editingAppt.patient_name}
                                </h3>
                                <button 
                                    onClick={() => setEditingAppt(null)} 
                                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ</label>
                                        <input 
                                            type="date" 
                                            required 
                                            value={editFormData.date} 
                                            onChange={e => setEditFormData({...editFormData, date: e.target.value})} 
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#0EA5E9] outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">الوقت</label>
                                        <input 
                                            type="time" 
                                            required 
                                            value={editFormData.time} 
                                            onChange={e => setEditFormData({...editFormData, time: e.target.value})} 
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#0EA5E9] outline-none" 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">نوع الكشف</label>
                                        <select 
                                            value={editFormData.type} 
                                            onChange={e => setEditFormData({...editFormData, type: e.target.value})} 
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#0EA5E9] outline-none"
                                        >
                                            <option value="new">كشف جديد</option>
                                            <option value="follow_up">متابعة / استشارة</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">الحالة</label>
                                        <select 
                                            value={editFormData.status} 
                                            onChange={e => setEditFormData({...editFormData, status: e.target.value})} 
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#0EA5E9] outline-none"
                                        >
                                            <option value="pending">انتظار</option>
                                            <option value="completed">تم الكشف</option>
                                            <option value="cancelled">ملغي</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات</label>
                                    <textarea 
                                        rows="2" 
                                        value={editFormData.notes} 
                                        onChange={e => setEditFormData({...editFormData, notes: e.target.value})} 
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#0EA5E9] outline-none resize-none"
                                    ></textarea>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button 
                                        type="submit" 
                                        className="flex-1 bg-[#0284C7] hover:bg-sky-700 text-white font-black py-2.5 rounded-xl transition-all active:scale-95 text-xs shadow-md shadow-sky-500/20"
                                    >
                                        حفظ التعديلات
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setEditingAppt(null)} 
                                        className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // =========================================================
    // 2. العرض الرئيسي: التقويم الشهري المطور
    // =========================================================
    return (
        <div className="space-y-6 animate-view">
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                
                {/* رأس التقويم */}
                <div className="flex justify-between items-center mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <button 
                        onClick={prevMonth} 
                        className="w-10 h-10 rounded-lg bg-white shadow-sm text-slate-600 hover:text-[#0284C7] transition-colors flex items-center justify-center active:scale-95"
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                    <div className="text-center">
                        <h3 className="text-lg md:text-xl font-black text-slate-800">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">اضغط على أي يوم لفتح جدول زياراته</p>
                    </div>
                    <button 
                        onClick={nextMonth} 
                        className="w-10 h-10 rounded-lg bg-white shadow-sm text-slate-600 hover:text-[#0284C7] transition-colors flex items-center justify-center active:scale-95"
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                </div>

                {/* أسماء أيام الأسبوع */}
                <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                    {dayNames.map(day => (
                        <div key={day} className="text-center text-xs font-black text-slate-400 py-1">{day}</div>
                    ))}
                </div>

                {/* شبكة الأيام */}
                <div className="grid grid-cols-7 gap-1.5 md:gap-2.5">
                    {days.map((item, index) => {
                        if (!item) return <div key={index} className="aspect-square"></div>;
                        
                        const count = appointmentsCountByDate[item.dateStr] || 0;
                        const isToday = item.dateStr === todayStr;

                        return (
                            <button 
                                key={index} 
                                onClick={() => setViewingDay(item.dateStr)}
                                className={`group min-h-[62px] md:min-h-[88px] p-1.5 md:p-2 rounded-xl md:rounded-2xl border flex flex-col justify-between items-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                                    isToday 
                                        ? 'bg-sky-50/70 border-sky-300 text-[#0284C7] shadow-sm' 
                                        : count > 0 
                                            ? 'bg-white border-slate-200 text-slate-800 hover:border-[#0EA5E9]' 
                                            : 'bg-slate-50/60 border-transparent text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                <div className="w-full flex justify-between items-center">
                                    <span className="text-xs md:text-sm font-black">{item.day}</span>
                                    {isToday && (
                                        <span className="hidden md:inline-block text-[9px] font-black bg-[#0284C7] text-white px-1.5 py-0.2 rounded-md">اليوم</span>
                                    )}
                                </div>

                                {count > 0 ? (
                                    <div className="w-full mt-1">
                                        <span className="w-full py-0.5 md:py-1 px-1 rounded-lg text-[10px] md:text-xs font-black bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center justify-center gap-1 shadow-sm group-hover:scale-105 transition-transform">
                                            <i className="fas fa-calendar-check text-[9px]"></i>
                                            <span>{count}</span>
                                            <span className="hidden md:inline text-[9px]">زيارة</span>
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-slate-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                        لا مواعيد
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};