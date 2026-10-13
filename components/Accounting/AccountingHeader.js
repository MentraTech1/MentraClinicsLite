window.AccountingHeader = function({ setIsExpenseModalOpen, setIsInvoiceModalOpen, setPatientSearchTerm }) {
    return (
        <div className="flex flex-col gap-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm md:flex-row md:justify-between md:items-center">
            <div className="text-center md:text-right">
                <h2 className="text-xl md:text-2xl font-black text-[#0284C7] flex items-center justify-center md:justify-start gap-2">
                    <i className="fas fa-file-invoice-dollar"></i> الحسابات والماليات
                </h2>
                <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">إدارة الإيرادات، المصروفات، وحساب الأرباح</p>
            </div>
            <div className="flex flex-row md:flex-row w-full md:w-auto gap-2">
                <button onClick={() => setIsExpenseModalOpen(true)} className="flex-1 md:flex-none bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white px-3 py-3 md:px-5 rounded-xl font-bold transition-colors flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 border border-rose-100 active:scale-95 text-xs md:text-sm">
                    <i className="fas fa-minus-circle text-lg md:text-base"></i> مصروف
                </button>
                <button onClick={() => { setIsInvoiceModalOpen(true); setPatientSearchTerm(''); }} className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-3 md:px-5 rounded-xl font-bold transition-colors flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 text-xs md:text-sm">
                    <i className="fas fa-plus-circle text-lg md:text-base"></i> إيراد
                </button>
            </div>
        </div>
    );
};