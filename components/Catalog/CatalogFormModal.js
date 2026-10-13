window.CatalogFormModal = function({ setIsModalOpen, isEditing, formData, setFormData, handleSaveItem }) {
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl animate-view overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] pb-safe">
                <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-sky-50 shrink-0">
                    <h3 className="text-base md:text-lg font-black text-[#0284C7]">{isEditing ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><i className="fas fa-times"></i></button>
                </div>
                <form onSubmit={handleSaveItem} className="p-5 md:p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-2">نوع الصنف <span className="text-rose-500">*</span></label>
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                            <label className={`cursor-pointer border p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${formData.type === 'drug' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <input type="radio" name="type" value="drug" checked={formData.type === 'drug'} onChange={e=>setFormData({...formData, type:e.target.value})} className="hidden" />
                                <i className="fas fa-pills text-xl md:text-2xl"></i>
                                <span className="text-[10px] md:text-xs font-bold">دواء / علاج</span>
                            </label>
                            <label className={`cursor-pointer border p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${formData.type === 'lab' ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <input type="radio" name="type" value="lab" checked={formData.type === 'lab'} onChange={e=>setFormData({...formData, type:e.target.value})} className="hidden" />
                                <i className="fas fa-flask text-xl md:text-2xl"></i>
                                <span className="text-[10px] md:text-xs font-bold">تحليل معملي</span>
                            </label>
                            <label className={`cursor-pointer border p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${formData.type === 'xray' ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <input type="radio" name="type" value="xray" checked={formData.type === 'xray'} onChange={e=>setFormData({...formData, type:e.target.value})} className="hidden" />
                                <i className="fas fa-x-ray text-xl md:text-2xl"></i>
                                <span className="text-[10px] md:text-xs font-bold">أشعة</span>
                            </label>
                            <label className={`cursor-pointer border p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${formData.type === 'service' ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                <input type="radio" name="type" value="service" checked={formData.type === 'service'} onChange={e=>setFormData({...formData, type:e.target.value})} className="hidden" />
                                <i className="fas fa-notes-medical text-xl md:text-2xl"></i>
                                <span className="text-[10px] md:text-xs font-bold">خدمة أخرى</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">اسم الصنف (التجاري أو العلمي) <span className="text-rose-500">*</span></label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none dir-ltr text-right" placeholder="مثال: Panadol 500mg" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">السعر (اختياري)</label>
                            <input type="number" min="0" step="any" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-3.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" placeholder="ج.م" />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">الوحدة (اختياري)</label>
                            <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full p-3.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" placeholder="شريط، أمبول.." />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">ملاحظات / المادة الفعالة</label>
                        <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none resize-none"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-[#0284C7] hover:bg-sky-700 text-white font-black py-4 md:py-3 rounded-xl transition-colors shadow-lg shadow-sky-500/30 mt-2 active:scale-95 text-base">
                        {isEditing ? 'حفظ التعديلات' : 'إضافة الصنف'}
                    </button>
                </form>
            </div>
        </div>
    );
};