window.AppointmentsStats = function({ stats }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white p-3 md:p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center text-center md:text-right gap-2 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center text-lg md:text-xl"><i className="fas fa-list-ul"></i></div>
                <div>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400">إجمالي المواعيد</p>
                    <h4 className="text-lg md:text-xl font-black text-slate-700">{stats.totalAppts}</h4>
                </div>
            </div>
            <div className="bg-white p-3 md:p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center text-center md:text-right gap-2 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-lg md:text-xl"><i className="fas fa-check-double"></i></div>
                <div>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400">المكتملة</p>
                    <h4 className="text-lg md:text-xl font-black text-slate-700">{stats.completedAppts}</h4>
                </div>
            </div>
            <div className="col-span-2 md:col-span-1 bg-gradient-to-l from-emerald-500 to-teal-400 p-4 md:p-5 rounded-xl shadow-lg flex items-center justify-center md:justify-start gap-4 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl border border-white/30 hidden md:flex"><i className="fas fa-hand-holding-usd"></i></div>
                <div className="text-center md:text-right">
                    <p className="text-[10px] md:text-xs font-bold text-emerald-50 mb-1">أرباح الكشوفات (بالنطاق)</p>
                    <h4 className="text-2xl font-black">{stats.totalRevenue} <span className="text-sm font-bold">ج.م</span></h4>
                </div>
            </div>
        </div>
    );
};