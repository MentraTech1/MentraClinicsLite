window.BackupHeader = function({ activeTab, setActiveTab }) {
    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm text-center md:text-right flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-xl md:text-2xl font-black text-[#0284C7] flex items-center justify-center md:justify-start gap-2">
                    <i className="fas fa-database"></i> إدارة قواعد البيانات
                </h2>
                <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">نسخ واستعادة بيانات العيادة بأمان وسرية تامة</p>
            </div>
            <div className="flex w-full md:w-auto bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setActiveTab('export')} className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'export' ? 'bg-white text-[#0284C7] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    النسخ والاستعادة
                </button>
                <button onClick={() => setActiveTab('history')} className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'history' ? 'bg-white text-[#0284C7] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    الأرشيف الداخلي
                </button>
            </div>
        </div>
    );
};