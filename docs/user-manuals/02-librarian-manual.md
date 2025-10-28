# Librarian Manual | دليل أمين المكتبة
## FOLIO Library Management System | نظام إدارة المكتبات فوليو

**Version | الإصدار**: 1.0
**Last Updated | آخر تحديث**: October 2025
**Role | الدور**: Librarian | أمين المكتبة
**Access Level | مستوى الوصول**: Operational Access | صلاحية تشغيلية

---

## Table of Contents | جدول المحتويات

1. [Introduction](#1-introduction--مقدمة)
2. [Getting Started](#2-getting-started--البدء)
3. [Dashboard Overview](#3-dashboard-overview--نظرة-عامة-على-لوحة-التحكم)
4. [Inventory Management](#4-inventory-management--إدارة-الجرد)
5. [Circulation Operations](#5-circulation-operations--عمليات-الإعارة)
6. [User Management](#6-user-management--إدارة-المستخدمين)
7. [Acquisitions](#7-acquisitions--المقتنيات)
8. [Course Reserves](#8-course-reserves--احتياطي-المقررات)
9. [Fees & Fines](#9-fees--fines--الرسوم-والغرامات)
10. [Reports](#10-reports--التقارير)
11. [Search](#11-search--البحث)
12. [Best Practices](#12-best-practices--أفضل-الممارسات)
13. [Troubleshooting](#13-troubleshooting--حل-المشكلات)

---

## 1. Introduction | مقدمة

### 1.1 About This Manual | حول هذا الدليل

**English:**
This manual is designed for library staff with the Librarian role. As a librarian, you have operational access to most library functions including inventory management, circulation, acquisitions, and reporting. You can perform day-to-day library operations and assist patrons with their needs.

**العربية:**
هذا الدليل مصمم لموظفي المكتبة بدور أمين المكتبة. بصفتك أمين مكتبة، لديك صلاحية تشغيلية لمعظم وظائف المكتبة بما في ذلك إدارة الجرد والإعارة والمقتنيات والتقارير. يمكنك إجراء عمليات المكتبة اليومية ومساعدة القراء في احتياجاتهم.

### 1.2 Your Permissions | صلاحياتك

#### **English: What You Can Do**

✅ **Inventory**: Create, Read, Update (but not Delete)
✅ **Circulation**: All operations (checkout, checkin, renew)
✅ **Users**: Read and Update (cannot create or delete)
✅ **Acquisitions**: Create, Read, Update
✅ **Fees**: Read, Update, and Waive
✅ **Reports**: Read and Export
✅ **Course Reserves**: Full management

❌ **Cannot**:
- Delete inventory items
- Create or delete users
- Delete acquisitions
- Modify system settings

#### **العربية: ما يمكنك فعله**

✅ **الجرد**: إنشاء، قراءة، تحديث (ولكن ليس حذف)
✅ **الإعارة**: جميع العمليات (إعارة، استرجاع، تجديد)
✅ **المستخدمون**: قراءة وتحديث (لا يمكن إنشاء أو حذف)
✅ **المقتنيات**: إنشاء، قراءة، تحديث
✅ **الرسوم**: قراءة، تحديث، وإعفاء
✅ **التقارير**: قراءة وتصدير
✅ **احتياطي المقررات**: إدارة كاملة

❌ **لا يمكن**:
- حذف عناصر الجرد
- إنشاء أو حذف المستخدمين
- حذف المقتنيات
- تعديل إعدادات النظام

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 2. Getting Started | البدء

### 2.1 Login | تسجيل الدخول

#### **English:**

1. Open web browser
2. Navigate to: `http://localhost:3000`
3. Enter your librarian credentials
4. Click **"Sign In"**

**First-Time Login:**
- Change default password
- Review your profile
- Familiarize yourself with the interface

#### **العربية:**

1. افتح متصفح الويب
2. انتقل إلى: `http://localhost:3000`
3. أدخل بيانات دخول أمين المكتبة
4. انقر على **"تسجيل الدخول"**

**أول تسجيل دخول:**
- غيّر كلمة المرور الافتراضية
- راجع ملفك الشخصي
- تعرّف على الواجهة

### 2.2 Interface Overview | نظرة عامة على الواجهة

#### **English:**

**Main Navigation (Left Sidebar):**
- Dashboard - Overview of library statistics
- Search - Find books and materials
- Books - Browse catalog
- Inventory - Manage collection
- Users - Patron management
- Patron Groups - User categories
- Circulation - Check out/in operations
- Acquisitions - Purchase orders
- Courses - Course reserves
- Fees & Fines - Financial management
- Reports - Statistics and analytics

**Top Bar:**
- Quick search
- Notifications
- User profile
- Logout

#### **العربية:**

**التنقل الرئيسي (الشريط الجانبي الأيسر):**
- لوحة التحكم - نظرة عامة على إحصائيات المكتبة
- البحث - البحث عن الكتب والمواد
- الكتب - تصفح الفهرس
- الجرد - إدارة المجموعة
- المستخدمون - إدارة القراء
- مجموعات القراء - فئات المستخدمين
- الإعارة - عمليات الإعارة/الاسترجاع
- المقتنيات - أوامر الشراء
- المقررات - احتياطي المقررات
- الرسوم والغرامات - الإدارة المالية
- التقارير - الإحصائيات والتحليلات

**الشريط العلوي:**
- بحث سريع
- الإشعارات
- الملف الشخصي
- تسجيل الخروج

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 3. Dashboard Overview | نظرة عامة على لوحة التحكم

### 3.1 Key Statistics | الإحصائيات الرئيسية

#### **English:**

Your dashboard displays important metrics:

**Collection Statistics:**
- 📚 Total Items in Collection
- 📖 Available for Checkout
- 🔄 Currently Checked Out
- 📦 Items on Order

**Today's Activity:**
- ↗️ Items Checked Out Today
- ↙️ Items Returned Today
- 👥 New Patron Registrations
- 💰 Fees Collected Today

**Alerts & Notifications:**
- ⚠️ Items Overdue
- 📋 Pending Hold Requests
- 🔔 System Notifications

#### **العربية:**

تعرض لوحة التحكم المقاييس المهمة:

**إحصائيات المجموعة:**
- 📚 إجمالي العناصر في المجموعة
- 📖 متاح للإعارة
- 🔄 مُعار حالياً
- 📦 عناصر قيد الطلب

**نشاط اليوم:**
- ↗️ عناصر مُعارة اليوم
- ↙️ عناصر مُرجعة اليوم
- 👥 تسجيلات قراء جديدة
- 💰 رسوم محصّلة اليوم

**التنبيهات والإشعارات:**
- ⚠️ عناصر متأخرة
- 📋 طلبات حجز معلقة
- 🔔 إشعارات النظام

### 3.2 Quick Actions | الإجراءات السريعة

#### **English:**

From the dashboard, you can quickly:
- ➕ Add new inventory item
- 📖 Check out item
- ↩️ Check in item
- 👤 Look up patron
- 🔍 Search catalog
- 📊 View reports

#### **العربية:**

من لوحة التحكم، يمكنك بسرعة:
- ➕ إضافة عنصر جرد جديد
- 📖 إعارة عنصر
- ↩️ استرجاع عنصر
- 👤 البحث عن قارئ
- 🔍 البحث في الفهرس
- 📊 عرض التقارير

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 4. Inventory Management | إدارة الجرد

### 4.1 Understanding Inventory Structure | فهم هيكل الجرد

#### **English:**

**Three-Level Hierarchy:**

1. **Instance** (Bibliographic Record)
   - Title, author, ISBN
   - One per work

2. **Holdings** (Location Information)
   - Library location
   - Call number
   - Multiple per instance (different locations)

3. **Item** (Physical Copy)
   - Barcode
   - Status (Available, Checked Out)
   - Multiple per holdings (multiple copies)

**Example:**
```
Instance: "Introduction to Psychology" by James
  └── Holdings: Main Library, Call# BF121.J35
      ├── Item: Barcode 001 (Available)
      ├── Item: Barcode 002 (Checked Out)
      └── Item: Barcode 003 (Available)
```

#### **العربية:**

**هيكل هرمي من ثلاثة مستويات:**

1. **النسخة** (السجل الببليوجرافي)
   - العنوان، المؤلف، ISBN
   - واحدة لكل عمل

2. **المقتنيات** (معلومات الموقع)
   - موقع المكتبة
   - رقم الاستدعاء
   - متعددة لكل نسخة (مواقع مختلفة)

3. **العنصر** (النسخة المادية)
   - الباركود
   - الحالة (متاح، مُعار)
   - متعددة لكل مقتنى (نسخ متعددة)

**مثال:**
```
النسخة: "مقدمة في علم النفس" لجيمس
  └── المقتنيات: المكتبة الرئيسية، رقم الاستدعاء BF121.J35
      ├── العنصر: باركود 001 (متاح)
      ├── العنصر: باركود 002 (مُعار)
      └── العنصر: باركود 003 (متاح)
```

### 4.2 Adding New Materials | إضافة مواد جديدة

#### **English: Complete Workflow**

**Step 1: Create Instance**

1. Go to **Inventory** → **Instances**
2. Click **"New"** button
3. Fill in bibliographic information:

   **Required Fields:**
   - **Title**: Full title of the work

   **Recommended Fields:**
   - **Contributors**: Add authors/editors
     - Name: Author's name
     - Type: Author, Editor, Translator, etc.
   - **Identifiers**:
     - ISBN (for books)
     - ISSN (for journals)
   - **Publication**:
     - Publisher name
     - Place of publication
     - Publication date
   - **Edition**: Edition statement
   - **Physical Description**:
     - Number of pages
     - Illustrations
     - Size
   - **Languages**: Select language(s)
   - **Resource Type**: Book, Journal, DVD, etc.
   - **Subjects**: Add subject headings
   - **Notes**: Additional information

4. Click **"Save & Close"**

**Step 2: Add Holdings**

1. From Instance page, click **"Add Holdings"**
2. Fill in:
   - **Permanent Location**: Select library and location *Required*
   - **Call Number Type**: LC, Dewey, Local, etc.
   - **Call Number Prefix**: Optional (e.g., "REF")
   - **Call Number**: Classification number *Required*
   - **Call Number Suffix**: Optional
   - **Copy Number**: If multiple copies
   - **Acquisition Method**: Purchase, Gift, Deposit, etc.
   - **Receipt Status**: Pending, Received
3. Click **"Save & Close"**

**Step 3: Add Items**

1. From Holdings page, click **"Add Item"**
2. Fill in:
   - **Barcode**: Physical barcode number *Required* (must be unique)
   - **Accession Number**: Acquisition number (optional)
   - **Status**: Select current status *Required*
     - Available
     - Checked out
     - In process
     - Missing
     - Lost
     - Withdrawn
   - **Material Type**: *Required*
     - Book
     - DVD
     - CD
     - Journal
     - Magazine
   - **Permanent Loan Type**:
     - Can circulate
     - Reading room
     - Course reserves
   - **Copy Number**: Copy designation
   - **Number of Pieces**: Usually 1
   - **Item Notes**: Condition, binding notes, etc.
3. Click **"Save & Close"**

#### **العربية: سير العمل الكامل**

**الخطوة 1: إنشاء نسخة**

1. اذهب إلى **الجرد** ← **النسخ**
2. انقر على زر **"جديد"**
3. املأ المعلومات الببليوجرافية:

   **الحقول المطلوبة:**
   - **العنوان**: العنوان الكامل للعمل

   **الحقول الموصى بها:**
   - **المساهمون**: أضف المؤلفين/المحررين
     - الاسم: اسم المؤلف
     - النوع: مؤلف، محرر، مترجم، إلخ.
   - **المعرّفات**:
     - ISBN (للكتب)
     - ISSN (للمجلات)
   - **النشر**:
     - اسم الناشر
     - مكان النشر
     - تاريخ النشر
   - **الطبعة**: بيان الطبعة
   - **الوصف المادي**:
     - عدد الصفحات
     - الرسوم التوضيحية
     - الحجم
   - **اللغات**: اختر اللغة (اللغات)
   - **نوع المورد**: كتاب، مجلة، DVD، إلخ.
   - **الموضوعات**: أضف رؤوس الموضوعات
   - **ملاحظات**: معلومات إضافية

4. انقر على **"حفظ وإغلاق"**

**الخطوة 2: إضافة مقتنيات**

1. من صفحة النسخة، انقر على **"إضافة مقتنيات"**
2. املأ:
   - **الموقع الدائم**: اختر المكتبة والموقع *مطلوب*
   - **نوع رقم الاستدعاء**: LC، ديوي، محلي، إلخ.
   - **بادئة رقم الاستدعاء**: اختياري (مثل "REF")
   - **رقم الاستدعاء**: رقم التصنيف *مطلوب*
   - **لاحقة رقم الاستدعاء**: اختياري
   - **رقم النسخة**: إذا كان هناك نسخ متعددة
   - **طريقة الاقتناء**: شراء، هدية، وديعة، إلخ.
   - **حالة الاستلام**: معلق، مستلم
3. انقر على **"حفظ وإغلاق"**

**الخطوة 3: إضافة عناصر**

1. من صفحة المقتنيات، انقر على **"إضافة عنصر"**
2. املأ:
   - **الباركود**: رقم الباركود المادي *مطلوب* (يجب أن يكون فريداً)
   - **رقم التحصيل**: رقم الاقتناء (اختياري)
   - **الحالة**: اختر الحالة الحالية *مطلوب*
     - متاح
     - مُعار
     - قيد المعالجة
     - مفقود
     - ضائع
     - مسحوب
   - **نوع المادة**: *مطلوب*
     - كتاب
     - DVD
     - CD
     - مجلة
     - دورية
   - **نوع الإعارة الدائم**:
     - قابل للإعارة
     - غرفة القراءة
     - احتياطي المقررات
   - **رقم النسخة**: تعيين النسخة
   - **عدد القطع**: عادة 1
   - **ملاحظات العنصر**: الحالة، ملاحظات التجليد، إلخ.
3. انقر على **"حفظ وإغلاق"**

### 4.3 Editing Inventory | تحرير الجرد

#### **English:**

**To Edit an Instance:**
1. Search for the instance
2. Click on the title to open
3. Click **"Actions"** → **"Edit"**
4. Make necessary changes
5. Click **"Save & Close"**

**To Edit an Item:**
1. Navigate to the item
2. Click **"Actions"** → **"Edit"**
3. Common edits:
   - Update status (Available, Missing, etc.)
   - Change loan type
   - Add/edit notes
   - Update condition
4. Click **"Save & Close"**

**Important**: Changes to item status affect circulation immediately.

#### **العربية:**

**لتحرير نسخة:**
1. ابحث عن النسخة
2. انقر على العنوان لفتحها
3. انقر على **"إجراءات"** ← **"تحرير"**
4. قم بإجراء التغييرات اللازمة
5. انقر على **"حفظ وإغلاق"**

**لتحرير عنصر:**
1. انتقل إلى العنصر
2. انقر على **"إجراءات"** ← **"تحرير"**
3. التعديلات الشائعة:
   - تحديث الحالة (متاح، مفقود، إلخ.)
   - تغيير نوع الإعارة
   - إضافة/تحرير الملاحظات
   - تحديث الحالة
4. انقر على **"حفظ وإغلاق"**

**مهم**: التغييرات في حالة العنصر تؤثر على الإعارة فوراً.

### 4.4 Managing Item Status | إدارة حالة العنصر

#### **English: Common Status Changes**

**Available** → Item is on shelf and ready
**Checked Out** → Item is on loan
**In Process** → Item being cataloged
**Missing** → Item should be there but can't find it
**Lost** → Item is declared lost (fees may apply)
**Withdrawn** → Item removed from collection
**On Order** → Item is being acquired

**When to Change Status:**
- Item returned damaged → Add note, may change to "Damaged"
- Item can't be found during inventory → Change to "Missing"
- Missing item found → Change back to "Available"
- Withdrawing old materials → Change to "Withdrawn"

#### **العربية: تغييرات الحالة الشائعة**

**متاح** ← العنصر على الرف وجاهز
**مُعار** ← العنصر معار
**قيد المعالجة** ← يتم فهرسة العنصر
**مفقود** ← يجب أن يكون هناك لكن لا يمكن العثور عليه
**ضائع** ← أُعلن عن ضياع العنصر (قد تُطبق رسوم)
**مسحوب** ← أُزيل العنصر من المجموعة
**قيد الطلب** ← يتم اقتناء العنصر

**متى تغيّر الحالة:**
- عنصر أُرجع تالفاً ← أضف ملاحظة، قد تتغير إلى "تالف"
- لا يمكن العثور على عنصر أثناء الجرد ← غيّر إلى "مفقود"
- وُجد عنصر مفقود ← غيّر مرة أخرى إلى "متاح"
- سحب مواد قديمة ← غيّر إلى "مسحوب"

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 5. Circulation Operations | عمليات الإعارة

### 5.1 Checking Out Items | إعارة العناصر

#### **English: Step-by-Step Checkout**

1. **Go to Circulation** → **Check Out** tab

2. **Scan or Enter Patron Barcode**
   - Type in patron barcode field
   - Press Enter or click search
   - Patron information displays

3. **Verify Patron Information:**
   - ✅ Name and ID are correct
   - ✅ Account is Active
   - ✅ No blocks on account
   - ✅ Fees below maximum (if limits exist)

4. **Scan or Enter Item Barcode**
   - Type item barcode
   - Press Enter

5. **Review Checkout Details:**
   - Item title and author
   - Due date (automatically calculated)
   - Loan period applied

6. **Confirm Checkout**
   - Click **"Check Out"** button or press Enter
   - Success message appears
   - Receipt can be printed/emailed

**Due Date Calculation:**
- **Undergraduate**: 14 days from today
- **Graduate**: 28 days from today
- **Faculty**: 90 days from today

**Multiple Items:**
- After first item checked out, scan next item barcode
- Continue until all items processed
- Click "End Session" when finished

#### **العربية: خطوات الإعارة**

1. **اذهب إلى الإعارة** ← تبويب **إعارة**

2. **امسح أو أدخل باركود القارئ**
   - اكتب في حقل باركود القارئ
   - اضغط Enter أو انقر على البحث
   - تظهر معلومات القارئ

3. **تحقق من معلومات القارئ:**
   - ✅ الاسم والمعرّف صحيحان
   - ✅ الحساب نشط
   - ✅ لا توجد قيود على الحساب
   - ✅ الرسوم أقل من الحد الأقصى (إن وُجدت حدود)

4. **امسح أو أدخل باركود العنصر**
   - اكتب باركود العنصر
   - اضغط Enter

5. **راجع تفاصيل الإعارة:**
   - عنوان العنصر والمؤلف
   - تاريخ الاستحقاق (محسوب تلقائياً)
   - فترة الإعارة المطبقة

6. **أكّد الإعارة**
   - انقر على زر **"إعارة"** أو اضغط Enter
   - تظهر رسالة نجاح
   - يمكن طباعة/إرسال الإيصال بالبريد الإلكتروني

**حساب تاريخ الاستحقاق:**
- **طالب جامعي**: 14 يوماً من اليوم
- **طالب دراسات عليا**: 28 يوماً من اليوم
- **عضو هيئة تدريس**: 90 يوماً من اليوم

**عناصر متعددة:**
- بعد إعارة أول عنصر، امسح باركود العنصر التالي
- استمر حتى تتم معالجة جميع العناصر
- انقر على "إنهاء الجلسة" عند الانتهاء

### 5.2 Checking In Items | استرجاع العناصر

#### **English:**

1. **Go to Circulation** → **Check In** tab

2. **Scan or Enter Item Barcode**
   - Type barcode in field
   - Press Enter

3. **System Checks:**
   - ✓ Item was checked out
   - ✓ Patron who had it
   - ✓ Return date
   - ✓ Overdue status

4. **Handle Special Cases:**

   **If Item is Overdue:**
   - Fine automatically calculated
   - Fine rate: $0.50/day (typical)
   - Patron notified of fine
   - Item checked in

   **If Item is Damaged:**
   - Check "Item Damaged" checkbox
   - Enter damage description
   - Set damage assessment fee
   - Notify patron

   **If Item Has Holds:**
   - System alerts: "Item has requests"
   - Place item on hold shelf
   - Print hold slip
   - Notify patron hold is ready

5. **Confirm Check-In**
   - Click **"Check In"** button
   - Item status changes to Available (or On Hold Shelf)
   - Loan record closed

#### **العربية:**

1. **اذهب إلى الإعارة** ← تبويب **استرجاع**

2. **امسح أو أدخل باركود العنصر**
   - اكتب الباركود في الحقل
   - اضغط Enter

3. **فحوصات النظام:**
   - ✓ كان العنصر مُعاراً
   - ✓ القارئ الذي كان لديه
   - ✓ تاريخ الإرجاع
   - ✓ حالة التأخر

4. **تعامل مع الحالات الخاصة:**

   **إذا كان العنصر متأخراً:**
   - تُحسب الغرامة تلقائياً
   - معدل الغرامة: 0.50$ لليوم (نموذجي)
   - يُخطر القارئ بالغرامة
   - يُسترجع العنصر

   **إذا كان العنصر تالفاً:**
   - ضع علامة على مربع "العنصر تالف"
   - أدخل وصف التلف
   - حدد رسم تقييم التلف
   - أخطر القارئ

   **إذا كان للعنصر حجوزات:**
   - ينبه النظام: "للعنصر طلبات"
   - ضع العنصر على رف الحجز
   - اطبع قسيمة الحجز
   - أخطر القارئ بأن الحجز جاهز

5. **أكّد الاسترجاع**
   - انقر على زر **"استرجاع"**
   - تتغير حالة العنصر إلى متاح (أو على رف الحجز)
   - يُغلق سجل الإعارة

### 5.3 Renewing Items | تجديد العناصر

#### **English:**

**Method 1: From Patron Record**
1. Look up patron account
2. View "Current Loans" section
3. Find item to renew
4. Click **"Renew"** button next to item
5. New due date calculated and displayed

**Method 2: Direct Renewal**
1. Go to **Circulation** → **Renew** tab
2. Scan patron barcode
3. Scan item barcode
4. Click **"Renew"**

**Renewal Rules:**
✅ **Allowed when:**
- Item is renewable (per loan policy)
- No holds by other patrons
- Patron account is active
- Not exceeded maximum renewals (typically 2)
- Item not overdue (or override used)

❌ **Blocked when:**
- Maximum renewals reached
- Another patron has placed a hold
- Patron account has blocks
- Item type is non-renewable

**New Due Date:**
- Calculated from current date (not original due date)
- Same loan period as original checkout

#### **العربية:**

**الطريقة 1: من سجل القارئ**
1. ابحث عن حساب القارئ
2. اعرض قسم "الإعارات الحالية"
3. اعثر على العنصر المراد تجديده
4. انقر على زر **"تجديد"** بجوار العنصر
5. يُحسب تاريخ الاستحقاق الجديد ويُعرض

**الطريقة 2: تجديد مباشر**
1. اذهب إلى **الإعارة** ← تبويب **تجديد**
2. امسح باركود القارئ
3. امسح باركود العنصر
4. انقر على **"تجديد"**

**قواعد التجديد:**
✅ **مسموح عندما:**
- العنصر قابل للتجديد (وفقاً لسياسة الإعارة)
- لا توجد حجوزات من قراء آخرين
- حساب القارئ نشط
- لم يتم تجاوز الحد الأقصى للتجديدات (عادة 2)
- العنصر ليس متأخراً (أو استُخدم التجاوز)

❌ **محظور عندما:**
- تم الوصول إلى الحد الأقصى للتجديدات
- قارئ آخر وضع حجزاً
- حساب القارئ به قيود
- نوع العنصر غير قابل للتجديد

**تاريخ الاستحقاق الجديد:**
- يُحسب من التاريخ الحالي (وليس تاريخ الاستحقاق الأصلي)
- نفس فترة الإعارة كالإعارة الأصلية

### 5.4 Managing Holds/Requests | إدارة الحجوزات/الطلبات

#### **English:**

**To Create a Hold Request:**

1. Go to **Circulation** → **Requests**
2. Click **"New Request"**
3. Fill in request details:
   - **Patron**: Search and select patron *Required*
   - **Item/Instance**: Search and select *Required*
   - **Request Type**:
     - **Hold**: Item currently checked out, patron wants it when available
     - **Page**: Item on shelf, retrieve for patron
     - **Recall**: Request early return of checked out item
   - **Pickup Location**: Where patron will collect *Required*
   - **Expiration Date**: When hold expires if not filled
   - **Request Date**: Auto-filled with today's date
4. Click **"Save & Close"**

**Request Queue Management:**
- Requests fulfilled in FIFO order (First In, First Out)
- Priority: Recall > Hold > Page
- Patron notified when ready

**Fulfilling a Hold:**
1. Check in item that has hold
2. System alerts: "Item has hold request"
3. Click **"Confirm"**
4. Print hold slip
5. Place item on hold shelf
6. System notifies patron
7. Hold expires after pickup period (typically 7 days)

#### **العربية:**

**لإنشاء طلب حجز:**

1. اذهب إلى **الإعارة** ← **الطلبات**
2. انقر على **"طلب جديد"**
3. املأ تفاصيل الطلب:
   - **القارئ**: ابحث واختر القارئ *مطلوب*
   - **العنصر/النسخة**: ابحث واختر *مطلوب*
   - **نوع الطلب**:
     - **حجز**: العنصر مُعار حالياً، يريده القارئ عندما يكون متاحاً
     - **صفحة**: العنصر على الرف، استرجعه للقارئ
     - **استدعاء**: طلب إرجاع مبكر لعنصر مُعار
   - **موقع الاستلام**: حيث سيستلم القارئ *مطلوب*
   - **تاريخ الانتهاء**: متى ينتهي الحجز إن لم يُنفذ
   - **تاريخ الطلب**: يُملأ تلقائياً بتاريخ اليوم
4. انقر على **"حفظ وإغلاق"**

**إدارة قائمة الطلبات:**
- تُنفذ الطلبات بترتيب FIFO (الأول دخولاً، الأول خروجاً)
- الأولوية: استدعاء > حجز > صفحة
- يُخطر القارئ عندما يكون جاهزاً

**تنفيذ حجز:**
1. استرجع عنصراً له حجز
2. ينبه النظام: "للعنصر طلب حجز"
3. انقر على **"تأكيد"**
4. اطبع قسيمة الحجز
5. ضع العنصر على رف الحجز
6. يُخطر النظام القارئ
7. ينتهي الحجز بعد فترة الاستلام (عادة 7 أيام)

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 6. User Management | إدارة المستخدمين

### 6.1 Your User Management Permissions | صلاحيات إدارة المستخدمين

#### **English:**

As a Librarian, you can:
✅ **View** patron accounts and information
✅ **Update** existing patron information
✅ **Manage** patron groups

You **cannot**:
❌ Create new user accounts (Admin only)
❌ Delete user accounts (Admin only)

#### **العربية:**

بصفتك أمين مكتبة، يمكنك:
✅ **عرض** حسابات القراء والمعلومات
✅ **تحديث** معلومات القراء الموجودين
✅ **إدارة** مجموعات القراء

**لا يمكنك**:
❌ إنشاء حسابات مستخدمين جديدة (المسؤول فقط)
❌ حذف حسابات المستخدمين (المسؤول فقط)

### 6.2 Viewing Patron Information | عرض معلومات القراء

#### **English:**

1. Go to **Users**
2. Search for patron by:
   - Name
   - Email
   - Username
   - Barcode
3. Click on patron name to view details

**Patron Detail View:**
- **Profile Tab**: Personal information, contact details
- **Loans Tab**: Current and past loans
- **Requests Tab**: Active hold requests
- **Fees Tab**: Outstanding and paid fees
- **Notes Tab**: Staff notes about patron

#### **العربية:**

1. اذهب إلى **المستخدمون**
2. ابحث عن قارئ بـ:
   - الاسم
   - البريد الإلكتروني
   - اسم المستخدم
   - الباركود
3. انقر على اسم القارئ لعرض التفاصيل

**عرض تفاصيل القارئ:**
- **تبويب الملف الشخصي**: المعلومات الشخصية، تفاصيل الاتصال
- **تبويب الإعارات**: الإعارات الحالية والسابقة
- **تبويب الطلبات**: طلبات الحجز النشطة
- **تبويب الرسوم**: الرسوم المستحقة والمدفوعة
- **تبويب الملاحظات**: ملاحظات الموظفين عن القارئ

### 6.3 Updating Patron Information | تحديث معلومات القراء

#### **English:**

1. Find and open patron record
2. Click **"Edit"** button
3. You can update:
   - ✓ Contact information (phone, email, address)
   - ✓ Patron group (Undergraduate, Graduate, Faculty)
   - ✓ Preferred contact method
   - ✓ Active/Inactive status
4. Click **"Save & Close"**

**Cannot Change:**
- Username (locked after creation)
- User ID (system-generated)

#### **العربية:**

1. اعثر على سجل القارئ وافتحه
2. انقر على زر **"تحرير"**
3. يمكنك تحديث:
   - ✓ معلومات الاتصال (الهاتف، البريد الإلكتروني، العنوان)
   - ✓ مجموعة القراء (طالب جامعي، دراسات عليا، هيئة تدريس)
   - ✓ طريقة الاتصال المفضلة
   - ✓ حالة نشط/غير نشط
4. انقر على **"حفظ وإغلاق"**

**لا يمكن التغيير:**
- اسم المستخدم (مقفل بعد الإنشاء)
- معرّف المستخدم (منشأ بواسطة النظام)

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 7. Acquisitions | المقتنيات

### 7.1 Managing Purchase Orders | إدارة أوامر الشراء

#### **English:**

**Creating a Purchase Order:**

1. Go to **Acquisitions** → **Purchase Orders**
2. Click **"New"**
3. Fill in order header:
   - **Vendor**: Select from list *Required*
   - **Order Type**: One-Time or Ongoing
   - **Status**: Pending, Open, Closed
4. Add order lines (items):
   - Click **"Add Line"**
   - Title information
   - Quantity and price
   - Fund allocation
   - Destination location
5. **Save**

**Receiving Orders:**
1. Open purchase order
2. Click **"Receive"**
3. Check off items received
4. Update quantities
5. Add receiving notes
6. Click **"Save"**

#### **العربية:**

**إنشاء أمر شراء:**

1. اذهب إلى **المقتنيات** ← **أوامر الشراء**
2. انقر على **"جديد"**
3. املأ رأس الأمر:
   - **المورّد**: اختر من القائمة *مطلوب*
   - **نوع الأمر**: لمرة واحدة أو مستمر
   - **الحالة**: معلق، مفتوح، مغلق
4. أضف بنود الأمر (العناصر):
   - انقر على **"إضافة بند"**
   - معلومات العنوان
   - الكمية والسعر
   - تخصيص الصندوق
   - موقع الوجهة
5. **احفظ**

**استلام الأوامر:**
1. افتح أمر الشراء
2. انقر على **"استلام"**
3. ضع علامة على العناصر المستلمة
4. حدّث الكميات
5. أضف ملاحظات الاستلام
6. انقر على **"حفظ"**

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 8. Course Reserves | احتياطي المقررات

### 8.1 Creating Courses | إنشاء المقررات

#### **English:**

1. Go to **Courses**
2. Click **"New Course"**
3. Fill in:
   - **Course Name** *Required*
   - **Course Code** *Required*
   - **Department** *Required*
   - **Semester/Term** *Required*
   - **Start and End Dates**
   - **Instructors** (add from user list)
4. Click **"Save & Close"**

#### **العربية:**

1. اذهب إلى **المقررات**
2. انقر على **"مقرر جديد"**
3. املأ:
   - **اسم المقرر** *مطلوب*
   - **رمز المقرر** *مطلوب*
   - **القسم** *مطلوب*
   - **الفصل الدراسي** *مطلوب*
   - **تواريخ البدء والانتهاء**
   - **المدرسون** (أضف من قائمة المستخدمين)
4. انقر على **"حفظ وإغلاق"**

### 8.2 Adding Items to Reserves | إضافة عناصر للاحتياطي

#### **English:**

1. Open course record
2. Go to **"Reserves"** tab
3. Click **"Add Reserve Item"**
4. Search for item by title or barcode
5. Set reserve parameters:
   - **Loan Period**: 2 hours, 4 hours, 1 day, 3 days
   - **Reserve Type**: Physical or Electronic
   - **Start Date**: When reserve becomes active
   - **End Date**: When reserve ends
6. Click **"Add"**

**Reserve items have:**
- Shorter loan periods
- Often non-renewable
- Higher priority for course students

#### **العربية:**

1. افتح سجل المقرر
2. اذهب إلى تبويب **"الاحتياطي"**
3. انقر على **"إضافة عنصر احتياطي"**
4. ابحث عن عنصر بالعنوان أو الباركود
5. اضبط معايير الاحتياطي:
   - **فترة الإعارة**: ساعتان، 4 ساعات، يوم، 3 أيام
   - **نوع الاحتياطي**: مادي أو إلكتروني
   - **تاريخ البدء**: متى يصبح الاحتياطي نشطاً
   - **تاريخ الانتهاء**: متى ينتهي الاحتياطي
6. انقر على **"إضافة"**

**عناصر الاحتياطي لها:**
- فترات إعارة أقصر
- غالباً غير قابلة للتجديد
- أولوية أعلى لطلاب المقرر

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 9. Fees & Fines | الرسوم والغرامات

### 9.1 Viewing Patron Fees | عرض رسوم القراء

#### **English:**

1. Look up patron
2. Go to **"Fees"** tab
3. View:
   - Outstanding balance
   - Individual fee details
   - Payment history

**Fee Types:**
- Overdue fines (automatic)
- Lost item fees
- Damage fees
- Processing fees

#### **العربية:**

1. ابحث عن القارئ
2. اذهب إلى تبويب **"الرسوم"**
3. اعرض:
   - الرصيد المستحق
   - تفاصيل الرسوم الفردية
   - سجل الدفعات

**أنواع الرسوم:**
- غرامات التأخير (تلقائية)
- رسوم العناصر المفقودة
- رسوم التلف
- رسوم المعالجة

### 9.2 Recording Payments | تسجيل الدفعات

#### **English:**

1. Navigate to patron fees
2. Select fee to pay
3. Click **"Pay"**
4. Enter:
   - **Payment Amount** *Required*
   - **Payment Method**: Cash, Check, Card
   - **Transaction ID** (if applicable)
   - **Notes**
5. Click **"Pay"**
6. Print or email receipt

#### **العربية:**

1. انتقل إلى رسوم القارئ
2. اختر الرسم المراد دفعه
3. انقر على **"دفع"**
4. أدخل:
   - **مبلغ الدفع** *مطلوب*
   - **طريقة الدفع**: نقداً، شيك، بطاقة
   - **معرّف المعاملة** (إن وُجد)
   - **ملاحظات**
5. انقر على **"دفع"**
6. اطبع أو أرسل الإيصال بالبريد الإلكتروني

### 9.3 Waiving Fees | إعفاء من الرسوم

#### **English:**

**You can waive fees** in appropriate circumstances:

1. Find fee in patron record
2. Click **"Waive"**
3. Enter:
   - **Waive Amount**: Full or partial
   - **Reason**: *Required*
     - First-time offense
     - System error
     - Material not available
     - Patron dispute resolved
     - Other (specify)
   - **Notes**: Additional explanation
4. Click **"Waive"**

**When to Waive:**
✓ First-time minor offense
✓ System or staff error
✓ Disputed fee resolved in patron's favor
✓ Extenuating circumstances

**Document all waivers properly.**

#### **العربية:**

**يمكنك الإعفاء من الرسوم** في الظروف المناسبة:

1. اعثر على الرسم في سجل القارئ
2. انقر على **"إعفاء"**
3. أدخل:
   - **مبلغ الإعفاء**: كامل أو جزئي
   - **السبب**: *مطلوب*
     - مخالفة طفيفة أولى
     - خطأ في النظام
     - مادة غير متاحة
     - حُل نزاع القارئ
     - آخر (حدد)
   - **ملاحظات**: توضيح إضافي
4. انقر على **"إعفاء"**

**متى تعفي:**
✓ مخالفة طفيفة أولى
✓ خطأ في النظام أو من الموظفين
✓ رسم متنازع عليه حُل لصالح القارئ
✓ ظروف مخففة

**وثّق جميع الإعفاءات بشكل صحيح.**

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 10. Reports | التقارير

### 10.1 Generating Reports | إنشاء التقارير

#### **English:**

1. Go to **Reports**
2. Select report category:
   - **Circulation**: Checkouts, returns, overdues
   - **Inventory**: Collection statistics
   - **Users**: Patron statistics
   - **Fees**: Financial reports
   - **Acquisitions**: Orders and budgets
3. Choose specific report
4. Set parameters:
   - Date range
   - Filters (location, type, etc.)
   - Sort options
5. Click **"Generate"**
6. View results
7. Export if needed (PDF, Excel, CSV)

#### **العربية:**

1. اذهب إلى **التقارير**
2. اختر فئة التقرير:
   - **الإعارة**: الإعارات، الإرجاعات، المتأخرات
   - **الجرد**: إحصائيات المجموعة
   - **المستخدمون**: إحصائيات القراء
   - **الرسوم**: التقارير المالية
   - **المقتنيات**: الأوامر والميزانيات
3. اختر تقريراً محدداً
4. اضبط المعايير:
   - نطاق التاريخ
   - الفلاتر (الموقع، النوع، إلخ.)
   - خيارات الترتيب
5. انقر على **"إنشاء"**
6. اعرض النتائج
7. صدّر إن لزم (PDF، إكسل، CSV)

### 10.2 Common Reports for Librarians | التقارير الشائعة لأمناء المكتبات

#### **English:**

**Daily Reports:**
- Items checked out today
- Items returned today
- Overdue items
- Fees collected

**Weekly Reports:**
- Circulation statistics
- New acquisitions received
- Popular items

**Monthly Reports:**
- Collection growth
- Circulation trends
- Budget status
- User activity

#### **العربية:**

**تقارير يومية:**
- عناصر مُعارة اليوم
- عناصر مُرجعة اليوم
- عناصر متأخرة
- رسوم محصّلة

**تقارير أسبوعية:**
- إحصائيات الإعارة
- مقتنيات جديدة مستلمة
- عناصر شائعة

**تقارير شهرية:**
- نمو المجموعة
- اتجاهات الإعارة
- حالة الميزانية
- نشاط المستخدمين

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 11. Search | البحث

### 11.1 Basic Search | البحث الأساسي

#### **English:**

**Quick Search Box (Top Bar):**
1. Type search terms
2. Press Enter
3. View results

**Search by:**
- Title
- Author
- ISBN
- Keyword
- Barcode (for quick lookup)

#### **العربية:**

**مربع البحث السريع (الشريط العلوي):**
1. اكتب مصطلحات البحث
2. اضغط Enter
3. اعرض النتائج

**البحث بـ:**
- العنوان
- المؤلف
- ISBN
- كلمة مفتاحية
- الباركود (للبحث السريع)

### 11.2 Advanced Search | البحث المتقدم

#### **English:**

1. Click **"Advanced Search"**
2. Use multiple fields:
   - Title AND Author
   - Subject AND Date range
   - Material Type filters
3. Apply Boolean operators:
   - AND (both terms)
   - OR (either term)
   - NOT (exclude term)
4. Use filters:
   - Location
   - Material type
   - Language
   - Availability
5. Click **"Search"**

#### **العربية:**

1. انقر على **"البحث المتقدم"**
2. استخدم حقولاً متعددة:
   - العنوان AND المؤلف
   - الموضوع AND نطاق التاريخ
   - فلاتر نوع المادة
3. طبّق عوامل التشغيل البولية:
   - AND (كلا المصطلحين)
   - OR (أي من المصطلحين)
   - NOT (استبعاد المصطلح)
4. استخدم الفلاتر:
   - الموقع
   - نوع المادة
   - اللغة
   - التوفر
5. انقر على **"بحث"**

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 12. Best Practices | أفضل الممارسات

### 12.1 Daily Workflow | سير العمل اليومي

#### **English:**

**Start of Shift:**
1. Log in and check dashboard
2. Review overnight alerts
3. Check for overdue notices
4. Review hold shelf for expired holds
5. Clear any system notifications

**During Shift:**
- Process checkouts/checkins promptly
- Verify patron information
- Inspect items for damage
- Keep hold shelf organized
- Update patron records as needed

**End of Shift:**
- Complete pending transactions
- File paperwork
- Log out properly

#### **العربية:**

**بداية الورد ية:**
1. سجّل الدخول وتحقق من لوحة التحكم
2. راجع تنبيهات الليل
3. تحقق من إشعارات التأخر
4. راجع رف الحجز بحثاً عن حجوزات منتهية
5. امسح أي إشعارات نظام

**أثناء الوردية:**
- عالج الإعارات/الاسترجاعات بسرعة
- تحقق من معلومات القراء
- افحص العناصر بحثاً عن التلف
- حافظ على تنظيم رف الحجز
- حدّث سجلات القراء حسب الحاجة

**نهاية الوردية:**
- أكمل المعاملات المعلقة
- أرشف الأوراق
- سجّل الخروج بشكل صحيح

### 12.2 Patron Service | خدمة القراء

#### **English:**

✅ **Best Practices:**
- Greet patrons warmly
- Be patient and helpful
- Verify information before processing
- Explain policies clearly
- Protect patron privacy
- Document issues clearly
- Follow up on problems

❌ **Avoid:**
- Rushing transactions
- Discussing patron info publicly
- Making assumptions
- Ignoring system warnings

#### **العربية:**

✅ **أفضل الممارسات:**
- رحّب بالقراء بحرارة
- كن صبوراً ومتعاوناً
- تحقق من المعلومات قبل المعالجة
- اشرح السياسات بوضوح
- احم خصوصية القراء
- وثّق المشاكل بوضوح
- تابع المشاكل

❌ **تجنّب:**
- التسرع في المعاملات
- مناقشة معلومات القراء علناً
- وضع افتراضات
- تجاهل تحذيرات النظام

### 12.3 Collection Care | العناية بالمجموعة

#### **English:**

✅ **Good Practices:**
- Inspect items during check-in
- Report damaged items promptly
- Mark missing items accurately
- Keep shelves organized
- Process new materials quickly
- Weed outdated materials

#### **العربية:**

✅ **ممارسات جيدة:**
- افحص العناصر أثناء الاسترجاع
- أبلغ عن العناصر التالفة فوراً
- علّم العناصر المفقودة بدقة
- حافظ على تنظيم الرفوف
- عالج المواد الجديدة بسرعة
- استبعد المواد القديمة

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 13. Troubleshooting | حل المشكلات

### 13.1 Common Issues | المشاكل الشائعة

#### **English & Arabic:**

| Problem | المشكلة | Solution | الحل |
|---------|----------|----------|------|
| **Cannot checkout item** | **لا يمكن إعارة عنصر** | Check item status, patron blocks | تحقق من حالة العنصر، قيود القارئ |
| **Barcode won't scan** | **الباركود لا يُمسح** | Type manually, check scanner | اكتب يدوياً، تحقق من الماسح الضوئي |
| **Patron account blocked** | **حساب القارئ محظور** | Check fees, resolve issues | تحقق من الرسوم، حل المشاكل |
| **Item has holds** | **للعنصر حجوزات** | Place on hold shelf | ضعه على رف الحجز |
| **Fine calculation wrong** | **حساب الغرامة خاطئ** | Verify dates, contact admin | تحقق من التواريخ، اتصل بالمسؤول |

### 13.2 When to Contact Administrator | متى تتصل بالمسؤول

#### **English:**

Contact admin when:
- System errors persist
- Cannot resolve patron issues
- Permission denied errors
- Data inconsistencies
- Need policy clarification
- Technical problems

#### **العربية:**

اتصل بالمسؤول عندما:
- تستمر أخطاء النظام
- لا يمكن حل مشاكل القراء
- أخطاء رفض الصلاحية
- تناقضات البيانات
- تحتاج توضيح السياسة
- مشاكل تقنية

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## Appendix | الملحق

### Quick Reference | مرجع سريع

#### **Keyboard Shortcuts | اختصارات لوحة المفاتيح**

| Shortcut | Action | الاختصار | الإجراء |
|----------|--------|-----------|---------|
| **/** | Search | **/** | بحث |
| **Ctrl+O** | Checkout | **Ctrl+O** | إعارة |
| **Ctrl+I** | Checkin | **Ctrl+I** | استرجاع |
| **F2** | Patron lookup | **F2** | بحث عن قارئ |
| **F3** | Item lookup | **F3** | بحث عن عنصر |

---

## Document Information | معلومات الوثيقة

**Version | الإصدار**: 1.0
**Last Updated | آخر تحديث**: October 2025
**Language | اللغة**: Bilingual (English/Arabic) | ثنائي اللغة

---

© 2025 FOLIO Library Management System
All rights reserved | جميع الحقوق محفوظة

**[Back to Top | العودة للأعلى](#librarian-manual--دليل-أمين-المكتبة)**

**End of Librarian Manual | نهاية دليل أمين المكتبة**
