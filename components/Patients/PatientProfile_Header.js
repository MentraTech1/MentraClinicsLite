window.PatientProfile_Header = function({ patient, calculateAge, goBack, setIsBookingModalOpen, stats }) {
    return (
        <div className="relative">
            <div className="bg-gradient-to-br from-slate-900 via-[#0F172A] to-[#0284C7] rounded-3xl p-8 pb-20 text-white relative overflow-hidden shadow-xl border border-slate-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
                
                <div className="absolute top-6 right-6 flex gap-2 z-20">
                    <button onClick={() => setIsBookingModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95">
                        <i className="fas fa-calendar-plus"></i> حجز موعد
                    </button>
                    <button onClick={goBack} className="bg-white/10 hover:bg-white/25 border border-white/10 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all backdrop-blur-md active:scale-95">
                        <i className="fas fa-arrow-right"></i> العودة للسجل
                    </button>
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 mt-16 md:mt-6">
                    <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center font-bold text-white text-4xl shadow-[0_0_30px_rgba(0,0,0,0.3)] border-4 border-white/20 shrink-0 relative ${patient.gender === 'male' ? 'bg-gradient-to-b from-blue-400 to-blue-600' : 'bg-gradient-to-b from-pink-400 to-pink-600'}`}>
                        <i className={`fas ${patient.gender === 'male' ? 'fa-male' : 'fa-female'}`}></i>
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                    </div>
                    <div className="text-center md:text-right">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">{patient.name}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4 text-xs font-bold text-sky-100">
                            <span className="bg-slate-900/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2"><i className="fas fa-calendar-alt text-sky-400"></i> {calculateAge(patient.birth_date)}</span>
                            <span className="bg-slate-900/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2"><i className="fas fa-phone-alt text-emerald-400"></i> {patient.phone || 'لا يوجد هاتف'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* الإحصائيات العائمة */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 md:px-8 -mt-10 relative z-20">
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center text-xl shrink-0"><i className="fas fa-stethoscope"></i></div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 mb-0.5">سجل الكشوفات</p>
                        <h4 className="text-2xl font-black text-slate-800">{stats.visitsCount} <span className="text-sm text-slate-400 font-bold">زيارة</span></h4>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl shrink-0"><i className="fas fa-clock"></i></div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 mb-0.5">مواعيد معلقة</p>
                        <h4 className="text-2xl font-black text-slate-800">{stats.appsCount} <span className="text-sm text-slate-400 font-bold">موعد</span></h4>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shrink-0"><i className="fas fa-wallet"></i></div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 mb-0.5">إجمالي المدفوعات</p>
                        <h4 className="text-2xl font-black text-slate-800">{stats.totalRevenue} <span className="text-sm text-slate-400 font-bold">ج.م</span></h4>
                    </div>
                </div>
            </div>
        </div>
    );
};