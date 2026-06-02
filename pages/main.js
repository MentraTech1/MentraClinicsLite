window.Module_Main = function({ clinicId, userId, showToast }) {
    const { useState, useEffect } = React;

    const [stats, setStats] = useState({
        patientsCount: 0,
        todayApptsCount: 0,
        visitsCount: 0
    });

    const [recentAppts, setRecentAppts] = useState([]);
    const [recentPatients, setRecentPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // دالة ذكية للتنقل بين الصفحات
    // ==========================================
     const navigateTo = (iconName) => {
        // التعديل السحري: إضافة كلمة nav ليتجاهل شعار العيادة ويبحث في الأزرار فقط!
        const btn = document.querySelector(`aside nav .fa-${iconName}`)?.closest('button');
        if (btn) {
            btn.click();
        } else {
            showToast("تعذر الانتقال للصفحة", "error");
        }
    };

    // ==========================================
    // جلب البيانات من قاعدة البيانات
    // ==========================================
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (!window.db) return;

                const today = new Date().toISOString().split('T')[0];

                // 1. جلب الإحصائيات (مفلترة للعيادة الحالية فقط)
                const pCount = await window.db.patients.where('user_id').equals(userId).count();
                const vCount = await window.db.visits.where('user_id').equals(userId).count();
                
                // جلب مواعيد اليوم
                const allClinicAppts = await window.db.appointments.where('user_id').equals(userId).toArray();
                const todayApptsFiltered = allClinicAppts.filter(appt => appt.date.startsWith(today));
                const tApptsCount = todayApptsFiltered.length;

                setStats({
                    patientsCount: pCount,
                    todayApptsCount: tApptsCount,
                    visitsCount: vCount
                });

                // 2. جلب أحدث 3 مواعيد اليوم
                const todayAppts = todayApptsFiltered.slice(0, 3);
                const apptsWithNames = await Promise.all(todayAppts.map(async (appt) => {
                    const patient = await window.db.patients.get(appt.patient_id);
                    return { ...appt, patient_name: patient ? patient.name : 'مريض محذوف' };
                }));
                setRecentAppts(apptsWithNames);

                // 3. جلب أحدث 3 مرضى مسجلين
                const allClinicPatients = await window.db.patients.where('user_id').equals(userId).toArray();
                const latestPatients = allClinicPatients.sort((a, b) => b.id - a.id).slice(0, 3);
                setRecentPatients(latestPatients);

            } catch (error) {
                console.error("خطأ في جلب بيانات الرئيسية:", error);
                showToast("حدث خطأ أثناء تحميل إحصائيات العيادة", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [userId]); 

    // ==========================================
    // تصميم الواجهة (UI) - Mobile Optimized
    // ==========================================
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-[#0EA5E9]">
                <i className="fas fa-circle-notch fa-spin text-4xl"></i>
            </div>
        );
    }

    return (
        // تم إضافة pb-24 لضمان عدم اختفاء المحتوى خلف شريط التنقل السفلي في الموبايل
        <div className="space-y-5 md:space-y-6 animate-view pb-24 md:pb-10 max-w-6xl mx-auto">
            
            {/* ====== قسم الإحصائيات (تخطيط ذكي للموبايل) ====== */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                
                {/* كارت إجمالي المرضى */}
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center md:justify-between text-center md:text-right hover:shadow-md transition-shadow gap-2 md:gap-0">
                    <div className="order-2 md:order-1">
                        <p className="text-slate-400 text-[10px] md:text-sm font-bold mb-1">إجمالي المرضى</p>
                        <h3 className="text-2xl md:text-3xl font-black text-[#0284C7]">{stats.patientsCount}</h3>
                    </div>
                    <div className="order-1 md:order-2 w-10 h-10 md:w-14 md:h-14 bg-sky-50 rounded-full flex items-center justify-center text-sky-500 text-lg md:text-2xl shrink-0">
                        <i className="fas fa-users"></i>
                    </div>
                </div>

                {/* كارت مواعيد اليوم */}
                <div className="bg-gradient-to-l from-[#0284C7] to-[#0EA5E9] p-4 md:p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center md:justify-between text-center md:text-right text-white gap-2 md:gap-0">
                    <div className="order-2 md:order-1">
                        <p className="text-sky-100 text-[10px] md:text-sm font-bold mb-1">حجوزات اليوم</p>
                        <h3 className="text-2xl md:text-3xl font-black">{stats.todayApptsCount}</h3>
                    </div>
                    <div className="order-1 md:order-2 w-10 h-10 md:w-14 md:h-14 bg-white/20 rounded-full flex items-center justify-center text-white text-lg md:text-2xl border border-white/30 shrink-0">
                        <i className="fas fa-calendar-day"></i>
                    </div>
                </div>

                {/* كارت إجمالي الكشوفات (يأخذ العرض بالكامل على الموبايل) */}
                <div className="col-span-2 md:col-span-1 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-slate-400 text-xs md:text-sm font-bold mb-1">إجمالي الكشوفات الطبية</p>
                        <h3 className="text-2xl md:text-3xl font-black text-emerald-600">{stats.visitsCount}</h3>
                    </div>
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 text-xl md:text-2xl shrink-0">
                        <i className="fas fa-stethoscope"></i>
                    </div>
                </div>
            </div>

            {/* ====== قسم الاختصارات السريعة (App-like Navigation) ====== */}
            <h3 className="font-bold text-slate-700 text-base md:text-lg flex items-center gap-2 mt-6 md:mt-8 mb-3 md:mb-4">
                <i className="fas fa-bolt text-amber-500"></i> الوصول السريع
            </h3>
            
            {/* في الموبايل تظهر 4 أزرار بجوار بعضها، في الكمبيوتر 4 أزرار أيضاً */}
            <div className="grid grid-cols-4 gap-2 md:gap-3">
                <button onClick={() => navigateTo('calendar-check')} className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2 md:gap-3 hover:border-[#0EA5E9] hover:bg-sky-50 transition-all active:scale-95 group shadow-sm text-center h-full">
                    <i className="fas fa-calendar-plus text-xl md:text-2xl text-slate-400 group-hover:text-[#0EA5E9]"></i>
                    <span className="font-bold text-[9px] md:text-sm text-slate-600 group-hover:text-[#0284C7] leading-tight">حجوزات</span>
                </button>
                <button onClick={() => navigateTo('users')} className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2 md:gap-3 hover:border-[#0EA5E9] hover:bg-sky-50 transition-all active:scale-95 group shadow-sm text-center h-full">
                    <i className="fas fa-user-injured text-xl md:text-2xl text-slate-400 group-hover:text-[#0EA5E9]"></i>
                    <span className="font-bold text-[9px] md:text-sm text-slate-600 group-hover:text-[#0284C7] leading-tight">سجل المرضى</span>
                </button>
                <button onClick={() => navigateTo('stethoscope')} className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2 md:gap-3 hover:border-[#0EA5E9] hover:bg-sky-50 transition-all active:scale-95 group shadow-sm text-center h-full">
                    <i className="fas fa-file-medical text-xl md:text-2xl text-slate-400 group-hover:text-[#0EA5E9]"></i>
                    <span className="font-bold text-[9px] md:text-sm text-slate-600 group-hover:text-[#0284C7] leading-tight">كشف وروشتة</span>
                </button>
                <button onClick={() => navigateTo('file-invoice-dollar')} className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2 md:gap-3 hover:border-emerald-500 hover:bg-emerald-50 transition-all active:scale-95 group shadow-sm text-center h-full">
                    <i className="fas fa-file-invoice-dollar text-xl md:text-2xl text-slate-400 group-hover:text-emerald-500"></i>
                    <span className="font-bold text-[9px] md:text-sm text-slate-600 group-hover:text-emerald-700 leading-tight">حسابات</span>
                </button>
            </div>

            {/* ====== القوائم المصغرة (Limit 3) ====== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pt-2 md:pt-4">
                
                {/* قائمة مواعيد اليوم */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 md:p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-[#0284C7] flex items-center gap-2 text-sm md:text-base">
                            <i className="fas fa-clock"></i> حجوزات اليوم ({recentAppts.length})
                        </h3>
                        <button onClick={() => navigateTo('calendar-check')} className="text-[10px] md:text-xs font-bold text-slate-500 hover:text-[#0EA5E9] bg-white px-3 py-1.5 rounded-full border border-slate-200 active:scale-95 shadow-sm">عرض الكل</button>
                    </div>
                    <div className="p-4 md:p-5 flex-1">
                        {recentAppts.length === 0 ? (
                            <div className="text-center text-slate-400 py-6 md:py-8">
                                <i className="fas fa-mug-hot text-3xl md:text-4xl mb-2 md:mb-3 opacity-50"></i>
                                <p className="font-bold text-xs md:text-sm">لا توجد مواعيد مجدولة لهذا اليوم</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentAppts.map(appt => (
                                    <div key={appt.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-sky-50 transition-colors bg-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold shrink-0 shadow-sm">
                                                {appt.patient_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs md:text-sm text-slate-700 truncate max-w-[120px] sm:max-w-[200px]">{appt.patient_name}</p>
                                                <p className="text-[10px] md:text-xs text-slate-500">{appt.type === 'new' ? 'كشف جديد' : 'استشارة'}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] md:text-[10px] px-2 py-1 rounded font-bold shrink-0 ${appt.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {appt.status === 'completed' ? 'تم الكشف' : 'قيد الانتظار'}
                                        </span>
                                    </div>
                                ))}
                                {stats.todayApptsCount > 3 && (
                                    <p className="text-center text-[10px] md:text-xs text-slate-400 mt-3 font-bold">+ {stats.todayApptsCount - 3} مواعيد أخرى</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* قائمة أحدث المرضى */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 md:p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-[#0284C7] flex items-center gap-2 text-sm md:text-base">
                            <i className="fas fa-user-plus"></i> أحدث المرضى المضافين
                        </h3>
                        <button onClick={() => navigateTo('users')} className="text-[10px] md:text-xs font-bold text-slate-500 hover:text-[#0EA5E9] bg-white px-3 py-1.5 rounded-full border border-slate-200 active:scale-95 shadow-sm">عرض الكل</button>
                    </div>
                    <div className="p-4 md:p-5 flex-1">
                        {recentPatients.length === 0 ? (
                            <div className="text-center text-slate-400 py-6 md:py-8">
                                <i className="fas fa-folder-open text-3xl md:text-4xl mb-2 md:mb-3 opacity-50"></i>
                                <p className="font-bold text-xs md:text-sm">لم يتم تسجيل أي مرضى حتى الآن</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentPatients.map(patient => (
                                    <div key={patient.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors bg-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold shrink-0 shadow-sm">
                                                <i className="fas fa-user"></i>
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs md:text-sm text-slate-700 truncate max-w-[120px] sm:max-w-[200px]">{patient.name}</p>
                                                <p className="text-[10px] md:text-xs text-slate-500 dir-ltr text-right">{patient.phone || 'بدون هاتف'}</p>
                                            </div>
                                        </div>
                                        <div className="text-left shrink-0">
                                            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold mb-0.5">تاريخ التسجيل</p>
                                            <p className="text-[10px] md:text-xs font-bold text-slate-600">{patient.created_at.split('T')[0]}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
            
            {/* ====== إعلان النسخة المدفوعة والدعم الفني ====== */}
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
                                أنت تستخدم النسخة المحدودة (Lite). تواصل معنا الآن لتفعيل إدارة ملفات المرضى الإلكترونية، والروشتات الذكية.
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
