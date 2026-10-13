window.CatalogStats = function({ stats }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><i className="fas fa-list-ul"></i></div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400">إجمالي الأصناف</p>
                    <h4 className="text-base md:text-lg font-black text-slate-700">{stats.total}</h4>
                </div>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0"><i className="fas fa-pills"></i></div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400">أدوية وعقاقير</p>
                    <h4 className="text-base md:text-lg font-black text-emerald-600">{stats.drugs}</h4>
                </div>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0"><i className="fas fa-flask"></i></div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400">تحاليل معملية</p>
                    <h4 className="text-base md:text-lg font-black text-purple-600">{stats.labs}</h4>
                </div>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0"><i className="fas fa-x-ray"></i></div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400">أشعة وخدمات</p>
                    <h4 className="text-base md:text-lg font-black text-amber-600">{stats.xrays}</h4>
                </div>
            </div>
        </div>
    );
};