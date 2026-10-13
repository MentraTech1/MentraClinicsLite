window.PatientProfile_BookModal = function({ setIsBookingModalOpen, patient, userId, showToast, refreshData }) {
    const { useState } = React;
    const today = new Date().toISOString().split('T')[0];
    const [bookingForm, setBookingForm] = useState({ date: today, type: 'new', notes: '' });
    const [loading, setLoading] = useState(false);

    const handleBook = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await window.db.appointments.add({
                patient_id: patient.id, doctor_id: userId, user_id: userId,
                date: bookingForm.date, type: bookingForm.type,
                status: 'waiting', notes: bookingForm.notes,
                created_at: new Date().toISOString(), updated_at: new Date().toISOString()
            });
            showToast("تم حجز الموعد بنجاح", "success");
            setIsBookingModalOpen(false);
            refreshData();
        } catch (error) {
            showToast("حدث خطأ أثناء الحجز", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl animate-view overflow-hidden pb-safe">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-sky-50">
                    <h3 className="text-lg font-black text-[#0284C7]"><i className="fas fa-calendar-plus"></i> حجز موعد جديد</h3>
                    <button onClick={() => setIsBookingModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-rose-500 shadow-sm"><i className="fas fa-times"></i></button>
                </div>
                <form onSubmit={handleBook} className="p-5 space-y-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#0284C7] shadow-sm"><i className="fas fa-user"></i></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400">حجز موعد للمريض</p>
                            <p className="text-sm font-black text-slate-700">{patient.name}</p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">تاريخ الموعد</label>
                        <input type="date" required min={today} value={bookingForm.date} onChange={e=>setBookingForm({...bookingForm, date: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">نوع الكشف</label>
                        <select value={bookingForm.type} onChange={e=>setBookingForm({...bookingForm, type: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none">
                            <option value="new">كشف جديد</option>
                            <option value="followup">استشارة / متابعة</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">ملاحظات (اختياري)</label>
                        <textarea rows="2" value={bookingForm.notes} onChange={e=>setBookingForm({...bookingForm, notes: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#0EA5E9] outline-none resize-none"></textarea>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-black py-4 rounded-xl transition-colors mt-2 active:scale-95 shadow-lg shadow-sky-500/30">
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : 'تأكيد الحجز'}
                    </button>
                </form>
            </div>
        </div>
    );
};