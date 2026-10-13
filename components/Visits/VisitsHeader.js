
window.VisitsHeader = function({ openNewVisit }) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-center md:text-right w-full md:w-auto">
                <h2 className="text-xl md:text-2xl font-black text-[#0284C7] flex items-center justify-center md:justify-start gap-2">
                    <i className="fas fa-stethoscope"></i> سجل الكشوفات والتقارير
                </h2>
                <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">كتابة الروشتات، التشخيص، وتاريخ الزيارات</p>
            </div>
            <button onClick={openNewVisit} className="w-full md:w-auto bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-6 py-3.5 md:py-3 rounded-xl font-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 active:scale-95 text-sm md:text-base">
                <i className="fas fa-file-medical"></i> كشف / روشتة جديدة
            </button>
        </div>
    );
};