window.Module_Appointments_Container = function({ clinicId, userId, showToast }) {
    const { useState, useEffect } = React;

    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // حالة التبويب (القائمة أو التقويم)
    const [activeTab, setActiveTab] = useState('list');

    const [allAppointments, setAllAppointments] = useState([]); // للتقويم (تحتوي على كل المواعيد)
    const [filteredAppointments, setFilteredAppointments] = useState([]); // للقائمة (مفلترة)
    const [patients, setPatients] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [filters, setFilters] = useState({
        search: '', status: 'all', dateFrom: firstDayOfMonth, dateTo: today
    });

    const [stats, setStats] = useState({ totalAppts: 0, completedAppts: 0, totalRevenue: 0 });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // حالة المودال والبحث الحي
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [formData, setFormData] = useState({
        patient_id: '', date: today, time: '10:00', type: 'new', notes: ''
    });

    const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) || 
        (p.phone && p.phone.includes(patientSearchTerm))
    ).slice(0, 10);

    // جلب البيانات
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (!window.db) return;

                const allPatients = await window.db.patients.where('user_id').equals(userId).toArray();
                setPatients(allPatients);

                const dbAppointments = await window.db.appointments.where('user_id').equals(userId).toArray();

                // دمج اسم المريض مع كل موعد
                let apptsWithNames = dbAppointments.map(appt => {
                    const patient = allPatients.find(p => p.id === Number(appt.patient_id));
                    return { ...appt, patient_name: patient ? patient.name : 'مريض غير معروف', phone: patient ? patient.phone : '' };
                });

                // تخزين كل المواعيد لاستخدامها في التقويم
                setAllAppointments(apptsWithNames);

                // ==========================
                // تطبيق الفلاتر الخاصة بالقائمة
                // ==========================
                let listFiltered = apptsWithNames.filter(appt => appt.date >= filters.dateFrom && appt.date <= filters.dateTo);

                if (filters.status !== 'all') {
                    listFiltered = listFiltered.filter(appt => appt.status === filters.status);
                }
                if (filters.search.trim() !== '') {
                    listFiltered = listFiltered.filter(appt => 
                        appt.patient_name.includes(filters.search) || appt.phone.includes(filters.search)
                    );
                }

                listFiltered.sort((a, b) => new Date(b.date) - new Date(a.date));
                setFilteredAppointments(listFiltered);

                // الإحصائيات (تُحسب بناءً على الفلاتر)
                const invoices = await window.db.invoices.where('user_id').equals(userId).toArray();
                const periodInvoices = invoices.filter(inv => inv.date >= filters.dateFrom && inv.date <= filters.dateTo);
                const calculatedRevenue = periodInvoices.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);

                setStats({
                    totalAppts: listFiltered.length,
                    completedAppts: listFiltered.filter(a => a.status === 'completed').length,
                    totalRevenue: calculatedRevenue
                });
                setCurrentPage(1);

            } catch (error) {
                console.error("خطأ في جلب المواعيد:", error);
                showToast("حدث خطأ أثناء تحميل البيانات", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, filters, refreshTrigger]);

    // Pagination للقائمة فقط
    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage) || 1;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);

    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    // العمليات
    const handleAddAppointment = async (e) => {
        e.preventDefault();
        if (!formData.patient_id) return showToast("الرجاء اختيار مريض صحيح من القائمة", "error");
        try {
            await window.db.appointments.add({
                patient_id: Number(formData.patient_id), doctor_id: userId, user_id: userId,
                date: formData.date, time: formData.time, status: 'pending',
                type: formData.type, notes: formData.notes,
                created_at: new Date().toISOString(), updated_at: new Date().toISOString()
            });
            showToast("تم حجز الموعد بنجاح", "success");
            setIsModalOpen(false);
            setFormData({ ...formData, notes: '', patient_id: '' });
            setPatientSearchTerm(''); 
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            showToast("فشل حجز الموعد", "error");
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await window.db.appointments.update(id, { status: newStatus, updated_at: new Date().toISOString() });
            showToast("تم تحديث حالة الموعد", "success");
            setRefreshTrigger(prev => prev + 1);
        } catch (error) { showToast("حدث خطأ أثناء التحديث", "error"); }
    };

    const handleDelete = async (id) => {
        if(confirm("هل أنت متأكد من إلغاء وحذف هذا الموعد نهائياً؟")) {
            try {
                await window.db.appointments.delete(id);
                showToast("تم حذف الموعد", "success");
                setRefreshTrigger(prev => prev + 1);
            } catch (error) { showToast("فشل الحذف", "error"); }
        }
    };

    const openAddModal = () => {
        setIsModalOpen(true);
        setPatientSearchTerm('');
        setFormData({ ...formData, patient_id: '', notes: '' });
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-view pb-24 md:pb-10 max-w-6xl mx-auto">
            
            <window.AppointmentsHeader 
                openAddModal={openAddModal} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
            />

            {/* عرض محتوى التبويب المختار */}
            {activeTab === 'list' ? (
                <>
                    <window.AppointmentsStats stats={stats} />
                    <window.AppointmentsFilters filters={filters} setFilters={setFilters} />
                    <window.AppointmentsList 
                        loading={loading}
                        appointmentsLength={filteredAppointments.length}
                        currentItems={currentItems}
                        handleUpdateStatus={handleUpdateStatus}
                        handleDelete={handleDelete}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        prevPage={prevPage}
                        nextPage={nextPage}
                    />
                </>
            ) : (
                <window.AppointmentsCalendar 
                    allAppointments={allAppointments} 
                    handleUpdateStatus={handleUpdateStatus} 
                    handleDelete={handleDelete} 
                />
            )}

            {/* المودال والإعلانات */}
            {isModalOpen && (
                <window.AppointmentFormModal 
                    setIsModalOpen={setIsModalOpen}
                    handleAddAppointment={handleAddAppointment}
                    patients={patients}
                    filteredPatients={filteredPatients}
                    formData={formData}
                    setFormData={setFormData}
                    patientSearchTerm={patientSearchTerm}
                    setPatientSearchTerm={setPatientSearchTerm}
                    isDropdownOpen={isDropdownOpen}
                    setIsDropdownOpen={setIsDropdownOpen}
                />
            )}

            <window.AppointmentsPromoBanner />
        </div>
    );
};