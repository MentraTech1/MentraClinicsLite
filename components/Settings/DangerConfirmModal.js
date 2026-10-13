window.DangerConfirmModal = function({ setIsConfirmModalOpen, handleExecuteDelete, confirmText, setConfirmText }) {
    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl animate-view overflow-y-auto max-h-[90vh] pb-safe">
                <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-rose-50 rounded-t-3xl md:rounded-t-2xl sticky top-0 z-10">
                    <h3 className="text-base md:text-lg font-black text-rose-600">تأكيد عملية الحذف</h3>
                    <button onClick={() => setIsConfirmModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><i className="fas fa-times"></i></button>
                </div>
                <form onSubmit={handleExecuteDelete} className="p-5 md:p-6 text-center space-y-4">
                    <i className="fas fa-exclamation-triangle text-4xl md:text-5xl text-rose-500 mb-2 animate-pulse"></i>
                    <p className="text-xs md:text-sm font-bold text-slate-700 mb-4 leading-relaxed">
                        هذه العملية نهائية ولا يمكن التراجع عنها. لتأكيد طلبك، يرجى كتابة كلمة <span className="text-rose-600 font-black px-2 py-1 bg-rose-50 rounded border border-rose-200">مسح</span> في المربع أدناه:
                    </p>
                    <input type="text" required placeholder="اكتب هنا..." value={confirmText} onChange={e => setConfirmText(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-center text-sm md:text-base font-black focus:border-rose-500 focus:ring-rose-500 outline-none" />
                    <div className="flex flex-col md:flex-row gap-3 pt-2">
                        <button type="submit" disabled={confirmText !== 'مسح'} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3.5 rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-rose-500/30 active:scale-95">
                            تأكيد الحذف نهائياً
                        </button>
                        <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-3.5 rounded-xl transition-colors active:scale-95">
                            تراجع
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};