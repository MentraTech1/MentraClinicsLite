window.Module_Catalog = function({ clinicId, userId, showToast }) {
    const { useState, useEffect } = React;

    // ==========================================
    // الحالات (States)
    // ==========================================
    const [catalogItems, setCatalogItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // الإحصائيات
    const [stats, setStats] = useState({
        total: 0,
        drugs: 0,
        labs: 0,
        xrays: 0
    });

    // الفلاتر
    const [filters, setFilters] = useState({
        search: '',
        type: 'all' // all, drug, lab, xray, service
    });

    // Pagination (Limit 3)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // نافذة الإضافة/التعديل
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null, type: 'drug', name: '', description: '', price: '', unit: ''
    });

    // قواميس لترجمة الأنواع
    const typeLabels = {
        'drug': { label: 'دواء', icon: 'fa-pills', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        'lab': { label: 'تحليل معملي', icon: 'fa-flask', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
        'xray': { label: 'أشعة', icon: 'fa-x-ray', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
        'service': { label: 'خدمة', icon: 'fa-notes-medical', color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200' }
    };

    // ==========================================
    // جلب البيانات والإحصائيات
    // ==========================================
    useEffect(() => {
        const fetchCatalog = async () => {
            setLoading(true);
            try {
                if (!window.db) return;

                let allItems = await window.db.medical_catalog.where('user_id').equals(userId).toArray();

                setStats({
                    total: allItems.length,
                    drugs: allItems.filter(i => i.type === 'drug').length,
                    labs: allItems.filter(i => i.type === 'lab').length,
                    xrays: allItems.filter(i => i.type === 'xray' || i.type === 'service').length
                });

                if (filters.type !== 'all') {
                    allItems = allItems.filter(i => i.type === filters.type);
                }

                if (filters.search.trim() !== '') {
                    const query = filters.search.toLowerCase();
                    allItems = allItems.filter(i => i.name.toLowerCase().includes(query));
                }

                allItems.sort((a, b) => b.id - a.id);
                setCatalogItems(allItems);
                
                setCurrentPage(1);

            } catch (error) {
                console.error(error);
                showToast("حدث خطأ أثناء تحميل الدليل", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchCatalog();
    }, [userId, filters, refreshTrigger]);

    // ==========================================
    // منطق الـ Pagination
    // ==========================================
    const totalPages = Math.ceil(catalogItems.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = catalogItems.slice(indexOfFirstItem, indexOfLastItem);

    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    // ==========================================
    // العمليات (إضافة / تعديل / حذف)
    // ==========================================
    const handleSaveItem = async (e) => {
        e.preventDefault();
        try {
            const itemData = {
                type: formData.type,
                name: formData.name,
                description: formData.description,
                price: formData.price ? Number(formData.price) : 0,
                unit: formData.unit,
                user_id: userId,
                updated_at: new Date().toISOString()
            };

            if (isEditing) {
                await window.db.medical_catalog.update(formData.id, itemData);
                showToast("تم تحديث بيانات الصنف بنجاح", "success");
            } else {
                itemData.created_at = new Date().toISOString();
                itemData.is_active = 1;
                
                const exist = await window.db.medical_catalog
                    .where({ user_id: userId, type: formData.type, name: formData.name })
                    .first();
                    
                if(exist) return showToast("هذا الصنف موجود مسبقاً في الدليل", "error");

                await window.db.medical_catalog.add(itemData);
                showToast("تم إضافة الصنف للدليل بنجاح", "success");
            }

            setIsModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error(error);
            showToast("حدث خطأ أثناء الحفظ", "error");
        }
    };

    const openEditModal = (item) => {
        setFormData(item);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setFormData({ id: null, type: 'drug', name: '', description: '', price: '', unit: '' });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if(confirm("هل أنت متأكد من حذف هذا الصنف من الدليل؟ لن يظهر في الروشتات بعد الآن.")) {
            try {
                await window.db.medical_catalog.delete(id);
                showToast("تم حذف الصنف", "success");
                setRefreshTrigger(prev => prev + 1);
            } catch (error) {
                showToast("فشل عملية الحذف", "error");
            }
        }
    };

    // ==========================================
    // واجهة المستخدم (UI) - Mobile Optimized
    // ==========================================
    return (
        <div className="space-y-4 md:space-y-6 animate-view pb-24 md:pb-10 max-w-6xl mx-auto">
            
            {/* الهيدر وزر الإضافة */}
            <div className="flex flex-col gap-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm md:flex-row md:justify-between md:items-center">
                <div className="text-center md:text-right">
                    <h2 className="text-xl md:text-2xl font-black text-[#0284C7] flex items-center justify-center md:justify-start gap-2">
                        <i className="fas fa-pills"></i> الدليل الطبي (Catalog)
                    </h2>
                    <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">إدارة الأدوية، التحاليل، والخدمات الخاصة بالعيادة</p>
                </div>
                <button onClick={openAddModal} className="w-full md:w-auto bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-6 py-3.5 md:py-3 rounded-xl font-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 active:scale-95 text-sm md:text-base">
                    <i className="fas fa-plus"></i> إضافة صنف جديد
                </button>
            </div>

            {/* الإحصائيات المصغرة (Mobile Grid) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"><i className="fas fa-list-ul"></i></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400">إجمالي الأصناف</p>
                        <h4 className="text-base md:text-lg font-black text-slate-700">{stats.total}</h4>
                    </div>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0"><i className="fas fa-pills"></i></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400">أدوية وعقاقير</p>
                        <h4 className="text-base md:text-lg font-black text-emerald-600">{stats.drugs}</h4>
                    </div>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0"><i className="fas fa-flask"></i></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400">تحاليل معملية</p>
                        <h4 className="text-base md:text-lg font-black text-purple-600">{stats.labs}</h4>
                    </div>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0"><i className="fas fa-x-ray"></i></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400">أشعة وخدمات</p>
                        <h4 className="text-base md:text-lg font-black text-amber-600">{stats.xrays}</h4>
                    </div>
                </div>
            </div>

            {/* شريط البحث والفلاتر */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 relative z-10">
                <div className="relative flex-1">
                    <input type="text" placeholder="ابحث باسم الدواء أو التحليل..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} className="w-full pl-10 pr-4 py-3 md:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none transition-colors" />
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                </div>
                <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="w-full md:w-48 bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl focus:border-[#0EA5E9] block p-3 md:p-2.5 font-bold outline-none cursor-pointer">
                    <option value="all">جميع الأنواع</option>
                    <option value="drug">أدوية (Drugs)</option>
                    <option value="lab">تحاليل (Labs)</option>
                    <option value="xray">أشعة (X-Ray)</option>
                    <option value="service">خدمات (Services)</option>
                </select>
            </div>

            {/* عرض الأصناف (Cards للموبايل و Table للكمبيوتر) */}
            {loading ? (
                <div className="flex justify-center p-10"><i className="fas fa-spinner fa-spin text-3xl text-[#0EA5E9]"></i></div>
            ) : catalogItems.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <i className="fas fa-box-open text-5xl text-slate-300 mb-4"></i>
                    <h3 className="text-lg font-bold text-slate-600">لا توجد أصناف</h3>
                    <p className="text-sm text-slate-400 mt-1">قم بإضافة الأدوية والتحاليل لتظهر هنا وتستخدمها في الروشتات</p>
                </div>
            ) : (
                <div className="bg-transparent md:bg-white md:rounded-2xl md:border border-slate-100 md:shadow-sm overflow-hidden flex flex-col">
                    
                    {/* تصميم الموبايل (Cards) */}
                    <div className="md:hidden space-y-3">
                        {currentItems.map((item) => {
                            const typeInfo = typeLabels[item.type] || typeLabels['drug'];
                            return (
                                <div key={item.id} className={`bg-white p-4 rounded-xl border ${typeInfo.border} shadow-sm flex flex-col gap-3 relative overflow-hidden`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-black text-slate-700 text-base dir-ltr text-right truncate max-w-[200px]">{item.name}</h3>
                                            {item.unit && <span className="text-[10px] text-slate-400 font-bold block mt-0.5">الوحدة: {item.unit}</span>}
                                        </div>
                                        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 ${typeInfo.bg} ${typeInfo.color}`}>
                                            <i className={`fas ${typeInfo.icon} mr-1`}></i> {typeInfo.label}
                                        </div>
                                    </div>
                                    
                                    {item.description && (
                                        <p className="text-xs text-slate-500 font-semibold bg-slate-50 p-2 rounded-lg">{item.description}</p>
                                    )}

                                    <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-1">
                                        <span className="font-black text-emerald-600 text-sm">
                                            {item.price > 0 ? `${item.price} ج.م` : 'بدون تسعير'}
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditModal(item)} className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center active:scale-95"><i className="fas fa-edit"></i></button>
                                            <button onClick={() => handleDelete(item.id)} className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center active:scale-95"><i className="fas fa-trash-alt"></i></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* تصميم الكمبيوتر (Table) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">اسم الصنف</th>
                                    <th className="px-6 py-4">النوع</th>
                                    <th className="px-6 py-4">وصف / ملاحظات</th>
                                    <th className="px-6 py-4 text-center">السعر (للفوترة)</th>
                                    <th className="px-6 py-4 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {currentItems.map((item) => {
                                    const typeInfo = typeLabels[item.type] || typeLabels['drug'];
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-700 dir-ltr text-right">{item.name}</div>
                                                {item.unit && <div className="text-[10px] text-slate-400 font-bold mt-1">الوحدة: {item.unit}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${typeInfo.bg} ${typeInfo.color}`}>
                                                    <i className={`fas ${typeInfo.icon}`}></i> {typeInfo.label}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-semibold text-slate-500 max-w-[200px] truncate" title={item.description}>
                                                {item.description || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center font-black text-emerald-600">
                                                {item.price > 0 ? `${item.price} ج.م` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center space-x-2 space-x-reverse">
                                                <button onClick={() => openEditModal(item)} title="تعديل" className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-colors"><i className="fas fa-edit"></i></button>
                                                <button onClick={() => handleDelete(item.id)} title="حذف" className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors"><i className="fas fa-trash-alt"></i></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between rounded-xl md:rounded-none mt-3 md:mt-0 shadow-sm md:shadow-none">
                            <button onClick={prevPage} disabled={currentPage === 1} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                                <i className="fas fa-chevron-right md:ml-1"></i> <span className="hidden md:inline">السابق</span>
                            </button>
                            <span className="text-sm font-bold text-slate-500">صفحة <span className="text-[#0284C7] text-lg mx-1">{currentPage}</span> من {totalPages}</span>
                            <button onClick={nextPage} disabled={currentPage === totalPages} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                                <span className="hidden md:inline">التالي</span> <i className="fas fa-chevron-left md:mr-1"></i>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================== */}
            {/* نافذة الإضافة / التعديل (Bottom Sheet in Mobile) */}
            {/* ========================================== */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-0 md:p-4">
                    <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl animate-view overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] pb-safe">
                        <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-sky-50 shrink-0">
                            <h3 className="text-base md:text-lg font-black text-[#0284C7]">{isEditing ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><i className="fas fa-times"></i></button>
                        </div>
                        <form onSubmit={handleSaveItem} className="p-5 md:p-6 space-y-4 overflow-y-auto">
                            
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-2">نوع الصنف <span className="text-rose-500">*</span></label>
                                <div className="grid grid-cols-2 gap-2 md:gap-3">
                                    <label className={`cursor-pointer border p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${formData.type === 'drug' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                        <input type="radio" name="type" value="drug" checked={formData.type === 'drug'} onChange={e=>setFormData({...formData, type:e.target.value})} className="hidden" />
                                        <i className="fas fa-pills text-xl md:text-2xl"></i>
                                        <span className="text-[10px] md:text-xs font-bold">دواء / علاج</span>
                                    </label>
                                    <label className={`cursor-pointer border p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${formData.type === 'lab' ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                        <input type="radio" name="type" value="lab" checked={formData.type === 'lab'} onChange={e=>setFormData({...formData, type:e.target.value})} className="hidden" />
                                        <i className="fas fa-flask text-xl md:text-2xl"></i>
                                        <span className="text-[10px] md:text-xs font-bold">تحليل معملي</span>
                                    </label>
                                    <label className={`cursor-pointer border p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${formData.type === 'xray' ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                        <input type="radio" name="type" value="xray" checked={formData.type === 'xray'} onChange={e=>setFormData({...formData, type:e.target.value})} className="hidden" />
                                        <i className="fas fa-x-ray text-xl md:text-2xl"></i>
                                        <span className="text-[10px] md:text-xs font-bold">أشعة</span>
                                    </label>
                                    <label className={`cursor-pointer border p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${formData.type === 'service' ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                        <input type="radio" name="type" value="service" checked={formData.type === 'service'} onChange={e=>setFormData({...formData, type:e.target.value})} className="hidden" />
                                        <i className="fas fa-notes-medical text-xl md:text-2xl"></i>
                                        <span className="text-[10px] md:text-xs font-bold">خدمة أخرى</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">اسم الصنف (التجاري أو العلمي) <span className="text-rose-500">*</span></label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none dir-ltr text-right" placeholder="مثال: Panadol 500mg" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">السعر (اختياري)</label>
                                    <input type="number" min="0" step="any" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-3.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" placeholder="ج.م" />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">الوحدة (اختياري)</label>
                                    <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full p-3.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" placeholder="شريط، أمبول.." />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">ملاحظات / المادة الفعالة</label>
                                <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3.5 md:p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none resize-none"></textarea>
                            </div>

                            <button type="submit" className="w-full bg-[#0284C7] hover:bg-sky-700 text-white font-black py-4 md:py-3 rounded-xl transition-colors shadow-lg shadow-sky-500/30 mt-2 active:scale-95 text-base">
                                {isEditing ? 'حفظ التعديلات' : 'إضافة الصنف'}
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