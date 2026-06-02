window.Module_Settings = function({ clinicId, userId, showToast }) {
    const { useState, useEffect } = React;

    const [activeTab, setActiveTab] = useState('profile'); // profile, storage, danger
    const [loading, setLoading] = useState(true);

    // ==========================================
    // حالات البيانات (States)
    // ==========================================
    const [formData, setFormData] = useState({
        clinic_id: null,
        clinic_name: '',
        owner_name: '',
        phone: '',
        password: ''
    });

    const [storageInfo, setStorageInfo] = useState({ usage: 0, quota: 0, percent: 0 });

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deleteType, setDeleteType] = useState(''); // 'transactions' or 'factory_reset'
    const [confirmText, setConfirmText] = useState('');

    // ==========================================
    // جلب البيانات الأساسية
    // ==========================================
    useEffect(() => {
        const fetchSettingsData = async () => {
            setLoading(true);
            try {
                if (!window.db) return;

                // 1. جلب بيانات المستخدم والعيادة
                const user = await window.db.users.get(userId);
                const clinic = await window.db.clinic_info.toCollection().first();

                if (user && clinic) {
                    setFormData({
                        clinic_id: clinic.id,
                        clinic_name: clinic.clinic_name,
                        owner_name: user.name,
                        phone: user.phone,
                        password: user.password
                    });
                }

                // 2. حساب مساحة التخزين في المتصفح
                if (navigator.storage && navigator.storage.estimate) {
                    const estimate = await navigator.storage.estimate();
                    const usageMB = (estimate.usage / (1024 * 1024)).toFixed(2);
                    const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(2);
                    const percent = ((estimate.usage / estimate.quota) * 100).toFixed(1);
                    
                    setStorageInfo({ usage: usageMB, quota: quotaMB, percent: percent });
                }

            } catch (error) {
                console.error(error);
                showToast("حدث خطأ في تحميل الإعدادات", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchSettingsData();
    }, [userId]);

    // ==========================================
    // العمليات: تحديث البيانات
    // ==========================================
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            // التحقق من أن رقم الهاتف غير مسجل لمستخدم آخر
            const existingUser = await window.db.users.where('phone').equals(formData.phone.trim()).first();
            if (existingUser && existingUser.id !== userId) {
                return showToast("رقم الهاتف هذا مستخدم لحساب آخر", "error");
            }

            // تحديث جدول العيادة
            await window.db.clinic_info.update(formData.clinic_id, {
                clinic_name: formData.clinic_name,
                updated_at: new Date().toISOString()
            });

            // تحديث جدول المستخدم
            await window.db.users.update(userId, {
                name: formData.owner_name,
                phone: formData.phone.trim(),
                password: formData.password
            });

            // تحديث الجلسة
            const session = JSON.parse(localStorage.getItem('MentraClinics_Session'));
            session.name = formData.owner_name;
            session.clinic_name = formData.clinic_name;
            localStorage.setItem('MentraClinics_Session', JSON.stringify(session));

            showToast("تم حفظ الإعدادات بنجاح", "success");
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error(error);
            showToast("فشل تحديث البيانات", "error");
        }
    };

    // ==========================================
    // العمليات: منطقة الخطر (الحذف)
    // ==========================================
    const openDangerModal = (type) => {
        setDeleteType(type);
        setConfirmText('');
        setIsConfirmModalOpen(true);
    };

    const handleExecuteDelete = async (e) => {
        e.preventDefault();
        if (confirmText !== 'مسح') {
            return showToast('الرجاء كتابة كلمة "مسح" لتأكيد العملية', 'error');
        }

        try {
            if (deleteType === 'transactions') {
                await Promise.all([
                    window.db.patients.clear(),
                    window.db.appointments.clear(),
                    window.db.visits.clear(),
                    window.db.vitals.clear(),
                    window.db.prescriptions.clear(),
                    window.db.prescription_items.clear(),
                    window.db.invoices.clear(),
                    window.db.expenses.clear(),
                    window.db.attachments.clear()
                ]);
                showToast("تم مسح بيانات التشغيل والمرضى بنجاح", "success");
                setIsConfirmModalOpen(false);
            } 
            else if (deleteType === 'factory_reset') {
                await window.db.delete();
                localStorage.clear();
                alert("تم إعادة ضبط المصنع ومسح النظام بالكامل. سيتم تسجيل خروجك الآن.");
                window.location.replace('subscriptions.html');
            }
        } catch (error) {
            console.error(error);
            showToast("حدث خطأ تقني أثناء محاولة الحذف", "error");
        }
    };

    // ==========================================
    // واجهة المستخدم (UI) - Mobile Optimized
    // ==========================================
    if (loading) return <div className="flex justify-center p-20"><i className="fas fa-spinner fa-spin text-4xl text-[#0EA5E9]"></i></div>;

    return (
        <div className="space-y-4 md:space-y-6 animate-view pb-24 md:pb-10 max-w-5xl mx-auto">
            
            {/* الهيدر */}
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm text-center md:text-right">
                <h2 className="text-xl md:text-2xl font-black text-[#0284C7] flex items-center justify-center md:justify-start gap-2">
                    <i className="fas fa-cog"></i> إعدادات العيادة
                </h2>
                <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">إدارة بيانات الملف الشخصي، التخزين، والأمان</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                
                {/* 
                    قائمة التبويبات (Tabs)
                    - في الموبايل: شريط تمرير أفقي
                    - في الكمبيوتر: قائمة جانبية عمودية
                */}
                <div className="w-full md:w-64 shrink-0 flex overflow-x-auto hide-scrollbar gap-2 md:flex-col md:space-y-2 pb-2 md:pb-0 snap-x">
                    <button onClick={() => setActiveTab('profile')} className={`snap-start shrink-0 text-center md:text-right px-4 md:px-5 py-3 md:py-4 rounded-xl font-black transition-all flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 text-xs md:text-base ${activeTab === 'profile' ? 'bg-[#0284C7] text-white shadow-md shadow-sky-500/30' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}>
                        <i className="fas fa-clinic-medical text-lg md:text-base"></i> <span className="whitespace-nowrap">بيانات العيادة</span>
                    </button>
                    <button onClick={() => setActiveTab('storage')} className={`snap-start shrink-0 text-center md:text-right px-4 md:px-5 py-3 md:py-4 rounded-xl font-black transition-all flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 text-xs md:text-base ${activeTab === 'storage' ? 'bg-[#0284C7] text-white shadow-md shadow-sky-500/30' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}>
                        <i className="fas fa-database text-lg md:text-base"></i> <span className="whitespace-nowrap">التخزين والأمان</span>
                    </button>
                    <button onClick={() => setActiveTab('danger')} className={`snap-start shrink-0 text-center md:text-right px-4 md:px-5 py-3 md:py-4 rounded-xl font-black transition-all flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 text-xs md:text-base ${activeTab === 'danger' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' : 'bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-100'}`}>
                        <i className="fas fa-exclamation-triangle text-lg md:text-base"></i> <span className="whitespace-nowrap">منطقة الخطر</span>
                    </button>
                </div>

                {/* محتوى الإعدادات */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-8">
                    
                    {/* التبويب الأول: بيانات العيادة */}
                    {activeTab === 'profile' && (
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
                    )}

                    {/* التبويب الثاني: التخزين */}
                    {activeTab === 'storage' && (
                        <div className="animate-view space-y-4 md:space-y-6">
                            <div className="flex items-center gap-3 mb-4 md:mb-6 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-lg md:text-xl shrink-0"><i className="fas fa-hdd"></i></div>
                                <div>
                                    <h3 className="font-black text-base md:text-lg text-slate-700">تخزين المتصفح المحلي</h3>
                                    <p className="text-[10px] md:text-xs font-bold text-slate-400">تحليل مساحة البيانات على جهازك</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 md:p-6">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <span className="text-xl md:text-2xl font-black text-slate-700">{storageInfo.usage} MB</span>
                                        <span className="text-[10px] md:text-xs font-bold text-slate-400 block mt-1">مستخدمة من أصل {storageInfo.quota} MB متاحة</span>
                                    </div>
                                    <span className="text-base md:text-lg font-black text-emerald-500">{storageInfo.percent}%</span>
                                </div>
                                
                                <div className="w-full bg-slate-200 rounded-full h-2 md:h-3 mb-4 overflow-hidden">
                                    <div className="bg-emerald-500 h-2 md:h-3 rounded-full transition-all duration-1000" style={{ width: `${storageInfo.percent}%` }}></div>
                                </div>
                                
                                <p className="text-[10px] md:text-xs font-semibold text-slate-500 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                                    <i className="fas fa-info-circle text-[#0EA5E9] ml-1"></i>
                                    نظراً لأن النظام يعمل بتقنية الـ Offline، فإن سعة التخزين تعتمد على مساحة جهازك. هذه المساحة تكفي لمئات الآلاف من الروشتات والمرضى.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* التبويب الثالث: منطقة الخطر */}
                    {activeTab === 'danger' && (
                        <div className="animate-view space-y-4 md:space-y-6">
                            <div className="flex items-center gap-3 mb-4 md:mb-6 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-lg md:text-xl shrink-0"><i className="fas fa-skull-crossbones"></i></div>
                                <div>
                                    <h3 className="font-black text-base md:text-lg text-rose-600">منطقة الخطر (Danger Zone)</h3>
                                    <p className="text-[10px] md:text-xs font-bold text-rose-400">تحذير: العمليات هنا نهائية!</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                                {/* كارت تفريغ الداتا */}
                                <div className="border-2 border-amber-200 bg-amber-50 rounded-2xl p-4 md:p-6 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-black text-amber-700 text-base md:text-lg mb-2"><i className="fas fa-eraser"></i> تفريغ التشغيل</h4>
                                        <p className="text-[10px] md:text-xs font-bold text-amber-600/80 mb-4 md:mb-6 leading-relaxed">
                                            حذف (المرضى، المواعيد، الكشوفات، والفواتير) بالكامل. والاحتفاظ ببيانات العيادة ودليل الأدوية.
                                        </p>
                                    </div>
                                    <button onClick={() => openDangerModal('transactions')} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-3 md:py-3.5 rounded-xl transition-colors active:scale-95 text-sm md:text-base">
                                        تفريغ النظام
                                    </button>
                                </div>

                                {/* كارت ضبط المصنع */}
                                <div className="border-2 border-rose-200 bg-rose-50 rounded-2xl p-4 md:p-6 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-black text-rose-700 text-base md:text-lg mb-2"><i className="fas fa-radiation"></i> ضبط المصنع</h4>
                                        <p className="text-[10px] md:text-xs font-bold text-rose-600/80 mb-4 md:mb-6 leading-relaxed">
                                            تدمير قاعدة البيانات بأكملها (حذف جميع المرضى، الأدوية، الإعدادات) وتسجيل الخروج.
                                        </p>
                                    </div>
                                    <button onClick={() => openDangerModal('factory_reset')} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3 md:py-3.5 rounded-xl transition-colors shadow-lg shadow-rose-500/30 active:scale-95 text-sm md:text-base">
                                        إعادة ضبط المصنع
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* نافذة التأكيد لمنطقة الخطر (مجهزة للموبايل) */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-0 md:p-4">
                    <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl animate-view overflow-y-auto max-h-[90vh] pb-safe">
                        <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-rose-50 rounded-t-3xl md:rounded-t-2xl sticky top-0 z-10">
                            <h3 className="text-base md:text-lg font-black text-rose-600">تأكيد عملية الحذف</h3>
                            <button onClick={() => setIsConfirmModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><i className="fas fa-times"></i></button>
                        </div>
                        <form onSubmit={handleExecuteDelete} className="p-5 md:p-6 text-center space-y-4">
                            <i className="fas fa-exclamation-triangle text-4xl md:text-5xl text-rose-500 mb-2 animate-pulse"></i>
                            <p className="text-xs md:text-sm font-bold text-slate-700 mb-4 leading-relaxed">
                                هذه العملية نهائية ولا يمكن التراجع عنها. لتأكيد طلبك، يرجى كتابة كلمة <span className="text-rose-600 font-black px-2 py-1 bg-rose-50 rounded border border-rose-200">مسح</span> في المربع أدناه:
                            </p>
                            <input 
                                type="text" 
                                required 
                                placeholder="اكتب هنا..." 
                                value={confirmText} 
                                onChange={e => setConfirmText(e.target.value)} 
                                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-center text-sm md:text-base font-black focus:border-rose-500 focus:ring-rose-500 outline-none" 
                            />
                            <div className="flex flex-col md:flex-row gap-3 pt-2">
                                <button type="submit" disabled={confirmText !== 'مسح'} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3.5 rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-rose-500/30 active:scale-95">
                                    تأكيد الحذف نهائياً
                                </button>
                                <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-3.5 rounded-xl transition-colors active:scale-95">
                                    تراجع
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* ====== إعلان النسخة المدفوعة ====== */}
            <div className="mt-6 md:mt-8 bg-gradient-to-r from-[#0f766e] to-[#0284c7] rounded-3xl p-5 md:p-6 text-white shadow-lg relative overflow-hidden text-right" dir="rtl">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mt-20 blur-2xl"></div>
                <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-teal-400/20 rounded-full blur-xl"></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5 md:gap-6">
                    <div className="flex flex-col md:flex-row items-center text-center md:text-right gap-4 w-full lg:w-auto">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner animate-pulse">
                            <i className="fas fa-stethoscope text-teal-200"></i>
                        </div>
                        <div>
                            <h4 className="font-black text-lg md:text-xl tracking-wide">ارتقِ بإدارة عيادتك للمستوى الاحترافي</h4>
                            <p className="text-teal-50 text-xs md:text-sm mt-1 font-medium opacity-90 leading-relaxed">
                                أنت تستخدم النسخة المحدودة (Lite). تواصل معنا الآن لتفعيل إدارة ملفات المرضى الإلكترونية والروشتات الذكية.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <a href="tel:01211934816" className="w-full sm:w-auto justify-center bg-amber-400 text-slate-900 px-5 py-3.5 md:py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-amber-300 transition-all active:scale-95 shadow-md">
                            <i className="fas fa-shopping-cart text-base"></i>
                            <span>طلب النسخة (المبيعات)</span>
                        </a>
                        <a href="https://wa.me/201211934816" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto justify-center bg-white/10 backdrop-blur-sm border border-white/25 px-5 py-3.5 md:py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/20 transition-all active:scale-95">
                            <i className="fab fa-whatsapp text-emerald-400 text-base"></i>
                            <span>الدعم الفني</span>
                        </a>
                    </div>
                </div>
            </div>

        </div>
    );
};