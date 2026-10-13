window.AccountingFilters = function({ filters, setFilters }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600 font-black text-sm">
                <i className="fas fa-calendar-alt text-[#0EA5E9] text-lg"></i> 
                <span>تحليل الماليـات للفـترة المـحـددة:</span>
            </div>
            <div className="flex w-full md:w-auto gap-2">
                <div className="relative w-1/2 md:w-auto">
                    <span className="absolute -top-2 right-2 bg-white px-1 text-[10px] font-bold text-slate-400">من</span>
                    <input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                </div>
                <div className="relative w-1/2 md:w-auto">
                    <span className="absolute -top-2 right-2 bg-white px-1 text-[10px] font-bold text-slate-400">إلى</span>
                    <input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                </div>
            </div>
        </div>
    );
};