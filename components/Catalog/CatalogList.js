window.CatalogList = function({ loading, catalogLength, currentItems, openEditModal, handleDelete, totalPages, currentPage, prevPage, nextPage }) {
    
    // قاموس الألوان والتنسيقات للكروت
    const typeLabels = {
        'drug': { label: 'دواء', icon: 'fa-pills', color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'bg-emerald-500 text-white', border: 'border-emerald-100' },
        'lab': { label: 'تحليل', icon: 'fa-flask', color: 'text-purple-600', bg: 'bg-purple-50', badge: 'bg-purple-500 text-white', border: 'border-purple-100' },
        'xray': { label: 'أشعة', icon: 'fa-x-ray', color: 'text-amber-600', bg: 'bg-amber-50', badge: 'bg-amber-500 text-white', border: 'border-amber-100' },
        'service': { label: 'خدمة', icon: 'fa-notes-medical', color: 'text-sky-600', bg: 'bg-sky-50', badge: 'bg-sky-500 text-white', border: 'border-sky-100' }
    };

    if (loading) return <div className="flex justify-center p-20"><i className="fas fa-circle-notch fa-spin text-5xl text-[#0EA5E9]"></i></div>;

    if (catalogLength === 0) {
        return (
            <div className="text-center p-16 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-box-open text-5xl text-slate-300"></i>
                </div>
                <h3 className="text-xl font-black text-slate-700">دليلك الطبي فارغ</h3>
                <p className="text-sm font-bold text-slate-400 mt-2 max-w-md">قم بإضافة الأصناف يدوياً أو استخدم زر "استيراد إكسيل" لرفع قائمة بآلاف الأدوية والخدمات بضغطة واحدة.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            
            {/* نظام الكروت (Grid Layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {currentItems.map((item) => {
                    const typeInfo = typeLabels[item.type] || typeLabels['drug'];
                    
                    return (
                        <div key={item.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative group">
                            
                            {/* شريط النوع العائم */}
                            <div className={`absolute -top-3 -right-2 ${typeInfo.badge} px-3 py-1 rounded-bl-xl rounded-tr-xl rounded-tl-sm font-black text-[10px] shadow-sm flex items-center gap-1`}>
                                <i className={`fas ${typeInfo.icon}`}></i> {typeInfo.label}
                            </div>

                            <div className="flex items-start gap-4 mt-2">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${typeInfo.bg} ${typeInfo.color}`}>
                                    <i className={`fas ${typeInfo.icon}`}></i>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="font-black text-slate-800 text-base dir-ltr text-right truncate" title={item.name}>{item.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {item.unit && <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded-full">{item.unit}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* الوصف */}
                            <div className="mt-4 mb-4 flex-1">
                                <p className="text-xs text-slate-500 font-semibold line-clamp-2 leading-relaxed h-8">
                                    {item.description || 'لا توجد ملاحظات إضافية لهذا الصنف.'}
                                </p>
                            </div>

                            {/* السعر والأزرار */}
                            <div className="flex justify-between items-end pt-4 border-t border-slate-50 mt-auto">
                                <div>
                                    <span className="block text-[10px] font-bold text-slate-400 mb-0.5">تسعيرة الفوترة</span>
                                    <span className={`font-black text-lg ${item.price > 0 ? 'text-[#0284C7]' : 'text-slate-300'}`}>
                                        {item.price > 0 ? `${item.price} ج.م` : 'مجاني/غير مسعر'}
                                    </span>
                                </div>
                                <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(item)} className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white flex items-center justify-center transition-colors shadow-sm"><i className="fas fa-edit"></i></button>
                                    <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors shadow-sm"><i className="fas fa-trash-alt"></i></button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="bg-white p-3 border border-slate-100 flex items-center justify-between rounded-2xl shadow-sm">
                    <button onClick={prevPage} disabled={currentPage === 1} className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white hover:border-[#0EA5E9] transition-all disabled:opacity-50 disabled:hover:bg-slate-50 disabled:hover:text-slate-600 active:scale-95">
                        <i className="fas fa-chevron-right ml-1"></i> السابق
                    </button>
                    <span className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
                        صفحة <span className="text-[#0284C7] font-black mx-1">{currentPage}</span> من {totalPages}
                    </span>
                    <button onClick={nextPage} disabled={currentPage === totalPages} className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-[#0EA5E9] hover:text-white hover:border-[#0EA5E9] transition-all disabled:opacity-50 disabled:hover:bg-slate-50 disabled:hover:text-slate-600 active:scale-95">
                        التالي <i className="fas fa-chevron-left mr-1"></i>
                    </button>
                </div>
            )}
        </div>
    );
};