window.Module_Catalog_Container = function({ clinicId, userId, showToast }) {
    const { useState, useEffect } = React;

    const [catalogItems, setCatalogItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [stats, setStats] = useState({ total: 0, drugs: 0, labs: 0, xrays: 0 });
    const [filters, setFilters] = useState({ search: '', type: 'all' });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null, type: 'drug', name: '', description: '', price: '', unit: ''
    });

    // جلب البيانات
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
                showToast("حدث خطأ أثناء تحميل الدليل", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchCatalog();
    }, [userId, filters, refreshTrigger]);

    // Pagination
    const totalPages = Math.ceil(catalogItems.length / itemsPerPage) || 1;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = catalogItems.slice(indexOfFirstItem, indexOfLastItem);

    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    // العمليات العادية (إضافة / تعديل / حذف)
    const handleSaveItem = async (e) => {
        e.preventDefault();
        try {
            const itemData = {
                type: formData.type, name: formData.name.trim(), description: formData.description,
                price: formData.price ? Number(formData.price) : 0, unit: formData.unit,
                user_id: userId, updated_at: new Date().toISOString()
            };

            if (isEditing) {
                await window.db.medical_catalog.update(formData.id, itemData);
                showToast("تم تحديث بيانات الصنف بنجاح", "success");
            } else {
                itemData.created_at = new Date().toISOString();
                itemData.is_active = 1;
                const exist = await window.db.medical_catalog.where({ user_id: userId, type: formData.type, name: itemData.name }).first();
                if(exist) return showToast("هذا الصنف موجود مسبقاً في الدليل", "error");
                await window.db.medical_catalog.add(itemData);
                showToast("تم إضافة الصنف للدليل بنجاح", "success");
            }
            setIsModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            showToast("حدث خطأ أثناء الحفظ", "error");
        }
    };

    const openEditModal = (item) => { setFormData(item); setIsEditing(true); setIsModalOpen(true); };
    const openAddModal = () => { setFormData({ id: null, type: 'drug', name: '', description: '', price: '', unit: '' }); setIsEditing(false); setIsModalOpen(true); };
    
    const handleDelete = async (id) => {
        if(confirm("هل أنت متأكد من حذف هذا الصنف من الدليل؟")) {
            await window.db.medical_catalog.delete(id);
            showToast("تم حذف الصنف", "success");
            setRefreshTrigger(prev => prev + 1);
        }
    };

    // ===============================================
    // ميزة رفع شيت الإكسيل (Bulk Import & Update) الذكية
    // ===============================================
    const handleExcelUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsImporting(true);
        showToast("جاري فحص وتحديث البيانات، يرجى الانتظار...", "info");

        if (typeof window.XLSX === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = window.XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const rows = window.XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

                if (rows.length === 0) {
                    setIsImporting(false);
                    return showToast("ملف الإكسيل فارغ", "error");
                }

                // 1. جلب جميع الأصناف الحالية في قاموس (Map) لسرعة البحث
                const existingItems = await window.db.medical_catalog.where('user_id').equals(userId).toArray();
                const existingMap = new Map();
                existingItems.forEach(item => {
                    // المفتاح هو (النوع + الاسم) لتفادي الخلط بين دواء وتحليل بنفس الاسم
                    const key = `${item.type}_${item.name.trim().toLowerCase()}`;
                    existingMap.set(key, item);
                });

                let itemsToAdd = [];
                let itemsToUpdate = [];
                let addedCount = 0;
                let updatedCount = 0;

                for (let row of rows) {
                    const name = String(row['الاسم'] || row['اسم الصنف'] || row['Name'] || row['name'] || '').trim();
                    if (!name) continue;

                    let type = 'drug';
                    const rawType = String(row['النوع'] || row['Type'] || row['type'] || '').toLowerCase();
                    if(rawType.includes('تحليل') || rawType.includes('lab')) type = 'lab';
                    else if(rawType.includes('أشعة') || rawType.includes('xray')) type = 'xray';
                    else if(rawType.includes('خدمة') || rawType.includes('service')) type = 'service';

                    const price = Number(row['السعر'] || row['Price'] || row['price'] || 0);
                    const unit = String(row['الوحدة'] || row['Unit'] || row['unit'] || '').trim();
                    const description = String(row['وصف'] || row['ملاحظات'] || row['Description'] || row['Notes'] || '').trim();

                    const itemKey = `${type}_${name.toLowerCase()}`;

                    if (existingMap.has(itemKey)) {
                        // الصنف موجود بالفعل -> نقوم بتحديث الأسعار والملاحظات
                        const existingItem = existingMap.get(itemKey);
                        existingItem.price = price;
                        existingItem.unit = unit;
                        existingItem.description = description;
                        existingItem.updated_at = new Date().toISOString();
                        
                        itemsToUpdate.push(existingItem);
                        updatedCount++;
                    } else {
                        // الصنف غير موجود -> إضافة جديدة
                        itemsToAdd.push({
                            type, name, description, price, unit, user_id: userId,
                            is_active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
                        });
                        addedCount++;
                    }
                }

                // تنفيذ العمليات على قاعدة البيانات
                if (itemsToAdd.length > 0) {
                    await window.db.medical_catalog.bulkAdd(itemsToAdd); // إضافة الجديد
                }
                
                if (itemsToUpdate.length > 0) {
                    await window.db.medical_catalog.bulkPut(itemsToUpdate); // تحديث القديم بناءً على الـ id
                }
                
                // إظهار رسالة تفصيلية للمستخدم
                if (addedCount > 0 || updatedCount > 0) {
                    let msgParts = [];
                    if (addedCount > 0) msgParts.push(`إضافة ${addedCount} جديد`);
                    if (updatedCount > 0) msgParts.push(`تحديث ${updatedCount} حالي`);
                    showToast(`تم ${msgParts.join(' و ')} بنجاح!`, "success");
                } else {
                    showToast("لم يتم العثور على أي بيانات صالحة في الملف", "error");
                }

                setRefreshTrigger(prev => prev + 1);
                
            } catch (err) {
                console.error(err);
                showToast("حدث خطأ أثناء قراءة الملف، تأكد من صحة الصيغة", "error");
            } finally {
                setIsImporting(false);
                e.target.value = ''; // تصفير الـ Input للسماح برفع نفس الملف مجدداً إن لزم الأمر
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-view pb-24 md:pb-10 max-w-7xl mx-auto">
            <window.CatalogHeader openAddModal={openAddModal} handleExcelUpload={handleExcelUpload} isImporting={isImporting} />
            <window.CatalogStats stats={stats} />
            <window.CatalogFilters filters={filters} setFilters={setFilters} />
            
            <window.CatalogList 
                loading={loading} catalogLength={catalogItems.length} currentItems={currentItems}
                openEditModal={openEditModal} handleDelete={handleDelete}
                totalPages={totalPages} currentPage={currentPage} prevPage={prevPage} nextPage={nextPage}
            />

            {isModalOpen && (
                <window.CatalogFormModal 
                    setIsModalOpen={setIsModalOpen} isEditing={isEditing}
                    formData={formData} setFormData={setFormData} handleSaveItem={handleSaveItem}
                />
            )}
            <window.CatalogPromoBanner />
        </div>
    );
};