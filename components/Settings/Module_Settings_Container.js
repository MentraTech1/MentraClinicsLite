window.Module_Settings_Container = function({ clinicId, userId, showToast }) {
    const { useState, useEffect } = React;

    const [activeTab, setActiveTab] = useState('profile'); 
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        clinic_id: null, clinic_name: '', owner_name: '', phone: '', password: '', security_key: '' // تمت إضافة security_key
    });

    const [storageInfo, setStorageInfo] = useState({ usage: 0, quota: 0, percent: 0 });
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deleteType, setDeleteType] = useState(''); 
    const [confirmText, setConfirmText] = useState('');

    useEffect(() => {
        const fetchSettingsData = async () => {
            setLoading(true);
            try {
                if (!window.db) return;

                const user = await window.db.users.get(userId);
                const clinic = await window.db.clinic_info.toCollection().first();

                if (user && clinic) {
                    setFormData({
                        clinic_id: clinic.id, clinic_name: clinic.clinic_name,
                        owner_name: user.name, phone: user.phone, password: user.password,
                        security_key: user.security_key || '' // استدعاء المفتاح إن وجد
                    });
                }

                if (navigator.storage && navigator.storage.estimate) {
                    const estimate = await navigator.storage.estimate();
                    const usageMB = (estimate.usage / (1024 * 1024)).toFixed(2);
                    const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(2);
                    const percent = ((estimate.usage / estimate.quota) * 100).toFixed(1);
                    setStorageInfo({ usage: usageMB, quota: quotaMB, percent: percent });
                }
            } catch (error) {
                console.error(error);
                showToast("حدث خطأ في تحميل الإعدادات", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchSettingsData();
    }, [userId]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const existingUser = await window.db.users.where('phone').equals(formData.phone.trim()).first();
            if (existingUser && existingUser.id !== userId) return showToast("رقم الهاتف هذا مستخدم لحساب آخر", "error");

            await window.db.clinic_info.update(formData.clinic_id, { clinic_name: formData.clinic_name, updated_at: new Date().toISOString() });
            await window.db.users.update(userId, { name: formData.owner_name, phone: formData.phone.trim(), password: formData.password });

            const session = JSON.parse(localStorage.getItem('MentraClinics_Session'));
            session.name = formData.owner_name; session.clinic_name = formData.clinic_name;
            localStorage.setItem('MentraClinics_Session', JSON.stringify(session));

            showToast("تم حفظ الإعدادات بنجاح", "success");
        } catch (error) { showToast("فشل تحديث البيانات", "error"); }
    };

    // الدالة الجديدة الخاصة بحفظ مفتاح الأمان
    const handleUpdateSecurityKey = async (e) => {
        e.preventDefault();
        try {
            if(!formData.security_key.trim()) return showToast("لا يمكن ترك مفتاح الأمان فارغاً", "error");

            // التحقق من عدم استخدام المفتاح لحساب آخر (نادر الحدوث لكن للحيطة)
            const existingKey = await window.db.users.where('security_key').equals(formData.security_key.trim()).first();
            if (existingKey && existingKey.id !== userId) {
                return showToast("هذا المفتاح مستخدم بالفعل، الرجاء توليد مفتاح آخر", "error");
            }

            await window.db.users.update(userId, { security_key: formData.security_key.trim() });
            showToast("تم حفظ مفتاح الأمان بنجاح", "success");
        } catch (error) { showToast("فشل حفظ المفتاح", "error"); }
    };

    const openDangerModal = (type) => {
        setDeleteType(type); setConfirmText(''); setIsConfirmModalOpen(true);
    };

    const handleExecuteDelete = async (e) => {
        // ... (نفس الكود السابق بدون تغيير)
    };

    if (loading) return <div className="flex justify-center p-20"><i className="fas fa-spinner fa-spin text-4xl text-[#0EA5E9]"></i></div>;

    return (
        <div className="space-y-4 md:space-y-6 animate-view pb-24 md:pb-10 max-w-5xl mx-auto">
            <window.SettingsHeader />

            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <window.SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-8">
                    {activeTab === 'profile' && <window.TabProfile formData={formData} setFormData={setFormData} handleUpdateProfile={handleUpdateProfile} />}
                    {activeTab === 'security' && <window.TabSecurity formData={formData} setFormData={setFormData} handleUpdateSecurityKey={handleUpdateSecurityKey} />}
                    {activeTab === 'storage' && <window.TabStorage storageInfo={storageInfo} />}
                    {activeTab === 'danger' && <window.TabDanger openDangerModal={openDangerModal} />}
                </div>
            </div>

            {isConfirmModalOpen && (
                <window.DangerConfirmModal setIsConfirmModalOpen={setIsConfirmModalOpen} handleExecuteDelete={handleExecuteDelete} confirmText={confirmText} setConfirmText={setConfirmText} />
            )}
            <window.SettingsPromoBanner />
        </div>
    );
};