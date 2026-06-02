// ==========================================
// MentraClinics Local Database (Offline First)
// ==========================================

const db = new Dexie("MentraClinicsDB11");

// استخدام الإصدار 5 مع تصحيح الفهارس (Indexes)
// تم إزالة علامة & من user_id لأنه مفتاح أجنبي (Foreign Key) ويتكرر بشكل طبيعي
// علامة & تُستخدم فقط للقيم التي يمنع تكرارها في الجدول مثل رقم الهاتف أو الرقم القومي
db.version(5).stores({
    clinic_info: "id, clinic_name, phone, address, created_at, updated_at",
    users: "++id, &phone, name, password, role, status, created_at, last_login, is_active",
    patients: "++id, name, &phone, national_id, email, address, birth_date, gender, blood_type, user_id, created_at, updated_at, is_active",
    appointments: "++id, date, patient_id, doctor_id, user_id, status, type, notes, created_at, updated_at", 
    visits: "++id, appointment_id, patient_id, doctor_id, user_id, date, visit_type, chief_complaint, diagnosis, notes, created_at, updated_at",
    vitals: "++id, visit_id, patient_id, user_id, blood_pressure, heart_rate, temperature, weight, height, bmi, created_at",
    prescriptions: "++id, visit_id, patient_id, doctor_id, user_id, date, notes, status, created_at",
    prescription_items: "++id, prescription_id, catalog_id, user_id, dosage, frequency, duration, instructions, created_at",
    medical_catalog: "++id, type, name, barcode, description, unit, price, user_id, is_active, created_at, updated_at",
    invoices: "++id, patient_id, visit_id, doctor_id, user_id, date, total_amount, paid_amount, payment_status, payment_method, created_at, updated_at",
    expenses: "++id, date, category, amount, description, payment_method, created_by, user_id, created_at, updated_at",
    attachments: "++id, patient_id, visit_id, type, user_id, file_name, file_size, file_path, created_at",
    system_logs: "++id, action, user_id, table_name, record_id, timestamp, ip_address", // تم إزالة old_values, new_values من الفهرس لتقليل حجم الداتا بيز
    backups: "++id, backup_name, backup_data, backup_type, created_at, file_size, is_encrypted"
});

// ==========================================
// Helper Functions (Clinic Queries)
// الدوال المسؤولة عن العمليات الأساسية في النظام
// ==========================================

window.ClinicQueries = {
    
    // 1. تأسيس العيادة (تسجيل أول مستخدم - مدير العيادة)
    createClinic: async function(clinicName, ownerName, phone, password) {
        return await db.transaction('rw', db.clinic_info, db.users, async () => {
            // التحقق من عدم وجود رقم الهاتف مسبقاً
            const existingUser = await db.users.where('phone').equalsIgnoreCase(phone.trim()).first();
            if (existingUser) {
                throw new Error("رقم الهاتف مسجل بالفعل في النظام!");
            }

            // إنشاء ID فريد للعيادة
            const clinicId = "CL-" + Date.now();

            // حفظ بيانات العيادة
            await db.clinic_info.put({
                id: clinicId,
                clinic_name: clinicName,
                phone: phone, // رقم تواصل العيادة الأساسي
                address: "",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            // حفظ بيانات الطبيب / مدير العيادة
            const userId = await db.users.add({
                name: ownerName,
                phone: phone.trim(), // يستخدم لتسجيل الدخول بدلاً من الإيميل
                password: password, // محلياً لا مانع من حفظها هكذا، ولكن يفضل تشفيرها مستقبلاً
                role: 'owner', // الأدوار: owner, doctor, receptionist
                status: 'active',
                is_active: 1,
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
            });

            return { clinicId, userId };
        });
    },

    // 2. تسجيل الدخول
    login: async function(phone, password) {
        const user = await db.users.where('phone').equalsIgnoreCase(phone.trim()).first();
        
        if (!user) {
            throw new Error("رقم الهاتف غير مسجل في النظام.");
        }

        if (user.password !== password) {
            throw new Error("كلمة المرور غير صحيحة.");
        }

        if (user.is_active === 0 || user.status !== 'active') {
            throw new Error("عفواً، هذا الحساب موقوف. يرجى مراجعة إدارة العيادة.");
        }

        // تحديث تاريخ آخر ظهور للمستخدم
        await db.users.update(user.id, { last_login: new Date().toISOString() });

        // جلب بيانات العيادة المرتبطة
        // (في النسخة المحلية نفترض وجود عيادة واحدة، أو نأخذ أول سجل)
        const clinic = await db.clinic_info.toCollection().first();

        return { user, clinic };
    },

    // 3. نظام تسجيل الحركات (Audit Trails)
    logAction: async function(userId, action, tableName, recordId) {
        await db.system_logs.add({
            action: action, // مثال: 'CREATE_PATIENT', 'DELETE_INVOICE'
            user_id: userId,
            table_name: tableName,
            record_id: recordId,
            timestamp: new Date().toISOString(),
            ip_address: '127.0.0.1' // بما أنه Offline
        });
    }
};

// ==========================================
// Database Initialization
// ==========================================
window.initDatabase = async function() {
    try {
        await db.open();
        console.log("🏥 MentraClinics Database initialized successfully");
    } catch (err) {
        console.error("❌ Failed to initialize database:", err);
        throw err;
    }
};

// إتاحة قاعدة البيانات بشكل عام (Global) لتستطيع ملفات React قراءتها
window.db = db;