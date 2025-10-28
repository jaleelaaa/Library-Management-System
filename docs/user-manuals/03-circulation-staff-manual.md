# Circulation Desk Staff Manual | دليل موظف خدمة الإعارة
## FOLIO Library Management System | نظام إدارة المكتبات فوليو

**Version | الإصدار**: 1.0
**Last Updated | آخر تحديث**: October 2025
**Role | الدور**: Circulation Desk Staff | موظف خدمة الإعارة
**Access Level | مستوى الوصول**: Limited Circulation Access | صلاحية إعارة محدودة

---

## Table of Contents | جدول المحتويات

1. [Introduction](#1-introduction--مقدمة)
2. [Getting Started](#2-getting-started--البدء)
3. [Dashboard Overview](#3-dashboard-overview--نظرة-عامة-على-لوحة-التحكم)
4. [Checking Out Items](#4-checking-out-items--إعارة-العناصر)
5. [Checking In Items](#5-checking-in-items--استرجاع-العناصر)
6. [Renewing Items](#6-renewing-items--تجديد-العناصر)
7. [Managing Holds](#7-managing-holds--إدارة-الحجوزات)
8. [Viewing Patron Information](#8-viewing-patron-information--عرض-معلومات-القراء)
9. [Viewing Fees](#9-viewing-fees--عرض-الرسوم)
10. [Common Tasks](#10-common-tasks--المهام-الشائعة)
11. [Best Practices](#11-best-practices--أفضل-الممارسات)
12. [Troubleshooting](#12-troubleshooting--حل-المشكلات)

---

## 1. Introduction | مقدمة

### 1.1 About This Manual | حول هذا الدليل

**English:**
This manual is designed for circulation desk staff who handle day-to-day circulation operations. Your primary responsibilities are checking out and checking in library materials, renewing loans, and assisting patrons with basic circulation needs.

**العربية:**
هذا الدليل مصمم لموظفي مكتب الإعارة الذين يتعاملون مع عمليات الإعارة اليومية. مسؤولياتك الأساسية هي إعارة واسترجاع مواد المكتبة، وتجديد الإعارات، ومساعدة القراء في احتياجات الإعارة الأساسية.

### 1.2 Your Permissions | صلاحياتك

#### **English: What You Can Do**

✅ **Circulation Operations:**
- Check out items to patrons
- Check in returned items
- Renew items
- View and manage holds/requests

✅ **Read-Only Access:**
- View inventory items
- View patron accounts
- View fees and fines

❌ **Cannot Do:**
- Create or edit inventory
- Create or edit patrons
- Create or waive fees
- Access system settings
- Delete any records

#### **العربية: ما يمكنك فعله**

✅ **عمليات الإعارة:**
- إعارة عناصر للقراء
- استرجاع عناصر مُرجعة
- تجديد عناصر
- عرض وإدارة الحجوزات/الطلبات

✅ **صلاحية قراءة فقط:**
- عرض عناصر الجرد
- عرض حسابات القراء
- عرض الرسوم والغرامات

❌ **لا يمكنك:**
- إنشاء أو تحرير الجرد
- إنشاء أو تحرير القراء
- إنشاء أو الإعفاء من الرسوم
- الوصول إلى إعدادات النظام
- حذف أي سجلات

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 2. Getting Started | البدء

### 2.1 Login Process | عملية تسجيل الدخول

#### **English:**

1. Open your web browser (Chrome, Firefox, Edge recommended)
2. Navigate to: `http://localhost:3000`
3. Enter your credentials:
   - **Username**: Your assigned username
   - **Password**: Your secure password
4. Click **"Sign In"**

**Security Tips:**
- Never share your login credentials
- Log out when leaving the desk
- Lock your computer when stepping away
- Report any suspicious activity

#### **العربية:**

1. افتح متصفح الويب (كروم، فايرفوكس، إيدج موصى بها)
2. انتقل إلى: `http://localhost:3000`
3. أدخل بيانات الدخول:
   - **اسم المستخدم**: اسم المستخدم المخصص لك
   - **كلمة المرور**: كلمة مرورك الآمنة
4. انقر على **"تسجيل الدخول"**

**نصائح أمنية:**
- لا تشارك بيانات تسجيل الدخول أبداً
- سجّل الخروج عند ترك المكتب
- اقفل جهاز الكمبيوتر عند الابتعاد
- أبلغ عن أي نشاط مشبوه

### 2.2 Interface Overview | نظرة عامة على الواجهة

#### **English:**

**Main Screen Elements:**

**Top Bar:**
- 🔍 Quick search box
- 🔔 Notifications (system alerts)
- 👤 Your profile menu
- 🚪 Logout button

**Left Sidebar (Main Navigation):**
- Dashboard - Statistics overview
- Search - Find materials
- Circulation - Main work area
  - Check Out
  - Check In
  - Renew
  - Requests/Holds
- Users - Patron lookup
- Fees - View patron fees

**Main Work Area (Center):**
- Your active work screen
- Transaction history
- Patron information display

#### **العربية:**

**عناصر الشاشة الرئيسية:**

**الشريط العلوي:**
- 🔍 مربع بحث سريع
- 🔔 الإشعارات (تنبيهات النظام)
- 👤 قائمة ملفك الشخصي
- 🚪 زر تسجيل الخروج

**الشريط الجانبي الأيسر (التنقل الرئيسي):**
- لوحة التحكم - نظرة عامة على الإحصائيات
- البحث - البحث عن المواد
- الإعارة - منطقة العمل الرئيسية
  - إعارة
  - استرجاع
  - تجديد
  - الطلبات/الحجوزات
- المستخدمون - البحث عن القراء
- الرسوم - عرض رسوم القراء

**منطقة العمل الرئيسية (الوسط):**
- شاشة عملك النشطة
- سجل المعاملات
- عرض معلومات القراء

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 3. Dashboard Overview | نظرة عامة على لوحة التحكم

### 3.1 Understanding Your Dashboard | فهم لوحة التحكم

#### **English:**

When you log in, you'll see key circulation statistics:

**Today's Activity:**
- ↗️ **Items Checked Out Today**: Total checkouts
- ↙️ **Items Returned Today**: Total returns
- 🔄 **Renewals Today**: Items renewed
- 👥 **Patrons Served**: Number of patrons helped

**Current Status:**
- 📚 **Items Currently Out**: Total items on loan
- ⏰ **Items Due Today**: Items due back today
- ⚠️ **Overdue Items**: Items past due date
- 📋 **Hold Requests Waiting**: Items waiting on hold shelf

**Quick Actions:**
- Fast links to Check Out, Check In, Renew
- Patron lookup
- Hold shelf management

#### **العربية:**

عند تسجيل الدخول، سترى إحصائيات الإعارة الرئيسية:

**نشاط اليوم:**
- ↗️ **عناصر مُعارة اليوم**: إجمالي الإعارات
- ↙️ **عناصر مُرجعة اليوم**: إجمالي الإرجاعات
- 🔄 **تجديدات اليوم**: عناصر جُددت
- 👥 **قراء تمت خدمتهم**: عدد القراء الذين تمت مساعدتهم

**الحالة الحالية:**
- 📚 **عناصر مُعارة حالياً**: إجمالي العناصر المُعارة
- ⏰ **عناصر مستحقة اليوم**: عناصر يجب إرجاعها اليوم
- ⚠️ **عناصر متأخرة**: عناصر تجاوزت تاريخ الاستحقاق
- 📋 **طلبات حجز في الانتظار**: عناصر تنتظر على رف الحجز

**إجراءات سريعة:**
- روابط سريعة للإعارة، الاسترجاع، التجديد
- البحث عن القراء
- إدارة رف الحجز

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 4. Checking Out Items | إعارة العناصر

### 4.1 Basic Checkout Process | عملية الإعارة الأساسية

#### **English: Step-by-Step**

**Step 1: Access Checkout Screen**
1. Click **Circulation** in left sidebar
2. Click **Check Out** tab
3. Your checkout screen appears

**Step 2: Enter Patron Information**
1. **Scan patron's library card barcode**
   - Place barcode under scanner
   - Wait for beep
   - OR type barcode manually in "Patron Barcode" field
   - Press Enter

2. **Patron Information Displays:**
   - Name
   - Library card number
   - Patron type (Undergraduate, Graduate, Faculty)
   - Current items on loan
   - Outstanding fees (if any)

**Step 3: Verify Patron Status**

Check for:
- ✅ **Green checkmark** = Account is active and good
- ⚠️ **Yellow warning** = Minor issue (see details)
- ❌ **Red X** = Account blocked (cannot checkout)

**Common Blocks:**
- Maximum items already checked out
- Fees exceed limit
- Account expired
- Items overdue

**If Account is Blocked:**
1. Review the block reason displayed
2. If fees: Direct patron to pay fees
3. If expired: Direct to circulation desk supervisor
4. If other issues: Ask for assistance

**Step 4: Scan Items**
1. **Scan each item's barcode**
   - Place barcode under scanner
   - Wait for beep and confirmation
   - OR type barcode manually
   - Press Enter

2. **Item Information Displays:**
   - Title and author
   - Call number
   - Due date (calculated automatically)
   - Material type

3. **Verify Due Date:**
   - Undergraduate: 14 days from today
   - Graduate: 28 days from today
   - Faculty: 90 days from today
   - Course Reserve: Varies (2 hours to 3 days)

4. **Continue scanning** additional items for same patron

**Step 5: Complete Transaction**
1. When all items scanned, review the list
2. Click **"End Session"** button
3. **Print receipt** (optional but recommended):
   - Click "Print Receipt"
   - Hand receipt to patron
4. Thank patron and return their library card

#### **العربية: خطوة بخطوة**

**الخطوة 1: الوصول إلى شاشة الإعارة**
1. انقر على **الإعارة** في الشريط الجانبي الأيسر
2. انقر على تبويب **إعارة**
3. تظهر شاشة الإعارة

**الخطوة 2: أدخل معلومات القارئ**
1. **امسح باركود بطاقة المكتبة للقارئ**
   - ضع الباركود تحت الماسح الضوئي
   - انتظر الصفارة
   - أو اكتب الباركود يدوياً في حقل "باركود القارئ"
   - اضغط Enter

2. **تظهر معلومات القارئ:**
   - الاسم
   - رقم بطاقة المكتبة
   - نوع القارئ (طالب جامعي، دراسات عليا، هيئة تدريس)
   - العناصر الحالية المُعارة
   - الرسوم المستحقة (إن وُجدت)

**الخطوة 3: تحقق من حالة القارئ**

تحقق من:
- ✅ **علامة اختيار خضراء** = الحساب نشط وجيد
- ⚠️ **تحذير أصفر** = مشكلة بسيطة (انظر التفاصيل)
- ❌ **X حمراء** = الحساب محظور (لا يمكن الإعارة)

**قيود شائعة:**
- أقصى عدد من العناصر مُعار بالفعل
- الرسوم تتجاوز الحد
- الحساب منتهي الصلاحية
- عناصر متأخرة

**إذا كان الحساب محظوراً:**
1. راجع سبب الحظر المعروض
2. إذا كانت رسوماً: وجّه القارئ لدفع الرسوم
3. إذا كان منتهي الصلاحية: وجّه إلى مشرف مكتب الإعارة
4. إذا كانت مشاكل أخرى: اطلب المساعدة

**الخطوة 4: امسح العناصر**
1. **امسح باركود كل عنصر**
   - ضع الباركود تحت الماسح الضوئي
   - انتظر الصفارة والتأكيد
   - أو اكتب الباركود يدوياً
   - اضغط Enter

2. **تظهر معلومات العنصر:**
   - العنوان والمؤلف
   - رقم الاستدعاء
   - تاريخ الاستحقاق (محسوب تلقائياً)
   - نوع المادة

3. **تحقق من تاريخ الاستحقاق:**
   - طالب جامعي: 14 يوماً من اليوم
   - طالب دراسات عليا: 28 يوماً من اليوم
   - عضو هيئة تدريس: 90 يوماً من اليوم
   - احتياطي المقررات: يختلف (ساعتان إلى 3 أيام)

4. **استمر في المسح** لعناصر إضافية لنفس القارئ

**الخطوة 5: أكمل المعاملة**
1. عندما تُمسح جميع العناصر، راجع القائمة
2. انقر على زر **"إنهاء الجلسة"**
3. **اطبع الإيصال** (اختياري لكن موصى به):
   - انقر على "طباعة إيصال"
   - سلّم الإيصال للقارئ
4. اشكر القارئ وأعد بطاقة المكتبة

### 4.2 Common Checkout Scenarios | سيناريوهات الإعارة الشائعة

#### **English:**

**Multiple Items for One Patron:**
1. Scan patron once
2. Scan each item
3. All items added to same transaction
4. End session when finished

**Multiple Patrons in Sequence:**
1. Complete first patron's transaction
2. Click "End Session"
3. Start next patron (scan their card)
4. Repeat process

**Patron Forgot Library Card:**
1. Ask for photo ID
2. Look up patron by name:
   - Click "Search Patrons"
   - Type name
   - Verify identity with ID
3. Proceed with checkout

**Item Barcode Won't Scan:**
1. Try scanning again
2. Wipe barcode with dry cloth
3. Try different angle
4. If still fails, type barcode manually
5. If barcode damaged, report to supervisor

#### **العربية:**

**عناصر متعددة لقارئ واحد:**
1. امسح القارئ مرة واحدة
2. امسح كل عنصر
3. تُضاف جميع العناصر لنفس المعاملة
4. أنه الجلسة عند الانتهاء

**قراء متعددون بالتسلسل:**
1. أكمل معاملة القارئ الأول
2. انقر على "إنهاء الجلسة"
3. ابدأ القارئ التالي (امسح بطاقته)
4. كرر العملية

**نسي القارئ بطاقة المكتبة:**
1. اطلب هوية بصورة
2. ابحث عن القارئ بالاسم:
   - انقر على "البحث عن القراء"
   - اكتب الاسم
   - تحقق من الهوية بالمعرّف
3. تابع الإعارة

**باركود العنصر لا يُمسح:**
1. حاول المسح مرة أخرى
2. امسح الباركود بقماش جاف
3. جرّب زاوية مختلفة
4. إذا فشل، اكتب الباركود يدوياً
5. إذا كان الباركود تالفاً، أبلغ المشرف

### 4.3 Error Messages During Checkout | رسائل الخطأ أثناء الإعارة

#### **English & Arabic:**

| Error Message | رسالة الخطأ | Meaning | المعنى | Action | الإجراء |
|---------------|-------------|---------|--------|--------|---------|
| "Item already checked out" | "العنصر مُعار بالفعل" | Item is on loan to someone | العنصر مُعار لشخص ما | Check item status | تحقق من حالة العنصر |
| "Patron has reached loan limit" | "وصل القارئ للحد الأقصى" | Too many items out | عناصر كثيرة مُعارة | Ask patron to return items | اطلب من القارئ إرجاع عناصر |
| "Item has holds" | "للعنصر حجوزات" | Another patron requested | قارئ آخر طلبه | Check request queue | تحقق من قائمة الطلبات |
| "Patron account blocked" | "حساب القارئ محظور" | Cannot checkout | لا يمكن الإعارة | Resolve block issue | حل مشكلة الحظر |
| "Item not available" | "العنصر غير متاح" | Item status not "Available" | حالة العنصر ليست "متاح" | Check item status | تحقق من حالة العنصر |

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 5. Checking In Items | استرجاع العناصر

### 5.1 Basic Check-In Process | عملية الاسترجاع الأساسية

#### **English: Step-by-Step**

**Step 1: Access Check-In Screen**
1. Click **Circulation** in sidebar
2. Click **Check In** tab
3. Check-in screen appears

**Step 2: Scan Returned Items**
1. **Scan item barcode**
   - Place under scanner
   - Wait for beep
   - OR type barcode manually
   - Press Enter

2. **System Checks Automatically:**
   - ✓ Item was checked out
   - ✓ Return date
   - ✓ Overdue status
   - ✓ Holds on item

3. **Item Information Displays:**
   - Title
   - Patron who had it
   - Original due date
   - Return status (On Time / Overdue)

**Step 3: Handle Results**

**If Item Returned On Time:**
- ✅ Green confirmation
- "Item checked in successfully"
- Item status becomes "Available"
- Continue scanning next item

**If Item is Overdue:**
- ⚠️ Orange/Yellow alert
- "Item is overdue"
- Fine amount displays
- Fine automatically created
- Item still checked in
- Note fine amount for patron
- Continue scanning

**If Item Has Holds:**
- 🔔 Blue notification
- "Item has hold requests"
- **Action Required:**
  1. Click "Confirm Hold"
  2. System prints hold slip
  3. Place item on hold shelf
  4. Arrange by pickup location
  5. Patron will be notified

**If Item is Damaged:**
- ⚠️ Inspect item
- If damage found:
  1. Check "Item Damaged" box
  2. Describe damage in notes
  3. Set item aside for supervisor
  4. Supervisor will assess repair/fee

**Step 4: Complete Check-In**
- Continue scanning all returned items
- No need to "end session" (unlike checkout)
- Items automatically updated in system

#### **العربية: خطوة بخطوة**

**الخطوة 1: الوصول إلى شاشة الاسترجاع**
1. انقر على **الإعارة** في الشريط الجانبي
2. انقر على تبويب **استرجاع**
3. تظهر شاشة الاسترجاع

**الخطوة 2: امسح العناصر المُرجعة**
1. **امسح باركود العنصر**
   - ضعه تحت الماسح الضوئي
   - انتظر الصفارة
   - أو اكتب الباركود يدوياً
   - اضغط Enter

2. **يتحقق النظام تلقائياً:**
   - ✓ كان العنصر مُعاراً
   - ✓ تاريخ الإرجاع
   - ✓ حالة التأخر
   - ✓ حجوزات على العنصر

3. **تظهر معلومات العنصر:**
   - العنوان
   - القارئ الذي كان لديه
   - تاريخ الاستحقاق الأصلي
   - حالة الإرجاع (في الوقت / متأخر)

**الخطوة 3: تعامل مع النتائج**

**إذا أُرجع العنصر في الوقت:**
- ✅ تأكيد أخضر
- "تم استرجاع العنصر بنجاح"
- حالة العنصر تصبح "متاح"
- استمر في مسح العنصر التالي

**إذا كان العنصر متأخراً:**
- ⚠️ تنبيه برتقالي/أصفر
- "العنصر متأخر"
- يُعرض مبلغ الغرامة
- تُنشأ الغرامة تلقائياً
- يُسترجع العنصر
- لاحظ مبلغ الغرامة للقارئ
- استمر في المسح

**إذا كان للعنصر حجوزات:**
- 🔔 إشعار أزرق
- "للعنصر طلبات حجز"
- **إجراء مطلوب:**
  1. انقر على "تأكيد الحجز"
  2. يطبع النظام قسيمة الحجز
  3. ضع العنصر على رف الحجز
  4. رتّب حسب موقع الاستلام
  5. سيُخطر القارئ

**إذا كان العنصر تالفاً:**
- ⚠️ افحص العنصر
- إذا وُجد تلف:
  1. ضع علامة على مربع "العنصر تالف"
  2. صف التلف في الملاحظات
  3. ضع العنصر جانباً للمشرف
  4. سيقيّم المشرف الإصلاح/الرسم

**الخطوة 4: أكمل الاسترجاع**
- استمر في مسح جميع العناصر المُرجعة
- لا حاجة لـ "إنهاء الجلسة" (بخلاف الإعارة)
- تُحدّث العناصر تلقائياً في النظام

### 5.2 Handling Overdue Items | التعامل مع العناصر المتأخرة

#### **English:**

**Automatic Fine Calculation:**
- System calculates fines automatically
- Typical rate: $0.50 per day
- Maximum fine: Usually $10 per item
- Grace period: Usually 1 day (no fine first day late)

**When Patron Returns Overdue Items:**
1. Check in items normally
2. Note total fine amount
3. Inform patron of fine
4. Explain payment options
5. Give patron fee summary if requested

**Payment of Fines:**
- You can VIEW fees
- You CANNOT collect payment (refer to supervisor/librarian)
- Direct patron to appropriate desk for payment

#### **العربية:**

**حساب الغرامة التلقائي:**
- يحسب النظام الغرامات تلقائياً
- المعدل النموذجي: 0.50$ لليوم
- الغرامة القصوى: عادة 10$ لكل عنصر
- فترة سماح: عادة يوم واحد (لا غرامة أول يوم متأخر)

**عندما يُرجع القارئ عناصر متأخرة:**
1. استرجع العناصر بشكل طبيعي
2. لاحظ المبلغ الإجمالي للغرامة
3. أخبر القارئ بالغرامة
4. اشرح خيارات الدفع
5. أعط القارئ ملخص الرسوم إذا طُلب

**دفع الغرامات:**
- يمكنك عرض الرسوم
- لا يمكنك تحصيل الدفع (ارجع للمشرف/أمين المكتبة)
- وجّه القارئ إلى المكتب المناسب للدفع

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 6. Renewing Items | تجديد العناصر

### 6.1 How to Renew Items | كيفية تجديد العناصر

#### **English:**

**Method 1: During Checkout (Patron Present)**
1. Scan patron's library card
2. Patron information displays
3. View "Current Loans" section
4. Click **"Renew"** button next to each item
5. New due date appears
6. Print receipt with new due dates

**Method 2: Renew Tab**
1. Go to **Circulation** → **Renew**
2. Scan patron barcode
3. Scan item barcode
4. Click **"Renew"** button
5. Confirm new due date

**Renewal Limits:**
- Most items: 2 renewals maximum
- New due date: Same period from today
  - Undergraduate: +14 days
  - Graduate: +28 days
  - Faculty: +90 days

#### **العربية:**

**الطريقة 1: أثناء الإعارة (القارئ موجود)**
1. امسح بطاقة المكتبة للقارئ
2. تظهر معلومات القارئ
3. اعرض قسم "الإعارات الحالية"
4. انقر على زر **"تجديد"** بجوار كل عنصر
5. يظهر تاريخ الاستحقاق الجديد
6. اطبع الإيصال مع تواريخ الاستحقاق الجديدة

**الطريقة 2: تبويب التجديد**
1. اذهب إلى **الإعارة** ← **تجديد**
2. امسح باركود القارئ
3. امسح باركود العنصر
4. انقر على زر **"تجديد"**
5. أكّد تاريخ الاستحقاق الجديد

**حدود التجديد:**
- معظم العناصر: تجديدان كحد أقصى
- تاريخ الاستحقاق الجديد: نفس الفترة من اليوم
  - طالب جامعي: +14 يوماً
  - طالب دراسات عليا: +28 يوماً
  - عضو هيئة تدريس: +90 يوماً

### 6.2 When Renewals Are Blocked | متى تُحظر التجديدات

#### **English:**

**Renewal Blocked When:**
❌ Item has reached maximum renewals (2)
❌ Another patron has placed a hold
❌ Item is overdue
❌ Patron account has blocks
❌ Item type is non-renewable

**What to Tell Patron:**
- "I'm sorry, this item cannot be renewed because..."
- Explain the specific reason
- Suggest alternatives:
  - If holds: "Someone else requested this item"
  - If max renewals: "You've used all renewals"
  - If overdue: "Please return this item first"
  - Offer to place hold after return

#### **العربية:**

**يُحظر التجديد عندما:**
❌ وصل العنصر للحد الأقصى من التجديدات (2)
❌ قارئ آخر وضع حجزاً
❌ العنصر متأخر
❌ حساب القارئ به قيود
❌ نوع العنصر غير قابل للتجديد

**ماذا تقول للقارئ:**
- "آسف، لا يمكن تجديد هذا العنصر لأن..."
- اشرح السبب المحدد
- اقترح بدائل:
  - إذا كانت حجوزات: "شخص آخر طلب هذا العنصر"
  - إذا كان الحد الأقصى: "استخدمت جميع التجديدات"
  - إذا كان متأخراً: "يُرجى إرجاع هذا العنصر أولاً"
  - اعرض وضع حجز بعد الإرجاع

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 7. Managing Holds | إدارة الحجوزات

### 7.1 Understanding Holds | فهم الحجوزات

#### **English:**

**What is a Hold?**
A hold (or request) is when a patron reserves an item that is:
- Currently checked out to someone else
- On the shelf but patron wants it held
- Not yet received but patron wants it when available

**Types of Requests:**
- **Hold**: Wait for item to become available
- **Page**: Item on shelf, retrieve for patron
- **Recall**: Request early return from current borrower

#### **العربية:**

**ما هو الحجز؟**
الحجز (أو الطلب) هو عندما يحجز قارئ عنصراً:
- مُعار حالياً لشخص آخر
- على الرف لكن القارئ يريده محجوزاً
- لم يُستلم بعد لكن القارئ يريده عند التوفر

**أنواع الطلبات:**
- **حجز**: انتظر حتى يصبح العنصر متاحاً
- **صفحة**: العنصر على الرف، استرجعه للقارئ
- **استدعاء**: طلب إرجاع مبكر من المستعير الحالي

### 7.2 Processing Holds | معالجة الحجوزات

#### **English:**

**When Checking In Item with Hold:**

1. **System Alerts**: "Item has hold request"
2. **Action Steps:**
   - Click **"Confirm Hold"**
   - System prints **hold slip** with:
     - Patron name
     - Pickup location
     - Expiration date
   - Attach slip to item
   - Place on **hold shelf** in designated area
   - Organize by:
     - Patron last name OR
     - Pickup location
3. **System Notifications:**
   - Patron receives notification (email/SMS)
   - Hold expires after 7 days (typically)

**Hold Shelf Management:**
1. Check hold shelf daily
2. Remove expired holds
3. Return expired items to regular shelves
4. Keep shelf organized and neat

#### **العربية:**

**عند استرجاع عنصر به حجز:**

1. **ينبه النظام**: "للعنصر طلب حجز"
2. **خطوات الإجراء:**
   - انقر على **"تأكيد الحجز"**
   - يطبع النظام **قسيمة حجز** مع:
     - اسم القارئ
     - موقع الاستلام
     - تاريخ الانتهاء
   - ألصق القسيمة بالعنصر
   - ضع على **رف الحجز** في المنطقة المخصصة
   - نظّم حسب:
     - اسم العائلة للقارئ أو
     - موقع الاستلام
3. **إشعارات النظام:**
   - يتلقى القارئ إشعاراً (بريد إلكتروني/SMS)
   - ينتهي الحجز بعد 7 أيام (عادة)

**إدارة رف الحجز:**
1. تحقق من رف الحجز يومياً
2. أزل الحجوزات المنتهية
3. أعد العناصر المنتهية إلى الرفوف العادية
4. حافظ على الرف منظماً ومرتباً

### 7.3 Checking Out Holds | إعارة الحجوزات

#### **English:**

**When Patron Comes to Pick Up Hold:**

1. **Verify Patron Identity:**
   - Ask for library card
   - Check photo ID if required

2. **Find Item on Hold Shelf:**
   - Look up by patron name
   - OR scan patron card to see holds

3. **Check Out Item:**
   - Scan patron barcode
   - Scan item barcode
   - Item checks out normally
   - Give new due date
   - Print receipt

4. **Remove Hold Slip:**
   - Detach hold slip from item
   - Dispose of slip

#### **العربية:**

**عندما يأتي القارئ لاستلام الحجز:**

1. **تحقق من هوية القارئ:**
   - اطلب بطاقة المكتبة
   - تحقق من هوية بصورة إذا لزم

2. **اعثر على العنصر على رف الحجز:**
   - ابحث باسم القارئ
   - أو امسح بطاقة القارئ لرؤية الحجوزات

3. **أعر العنصر:**
   - امسح باركود القارئ
   - امسح باركود العنصر
   - يُعار العنصر بشكل طبيعي
   - أعط تاريخ الاستحقاق الجديد
   - اطبع الإيصال

4. **أزل قسيمة الحجز:**
   - انزع قسيمة الحجز من العنصر
   - تخلص من القسيمة

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 8. Viewing Patron Information | عرض معلومات القراء

### 8.1 Looking Up Patrons | البحث عن القراء

#### **English:**

**Quick Lookup During Transaction:**
- Scan library card barcode
- Information appears automatically

**Manual Search:**
1. Go to **Users** in sidebar
2. Use search box to find by:
   - Name (first or last)
   - Email address
   - Library card number
   - Username
3. Click on patron name to view details

**Patron Details You Can View:**
- ✓ Name and contact information
- ✓ Patron type and group
- ✓ Current items checked out
- ✓ Loan history (if enabled)
- ✓ Outstanding fees
- ✓ Hold requests
- ✓ Account status (Active/Blocked)

**You Cannot:**
- ❌ Edit patron information
- ❌ Create new patrons
- ❌ Delete patrons

#### **العربية:**

**بحث سريع أثناء المعاملة:**
- امسح باركود بطاقة المكتبة
- تظهر المعلومات تلقائياً

**بحث يدوي:**
1. اذهب إلى **المستخدمون** في الشريط الجانبي
2. استخدم مربع البحث للبحث بـ:
   - الاسم (الأول أو الأخير)
   - عنوان البريد الإلكتروني
   - رقم بطاقة المكتبة
   - اسم المستخدم
3. انقر على اسم القارئ لعرض التفاصيل

**تفاصيل القارئ التي يمكنك عرضها:**
- ✓ الاسم ومعلومات الاتصال
- ✓ نوع ومجموعة القارئ
- ✓ العناصر المُعارة الحالية
- ✓ سجل الإعارة (إذا كان مفعّلاً)
- ✓ الرسوم المستحقة
- ✓ طلبات الحجز
- ✓ حالة الحساب (نشط/محظور)

**لا يمكنك:**
- ❌ تحرير معلومات القراء
- ❌ إنشاء قراء جدد
- ❌ حذف القراء

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 9. Viewing Fees | عرض الرسوم

### 9.1 Checking Patron Fees | التحقق من رسوم القراء

#### **English:**

**How to View Fees:**
1. Look up patron
2. Click **"Fees"** tab
3. View fee details:
   - Type of fee (overdue, lost, damage)
   - Amount owed
   - Date created
   - Status (outstanding/paid)
   - Related item (if applicable)

**You Can:**
- ✓ VIEW all fees
- ✓ Print fee summary for patron

**You Cannot:**
- ❌ Collect payments (refer to librarian/supervisor)
- ❌ Create fees manually
- ❌ Waive fees
- ❌ Edit fees

**When Patron Asks About Fees:**
1. Show them the fees on screen
2. Explain each fee
3. Print fee summary if requested
4. Direct to appropriate desk for payment

#### **العربية:**

**كيفية عرض الرسوم:**
1. ابحث عن القارئ
2. انقر على تبويب **"الرسوم"**
3. اعرض تفاصيل الرسوم:
   - نوع الرسم (تأخير، ضائع، تلف)
   - المبلغ المستحق
   - تاريخ الإنشاء
   - الحالة (مستحق/مدفوع)
   - العنصر المرتبط (إن وُجد)

**يمكنك:**
- ✓ عرض جميع الرسوم
- ✓ طباعة ملخص الرسوم للقارئ

**لا يمكنك:**
- ❌ تحصيل الدفعات (ارجع لأمين المكتبة/المشرف)
- ❌ إنشاء رسوم يدوياً
- ❌ الإعفاء من الرسوم
- ❌ تحرير الرسوم

**عندما يسأل القارئ عن الرسوم:**
1. أظهر لهم الرسوم على الشاشة
2. اشرح كل رسم
3. اطبع ملخص الرسوم إذا طُلب
4. وجّه إلى المكتب المناسب للدفع

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 10. Common Tasks | المهام الشائعة

### 10.1 Daily Opening Procedures | إجراءات الفتح اليومي

#### **English:**

**Start of Your Shift:**
1. ✓ Log in to system
2. ✓ Check dashboard for alerts
3. ✓ Review hold shelf
   - Remove expired holds
   - Organize items
4. ✓ Check barcode scanner is working
5. ✓ Check receipt printer has paper
6. ✓ Review any notes from previous shift
7. ✓ Check for system notifications

#### **العربية:**

**بداية وردية العمل:**
1. ✓ سجّل الدخول إلى النظام
2. ✓ تحقق من لوحة التحكم بحثاً عن التنبيهات
3. ✓ راجع رف الحجز
   - أزل الحجوزات المنتهية
   - نظّم العناصر
4. ✓ تحقق من عمل ماسح الباركود
5. ✓ تحقق من وجود ورق في طابعة الإيصالات
6. ✓ راجع أي ملاحظات من الوردية السابقة
7. ✓ تحقق من إشعارات النظام

### 10.2 Handling Problem Situations | التعامل مع المواقف الإشكالية

#### **English:**

**Difficult Patron:**
- Stay calm and professional
- Listen to their concern
- Explain policies clearly
- Offer to get supervisor if needed
- Never argue

**System Not Responding:**
- Wait a moment and try again
- Refresh browser (F5)
- If persists, call IT/supervisor
- Use backup procedures if available

**Unclear Error Message:**
- Read message carefully
- Click "Details" if available
- Note exact message
- Ask supervisor for guidance

**Item Appears Checked Out But Patron Says They Returned It:**
- Check with patron when they returned it
- Search for item on hold shelf
- Check if it was returned to wrong library
- Fill out "claims returned" form
- Escalate to supervisor

#### **العربية:**

**قارئ صعب:**
- ابق هادئاً ومحترفاً
- استمع لمخاوفهم
- اشرح السياسات بوضوح
- اعرض إحضار المشرف إذا لزم
- لا تجادل أبداً

**النظام لا يستجيب:**
- انتظر لحظة وحاول مرة أخرى
- حدّث المتصفح (F5)
- إذا استمر، اتصل بتكنولوجيا المعلومات/المشرف
- استخدم إجراءات احتياطية إن وُجدت

**رسالة خطأ غير واضحة:**
- اقرأ الرسالة بعناية
- انقر على "التفاصيل" إن وُجدت
- لاحظ الرسالة بالضبط
- اطلب إرشاد المشرف

**يظهر العنصر مُعاراً لكن القارئ يقول إنه أرجعه:**
- تحقق مع القارئ متى أرجعوه
- ابحث عن العنصر على رف الحجز
- تحقق إذا أُرجع لمكتبة خاطئة
- املأ نموذج "يدّعي الإرجاع"
- صعّد للمشرف

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 11. Best Practices | أفضل الممارسات

### 11.1 Professional Service | الخدمة المهنية

#### **English:**

✅ **Do:**
- Greet each patron warmly
- Make eye contact and smile
- Be patient and helpful
- Verify information before processing
- Handle items carefully
- Maintain patron privacy
- Keep workspace organized
- Ask for help when unsure

❌ **Don't:**
- Rush through transactions
- Discuss patron information publicly
- Eat or drink at desk
- Use phone for personal calls
- Leave desk unattended
- Ignore patrons waiting

#### **العربية:**

✅ **افعل:**
- رحّب بكل قارئ بحرارة
- تواصل بالعين وابتسم
- كن صبوراً ومساعداً
- تحقق من المعلومات قبل المعالجة
- تعامل مع العناصر بعناية
- حافظ على خصوصية القراء
- حافظ على مكان العمل منظماً
- اطلب المساعدة عند عدم التأكد

❌ **لا تفعل:**
- التسرع في المعاملات
- مناقشة معلومات القراء علناً
- الأكل أو الشرب على المكتب
- استخدام الهاتف للمكالمات الشخصية
- ترك المكتب دون مراقبة
- تجاهل القراء المنتظرين

### 11.2 Equipment Care | العناية بالمعدات

#### **English:**

**Barcode Scanner:**
- Keep lens clean (dry cloth only)
- Don't drop or bang scanner
- Report malfunctions immediately
- Store properly when not in use

**Computer:**
- Don't install unauthorized software
- Log out when leaving
- Report technical issues
- Keep food and drinks away

**Receipt Printer:**
- Check paper supply regularly
- Don't force paper jams
- Report printing issues
- Keep area clear

#### **العربية:**

**ماسح الباركود:**
- حافظ على العدسة نظيفة (قماش جاف فقط)
- لا تُسقط أو تضرب الماسح
- أبلغ عن الأعطال فوراً
- خزّن بشكل صحيح عند عدم الاستخدام

**الكمبيوتر:**
- لا تثبّت برامج غير مصرح بها
- سجّل الخروج عند المغادرة
- أبلغ عن المشاكل التقنية
- أبعد الطعام والمشروبات

**طابعة الإيصالات:**
- تحقق من إمداد الورق بانتظام
- لا تجبر انحشار الورق
- أبلغ عن مشاكل الطباعة
- حافظ على المنطقة خالية

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 12. Troubleshooting | حل المشكلات

### 12.1 Common Problems and Solutions | المشاكل والحلول الشائعة

#### **English & Arabic:**

| Problem | المشكلة | Solution | الحل |
|---------|----------|----------|------|
| **Scanner not working** | **الماسح لا يعمل** | Check connection, restart scanner, use manual entry | تحقق من الاتصال، أعد تشغيل الماسح، استخدم الإدخال اليدوي |
| **Printer not printing** | **الطابعة لا تطبع** | Check paper, check connections, restart printer | تحقق من الورق، تحقق من الاتصالات، أعد تشغيل الطابعة |
| **System slow** | **النظام بطيء** | Refresh browser, close unused windows, contact IT | حدّث المتصفح، أغلق النوافذ غير المستخدمة، اتصل بتكنولوجيا المعلومات |
| **Can't log in** | **لا يمكن تسجيل الدخول** | Check username/password, check Caps Lock, contact supervisor | تحقق من اسم المستخدم/كلمة المرور، تحقق من Caps Lock، اتصل بالمشرف |
| **Transaction won't complete** | **المعاملة لن تكتمل** | Read error message, verify data, ask for help | اقرأ رسالة الخطأ، تحقق من البيانات، اطلب المساعدة |

### 12.2 When to Call for Help | متى تطلب المساعدة

#### **English:**

**Call Supervisor/Librarian When:**
- Patron disputes a fee
- System errors persist
- Equipment malfunctions
- Patron requests rule exception
- Unclear how to proceed
- Dealing with difficult situation
- Need to override system block

**Emergency Situations:**
- Medical emergency
- Security concern
- Equipment on fire/smoking
- Any safety issue

#### **العربية:**

**اتصل بالمشرف/أمين المكتبة عندما:**
- يعترض قارئ على رسم
- تستمر أخطاء النظام
- تتعطل المعدات
- يطلب قارئ استثناءً من القاعدة
- غير واضح كيفية المتابعة
- تتعامل مع موقف صعب
- تحتاج لتجاوز قيد النظام

**حالات الطوارئ:**
- حالة طبية طارئة
- قلق أمني
- معدات تحترق/تدخن
- أي مسألة سلامة

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## Quick Reference Card | بطاقة مرجع سريع

### Essential Tasks | المهام الأساسية

#### **English | العربية**

| Task | المهمة | Steps | الخطوات |
|------|--------|-------|---------|
| **Check Out** | **إعارة** | 1. Scan patron<br>2. Scan item(s)<br>3. End session | 1. امسح القارئ<br>2. امسح العنصر (العناصر)<br>3. أنه الجلسة |
| **Check In** | **استرجاع** | 1. Scan item<br>2. Handle any alerts<br>3. Continue | 1. امسح العنصر<br>2. تعامل مع التنبيهات<br>3. استمر |
| **Renew** | **تجديد** | 1. Scan patron<br>2. Click Renew<br>3. Confirm | 1. امسح القارئ<br>2. انقر تجديد<br>3. أكّد |
| **Hold** | **حجز** | 1. Check in item<br>2. Print slip<br>3. Place on shelf | 1. استرجع العنصر<br>2. اطبع القسيمة<br>3. ضعه على الرف |

---

## Document Information | معلومات الوثيقة

**Version | الإصدار**: 1.0
**Last Updated | آخر تحديث**: October 2025
**Language | اللغة**: Bilingual (English/Arabic) | ثنائي اللغة

---

© 2025 FOLIO Library Management System
All rights reserved | جميع الحقوق محفوظة

**[Back to Top | العودة للأعلى](#circulation-desk-staff-manual--دليل-موظف-خدمة-الإعارة)**

**End of Circulation Desk Staff Manual | نهاية دليل موظف خدمة الإعارة**
