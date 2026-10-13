window.AppointmentsHeader = function({ openAddModal, activeTab, setActiveTab }) {
    return (
        <div className="flex flex-col gap-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm md:flex-row md:justify-between md:items-center">
            
            <div className="flex flex-col gap-3">
                <div className="text-center md:text-right">
                    <h2 className="text-xl md:text-2xl font-black text-[#0284C7] flex items-center justify-center md:justify-start gap-2">
                        <i className="fas fa-calendar-check"></i> إدارة الحجوزات
                    </h2>
                    <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">متابعة مواعيد المرضى والتقويم</p>
                </div>
                
                {/* أزرار التبويبات */}
                <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-fit mt-2">
                    <button onClick={() => setActiveTab('list')} className={`flex-1 md:w-32 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'list' ? 'bg-white text-[#0284C7] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <i className="fas fa-list-ul"></i> القائمة
                    </button>
                    <button onClick={() => setActiveTab('calendar')} className={`flex-1 md:w-32 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'calendar' ? 'bg-white text-[#0284C7] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <i className="far fa-calendar-alt"></i> التقويم
                    </button>
                </div>
            </div>

            <button onClick={openAddModal} className="w-full md:w-auto bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-6 py-3.5 md:py-3 rounded-xl font-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 active:scale-95 h-fit mt-auto md:mt-0">
                <i className="fas fa-plus"></i> حجز موعد جديد
            </button>
        </div>
    );
};