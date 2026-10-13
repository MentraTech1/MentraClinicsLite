
window.VisitsList = function({ loading, visitsLength, currentItems, handlePrint, handleDelete, openEditVisit, totalPages, currentPage, prevPage, nextPage }) {
    if (loading) return <div className="flex justify-center p-10"><i className="fas fa-spinner fa-spin text-3xl text-[#0EA5E9]"></i></div>;
    
    if (visitsLength === 0) {
        return (
            <div className="text-center p-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <i className="fas fa-notes-medical text-5xl text-slate-300 mb-4"></i>
                <h3 className="text-lg font-bold text-slate-600">لا توجد كشوفات</h3>
            </div>
        );
    }

    return (
        <div className="bg-transparent md:bg-white md:rounded-2xl md:border border-slate-100 md:shadow-sm overflow-hidden">
            {/* تصميم الموبايل */}
            <div className="md:hidden space-y-3">
                {currentItems.map((visit) => (
                    <div key={visit.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 relative">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="font-black text-[#0284C7] text-base">{visit.patient_name}</h3>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${visit.visit_type === 'new' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {visit.visit_type === 'new' ? 'كشف جديد' : 'متابعة'}
                                </span>
                            </div>
                            <div className="text-left font-bold text-slate-700 text-sm">{visit.date}</div>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold">التشخيص:</p>
                            <p className="text-xs font-semibold text-slate-700 mt-0.5">{visit.diagnosis || 'بدون تشخيص'}</p>
                        </div>
                        <div className="flex gap-2 pt-2 mt-1 border-t border-slate-50">
                            <button onClick={() => handlePrint(visit)} className="flex-1 bg-[#0284C7] text-white py-2.5 rounded-lg font-bold text-xs shadow-md active:scale-95 flex items-center justify-center gap-2"><i className="fas fa-print"></i> طباعة الروشتة</button>
                            <button onClick={() => openEditVisit(visit)} className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white flex items-center justify-center active:scale-95"><i className="fas fa-edit"></i></button>
                            <button onClick={() => handleDelete(visit.id)} className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white flex items-center justify-center active:scale-95"><i className="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* تصميم الكمبيوتر */}
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
                                    <button onClick={() => handlePrint(visit)} title="طباعة الروشتة" className="px-3 py-1.5 rounded-lg bg-[#0284C7] text-white hover:bg-sky-700 font-bold text-xs shadow-md"><i className="fas fa-print ml-1"></i> طباعة</button>
                                    <button onClick={() => openEditVisit(visit)} title="تعديل الكشف" className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white"><i className="fas fa-edit"></i></button>
                                    <button onClick={() => handleDelete(visit.id)} title="حذف الكشف" className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white"><i className="fas fa-trash-alt"></i></button>
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