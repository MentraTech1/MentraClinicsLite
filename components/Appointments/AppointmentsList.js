window.AppointmentsList = function({ loading, appointmentsLength, currentItems, handleUpdateStatus, handleDelete, totalPages, currentPage, prevPage, nextPage }) {
    if (loading) return <div className="flex justify-center p-10"><i className="fas fa-spinner fa-spin text-3xl text-[#0EA5E9]"></i></div>;
    
    if (appointmentsLength === 0) {
        return (
            <div className="text-center p-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <i className="fas fa-calendar-times text-5xl text-slate-300 mb-4"></i>
                <h3 className="text-lg font-bold text-slate-600">لا توجد مواعيد</h3>
                <p className="text-sm text-slate-400 mt-1">جرب تغيير التواريخ أو الفلاتر</p>
            </div>
        );
    }

    // مكون القائمة المنسدلة الذكية للحالة
    const StatusDropdown = ({ appt }) => (
        <div className="relative inline-block w-28">
            <select
                value={appt.status}
                onChange={(e) => handleUpdateStatus(appt.id, e.target.value)}
                className={`w-full appearance-none px-3 py-1.5 rounded-lg text-[11px] md:text-xs font-black outline-none cursor-pointer text-center transition-colors shadow-sm ${
                    appt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' :
                    appt.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100' :
                    'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                }`}
            >
                <option value="pending">⏳ انتظار</option>
                <option value="completed">✅ تم الكشف</option>
                <option value="cancelled">❌ ملغي</option>
            </select>
            <i className={`fas fa-chevron-down absolute left-2 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none ${
                appt.status === 'completed' ? 'text-emerald-500' : appt.status === 'cancelled' ? 'text-rose-500' : 'text-amber-500'
            }`}></i>
        </div>
    );

    return (
        <div className="bg-transparent md:bg-white md:rounded-2xl md:border border-slate-100 md:shadow-sm overflow-hidden">
            {/* تصميم الجوال */}
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
                                <StatusDropdown appt={appt} />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleDelete(appt.id)} className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center active:scale-95"><i className="fas fa-trash-alt"></i></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* تصميم الكمبيوتر */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">تاريخ ووقت الحجز</th>
                            <th className="px-6 py-4">اسم المريض</th>
                            <th className="px-6 py-4">نوع الكشف</th>
                            <th className="px-6 py-4 text-center">تحديث الحالة</th>
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
                                <td className="px-6 py-4 text-center">
                                    <StatusDropdown appt={appt} />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleDelete(appt.id)} title="حذف" className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors"><i className="fas fa-trash-alt"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between rounded-xl md:rounded-none mt-3 md:mt-0 shadow-sm md:shadow-none">
                    <button onClick={prevPage} disabled={currentPage === 1} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white disabled:opacity-50 active:scale-95"><i className="fas fa-chevron-right md:ml-1"></i> <span className="hidden md:inline">السابق</span></button>
                    <span className="text-sm font-bold text-slate-500">صفحة <span className="text-[#0284C7] text-lg mx-1">{currentPage}</span> من {totalPages}</span>
                    <button onClick={nextPage} disabled={currentPage === totalPages} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white disabled:opacity-50 active:scale-95"><span className="hidden md:inline">التالي</span> <i className="fas fa-chevron-left md:mr-1"></i></button>
                </div>
            )}
        </div>
    );
};