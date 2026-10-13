window.FinancialSection = function({ financeData, dateRange, handleDateChange }) {
    const { useEffect, useRef } = React;
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // تفعيل وتحديث الرسم البياني
    useEffect(() => {
        if (!chartRef.current || !window.Chart) return;

        const ctx = chartRef.current.getContext('2d');

        // تدمير الرسم القديم إن وجد لتحديثه
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // إعدادات Chart.js
        chartInstance.current = new window.Chart(ctx, {
            type: 'bar',
            data: {
                labels: financeData.chartLabels.length > 0 ? financeData.chartLabels : ['لا توجد بيانات'],
                datasets: [
                    {
                        label: 'الإيرادات',
                        data: financeData.chartRevenue.length > 0 ? financeData.chartRevenue : [0],
                        backgroundColor: 'rgba(16, 185, 129, 0.8)', // Emerald
                        borderRadius: 4,
                    },
                    {
                        label: 'المصروفات',
                        data: financeData.chartExpenses.length > 0 ? financeData.chartExpenses : [0],
                        backgroundColor: 'rgba(244, 63, 94, 0.8)', // Rose
                        borderRadius: 4,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { font: { family: 'Cairo', weight: 'bold' } }
                    }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        return () => {
            if (chartInstance.current) chartInstance.current.destroy();
        };
    }, [financeData]);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
            {/* الهيدر وفلاتر التاريخ */}
            <div className="p-4 md:p-5 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm md:text-base">
                    <i className="fas fa-chart-line text-[#0EA5E9]"></i> التحليل المالي والبياني
                </h3>
                
                <div className="flex items-center gap-2 text-xs md:text-sm w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-bold">من:</span>
                        <input type="date" name="from" value={dateRange.from} onChange={handleDateChange} className="outline-none bg-transparent font-bold text-slate-700" />
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-bold">إلى:</span>
                        <input type="date" name="to" value={dateRange.to} onChange={handleDateChange} className="outline-none bg-transparent font-bold text-slate-700" />
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* البطاقات المالية */}
                <div className="flex flex-col gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-emerald-600 text-xs font-bold mb-1">إجمالي الإيرادات</p>
                            <h4 className="text-xl font-black text-emerald-700">{financeData.revenue} ج.م</h4>
                        </div>
                        <div className="w-10 h-10 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center"><i className="fas fa-arrow-down"></i></div>
                    </div>
                    
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-rose-600 text-xs font-bold mb-1">إجمالي المصروفات</p>
                            <h4 className="text-xl font-black text-rose-700">{financeData.expenses} ج.م</h4>
                        </div>
                        <div className="w-10 h-10 bg-rose-200 text-rose-700 rounded-full flex items-center justify-center"><i className="fas fa-arrow-up"></i></div>
                    </div>

                    <div className={`p-4 rounded-xl flex items-center justify-between border ${financeData.profit >= 0 ? 'bg-[#0EA5E9]/10 border-[#0EA5E9]/20' : 'bg-rose-100 border-rose-200'}`}>
                        <div>
                            <p className={`text-xs font-bold mb-1 ${financeData.profit >= 0 ? 'text-[#0284C7]' : 'text-rose-600'}`}>صافي الربح</p>
                            <h4 className={`text-2xl font-black ${financeData.profit >= 0 ? 'text-[#0284C7]' : 'text-rose-700'}`}>
                                {financeData.profit} ج.م
                            </h4>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${financeData.profit >= 0 ? 'bg-[#0284C7] text-white' : 'bg-rose-500 text-white'}`}>
                            <i className="fas fa-wallet"></i>
                        </div>
                    </div>
                </div>

                {/* الرسم البياني */}
                <div className="lg:col-span-2 bg-slate-50 rounded-xl border border-slate-100 p-2 h-64 md:h-full min-h-[250px]">
                    <canvas ref={chartRef}></canvas>
                </div>
            </div>
        </div>
    );
};