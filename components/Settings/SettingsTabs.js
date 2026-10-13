window.SettingsTabs = function({ activeTab, setActiveTab }) {
    return (
        <div className="w-full md:w-64 shrink-0 flex overflow-x-auto hide-scrollbar gap-2 md:flex-col md:space-y-2 pb-2 md:pb-0 snap-x">
            <button onClick={() => setActiveTab('profile')} className={`snap-start shrink-0 text-center md:text-right px-4 md:px-5 py-3 md:py-4 rounded-xl font-black transition-all flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 text-xs md:text-base ${activeTab === 'profile' ? 'bg-[#0284C7] text-white shadow-md shadow-sky-500/30' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}>
                <i className="fas fa-clinic-medical text-lg md:text-base"></i> <span className="whitespace-nowrap">بيانات العيادة</span>
            </button>
            
            {/* التبويب الجديد لمفتاح الأمان */}
            <button onClick={() => setActiveTab('security')} className={`snap-start shrink-0 text-center md:text-right px-4 md:px-5 py-3 md:py-4 rounded-xl font-black transition-all flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 text-xs md:text-base ${activeTab === 'security' ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}>
                <i className="fas fa-key text-lg md:text-base"></i> <span className="whitespace-nowrap">مفتاح الأمان</span>
            </button>

            <button onClick={() => setActiveTab('storage')} className={`snap-start shrink-0 text-center md:text-right px-4 md:px-5 py-3 md:py-4 rounded-xl font-black transition-all flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 text-xs md:text-base ${activeTab === 'storage' ? 'bg-[#0284C7] text-white shadow-md shadow-sky-500/30' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}>
                <i className="fas fa-database text-lg md:text-base"></i> <span className="whitespace-nowrap">التخزين والأمان</span>
            </button>
            <button onClick={() => setActiveTab('danger')} className={`snap-start shrink-0 text-center md:text-right px-4 md:px-5 py-3 md:py-4 rounded-xl font-black transition-all flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 text-xs md:text-base ${activeTab === 'danger' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30' : 'bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-100'}`}>
                <i className="fas fa-exclamation-triangle text-lg md:text-base"></i> <span className="whitespace-nowrap">منطقة الخطر</span>
            </button>
        </div>
    );
};