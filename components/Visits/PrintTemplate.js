window.PrintTemplate = function({ printData }) {
    return (
        <div className="hidden print:block w-full min-h-screen bg-white text-black p-8 font-sans">
            <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
                <div className="text-right">
                    <h1 className="text-2xl font-black">{printData.clinic.doctor_name}</h1>
                    <h2 className="text-sm font-bold mt-1 text-gray-700">{printData.clinic.clinic_name}</h2>
                </div>
                <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center text-2xl font-black">Rx</div>
            </div>
            <div className="flex justify-between items-center mb-8 bg-gray-100 p-3 rounded">
                <div className="font-bold text-sm">اسم المريض: <span className="text-lg underline underline-offset-4 ml-2">{printData.patient?.name}</span></div>
                <div className="font-bold text-sm">التاريخ: {printData.visit?.date}</div>
            </div>
            <div className="relative min-h-[400px]">
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-[20rem] font-serif">Rx</div>
                <div className="relative z-10 space-y-6">
                    {printData.medications && printData.medications.length > 0 ? (
                        printData.medications.map((med, index) => (
                            <div key={index} className="flex flex-col mb-4">
                                <div className="text-xl font-bold dir-ltr flex items-center gap-2">
                                    <span className="text-sm text-gray-400">-{index + 1}</span> {med.drug_name}
                                </div>
                                <div className="text-sm font-semibold text-gray-700 pr-6 mt-1 flex gap-4">
                                    <span>الجرعة: {med.dosage}</span>
                                    <span>التكرار: {med.frequency}</span>
                                    {med.duration && <span>المدة: {med.duration}</span>}
                                </div>
                            </div>
                        ))
                    ) : <div className="text-center text-gray-400 italic mt-20">لا يوجد أدوية مصروفة في هذا الكشف.</div>}
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 border-t-2 border-black pt-4 text-center pb-4 text-xs font-bold">
                <p>العنوان: {printData.clinic.address || '_____________________'}</p>
                <p className="mt-1">رقم الهاتف: {printData.clinic.phone || '_____________________'}</p>
                <p className="mt-2 text-[10px] text-gray-500">تم إنشاء هذه الروشتة بواسطة نظام MentraClinics الإلكتروني</p>
            </div>
        </div>
    );
};