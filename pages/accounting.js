window.Module_Accounting = function({ clinicId, userId, showToast }) {
    const { useState, useEffect } = React;

    // تهيئة التواريخ (من أول الشهر إلى اليوم)
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // ==========================================
    // الحالات (States)
    // ==========================================
    const [invoices, setInvoices] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // الفلاتر والإحصائيات
    const [filters, setFilters] = useState({ dateFrom: firstDayOfMonth, dateTo: today });
    const [stats, setStats] = useState({ revenue: 0, expenses: 0, netProfit: 0 });

    // نظام التبويبات (Tabs)
    const [activeTab, setActiveTab] = useState('invoices'); // invoices | expenses

    // Pagination (Limit 3)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // نوافذ الإضافة
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [expenseForm, setExpenseForm] = useState({
        date: today, category: 'supplies', amount: '', description: '', payment_method: 'cash'
    });

    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [invoiceForm, setInvoiceForm] = useState({
        date: today, patient_id: '', total_amount: '', paid_amount: '', payment_method: 'cash'
    });

    // ==========================================
    // حالات البحث الحي (Live Search) للمرضى في الفاتورة
    // ==========================================
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

    // فلترة المرضى (أول 10 نتائج فقط)
    const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) || 
        (p.phone && p.phone.includes(patientSearchTerm))
    ).slice(0, 10);

    // ==========================================
    // جلب البيانات والإحصائيات بناءً على التواريخ
    // ==========================================
    useEffect(() => {
        const fetchAccountingData = async () => {
            setLoading(true);
            try {
                if (!window.db) return;

                const allPatients = await window.db.patients.where('user_id').equals(userId).toArray();
                setPatients(allPatients);

                const allInvoices = await window.db.invoices.where('user_id').equals(userId).toArray();
                const allExpenses = await window.db.expenses.where('user_id').equals(userId).toArray();

                const filteredInvoices = allInvoices.filter(inv => inv.date >= filters.dateFrom && inv.date <= filters.dateTo);
                const filteredExpenses = allExpenses.filter(exp => exp.date >= filters.dateFrom && exp.date <= filters.dateTo);

                const enrichedInvoices = filteredInvoices.map(inv => {
                    const p = allPatients.find(pat => pat.id === Number(inv.patient_id));
                    return { ...inv, patient_name: p ? p.name : 'مريض غير معروف' };
                }).sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);

                filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);

                setInvoices(enrichedInvoices);
                setExpenses(filteredExpenses);

                const totalRev = filteredInvoices.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);
                const totalExp = filteredExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

                setStats({
                    revenue: totalRev,
                    expenses: totalExp,
                    netProfit: totalRev - totalExp
                });

                setCurrentPage(1);

            } catch (error) {
                console.error(error);
                showToast("حدث خطأ في تحميل البيانات المالية", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchAccountingData();
    }, [userId, filters, refreshTrigger]);

    // ==========================================
    // منطق الـ Pagination (Limit 3)
    // ==========================================
    const currentDataList = activeTab === 'invoices' ? invoices : expenses;
    const totalPages = Math.ceil(currentDataList.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = currentDataList.slice(indexOfFirstItem, indexOfLastItem);

    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    // ==========================================
    // العمليات
    // ==========================================
    const handleSaveExpense = async (e) => {
        e.preventDefault();
        try {
            await window.db.expenses.add({
                ...expenseForm,
                amount: Number(expenseForm.amount),
                user_id: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            showToast("تم تسجيل المصروف بنجاح", "success");
            setIsExpenseModalOpen(false);
            setExpenseForm({ date: today, category: 'supplies', amount: '', description: '', payment_method: 'cash' });
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            showToast("فشل تسجيل المصروف", "error");
        }
    };

    const handleSaveInvoice = async (e) => {
        e.preventDefault();
        if(!invoiceForm.patient_id) return showToast("الرجاء اختيار مريض صحيح من القائمة", "error");
        
        try {
            await window.db.invoices.add({
                date: invoiceForm.date,
                patient_id: Number(invoiceForm.patient_id),
                total_amount: Number(invoiceForm.total_amount),
                paid_amount: Number(invoiceForm.paid_amount),
                payment_status: Number(invoiceForm.paid_amount) >= Number(invoiceForm.total_amount) ? 'paid' : 'partial',
                payment_method: invoiceForm.payment_method,
                user_id: userId,
                doctor_id: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            showToast("تم إصدار الفاتورة بنجاح", "success");
            setIsInvoiceModalOpen(false);
            setInvoiceForm({ date: today, patient_id: '', total_amount: '', paid_amount: '', payment_method: 'cash' });
            setPatientSearchTerm(''); 
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            showToast("فشل إصدار الفاتورة", "error");
        }
    };

    const handleDeleteInvoice = async (id) => {
        if(confirm("هل أنت متأكد من حذف هذه الفاتورة؟ سيؤثر هذا على إجمالي الإيرادات.")) {
            await window.db.invoices.delete(id);
            setRefreshTrigger(prev => prev + 1);
            showToast("تم حذف الفاتورة", "success");
        }
    };

    const handleDeleteExpense = async (id) => {
        if(confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
            await window.db.expenses.delete(id);
            setRefreshTrigger(prev => prev + 1);
            showToast("تم حذف المصروف", "success");
        }
    };

    const categoryLabels = {
        'supplies': 'مستلزمات طبية', 'rent': 'إيجار العيادة', 'salaries': 'رواتب وأجور',
        'utilities': 'كهرباء ومياه', 'marketing': 'دعاية وتسويق', 'other': 'نثريات ومصروفات أخرى'
    };

    // ==========================================
    // واجهة المستخدم (UI) - Mobile Optimized
    // ==========================================
    return (
        <div className="space-y-4 md:space-y-6 animate-view pb-24 md:pb-10">
            
            {/* الهيدر والأزرار */}
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

            {/* فلتر التواريخ */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 font-black text-sm">
                    <i className="fas fa-calendar-alt text-[#0EA5E9] text-lg"></i> 
                    <span>تحليل الماليـات للفـترة المـحـددة:</span>
                </div>
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative w-1/2 md:w-auto">
                        <span className="absolute -top-2 right-2 bg-white px-1 text-[10px] font-bold text-slate-400">من</span>
                        <input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                    </div>
                    <div className="relative w-1/2 md:w-auto">
                        <span className="absolute -top-2 right-2 bg-white px-1 text-[10px] font-bold text-slate-400">إلى</span>
                        <input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                    </div>
                </div>
            </div>

            {/* كروت الإحصائيات התفاعلية */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
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
                <div className={`col-span-2 md:col-span-1 p-5 md:p-6 rounded-2xl border flex items-center justify-center md:justify-start gap-4 text-white shadow-lg ${stats.netProfit >= 0 ? 'bg-gradient-to-l from-[#0284C7] to-[#0EA5E9] border-sky-400' : 'bg-gradient-to-l from-slate-700 to-slate-500 border-slate-400'}`}>
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-full flex items-center justify-center text-xl md:text-2xl border border-white/30 shrink-0"><i className="fas fa-wallet"></i></div>
                    <div className="text-right">
                        <p className="text-[11px] md:text-xs font-bold text-sky-100">صافي الربح بالخزنة</p>
                        <h4 className="text-2xl md:text-3xl font-black mt-1">{stats.netProfit.toLocaleString()} <span className="text-xs font-bold">ج.م</span></h4>
                    </div>
                </div>
            </div>

            {/* التبويبات والجدول/الكروت */}
            <div className="bg-transparent md:bg-white md:rounded-2xl md:border border-slate-100 md:shadow-sm overflow-hidden flex flex-col">
                <div className="flex border-b border-slate-100 bg-white rounded-xl md:rounded-none shadow-sm md:shadow-none mb-3 md:mb-0">
                    <button onClick={() => { setActiveTab('invoices'); setCurrentPage(1); }} className={`flex-1 py-3.5 md:py-4 text-xs md:text-sm font-black transition-colors ${activeTab === 'invoices' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}>
                        <i className="fas fa-file-invoice mr-1 md:mr-2"></i> سجل الإيرادات
                    </button>
                    <button onClick={() => { setActiveTab('expenses'); setCurrentPage(1); }} className={`flex-1 py-3.5 md:py-4 text-xs md:text-sm font-black transition-colors ${activeTab === 'expenses' ? 'text-rose-600 border-b-2 border-rose-500' : 'text-slate-400 hover:text-slate-600'}`}>
                        <i className="fas fa-receipt mr-1 md:mr-2"></i> سجل المصروفات
                    </button>
                </div>

                <div className="p-0">
                    {loading ? (
                        <div className="flex justify-center p-10"><i className="fas fa-spinner fa-spin text-3xl text-[#0EA5E9]"></i></div>
                    ) : currentDataList.length === 0 ? (
                        <div className="text-center p-10 bg-white rounded-2xl md:rounded-none">
                            <i className="fas fa-folder-open text-5xl text-slate-200 mb-4"></i>
                            <h3 className="text-lg font-bold text-slate-500">لا توجد حركات مالية مسجلة</h3>
                            <p className="text-sm text-slate-400 mt-1">في هذه الفترة المحددة</p>
                        </div>
                    ) : (
                        <>
                            {/* تصميم الموبايل (Cards) */}
                            <div className="md:hidden space-y-3">
                                {currentItems.map((item) => (
                                    <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded"><i className="far fa-calendar-alt"></i> {item.date}</span>
                                                <h3 className="font-black text-slate-700 mt-1 text-sm">
                                                    {activeTab === 'invoices' ? item.patient_name : (categoryLabels[item.category] || 'مصروف')}
                                                </h3>
                                            </div>
                                            <button onClick={() => activeTab === 'invoices' ? handleDeleteInvoice(item.id) : handleDeleteExpense(item.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center active:scale-95"><i className="fas fa-trash-alt"></i></button>
                                        </div>
                                        
                                        {activeTab === 'invoices' ? (
                                            <div className="flex items-center justify-between bg-emerald-50 p-2 rounded-lg mt-2 border border-emerald-100">
                                                <span className="text-xs font-bold text-emerald-700">المقبوض: <span className="font-black text-base">{item.paid_amount} ج.م</span></span>
                                                <span className="text-[10px] font-bold text-slate-400">الكلي: {item.total_amount}</span>
                                            </div>
                                        ) : (
                                            <div className="mt-2">
                                                <div className="bg-rose-50 p-2 rounded-lg border border-rose-100 inline-block w-full text-center">
                                                    <span className="text-xs font-bold text-rose-700">المبلغ: <span className="font-black text-base">{item.amount} ج.م</span></span>
                                                </div>
                                                {item.description && <p className="text-xs text-slate-500 mt-2 font-semibold"><i className="fas fa-info-circle"></i> {item.description}</p>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* تصميم الكمبيوتر (Table) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-right text-sm">
                                    <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                                        {activeTab === 'invoices' ? (
                                            <tr>
                                                <th className="px-6 py-4">التاريخ</th>
                                                <th className="px-6 py-4">اسم المريض</th>
                                                <th className="px-6 py-4 text-center">المبلغ الكلي</th>
                                                <th className="px-6 py-4 text-center">المدفوع</th>
                                                <th className="px-6 py-4 text-center">الإجراءات</th>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <th className="px-6 py-4">التاريخ</th>
                                                <th className="px-6 py-4">بند المصروف</th>
                                                <th className="px-6 py-4 text-center">المبلغ</th>
                                                <th className="px-6 py-4">البيان / الوصف</th>
                                                <th className="px-6 py-4 text-center">الإجراءات</th>
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {currentItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                {activeTab === 'invoices' ? (
                                                    <>
                                                        <td className="px-6 py-4 font-bold text-slate-600">{item.date}</td>
                                                        <td className="px-6 py-4 font-black text-[#0284C7]">{item.patient_name}</td>
                                                        <td className="px-6 py-4 text-center font-bold text-slate-500">{item.total_amount} ج.م</td>
                                                        <td className="px-6 py-4 text-center font-black text-emerald-600">{item.paid_amount} ج.م</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button onClick={() => handleDeleteInvoice(item.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors"><i className="fas fa-trash-alt"></i></button>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-6 py-4 font-bold text-slate-600">{item.date}</td>
                                                        <td className="px-6 py-4 font-black text-slate-700">
                                                            <span className="bg-slate-100 px-2 py-1 rounded text-xs">{categoryLabels[item.category] || 'مصروف'}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-black text-rose-600">{item.amount} ج.م</td>
                                                        <td className="px-6 py-4 font-semibold text-slate-500">{item.description || '-'}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button onClick={() => handleDeleteExpense(item.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors"><i className="fas fa-trash-alt"></i></button>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="p-4 bg-white md:bg-transparent border-t border-slate-100 flex items-center justify-between rounded-xl md:rounded-none mt-3 md:mt-0 shadow-sm md:shadow-none">
                            <button onClick={prevPage} disabled={currentPage === 1} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                                <i className="fas fa-chevron-right md:ml-1"></i> <span className="hidden md:inline">السابق</span>
                            </button>
                            <span className="text-sm font-bold text-slate-500">
                                صفحة <span className="text-[#0284C7] text-lg mx-1">{currentPage}</span> من {totalPages}
                            </span>
                            <button onClick={nextPage} disabled={currentPage === totalPages} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                                <span className="hidden md:inline">التالي</span> <i className="fas fa-chevron-left md:mr-1"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================== */}
            {/* نافذة إضافة مصروف (Expense Modal) */}
            {/* ========================================== */}
            {isExpenseModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-0 md:p-4">
                    <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl animate-view overflow-hidden pb-safe">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-rose-50 rounded-t-3xl md:rounded-t-2xl">
                            <h3 className="text-lg font-black text-rose-600"><i className="fas fa-minus-circle"></i> تسجيل مصروف جديد</h3>
                            <button onClick={() => setIsExpenseModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><i className="fas fa-times"></i></button>
                        </div>
                        <form onSubmit={handleSaveExpense} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">التاريخ</label>
                                    <input type="date" required value={expenseForm.date} onChange={e=>setExpenseForm({...expenseForm, date: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-rose-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">المبلغ <span className="text-rose-500">*</span></label>
                                    <input type="number" min="1" required value={expenseForm.amount} onChange={e=>setExpenseForm({...expenseForm, amount: e.target.value})} className="w-full p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-sm font-black text-rose-600 focus:border-rose-500 outline-none" placeholder="ج.م" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">بند المصروف</label>
                                <select value={expenseForm.category} onChange={e=>setExpenseForm({...expenseForm, category: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-rose-500 outline-none">
                                    <option value="supplies">مستلزمات وأدوات طبية</option>
                                    <option value="salaries">رواتب وأجور</option>
                                    <option value="rent">إيجار العيادة</option>
                                    <option value="utilities">فواتير (كهرباء، مياه، نت)</option>
                                    <option value="marketing">دعاية وتسويق</option>
                                    <option value="other">نثريات أخرى</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">البيان / ملاحظات</label>
                                <textarea rows="2" value={expenseForm.description} onChange={e=>setExpenseForm({...expenseForm, description: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-rose-500 outline-none resize-none"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-xl transition-colors mt-2 active:scale-95">
                                حفظ المصروف
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* نافذة إضافة إيراد/فاتورة (Invoice Modal) */}
            {/* ========================================== */}
            {isInvoiceModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-0 md:p-4">
                    <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl animate-view overflow-visible pb-safe">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50 rounded-t-3xl md:rounded-t-2xl">
                            <h3 className="text-lg font-black text-emerald-600"><i className="fas fa-plus-circle"></i> إصدار فاتورة / تحصيل إيراد</h3>
                            <button onClick={() => {setIsInvoiceModalOpen(false); setPatientSearchTerm('');}} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><i className="fas fa-times"></i></button>
                        </div>
                        <form onSubmit={handleSaveInvoice} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                            
                            {/* حقل البحث الحي عن المريض */}
                            <div className="relative">
                                <label className="block text-sm font-bold text-slate-700 mb-1">ابحث واختر المريض <span className="text-rose-500">*</span></label>
                                {patients.length === 0 ? (
                                    <div className="text-xs text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100 font-bold">يجب إضافة مريض أولاً من قسم "سجل المرضى"</div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="ابحث بالاسم أو رقم الهاتف..."
                                            value={patientSearchTerm}
                                            onChange={(e) => {
                                                setPatientSearchTerm(e.target.value);
                                                setIsPatientDropdownOpen(true);
                                                if(e.target.value === '') setInvoiceForm({...invoiceForm, patient_id: ''});
                                            }}
                                            onFocus={() => setIsPatientDropdownOpen(true)}
                                            onBlur={() => setTimeout(() => setIsPatientDropdownOpen(false), 200)}
                                            className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none"
                                        />
                                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                        
                                        {/* القائمة المنسدلة لنتائج البحث */}
                                        {isPatientDropdownOpen && patientSearchTerm && (
                                            <ul className="absolute z-[1000] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                                {filteredPatients.length > 0 ? (
                                                    filteredPatients.map(p => (
                                                        <li
                                                            key={p.id}
                                                            onMouseDown={() => {
                                                                setInvoiceForm({...invoiceForm, patient_id: p.id});
                                                                setPatientSearchTerm(`${p.name} (${p.phone || '-'})`);
                                                                setIsPatientDropdownOpen(false);
                                                            }}
                                                            className="p-4 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 text-sm font-bold text-slate-700 transition-colors"
                                                        >
                                                            {p.name} <span className="text-xs text-slate-400 block mt-1">رقم: {p.phone || 'لا يوجد'}</span>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="p-4 text-sm text-slate-400 text-center font-bold">لا يوجد مريض يطابق بحثك</li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                )}
                                {!invoiceForm.patient_id && patientSearchTerm && !isPatientDropdownOpen && (
                                    <p className="text-[10px] text-rose-500 font-bold mt-1">يرجى الضغط على اسم المريض من القائمة المنسدلة</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">التاريخ</label>
                                <input type="date" required value={invoiceForm.date} onChange={e=>setInvoiceForm({...invoiceForm, date: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">المبلغ الكلي</label>
                                    <input type="number" min="0" required value={invoiceForm.total_amount} onChange={e=>setInvoiceForm({...invoiceForm, total_amount: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none" placeholder="ج.م" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">المدفوع (مقبوض)</label>
                                    <input type="number" min="0" required value={invoiceForm.paid_amount} onChange={e=>setInvoiceForm({...invoiceForm, paid_amount: e.target.value})} className="w-full p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-black text-emerald-700 focus:border-emerald-500 outline-none" placeholder="ج.م" />
                                </div>
                            </div>
                            <button type="submit" disabled={!invoiceForm.patient_id} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 text-lg active:scale-95">
                                إصدار وتحصيل
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ====== إعلان النسخة المدفوعة والدعم الفني ====== */}
            <div className="mt-8 bg-gradient-to-r from-[#0f766e] to-[#0284c7] rounded-3xl p-5 md:p-6 text-white shadow-lg relative overflow-hidden text-right" dir="rtl">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mt-20 blur-2xl"></div>
                <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-teal-400/20 rounded-full blur-xl"></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5 md:gap-6">
                    <div className="flex flex-col md:flex-row items-center text-center md:text-right gap-4 w-full lg:w-auto">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner animate-pulse">
                            <i className="fas fa-stethoscope text-teal-200"></i>
                        </div>
                        <div>
                            <h4 className="font-black text-lg md:text-xl tracking-wide">ارتقِ بإدارة عيادتك للمستوى الاحترافي</h4>
                            <p className="text-teal-50 text-xs md:text-sm mt-1 font-medium opacity-90 leading-relaxed">
                                أنت تستخدم النسخة المحدودة (Lite). تواصل معنا الآن لتفعيل إدارة ملفات المرضى الإلكترونية والروشتات الذكية.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <a href="tel:01211934816" className="w-full sm:w-auto justify-center bg-amber-400 text-slate-900 px-5 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-amber-300 transition-all active:scale-95 shadow-md">
                            <i className="fas fa-shopping-cart text-base"></i>
                            <span>طلب النسخة (المبيعات)</span>
                        </a>
                        <a href="https://wa.me/201211934816" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto justify-center bg-white/10 backdrop-blur-sm border border-white/25 px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/20 transition-all active:scale-95">
                            <i className="fab fa-whatsapp text-emerald-400 text-base"></i>
                            <span>الدعم الفني</span>
                        </a>
                    </div>
                </div>
            </div>

        </div>
    );
};