window.SettingsHeader = function() {
    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm text-center md:text-right">
            <h2 className="text-xl md:text-2xl font-black text-[#0284C7] flex items-center justify-center md:justify-start gap-2">
                <i className="fas fa-cog"></i> إعدادات العيادة
            </h2>
            <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">إدارة بيانات الملف الشخصي، التخزين، والأمان</p>
        </div>
    );
};