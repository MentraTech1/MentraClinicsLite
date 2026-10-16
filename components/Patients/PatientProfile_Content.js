window.PatientProfile_Content = function({ 
    activeTab, setActiveTab, dateRange, handleDateChange, 
    currentItems, setSelectedPrescription, totalPages, currentPage, 
    nextPage, prevPage, handleUpdateApptStatus, handleDeleteAppt 
}) {

    const { useState } = React;

    // حالة المودال لتعديل الموعد
    const [editingAppt, setEditingAppt] = useState(null);
    const [editFormData, setEditFormData] = useState({
        date: '', time: '', type: 'new', status: 'pending', notes: ''
    });

    const handleOpenEditAppt = (appt) => {
        setEditingAppt(appt);
        setEditFormData({
            date: appt.date || '',
            time: appt.time || '',
            type: appt.type || 'new',
            status: appt.status || 'pending',
            notes: appt.notes || ''
        });
    };

    const handleSaveEditAppt = async (e) => {
        e.preventDefault();
        if (!editingAppt) return;
        try {
            await window.db.appointments.update(editingAppt.id, {
                date: editFormData.date,
                time: editFormData.time,
                type: editFormData.type,
                status: editFormData.status,
                notes: editFormData.notes,
                updated_at: new Date().toISOString()
            });

            // تحديث الواجهة بتغيير الحالة إذا لزم الأمر
            if (editFormData.status !== editingAppt.status) {
                handleUpdateApptStatus(editingAppt.id, editFormData.status);
            } else {
                // لإجبار الشاشة على التحديث وجلب الوقت الجديد
                handleUpdateApptStatus(editingAppt.id, editingAppt.status);
            }
            
            setEditingAppt(null);
        } catch (err) {
            console.error("خطأ أثناء تعديل الموعد:", err);
        }
    };

    // مكون القائمة المنسدلة الذكية للحالة
    const StatusDropdown = ({ appt }) => (
        <div className="relative inline-block w-28">
            <select
                value={appt.status}
                onChange={(e) => handleUpdateApptStatus(appt.id, e.target.value)}
                className={`w-full appearance-none px-3 py-1.5 rounded-lg text-[11px] md:text-xs font-black outline-none cursor-pointer text-center transition-colors shadow-sm border ${
                    appt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                    appt.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' :
                    'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
            >
                <option value="waiting">⏳ انتظار</option>
                <option value="pending">⏳ معلق</option>
                <option value="completed">✅ تم الكشف</option>
                <option value="cancelled">❌ ملغي</option>
            </select>
            <i className={`fas fa-chevron-down absolute left-2 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none ${
                appt.status === 'completed' ? 'text-emerald-500' : appt.status === 'cancelled' ? 'text-rose-500' : 'text-amber-500'
            }`}></i>
        </div>
    );

    return (
        <>
            {/* شريط التبويبات والفلاتر */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-3 flex flex-col lg:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap bg-slate-100/80 p-1.5 rounded-xl w-full lg:w-auto gap-1">
                    <button onClick={() => setActiveTab('visits')} className={`flex-1 lg:px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'visits' ? 'bg-white text-[#0284C7] shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}>
                        <i className="fas fa-notes-medical"></i> كشوفات
                    </button>
                    <button onClick={() => setActiveTab('prescriptions')} className={`flex-1 lg:px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'prescriptions' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}>
                        <i className="fas fa-pills"></i> روشتات
                    </button>
                    <button onClick={() => setActiveTab('financials')} className={`flex-1 lg:px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'financials' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}>
                        <i className="fas fa-file-invoice-dollar"></i> حسابات
                    </button>
                    <button onClick={() => setActiveTab('appointments')} className={`flex-1 lg:px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'appointments' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}>
                        <i className="fas fa-calendar-check"></i> مواعيد
                    </button>
                </div>
                
                {activeTab !== 'appointments' && (
                    <div className="flex items-center gap-2 w-full lg:w-auto bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                        <input type="date" name="from" value={dateRange.from} onChange={handleDateChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-[#0EA5E9]" />
                        <span className="text-slate-400">-</span>
                        <input type="date" name="to" value={dateRange.to} onChange={handleDateChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-[#0EA5E9]" />
                    </div>
                )}
            </div>

            {/* عرض البيانات */}
            <div className="space-y-4">
                {currentItems.length === 0 ? (
                    <div className="bg-slate-50/50 rounded-3xl border border-slate-200 border-dashed p-12 text-center flex flex-col items-center">
                        <i className="fas fa-box-open text-4xl text-slate-300 mb-4 bg-white w-20 h-20 flex items-center justify-center rounded-full shadow-sm"></i>
                        <h3 className="font-black text-slate-700 text-lg mb-1">لا توجد سجلات حالياً</h3>
                    </div>
                ) : (
                    currentItems.map((item, index) => {
                        
                        // تصميم المواعيد المعلقة والسابقة
                        if (activeTab === 'appointments') {
                            return (
                                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-amber-200 transition-colors">
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl border border-amber-100 shrink-0"><i className="fas fa-calendar-day"></i></div>
                                        <div>
                                            <h4 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                                {item.date} 
                                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg border border-slate-200"><i className="far fa-clock"></i> {item.time || 'غير محدد'}</span>
                                            </h4>
                                            <p className="text-xs font-bold text-slate-500 mt-1">{item.type === 'new' ? 'كشف جديد' : 'متابعة'} {item.notes && `- ${item.notes}`}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                        <StatusDropdown appt={item} />
                                        {/* زر التعديل الجديد */}
                                        <button 
                                            onClick={() => handleOpenEditAppt(item)} 
                                            className="w-9 h-9 rounded-lg bg-sky-50 text-[#0284C7] hover:bg-[#0284C7] hover:text-white transition-colors flex items-center justify-center active:scale-95 border border-sky-100" 
                                            title="تعديل الموعد"
                                        >
                                            <i className="fas fa-edit text-xs"></i>
                                        </button>
                                        {/* زر الحذف */}
                                        <button 
                                            onClick={() => handleDeleteAppt(item.id)} 
                                            className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center active:scale-95 border border-rose-100" 
                                            title="حذف الموعد"
                                        >
                                            <i className="fas fa-trash-alt text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        // تصميم الروشتات
                        if (activeTab === 'prescriptions') {
                            return (
                                <div key={item.id} onClick={() => setSelectedPrescription(item)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl border border-emerald-100 group-hover:scale-110 transition-transform"><i className="fas fa-prescription"></i></div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-black text-slate-800 text-lg">روشتة علاجية</h4>
                                                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black">{item.date}</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-500">تم صرف <span className="text-emerald-600 font-black">{item.medications.length} أدوية</span> لهذه الحالة.</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 sm:mt-0 bg-slate-50 text-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                                        عرض وتفاصيل <i className="fas fa-external-link-alt"></i>
                                    </div>
                                </div>
                            );
                        }

                        // تصميم الكشوفات أو الحسابات
                        return (
                            <div key={item.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row overflow-hidden">
                                <div className={`w-full sm:w-2 shrink-0 ${activeTab === 'visits' ? 'bg-[#0284C7]' : 'bg-rose-500'}`}></div>
                                <div className="p-5 flex-1 relative">
                                    <div className="absolute top-5 left-5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-black text-slate-600"><i className="fas fa-calendar-day"></i> {item.date}</div>
                                    
                                    {activeTab === 'visits' && (
                                        <div className="pt-8 md:pt-0">
                                            <span className="px-3 py-1 text-[10px] uppercase rounded-md font-black border bg-sky-50 text-sky-700 border-sky-100 block w-fit mb-3">{item.visit_type === 'new' ? 'كشف جديد' : 'متابعة'}</span>
                                            <h4 className="text-xs font-black text-slate-400 mb-1">التشخيص</h4>
                                            <p className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{item.diagnosis || 'لم يُسجل'}</p>
                                        </div>
                                    )}

                                    {activeTab === 'financials' && (
                                        <div className="flex justify-between items-center pt-8 md:pt-0">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl"><i className="fas fa-receipt"></i></div>
                                                <div>
                                                    <h3 className="text-base font-black text-slate-800">فاتورة عيادة</h3>
                                                    <span className={`text-xs font-bold ${item.payment_status==='paid'?'text-emerald-500':'text-amber-500'}`}>{item.payment_status==='paid'?'خالص':'متبقي'}</span>
                                                </div>
                                            </div>
                                            <div className="text-left bg-slate-50 px-5 py-2 rounded-xl border border-slate-100">
                                                <p className="text-[10px] text-slate-400 font-black mb-0.5">القيمة</p>
                                                <p className="text-xl font-black text-rose-600">{item.paid_amount}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* شريط الترقيم */}
            {totalPages > 1 && (
                <div className="bg-white p-3 border border-slate-200 flex justify-between rounded-2xl shadow-sm mt-6">
                    <button onClick={prevPage} disabled={currentPage === 1} className="px-5 py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white disabled:opacity-50 active:scale-95"><i className="fas fa-chevron-right text-xs"></i> السابق</button>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        صفحة <span className="w-8 h-8 flex items-center justify-center bg-[#0284C7] text-white rounded-lg font-black">{currentPage}</span> من {totalPages}
                    </div>
                    <button onClick={nextPage} disabled={currentPage === totalPages} className="px-5 py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white disabled:opacity-50 active:scale-95">التالي <i className="fas fa-chevron-left text-xs"></i></button>
                </div>
            )}

            {/* نافذة تعديل الموعد (Modal) */}
            {editingAppt && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-view overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-sky-50">
                            <h3 className="text-base font-black text-[#0284C7]">
                                <i className="fas fa-edit ml-1"></i> تعديل تفاصيل الموعد
                            </h3>
                            <button 
                                onClick={() => setEditingAppt(null)} 
                                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSaveEditAppt} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={editFormData.date} 
                                        onChange={e => setEditFormData({...editFormData, date: e.target.value})} 
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#0EA5E9] outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">الوقت</label>
                                    <input 
                                        type="time" 
                                        required 
                                        value={editFormData.time} 
                                        onChange={e => setEditFormData({...editFormData, time: e.target.value})} 
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#0EA5E9] outline-none" 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">نوع الكشف</label>
                                    <select 
                                        value={editFormData.type} 
                                        onChange={e => setEditFormData({...editFormData, type: e.target.value})} 
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#0EA5E9] outline-none"
                                    >
                                        <option value="new">كشف جديد</option>
                                        <option value="follow_up">متابعة / استشارة</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">الحالة</label>
                                    <select 
                                        value={editFormData.status} 
                                        onChange={e => setEditFormData({...editFormData, status: e.target.value})} 
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#0EA5E9] outline-none"
                                    >
                                        <option value="waiting">انتظار</option>
                                        <option value="pending">معلق</option>
                                        <option value="completed">تم الكشف</option>
                                        <option value="cancelled">ملغي</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات</label>
                                <textarea 
                                    rows="2" 
                                    value={editFormData.notes} 
                                    onChange={e => setEditFormData({...editFormData, notes: e.target.value})} 
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#0EA5E9] outline-none resize-none"
                                ></textarea>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button 
                                    type="submit" 
                                    className="flex-1 bg-[#0284C7] hover:bg-sky-700 text-white font-black py-2.5 rounded-xl transition-all active:scale-95 text-xs shadow-md shadow-sky-500/20"
                                >
                                    حفظ التعديلات
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setEditingAppt(null)} 
                                    className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};