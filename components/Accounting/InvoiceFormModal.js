window.InvoiceFormModal = function({ 
    setIsInvoiceModalOpen, invoiceForm, setInvoiceForm, handleSaveInvoice, 
    patients, filteredPatients, patientSearchTerm, setPatientSearchTerm, 
    isPatientDropdownOpen, setIsPatientDropdownOpen, today 
}) {
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl animate-view overflow-visible pb-safe">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50 rounded-t-3xl md:rounded-t-2xl">
                    <h3 className="text-lg font-black text-emerald-600"><i className="fas fa-plus-circle"></i> إصدار فاتورة / تحصيل إيراد</h3>
                    <button onClick={() => {setIsInvoiceModalOpen(false); setPatientSearchTerm('');}} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><i className="fas fa-times"></i></button>
                </div>
                <form onSubmit={handleSaveInvoice} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                    
                    <div className="relative">
                        <label className="block text-sm font-bold text-slate-700 mb-1">ابحث واختر المريض <span className="text-rose-500">*</span></label>
                        {patients.length === 0 ? (
                            <div className="text-xs text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100 font-bold">يجب إضافة مريض أولاً من قسم "سجل المرضى"</div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text" placeholder="ابحث بالاسم أو رقم الهاتف..." value={patientSearchTerm}
                                    onChange={(e) => {
                                        setPatientSearchTerm(e.target.value); setIsPatientDropdownOpen(true);
                                        if(e.target.value === '') setInvoiceForm({...invoiceForm, patient_id: ''});
                                    }}
                                    onFocus={() => setIsPatientDropdownOpen(true)}
                                    onBlur={() => setTimeout(() => setIsPatientDropdownOpen(false), 200)}
                                    className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none"
                                />
                                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                {isPatientDropdownOpen && patientSearchTerm && (
                                    <ul className="absolute z-[1000] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.map(p => (
                                                <li key={p.id} onMouseDown={() => { setInvoiceForm({...invoiceForm, patient_id: p.id}); setPatientSearchTerm(`${p.name} (${p.phone || '-'})`); setIsPatientDropdownOpen(false); }} className="p-4 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 text-sm font-bold text-slate-700 transition-colors">
                                                    {p.name} <span className="text-xs text-slate-400 block mt-1">رقم: {p.phone || 'لا يوجد'}</span>
                                                </li>
                                            ))
                                        ) : <li className="p-4 text-sm text-slate-400 text-center font-bold">لا يوجد مريض يطابق بحثك</li>}
                                    </ul>
                                )}
                            </div>
                        )}
                        {!invoiceForm.patient_id && patientSearchTerm && !isPatientDropdownOpen && (
                            <p className="text-[10px] text-rose-500 font-bold mt-1">يرجى الضغط على اسم المريض من القائمة المنسدلة</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">التاريخ</label>
                        <input type="date" required value={invoiceForm.date} onChange={e=>setInvoiceForm({...invoiceForm, date: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">المبلغ الكلي</label>
                            <input type="number" min="0" required value={invoiceForm.total_amount} onChange={e=>setInvoiceForm({...invoiceForm, total_amount: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none" placeholder="ج.م" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">المدفوع (مقبوض)</label>
                            <input type="number" min="0" required value={invoiceForm.paid_amount} onChange={e=>setInvoiceForm({...invoiceForm, paid_amount: e.target.value})} className="w-full p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-black text-emerald-700 focus:border-emerald-500 outline-none" placeholder="ج.م" />
                        </div>
                    </div>
                    <button type="submit" disabled={!invoiceForm.patient_id} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 text-lg active:scale-95">
                        إصدار وتحصيل
                    </button>
                </form>
            </div>
        </div>
    );
};