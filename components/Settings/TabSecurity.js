window.TabSecurity = function({ formData, setFormData, handleUpdateSecurityKey }) {
    
    // دالة لتوليد رقم سري مكون من 3 مقاطع
    const generateRandomKey = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let key = '';
        for (let i = 0; i < 12; i++) {
            if (i > 0 && i % 4 === 0) key += '-';
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, security_key: key });
    };

    return (
        <div className="animate-view space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 mb-4 md:mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center text-lg md:text-xl shrink-0"><i className="fas fa-key"></i></div>
                <div>
                    <h3 className="font-black text-base md:text-lg text-slate-700">مفتاح الاستعادة والأمان</h3>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400">يستخدم لاستعادة الحساب في حال نسيان كلمة المرور</p>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-5 flex items-start gap-3">
                <i className="fas fa-info-circle text-amber-500 text-xl mt-1 shrink-0"></i>
                <p className="text-xs md:text-sm font-bold text-amber-700 leading-relaxed">
                    نظراً لأن النظام يعمل (Offline) بدون إنترنت، لا توجد إمكانية لاستعادة الباسورد عبر الإيميل أو رسائل SMS. 
                    لذلك، <strong className="text-amber-900">يجب عليك إنشاء مفتاح أمان والاحتفاظ به في مكان آمن (في ورقة خارجية أو الموبايل)</strong>. في حال نسيان الباسورد، سيطلب منك النظام إدخال هذا المفتاح لاستعادة الحساب.
                </p>
            </div>

            <form onSubmit={handleUpdateSecurityKey} className="space-y-5">
                <div>
                    <label className="block text-xs md:text-sm font-bold text-slate-700 mb-2">مفتاح الأمان الخاص بك</label>
                    <div className="flex flex-col md:flex-row gap-3">
                        <input 
                            type="text" 
                            dir="ltr"
                            placeholder="مثال: A1B2-C3D4-E5F6"
                            value={formData.security_key} 
                            onChange={e => setFormData({...formData, security_key: e.target.value.toUpperCase()})} 
                            className="flex-1 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-lg font-black tracking-widest text-center text-violet-700 focus:border-violet-500 outline-none uppercase placeholder:text-sm placeholder:tracking-normal" 
                        />
                        <button 
                            type="button" 
                            onClick={generateRandomKey}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 py-4 rounded-xl transition-colors shrink-0 text-sm md:text-base flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-random"></i> توليد تلقائي
                        </button>
                    </div>
                </div>

                <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black px-8 py-4 rounded-xl transition-colors shadow-lg shadow-violet-500/30 active:scale-95 text-sm md:text-base flex items-center justify-center gap-2">
                    <i className="fas fa-lock"></i> اعتماد وحفظ مفتاح الأمان
                </button>
            </form>
        </div>
    );
};