window.Module_Backup = function({ clinicId, userId, showToast }) {
    const { useState, useEffect, useRef } = React;

    const [activeTab, setActiveTab] = useState('export'); // export, history
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState(['...Waiting for operations']);
    const [backupsList, setBackupsList] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Pagination (Limit 3)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const fileInputRef = useRef(null);
    const logsEndRef = useRef(null);

    // ==========================================
    // تمرير التحديثات لشاشة المراقب (Terminal)
    // ==========================================
    const addLog = (msg) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    // ==========================================
    // جلب قائمة النسخ المحفوظة داخلياً (الخاصة بالعيادة فقط)
    // ==========================================
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
            } catch (error) {
                console.error(error);
            }
        };
        fetchBackups();
    }, [refreshTrigger, currentPage, userId]);

    // منطق Pagination
    const totalPages = Math.ceil(backupsList.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = backupsList.slice(indexOfFirstItem, indexOfLastItem);

    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    // ==========================================
    // دالة إنشاء النسخة الاحتياطية (Export)
    // ==========================================
    const handleBackup = async () => {
        setLoading(true);
        setLogs([]);
        addLog("بدء عملية النسخ الاحتياطي للعيادة...");
        
        try {
            const tablesToExport = [
                'patients', 'appointments', 'visits', 'vitals', 
                'prescriptions', 'prescription_items', 'medical_catalog', 
                'invoices', 'expenses', 'attachments'
            ];

            let backupData = {};
            
            for (let table of tablesToExport) {
                addLog(`جاري تجميع بيانات جدول: ${table}...`);
                const data = await window.db[table].where('user_id').equals(userId).toArray();
                backupData[table] = data;
            }

            addLog("جاري تجميع إعدادات العيادة...");
            backupData['users'] = [await window.db.users.get(userId)];
            backupData['clinic_info'] = await window.db.clinic_info.toArray();

            addLog("جاري ضغط البيانات وتشفيرها...");
            const jsonString = JSON.stringify(backupData);
            
            const bytes = new Blob([jsonString]).size;
            const fileSize = bytes > 1024 * 1024 ? (bytes / (1024 * 1024)).toFixed(2) + ' MB' : (bytes / 1024).toFixed(2) + ' KB';

            const backupName = `MentraClinics_Backup_${new Date().toISOString().split('T')[0]}_${new Date().getTime()}`;
            
            await window.db.backups.add({
                backup_name: backupName,
                backup_data: jsonString,
                backup_type: 'manual',
                user_id: userId,
                created_at: new Date().toISOString(),
                file_size: fileSize,
                is_encrypted: 0
            });
            
            setRefreshTrigger(prev => prev + 1);

            addLog("جاري تجهيز الملف للتحميل...");
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${backupName}.json`;
            link.click();
            URL.revokeObjectURL(url);

            addLog("✅ اكتملت عملية النسخ الاحتياطي بنجاح!");
            showToast("تم إنشاء وتنزيل النسخة بنجاح", "success");

        } catch (error) {
            console.error(error);
            addLog(`❌ حدث خطأ: ${error.message}`);
            showToast("فشل في إنشاء النسخة الاحتياطية", "error");
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // دالة استعادة النسخة الاحتياطية (Restore Core Logic)
    // ==========================================
    const executeRestore = async (jsonString) => {
        setLoading(true);
        setLogs([]);
        addLog("بدء عملية الاستعادة... يرجى عدم إغلاق المتصفح!");
        
        try {
            const backupData = JSON.parse(jsonString);
            const tablesToRestore = [
                'patients', 'appointments', 'visits', 'vitals', 
                'prescriptions', 'prescription_items', 'medical_catalog', 
                'invoices', 'expenses', 'attachments'
            ];

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
            
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            console.error(error);
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
            reader.onload = (event) => {
                executeRestore(event.target.result);
            };
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

    // ==========================================
    // واجهة المستخدم (UI) - Mobile Optimized
    // ==========================================
    return (
        <div className="space-y-4 md:space-y-6 animate-view pb-24 md:pb-10 max-w-6xl mx-auto">
            
            {/* الهيدر والتبويبات */}
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm text-center md:text-right flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-[#0284C7] flex items-center justify-center md:justify-start gap-2">
                        <i className="fas fa-database"></i> إدارة قواعد البيانات
                    </h2>
                    <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">نسخ واستعادة بيانات العيادة بأمان وسرية تامة</p>
                </div>
                {/* Tabs - عرض كامل في الموبايل */}
                <div className="flex w-full md:w-auto bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setActiveTab('export')} className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'export' ? 'bg-white text-[#0284C7] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        النسخ والاستعادة
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'history' ? 'bg-white text-[#0284C7] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        الأرشيف الداخلي
                    </button>
                </div>
            </div>

            {/* محتوى قسم التصدير والاستيراد */}
            {activeTab === 'export' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-view">
                    
                    {/* كارت النسخ (Export) */}
                    <div className="bg-white p-5 md:p-8 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col justify-between">
                        <div>
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center text-3xl md:text-4xl mx-auto mb-4">
                                <i className="fas fa-file-export"></i>
                            </div>
                            <h3 className="text-lg md:text-xl font-black text-slate-700 mb-2">نسخة احتياطية (Backup)</h3>
                            <p className="text-xs md:text-sm font-bold text-slate-500 leading-relaxed mb-6">
                                تقوم هذه العملية بتجميع وتشفير كافة بيانات العيادة في ملف واحد (JSON). يرجى الاحتفاظ بالملف في مكان آمن.
                            </p>
                        </div>
                        <button onClick={handleBackup} disabled={loading} className="w-full bg-[#0284C7] hover:bg-sky-700 text-white font-black py-4 rounded-xl shadow-lg shadow-sky-500/30 transition-all text-base md:text-lg disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-download"></i>}
                            بدء التصدير وتحميل الملف
                        </button>
                    </div>

                    {/* كارت الاستعادة (Import) */}
                    <div className="bg-white p-5 md:p-8 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col justify-between">
                        <div>
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl md:text-4xl mx-auto mb-4">
                                <i className="fas fa-file-import"></i>
                            </div>
                            <h3 className="text-lg md:text-xl font-black text-slate-700 mb-2">استعادة البيانات (Restore)</h3>
                            <p className="text-xs md:text-sm font-bold text-slate-500 leading-relaxed mb-4">
                                قم برفع ملف الـ JSON الخاص بنسختك الاحتياطية هنا لاستعادة العيادة بالكامل في حالة تغيير المتصفح أو الجهاز.
                            </p>
                            <div className="bg-rose-50 text-rose-600 text-[10px] md:text-xs font-bold p-3 rounded-lg border border-rose-100 mb-6">
                                <i className="fas fa-exclamation-triangle"></i> الاستعادة ستقوم بمسح البيانات الحالية واستبدالها ببيانات الملف.
                            </div>
                        </div>
                        
                        <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        
                        <button onClick={() => fileInputRef.current.click()} disabled={loading} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-300 border-dashed font-black py-4 rounded-xl transition-all text-base md:text-lg disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                            <i className="fas fa-upload"></i>
                            اختر ملف الاستعادة (JSON)
                        </button>
                    </div>

                    {/* شاشة المراقب (Terminal Logs) */}
                    <div className="md:col-span-2 bg-[#0B1120] rounded-2xl overflow-hidden shadow-xl border border-slate-800">
                        <div className="bg-slate-900 px-4 py-3 flex items-center gap-2 border-b border-slate-800">
                            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-slate-500 text-[10px] md:text-xs font-bold ml-2 dir-ltr">MentraClinics System Logs</span>
                        </div>
                        <div className="p-4 h-40 md:h-48 overflow-y-auto font-mono text-xs md:text-sm text-emerald-400 dir-ltr text-left">
                            {logs.map((log, i) => (
                                <div key={i} className="mb-1">{log}</div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    </div>

                </div>
            )}

            {/* محتوى قسم الأرشيف الداخلي */}
            {activeTab === 'history' && (
                <div className="bg-transparent md:bg-white md:rounded-2xl md:border border-slate-100 md:shadow-sm overflow-hidden animate-view flex flex-col">
                    
                    <div className="hidden md:flex p-6 border-b border-slate-100 bg-sky-50 justify-between items-center">
                        <div>
                            <h3 className="font-black text-[#0284C7] flex items-center gap-2">
                                <i className="fas fa-archive"></i> أرشيف اللقطات المحلية (Snapshots)
                            </h3>
                            <p className="text-xs font-bold text-slate-500 mt-1">يحتفظ النظام بنسخة داخلية تلقائية للرجوع إليها سريعاً.</p>
                        </div>
                    </div>

                    {backupsList.length === 0 ? (
                        <div className="text-center p-10 md:p-12 bg-white rounded-2xl md:rounded-none shadow-sm md:shadow-none">
                            <i className="fas fa-inbox text-5xl md:text-6xl text-slate-200 mb-4"></i>
                            <h3 className="text-base md:text-lg font-bold text-slate-500">لا يوجد أرشيف داخلي</h3>
                            <p className="text-xs md:text-sm text-slate-400 mt-1">قم بإنشاء نسخة احتياطية أولاً من التبويب الآخر.</p>
                        </div>
                    ) : (
                        <>
                            {/* تصميم الجوال (Cards) */}
                            <div className="md:hidden space-y-3">
                                {currentItems.map((backup) => (
                                    <div key={backup.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                                        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                                            <div>
                                                <h3 className="font-black text-slate-700 text-sm dir-ltr text-right truncate max-w-[200px]">{backup.backup_name}</h3>
                                                <div className="text-[10px] font-bold text-slate-400 mt-1"><i className="far fa-clock"></i> {backup.created_at.replace('T', ' ').substring(0, 16)}</div>
                                            </div>
                                            <span className="bg-sky-50 text-sky-600 font-black px-2 py-1 rounded text-[10px] border border-sky-100 shrink-0">
                                                {backup.file_size}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleRestoreFromHistory(backup)} className="flex-1 bg-emerald-50 text-emerald-600 py-2.5 rounded-lg font-bold text-xs shadow-sm active:scale-95 flex items-center justify-center gap-1 border border-emerald-100">
                                                <i className="fas fa-undo-alt"></i> استعادة النسخة
                                            </button>
                                            <button onClick={() => handleDeleteBackup(backup.id)} className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center active:scale-95 border border-rose-100">
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* تصميم الكمبيوتر (Table) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-right text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">اسم / تاريخ النسخة</th>
                                            <th className="px-6 py-4">الحجم</th>
                                            <th className="px-6 py-4 text-center">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {currentItems.map((backup) => (
                                            <tr key={backup.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-black text-slate-700 dir-ltr text-right truncate max-w-xs">{backup.backup_name}</div>
                                                    <div className="text-xs font-bold text-slate-400 mt-1">{backup.created_at.replace('T', ' ').substring(0, 16)}</div>
                                                </td>
                                                <td className="px-6 py-4 font-black text-[#0284C7]">{backup.file_size}</td>
                                                <td className="px-6 py-4 text-center space-x-2 space-x-reverse">
                                                    <button onClick={() => handleRestoreFromHistory(backup)} title="استعادة هذه النسخة" className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold text-xs transition-colors shadow-sm">
                                                        <i className="fas fa-undo-alt ml-1"></i> استعادة
                                                    </button>
                                                    <button onClick={() => handleDeleteBackup(backup.id)} title="حذف النسخة" className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors">
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="p-4 bg-white md:bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-xl md:rounded-none mt-3 md:mt-0 shadow-sm md:shadow-none">
                                    <button onClick={prevPage} disabled={currentPage === 1} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white transition-colors disabled:opacity-50 active:scale-95">
                                        <i className="fas fa-chevron-right md:ml-1"></i> <span className="hidden md:inline">السابق</span>
                                    </button>
                                    <span className="text-sm font-bold text-slate-500">صفحة <span className="text-[#0284C7] text-lg mx-1">{currentPage}</span> من {totalPages}</span>
                                    <button onClick={nextPage} disabled={currentPage === totalPages} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white transition-colors disabled:opacity-50 active:scale-95">
                                        <span className="hidden md:inline">التالي</span> <i className="fas fa-chevron-left md:mr-1"></i>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ====== إعلان النسخة المدفوعة والدعم الفني ====== */}
            <div className="mt-6 md:mt-8 bg-gradient-to-r from-[#0f766e] to-[#0284c7] rounded-3xl p-5 md:p-6 text-white shadow-lg relative overflow-hidden text-right" dir="rtl">
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
                                أنت تستخدم النسخة المحدودة (Lite). تواصل معنا الآن لتفعيل إدارة ملفات المرضى الإلكترونية، الروشتات الذكية، والتقارير المالية.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <a href="tel:01211934816" className="w-full sm:w-auto justify-center bg-amber-400 text-slate-900 px-5 py-3.5 md:py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-amber-300 transition-all active:scale-95 shadow-md">
                            <i className="fas fa-shopping-cart text-base"></i>
                            <span>طلب النسخة (المبيعات)</span>
                        </a>
                        <a href="https://wa.me/201211934816" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto justify-center bg-white/10 backdrop-blur-sm border border-white/25 px-5 py-3.5 md:py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/20 transition-all active:scale-95">
                            <i className="fab fa-whatsapp text-emerald-400 text-base"></i>
                            <span>الدعم الفني</span>
                        </a>
                    </div>
                </div>
            </div>

        </div>
    );
};