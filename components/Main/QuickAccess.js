window.QuickAccess = function({ navigateTo }) {
    return (
        <>
            <h3 className="font-bold text-slate-700 text-base md:text-lg flex items-center gap-2 mt-6 md:mt-8 mb-3 md:mb-4">
                <i className="fas fa-bolt text-amber-500"></i> الوصول السريع
            </h3>
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
        </>
    );
};