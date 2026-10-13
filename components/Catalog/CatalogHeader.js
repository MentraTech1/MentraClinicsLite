window.CatalogHeader = function({ openAddModal, handleExcelUpload, isImporting }) {
    return (
        <div className="flex flex-col gap-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm md:flex-row md:justify-between md:items-center">
            <div className="text-center md:text-right">
                <h2 className="text-xl md:text-2xl font-black text-[#0284C7] flex items-center justify-center md:justify-start gap-2">
                    <i className="fas fa-pills"></i> الدليل الطبي (Catalog)
                </h2>
                <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">إدارة الأدوية، التحاليل، والخدمات الخاصة بالعيادة</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* Input مخفي لرفع الملف */}
                <input type="file" id="excel-upload" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleExcelUpload} disabled={isImporting} />
                
                <button onClick={() => document.getElementById('excel-upload').click()} disabled={isImporting} className="w-full sm:w-auto bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white px-5 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 text-sm">
                    {isImporting ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-file-excel"></i>}
                    استيراد إكسيل
                </button>

                <button onClick={openAddModal} className="w-full sm:w-auto bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] hover:from-sky-700 hover:to-[#0284C7] text-white px-6 py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 active:scale-95 text-sm">
                    <i className="fas fa-plus"></i> صنف جديد
                </button>
            </div>
        </div>
    );
};