window.VisitFormModal = function({
    closeModals, handleSaveVisit, formData, setFormData, vitals, setVitals,
    patients, filteredPatients, patientSearchTerm, setPatientSearchTerm, isPatientDropdownOpen, setIsPatientDropdownOpen, patientStats,
    catalog, filteredCatalog, catalogSearchTerm, setCatalogSearchTerm, isCatalogDropdownOpen, setIsCatalogDropdownOpen,
    currentRxInput, setCurrentRxInput, rxItems, addRxItem, removeRxItem, setIsQuickAddModalOpen
}) {
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[900] flex items-end md:items-center justify-center p-0 md:p-4 print:hidden">
            <div className="bg-white w-full md:max-w-5xl md:rounded-2xl rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl animate-view overflow-hidden pb-safe">
                
                <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-l from-[#0284C7] to-[#0EA5E9] text-white shrink-0">
                    <h3 className="text-lg md:text-xl font-black flex items-center gap-2"><i className="fas fa-user-md"></i> كشف طبي وروشتة</h3>
                    <button onClick={closeModals} className="bg-white/20 hover:bg-white text-white hover:text-[#0284C7] w-8 h-8 rounded-full md:rounded-lg flex items-center justify-center shadow-sm"><i className="fas fa-times"></i></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
                    <form id="visitForm" onSubmit={handleSaveVisit} className="space-y-4 md:space-y-6">
                        
                        {/* 1. بيانات المريض */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">ابحث واختر المريض <span className="text-rose-500">*</span></label>
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
                                                className="w-full p-3.5 md:p-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none"
                                            />
                                            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                            {isPatientDropdownOpen && patientSearchTerm && (
                                                <ul className="absolute z-[1000] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                                    {filteredPatients.length > 0 ? (
                                                        filteredPatients.map(p => (
                                                            <li key={p.id} onMouseDown={() => { setFormData({...formData, patient_id: p.id}); setPatientSearchTerm(`${p.name} (${p.phone || '-'})`); setIsPatientDropdownOpen(false); }} className="p-4 md:p-3 hover:bg-sky-50 cursor-pointer border-b border-slate-50 text-sm font-bold text-slate-700 transition-colors">
                                                                {p.name} <span className="text-[10px] md:text-xs text-slate-400 block md:inline">({p.phone || 'لا يوجد رقم'})</span>
                                                            </li>
                                                        ))
                                                    ) : <li className="p-4 md:p-3 text-sm text-slate-400 text-center font-bold">لا يوجد مريض يطابق بحثك</li>}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3 md:gap-2">
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">التاريخ</label>
                                        <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3.5 md:p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">نوع الكشف</label>
                                        <select value={formData.visit_type} onChange={e => setFormData({...formData, visit_type: e.target.value})} className="w-full p-3.5 md:p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none">
                                            <option value="new">كشف جديد</option>
                                            <option value="follow_up">متابعة / استشارة</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {patientStats && (
                                <div className="mt-4 p-3 bg-sky-50 border border-sky-100 rounded-xl flex flex-wrap gap-2 md:gap-4 text-xs font-bold text-sky-800">
                                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-sky-50"><i className="fas fa-birthday-cake text-sky-500"></i> العمر: {patientStats.age}</span>
                                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-sky-50"><i className="fas fa-tint text-rose-500"></i> الفصيلة: {patientStats.blood_type}</span>
                                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-sky-50"><i className="fas fa-history text-amber-500"></i> الزيارات: {patientStats.visitsCount}</span>
                                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-sky-50 w-full sm:w-auto"><i className="fas fa-calendar-alt text-emerald-500"></i> آخر زيارة: {patientStats.lastVisit}</span>
                                </div>
                            )}
                        </div>

                        {/* 2. العلامات الحيوية */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="text-xs md:text-sm font-black text-slate-700 mb-3 flex items-center gap-2"><i className="fas fa-heartbeat text-rose-500"></i> العلامات الحيوية (Vitals)</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-[10px] text-slate-400 font-bold mb-1">الضغط</label>
                                    <input type="text" placeholder="120/80" value={vitals.blood_pressure} onChange={e=>setVitals({...vitals, blood_pressure: e.target.value})} className="w-full p-3.5 md:p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none text-center dir-ltr" />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-400 font-bold mb-1">الحرارة</label>
                                    <input type="text" placeholder="37.5" value={vitals.temperature} onChange={e=>setVitals({...vitals, temperature: e.target.value})} className="w-full p-3.5 md:p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none text-center dir-ltr" />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-400 font-bold mb-1">النبض</label>
                                    <input type="text" placeholder="bpm" value={vitals.heart_rate} onChange={e=>setVitals({...vitals, heart_rate: e.target.value})} className="w-full p-3.5 md:p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none text-center dir-ltr" />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-400 font-bold mb-1">الوزن</label>
                                    <input type="text" placeholder="kg" value={vitals.weight} onChange={e=>setVitals({...vitals, weight: e.target.value})} className="w-full p-3.5 md:p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none text-center dir-ltr" />
                                </div>
                            </div>
                        </div>

                        {/* 3. التشخيص والشكوى */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">الشكوى الرئيسية (C.C)</label>
                                <textarea rows="2" value={formData.chief_complaint} onChange={e=>setFormData({...formData, chief_complaint: e.target.value})} className="w-full p-3 md:p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none resize-none"></textarea>
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1">التشخيص (Diagnosis)</label>
                                <textarea rows="2" value={formData.diagnosis} onChange={e=>setFormData({...formData, diagnosis: e.target.value})} className="w-full p-3 md:p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none resize-none"></textarea>
                            </div>
                        </div>

                        {/* 4. الروشتة */}
                        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm relative overflow-visible">
                            <h4 className="text-xs md:text-sm font-black text-emerald-700 mb-3 flex items-center gap-2"><i className="fas fa-pills"></i> الروشتة الطبية (Rx)</h4>
                            
                            <div className="flex flex-col md:flex-row gap-3 bg-emerald-50/50 p-3 md:p-4 rounded-xl border border-emerald-100">
                                <div className="w-full md:flex-1 relative">
                                    <label className="block text-[10px] md:text-xs font-bold text-emerald-700 mb-1">ابحث عن الدواء / الإجراء</label>
                                    <div className="flex gap-2 relative">
                                        <div className="relative w-full">
                                            <input type="text" placeholder="اكتب اسم العلاج..." value={catalogSearchTerm}
                                                onChange={(e) => {
                                                    setCatalogSearchTerm(e.target.value); setIsCatalogDropdownOpen(true);
                                                    if(e.target.value === '') setCurrentRxInput({...currentRxInput, catalog_id: ''});
                                                }}
                                                onFocus={() => setIsCatalogDropdownOpen(true)}
                                                onBlur={() => setTimeout(() => setIsCatalogDropdownOpen(false), 200)}
                                                className="w-full p-3.5 md:p-2 bg-white border border-emerald-200 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none"
                                            />
                                            {isCatalogDropdownOpen && catalogSearchTerm && (
                                                <ul className="absolute z-[1000] w-full mt-1 bg-white border border-emerald-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                                    {filteredCatalog.length > 0 ? (
                                                        filteredCatalog.map(c => (
                                                            <li key={c.id} onMouseDown={() => { setCurrentRxInput({...currentRxInput, catalog_id: c.id}); setCatalogSearchTerm(c.name); setIsCatalogDropdownOpen(false); }} className="p-4 md:p-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 text-sm font-bold text-slate-700 transition-colors flex items-center gap-2">
                                                                <span className="text-lg">{c.type === 'drug' ? '💊' : '🔬'}</span> {c.name}
                                                            </li>
                                                        ))
                                                    ) : <li className="p-4 text-sm text-slate-400 text-center font-bold">غير موجود في الدليل</li>}
                                                </ul>
                                            )}
                                        </div>
                                        <button type="button" onClick={() => setIsQuickAddModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white w-12 md:w-10 rounded-xl font-bold flex items-center justify-center shrink-0 active:scale-95 shadow-sm" title="إضافة صنف للقاعدة"><i className="fas fa-plus"></i></button>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full md:w-auto">
                                    <div className="flex-1 md:w-24">
                                        <label className="block text-[10px] md:text-xs font-bold text-emerald-700 mb-1">الجرعة</label>
                                        <input type="text" placeholder="قرص" value={currentRxInput.dosage} onChange={e=>setCurrentRxInput({...currentRxInput, dosage: e.target.value})} className="w-full p-3.5 md:p-2 bg-white border border-emerald-200 rounded-xl text-sm font-bold outline-none" />
                                    </div>
                                    <div className="flex-1 md:w-28">
                                        <label className="block text-[10px] md:text-xs font-bold text-emerald-700 mb-1">التكرار</label>
                                        <input type="text" placeholder="كل 8 س" value={currentRxInput.frequency} onChange={e=>setCurrentRxInput({...currentRxInput, frequency: e.target.value})} className="w-full p-3.5 md:p-2 bg-white border border-emerald-200 rounded-xl text-sm font-bold outline-none" />
                                    </div>
                                    <div className="flex-1 md:w-24 hidden sm:block">
                                        <label className="block text-[10px] md:text-xs font-bold text-emerald-700 mb-1">المدة</label>
                                        <input type="text" placeholder="5 أيام" value={currentRxInput.duration} onChange={e=>setCurrentRxInput({...currentRxInput, duration: e.target.value})} className="w-full p-3.5 md:p-2 bg-white border border-emerald-200 rounded-xl text-sm font-bold outline-none" />
                                    </div>
                                </div>
                                <div className="w-full md:w-auto mt-2 md:mt-0 flex items-end">
                                    <button type="button" onClick={addRxItem} disabled={!currentRxInput.catalog_id} className="w-full md:w-auto bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-6 py-3.5 md:py-2 rounded-xl font-bold transition-colors border border-emerald-300 disabled:opacity-50 active:scale-95 shadow-sm">إدراج للروشتة</button>
                                </div>
                            </div>

                            {rxItems.length > 0 && (
                                <ul className="mt-4 space-y-2">
                                    {rxItems.map((item, index) => (
                                        <li key={index} className="flex justify-between items-center bg-white border border-emerald-200 p-3 rounded-xl shadow-sm">
                                            <div>
                                                <span className="font-bold text-slate-700 dir-ltr text-right block text-sm md:text-base">{item.catalog_type === 'drug' ? '💊' : '🔬'} {item.catalog_name}</span>
                                                <span className="text-[10px] md:text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded mt-1 inline-block border border-slate-100">{item.dosage} | {item.frequency} {item.duration && `| ${item.duration}`}</span>
                                            </div>
                                            <button type="button" onClick={() => removeRxItem(index)} className="text-rose-500 hover:text-rose-700 bg-rose-50 w-10 h-10 rounded-xl flex items-center justify-center active:scale-95"><i className="fas fa-trash"></i></button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                    </form>
                </div>

                <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                    <button type="submit" disabled={!formData.patient_id} form="visitForm" className="w-full bg-[#0284C7] hover:bg-[#0EA5E9] text-white font-black py-4 rounded-xl shadow-lg shadow-sky-500/30 transition-all text-base md:text-lg disabled:opacity-50 active:scale-95">
                        <i className="fas fa-save mr-2"></i> حفظ الكشف وإنهاء الزيارة
                    </button>
                </div>
            </div>
        </div>
    );
};