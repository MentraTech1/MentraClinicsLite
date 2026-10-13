window.CatalogFilters = function({ filters, setFilters }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 relative z-10">
            <div className="relative flex-1">
                <input type="text" placeholder="ابحث باسم الدواء أو التحليل..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} className="w-full pl-10 pr-4 py-3 md:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none transition-colors" />
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            </div>
            <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="w-full md:w-48 bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl focus:border-[#0EA5E9] block p-3 md:p-2.5 font-bold outline-none cursor-pointer">
                <option value="all">جميع الأنواع</option>
                <option value="drug">أدوية (Drugs)</option>
                <option value="lab">تحاليل (Labs)</option>
                <option value="xray">أشعة (X-Ray)</option>
                <option value="service">خدمات (Services)</option>
            </select>
        </div>
    );
};