window.PatientProfile_Content = function({ activeTab, setActiveTab, dateRange, handleDateChange, currentItems, setSelectedPrescription, totalPages, currentPage, nextPage, prevPage }) {
    return (
        <>
            {/* شريط التبويبات والفلاتر */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-3 flex flex-col lg:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap bg-slate-100/80 p-1.5 rounded-xl w-full lg:w-auto gap-1">
                    <button onClick={() => setActiveTab('visits')} className={`flex-1 lg:px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'visits' ? 'bg-white text-[#0284C7] shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}>
                        <i className="fas fa-notes-medical"></i> كشوفات
                    </button>
                    <button onClick={() => setActiveTab('prescriptions')} className={`flex-1 lg:px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'prescriptions' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}>
                        <i className="fas fa-pills"></i> روشتات
                    </button>
                    <button onClick={() => setActiveTab('financials')} className={`flex-1 lg:px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'financials' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}>
                        <i className="fas fa-file-invoice-dollar"></i> حسابات
                    </button>
                    <button onClick={() => setActiveTab('appointments')} className={`flex-1 lg:px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'appointments' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}>
                        <i className="fas fa-calendar-check"></i> مواعيد
                    </button>
                </div>
                
                {activeTab !== 'appointments' && (
                    <div className="flex items-center gap-2 w-full lg:w-auto bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                        <input type="date" name="from" value={dateRange.from} onChange={handleDateChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-[#0EA5E9]" />
                        <span className="text-slate-400">-</span>
                        <input type="date" name="to" value={dateRange.to} onChange={handleDateChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-[#0EA5E9]" />
                    </div>
                )}
            </div>

            {/* عرض البيانات */}
            <div className="space-y-4">
                {currentItems.length === 0 ? (
                    <div className="bg-slate-50/50 rounded-3xl border border-slate-200 border-dashed p-12 text-center flex flex-col items-center">
                        <i className="fas fa-box-open text-4xl text-slate-300 mb-4 bg-white w-20 h-20 flex items-center justify-center rounded-full shadow-sm"></i>
                        <h3 className="font-black text-slate-700 text-lg mb-1">لا توجد سجلات حالياً</h3>
                    </div>
                ) : (
                    currentItems.map((item, index) => {
                        
                        // تصميم المواعيد المعلقة
                        if (activeTab === 'appointments') {
                            return (
                                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-amber-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl border border-amber-100"><i className="fas fa-calendar-day"></i></div>
                                        <div>
                                            <h4 className="font-black text-slate-800 text-lg">{item.date}</h4>
                                            <p className="text-xs font-bold text-slate-500 mt-1">{item.type === 'new' ? 'كشف جديد' : 'متابعة'} {item.notes && `- ${item.notes}`}</p>
                                        </div>
                                    </div>
                                    <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-xs font-black">
                                        {item.status === 'waiting' ? 'في الانتظار' : 'معلق'}
                                    </div>
                                </div>
                            );
                        }

                        // تصميم الروشتات (كروت تفاعلية)
                        if (activeTab === 'prescriptions') {
                            return (
                                <div key={item.id} onClick={() => setSelectedPrescription(item)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl border border-emerald-100 group-hover:scale-110 transition-transform"><i className="fas fa-prescription"></i></div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-black text-slate-800 text-lg">روشتة علاجية</h4>
                                                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black">{item.date}</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-500">تم صرف <span className="text-emerald-600 font-black">{item.medications.length} أدوية</span> لهذه الحالة.</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 sm:mt-0 bg-slate-50 text-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                                        عرض وتفاصيل <i className="fas fa-external-link-alt"></i>
                                    </div>
                                </div>
                            );
                        }

                        // تصميم الكشوفات أو الحسابات
                        return (
                            <div key={item.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row overflow-hidden">
                                <div className={`w-full sm:w-2 shrink-0 ${activeTab === 'visits' ? 'bg-[#0284C7]' : 'bg-rose-500'}`}></div>
                                <div className="p-5 flex-1 relative">
                                    <div className="absolute top-5 left-5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-slate-600"><i className="fas fa-calendar-day"></i> {item.date}</div>
                                    
                                    {activeTab === 'visits' && (
                                        <div className="pt-8 md:pt-0">
                                            <span className="px-3 py-1 text-[10px] uppercase rounded-md font-black border bg-sky-50 text-sky-700 border-sky-100 block w-fit mb-3">{item.visit_type === 'new' ? 'كشف جديد' : 'متابعة'}</span>
                                            <h4 className="text-xs font-black text-slate-400 mb-1">التشخيص</h4>
                                            <p className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{item.diagnosis || 'لم يُسجل'}</p>
                                        </div>
                                    )}

                                    {activeTab === 'financials' && (
                                        <div className="flex justify-between items-center pt-8 md:pt-0">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl"><i className="fas fa-receipt"></i></div>
                                                <div>
                                                    <h3 className="text-base font-black text-slate-800">فاتورة عيادة</h3>
                                                    <span className={`text-xs font-bold ${item.payment_status==='paid'?'text-emerald-500':'text-amber-500'}`}>{item.payment_status==='paid'?'خالص':'متبقي'}</span>
                                                </div>
                                            </div>
                                            <div className="text-left bg-slate-50 px-5 py-2 rounded-xl border border-slate-100">
                                                <p className="text-[10px] text-slate-400 font-black mb-0.5">القيمة</p>
                                                <p className="text-xl font-black text-rose-600">{item.paid_amount}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* شريط الترقيم */}
            {totalPages > 1 && (
                <div className="bg-white p-3 border border-slate-200 flex justify-between rounded-2xl shadow-sm mt-6">
                    <button onClick={prevPage} disabled={currentPage === 1} className="px-5 py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white disabled:opacity-50 active:scale-95"><i className="fas fa-chevron-right text-xs"></i> السابق</button>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        صفحة <span className="w-8 h-8 flex items-center justify-center bg-[#0284C7] text-white rounded-lg font-black">{currentPage}</span> من {totalPages}
                    </div>
                    <button onClick={nextPage} disabled={currentPage === totalPages} className="px-5 py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white disabled:opacity-50 active:scale-95">التالي <i className="fas fa-chevron-left text-xs"></i></button>
                </div>
            )}
        </>
    );
};