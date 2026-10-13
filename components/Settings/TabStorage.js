window.TabStorage = function({ storageInfo }) {
    return (
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
    );
};