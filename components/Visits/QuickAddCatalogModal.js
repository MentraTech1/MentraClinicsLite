window.QuickAddCatalogModal = function({ setIsQuickAddModalOpen, handleQuickAddCatalog }) {
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-end md:items-center justify-center p-0 md:p-4 print:hidden">
            <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-emerald-200 pb-safe">
                <div className="p-4 md:p-5 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center rounded-t-3xl md:rounded-t-2xl">
                    <h4 className="font-black text-emerald-700 text-sm md:text-base"><i className="fas fa-plus-circle"></i> إضافة سريعة للدليل</h4>
                    <button onClick={() => setIsQuickAddModalOpen(false)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm"><i className="fas fa-times"></i></button>
                </div>
                <form onSubmit={handleQuickAddCatalog} className="p-5 md:p-6 space-y-4">
                    <div>
                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">الاسم التجاري / اسم التحليل</label>
                        <input type="text" name="name" required className="w-full p-3.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none dir-ltr text-right" />
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">النوع</label>
                        <select name="type" className="w-full p-3.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none">
                            <option value="drug">دواء (Drug)</option>
                            <option value="lab">تحليل معملي (Lab)</option>
                            <option value="xray">أشعة (X-Ray)</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 md:py-3 rounded-xl mt-2 active:scale-95 shadow-lg shadow-emerald-500/30">حفظ وإدراج</button>
                </form>
            </div>
        </div>
    );
};