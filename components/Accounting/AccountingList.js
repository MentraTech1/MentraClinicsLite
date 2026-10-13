window.AccountingList = function({ loading, activeTab, setActiveTab, setCurrentPage, currentDataList, currentItems, handleDeleteInvoice, handlePrintInvoice, handleDeleteExpense, totalPages, currentPage, prevPage, nextPage }) {
    
    const categoryLabels = {
        'supplies': 'مستلزمات طبية', 'rent': 'إيجار العيادة', 'salaries': 'رواتب وأجور',
        'utilities': 'كهرباء ومياه', 'marketing': 'دعاية وتسويق', 'other': 'نثريات ومصروفات أخرى'
    };

    return (
        <div className="bg-transparent md:bg-white md:rounded-2xl md:border border-slate-100 md:shadow-sm overflow-hidden flex flex-col">
            <div className="flex border-b border-slate-100 bg-white rounded-xl md:rounded-none shadow-sm md:shadow-none mb-3 md:mb-0">
                <button onClick={() => { setActiveTab('invoices'); setCurrentPage(1); }} className={`flex-1 py-3.5 md:py-4 text-xs md:text-sm font-black transition-colors ${activeTab === 'invoices' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}>
                    <i className="fas fa-file-invoice mr-1 md:mr-2"></i> سجل الإيرادات
                </button>
                <button onClick={() => { setActiveTab('expenses'); setCurrentPage(1); }} className={`flex-1 py-3.5 md:py-4 text-xs md:text-sm font-black transition-colors ${activeTab === 'expenses' ? 'text-rose-600 border-b-2 border-rose-500' : 'text-slate-400 hover:text-slate-600'}`}>
                    <i className="fas fa-receipt mr-1 md:mr-2"></i> سجل المصروفات
                </button>
            </div>

            <div className="p-0">
                {loading ? (
                    <div className="flex justify-center p-10"><i className="fas fa-spinner fa-spin text-3xl text-[#0EA5E9]"></i></div>
                ) : currentDataList.length === 0 ? (
                    <div className="text-center p-10 bg-white rounded-2xl md:rounded-none">
                        <i className="fas fa-folder-open text-5xl text-slate-200 mb-4"></i>
                        <h3 className="text-lg font-bold text-slate-500">لا توجد حركات مالية مسجلة</h3>
                        <p className="text-sm text-slate-400 mt-1">في هذه الفترة المحددة</p>
                    </div>
                ) : (
                    <>
                        {/* تصميم الموبايل */}
                        <div className="md:hidden space-y-3">
                            {currentItems.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded"><i className="far fa-calendar-alt"></i> {item.date}</span>
                                            <h3 className="font-black text-slate-700 mt-1 text-sm">
                                                {activeTab === 'invoices' ? item.patient_name : (categoryLabels[item.category] || 'مصروف')}
                                            </h3>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {activeTab === 'invoices' && (
                                                <button onClick={() => handlePrintInvoice(item)} className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center active:scale-95"><i className="fas fa-print"></i></button>
                                            )}
                                            <button onClick={() => activeTab === 'invoices' ? handleDeleteInvoice(item.id) : handleDeleteExpense(item.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center active:scale-95"><i className="fas fa-trash-alt"></i></button>
                                        </div>
                                    </div>
                                    
                                    {activeTab === 'invoices' ? (
                                        <div className="flex items-center justify-between bg-emerald-50 p-2 rounded-lg mt-2 border border-emerald-100">
                                            <span className="text-xs font-bold text-emerald-700">المقبوض: <span className="font-black text-base">{item.paid_amount} ج.م</span></span>
                                            <span className="text-[10px] font-bold text-slate-400">الكلي: {item.total_amount}</span>
                                        </div>
                                    ) : (
                                        <div className="mt-2">
                                            <div className="bg-rose-50 p-2 rounded-lg border border-rose-100 inline-block w-full text-center">
                                                <span className="text-xs font-bold text-rose-700">المبلغ: <span className="font-black text-base">{item.amount} ج.م</span></span>
                                            </div>
                                            {item.description && <p className="text-xs text-slate-500 mt-2 font-semibold"><i className="fas fa-info-circle"></i> {item.description}</p>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* تصميم الكمبيوتر */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                                    {activeTab === 'invoices' ? (
                                        <tr>
                                            <th className="px-6 py-4">التاريخ</th>
                                            <th className="px-6 py-4">اسم المريض</th>
                                            <th className="px-6 py-4 text-center">المبلغ الكلي</th>
                                            <th className="px-6 py-4 text-center">المدفوع</th>
                                            <th className="px-6 py-4 text-center">الإجراءات</th>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <th className="px-6 py-4">التاريخ</th>
                                            <th className="px-6 py-4">بند المصروف</th>
                                            <th className="px-6 py-4 text-center">المبلغ</th>
                                            <th className="px-6 py-4">البيان / الوصف</th>
                                            <th className="px-6 py-4 text-center">الإجراءات</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            {activeTab === 'invoices' ? (
                                                <>
                                                    <td className="px-6 py-4 font-bold text-slate-600">{item.date}</td>
                                                    <td className="px-6 py-4 font-black text-[#0284C7]">{item.patient_name}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-slate-500">{item.total_amount} ج.م</td>
                                                    <td className="px-6 py-4 text-center font-black text-emerald-600">{item.paid_amount} ج.م</td>
                                                    <td className="px-6 py-4 text-center space-x-2 space-x-reverse">
                                                        <button onClick={() => handlePrintInvoice(item)} title="طباعة الإيصال" className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white transition-colors inline-flex items-center justify-center"><i className="fas fa-print"></i></button>
                                                        <button onClick={() => handleDeleteInvoice(item.id)} title="حذف الفاتورة" className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors inline-flex items-center justify-center"><i className="fas fa-trash-alt"></i></button>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-4 font-bold text-slate-600">{item.date}</td>
                                                    <td className="px-6 py-4 font-black text-slate-700"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{categoryLabels[item.category] || 'مصروف'}</span></td>
                                                    <td className="px-6 py-4 text-center font-black text-rose-600">{item.amount} ج.م</td>
                                                    <td className="px-6 py-4 font-semibold text-slate-500">{item.description || '-'}</td>
                                                    <td className="px-6 py-4 text-center"><button onClick={() => handleDeleteExpense(item.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors inline-flex items-center justify-center"><i className="fas fa-trash-alt"></i></button></td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 bg-white md:bg-transparent border-t border-slate-100 flex items-center justify-between rounded-xl md:rounded-none mt-3 md:mt-0 shadow-sm md:shadow-none">
                        <button onClick={prevPage} disabled={currentPage === 1} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white transition-colors disabled:opacity-50 active:scale-95"><i className="fas fa-chevron-right md:ml-1"></i> <span className="hidden md:inline">السابق</span></button>
                        <span className="text-sm font-bold text-slate-500">صفحة <span className="text-[#0284C7] text-lg mx-1">{currentPage}</span> من {totalPages}</span>
                        <button onClick={nextPage} disabled={currentPage === totalPages} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white transition-colors disabled:opacity-50 active:scale-95"><span className="hidden md:inline">التالي</span> <i className="fas fa-chevron-left md:mr-1"></i></button>
                    </div>
                )}
            </div>
        </div>
    );
};