# Administrator Manual | دليل المسؤول
## FOLIO Library Management System | نظام إدارة المكتبات فوليو

**Version | الإصدار**: 1.0
**Last Updated | آخر تحديث**: October 2025
**Role | الدور**: System Administrator | مسؤول النظام
**Access Level | مستوى الوصول**: Full System Access | صلاحية كاملة للنظام

---

## Table of Contents | جدول المحتويات

### English Sections
1. [Introduction](#1-introduction--مقدمة)
2. [Getting Started](#2-getting-started--البدء)
3. [Dashboard Overview](#3-dashboard-overview--نظرة-عامة-على-لوحة-التحكم)
4. [User Management](#4-user-management--إدارة-المستخدمين)
5. [Role & Permission Management](#5-role--permission-management--إدارة-الأدوار-والصلاحيات)
6. [Inventory Management](#6-inventory-management--إدارة-الجرد)
7. [Circulation Operations](#7-circulation-operations--عمليات-الإعارة)
8. [Acquisitions Management](#8-acquisitions-management--إدارة-المقتنيات)
9. [Course Management](#9-course-management--إدارة-المقررات)
10. [Fees & Fines Administration](#10-fees--fines-administration--إدارة-الرسوم-والغرامات)
11. [Reports & Analytics](#11-reports--analytics--التقارير-والتحليلات)
12. [System Settings](#12-system-settings--إعدادات-النظام)
13. [Search Functionality](#13-search-functionality--وظيفة-البحث)
14. [Notifications](#14-notifications--الإشعارات)
15. [Troubleshooting](#15-troubleshooting--حل-المشكلات)
16. [Best Practices](#16-best-practices--أفضل-الممارسات)
17. [Keyboard Shortcuts](#17-keyboard-shortcuts--اختصارات-لوحة-المفاتيح)

---

## 1. Introduction | مقدمة

### 1.1 About This Manual | حول هذا الدليل

**English:**
This comprehensive guide is designed for FOLIO LMS System Administrators who have full access to all system features and settings. As an administrator, you are responsible for system configuration, user management, security, data integrity, and system monitoring.

**العربية:**
هذا الدليل الشامل مصمم لمسؤولي نظام فوليو الذين لديهم صلاحية كاملة لجميع ميزات وإعدادات النظام. بصفتك مسؤولاً، فأنت مسؤول عن إعدادات النظام، وإدارة المستخدمين، والأمان، وسلامة البيانات، ومراقبة النظام.

### 1.2 Administrator Responsibilities | مسؤوليات المسؤول

**English:**
- **User Management**: Create, modify, and deactivate user accounts
- **Security**: Manage roles, permissions, and system access
- **Configuration**: Set up system preferences and policies
- **Monitoring**: Track system performance and usage
- **Support**: Assist users and troubleshoot issues
- **Data Management**: Oversee data integrity and backups

**العربية:**
- **إدارة المستخدمين**: إنشاء وتعديل وإلغاء تفعيل حسابات المستخدمين
- **الأمان**: إدارة الأدوار والصلاحيات والوصول إلى النظام
- **الإعدادات**: ضبط تفضيلات وسياسات النظام
- **المراقبة**: تتبع أداء واستخدام النظام
- **الدعم**: مساعدة المستخدمين وحل المشكلات
- **إدارة البيانات**: الإشراف على سلامة البيانات والنسخ الاحتياطي

### 1.3 Required Knowledge | المعرفة المطلوبة

**English:**
- Basic understanding of library operations
- Familiarity with web-based applications
- Understanding of user roles and permissions
- Basic troubleshooting skills

**العربية:**
- فهم أساسي لعمليات المكتبة
- الإلمام بالتطبيقات المستندة إلى الويب
- فهم أدوار المستخدمين والصلاحيات
- مهارات أساسية في حل المشكلات

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 2. Getting Started | البدء

### 2.1 Accessing the System | الوصول إلى النظام

#### **English: Step-by-Step Login**

**Step 1: Open Your Web Browser**
- Supported browsers: Chrome, Firefox, Safari, Edge
- Recommended resolution: 1920x1080 or higher

**Step 2: Navigate to FOLIO LMS**
```
URL: http://localhost:3000
```

**Step 3: Login**
1. Enter your administrator credentials:
   - **Username**: `admin` (or your assigned username)
   - **Password**: Your secure password
2. Click the **"Sign In"** button

**Step 4: First-Time Login**
- Change your default password immediately
- Review system settings
- Verify your profile information

#### **العربية: خطوات تسجيل الدخول**

**الخطوة 1: افتح متصفح الويب**
- المتصفحات المدعومة: كروم، فايرفوكس، سفاري، إيدج
- الدقة الموصى بها: 1920×1080 أو أعلى

**الخطوة 2: انتقل إلى نظام فوليو**
```
عنوان URL: http://localhost:3000
```

**الخطوة 3: تسجيل الدخول**
1. أدخل بيانات المسؤول الخاصة بك:
   - **اسم المستخدم**: `admin` (أو اسم المستخدم المخصص لك)
   - **كلمة المرور**: كلمة المرور الآمنة الخاصة بك
2. انقر على زر **"تسجيل الدخول"**

**الخطوة 4: أول تسجيل دخول**
- قم بتغيير كلمة المرور الافتراضية فوراً
- راجع إعدادات النظام
- تحقق من معلومات ملفك الشخصي

### 2.2 Security Best Practices | أفضل ممارسات الأمان

#### **English:**

✅ **Do:**
- Use strong, unique passwords (minimum 8 characters)
- Include uppercase, lowercase, numbers, and symbols
- Log out when finished
- Keep credentials confidential
- Report suspicious activity immediately

❌ **Don't:**
- Share your administrator credentials
- Leave your session unattended
- Use public computers for admin tasks
- Save passwords in the browser

#### **العربية:**

✅ **افعل:**
- استخدم كلمات مرور قوية وفريدة (8 أحرف على الأقل)
- ضمّن أحرف كبيرة وصغيرة وأرقام ورموز
- سجّل خروجك عند الانتهاء
- حافظ على سرية بيانات الدخول
- أبلغ عن أي نشاط مشبوه فوراً

❌ **لا تفعل:**
- مشاركة بيانات دخول المسؤول
- ترك جلستك دون مراقبة
- استخدام أجهزة عامة للمهام الإدارية
- حفظ كلمات المرور في المتصفح

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 3. Dashboard Overview | نظرة عامة على لوحة التحكم

### 3.1 Dashboard Layout | تخطيط لوحة التحكم

#### **English:**

Upon successful login, you'll see the **Administrator Dashboard** with:

**Header Bar** (Top of screen)
- System title: "FOLIO LMS"
- User profile icon (top right)
- Notifications bell icon
- Logout button

**Sidebar Navigation** (Left side)
- Dashboard
- Search
- Books
- Inventory
- Users
- Patron Groups
- Circulation
- Acquisitions
- Courses
- Fees & Fines
- Reports
- Settings

**Main Content Area** (Center)
- Key statistics and metrics
- Quick action buttons
- Recent activity
- System alerts

#### **العربية:**

بعد تسجيل الدخول بنجاح، سترى **لوحة تحكم المسؤول** مع:

**شريط الرأس** (أعلى الشاشة)
- عنوان النظام: "نظام فوليو"
- أيقونة الملف الشخصي (أعلى اليمين)
- أيقونة الإشعارات
- زر تسجيل الخروج

**شريط التنقل الجانبي** (الجانب الأيسر)
- لوحة التحكم
- البحث
- الكتب
- الجرد
- المستخدمون
- مجموعات القراء
- الإعارة
- المقتنيات
- المقررات
- الرسوم والغرامات
- التقارير
- الإعدادات

**منطقة المحتوى الرئيسية** (الوسط)
- الإحصائيات والمقاييس الرئيسية
- أزرار الإجراءات السريعة
- النشاط الأخير
- تنبيهات النظام

### 3.2 Key Statistics Cards | بطاقات الإحصائيات الرئيسية

#### **English:**

The dashboard displays real-time metrics:

**Inventory Statistics**
- 📚 **Total Inventory Items**: Total number of items
- 📖 **Available Items**: Items ready for checkout
- 🔄 **Checked Out Items**: Items currently on loan
- 📦 **On Order Items**: Items being acquired

**User Statistics**
- 👥 **Total Users**: All registered users
- 👤 **Active Patrons**: Currently active accounts
- 📋 **Pending Requests**: Outstanding holds
- ⏰ **Overdue Items**: Items past due date

**Financial Statistics**
- 💰 **Outstanding Fees**: Total uncollected
- 💳 **Fees Collected Today**: Daily revenue
- 📊 **Monthly Revenue**: Current month total

#### **العربية:**

تعرض لوحة التحكم المقاييس في الوقت الفعلي:

**إحصائيات الجرد**
- 📚 **إجمالي عناصر الجرد**: العدد الإجمالي للعناصر
- 📖 **العناصر المتاحة**: عناصر جاهزة للإعارة
- 🔄 **العناصر المُعارة**: عناصر مُعارة حالياً
- 📦 **عناصر قيد الطلب**: عناصر يتم اقتناؤها

**إحصائيات المستخدمين**
- 👥 **إجمالي المستخدمين**: جميع المستخدمين المسجلين
- 👤 **القراء النشطون**: الحسابات النشطة حالياً
- 📋 **الطلبات المعلقة**: الحجوزات القائمة
- ⏰ **العناصر المتأخرة**: عناصر تجاوزت تاريخ الاستحقاق

**الإحصائيات المالية**
- 💰 **الرسوم المستحقة**: الإجمالي غير المحصّل
- 💳 **الرسوم المحصّلة اليوم**: الإيرادات اليومية
- 📊 **الإيرادات الشهرية**: إجمالي الشهر الحالي

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 4. User Management | إدارة المستخدمين

### 4.1 Accessing User Management | الوصول إلى إدارة المستخدمين

**Navigation Path | مسار التنقل**: Sidebar → **Users** | الشريط الجانبي → **المستخدمون**

### 4.2 Creating a New User | إنشاء مستخدم جديد

#### **English: Step-by-Step Instructions**

1. **Click "Add New User" button** (top right)

2. **Fill in Required Fields:**

   **Personal Information**
   - First Name: *Required*
   - Middle Name: *Optional*
   - Last Name: *Required*
   - Email: *Required* (valid email format)
   - Username: *Required* (unique)

   **Contact Information**
   - Phone Number: *Optional*
   - Mobile Number: *Optional*

   **Address**
   - Street Address, City, State, Postal Code, Country: *All Optional*

3. **Set User Type:**
   - **Staff**: Library employees
   - **Patron**: Regular users
   - **Shadow**: Observer accounts
   - **System**: Automated accounts

4. **Assign Role:**
   - Administrator: Full system access
   - Librarian: Operational access
   - Circulation Desk Staff: Limited circulation
   - Cataloger: Inventory management
   - Patron: Basic user access

5. **Select Patron Group** (for patrons):
   - Undergraduate: 14-day loans
   - Graduate: 28-day loans
   - Faculty: 90-day loans

6. **Set Initial Password:**
   - Enter temporary password
   - ✓ Check "Require password change on first login"

7. **Set User Status:**
   - ✓ Active: User can log in
   - ☐ Inactive: Account disabled

8. **Add Barcode** (Optional)

9. **Click "Create User" button**

#### **العربية: التعليمات خطوة بخطوة**

1. **انقر على زر "إضافة مستخدم جديد"** (أعلى اليمين)

2. **املأ الحقول المطلوبة:**

   **المعلومات الشخصية**
   - الاسم الأول: *مطلوب*
   - الاسم الأوسط: *اختياري*
   - اسم العائلة: *مطلوب*
   - البريد الإلكتروني: *مطلوب* (تنسيق بريد إلكتروني صالح)
   - اسم المستخدم: *مطلوب* (فريد)

   **معلومات الاتصال**
   - رقم الهاتف: *اختياري*
   - رقم الجوال: *اختياري*

   **العنوان**
   - عنوان الشارع، المدينة، المحافظة، الرمز البريدي، البلد: *جميعها اختيارية*

3. **حدد نوع المستخدم:**
   - **موظف**: موظفو المكتبة
   - **قارئ**: مستخدمون عاديون
   - **مراقب**: حسابات مراقبة
   - **نظام**: حسابات آلية

4. **عيّن الدور:**
   - مسؤول: صلاحية كاملة للنظام
   - أمين مكتبة: صلاحية تشغيلية
   - موظف إعارة: إعارة محدودة
   - مفهرس: إدارة الجرد
   - قارئ: صلاحية مستخدم أساسية

5. **اختر مجموعة القراء** (للقراء):
   - طالب جامعي: إعارة 14 يوماً
   - طالب دراسات عليا: إعارة 28 يوماً
   - عضو هيئة تدريس: إعارة 90 يوماً

6. **اضبط كلمة المرور الأولية:**
   - أدخل كلمة مرور مؤقتة
   - ✓ ضع علامة على "طلب تغيير كلمة المرور عند أول تسجيل دخول"

7. **اضبط حالة المستخدم:**
   - ✓ نشط: يمكن للمستخدم تسجيل الدخول
   - ☐ غير نشط: الحساب معطّل

8. **أضف الباركود** (اختياري)

9. **انقر على زر "إنشاء مستخدم"**

### 4.3 Editing User Information | تحرير معلومات المستخدم

#### **English:**

**To Edit a User:**
1. Find the user using search or browse
2. Click the **Edit icon** (pencil) next to the user's name
3. Modify the required fields
4. Click **"Update User"** button
5. Confirm changes

**Editable Fields:**
- All personal and contact information
- Role assignments
- Patron group
- Active/Inactive status
- Barcode

**Non-Editable Fields:**
- User ID (system generated)
- Created Date
- Tenant ID

#### **العربية:**

**لتحرير مستخدم:**
1. ابحث عن المستخدم باستخدام البحث أو التصفح
2. انقر على **أيقونة التحرير** (قلم الرصاص) بجوار اسم المستخدم
3. عدّل الحقول المطلوبة
4. انقر على زر **"تحديث المستخدم"**
5. أكّد التغييرات

**الحقول القابلة للتحرير:**
- جميع المعلومات الشخصية ومعلومات الاتصال
- تعيينات الأدوار
- مجموعة القراء
- حالة نشط/غير نشط
- الباركود

**الحقول غير القابلة للتحرير:**
- معرّف المستخدم (تم إنشاؤه بواسطة النظام)
- تاريخ الإنشاء
- معرّف المستأجر

### 4.4 Deactivating Users | إلغاء تفعيل المستخدمين

#### **English:**

**To Deactivate a User:**
1. Navigate to the user's edit screen
2. Uncheck the **"Active"** checkbox
3. Click **"Update User"**
4. Confirm deactivation

**Effects of Deactivation:**
- User cannot log in
- Active loans remain active
- Outstanding fees still due
- User data retained

⚠️ **Note**: System roles cannot be deleted, only deactivated.

#### **العربية:**

**لإلغاء تفعيل مستخدم:**
1. انتقل إلى شاشة تحرير المستخدم
2. أزل العلامة من مربع **"نشط"**
3. انقر على **"تحديث المستخدم"**
4. أكّد إلغاء التفعيل

**تأثيرات إلغاء التفعيل:**
- لا يستطيع المستخدم تسجيل الدخول
- الإعارات النشطة تظل نشطة
- الرسوم المستحقة لا تزال مستحقة
- يتم الاحتفاظ ببيانات المستخدم

⚠️ **ملاحظة**: لا يمكن حذف أدوار النظام، بل إلغاء تفعيلها فقط.

### 4.5 Bulk User Operations | العمليات الجماعية للمستخدمين

#### **English: Import Users (CSV)**

1. Click **"Import Users"** button
2. Download the CSV template
3. Fill in user data following the template
4. Upload the completed CSV file
5. Review import preview
6. Click **"Confirm Import"**

**CSV Template Format:**
```csv
first_name,last_name,email,username,user_type,role
John,Doe,john.doe@email.com,jdoe,patron,Patron
Jane,Smith,jane.smith@email.com,jsmith,staff,Librarian
```

**Export Users:**
1. Click **"Export"** button
2. Select format (CSV, Excel, PDF)
3. Choose fields to include
4. Click **"Download"**

#### **العربية: استيراد المستخدمين (CSV)**

1. انقر على زر **"استيراد المستخدمين"**
2. نزّل قالب CSV
3. املأ بيانات المستخدمين وفقاً للقالب
4. ارفع ملف CSV المكتمل
5. راجع معاينة الاستيراد
6. انقر على **"تأكيد الاستيراد"**

**تنسيق قالب CSV:**
```csv
first_name,last_name,email,username,user_type,role
أحمد,محمد,ahmed@email.com,ahmed,patron,Patron
فاطمة,علي,fatima@email.com,fatima,staff,Librarian
```

**تصدير المستخدمين:**
1. انقر على زر **"تصدير"**
2. اختر التنسيق (CSV، إكسل، PDF)
3. اختر الحقول المراد تضمينها
4. انقر على **"تنزيل"**

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 5. Role & Permission Management | إدارة الأدوار والصلاحيات

### 5.1 Understanding Roles and Permissions | فهم الأدوار والصلاحيات

#### **English:**

**Roles** are groups of permissions assigned to users that define what they can do in the system.

**Permissions** are individual access rights to specific system functions.

#### **العربية:**

**الأدوار** هي مجموعات من الصلاحيات المخصصة للمستخدمين التي تحدد ما يمكنهم فعله في النظام.

**الصلاحيات** هي حقوق وصول فردية لوظائف معينة في النظام.

### 5.2 System Roles | أدوار النظام

#### **English: Pre-defined Roles**

**1. Administrator**
- All permissions granted
- Cannot be deleted or modified
- Full system access

**2. Librarian**
- Inventory: Create, Read, Update
- Users: Read, Update
- Circulation: All operations
- Acquisitions: Create, Read, Update
- Fees: Read, Update, Waive
- Reports: Read, Export

**3. Circulation Desk Staff**
- Circulation: Checkout, Checkin, Renew
- Inventory: Read only
- Users: Read only
- Fees: Read only

**4. Cataloger**
- Inventory: Create, Read, Update
- Reports: Read

**5. Patron**
- Inventory: Read only (search and browse)

#### **العربية: الأدوار المحددة مسبقاً**

**1. المسؤول**
- جميع الصلاحيات ممنوحة
- لا يمكن حذفه أو تعديله
- صلاحية كاملة للنظام

**2. أمين المكتبة**
- الجرد: إنشاء، قراءة، تحديث
- المستخدمون: قراءة، تحديث
- الإعارة: جميع العمليات
- المقتنيات: إنشاء، قراءة، تحديث
- الرسوم: قراءة، تحديث، إعفاء
- التقارير: قراءة، تصدير

**3. موظف خدمة الإعارة**
- الإعارة: إعارة، استرجاع، تجديد
- الجرد: قراءة فقط
- المستخدمون: قراءة فقط
- الرسوم: قراءة فقط

**4. المفهرس**
- الجرد: إنشاء، قراءة، تحديث
- التقارير: قراءة

**5. القارئ**
- الجرد: قراءة فقط (البحث والتصفح)

### 5.3 Permission Categories | فئات الصلاحيات

#### **English: 23 Total Permissions**

**Inventory Permissions:**
- `inventory.create` - Create new inventory items
- `inventory.read` - View inventory items
- `inventory.update` - Edit inventory items
- `inventory.delete` - Delete inventory items

**User Permissions:**
- `users.create` - Create new users
- `users.read` - View user information
- `users.update` - Edit user information
- `users.delete` - Delete user accounts

**Circulation Permissions:**
- `circulation.checkout` - Check out items
- `circulation.checkin` - Check in items
- `circulation.renew` - Renew loans

**Acquisitions Permissions:**
- `acquisitions.create` - Create purchase orders
- `acquisitions.read` - View acquisitions
- `acquisitions.update` - Edit acquisitions
- `acquisitions.delete` - Delete acquisitions

**Fees Permissions:**
- `fees.create` - Create new fees
- `fees.read` - View fees
- `fees.update` - Update fee status
- `fees.waive` - Waive fees

**Reports Permissions:**
- `reports.read` - View reports
- `reports.export` - Export report data

**Settings Permissions:**
- `settings.read` - View system settings
- `settings.update` - Modify system settings

#### **العربية: 23 صلاحية إجمالية**

**صلاحيات الجرد:**
- `inventory.create` - إنشاء عناصر جرد جديدة
- `inventory.read` - عرض عناصر الجرد
- `inventory.update` - تحرير عناصر الجرد
- `inventory.delete` - حذف عناصر الجرد

**صلاحيات المستخدمين:**
- `users.create` - إنشاء مستخدمين جدد
- `users.read` - عرض معلومات المستخدمين
- `users.update` - تحرير معلومات المستخدمين
- `users.delete` - حذف حسابات المستخدمين

**صلاحيات الإعارة:**
- `circulation.checkout` - إعارة العناصر
- `circulation.checkin` - استرجاع العناصر
- `circulation.renew` - تجديد الإعارات

**صلاحيات المقتنيات:**
- `acquisitions.create` - إنشاء أوامر شراء
- `acquisitions.read` - عرض المقتنيات
- `acquisitions.update` - تحرير المقتنيات
- `acquisitions.delete` - حذف المقتنيات

**صلاحيات الرسوم:**
- `fees.create` - إنشاء رسوم جديدة
- `fees.read` - عرض الرسوم
- `fees.update` - تحديث حالة الرسوم
- `fees.waive` - إعفاء من الرسوم

**صلاحيات التقارير:**
- `reports.read` - عرض التقارير
- `reports.export` - تصدير بيانات التقارير

**صلاحيات الإعدادات:**
- `settings.read` - عرض إعدادات النظام
- `settings.update` - تعديل إعدادات النظام

### 5.4 Assigning Roles to Users | تعيين الأدوار للمستخدمين

#### **English:**

**When Creating a New User:**
1. Select role from dropdown menu in user creation form

**For Existing Users:**
1. Navigate to Users → Select User → Edit
2. In the "Role" dropdown, select the appropriate role
3. Click "Update User"
4. User's permissions update immediately

⚠️ **Important**: Role changes take effect immediately.

#### **العربية:**

**عند إنشاء مستخدم جديد:**
1. اختر الدور من القائمة المنسدلة في نموذج إنشاء المستخدم

**للمستخدمين الحاليين:**
1. انتقل إلى المستخدمون → اختر المستخدم → تحرير
2. في القائمة المنسدلة "الدور"، اختر الدور المناسب
3. انقر على "تحديث المستخدم"
4. تتحدث صلاحيات المستخدم فوراً

⚠️ **مهم**: تدخل تغييرات الأدوار حيز التنفيذ فوراً.

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 6. Inventory Management | إدارة الجرد

### 6.1 Inventory Structure | هيكل الجرد

#### **English:**

FOLIO LMS uses a three-level hierarchy:

**Instance** → **Holdings** → **Items**

- **Instance**: Bibliographic record (title, author, ISBN)
- **Holdings**: Physical location and call number
- **Item**: Individual physical copy with barcode

#### **العربية:**

يستخدم نظام فوليو هيكل هرمي من ثلاثة مستويات:

**النسخة** ← **المقتنيات** ← **العناصر**

- **النسخة**: السجل الببليوجرافي (العنوان، المؤلف، ISBN)
- **المقتنيات**: الموقع الفعلي ورقم الاستدعاء
- **العنصر**: النسخة المادية الفردية مع الباركود

### 6.2 Creating a New Inventory Item | إنشاء عنصر جرد جديد

#### **English: Full Workflow**

**Step 1: Create Instance**
1. Click **"Add Instance"** button
2. Fill in bibliographic information:
   - **Title**: *Required*
   - **Contributors** (Authors):
     - Name, Type (Author, Editor, etc.)
   - **Identifiers**: ISBN, ISSN
   - **Publication**: Publisher, Place, Date
   - **Edition**, **Pages**, **Languages**
   - **Resource Type**: Book, Journal, DVD, etc.
   - **Subjects**: Subject headings
3. Click **"Create Instance"**

**Step 2: Add Holdings**
1. From Instance page, click **"Add Holdings"**
2. Fill in:
   - **Location**: Select library location *Required*
   - **Call Number Type**: LC, Dewey, etc.
   - **Call Number**: *Required*
   - **Copy Number**: *Optional*
3. Click **"Create Holdings"**

**Step 3: Add Items**
1. From Holdings page, click **"Add Item"**
2. Fill in:
   - **Barcode**: *Required* (unique)
   - **Item Status**: Available, Checked Out, etc.
   - **Material Type**: Book, DVD, etc. *Required*
   - **Loan Type**: Can Circulate, Reading Room
   - **Volume**, **Copy Number**
3. Click **"Create Item"**

#### **العربية: سير العمل الكامل**

**الخطوة 1: إنشاء نسخة**
1. انقر على زر **"إضافة نسخة"**
2. املأ المعلومات الببليوجرافية:
   - **العنوان**: *مطلوب*
   - **المساهمون** (المؤلفون):
     - الاسم، النوع (مؤلف، محرر، إلخ.)
   - **المعرّفات**: ISBN، ISSN
   - **النشر**: الناشر، المكان، التاريخ
   - **الطبعة**، **الصفحات**، **اللغات**
   - **نوع المورد**: كتاب، مجلة، DVD، إلخ.
   - **الموضوعات**: رؤوس الموضوعات
3. انقر على **"إنشاء نسخة"**

**الخطوة 2: إضافة مقتنيات**
1. من صفحة النسخة، انقر على **"إضافة مقتنيات"**
2. املأ:
   - **الموقع**: اختر موقع المكتبة *مطلوب*
   - **نوع رقم الاستدعاء**: LC، ديوي، إلخ.
   - **رقم الاستدعاء**: *مطلوب*
   - **رقم النسخة**: *اختياري*
3. انقر على **"إنشاء مقتنيات"**

**الخطوة 3: إضافة عناصر**
1. من صفحة المقتنيات، انقر على **"إضافة عنصر"**
2. املأ:
   - **الباركود**: *مطلوب* (فريد)
   - **حالة العنصر**: متاح، مُعار، إلخ.
   - **نوع المادة**: كتاب، DVD، إلخ. *مطلوب*
   - **نوع الإعارة**: قابل للإعارة، غرفة القراءة
   - **المجلد**، **رقم النسخة**
3. انقر على **"إنشاء عنصر"**

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 7. Circulation Operations | عمليات الإعارة

### 7.1 Check Out | الإعارة

#### **English: To Check Out an Item**

1. Click **"Check Out"** tab
2. **Scan or enter patron barcode**
   - Type in "Patron Barcode" field
   - Press Enter
   - Patron information displays
3. **Verify patron eligibility:**
   - Active account status
   - No blocks
   - Fees below maximum
4. **Scan or enter item barcode**
   - Type in "Item Barcode" field
   - Press Enter
5. **Review checkout details:**
   - Item information
   - Due date (auto-calculated)
6. **Confirm checkout**
   - Click **"Check Out"** button

**Due Date Calculation:**
- Undergraduate: +14 days
- Graduate: +28 days
- Faculty: +90 days

#### **العربية: لإعارة عنصر**

1. انقر على تبويب **"الإعارة"**
2. **امسح أو أدخل باركود القارئ**
   - اكتب في حقل "باركود القارئ"
   - اضغط Enter
   - تظهر معلومات القارئ
3. **تحقق من أهلية القارئ:**
   - حالة الحساب نشطة
   - لا توجد قيود
   - الرسوم أقل من الحد الأقصى
4. **امسح أو أدخل باركود العنصر**
   - اكتب في حقل "باركود العنصر"
   - اضغط Enter
5. **راجع تفاصيل الإعارة:**
   - معلومات العنصر
   - تاريخ الاستحقاق (محسوب تلقائياً)
6. **أكّد الإعارة**
   - انقر على زر **"إعارة"**

**حساب تاريخ الاستحقاق:**
- طالب جامعي: +14 يوماً
- طالب دراسات عليا: +28 يوماً
- عضو هيئة تدريس: +90 يوماً

### 7.2 Check In | الاسترجاع

#### **English: To Check In an Item**

1. Click **"Check In"** tab
2. **Scan or enter item barcode**
   - Type in "Item Barcode" field
   - Press Enter
3. **Review check-in information:**
   - Item details
   - Patron information
   - Return date
   - Overdue status
4. **Handle special situations:**
   - **If Overdue**: Fine automatically created
   - **If Damaged**: Add damage note and fee
   - **If Hold Exists**: Alert to place on hold shelf
5. **Confirm check-in**
   - Click **"Check In"** button

#### **العربية: لاسترجاع عنصر**

1. انقر على تبويب **"الاسترجاع"**
2. **امسح أو أدخل باركود العنصر**
   - اكتب في حقل "باركود العنصر"
   - اضغط Enter
3. **راجع معلومات الاسترجاع:**
   - تفاصيل العنصر
   - معلومات القارئ
   - تاريخ الإرجاع
   - حالة التأخر
4. **تعامل مع الحالات الخاصة:**
   - **إذا كان متأخراً**: تُنشأ غرامة تلقائياً
   - **إذا كان تالفاً**: أضف ملاحظة عن التلف والرسم
   - **إذا وُجد حجز**: تنبيه لوضع العنصر على رف الحجز
5. **أكّد الاسترجاع**
   - انقر على زر **"استرجاع"**

### 7.3 Renew | التجديد

#### **English: To Renew an Item**

**Method 1: From Patron Account**
1. Look up patron
2. View **"Current Loans"** section
3. Find item to renew
4. Click **"Renew"** button

**Renewal Validation:**
✅ **Allowed if:**
- Item allows renewals
- No holds by other patrons
- Patron account active
- Not exceeding maximum renewals

❌ **Blocked if:**
- Maximum renewals reached
- Item has holds
- Patron account blocked

**Renewal Limits:**
- Default: 2 renewals per item

#### **العربية: لتجديد عنصر**

**الطريقة 1: من حساب القارئ**
1. ابحث عن القارئ
2. اعرض قسم **"الإعارات الحالية"**
3. اعثر على العنصر المراد تجديده
4. انقر على زر **"تجديد"**

**التحقق من صحة التجديد:**
✅ **مسموح إذا:**
- العنصر يسمح بالتجديدات
- لا توجد حجوزات من قراء آخرين
- حساب القارئ نشط
- لم يتجاوز الحد الأقصى من التجديدات

❌ **محظور إذا:**
- تم الوصول إلى الحد الأقصى من التجديدات
- العنصر محجوز
- حساب القارئ محظور

**حدود التجديد:**
- الافتراضي: تجديدان لكل عنصر

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 8. Acquisitions Management | إدارة المقتنيات

### 8.1 Managing Vendors | إدارة الموردين

#### **English: To Add a New Vendor**

1. Click **"Vendors"** tab
2. Click **"Add Vendor"** button
3. Fill in vendor information:
   - **Vendor Name**: *Required*
   - **Vendor Code**: *Required* (unique)
   - **Contact Information**: Email, Phone
   - **Address**: Full address
   - **Payment Terms**: Net 30, Net 60, etc.
   - **Discount**: Percentage offered
4. Click **"Create Vendor"**

#### **العربية: لإضافة مورّد جديد**

1. انقر على تبويب **"الموردون"**
2. انقر على زر **"إضافة مورّد"**
3. املأ معلومات المورّد:
   - **اسم المورّد**: *مطلوب*
   - **رمز المورّد**: *مطلوب* (فريد)
   - **معلومات الاتصال**: البريد الإلكتروني، الهاتف
   - **العنوان**: العنوان الكامل
   - **شروط الدفع**: صافي 30، صافي 60، إلخ.
   - **الخصم**: النسبة المئوية المعروضة
4. انقر على **"إنشاء مورّد"**

### 8.2 Creating Purchase Orders | إنشاء أوامر شراء

#### **English: Purchase Order Creation**

1. Click **"Purchase Orders"** tab
2. Click **"Create Purchase Order"**
3. **Fill in Order Header:**
   - **PO Number**: Auto-generated
   - **Vendor**: Select *Required*
   - **Order Type**: One-Time, Ongoing
   - **Order Date**: Auto-filled
   - **Status**: Pending, Open, Closed

4. **Add Order Lines:**
   - Click **"Add Line Item"**
   - **Title**: *Required*
   - **Author**, **Publisher**, **ISBN**
   - **Quantity**: *Required*
   - **Price**: *Required*
   - **Fund**: Budget allocation
   - **Location**: Destination
5. **Review and Create**

#### **العربية: إنشاء أمر شراء**

1. انقر على تبويب **"أوامر الشراء"**
2. انقر على **"إنشاء أمر شراء"**
3. **املأ رأس الأمر:**
   - **رقم أمر الشراء**: يُنشأ تلقائياً
   - **المورّد**: اختر *مطلوب*
   - **نوع الأمر**: لمرة واحدة، مستمر
   - **تاريخ الأمر**: يُملأ تلقائياً
   - **الحالة**: معلق، مفتوح، مغلق

4. **أضف بنود الأمر:**
   - انقر على **"إضافة بند"**
   - **العنوان**: *مطلوب*
   - **المؤلف**، **الناشر**، **ISBN**
   - **الكمية**: *مطلوب*
   - **السعر**: *مطلوب*
   - **الصندوق**: تخصيص الميزانية
   - **الموقع**: الوجهة
5. **راجع وأنشئ**

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 9. Course Management | إدارة المقررات

### 9.1 Creating a New Course | إنشاء مقرر جديد

#### **English:**

1. Click **"Add Course"** button
2. Fill in course information:
   - **Course Name**: *Required* (e.g., "Introduction to Psychology")
   - **Course Code**: *Required* (e.g., "PSYC-101")
   - **Department**: *Required*
   - **Semester/Term**: *Required*
   - **Start Date** and **End Date**
   - **Instructors**: Add instructors
3. Click **"Create Course"**

#### **العربية:**

1. انقر على زر **"إضافة مقرر"**
2. املأ معلومات المقرر:
   - **اسم المقرر**: *مطلوب* (مثال: "مقدمة في علم النفس")
   - **رمز المقرر**: *مطلوب* (مثال: "PSY-101")
   - **القسم**: *مطلوب*
   - **الفصل الدراسي**: *مطلوب*
   - **تاريخ البدء** و **تاريخ الانتهاء**
   - **المدرسون**: أضف المدرسين
3. انقر على **"إنشاء مقرر"**

### 9.2 Managing Course Reserves | إدارة احتياطي المقررات

#### **English: Add Items to Course Reserves**

1. Navigate to course detail page
2. Click **"Reserves"** tab
3. Click **"Add Reserve Item"**
4. Search for item
5. Set reserve parameters:
   - **Reserve Type**: Physical, Electronic
   - **Loan Period**: 2 Hours, 1 Day, etc.
   - **Start/End Date**
6. Click **"Add to Reserves"**

#### **العربية: إضافة عناصر إلى احتياطي المقررات**

1. انتقل إلى صفحة تفاصيل المقرر
2. انقر على تبويب **"الاحتياطي"**
3. انقر على **"إضافة عنصر احتياطي"**
4. ابحث عن العنصر
5. اضبط معايير الاحتياطي:
   - **نوع الاحتياطي**: مادي، إلكتروني
   - **فترة الإعارة**: ساعتان، يوم واحد، إلخ.
   - **تاريخ البدء/الانتهاء**
6. انقر على **"إضافة إلى الاحتياطي"**

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 10. Fees & Fines Administration | إدارة الرسوم والغرامات

### 10.1 Understanding Fee Types | فهم أنواع الرسوم

#### **English:**

**Automatic Fees:**
- **Overdue Fines**: Items returned late
- **Lost Item Fees**: Items declared lost
- **Damage Fees**: Damaged returns

**Manual Fees:**
- **Replacement Fees**: Lost/damaged items
- **Processing Fees**: Administrative costs
- **Service Fees**: Misc. services

#### **العربية:**

**الرسوم التلقائية:**
- **غرامات التأخير**: عناصر أُرجعت متأخرة
- **رسوم العناصر المفقودة**: عناصر أُعلن عن فقدانها
- **رسوم التلف**: إرجاعات تالفة

**الرسوم اليدوية:**
- **رسوم الاستبدال**: عناصر مفقودة/تالفة
- **رسوم المعالجة**: تكاليف إدارية
- **رسوم الخدمة**: خدمات متنوعة

### 10.2 Creating Manual Fees | إنشاء رسوم يدوية

#### **English:**

1. Navigate to patron's fee page
2. Click **"Add Fee"** button
3. Fill in fee information:
   - **Fee Type**: *Required*
   - **Amount**: *Required*
   - **Reason**: *Required*
   - **Related Item**: If applicable
   - **Due Date**
4. Click **"Create Fee"**

#### **العربية:**

1. انتقل إلى صفحة رسوم القارئ
2. انقر على زر **"إضافة رسم"**
3. املأ معلومات الرسم:
   - **نوع الرسم**: *مطلوب*
   - **المبلغ**: *مطلوب*
   - **السبب**: *مطلوب*
   - **العنصر المرتبط**: إن وُجد
   - **تاريخ الاستحقاق**
4. انقر على **"إنشاء رسم"**

### 10.3 Recording Payments | تسجيل الدفعات

#### **English:**

1. Find the fee to pay
2. Click **"Pay"** button
3. Enter payment details:
   - **Payment Amount**: *Required*
   - **Payment Method**: Cash, Card, Check, etc.
   - **Transaction ID**
4. Click **"Record Payment"**

**Payment Confirmation:**
- Fee status updates
- Receipt generated
- Balance updated

#### **العربية:**

1. اعثر على الرسم المراد دفعه
2. انقر على زر **"دفع"**
3. أدخل تفاصيل الدفع:
   - **مبلغ الدفع**: *مطلوب*
   - **طريقة الدفع**: نقداً، بطاقة، شيك، إلخ.
   - **معرّف المعاملة**
4. انقر على **"تسجيل الدفع"**

**تأكيد الدفع:**
- تحديث حالة الرسم
- إنشاء إيصال
- تحديث الرصيد

### 10.4 Waiving Fees | إعفاء من الرسوم

#### **English:**

⚠️ **Important**: Fee waivers should be documented properly.

**To Waive a Fee:**
1. Find the fee
2. Click **"Waive"** button
3. Enter waiver information:
   - **Waive Amount**: *Required*
   - **Reason**: *Required*
     - First-time offense
     - System error
     - Patron dispute
     - Staff discretion
4. Click **"Confirm Waiver"**

**Waiver Authorization:**
- Requires `fees.waive` permission
- All waivers logged
- Cannot be undone

#### **العربية:**

⚠️ **مهم**: يجب توثيق الإعفاءات من الرسوم بشكل صحيح.

**للإعفاء من رسم:**
1. اعثر على الرسم
2. انقر على زر **"إعفاء"**
3. أدخل معلومات الإعفاء:
   - **مبلغ الإعفاء**: *مطلوب*
   - **السبب**: *مطلوب*
     - مخالفة أولى
     - خطأ في النظام
     - نزاع مع القارئ
     - تقدير الموظفين
4. انقر على **"تأكيد الإعفاء"**

**تفويض الإعفاء:**
- يتطلب صلاحية `fees.waive`
- جميع الإعفاءات مسجلة
- لا يمكن التراجع عنه

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 11. Reports & Analytics | التقارير والتحليلات

### 11.1 Report Categories | فئات التقارير

#### **English:**

**Dashboard Statistics:**
- Real-time metrics
- Visual charts

**Inventory Reports:**
- Collection size
- Items by location
- Items by type
- Acquisition statistics

**Circulation Reports:**
- Checkouts by date
- Most borrowed items
- Overdue items

**User Reports:**
- Total users
- Active patrons
- Registrations

**Financial Reports:**
- Fee collection
- Outstanding fees
- Revenue trends

**Acquisitions Reports:**
- Orders by vendor
- Budget expenditure

**Course Reports:**
- Courses by term
- Reserve usage

#### **العربية:**

**إحصائيات لوحة التحكم:**
- مقاييس في الوقت الفعلي
- رسوم بيانية مرئية

**تقارير الجرد:**
- حجم المجموعة
- عناصر حسب الموقع
- عناصر حسب النوع
- إحصائيات الاقتناء

**تقارير الإعارة:**
- الإعارات حسب التاريخ
- العناصر الأكثر استعارة
- العناصر المتأخرة

**تقارير المستخدمين:**
- إجمالي المستخدمين
- القراء النشطون
- التسجيلات

**التقارير المالية:**
- تحصيل الرسوم
- الرسوم المستحقة
- اتجاهات الإيرادات

**تقارير المقتنيات:**
- أوامر حسب المورّد
- إنفاق الميزانية

**تقارير المقررات:**
- مقررات حسب الفصل
- استخدام الاحتياطي

### 11.2 Generating Reports | إنشاء التقارير

#### **English:**

1. Select report category
2. Choose specific report type
3. **Set parameters:**
   - **Date Range**: Start and end dates
   - **Filters**: Location, Type, Status
   - **Sort Options**
   - **Group By**
4. Click **"Generate Report"**
5. View results

#### **العربية:**

1. اختر فئة التقرير
2. اختر نوع التقرير المحدد
3. **اضبط المعايير:**
   - **نطاق التاريخ**: تواريخ البدء والانتهاء
   - **الفلاتر**: الموقع، النوع، الحالة
   - **خيارات الترتيب**
   - **تجميع حسب**
4. انقر على **"إنشاء تقرير"**
5. اعرض النتائج

### 11.3 Exporting Reports | تصدير التقارير

#### **English:**

**Export Options:**
- **PDF**: Formatted for printing
- **Excel (.xlsx)**: Spreadsheet format
- **CSV**: Raw data export
- **JSON**: API integration

**To Export:**
1. Generate report
2. Click **"Export"** button
3. Select format
4. Choose options
5. Click **"Download"**

#### **العربية:**

**خيارات التصدير:**
- **PDF**: منسق للطباعة
- **إكسل (.xlsx)**: تنسيق جدول بيانات
- **CSV**: تصدير بيانات خام
- **JSON**: تكامل API

**للتصدير:**
1. أنشئ التقرير
2. انقر على زر **"تصدير"**
3. اختر التنسيق
4. اختر الخيارات
5. انقر على **"تنزيل"**

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 12. System Settings | إعدادات النظام

### 12.1 General Settings | الإعدادات العامة

#### **English:**

**System Information:**
- System Name: "FOLIO LMS"
- Version Information
- Tenant Configuration

**Display Settings:**
- Date Format: MM/DD/YYYY, DD/MM/YYYY
- Time Format: 12-hour, 24-hour
- Timezone
- Language: English, Arabic

**System Behavior:**
- Session Timeout: Minutes
- Default Landing Page
- Items Per Page

#### **العربية:**

**معلومات النظام:**
- اسم النظام: "نظام فوليو"
- معلومات الإصدار
- إعدادات المستأجر

**إعدادات العرض:**
- تنسيق التاريخ: MM/DD/YYYY، DD/MM/YYYY
- تنسيق الوقت: 12 ساعة، 24 ساعة
- المنطقة الزمنية
- اللغة: إنجليزي، عربي

**سلوك النظام:**
- مهلة الجلسة: دقائق
- الصفحة الافتراضية
- عناصر لكل صفحة

### 12.2 Security Settings | إعدادات الأمان

#### **English:**

**Password Policy:**
- Minimum length: 8 characters
- Require uppercase: Yes/No
- Require lowercase: Yes/No
- Require numbers: Yes/No
- Require special characters: Yes/No
- Password expiration: Days
- Password history: Can't reuse last X

**Account Lockout:**
- Failed login attempts: Default 5
- Lockout duration: Minutes
- Account reactivation: Manual/Automatic

#### **العربية:**

**سياسة كلمة المرور:**
- الحد الأدنى للطول: 8 أحرف
- مطلوب أحرف كبيرة: نعم/لا
- مطلوب أحرف صغيرة: نعم/لا
- مطلوب أرقام: نعم/لا
- مطلوب أحرف خاصة: نعم/لا
- انتهاء صلاحية كلمة المرور: أيام
- سجل كلمة المرور: لا يمكن إعادة استخدام آخر X

**قفل الحساب:**
- محاولات تسجيل دخول فاشلة: افتراضي 5
- مدة القفل: دقائق
- إعادة تنشيط الحساب: يدوي/تلقائي

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 13. Search Functionality | وظيفة البحث

### 13.1 Basic Search | البحث الأساسي

#### **English:**

**Simple Search:**
1. Enter search terms in search box
2. Press Enter or click search icon
3. View results

**Search Fields:**
- Title
- Author/Contributor
- ISBN/ISSN
- Subject
- Keyword (searches all fields)
- Barcode (exact match)

**Example Searches:**
- `"introduction to psychology"` - Exact phrase
- `python programming` - Both words
- `shakespeare` - All fields

#### **العربية:**

**البحث البسيط:**
1. أدخل مصطلحات البحث في مربع البحث
2. اضغط Enter أو انقر على أيقونة البحث
3. اعرض النتائج

**حقول البحث:**
- العنوان
- المؤلف/المساهم
- ISBN/ISSN
- الموضوع
- كلمة مفتاحية (تبحث في جميع الحقول)
- الباركود (تطابق تام)

**أمثلة على عمليات البحث:**
- `"مقدمة في علم النفس"` - عبارة دقيقة
- `برمجة بايثون` - كلا الكلمتين
- `شكسبير` - جميع الحقول

### 13.2 Advanced Search | البحث المتقدم

#### **English:**

**To Access Advanced Search:**
1. Click **"Advanced Search"** link
2. Use multiple search fields

**Advanced Options:**
- **Title**, **Author**, **Subject**
- **ISBN**, **ISSN**, **Publisher**
- **Publication Year**: Range (2020-2025)
- **Language**
- **Material Type**
- **Location**

**Boolean Operators:**
- **AND**: Both terms must appear
- **OR**: Either term can appear
- **NOT**: Exclude term
- **" "**: Exact phrase

#### **العربية:**

**للوصول إلى البحث المتقدم:**
1. انقر على رابط **"البحث المتقدم"**
2. استخدم حقول بحث متعددة

**خيارات متقدمة:**
- **العنوان**، **المؤلف**، **الموضوع**
- **ISBN**، **ISSN**، **الناشر**
- **سنة النشر**: نطاق (2020-2025)
- **اللغة**
- **نوع المادة**
- **الموقع**

**عوامل التشغيل البولية:**
- **AND**: يجب أن يظهر كلا المصطلحين
- **OR**: يمكن أن يظهر أي من المصطلحين
- **NOT**: استبعاد المصطلح
- **" "**: عبارة دقيقة

### 13.3 Filtering Results | تصفية النتائج

#### **English:**

**Available Filters:**
- **Material Type**: Book, DVD, CD, Journal
- **Location**: Library branch
- **Language**
- **Publication Year**: Ranges
- **Availability**: Available only, All
- **Author**, **Subject**

**To Apply Filters:**
1. View search results
2. Click filter category in sidebar
3. Select filter value
4. Results update automatically

#### **العربية:**

**الفلاتر المتاحة:**
- **نوع المادة**: كتاب، DVD، CD، مجلة
- **الموقع**: فرع المكتبة
- **اللغة**
- **سنة النشر**: نطاقات
- **التوفر**: متاح فقط، الكل
- **المؤلف**، **الموضوع**

**لتطبيق الفلاتر:**
1. اعرض نتائج البحث
2. انقر على فئة الفلتر في الشريط الجانبي
3. اختر قيمة الفلتر
4. تتحدث النتائج تلقائياً

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 14. Notifications | الإشعارات

### 14.1 Notification Types | أنواع الإشعارات

#### **English:**

**System Notifications:**
- System maintenance alerts
- Software updates
- System errors
- Security alerts

**User Activity:**
- New user registrations
- Account changes
- Login activity

**Circulation:**
- Items checked out
- Items due soon
- Overdue items
- Holds available

**Financial:**
- New fees assessed
- Payments received
- Fee waivers

#### **العربية:**

**إشعارات النظام:**
- تنبيهات صيانة النظام
- تحديثات البرامج
- أخطاء النظام
- تنبيهات أمنية

**نشاط المستخدم:**
- تسجيلات مستخدمين جدد
- تغييرات الحساب
- نشاط تسجيل الدخول

**الإعارة:**
- عناصر مُعارة
- عناصر تستحق قريباً
- عناصر متأخرة
- حجوزات متاحة

**المالية:**
- رسوم جديدة مقيّمة
- دفعات مستلمة
- إعفاءات من الرسوم

### 14.2 Managing Notifications | إدارة الإشعارات

#### **English:**

**Notification Bell Icon:**
- Top right of header
- Red badge shows unread count
- Click to open dropdown

**Actions:**
- **Mark as Read**: Click notification
- **Mark All as Read**: Button
- **Delete**: Click "X" icon
- **Clear All Read**: Remove all read

**Settings:**
1. Profile → **Settings**
2. **Notifications** tab
3. Choose notification types:
   - In-app: ✓ Enabled
   - Email: Select types
   - SMS: If available
4. Set frequency:
   - Real-time
   - Daily digest
   - None
5. **Save Preferences**

#### **العربية:**

**أيقونة جرس الإشعارات:**
- أعلى اليمين في الرأس
- شارة حمراء تظهر عدد غير المقروءة
- انقر لفتح القائمة المنسدلة

**الإجراءات:**
- **وضع علامة مقروء**: انقر على الإشعار
- **وضع علامة على الكل كمقروء**: زر
- **حذف**: انقر على أيقونة "X"
- **مسح الكل المقروء**: إزالة كل المقروءة

**الإعدادات:**
1. الملف الشخصي → **الإعدادات**
2. تبويب **الإشعارات**
3. اختر أنواع الإشعارات:
   - في التطبيق: ✓ مفعّل
   - البريد الإلكتروني: اختر الأنواع
   - SMS: إن وُجد
4. اضبط التكرار:
   - وقت فعلي
   - ملخص يومي
   - لا شيء
5. **احفظ التفضيلات**

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 15. Troubleshooting | حل المشكلات

### 15.1 Login Issues | مشاكل تسجيل الدخول

#### **English: Common Problems**

**Problem**: Cannot log in

**Solutions:**
1. **Verify credentials**
   - Check username (case-sensitive)
   - Ensure Caps Lock is off
   - Try password reset

2. **Check account status**
   - Account may be deactivated
   - Contact another administrator

3. **Clear browser cache**
   - Press Ctrl+Shift+Delete
   - Clear cached files
   - Try again

4. **Try different browser**
   - Test with Chrome, Firefox, Edge
   - Ensure JavaScript enabled

**Problem**: Locked out after failed attempts

**Solutions:**
- Wait for automatic unlock (15 minutes)
- Contact administrator to unlock
- Use "Forgot Password" link

#### **العربية: المشاكل الشائعة**

**المشكلة**: لا أستطيع تسجيل الدخول

**الحلول:**
1. **تحقق من بيانات الدخول**
   - تحقق من اسم المستخدم (حساس لحالة الأحرف)
   - تأكد من إيقاف Caps Lock
   - جرّب إعادة تعيين كلمة المرور

2. **تحقق من حالة الحساب**
   - قد يكون الحساب معطّلاً
   - اتصل بمسؤول آخر

3. **امسح ذاكرة التخزين المؤقت للمتصفح**
   - اضغط Ctrl+Shift+Delete
   - امسح الملفات المخزنة مؤقتاً
   - حاول مرة أخرى

4. **جرّب متصفحاً مختلفاً**
   - اختبر مع كروم، فايرفوكس، إيدج
   - تأكد من تفعيل JavaScript

**المشكلة**: مقفل بعد محاولات فاشلة

**الحلول:**
- انتظر إلغاء القفل التلقائي (15 دقيقة)
- اتصل بالمسؤول لإلغاء القفل
- استخدم رابط "نسيت كلمة المرور"

### 15.2 Circulation Issues | مشاكل الإعارة

#### **English:**

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Item already checked out" | Item is on loan | Check in first |
| "Patron account blocked" | Account has restrictions | Resolve blocks |
| "Item has holds" | Another patron requested | Check request queue |
| "Patron limit reached" | Maximum loans exceeded | Check in items |

#### **العربية:**

| رسالة الخطأ | السبب | الحل |
|-------------|-------|------|
| "العنصر مُعار بالفعل" | العنصر معار | استرجعه أولاً |
| "حساب القارئ محظور" | الحساب به قيود | حل القيود |
| "العنصر محجوز" | قارئ آخر طلبه | تحقق من قائمة الطلبات |
| "تم الوصول للحد الأقصى" | تجاوز الحد الأقصى | استرجع عناصر |

### 15.3 Performance Issues | مشاكل الأداء

#### **English:**

**Problem**: System is slow

**Solutions:**
1. Clear browser cache
2. Close unused tabs
3. Check internet connection
4. Restart browser
5. Try different browser
6. Check server status

**Problem**: Page won't load

**Solutions:**
1. Refresh page (F5)
2. Hard refresh (Ctrl+Shift+R)
3. Check console (F12)
4. Clear cookies
5. Try incognito mode

#### **العربية:**

**المشكلة**: النظام بطيء

**الحلول:**
1. امسح ذاكرة التخزين المؤقت للمتصفح
2. أغلق التبويبات غير المستخدمة
3. تحقق من اتصال الإنترنت
4. أعد تشغيل المتصفح
5. جرّب متصفحاً مختلفاً
6. تحقق من حالة الخادم

**المشكلة**: الصفحة لا تُحمّل

**الحلول:**
1. حدّث الصفحة (F5)
2. تحديث قوي (Ctrl+Shift+R)
3. تحقق من وحدة التحكم (F12)
4. امسح ملفات تعريف الارتباط
5. جرّب وضع التصفح المتخفي

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 16. Best Practices | أفضل الممارسات

### 16.1 Security Best Practices | أفضل ممارسات الأمان

#### **English:**

✅ **Do:**
- Use strong passwords and change regularly
- Never share administrator credentials
- Log out when leaving workstation
- Review user permissions regularly
- Monitor system logs
- Keep software updated
- Backup data regularly

❌ **Don't:**
- Share login credentials
- Leave sessions unattended
- Use weak passwords
- Ignore security alerts
- Skip backups

#### **العربية:**

✅ **افعل:**
- استخدم كلمات مرور قوية وغيّرها بانتظام
- لا تشارك بيانات دخول المسؤول أبداً
- سجّل خروجك عند ترك محطة العمل
- راجع صلاحيات المستخدمين بانتظام
- راقب سجلات النظام
- حافظ على تحديث البرامج
- انسخ البيانات احتياطياً بانتظام

❌ **لا تفعل:**
- مشاركة بيانات تسجيل الدخول
- ترك الجلسات دون مراقبة
- استخدام كلمات مرور ضعيفة
- تجاهل التنبيهات الأمنية
- تخطّي النسخ الاحتياطية

### 16.2 Data Management | إدارة البيانات

#### **English:**

✅ **Best Practices:**
- Validate data during entry
- Use consistent formatting
- Avoid duplicate records
- Regular data cleanup
- Test changes in development first
- Document system changes
- Maintain audit trails

#### **العربية:**

✅ **أفضل الممارسات:**
- التحقق من صحة البيانات أثناء الإدخال
- استخدم تنسيقاً متسقاً
- تجنب السجلات المكررة
- تنظيف البيانات بانتظام
- اختبر التغييرات في التطوير أولاً
- وثّق تغييرات النظام
- حافظ على مسارات التدقيق

### 16.3 User Support | دعم المستخدمين

#### **English:**

✅ **Support Best Practices:**
- Respond promptly to user issues
- Document common problems
- Provide clear instructions
- Offer training resources
- Be patient and professional
- Follow up on resolved issues

#### **العربية:**

✅ **أفضل ممارسات الدعم:**
- استجب بسرعة لمشاكل المستخدمين
- وثّق المشاكل الشائعة
- قدّم تعليمات واضحة
- وفّر موارد التدريب
- كن صبوراً ومحترفاً
- تابع المشاكل المحلولة

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 17. Keyboard Shortcuts | اختصارات لوحة المفاتيح

### 17.1 Global Shortcuts | الاختصارات العامة

#### **English & Arabic | إنجليزي وعربي**

| Shortcut | Action | الاختصار | الإجراء |
|----------|--------|-----------|---------|
| **/** | Focus search box | **/** | التركيز على مربع البحث |
| **Ctrl+S** | Save form | **Ctrl+S** | حفظ النموذج |
| **Esc** | Close modal | **Esc** | إغلاق النافذة المنبثقة |
| **F5** | Refresh page | **F5** | تحديث الصفحة |
| **Ctrl+Shift+R** | Hard refresh | **Ctrl+Shift+R** | تحديث قوي |
| **F12** | Open dev tools | **F12** | فتح أدوات المطور |

### 17.2 Navigation Shortcuts | اختصارات التنقل

#### **English & Arabic**

| Shortcut | Action | الاختصار | الإجراء |
|----------|--------|-----------|---------|
| **Alt+D** | Dashboard | **Alt+D** | لوحة التحكم |
| **Alt+S** | Search | **Alt+S** | البحث |
| **Alt+I** | Inventory | **Alt+I** | الجرد |
| **Alt+U** | Users | **Alt+U** | المستخدمون |
| **Alt+C** | Circulation | **Alt+C** | الإعارة |
| **Alt+R** | Reports | **Alt+R** | التقارير |

### 17.3 Circulation Shortcuts | اختصارات الإعارة

#### **English & Arabic**

| Shortcut | Action | الاختصار | الإجراء |
|----------|--------|-----------|---------|
| **Ctrl+O** | Quick checkout | **Ctrl+O** | إعارة سريعة |
| **Ctrl+I** | Quick checkin | **Ctrl+I** | استرجاع سريع |
| **Ctrl+N** | Quick renew | **Ctrl+N** | تجديد سريع |
| **F2** | Patron barcode | **F2** | باركود القارئ |
| **F3** | Item barcode | **F3** | باركود العنصر |

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## Appendix | الملحق

### A. Glossary | المسرد

#### **English - Arabic Terms | المصطلحات الإنجليزية - العربية**

| English | Arabic | Definition EN | التعريف بالعربية |
|---------|--------|---------------|-------------------|
| **Barcode** | **الباركود** | Unique identifier | معرّف فريد |
| **Circulation** | **الإعارة** | Checkout/checkin process | عملية الإعارة/الاسترجاع |
| **Holdings** | **المقتنيات** | Library's physical copies | النسخ المادية للمكتبة |
| **Instance** | **النسخة** | Bibliographic record | السجل الببليوجرافي |
| **Patron** | **القارئ** | Library user | مستخدم المكتبة |
| **Permission** | **الصلاحية** | Access right | حق الوصول |
| **Role** | **الدور** | Permission group | مجموعة صلاحيات |
| **Tenant** | **المستأجر** | Isolated environment | بيئة معزولة |

### B. Permission Matrix | مصفوفة الصلاحيات

#### **English & Arabic**

| Permission | Admin | Librarian | Circulation | Cataloger | Patron |
|------------|-------|-----------|-------------|-----------|--------|
| الصلاحية | المسؤول | أمين المكتبة | موظف الإعارة | المفهرس | القارئ |
| inventory.create | ✓ | ✓ | - | ✓ | - |
| inventory.read | ✓ | ✓ | ✓ | ✓ | ✓ |
| inventory.update | ✓ | ✓ | - | ✓ | - |
| inventory.delete | ✓ | - | - | - | - |
| users.create | ✓ | - | - | - | - |
| users.read | ✓ | ✓ | ✓ | - | - |
| users.update | ✓ | ✓ | - | - | - |
| users.delete | ✓ | - | - | - | - |
| circulation.checkout | ✓ | ✓ | ✓ | - | - |
| circulation.checkin | ✓ | ✓ | ✓ | - | - |
| circulation.renew | ✓ | ✓ | ✓ | - | - |
| fees.waive | ✓ | ✓ | - | - | - |
| reports.read | ✓ | ✓ | - | ✓ | - |
| settings.update | ✓ | - | - | - | - |


## Document Information | معلومات الوثيقة

**Version | الإصدار**: 1.0
**Last Updated | آخر تحديث**: October 2025
**Language | اللغة**: Bilingual (English/Arabic) | ثنائي اللغة (إنجليزي/عربي)
**Author | المؤلف**: FOLIO LMS Documentation Team | فريق وثائق نظام فوليو
**Review Cycle | دورة المراجعة**: Quarterly | ربع سنوية

---

## Copyright | حقوق النشر

© 2025 FOLIO Library Management System
All rights reserved | جميع الحقوق محفوظة

---

**[Back to Top | العودة للأعلى](#administrator-manual--دليل-المسؤول)**

**End of Administrator Manual | نهاية دليل المسؤول**
