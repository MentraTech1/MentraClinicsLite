
window.Module_Main_Container = function({ clinicId, userId, showToast }) {
    const { useState, useEffect } = React;

    // تهيئة التواريخ الافتراضية (من بداية الشهر الحالي إلى اليوم)
    const todayObj = new Date();
    const defaultTo = todayObj.toISOString().split('T')[0];
    const defaultFrom = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1).toISOString().split('T')[0];

    const [dateRange, setDateRange] = useState({ from: defaultFrom, to: defaultTo });
    
    // الحالات (States)
    const [stats, setStats] = useState({ patientsCount: 0, todayApptsCount: 0, visitsCount: 0 });
    const [recentAppts, setRecentAppts] = useState([]);
    const [recentPatients, setRecentPatients] = useState([]);
    const [financeData, setFinanceData] = useState({ revenue: 0, expenses: 0, profit: 0, chartLabels: [], chartRevenue: [], chartExpenses: [] });
    const [loading, setLoading] = useState(true);

    // دالة التنقل
    const navigateTo = (iconName) => {
        const btn = document.querySelector(`aside nav .fa-${iconName}`)?.closest('button');
        if (btn) btn.click();
        else showToast("تعذر الانتقال للصفحة", "error");
    };

    // جلب البيانات الطبية والمالية
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (!window.db) return;
                const today = new Date().toISOString().split('T')[0];

                // === 1. الإحصائيات الطبية ===
                const pCount = await window.db.patients.where('user_id').equals(userId).count();
                const vCount = await window.db.visits.where('user_id').equals(userId).count();
                
                const allClinicAppts = await window.db.appointments.where('user_id').equals(userId).toArray();
                const todayApptsFiltered = allClinicAppts.filter(appt => appt.date.startsWith(today));
                
                setStats({ patientsCount: pCount, todayApptsCount: todayApptsFiltered.length, visitsCount: vCount });

                const todayAppts = todayApptsFiltered.slice(0, 3);
                const apptsWithNames = await Promise.all(todayAppts.map(async (appt) => {
                    const patient = await window.db.patients.get(appt.patient_id);
                    return { ...appt, patient_name: patient ? patient.name : 'مريض محذوف' };
                }));
                setRecentAppts(apptsWithNames);

                const allClinicPatients = await window.db.patients.where('user_id').equals(userId).toArray();
                const latestPatients = allClinicPatients.sort((a, b) => b.id - a.id).slice(0, 3);
                setRecentPatients(latestPatients);

                // === 2. الإحصائيات المالية ===
                const invoices = await window.db.invoices.where('user_id').equals(userId).toArray();
                const expenses = await window.db.expenses.where('user_id').equals(userId).toArray();

                // فلترة بناءً على التاريخ المحدد
                const validInvoices = invoices.filter(inv => inv.date >= dateRange.from && inv.date <= dateRange.to);
                const validExpenses = expenses.filter(exp => exp.date >= dateRange.from && exp.date <= dateRange.to);

                let totalRev = 0;
                let totalExp = 0;
                const dailyStats = {}; // لتجميع البيانات للرسم البياني

                // تجميع الإيرادات
                validInvoices.forEach(inv => {
                    const amt = Number(inv.paid_amount || 0);
                    totalRev += amt;
                    if(!dailyStats[inv.date]) dailyStats[inv.date] = { rev: 0, exp: 0 };
                    dailyStats[inv.date].rev += amt;
                });

                // تجميع المصروفات
                validExpenses.forEach(exp => {
                    const amt = Number(exp.amount || 0);
                    totalExp += amt;
                    if(!dailyStats[exp.date]) dailyStats[exp.date] = { rev: 0, exp: 0 };
                    dailyStats[exp.date].exp += amt;
                });

                // ترتيب التواريخ للرسم البياني
                const sortedDates = Object.keys(dailyStats).sort();
                const chartLabels = sortedDates;
                const chartRevenue = sortedDates.map(d => dailyStats[d].rev);
                const chartExpenses = sortedDates.map(d => dailyStats[d].exp);

                setFinanceData({
                    revenue: totalRev,
                    expenses: totalExp,
                    profit: totalRev - totalExp,
                    chartLabels,
                    chartRevenue,
                    chartExpenses
                });

            } catch (error) {
                console.error("خطأ في جلب بيانات الرئيسية:", error);
                showToast("حدث خطأ أثناء تحميل إحصائيات العيادة", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [userId, dateRange]); // تحديث تلقائي عند تغيير التاريخ

    const handleDateChange = (e) => {
        setDateRange({ ...dateRange, [e.target.name]: e.target.value });
    };

    if (loading && stats.patientsCount === 0) {
        return (
            <div className="flex justify-center items-center h-64 text-[#0EA5E9]">
                <i className="fas fa-circle-notch fa-spin text-4xl"></i>
            </div>
        );
    }

    return (
        <div className="space-y-5 md:space-y-6 animate-view pb-24 md:pb-10 max-w-6xl mx-auto">
            {/* 1. الإحصائيات العلوية */}
            {window.MainStats && <window.MainStats stats={stats} />}
            
            {/* 2. أزرار الوصول السريع */}
            {window.QuickAccess && <window.QuickAccess navigateTo={navigateTo} />}
            
            {/* 3. المكون المالي والبياني الجديد (مع حماية ضد الانهيار) */}
            {window.FinancialSection ? (
                <window.FinancialSection 
                    financeData={financeData} 
                    dateRange={dateRange} 
                    handleDateChange={handleDateChange} 
                />
            ) : (
                <div className="p-4 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center gap-3 font-bold border border-slate-200 mt-6 shadow-sm">
                    <i className="fas fa-circle-notch fa-spin text-[#0EA5E9] text-xl"></i> جاري إعداد التحليل المالي والبياني...
                </div>
            )}

            {/* 4. القوائم الأخيرة */}
            {window.RecentLists && <window.RecentLists recentAppts={recentAppts} recentPatients={recentPatients} stats={stats} navigateTo={navigateTo} />}
            
            {/* 5. الإعلان */}
            {window.PromoBanner && <window.PromoBanner />}
        </div>
    );
};