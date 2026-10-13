window.Module_Accounting_Container = function({ clinicId, userId, showToast }) {
    const { useState, useEffect } = React;

    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // ==========================================
    // الحالات (States)
    const [invoices, setInvoices] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [patients, setPatients] = useState([]);
    const [clinicInfo, setClinicInfo] = useState(null); // لحفظ بيانات العيادة للطباعة
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [filters, setFilters] = useState({ dateFrom: firstDayOfMonth, dateTo: today });
    const [stats, setStats] = useState({ revenue: 0, expenses: 0, netProfit: 0 });
    const [activeTab, setActiveTab] = useState('invoices'); 

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

    // البحث الحي
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

    const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) || 
        (p.phone && p.phone.includes(patientSearchTerm))
    ).slice(0, 10);

    // ==========================================
    // جلب البيانات
    useEffect(() => {
        const fetchAccountingData = async () => {
            setLoading(true);
            try {
                if (!window.db) return;

                // جلب بيانات العيادة للطباعة
                const clinic = await window.db.clinic_info.toCollection().first();
                setClinicInfo(clinic);

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

                setStats({ revenue: totalRev, expenses: totalExp, netProfit: totalRev - totalExp });
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
    // Pagination
    const currentDataList = activeTab === 'invoices' ? invoices : expenses;
    const totalPages = Math.ceil(currentDataList.length / itemsPerPage) || 1;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = currentDataList.slice(indexOfFirstItem, indexOfLastItem);

    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    // ==========================================
    // العمليات
    const handleSaveExpense = async (e) => {
        e.preventDefault();
        try {
            await window.db.expenses.add({
                ...expenseForm, amount: Number(expenseForm.amount), user_id: userId,
                created_at: new Date().toISOString(), updated_at: new Date().toISOString()
            });
            showToast("تم تسجيل المصروف بنجاح", "success");
            setIsExpenseModalOpen(false);
            setExpenseForm({ date: today, category: 'supplies', amount: '', description: '', payment_method: 'cash' });
            setRefreshTrigger(prev => prev + 1);
        } catch (error) { showToast("فشل تسجيل المصروف", "error"); }
    };

    const handleSaveInvoice = async (e) => {
        e.preventDefault();
        if(!invoiceForm.patient_id) return showToast("الرجاء اختيار مريض صحيح من القائمة", "error");
        try {
            await window.db.invoices.add({
                date: invoiceForm.date, patient_id: Number(invoiceForm.patient_id),
                total_amount: Number(invoiceForm.total_amount), paid_amount: Number(invoiceForm.paid_amount),
                payment_status: Number(invoiceForm.paid_amount) >= Number(invoiceForm.total_amount) ? 'paid' : 'partial',
                payment_method: invoiceForm.payment_method, user_id: userId, doctor_id: userId,
                created_at: new Date().toISOString(), updated_at: new Date().toISOString()
            });
            showToast("تم إصدار الفاتورة بنجاح", "success");
            setIsInvoiceModalOpen(false);
            setInvoiceForm({ date: today, patient_id: '', total_amount: '', paid_amount: '', payment_method: 'cash' });
            setPatientSearchTerm(''); 
            setRefreshTrigger(prev => prev + 1);
        } catch (error) { showToast("فشل إصدار الفاتورة", "error"); }
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

    // ==========================================
    // دالة طباعة الفاتورة (متوافقة مع Electron والويب)
    // ==========================================
    const handlePrintInvoice = (invoice) => {
        const clinicName = clinicInfo?.clinic_name || 'العيادة';
        const docName = JSON.parse(localStorage.getItem('MentraClinics_Session'))?.name || 'الطبيب';
        
        // تصميم HTML نظيف باللونين الأبيض والأسود مخصص للطابعات الحرارية وورق A5
        const printContent = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>سند قبض - ${invoice.patient_name}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                    body { font-family: 'Cairo', sans-serif; padding: 20px; color: #000; margin: 0; }
                    .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 20px; }
                    .clinic-name { font-size: 24px; font-weight: 900; margin: 0; }
                    .doc-name { font-size: 16px; font-weight: 700; margin: 5px 0 0 0; }
                    .receipt-title { text-align: center; font-size: 20px; font-weight: 900; background: #eee; padding: 5px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #000;}
                    .details { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .details th, .details td { padding: 10px; text-align: right; border: 1px solid #000; font-size: 14px;}
                    .details th { width: 30%; font-weight: 900; background: #f9f9f9; }
                    .details td { font-weight: 700; }
                    .footer { text-align: center; font-size: 12px; margin-top: 30px; border-top: 1px solid #000; padding-top: 10px; }
                    .system-brand { font-size: 10px; color: #555; text-align: center; margin-top: 5px; font-family: sans-serif; direction: ltr;}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="clinic-name">${clinicName}</h1>
                    <p class="doc-name">د. ${docName}</p>
                </div>
                
                <div class="receipt-title">سند قبض مالــي</div>
                
                <table class="details">
                    <tr>
                        <th>رقم الفاتورة (المرجع)</th>
                        <td>#INV-${invoice.id.toString().padStart(5, '0')}</td>
                    </tr>
                    <tr>
                        <th>تاريخ السداد</th>
                        <td>${invoice.date}</td>
                    </tr>
                    <tr>
                        <th>اسم المريض / العميل</th>
                        <td>${invoice.patient_name}</td>
                    </tr>
                    <tr>
                        <th>المبلغ المطلوب</th>
                        <td>${invoice.total_amount} جنيه</td>
                    </tr>
                    <tr>
                        <th>المبلغ المدفوع (مقبوض)</th>
                        <td style="font-size: 18px;">${invoice.paid_amount} جنيه</td>
                    </tr>
                    <tr>
                        <th>حالة الدفع</th>
                        <td>${invoice.payment_status === 'paid' ? 'خالص' : 'دفع جزئي'}</td>
                    </tr>
                </table>

                <div class="footer">
                    <p>تم استلام المبلغ الموضح أعلاه. مع تمنياتنا بدوام الصحة والعافية.</p>
                    <p>توقيع الحسابات: ............................</p>
                    <p class="system-brand">Powered by MentraClinics Lite</p>
                </div>
            </body>
            </html>
        `;

        // تقنية إنشاء iframe مخفي للطباعة الصامتة
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '-9999px';
        iframe.style.bottom = '-9999px';
        document.body.appendChild(iframe);

        iframe.contentDocument.open();
        iframe.contentDocument.write(printContent);
        iframe.contentDocument.close();

        // ننتظر قليلاً لتحميل الخطوط ثم نطبع ونحذف ה iframe
        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            
            // إزالة الـ iframe بعد الطباعة لتنظيف الـ DOM
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 500);
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-view pb-24 md:pb-10 max-w-6xl mx-auto">
            <window.AccountingHeader 
                setIsExpenseModalOpen={setIsExpenseModalOpen} 
                setIsInvoiceModalOpen={setIsInvoiceModalOpen} 
                setPatientSearchTerm={setPatientSearchTerm} 
            />
            
            <window.AccountingFilters filters={filters} setFilters={setFilters} />
            <window.AccountingStats stats={stats} />
            
            <window.AccountingList 
                loading={loading} activeTab={activeTab} setActiveTab={setActiveTab} setCurrentPage={setCurrentPage}
                currentDataList={currentDataList} currentItems={currentItems}
                handleDeleteInvoice={handleDeleteInvoice} handlePrintInvoice={handlePrintInvoice} handleDeleteExpense={handleDeleteExpense}
                totalPages={totalPages} currentPage={currentPage} prevPage={prevPage} nextPage={nextPage}
            />

            {isExpenseModalOpen && (
                <window.ExpenseFormModal 
                    setIsExpenseModalOpen={setIsExpenseModalOpen}
                    expenseForm={expenseForm} setExpenseForm={setExpenseForm}
                    handleSaveExpense={handleSaveExpense} today={today}
                />
            )}

            {isInvoiceModalOpen && (
                <window.InvoiceFormModal 
                    setIsInvoiceModalOpen={setIsInvoiceModalOpen}
                    invoiceForm={invoiceForm} setInvoiceForm={setInvoiceForm} handleSaveInvoice={handleSaveInvoice}
                    patients={patients} filteredPatients={filteredPatients}
                    patientSearchTerm={patientSearchTerm} setPatientSearchTerm={setPatientSearchTerm}
                    isPatientDropdownOpen={isPatientDropdownOpen} setIsPatientDropdownOpen={setIsPatientDropdownOpen}
                    today={today}
                />
            )}

            <window.AccountingPromoBanner />
        </div>
    );
};