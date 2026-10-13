window.AccountingStats = function({ stats }) {
    const { useEffect, useRef } = React;
    const chartRef = useRef(null);
    let chartInstance = null;

    useEffect(() => {
        if (typeof window.Chart !== 'undefined' && chartRef.current) {
            // تدمير الرسم القديم إن وجد لمنع التكرار
            const ctx = chartRef.current.getContext('2d');
            if (window.accountingChartInstance) {
                window.accountingChartInstance.destroy();
            }

            // رسم بياني دائري (Doughnut)
            window.accountingChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['الإيرادات', 'المصروفات'],
                    datasets: [{
                        data: [stats.revenue, stats.expenses],
                        backgroundColor: ['#10B981', '#F43F5E'], // Emerald, Rose
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) { return ' ' + context.raw.toLocaleString() + ' ج.م'; }
                            }
                        }
                    }
                }
            });
        }

        return () => {
            if (window.accountingChartInstance) {
                window.accountingChartInstance.destroy();
            }
        };
    }, [stats.revenue, stats.expenses]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            
            {/* بطاقات الأرقام */}
            <div className="md:col-span-2 grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-emerald-50 p-4 md:p-6 rounded-2xl border border-emerald-100 flex flex-col md:flex-row items-center text-center md:text-right gap-3">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center text-lg md:text-2xl shadow-md shrink-0"><i className="fas fa-arrow-down"></i></div>
                    <div>
                        <p className="text-[10px] md:text-xs font-bold text-emerald-700">إجمالي الإيرادات</p>
                        <h4 className="text-lg md:text-2xl font-black text-emerald-600 mt-1">{stats.revenue.toLocaleString()} <span className="text-[10px] md:text-sm">ج.م</span></h4>
                    </div>
                </div>
                
                <div className="bg-rose-50 p-4 md:p-6 rounded-2xl border border-rose-100 flex flex-col md:flex-row items-center text-center md:text-right gap-3">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-rose-500 text-white rounded-full flex items-center justify-center text-lg md:text-2xl shadow-md shrink-0"><i className="fas fa-arrow-up"></i></div>
                    <div>
                        <p className="text-[10px] md:text-xs font-bold text-rose-700">إجمالي المصروفات</p>
                        <h4 className="text-lg md:text-2xl font-black text-rose-600 mt-1">{stats.expenses.toLocaleString()} <span className="text-[10px] md:text-sm">ج.م</span></h4>
                    </div>
                </div>
                
                <div className={`col-span-2 p-5 md:p-6 rounded-2xl border flex items-center justify-center md:justify-start gap-4 text-white shadow-lg ${stats.netProfit >= 0 ? 'bg-gradient-to-l from-[#0284C7] to-[#0EA5E9] border-sky-400' : 'bg-gradient-to-l from-slate-700 to-slate-500 border-slate-400'}`}>
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-full flex items-center justify-center text-xl md:text-2xl border border-white/30 shrink-0"><i className="fas fa-wallet"></i></div>
                    <div className="text-right">
                        <p className="text-[11px] md:text-xs font-bold text-sky-100">صافي الربح بالفترة المحددة</p>
                        <h4 className="text-2xl md:text-3xl font-black mt-1">{stats.netProfit.toLocaleString()} <span className="text-xs font-bold">ج.م</span></h4>
                    </div>
                </div>
            </div>

            {/* الرسم البياني الدائري */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center relative min-h-[200px]">
                <p className="absolute top-4 right-4 text-xs font-bold text-slate-500">تحليل مالي</p>
                
                {stats.revenue === 0 && stats.expenses === 0 ? (
                    <div className="text-slate-300 flex flex-col items-center">
                        <i className="fas fa-chart-pie text-4xl mb-2"></i>
                        <span className="text-xs font-bold">لا توجد بيانات للرسم</span>
                    </div>
                ) : (
                    <div className="relative w-full h-32 md:h-40 flex justify-center mt-4">
                        <canvas ref={chartRef}></canvas>
                        {/* أيقونة في منتصف الرسم الدائري */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-300 text-3xl">
                            <i className="fas fa-coins"></i>
                        </div>
                    </div>
                )}
                
                {(stats.revenue > 0 || stats.expenses > 0) && (
                    <div className="flex justify-center gap-4 w-full mt-4 border-t border-slate-50 pt-3">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-500 block"></span> إيراد</div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><span className="w-2 h-2 rounded-full bg-rose-500 block"></span> مصروف</div>
                    </div>
                )}
            </div>

        </div>
    );
};