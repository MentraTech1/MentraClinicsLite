window.AppointmentsFilters = function({ filters, setFilters }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3 relative z-10">
            <div className="relative w-full">
                <input type="text" placeholder="بحث باسم المريض أو الهاتف..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none transition-colors" />
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            </div>
            <div className="flex flex-col md:flex-row gap-3 w-full">
                <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="w-full md:w-1/3 bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl focus:ring-[#0EA5E9] focus:border-[#0EA5E9] block p-3 font-bold outline-none cursor-pointer">
                    <option value="all">جميع الحالات</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="completed">تم الكشف</option>
                    <option value="cancelled">ملغي</option>
                </select>
                <div className="flex gap-2 w-full md:w-2/3">
                    <div className="w-1/2 relative">
                        <span className="absolute -top-2 right-2 bg-white px-1 text-[10px] font-bold text-slate-400">من</span>
                        <input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-600 outline-none" />
                    </div>
                    <div className="w-1/2 relative">
                        <span className="absolute -top-2 right-2 bg-white px-1 text-[10px] font-bold text-slate-400">إلى</span>
                        <input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-600 outline-none" />
                    </div>
                </div>
            </div>
        </div>
    );
};