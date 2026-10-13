window.VisitFormPage = function({
    goBack, handleSaveVisit, formData, setFormData, vitals, setVitals,
    patients, filteredPatients, patientSearchTerm, setPatientSearchTerm, isPatientDropdownOpen, setIsPatientDropdownOpen, patientStats,
    catalog, filteredCatalog, catalogSearchTerm, setCatalogSearchTerm, isCatalogDropdownOpen, setIsCatalogDropdownOpen,
    currentRxInput, setCurrentRxInput, rxItems, addRxItem, removeRxItem, setIsQuickAddModalOpen,
    invoiceData, setInvoiceData
}) {
    const { useState } = React;
    const isEditMode = !!formData.id;

    // نوع العنصر في الروشتة (دواء / تحليل / أشعة)
    const [rxType, setRxType] = useState('drug'); // 'drug' | 'lab' | 'xray'

    // حالة ربط الموعد
    const [linkWithAppointment, setLinkWithAppointment] = useState(true);

    // كبسولات الجرعات السريعة
    const quickDosages = ['قرص', 'كبسولة', 'ملعقة كبيرة', 'ملعقة صغيرة', 'حقنة عضل', 'أمبول وريد', 'نقط', 'كيس فوار', 'دهان موضعي'];
    const quickFrequencies = ['مرة يومياً', 'كل ١٢ ساعة (مرتين)', 'كل ٨ ساعات (٣ مرات)', 'كل ٦ ساعات', 'عند اللزوم', 'قبل الأكل', 'بعد الأكل', 'قبل النوم'];
    const quickDurations = ['٣ أيام', '٥ أيام', 'أسبوع', '١٠ أيام', 'أسبوعين', 'شهر', 'حتى الشفاء'];
    const quickLabNotes = ['صيام ٨ ساعات', 'صيام ١٢ ساعة', 'على الريق', 'تحليل صباحي', 'بدون صبغة', 'بالصبغة'];

    const onFormSubmit = (e) => {
        handleSaveVisit(e, linkWithAppointment);
    };

    return (
        <div className="space-y-6">
            {/* الهيدر العلوي */}
            <div className="bg-gradient-to-l from-[#0284C7] to-[#0EA5E9] rounded-3xl p-6 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 text-8xl -mt-5 -mr-10"><i className="fas fa-user-md"></i></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-black">{isEditMode ? 'تعديل الكشف الطبي' : 'غرفة الكشف والروشتة الإلكترونية'}</h2>
                    <p className="text-sky-100 text-sm font-bold mt-1">سجل تفاصيل الزيارة، واكتب الروشتة، وأصدر الفاتورة مباشرة بنقرة واحدة.</p>
                </div>
                <button onClick={goBack} className="relative z-10 bg-white/20 hover:bg-white text-white hover:text-[#0284C7] px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors active:scale-95 text-sm">
                    <i className="fas fa-arrow-right"></i> إلغاء ورجوع
                </button>
            </div>

            <form id="visitForm" onSubmit={onFormSubmit} className="space-y-6">
                
                {/* 1. بيانات المريض */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative z-[100]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="relative">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">ابحث واختر المريض <span className="text-rose-500">*</span></label>
                            {patients.length === 0 ? (
                                <div className="text-xs text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100 font-bold">يجب إضافة مريض أولاً من قسم "سجل المرضى"</div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="text" placeholder="ابحث بالاسم أو رقم الهاتف..." value={patientSearchTerm}
                                        onChange={(e) => {
                                            setPatientSearchTerm(e.target.value); setIsPatientDropdownOpen(true);
                                            if(e.target.value === '') setFormData({...formData, patient_id: ''});
                                        }}
                                        onFocus={() => setIsPatientDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setIsPatientDropdownOpen(false), 200)}
                                        className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none"
                                        disabled={isEditMode}
                                    />
                                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                    {isPatientDropdownOpen && patientSearchTerm && !isEditMode && (
                                        <ul className="absolute z-[1000] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                                            {filteredPatients.length > 0 ? (
                                                filteredPatients.map(p => (
                                                    <li key={p.id} onMouseDown={() => { setFormData({...formData, patient_id: p.id}); setPatientSearchTerm(`${p.name} (${p.phone || '-'})`); setIsPatientDropdownOpen(false); }} className="p-4 hover:bg-sky-50 cursor-pointer border-b border-slate-50 text-sm font-bold text-slate-700 transition-colors">
                                                        {p.name} <span className="text-xs text-slate-400">({p.phone || 'لا يوجد رقم'})</span>
                                                    </li>
                                                ))
                                            ) : <li className="p-4 text-sm text-slate-400 text-center font-bold">لا يوجد مريض يطابق بحثك</li>}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">تاريخ الكشف</label>
                                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">نوع الكشف</label>
                                <select value={formData.visit_type} onChange={e => setFormData({...formData, visit_type: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none">
                                    <option value="new">كشف جديد</option>
                                    <option value="follow_up">متابعة / استشارة</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    {patientStats && (
                        <div className="mt-4 p-3.5 bg-sky-50/50 border border-sky-100 rounded-xl flex flex-wrap gap-4 text-sm font-bold text-sky-800">
                            <span className="flex items-center gap-1.5"><i className="fas fa-birthday-cake text-sky-500"></i> العمر: {patientStats.age}</span>
                            <span className="flex items-center gap-1.5"><i className="fas fa-tint text-rose-500"></i> الفصيلة: {patientStats.blood_type}</span>
                            <span className="flex items-center gap-1.5"><i className="fas fa-history text-amber-500"></i> الزيارات السابقة: {patientStats.visitsCount}</span>
                        </div>
                    )}
                </div>

                {/* 2. العلامات الحيوية */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2"><i className="fas fa-heartbeat text-rose-500"></i> العلامات الحيوية (Vitals)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs text-slate-500 font-bold mb-1.5">الضغط (BP)</label>
                            <input type="text" placeholder="120/80" value={vitals.blood_pressure} onChange={e=>setVitals({...vitals, blood_pressure: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none text-center dir-ltr focus:border-[#0EA5E9]" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 font-bold mb-1.5">الحرارة (Temp)</label>
                            <input type="text" placeholder="37.5" value={vitals.temperature} onChange={e=>setVitals({...vitals, temperature: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none text-center dir-ltr focus:border-[#0EA5E9]" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 font-bold mb-1.5">النبض (HR)</label>
                            <input type="text" placeholder="bpm" value={vitals.heart_rate} onChange={e=>setVitals({...vitals, heart_rate: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none text-center dir-ltr focus:border-[#0EA5E9]" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 font-bold mb-1.5">الوزن (WT)</label>
                            <input type="text" placeholder="kg" value={vitals.weight} onChange={e=>setVitals({...vitals, weight: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none text-center dir-ltr focus:border-[#0EA5E9]" />
                        </div>
                    </div>
                </div>

                {/* 3. التشخيص والشكوى */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">الشكوى الرئيسية (Chief Complaint)</label>
                        <textarea rows="3" placeholder="ما الذي يشتكي منه المريض؟" value={formData.chief_complaint} onChange={e=>setFormData({...formData, chief_complaint: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none resize-none"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">التشخيص الطبي (Diagnosis)</label>
                        <textarea rows="3" placeholder="التشخيص النهائي للحالة..." value={formData.diagnosis} onChange={e=>setFormData({...formData, diagnosis: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none resize-none"></textarea>
                    </div>
                </div>

                {/* 4. الروشتة الذكية والفحوصات (محدثة بالكامل) */}
                <div className="bg-white p-5 rounded-2xl border-2 border-emerald-300 shadow-sm relative z-50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-emerald-100 pb-3">
                        <h4 className="text-base font-black text-emerald-800 flex items-center gap-2">
                            <i className="fas fa-file-prescription text-emerald-600 text-lg"></i> الروشتة والفحوصات المطلوبة (Rx)
                        </h4>
                        
                        {/* تبويبات النوع: دواء / تحليل / أشعة */}
                        <div className="flex bg-emerald-50 p-1 rounded-xl border border-emerald-200 text-xs font-bold w-full sm:w-auto">
                            <button type="button" onClick={() => { setRxType('drug'); setCatalogSearchTerm(''); }} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${rxType === 'drug' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-100'}`}>
                                💊 أدوية وعلاج
                            </button>
                            <button type="button" onClick={() => { setRxType('lab'); setCatalogSearchTerm(''); }} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${rxType === 'lab' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-100'}`}>
                                 تحاليل معملية
                            </button>
                            <button type="button" onClick={() => { setRxType('xray'); setCatalogSearchTerm(''); }} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${rxType === 'xray' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-100'}`}>
                                 أشعة وفحوصات
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            {/* حقل اسم الصنف مع دعم الكتابة الحرة واقتراح الدليل */}
                            <div className="md:col-span-5 relative">
                                <label className="block text-xs font-bold text-emerald-800 mb-1">
                                    {rxType === 'drug' ? 'اسم الدواء (اختر من الدليل أو اكتب حراً)' : rxType === 'lab' ? 'اسم التحليل المطلوب' : 'نوع الأشعة المطلوبة'}
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder={rxType === 'drug' ? 'مثال: Panadol 500mg أو اكتب أي اسم...' : rxType === 'lab' ? 'مثال: صورة دم كاملة CBC...' : 'مثال: أشعة سينية على الصدر Chest X-Ray...'} 
                                        value={catalogSearchTerm}
                                        onChange={(e) => {
                                            setCatalogSearchTerm(e.target.value); 
                                            setIsCatalogDropdownOpen(true);
                                            setCurrentRxInput({ ...currentRxInput, custom_name: e.target.value, catalog_id: '' });
                                        }}
                                        onFocus={() => setIsCatalogDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setIsCatalogDropdownOpen(false), 200)}
                                        className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none pr-9"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                                        {rxType === 'drug' ? '💊' : rxType === 'lab' ? '' : ''}
                                    </span>

                                    {/* قائمة الاقتراحات من الدليل */}
                                    {isCatalogDropdownOpen && catalogSearchTerm && (
                                        <ul className="absolute z-[1000] w-full mt-1 bg-white border border-emerald-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                            {filteredCatalog.filter(c => c.type === rxType).length > 0 ? (
                                                filteredCatalog.filter(c => c.type === rxType).map(c => (
                                                    <li key={c.id} onMouseDown={() => { 
                                                        setCurrentRxInput({ ...currentRxInput, catalog_id: c.id, custom_name: c.name }); 
                                                        setCatalogSearchTerm(c.name); 
                                                        setIsCatalogDropdownOpen(false); 
                                                    }} className="p-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 text-sm font-bold text-slate-700 transition-colors flex items-center justify-between">
                                                        <span>{c.name}</span>
                                                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">مسجل بالدليل</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="p-3 text-xs text-amber-700 bg-amber-50/50 text-center font-bold">
                                                    ✨ صنف غير مسجل (سيتم إدراجه كـ كتابة يدوية وحفظه بالدليل تلقائياً)
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* حقول الأدوية (جرعة / تكرار / مدة) */}
                            {rxType === 'drug' ? (
                                <>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-emerald-800 mb-1">الجرعة</label>
                                        <input type="text" placeholder="قرص" value={currentRxInput.dosage} onChange={e=>setCurrentRxInput({...currentRxInput, dosage: e.target.value})} className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold outline-none" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-emerald-800 mb-1">التكرار</label>
                                        <input type="text" placeholder="كل ٨ ساعات" value={currentRxInput.frequency} onChange={e=>setCurrentRxInput({...currentRxInput, frequency: e.target.value})} className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold outline-none" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-emerald-800 mb-1">المدة</label>
                                        <input type="text" placeholder="٥ أيام" value={currentRxInput.duration} onChange={e=>setCurrentRxInput({...currentRxInput, duration: e.target.value})} className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold outline-none" />
                                    </div>
                                </>
                            ) : (
                                /* حقل تعليمات التحليل أو الأشعة */
                                <div className="md:col-span-6">
                                    <label className="block text-xs font-bold text-emerald-800 mb-1">تعليمات أو شروط الفحص</label>
                                    <input type="text" placeholder="مثال: صيام ٨ ساعات، على الريق..." value={currentRxInput.instructions} onChange={e=>setCurrentRxInput({...currentRxInput, instructions: e.target.value})} className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold outline-none" />
                                </div>
                            )}

                            {/* زر الإدراج */}
                            <div className="md:col-span-1">
                                <button 
                                    type="button" 
                                    onClick={() => addRxItem(rxType)} 
                                    disabled={!catalogSearchTerm.trim()} 
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-black transition-all disabled:opacity-40 active:scale-95 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1"
                                    title="إدراج في الروشتة"
                                >
                                    <i className="fas fa-plus"></i> <span className="md:hidden">إدراج</span>
                                </button>
                            </div>
                        </div>

                        {/* الكبسولات السريعة (Quick Chips) لتسريع الإدخال بنقرة واحدة */}
                        {rxType === 'drug' ? (
                            <div className="pt-2 border-t border-emerald-100/70 space-y-2">
                                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                    <span className="text-[11px] font-black text-slate-500 ml-1">جرعة سريعة:</span>
                                    {quickDosages.map((d, i) => (
                                        <button key={i} type="button" onClick={() => setCurrentRxInput({...currentRxInput, dosage: d})} className="bg-white hover:bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold transition-colors">
                                            {d}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                    <span className="text-[11px] font-black text-slate-500 ml-1">تكرار سريع:</span>
                                    {quickFrequencies.map((f, i) => (
                                        <button key={i} type="button" onClick={() => setCurrentRxInput({...currentRxInput, frequency: f})} className="bg-white hover:bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold transition-colors">
                                            {f}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                    <span className="text-[11px] font-black text-slate-500 ml-1">المدة:</span>
                                    {quickDurations.map((dur, i) => (
                                        <button key={i} type="button" onClick={() => setCurrentRxInput({...currentRxInput, duration: dur})} className="bg-white hover:bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold transition-colors">
                                            {dur}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="pt-2 border-t border-emerald-100/70 flex flex-wrap items-center gap-1.5 text-xs">
                                <span className="text-[11px] font-black text-slate-500 ml-1">تعليمات جاهزة:</span>
                                {quickLabNotes.map((note, i) => (
                                    <button key={i} type="button" onClick={() => setCurrentRxInput({...currentRxInput, instructions: note})} className="bg-white hover:bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold transition-colors">
                                        {note}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* قائمة الروشتة الحالية المدرجة */}
                    {rxItems.length > 0 ? (
                        <div className="mt-5 space-y-2.5">
                            <h5 className="text-xs font-black text-slate-500">الأصناف المدرجة في الروشتة ({rxItems.length}):</h5>
                            {rxItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-white border border-emerald-200 p-3.5 rounded-xl shadow-sm hover:border-emerald-300 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">
                                            {item.catalog_type === 'drug' ? '💊' : item.catalog_type === 'lab' ? '' : ''}
                                        </span>
                                        <div>
                                            <span className="font-black text-slate-800 dir-ltr text-right block text-sm">{item.catalog_name}</span>
                                            {item.catalog_type === 'drug' ? (
                                                <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded mt-1 inline-block border border-slate-100">
                                                    {item.dosage || 'جرعة عادية'} | {item.frequency || 'بانتظام'} {item.duration && `| لمدة ${item.duration}`}
                                                </span>
                                            ) : (
                                                item.instructions && (
                                                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded mt-1 inline-block border border-purple-100">
                                                        <i className="fas fa-info-circle ml-1"></i> {item.instructions}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeRxItem(index)} className="text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 w-9 h-9 rounded-xl flex items-center justify-center transition-colors active:scale-95" title="حذف من الروشتة">
                                        <i className="fas fa-trash-alt text-sm"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-center text-slate-400 font-bold mt-4">لم يتم إدراج أي أدوية أو فحوصات في الروشتة بعد.</p>
                    )}
                </div>

                {/* 5. قسم الفاتورة الفورية للكشف (الميزة الجديدة 🧾) */}
                <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={invoiceData.isEnabled} 
                                onChange={(e) => setInvoiceData({ ...invoiceData, isEnabled: e.target.checked })} 
                                className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500" 
                            />
                            <div>
                                <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                    <i className="fas fa-file-invoice-dollar text-amber-500 text-base"></i> إصدار فاتورة وتسجيل إيراد الكشف تلقائياً
                                </h4>
                                <p className="text-xs text-slate-500 font-bold mt-0.5">تُسجل الفاتورة في الحسابات والأرباح فوراً دون الحاجة لفتح شاشة الفواتير.</p>
                            </div>
                        </label>
                        <span className={`px-3 py-1 rounded-lg text-xs font-black ${invoiceData.isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {invoiceData.isEnabled ? 'مفعلة' : 'معطلة'}
                        </span>
                    </div>

                    {invoiceData.isEnabled && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-amber-100 animate-view">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">إجمالي قيمة الكشف (ج.م) <span className="text-rose-500">*</span></label>
                                <input 
                                    type="number" 
                                    min="0"
                                    required={invoiceData.isEnabled}
                                    placeholder="200" 
                                    value={invoiceData.total_amount} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setInvoiceData({ ...invoiceData, total_amount: val, paid_amount: val }); // تلقائياً يجعل المدفوع مساوي للإجمالي
                                    }} 
                                    className="w-full p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-base font-black text-slate-800 outline-none focus:border-amber-500" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المدفوع (المحصل فعلياً)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={invoiceData.paid_amount} 
                                    onChange={(e) => setInvoiceData({ ...invoiceData, paid_amount: e.target.value })} 
                                    className="w-full p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-base font-black text-emerald-600 outline-none focus:border-amber-500" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع</label>
                                <select 
                                    value={invoiceData.payment_method} 
                                    onChange={(e) => setInvoiceData({ ...invoiceData, payment_method: e.target.value })} 
                                    className="w-full p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-amber-500"
                                >
                                    <option value="cash">نقداً (كاش)</option>
                                    <option value="vodafone_cash">فودافون كاش / محفظة</option>
                                    <option value="card">فيزا / بطاقة بنكية</option>
                                    <option value="instapay">إنستاباي (InstaPay)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* 6. خيارات الحفظ والمواعيد */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <label className="flex items-center gap-3 cursor-pointer group mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-sky-300 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={linkWithAppointment} 
                            onChange={(e) => setLinkWithAppointment(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-[#0284C7] focus:ring-[#0EA5E9]" 
                        />
                        <div>
                            <span className="font-bold text-slate-700 text-sm block">تسجيل وتحديث حالة الموعد في جدول الحجوزات</span>
                            <span className="text-xs text-slate-500 font-semibold">(إذا كان المريض مسجلاً اليوم سيتم تحديث حالته إلى "مكتمل"، وإذا لم يكن مسجلاً سيتم إضافته لضبط الإحصائيات)</span>
                        </div>
                    </label>

                    <button type="submit" disabled={!formData.patient_id} form="visitForm" className="w-full bg-[#0284C7] hover:bg-[#0EA5E9] text-white font-black py-4 rounded-xl shadow-lg shadow-sky-500/30 transition-all text-lg disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                        <i className="fas fa-check-circle text-xl"></i> {isEditMode ? 'حفظ التعديلات وإنهاء' : 'حفظ الكشف والروشتة وإنهاء الزيارة'}
                    </button>
                </div>
            </form>
        </div>
    );
};