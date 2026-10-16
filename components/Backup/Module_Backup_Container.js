
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
    // استعادة النسخة الاحتياطية (Restore) - (تم التعديل هنا لحل المشكلة)
   // ==========================================
    // استعادة النسخة الاحتياطية (Restore) - (نسخة متقدمة وآمنة)
    // ==========================================
// ==========================================
    // استعادة النسخة الاحتياطية (Restore) - النسخة المُحصنة (Bulletproof)
    // ==========================================
    const executeRestore = async (jsonString) => {
        setLoading(true); setLogs([]);
        addLog("⏳ بدء عملية الاستعادة... يرجى عدم إغلاق المتصفح.");

        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const backupData = JSON.parse(jsonString);
            
            const tablesOrder = [
                'medical_catalog', 'patients', 'appointments', 'visits', 
                'vitals', 'prescriptions', 'prescription_items', 
                'invoices', 'expenses', 'attachments'
            ];

            const idMap = {};
            tablesOrder.forEach(table => idMap[table] = {});

            await window.db.transaction('rw', tablesOrder.map(t => window.db[t]), async () => {
                
                // مسح بيانات العيادة الحالية أولاً من كل الجداول لضمان النظافة
                for (let table of tablesOrder) {
                    await window.db[table].where('user_id').equals(userId).delete();
                }

                // بعد المسح، نقوم بجمع كل أرقام الهواتف المتبقية في قاعدة البيانات (التي تخص العيادات الأخرى)
                const globalPhones = new Set();
                const remainingPatients = await window.db.patients.toArray();
                remainingPatients.forEach(p => {
                    if (p.phone) globalPhones.add(p.phone.trim().toLowerCase());
                });

                for (let table of tablesOrder) {
                    const records = backupData[table];
                    if (!records || records.length === 0) continue;

                    addLog(`⚙️ جاري معالجة وربط ${records.length} سجل في جدول: ${table}...`);
                    
                    const chunkSize = 1000;
                    for (let i = 0; i < records.length; i += chunkSize) {
                        const chunk = records.slice(i, i + chunkSize);
                        const processedChunk = [];
                        const oldIdsInChunk = [];

                        for (let record of chunk) {
                            const oldId = record.id;
                            oldIdsInChunk.push(oldId);

                            const newRecord = { ...record };
                            delete newRecord.id; 

                            newRecord.user_id = userId;
                            if ('clinic_id' in newRecord) newRecord.clinic_id = clinicId;
                            if ('doctor_id' in newRecord) newRecord.doctor_id = userId;

                            // ==========================================
                            // 🛡️ الخوارزمية المُحصنة لمعالجة تكرار رقم الهاتف
                            // ==========================================
                            if (table === 'patients') {
                                let basePhone = newRecord.phone ? String(newRecord.phone).trim() : "";
                                
                                // 1. إذا كان الهاتف فارغاً تماماً في ملف الباك أب
                                if (!basePhone) {
                                    basePhone = "NO-PHONE-" + Date.now().toString().slice(-6);
                                }

                                // 2. حلقة تكرارية تضمن أن الرقم فريد 100% 
                                // لو الرقم موجود، هنضيف له -C1، لو -C1 موجود هنخليه -C2 وهكذا..
                                let finalPhone = basePhone;
                                let counter = 1;
                                
                                while (globalPhones.has(finalPhone.toLowerCase())) {
                                    finalPhone = `${basePhone}-C${counter}`;
                                    counter++;
                                }

                                // 3. إضافة الرقم الجديد للقائمة عشان المريض اللي بعده في نفس الملف مياخدش نفس الرقم
                                globalPhones.add(finalPhone.toLowerCase());
                                newRecord.phone = finalPhone;
                            }

                            // ==========================================
                            // ربط العلاقات (Foreign Keys Mapping)
                            // ==========================================
                            if (newRecord.patient_id && idMap['patients'][newRecord.patient_id]) 
                                newRecord.patient_id = idMap['patients'][newRecord.patient_id];
                                
                            if (newRecord.appointment_id && idMap['appointments'][newRecord.appointment_id]) 
                                newRecord.appointment_id = idMap['appointments'][newRecord.appointment_id];
                                
                            if (newRecord.visit_id && idMap['visits'][newRecord.visit_id]) 
                                newRecord.visit_id = idMap['visits'][newRecord.visit_id];
                                
                            if (newRecord.prescription_id && idMap['prescriptions'][newRecord.prescription_id]) 
                                newRecord.prescription_id = idMap['prescriptions'][newRecord.prescription_id];
                                
                            if (newRecord.catalog_id && idMap['medical_catalog'][newRecord.catalog_id]) 
                                newRecord.catalog_id = idMap['medical_catalog'][newRecord.catalog_id];

                            processedChunk.push(newRecord);
                        }

                        // إدخال الدفعة واستلام الـ IDs الجديدة بأمان تام
                        const newIds = await window.db[table].bulkAdd(processedChunk, { allKeys: true });

                        // حفظ الخريطة
                        for (let j = 0; j < oldIdsInChunk.length; j++) {
                            idMap[table][oldIdsInChunk[j]] = newIds[j];
                        }
                    }
                }
            });

            addLog("✅ اكتملت استعادة البيانات بنجاح بدون أي تعارض!");
            showToast("تم استعادة النظام بنجاح، سيتم تحديث الصفحة...", "success");
            setTimeout(() => { window.location.reload(); }, 2000);

        } catch (error) {
            console.error(error);
            addLog(`❌ خطأ حرج: تم التراجع عن كل العمليات.`);
            addLog(`تفاصيل الخطأ: ${error.message}`);
            showToast("فشل الاستعادة، يرجى مراجعة سجلات النظام", "error");
        } finally {
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