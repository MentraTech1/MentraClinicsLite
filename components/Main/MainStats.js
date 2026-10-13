window.MainStats = function({ stats }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center md:justify-between text-center md:text-right hover:shadow-md transition-shadow gap-2 md:gap-0">
                <div className="order-2 md:order-1">
                    <p className="text-slate-400 text-[10px] md:text-sm font-bold mb-1">إجمالي المرضى</p>
                    <h3 className="text-2xl md:text-3xl font-black text-[#0284C7]">{stats.patientsCount}</h3>
                </div>
                <div className="order-1 md:order-2 w-10 h-10 md:w-14 md:h-14 bg-sky-50 rounded-full flex items-center justify-center text-sky-500 text-lg md:text-2xl shrink-0">
                    <i className="fas fa-users"></i>
                </div>
            </div>

            <div className="bg-gradient-to-l from-[#0284C7] to-[#0EA5E9] p-4 md:p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center md:justify-between text-center md:text-right text-white gap-2 md:gap-0">
                <div className="order-2 md:order-1">
                    <p className="text-sky-100 text-[10px] md:text-sm font-bold mb-1">حجوزات اليوم</p>
                    <h3 className="text-2xl md:text-3xl font-black">{stats.todayApptsCount}</h3>
                </div>
                <div className="order-1 md:order-2 w-10 h-10 md:w-14 md:h-14 bg-white/20 rounded-full flex items-center justify-center text-white text-lg md:text-2xl border border-white/30 shrink-0">
                    <i className="fas fa-calendar-day"></i>
                </div>
            </div>

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
    );
};