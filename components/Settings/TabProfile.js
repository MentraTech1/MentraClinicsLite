window.TabProfile = function({ formData, setFormData, handleUpdateProfile }) {
    return (
        <div className="animate-view space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 mb-4 md:mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center text-lg md:text-xl shrink-0"><i className="fas fa-user-md"></i></div>
                <div>
                    <h3 className="font-black text-base md:text-lg text-slate-700">الملف الشخصي للعيادة</h3>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400">تستخدم هذه البيانات في طباعة الروشتة</p>
                </div>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4 md:space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <div>
                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">اسم العيادة / المركز الطبي <span className="text-rose-500">*</span></label>
                        <input type="text" required value={formData.clinic_name} onChange={e=>setFormData({...formData, clinic_name: e.target.value})} className="w-full p-3.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">اسم الطبيب المدير <span className="text-rose-500">*</span></label>
                        <input type="text" required value={formData.owner_name} onChange={e=>setFormData({...formData, owner_name: e.target.value})} className="w-full p-3.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">رقم الهاتف (للدخول) <span className="text-rose-500">*</span></label>
                        <input type="tel" required dir="ltr" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full p-3.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none text-right" />
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">كلمة المرور الحالية/الجديدة <span className="text-rose-500">*</span></label>
                        <input type="text" required value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full p-3.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none dir-ltr text-right" minLength="6" />
                    </div>
                </div>
                <button type="submit" className="w-full md:w-auto bg-[#0284C7] hover:bg-sky-700 text-white font-black px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-sky-500/30 mt-2 active:scale-95 text-sm md:text-base">
                    <i className="fas fa-save mr-1 md:mr-2"></i> حفظ التحديثات
                </button>
            </form>
        </div>
    );
};