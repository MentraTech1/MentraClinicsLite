window.Module_Backup_Container = function({ clinicId, userId, showToast }) {
    const { useState, useEffect, useRef } = React;

    const [activeTab, setActiveTab] = useState('export'); // export, history
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState(['...Waiting for operations']);
    const [backupsList, setBackupsList] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const fileInputRef = useRef(null);
    const logsEndRef = useRef(null);

    // ==========================================
    // تمرير التحديثات لشاشة المراقب (Terminal)
    const addLog = (msg) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    useEffect(() => {
        if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    // ==========================================
    // جلب قائمة النسخ المحفوظة داخلياً
    useEffect(() => {
        const fetchBackups = async () => {
            try {
                if (!window.db) return;
                const allBackups = await window.db.backups.toArray();
                const userBackups = allBackups.filter(b => b.user_id === userId);
                userBackups.sort((a, b) => b.id - a.id);
                setBackupsList(userBackups);
                
                if (currentPage > Math.ceil(userBackups.length / itemsPerPage) && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } catch (error) { console.error(error); }
        };
        fetchBackups();
    }, [refreshTrigger, currentPage, userId]);

    // Pagination
    const totalPages = Math.ceil(backupsList.length / itemsPerPage) || 1;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = backupsList.slice(indexOfFirstItem, indexOfLastItem);

    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    // ==========================================
    // إنشاء النسخة الاحتياطية (Export)
    const handleBackup = async () => {
        setLoading(true); setLogs([]);
        addLog("بدء عملية النسخ الاحتياطي للعيادة...");
        try {
            const tablesToExport = ['patients', 'appointments', 'visits', 'vitals', 'prescriptions', 'prescription_items', 'medical_catalog', 'invoices', 'expenses', 'attachments'];
            let backupData = {};
            for (let table of tablesToExport) {
                addLog(`جاري تجميع بيانات جدول: ${table}...`);
                backupData[table] = await window.db[table].where('user_id').equals(userId).toArray();
            }
            addLog("جاري تجميع إعدادات العيادة...");
            backupData['users'] = [await window.db.users.get(userId)];
            backupData['clinic_info'] = await window.db.clinic_info.toArray();

            addLog("جاري ضغط البيانات...");
            const jsonString = JSON.stringify(backupData);
            const bytes = new Blob([jsonString]).size;
            const fileSize = bytes > 1024 * 1024 ? (bytes / (1024 * 1024)).toFixed(2) + ' MB' : (bytes / 1024).toFixed(2) + ' KB';
            const backupName = `MentraClinics_Backup_${new Date().toISOString().split('T')[0]}_${new Date().getTime()}`;
            
            await window.db.backups.add({ backup_name: backupName, backup_data: jsonString, backup_type: 'manual', user_id: userId, created_at: new Date().toISOString(), file_size: fileSize, is_encrypted: 0 });
            setRefreshTrigger(prev => prev + 1);

            addLog("جاري تجهيز الملف للتحميل...");
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url; link.download = `${backupName}.json`; link.click();
            URL.revokeObjectURL(url);

            addLog("✅ اكتملت عملية النسخ الاحتياطي بنجاح!");
            showToast("تم إنشاء وتنزيل النسخة بنجاح", "success");
        } catch (error) {
            addLog(`❌ حدث خطأ: ${error.message}`);
            showToast("فشل في إنشاء النسخة الاحتياطية", "error");
        } finally { setLoading(false); }
    };

    // ==========================================
    // استعادة النسخة الاحتياطية (Restore)
    const executeRestore = async (jsonString) => {
        setLoading(true); setLogs([]);
        addLog("بدء عملية الاستعادة... يرجى عدم إغلاق المتصفح!");
        try {
            const backupData = JSON.parse(jsonString);
            const tablesToRestore = ['patients', 'appointments', 'visits', 'vitals', 'prescriptions', 'prescription_items', 'medical_catalog', 'invoices', 'expenses', 'attachments'];
            for (let table of tablesToRestore) {
                if (backupData[table]) {
                    addLog(`مسح البيانات الحالية وإحلال بيانات جدول: ${table}...`);
                    await window.db[table].where('user_id').equals(userId).delete();
                    addLog(`استعادة ${backupData[table].length} سجل...`);
                    await window.db[table].bulkPut(backupData[table]);
                }
            }
            addLog("✅ اكتملت استعادة البيانات بنجاح!");
            showToast("تم استعادة النظام بنجاح، سيتم تحديث الصفحة...", "success");
            setTimeout(() => { window.location.reload(); }, 2000);
        } catch (error) {
            addLog(`❌ فشل في قراءة أو استعادة الملف: ${error.message}`);
            showToast("الملف غير صالح أو تالف", "error");
            setLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (confirm("تحذير: هذه العملية ستقوم بحذف بيانات العيادة الحالية واستبدالها ببيانات الملف المرفق. هل أنت متأكد؟")) {
            const reader = new FileReader();
            reader.onload = (event) => { executeRestore(event.target.result); };
            reader.readAsText(file);
        }
        e.target.value = ''; 
    };

    const handleRestoreFromHistory = (backup) => {
        if (confirm(`تحذير: سيتم استعادة النسخة المسماة (${backup.backup_name}). هل أنت متأكد؟`)) {
            executeRestore(backup.backup_data);
        }
    };

    const handleDeleteBackup = async (id) => {
        if (confirm("هل أنت متأكد من حذف هذه النسخة من الأرشيف؟")) {
            await window.db.backups.delete(id);
            setRefreshTrigger(prev => prev + 1);
            showToast("تم حذف النسخة الاحتياطية", "success");
        }
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-view pb-24 md:pb-10 max-w-6xl mx-auto">
            <window.BackupHeader activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === 'export' && (
                <window.TabExport 
                    handleBackup={handleBackup} loading={loading}
                    fileInputRef={fileInputRef} handleFileUpload={handleFileUpload}
                    logs={logs} logsEndRef={logsEndRef}
                />
            )}

            {activeTab === 'history' && (
                <window.TabHistory 
                    backupsList={backupsList} currentItems={currentItems}
                    handleRestoreFromHistory={handleRestoreFromHistory} handleDeleteBackup={handleDeleteBackup}
                    totalPages={totalPages} currentPage={currentPage} prevPage={prevPage} nextPage={nextPage}
                />
            )}

            <window.BackupPromoBanner />
        </div>
    );
};