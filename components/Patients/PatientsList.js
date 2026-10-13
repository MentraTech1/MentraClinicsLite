window.PatientsList = function({ loading, patientsLength, currentItems, calculateAge, viewPatientProfile, openEditModal, handleDelete, totalPages, currentPage, prevPage, nextPage }) {
    
    // شاشة التحميل
    if (loading) return <div className="flex justify-center p-12"><i className="fas fa-circle-notch fa-spin text-4xl text-[#0EA5E9]"></i></div>;
    
    // شاشة فارغة (لا يوجد مرضى)
    if (patientsLength === 0) {
        return (
            <div className="text-center p-12 bg-white rounded-3xl border border-slate-200/60 shadow-sm flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-folder-open text-4xl text-slate-300"></i>
                </div>
                <h3 className="text-xl font-black text-slate-700">لا يوجد مرضى مسجلين</h3>
                <p className="text-sm text-slate-500 font-bold mt-2">قم بإضافة مريض جديد أو تأكد من كلمات البحث.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            
            {/* نظام الكروت (Grid System) - يعمل على جميع الشاشات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {currentItems.map((patient) => (
                    <div key={patient.id} className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-sky-200 transition-all duration-300 flex flex-col relative overflow-hidden group">
                        
                        {/* شريط التاريخ المحمي (حل مشكلة الـ Split) */}
                        <div className="absolute top-0 right-0 bg-slate-50 px-3 py-1.5 rounded-bl-xl border-b border-l border-slate-100 text-[10px] font-black text-slate-500">
                            <i className="fas fa-calendar-alt text-[#0EA5E9] ml-1"></i>
                            {patient.created_at ? patient.created_at.split('T')[0] : 'إضافة حديثة'}
                        </div>

                        {/* الجزء العلوي: الأيقونة والاسم */}
                        <div className="flex items-start gap-4 mt-3">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white shadow-inner shrink-0 ${patient.gender === 'male' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-pink-400 to-pink-600'}`}>
                                <i className={`fas ${patient.gender === 'male' ? 'fa-male' : 'fa-female'}`}></i>
                            </div>
                            <div className="flex-1 overflow-hidden pt-1">
                                <h3 className="font-black text-slate-800 text-lg truncate" title={patient.name}>{patient.name}</h3>
                                <p className="font-bold text-slate-500 text-xs mt-1 flex items-center gap-1.5 dir-ltr justify-end">
                                    <i className="fas fa-phone-alt text-emerald-500"></i> {patient.phone || 'بدون هاتف'}
                                </p>
                            </div>
                        </div>

                        {/* الجزء الأوسط: الإحصائيات المصغرة */}
                        <div className="grid grid-cols-2 gap-2 my-5 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                            <div className="text-center border-l border-slate-200">
                                <p className="text-[10px] font-bold text-slate-400 mb-0.5">العمر</p>
                                <p className="text-xs font-black text-[#0284C7]">{calculateAge(patient.birth_date)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-400 mb-0.5">فصيلة الدم</p>
                                <p className="text-xs font-black text-rose-500">{patient.blood_type || '-'}</p>
                            </div>
                        </div>

                        {/* الجزء السفلي: أزرار الإجراءات */}
                        <div className="mt-auto flex gap-2">
                            <button onClick={() => viewPatientProfile(patient)} className="flex-1 bg-slate-100 hover:bg-[#0284C7] text-slate-600 hover:text-white py-3 rounded-xl font-black text-xs transition-colors flex items-center justify-center gap-2 active:scale-95 border border-slate-200 hover:border-[#0284C7]">
                                <i className="fas fa-folder-open"></i> فتح الملف
                            </button>
                            <button onClick={() => openEditModal(patient)} className="w-12 h-12 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-100 hover:border-amber-500 rounded-xl flex items-center justify-center transition-colors active:scale-95 shrink-0" title="تعديل البيانات">
                                <i className="fas fa-user-edit"></i>
                            </button>
                            <button onClick={() => handleDelete(patient.id)} className="w-12 h-12 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-100 hover:border-rose-500 rounded-xl flex items-center justify-center transition-colors active:scale-95 shrink-0" title="حذف المريض">
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* شريط الترقيم (Pagination) */}
            {totalPages > 1 && (
                <div className="bg-white p-3 border border-slate-200/60 flex items-center justify-between rounded-2xl shadow-sm">
                    <button onClick={prevPage} disabled={currentPage === 1} className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2">
                        <i className="fas fa-chevron-right text-xs"></i> السابق
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 flex items-center justify-center bg-[#0284C7] text-white rounded-lg font-black text-sm shadow-md">{currentPage}</span>
                        <span className="text-xs font-bold text-slate-400">من {totalPages}</span>
                    </div>
                    
                    <button onClick={nextPage} disabled={currentPage === totalPages} className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2">
                        التالي <i className="fas fa-chevron-left text-xs"></i>
                    </button>
                </div>
            )}
        </div>
    );
};