window.PatientFormModal = function({ setIsFormModalOpen, isEditing, formData, setFormData, handleSavePatient }) {
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-white w-full md:max-w-2xl rounded-t-3xl md:rounded-2xl shadow-2xl animate-view overflow-hidden pb-safe max-h-[90vh] flex flex-col">
                <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-sky-50 shrink-0">
                    <h3 className="text-base md:text-lg font-black text-[#0284C7]">{isEditing ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}</h3>
                    <button onClick={() => setIsFormModalOpen(false)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm"><i className="fas fa-times"></i></button>
                </div>
                <form onSubmit={handleSavePatient} className="p-5 md:p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">الاسم الرباعي <span className="text-rose-500">*</span></label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">رقم الهاتف</label>
                            <input type="tel" dir="ltr" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none text-right" />
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">تاريخ الميلاد</label>
                            <input type="date" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">النوع</label>
                                <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none">
                                    <option value="male">ذكر</option>
                                    <option value="female">أنثى</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">فصيلة الدم</label>
                                <select value={formData.blood_type} onChange={e => setFormData({...formData, blood_type: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none dir-ltr text-right">
                                    <option value="">غير معروف</option>
                                    <option value="A+">A+</option><option value="A-">A-</option>
                                    <option value="B+">B+</option><option value="B-">B-</option>
                                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                    <option value="O+">O+</option><option value="O-">O-</option>
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">محل الإقامة / العنوان</label>
                            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 mt-6">
                        <button type="submit" className="w-full md:flex-1 bg-[#0284C7] hover:bg-sky-700 text-white font-black py-3.5 rounded-xl shadow-lg active:scale-95 text-base">{isEditing ? 'حفظ التعديلات' : 'إضافة المريض'}</button>
                        <button type="button" onClick={() => setIsFormModalOpen(false)} className="w-full md:flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-3.5 rounded-xl active:scale-95 text-base">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
};