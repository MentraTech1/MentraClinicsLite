window.ExpenseFormModal = function({ setIsExpenseModalOpen, expenseForm, setExpenseForm, handleSaveExpense, today }) {
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl animate-view overflow-hidden pb-safe">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-rose-50 rounded-t-3xl md:rounded-t-2xl">
                    <h3 className="text-lg font-black text-rose-600"><i className="fas fa-minus-circle"></i> تسجيل مصروف جديد</h3>
                    <button onClick={() => setIsExpenseModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><i className="fas fa-times"></i></button>
                </div>
                <form onSubmit={handleSaveExpense} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">التاريخ</label>
                            <input type="date" required value={expenseForm.date} onChange={e=>setExpenseForm({...expenseForm, date: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-rose-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">المبلغ <span className="text-rose-500">*</span></label>
                            <input type="number" min="1" required value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm, amount: e.target.value})} className="w-full p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-sm font-black text-rose-600 focus:border-rose-500 outline-none" placeholder="ج.م" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">بند المصروف</label>
                        <select value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm, category: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-rose-500 outline-none">
                            <option value="supplies">مستلزمات وأدوات طبية</option>
                            <option value="salaries">رواتب وأجور</option>
                            <option value="rent">إيجار العيادة</option>
                            <option value="utilities">فواتير (كهرباء، مياه، نت)</option>
                            <option value="marketing">دعاية وتسويق</option>
                            <option value="other">نثريات أخرى</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">البيان / ملاحظات</label>
                        <textarea rows="2" value={expenseForm.description} onChange={e=>setExpenseForm({...expenseForm, description: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-rose-500 outline-none resize-none"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-xl transition-colors mt-2 active:scale-95">
                        حفظ المصروف
                    </button>
                </form>
            </div>
        </div>
    );
};