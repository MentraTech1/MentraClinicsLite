window.AppointmentFormModal = function({ 
    setIsModalOpen, handleAddAppointment, patients, filteredPatients, 
    formData, setFormData, patientSearchTerm, setPatientSearchTerm, 
    isDropdownOpen, setIsDropdownOpen 
}) {
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl animate-view overflow-visible pb-safe">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-sky-50 rounded-t-3xl md:rounded-t-2xl">
                    <h3 className="text-lg font-black text-[#0284C7]">حجز موعد جديد</h3>
                    <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-rose-500 shadow-sm"><i className="fas fa-times"></i></button>
                </div>
                <form onSubmit={handleAddAppointment} className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
                    
                    {/* حقل البحث الحي */}
                    <div className="relative">
                        <label className="block text-sm font-bold text-slate-700 mb-2">ابحث واختر المريض <span className="text-rose-500">*</span></label>
                        {patients.length === 0 ? (
                            <div className="text-xs text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100 font-bold">يجب إضافة مريض أولاً من قسم "سجل المرضى"</div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text" placeholder="اكتب الاسم أو الهاتف..." value={patientSearchTerm}
                                    onChange={(e) => {
                                        setPatientSearchTerm(e.target.value);
                                        setIsDropdownOpen(true);
                                        if(e.target.value === '') setFormData({...formData, patient_id: ''});
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                    className="w-full p-3.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none"
                                />
                                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                
                                {isDropdownOpen && patientSearchTerm && (
                                    <ul className="absolute z-[1000] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.map(p => (
                                                <li
                                                    key={p.id}
                                                    onMouseDown={() => {
                                                        setFormData({...formData, patient_id: p.id});
                                                        setPatientSearchTerm(`${p.name} (${p.phone || '-'})`);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="p-4 hover:bg-sky-50 cursor-pointer border-b border-slate-50 text-sm font-bold text-slate-700 transition-colors"
                                                >
                                                    {p.name} <span className="text-xs text-slate-400 block mt-1">رقم: {p.phone || 'لا يوجد'}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="p-4 text-sm text-slate-400 text-center font-bold">لا يوجد مريض يطابق بحثك</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">التاريخ <span className="text-rose-500">*</span></label>
                            <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">الوقت المتوقع <span className="text-rose-500">*</span></label>
                            <input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">نوع الكشف</label>
                        <div className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <label className="flex items-center gap-3 cursor-pointer font-bold text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-100 flex-1">
                                <input type="radio" name="type" value="new" checked={formData.type === 'new'} onChange={e => setFormData({...formData, type: e.target.value})} className="accent-[#0EA5E9] w-4 h-4" /> كشف جديد
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer font-bold text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-100 flex-1">
                                <input type="radio" name="type" value="follow_up" checked={formData.type === 'follow_up'} onChange={e => setFormData({...formData, type: e.target.value})} className="accent-[#0EA5E9] w-4 h-4" /> استشارة / متابعة
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">ملاحظات (اختياري)</label>
                        <textarea rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none resize-none" placeholder="اكتب أي ملاحظات هنا..."></textarea>
                    </div>

                    <button type="submit" disabled={!formData.patient_id} className="w-full bg-[#0284C7] hover:bg-sky-700 text-white font-black py-4 rounded-xl transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/30 text-lg active:scale-95">
                        حفظ الحجز
                    </button>
                </form>
            </div>
        </div>
    );
};