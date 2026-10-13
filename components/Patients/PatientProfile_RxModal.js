window.PatientProfile_RxModal = function({ prescription, patient, close, clinicInfo }) {
    
    const handlePrint = () => {
        const clinicName = clinicInfo?.clinic_name || 'العيادة';
        const docName = JSON.parse(localStorage.getItem('MentraClinics_Session'))?.name || 'الطبيب';
        
        const medsHTML = prescription.medications.map(med => `
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #ccc;">
                <h3 style="margin: 0 0 5px 0; font-size: 18px; color: #000; direction: ltr; text-align: left;">${med.drug_name}</h3>
                <p style="margin: 0; font-size: 14px; font-weight: bold; color: #333;">الجرعة: ${med.dosage}</p>
                ${med.instructions ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">ملاحظات: ${med.instructions}</p>` : ''}
            </div>
        `).join('');

        const printContent = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>روشتة - ${patient.name}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                    body { font-family: 'Cairo', sans-serif; padding: 20px; color: #000; margin: 0; background: #fff;}
                    .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                    .clinic-name { font-size: 26px; font-weight: 900; margin: 0; }
                    .doc-name { font-size: 18px; font-weight: 700; margin: 5px 0 0 0; }
                    .patient-info { display: flex; justify-content: space-between; background: #f9f9f9; padding: 10px; border: 1px solid #000; border-radius: 5px; margin-bottom: 20px; font-weight: bold;}
                    .rx-symbol { font-size: 40px; font-weight: 900; font-family: serif; font-style: italic; margin-bottom: 20px; border-bottom: 2px solid #000; display: inline-block; padding-right: 20px;}
                    .footer { text-align: center; font-size: 12px; margin-top: 40px; border-top: 1px solid #000; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="clinic-name">${clinicName}</h1>
                    <p class="doc-name">د. ${docName}</p>
                </div>
                
                <div class="patient-info">
                    <span>اسم المريض: ${patient.name}</span>
                    <span>التاريخ: ${prescription.date}</span>
                </div>

                <div class="rx-symbol">Rx</div>
                
                <div class="medications-list">
                    ${medsHTML}
                </div>

                ${prescription.diagnosis ? `
                    <div style="margin-top: 30px; border: 1px solid #000; padding: 10px; border-radius: 5px;">
                        <strong style="font-size: 12px;">التشخيص:</strong> 
                        <span style="font-size: 14px; font-weight: bold;">${prescription.diagnosis}</span>
                    </div>
                ` : ''}

                <div class="footer">
                    <p>ألف سلامة، مع تمنياتنا بالشفاء العاجل.</p>
                </div>
            </body>
            </html>
        `;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '-9999px';
        iframe.style.bottom = '-9999px';
        document.body.appendChild(iframe);

        iframe.contentDocument.open();
        iframe.contentDocument.write(printContent);
        iframe.contentDocument.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div className="bg-white w-full md:max-w-lg rounded-2xl shadow-2xl animate-view overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-emerald-600 p-6 text-white flex justify-between items-start relative overflow-hidden shrink-0">
                    <div className="absolute -right-6 -top-6 text-emerald-500/30 text-9xl font-serif italic font-black">Rx</div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black">تفاصيل الروشتة الطبية</h2>
                        <p className="text-emerald-100 text-sm mt-1 font-bold"><i className="far fa-calendar-alt"></i> تاريخ الكشف: {prescription.date}</p>
                    </div>
                    <button onClick={close} className="relative z-10 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full transition-colors"><i className="fas fa-times"></i></button>
                </div>
                <div className="p-6 overflow-y-auto bg-slate-50">
                    {prescription.diagnosis && (
                        <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 block mb-1">التشخيص الطبي</span>
                            <span className="font-bold text-slate-700">{prescription.diagnosis}</span>
                        </div>
                    )}
                    <h3 className="font-black text-slate-700 mb-4 flex items-center gap-2"><i className="fas fa-pills text-emerald-500"></i> الأدوية المصروفة ({prescription.medications.length})</h3>
                    <div className="space-y-3">
                        {prescription.medications.map((med, i) => (
                            <div key={i} className="bg-white p-4 rounded-xl border-l-4 border-l-emerald-500 border border-slate-200 shadow-sm">
                                <h4 className="font-black text-lg text-slate-800 dir-ltr text-right mb-2">{med.drug_name}</h4>
                                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <span className="text-xs font-bold text-slate-500">الجرعة:</span>
                                    <span className="text-sm font-black text-emerald-700">{med.dosage}</span>
                                </div>
                                {med.instructions && (
                                    <p className="text-xs font-semibold text-slate-500 mt-2 bg-amber-50 p-2 rounded text-amber-700 border border-amber-100">
                                        <i className="fas fa-info-circle"></i> {med.instructions}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
                    <button onClick={handlePrint} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95">
                        <i className="fas fa-print"></i> طباعة الروشتة
                    </button>
                </div>
            </div>
        </div>
    );
};