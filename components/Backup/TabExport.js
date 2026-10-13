window.TabExport = function({ handleBackup, loading, fileInputRef, handleFileUpload, logs, logsEndRef }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-view">
            <div className="bg-white p-5 md:p-8 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col justify-between">
                <div>
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center text-3xl md:text-4xl mx-auto mb-4"><i className="fas fa-file-export"></i></div>
                    <h3 className="text-lg md:text-xl font-black text-slate-700 mb-2">نسخة احتياطية (Backup)</h3>
                    <p className="text-xs md:text-sm font-bold text-slate-500 leading-relaxed mb-6">تقوم هذه العملية بتجميع وتشفير كافة بيانات العيادة في ملف واحد (JSON). يرجى الاحتفاظ بالملف في مكان آمن.</p>
                </div>
                <button onClick={handleBackup} disabled={loading} className="w-full bg-[#0284C7] hover:bg-sky-700 text-white font-black py-4 rounded-xl shadow-lg shadow-sky-500/30 transition-all text-base md:text-lg disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                    {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-download"></i>} بدء التصدير وتحميل الملف
                </button>
            </div>

            <div className="bg-white p-5 md:p-8 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col justify-between">
                <div>
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl md:text-4xl mx-auto mb-4"><i className="fas fa-file-import"></i></div>
                    <h3 className="text-lg md:text-xl font-black text-slate-700 mb-2">استعادة البيانات (Restore)</h3>
                    <p className="text-xs md:text-sm font-bold text-slate-500 leading-relaxed mb-4">قم برفع ملف الـ JSON الخاص بنسختك الاحتياطية هنا لاستعادة العيادة بالكامل في حالة تغيير المتصفح أو الجهاز.</p>
                    <div className="bg-rose-50 text-rose-600 text-[10px] md:text-xs font-bold p-3 rounded-lg border border-rose-100 mb-6"><i className="fas fa-exclamation-triangle"></i> الاستعادة ستقوم بمسح البيانات الحالية واستبدالها ببيانات الملف.</div>
                </div>
                <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileInputRef.current.click()} disabled={loading} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-300 border-dashed font-black py-4 rounded-xl transition-all text-base md:text-lg disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                    <i className="fas fa-upload"></i> اختر ملف الاستعادة (JSON)
                </button>
            </div>

            <div className="md:col-span-2 bg-[#0B1120] rounded-2xl overflow-hidden shadow-xl border border-slate-800">
                <div className="bg-slate-900 px-4 py-3 flex items-center gap-2 border-b border-slate-800">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-500 text-[10px] md:text-xs font-bold ml-2 dir-ltr">MentraClinics System Logs</span>
                </div>
                <div className="p-4 h-40 md:h-48 overflow-y-auto font-mono text-xs md:text-sm text-emerald-400 dir-ltr text-left">
                    {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    );
};