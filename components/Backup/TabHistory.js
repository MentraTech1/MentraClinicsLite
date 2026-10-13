window.TabHistory = function({ backupsList, currentItems, handleRestoreFromHistory, handleDeleteBackup, totalPages, currentPage, prevPage, nextPage }) {
    return (
        <div className="bg-transparent md:bg-white md:rounded-2xl md:border border-slate-100 md:shadow-sm overflow-hidden animate-view flex flex-col">
            <div className="hidden md:flex p-6 border-b border-slate-100 bg-sky-50 justify-between items-center">
                <div>
                    <h3 className="font-black text-[#0284C7] flex items-center gap-2"><i className="fas fa-archive"></i> أرشيف اللقطات المحلية (Snapshots)</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">يحتفظ النظام بنسخة داخلية تلقائية للرجوع إليها سريعاً.</p>
                </div>
            </div>

            {backupsList.length === 0 ? (
                <div className="text-center p-10 md:p-12 bg-white rounded-2xl md:rounded-none shadow-sm md:shadow-none">
                    <i className="fas fa-inbox text-5xl md:text-6xl text-slate-200 mb-4"></i>
                    <h3 className="text-base md:text-lg font-bold text-slate-500">لا يوجد أرشيف داخلي</h3>
                    <p className="text-xs md:text-sm text-slate-400 mt-1">قم بإنشاء نسخة احتياطية أولاً من التبويب الآخر.</p>
                </div>
            ) : (
                <>
                    {/* تصميم الموبايل */}
                    <div className="md:hidden space-y-3">
                        {currentItems.map((backup) => (
                            <div key={backup.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                                    <div>
                                        <h3 className="font-black text-slate-700 text-sm dir-ltr text-right truncate max-w-[200px]">{backup.backup_name}</h3>
                                        <div className="text-[10px] font-bold text-slate-400 mt-1"><i className="far fa-clock"></i> {backup.created_at.replace('T', ' ').substring(0, 16)}</div>
                                    </div>
                                    <span className="bg-sky-50 text-sky-600 font-black px-2 py-1 rounded text-[10px] border border-sky-100 shrink-0">{backup.file_size}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleRestoreFromHistory(backup)} className="flex-1 bg-emerald-50 text-emerald-600 py-2.5 rounded-lg font-bold text-xs shadow-sm active:scale-95 flex items-center justify-center gap-1 border border-emerald-100"><i className="fas fa-undo-alt"></i> استعادة النسخة</button>
                                    <button onClick={() => handleDeleteBackup(backup.id)} className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center active:scale-95 border border-rose-100"><i className="fas fa-trash-alt"></i></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* تصميم الكمبيوتر */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">اسم / تاريخ النسخة</th>
                                    <th className="px-6 py-4">الحجم</th>
                                    <th className="px-6 py-4 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {currentItems.map((backup) => (
                                    <tr key={backup.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-black text-slate-700 dir-ltr text-right truncate max-w-xs">{backup.backup_name}</div>
                                            <div className="text-xs font-bold text-slate-400 mt-1">{backup.created_at.replace('T', ' ').substring(0, 16)}</div>
                                        </td>
                                        <td className="px-6 py-4 font-black text-[#0284C7]">{backup.file_size}</td>
                                        <td className="px-6 py-4 text-center space-x-2 space-x-reverse">
                                            <button onClick={() => handleRestoreFromHistory(backup)} title="استعادة هذه النسخة" className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold text-xs transition-colors shadow-sm"><i className="fas fa-undo-alt ml-1"></i> استعادة</button>
                                            <button onClick={() => handleDeleteBackup(backup.id)} title="حذف النسخة" className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors"><i className="fas fa-trash-alt"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="p-4 bg-white md:bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-xl md:rounded-none mt-3 md:mt-0 shadow-sm md:shadow-none">
                            <button onClick={prevPage} disabled={currentPage === 1} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white transition-colors disabled:opacity-50 active:scale-95"><i className="fas fa-chevron-right md:ml-1"></i> <span className="hidden md:inline">السابق</span></button>
                            <span className="text-sm font-bold text-slate-500">صفحة <span className="text-[#0284C7] text-lg mx-1">{currentPage}</span> من {totalPages}</span>
                            <button onClick={nextPage} disabled={currentPage === totalPages} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white transition-colors disabled:opacity-50 active:scale-95"><span className="hidden md:inline">التالي</span> <i className="fas fa-chevron-left md:mr-1"></i></button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};