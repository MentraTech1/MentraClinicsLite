window.RecentLists = function({ recentAppts, recentPatients, stats, navigateTo }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pt-2 md:pt-4">
            {/* قائمة مواعيد اليوم */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:border-sky-100 transition-colors">
                <div className="p-4 md:p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-[#0284C7] flex items-center gap-2 text-sm md:text-base">
                        <i className="fas fa-clock"></i> حجوزات اليوم ({recentAppts.length})
                    </h3>
                    <button onClick={() => navigateTo('calendar-check')} className="text-[10px] md:text-xs font-bold text-slate-500 hover:text-[#0EA5E9] bg-white px-3 py-1.5 rounded-full border border-slate-200 active:scale-95 shadow-sm transition-all">عرض الكل</button>
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
                                <div key={appt.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-sky-50 transition-colors bg-white group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold shrink-0 shadow-sm group-hover:bg-[#0284C7] group-hover:text-white transition-colors">
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
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:border-sky-100 transition-colors">
                <div className="p-4 md:p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-[#0284C7] flex items-center gap-2 text-sm md:text-base">
                        <i className="fas fa-user-plus"></i> أحدث المرضى المضافين
                    </h3>
                    <button onClick={() => navigateTo('users')} className="text-[10px] md:text-xs font-bold text-slate-500 hover:text-[#0EA5E9] bg-white px-3 py-1.5 rounded-full border border-slate-200 active:scale-95 shadow-sm transition-all">عرض الكل</button>
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
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${patient.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                            <i className={`fas ${patient.gender === 'male' ? 'fa-male' : 'fa-female'}`}></i>
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs md:text-sm text-slate-700 truncate max-w-[120px] sm:max-w-[200px]">{patient.name}</p>
                                            <p className="text-[10px] md:text-xs text-slate-500 dir-ltr text-right">{patient.phone || 'بدون هاتف'}</p>
                                        </div>
                                    </div>
                                    <div className="text-left shrink-0">
                                        <p className="text-[9px] md:text-[10px] text-slate-400 font-bold mb-0.5">تاريخ التسجيل</p>
                                        {/* هنا تم إصلاح المشكلة عبر فحص وجود التاريخ قبل قصه */}
                                        <p className="text-[10px] md:text-xs font-bold text-slate-600">
                                            {patient.created_at ? patient.created_at.split('T')[0] : 'إضافة حديثة'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};