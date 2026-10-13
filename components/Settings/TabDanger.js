window.TabDanger = function({ openDangerModal }) {
    return (
        <div className="animate-view space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 mb-4 md:mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-lg md:text-xl shrink-0"><i className="fas fa-skull-crossbones"></i></div>
                <div>
                    <h3 className="font-black text-base md:text-lg text-rose-600">منطقة الخطر (Danger Zone)</h3>
                    <p className="text-[10px] md:text-xs font-bold text-rose-400">تحذير: العمليات هنا نهائية!</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="border-2 border-amber-200 bg-amber-50 rounded-2xl p-4 md:p-6 flex flex-col justify-between">
                    <div>
                        <h4 className="font-black text-amber-700 text-base md:text-lg mb-2"><i className="fas fa-eraser"></i> تفريغ التشغيل</h4>
                        <p className="text-[10px] md:text-xs font-bold text-amber-600/80 mb-4 md:mb-6 leading-relaxed">
                            حذف (المرضى، المواعيد، الكشوفات، والفواتير) بالكامل. والاحتفاظ ببيانات العيادة ودليل الأدوية.
                        </p>
                    </div>
                    <button onClick={() => openDangerModal('transactions')} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-3 md:py-3.5 rounded-xl transition-colors active:scale-95 text-sm md:text-base">
                        تفريغ النظام
                    </button>
                </div>
                <div className="border-2 border-rose-200 bg-rose-50 rounded-2xl p-4 md:p-6 flex flex-col justify-between">
                    <div>
                        <h4 className="font-black text-rose-700 text-base md:text-lg mb-2"><i className="fas fa-radiation"></i> ضبط المصنع</h4>
                        <p className="text-[10px] md:text-xs font-bold text-rose-600/80 mb-4 md:mb-6 leading-relaxed">
                            تدمير قاعدة البيانات بأكملها (حذف جميع المرضى، الأدوية، الإعدادات) وتسجيل الخروج.
                        </p>
                    </div>
                    <button onClick={() => openDangerModal('factory_reset')} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3 md:py-3.5 rounded-xl transition-colors shadow-lg shadow-rose-500/30 active:scale-95 text-sm md:text-base">
                        إعادة ضبط المصنع
                    </button>
                </div>
            </div>
        </div>
    );
};