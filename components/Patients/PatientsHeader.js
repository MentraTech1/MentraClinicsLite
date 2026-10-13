window.PatientsHeader = function({ openAddModal, searchQuery, setSearchQuery }) {
    return (
        <>
            <div className="flex flex-col gap-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm md:flex-row md:justify-between md:items-center">
                <div className="text-center md:text-right">
                    <h2 className="text-xl md:text-2xl font-black text-[#0284C7] flex items-center justify-center md:justify-start gap-2">
                        <i className="fas fa-users"></i> سجل المرضى
                    </h2>
                    <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">إدارة الملفات الطبية، والبحث السريع</p>
                </div>
                <button onClick={openAddModal} className="w-full md:w-auto bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-6 py-3.5 md:py-3 rounded-xl font-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 active:scale-95 text-sm md:text-base">
                    <i className="fas fa-user-plus"></i> إضافة مريض جديد
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative z-10">
                <div className="relative">
                    <input type="text" placeholder="ابحث باسم المريض أو رقم الهاتف..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3.5 md:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none transition-colors" />
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
                </div>
            </div>
        </>
    );
};