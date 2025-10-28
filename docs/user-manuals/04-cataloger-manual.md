# Cataloger Manual | دليل المفهرس
## FOLIO Library Management System | نظام إدارة المكتبات فوليو

**Version | الإصدار**: 1.0
**Last Updated | آخر تحديث**: October 2025
**Role | الدور**: Cataloger | المفهرس
**Access Level | مستوى الوصول**: Specialized Inventory Access | صلاحية جرد متخصصة

---

## Table of Contents | جدول المحتويات

1. [Introduction](#1-introduction--مقدمة)
2. [Getting Started](#2-getting-started--البدء)
3. [Cataloging Basics](#3-cataloging-basics--أساسيات-الفهرسة)
4. [Creating Bibliographic Records](#4-creating-bibliographic-records--إنشاء-السجلات-الببليوجرافية)
5. [Managing Holdings](#5-managing-holdings--إدارة-المقتنيات)
6. [Adding Items](#6-adding-items--إضافة-العناصر)
7. [Editing Records](#7-editing-records--تحرير-السجلات)
8. [Classification and Call Numbers](#8-classification-and-call-numbers--التصنيف-وأرقام-الاستدعاء)
9. [Subject Headings](#9-subject-headings--رؤوس-الموضوعات)
10. [Quality Control](#10-quality-control--ضبط-الجودة)
11. [Best Practices](#11-best-practices--أفضل-الممارسات)
12. [Troubleshooting](#12-troubleshooting--حل-المشكلات)

---

## 1. Introduction | مقدمة

### 1.1 About This Manual | حول هذا الدليل

**English:**
This manual is designed for catalogers responsible for creating and maintaining bibliographic records in FOLIO LMS. Your work ensures that library materials are properly described, classified, and accessible to users. You play a vital role in organizing the library's collection.

**العربية:**
هذا الدليل مصمم للمفهرسين المسؤولين عن إنشاء وصيانة السجلات الببليوجرافية في نظام فوليو. عملك يضمن أن مواد المكتبة موصوفة ومصنفة ويمكن الوصول إليها من قبل المستخدمين بشكل صحيح. تلعب دوراً حيوياً في تنظيم مجموعة المكتبة.

### 1.2 Your Permissions | صلاحياتك

#### **English: What You Can Do**

✅ **Inventory Management:**
- Create new bibliographic records (Instances)
- Create and edit holdings records
- Add and edit items
- Update item information
- Manage call numbers and locations

✅ **Reports:**
- View inventory reports
- Access cataloging statistics

✅ **Search:**
- Full search capabilities
- Advanced search features

❌ **Cannot Do:**
- Delete records (Admin only)
- Manage users or patrons
- Process circulation transactions
- Create or waive fees
- Access acquisitions or courses
- Modify system settings

#### **العربية: ما يمكنك فعله**

✅ **إدارة الجرد:**
- إنشاء سجلات ببليوجرافية جديدة (نسخ)
- إنشاء وتحرير سجلات المقتنيات
- إضافة وتحرير العناصر
- تحديث معلومات العنصر
- إدارة أرقام الاستدعاء والمواقع

✅ **التقارير:**
- عرض تقارير الجرد
- الوصول إلى إحصائيات الفهرسة

✅ **البحث:**
- قدرات بحث كاملة
- ميزات بحث متقدمة

❌ **لا يمكنك:**
- حذف السجلات (المسؤول فقط)
- إدارة المستخدمين أو القراء
- معالجة معاملات الإعارة
- إنشاء أو الإعفاء من الرسوم
- الوصول إلى المقتنيات أو المقررات
- تعديل إعدادات النظام

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 2. Getting Started | البدء

### 2.1 Accessing the System | الوصول إلى النظام

#### **English:**

1. Open web browser (Chrome or Firefox recommended)
2. Navigate to: `http://localhost:3000`
3. Enter your cataloger credentials
4. Click **"Sign In"**

**Your Workspace:**
After login, you'll have access to:
- **Inventory** module (main work area)
- **Search** function
- **Reports** for statistics
- **Dashboard** for overview

#### **العربية:**

1. افتح متصفح الويب (كروم أو فايرفوكس موصى بهما)
2. انتقل إلى: `http://localhost:3000`
3. أدخل بيانات دخول المفهرس
4. انقر على **"تسجيل الدخول"**

**مساحة عملك:**
بعد تسجيل الدخول، ستتمكن من الوصول إلى:
- وحدة **الجرد** (منطقة العمل الرئيسية)
- وظيفة **البحث**
- **التقارير** للإحصائيات
- **لوحة التحكم** للنظرة العامة

### 2.2 Cataloging Standards | معايير الفهرسة

#### **English:**

**Follow These Standards:**
- **RDA** (Resource Description and Access) - Preferred
- **AACR2** (Anglo-American Cataloguing Rules) - Legacy records
- **MARC 21** - For MARC records (if applicable)
- **Library of Congress** subject headings
- **Dewey Decimal** or **LC Classification** for call numbers

**Consistency is Key:**
- Use standard formats
- Follow established practices
- Maintain authority control
- Check for duplicate records before creating new ones

#### **العربية:**

**اتبع هذه المعايير:**
- **RDA** (وصف المورد والوصول) - المفضل
- **AACR2** (قواعد الفهرسة الأنجلو-أمريكية) - السجلات القديمة
- **MARC 21** - لسجلات MARC (إن وُجدت)
- رؤوس موضوعات **مكتبة الكونجرس**
- **ديوي العشري** أو **تصنيف مكتبة الكونجرس** لأرقام الاستدعاء

**الاتساق هو المفتاح:**
- استخدم تنسيقات معيارية
- اتبع الممارسات المعتمدة
- حافظ على التحكم في الاستناد
- تحقق من السجلات المكررة قبل إنشاء جديدة

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 3. Cataloging Basics | أساسيات الفهرسة

### 3.1 Understanding the Structure | فهم الهيكل

#### **English:**

**Three-Level Hierarchy in FOLIO:**

**1. Instance (Bibliographic Record)**
- Represents the intellectual work
- Contains title, author, publication info
- One per work (e.g., "Harry Potter and the Philosopher's Stone")
- Shared across all copies and locations

**2. Holdings**
- Represents ownership by a location
- Contains call number and location
- Multiple per instance (different libraries/branches)
- Links instance to physical items

**3. Item**
- Represents individual physical copy
- Contains barcode, status, loan type
- Multiple per holdings (multiple copies)
- Circulates to patrons

**Example Structure:**
```
Instance: "Introduction to Psychology" by Myers
├── Holdings: Main Library | Call# BF121.M94 2020
│   ├── Item: Barcode 00012345 (Available)
│   ├── Item: Barcode 00012346 (Checked Out)
│   └── Item: Barcode 00012347 (Available)
└── Holdings: Branch Library | Call# BF121.M94 2020
    └── Item: Barcode 00054321 (Available)
```

#### **العربية:**

**هيكل هرمي من ثلاثة مستويات في فوليو:**

**1. النسخة (السجل الببليوجرافي)**
- تمثل العمل الفكري
- تحتوي على العنوان، المؤلف، معلومات النشر
- واحدة لكل عمل (مثلاً، "هاري بوتر وحجر الفيلسوف")
- مشتركة عبر جميع النسخ والمواقع

**2. المقتنيات**
- تمثل الملكية بموقع
- تحتوي على رقم الاستدعاء والموقع
- متعددة لكل نسخة (مكتبات/فروع مختلفة)
- تربط النسخة بالعناصر المادية

**3. العنصر**
- يمثل النسخة المادية الفردية
- يحتوي على الباركود، الحالة، نوع الإعارة
- متعدد لكل مقتنى (نسخ متعددة)
- يُعار للقراء

**مثال على الهيكل:**
```
النسخة: "مقدمة في علم النفس" لمايرز
├── المقتنيات: المكتبة الرئيسية | رقم الاستدعاء BF121.M94 2020
│   ├── العنصر: باركود 00012345 (متاح)
│   ├── العنصر: باركود 00012346 (مُعار)
│   └── العنصر: باركود 00012347 (متاح)
└── المقتنيات: المكتبة الفرعية | رقم الاستدعاء BF121.M94 2020
    └── العنصر: باركود 00054321 (متاح)
```

### 3.2 Before You Begin Cataloging | قبل أن تبدأ الفهرسة

#### **English:**

**Step 1: Search for Existing Records**
- ALWAYS search first to avoid duplicates
- Search by:
  - ISBN/ISSN
  - Title
  - Author
  - OCLC number

**Step 2: Determine if Record Exists**
- If exists: Add holdings and items only
- If doesn't exist: Create new instance

**Step 3: Gather Information**
From the item itself:
- Title page (for title, author, publisher)
- Verso of title page (for copyright date, ISBN)
- Spine (for edition information)
- Cover (for additional info)

**Step 4: Determine Classification**
- Assign Dewey or LC call number
- Check classification schedules
- Verify with similar items

#### **العربية:**

**الخطوة 1: ابحث عن السجلات الموجودة**
- ابحث دائماً أولاً لتجنب التكرار
- ابحث بـ:
  - ISBN/ISSN
  - العنوان
  - المؤلف
  - رقم OCLC

**الخطوة 2: حدد ما إذا كان السجل موجوداً**
- إذا وُجد: أضف المقتنيات والعناصر فقط
- إذا لم يوجد: أنشئ نسخة جديدة

**الخطوة 3: اجمع المعلومات**
من العنصر نفسه:
- صفحة العنوان (للعنوان، المؤلف، الناشر)
- ظهر صفحة العنوان (لتاريخ حقوق النشر، ISBN)
- الكعب (لمعلومات الطبعة)
- الغلاف (لمعلومات إضافية)

**الخطوة 4: حدد التصنيف**
- عيّن رقم استدعاء ديوي أو مكتبة الكونجرس
- تحقق من جداول التصنيف
- تحقق مع عناصر مماثلة

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 4. Creating Bibliographic Records | إنشاء السجلات الببليوجرافية

### 4.1 Creating a New Instance | إنشاء نسخة جديدة

#### **English: Step-by-Step**

1. **Access Inventory**
   - Go to **Inventory** in left sidebar
   - Click **"Instances"** tab
   - Click **"New"** button

2. **Fill in Required Fields**

   **Title Information:**
   - **Title**: *Required* - Main title exactly as appears
   - **Alternative Titles**: Parallel titles, subtitles
   - **Index Title**: For sorting (omit articles: The, A, An)
   - **Series**: If part of a series

   **Contributors (Authors/Editors):**
   - Click **"Add Contributor"**
   - **Name**: Last name, First name *Required*
   - **Type**: *Required*
     - Author (primary)
     - Editor
     - Translator
     - Illustrator
     - Compiler
     - Other
   - **Primary**: Check for main author
   - Add multiple contributors as needed

   **Identifiers:**
   - Click **"Add Identifier"**
   - **Type**: ISBN, ISSN, LCCN, OCLC
   - **Value**: Enter number (no hyphens for ISBN)
   - Add all applicable identifiers

   **Publication Information:**
   - **Publisher**: Publisher name
   - **Place**: City of publication
   - **Date Published**: Year (YYYY format)
   - **Copyright Date**: © year if different

   **Edition:**
   - Edition statement (e.g., "2nd ed.", "Rev. ed.")
   - Only if not first edition

   **Physical Description:**
   - **Pages**: Number of pages (e.g., "xii, 345 p.")
   - **Illustrations**: Note if illustrated
   - **Size**: Height in cm (e.g., "24 cm")

   **Languages:**
   - Select primary language
   - Add additional languages if bilingual

   **Resource Type:** *Required*
   - Book
   - Journal/Magazine
   - DVD
   - CD
   - E-book
   - Other

   **Instance Format:**
   - Physical (for physical items)
   - Electronic (for e-resources)

3. **Add Subject Headings**
   - Click **"Add Subject"**
   - Use Library of Congress Subject Headings (LCSH)
   - Enter complete heading with subdivisions
   - Examples:
     - "Psychology--Textbooks"
     - "American literature--20th century"
     - "World War, 1939-1945--France"

4. **Add Classification**
   - **Classification Type**: Dewey or LC
   - **Classification Number**: Call number
   - Example: "150" (Dewey) or "BF121" (LC)

5. **Add Notes** (Optional but recommended)
   - **General Note**: Any relevant information
   - **Bibliography Note**: If includes bibliography
   - **Contents Note**: Table of contents
   - **Summary**: Brief description

6. **Save the Instance**
   - Click **"Save & Close"**
   - Instance is created
   - Now ready to add holdings and items

#### **العربية: خطوة بخطوة**

1. **الوصول إلى الجرد**
   - اذهب إلى **الجرد** في الشريط الجانبي الأيسر
   - انقر على تبويب **"النسخ"**
   - انقر على زر **"جديد"**

2. **املأ الحقول المطلوبة**

   **معلومات العنوان:**
   - **العنوان**: *مطلوب* - العنوان الرئيسي كما يظهر بالضبط
   - **عناوين بديلة**: عناوين موازية، عناوين فرعية
   - **عنوان الفهرس**: للترتيب (احذف أدوات التعريف)
   - **السلسلة**: إذا كان جزءاً من سلسلة

   **المساهمون (المؤلفون/المحررون):**
   - انقر على **"إضافة مساهم"**
   - **الاسم**: اسم العائلة، الاسم الأول *مطلوب*
   - **النوع**: *مطلوب*
     - مؤلف (رئيسي)
     - محرر
     - مترجم
     - رسّام
     - مجمّع
     - آخر
   - **رئيسي**: ضع علامة للمؤلف الرئيسي
   - أضف مساهمين متعددين حسب الحاجة

   **المعرّفات:**
   - انقر على **"إضافة معرّف"**
   - **النوع**: ISBN، ISSN، LCCN، OCLC
   - **القيمة**: أدخل الرقم (بدون شرطات لـ ISBN)
   - أضف جميع المعرّفات المطبقة

   **معلومات النشر:**
   - **الناشر**: اسم الناشر
   - **المكان**: مدينة النشر
   - **تاريخ النشر**: السنة (تنسيق YYYY)
   - **تاريخ حقوق النشر**: © السنة إذا كانت مختلفة

   **الطبعة:**
   - بيان الطبعة (مثلاً، "الطبعة الثانية"، "طبعة منقحة")
   - فقط إذا لم تكن الطبعة الأولى

   **الوصف المادي:**
   - **الصفحات**: عدد الصفحات (مثلاً، "xii، 345 ص.")
   - **الرسوم التوضيحية**: لاحظ إذا كان مُصوّراً
   - **الحجم**: الارتفاع بالسم (مثلاً، "24 سم")

   **اللغات:**
   - اختر اللغة الأساسية
   - أضف لغات إضافية إذا كان ثنائي اللغة

   **نوع المورد:** *مطلوب*
   - كتاب
   - مجلة/دورية
   - DVD
   - CD
   - كتاب إلكتروني
   - آخر

   **تنسيق النسخة:**
   - مادي (للعناصر المادية)
   - إلكتروني (للموارد الإلكترونية)

3. **أضف رؤوس الموضوعات**
   - انقر على **"إضافة موضوع"**
   - استخدم رؤوس موضوعات مكتبة الكونجرس (LCSH)
   - أدخل الرأس الكامل مع التقسيمات
   - أمثلة:
     - "علم النفس--كتب مدرسية"
     - "الأدب الأمريكي--القرن العشرون"
     - "الحرب العالمية، 1939-1945--فرنسا"

4. **أضف التصنيف**
   - **نوع التصنيف**: ديوي أو مكتبة الكونجرس
   - **رقم التصنيف**: رقم الاستدعاء
   - مثال: "150" (ديوي) أو "BF121" (مكتبة الكونجرس)

5. **أضف ملاحظات** (اختياري لكن موصى به)
   - **ملاحظة عامة**: أي معلومات ذات صلة
   - **ملاحظة ببليوجرافية**: إذا تضمن ببليوجرافيا
   - **ملاحظة محتويات**: جدول المحتويات
   - **ملخص**: وصف موجز

6. **احفظ النسخة**
   - انقر على **"حفظ وإغلاق"**
   - تُنشأ النسخة
   - الآن جاهزة لإضافة المقتنيات والعناصر

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 5. Managing Holdings | إدارة المقتنيات

### 5.1 Adding Holdings Records | إضافة سجلات المقتنيات

#### **English:**

**After Creating Instance:**

1. **Access Holdings Creation**
   - From instance detail page
   - Click **"Add Holdings"** button

2. **Fill in Holdings Information**

   **Location:** *Required*
   - **Permanent Location**: Select library and specific location
     - Main Library - General Stacks
     - Main Library - Reference
     - Branch Library - Stacks
     - etc.
   - **Temporary Location**: Only if temporarily housed elsewhere

   **Call Number Information:**
   - **Call Number Type**: *Required*
     - Library of Congress (LC)
     - Dewey Decimal
     - Local (library-specific)
     - Other
   - **Call Number Prefix**: Optional (e.g., "REF" for reference)
   - **Call Number**: *Required*
     - Full classification number
     - Example (Dewey): "150.1 M994i 2020"
     - Example (LC): "BF121 .M94 2020"
   - **Call Number Suffix**: Optional (e.g., "c.1" for copy 1)

   **Copy Information:**
   - **Copy Number**: If maintaining copy counts at holdings level

   **Acquisition Information:**
   - **Acquisition Method**:
     - Purchase
     - Gift
     - Deposit
     - Exchange
     - Other
   - **Receipt Status**:
     - Pending (not yet received)
     - Received (in hand)

   **Holdings Type:**
   - **Monograph** (for single volumes, books)
   - **Serial** (for journals, continuing resources)
   - **Multi-volume** (for sets)

3. **Add Holdings Notes** (Optional)
   - **Public Note**: Visible to patrons
   - **Staff Note**: Internal use only
   - Examples:
     - "Latest issue at Reference Desk"
     - "Volumes 1-10 only"

4. **Save Holdings**
   - Click **"Save & Close"**
   - Holdings record created
   - Now ready to add items

#### **العربية:**

**بعد إنشاء النسخة:**

1. **الوصول إلى إنشاء المقتنيات**
   - من صفحة تفاصيل النسخة
   - انقر على زر **"إضافة مقتنيات"**

2. **املأ معلومات المقتنيات**

   **الموقع:** *مطلوب*
   - **الموقع الدائم**: اختر المكتبة والموقع المحدد
     - المكتبة الرئيسية - الرفوف العامة
     - المكتبة الرئيسية - المراجع
     - المكتبة الفرعية - الرفوف
     - إلخ.
   - **الموقع المؤقت**: فقط إذا كان مخزناً مؤقتاً في مكان آخر

   **معلومات رقم الاستدعاء:**
   - **نوع رقم الاستدعاء**: *مطلوب*
     - مكتبة الكونجرس (LC)
     - ديوي العشري
     - محلي (خاص بالمكتبة)
     - آخر
   - **بادئة رقم الاستدعاء**: اختياري (مثلاً، "REF" للمراجع)
   - **رقم الاستدعاء**: *مطلوب*
     - رقم التصنيف الكامل
     - مثال (ديوي): "150.1 M994i 2020"
     - مثال (مكتبة الكونجرس): "BF121 .M94 2020"
   - **لاحقة رقم الاستدعاء**: اختياري (مثلاً، "نـ.1" للنسخة 1)

   **معلومات النسخة:**
   - **رقم النسخة**: إذا كنت تحتفظ بعدد النسخ على مستوى المقتنيات

   **معلومات الاقتناء:**
   - **طريقة الاقتناء**:
     - شراء
     - هدية
     - وديعة
     - تبادل
     - آخر
   - **حالة الاستلام**:
     - معلق (لم يُستلم بعد)
     - مستلم (في اليد)

   **نوع المقتنيات:**
   - **مونوجراف** (للمجلدات المفردة، الكتب)
   - **دوري** (للمجلات، الموارد المستمرة)
   - **متعدد المجلدات** (للمجموعات)

3. **أضف ملاحظات المقتنيات** (اختياري)
   - **ملاحظة عامة**: مرئية للقراء
   - **ملاحظة الموظفين**: للاستخدام الداخلي فقط
   - أمثلة:
     - "آخر عدد على مكتب المراجع"
     - "المجلدات 1-10 فقط"

4. **احفظ المقتنيات**
   - انقر على **"حفظ وإغلاق"**
   - سجل المقتنيات مُنشأ
   - الآن جاهز لإضافة العناصر

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 6. Adding Items | إضافة العناصر

### 6.1 Creating Item Records | إنشاء سجلات العناصر

#### **English:**

1. **Access Item Creation**
   - From holdings record page
   - Click **"Add Item"** button

2. **Fill in Required Fields**

   **Item Identification:**
   - **Barcode**: *Required* - Must be unique
     - Scan or type barcode number
     - Verify it's not already in use
     - No spaces or special characters

   **Item Status:** *Required*
   - **Available**: Ready for checkout
   - **In Process**: Being cataloged/processed
   - **Missing**: Cannot locate
   - **Lost**: Declared lost
   - **Withdrawn**: Removed from collection

   **Material Type:** *Required*
   - **Book**: Regular books
   - **DVD**: Video materials
   - **CD**: Audio materials
   - **Journal**: Periodicals
   - **Reference**: Non-circulating
   - **Equipment**: Library equipment

   **Permanent Loan Type:** *Required*
   - **Can Circulate**: Normal checkout
   - **Reading Room**: In-library use only
   - **Course Reserves**: Short-term loan
   - **Non-Circulating**: Reference items

   **Temporary Loan Type:**
   - Only if loan type changes temporarily

3. **Additional Item Information**

   **Copy and Volume:**
   - **Copy Number**: Copy designation (c.1, c.2, etc.)
   - **Volume**: For multi-volume works (v.1, v.2)
   - **Enumeration**: For serials (Vol. 5, No. 3)
   - **Chronology**: Date designation (2020, Spring 2020)

   **Number of Pieces:**
   - Usually "1"
   - Enter actual count if multi-piece (book + CD, etc.)

   **Accession Number:**
   - Optional acquisition number

4. **Item Notes** (Highly Recommended)

   **Public Notes** (Visible to patrons):
   - Condition issues
   - Missing pieces
   - Special features
   - Examples:
     - "Includes CD-ROM"
     - "Large print edition"
     - "Binding loose - handle carefully"

   **Staff Notes** (Internal only):
   - Processing notes
   - Special handling
   - Examples:
     - "Gift from Dr. Smith"
     - "Keep in locked case"

5. **Save Item**
   - Click **"Save & Close"**
   - Item is now in the catalog
   - Available for circulation (if status = Available)

#### **العربية:**

1. **الوصول إلى إنشاء العنصر**
   - من صفحة سجل المقتنيات
   - انقر على زر **"إضافة عنصر"**

2. **املأ الحقول المطلوبة**

   **معرّف العنصر:**
   - **الباركود**: *مطلوب* - يجب أن يكون فريداً
     - امسح أو اكتب رقم الباركود
     - تحقق من أنه ليس قيد الاستخدام
     - بدون مسافات أو أحرف خاصة

   **حالة العنصر:** *مطلوب*
   - **متاح**: جاهز للإعارة
   - **قيد المعالجة**: يتم فهرسته/معالجته
   - **مفقود**: لا يمكن تحديد موقعه
   - **ضائع**: أُعلن عن ضياعه
   - **مسحوب**: أُزيل من المجموعة

   **نوع المادة:** *مطلوب*
   - **كتاب**: كتب عادية
   - **DVD**: مواد فيديو
   - **CD**: مواد صوتية
   - **مجلة**: دوريات
   - **مرجع**: غير قابلة للإعارة
   - **معدات**: معدات المكتبة

   **نوع الإعارة الدائم:** *مطلوب*
   - **قابل للإعارة**: إعارة عادية
   - **غرفة القراءة**: للاستخدام داخل المكتبة فقط
   - **احتياطي المقررات**: إعارة قصيرة الأجل
   - **غير قابل للإعارة**: عناصر مرجعية

   **نوع الإعارة المؤقت:**
   - فقط إذا تغير نوع الإعارة مؤقتاً

3. **معلومات العنصر الإضافية**

   **النسخة والمجلد:**
   - **رقم النسخة**: تعيين النسخة (نـ.1، نـ.2، إلخ.)
   - **المجلد**: للأعمال متعددة المجلدات (مج.1، مج.2)
   - **الترقيم**: للدوريات (المجلد 5، العدد 3)
   - **التسلسل الزمني**: تعيين التاريخ (2020، ربيع 2020)

   **عدد القطع:**
   - عادة "1"
   - أدخل العدد الفعلي إذا كان متعدد القطع (كتاب + CD، إلخ.)

   **رقم التحصيل:**
   - رقم اقتناء اختياري

4. **ملاحظات العنصر** (موصى به بشدة)

   **ملاحظات عامة** (مرئية للقراء):
   - مشاكل الحالة
   - قطع مفقودة
   - ميزات خاصة
   - أمثلة:
     - "يتضمن CD-ROM"
     - "طبعة طباعة كبيرة"
     - "التجليد مفكوك - تعامل بعناية"

   **ملاحظات الموظفين** (داخلية فقط):
   - ملاحظات المعالجة
   - معالجة خاصة
   - أمثلة:
     - "هدية من د. سميث"
     - "احفظ في خزانة مقفلة"

5. **احفظ العنصر**
   - انقر على **"حفظ وإغلاق"**
   - العنصر الآن في الفهرس
   - متاح للإعارة (إذا كانت الحالة = متاح)

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 7. Editing Records | تحرير السجلات

### 7.1 When to Edit vs. Create New | متى تحرر مقابل إنشاء جديد

#### **English:**

**Edit Existing Record When:**
- ✓ Correcting typos or errors
- ✓ Adding missing information
- ✓ Updating edition information
- ✓ Adding subjects or notes
- ✓ Same intellectual content

**Create New Record When:**
- ✓ Different edition
- ✓ Different format (print vs. ebook)
- ✓ Different translation
- ✓ Significantly revised content

#### **العربية:**

**حرر السجل الموجود عندما:**
- ✓ تصحيح أخطاء مطبعية أو أخطاء
- ✓ إضافة معلومات مفقودة
- ✓ تحديث معلومات الطبعة
- ✓ إضافة موضوعات أو ملاحظات
- ✓ نفس المحتوى الفكري

**أنشئ سجلاً جديداً عندما:**
- ✓ طبعة مختلفة
- ✓ تنسيق مختلف (مطبوع مقابل إلكتروني)
- ✓ ترجمة مختلفة
- ✓ محتوى منقح بشكل كبير

### 7.2 How to Edit Records | كيفية تحرير السجلات

#### **English:**

**Editing an Instance:**
1. Search for and open the instance
2. Click **"Actions"** → **"Edit"**
3. Make necessary changes
4. Click **"Save & Close"**

**Editing Holdings:**
1. Navigate to holdings record
2. Click **"Actions"** → **"Edit"**
3. Update fields
4. Click **"Save & Close"**

**Editing Items:**
1. Navigate to item record
2. Click **"Actions"** → **"Edit"**
3. Modify as needed
4. Click **"Save & Close"**

**Common Edits:**
- Correcting spelling
- Adding identifiers
- Updating call numbers
- Adding subjects
- Changing item status
- Adding notes

#### **العربية:**

**تحرير نسخة:**
1. ابحث عن النسخة وافتحها
2. انقر على **"إجراءات"** ← **"تحرير"**
3. قم بإجراء التغييرات اللازمة
4. انقر على **"حفظ وإغلاق"**

**تحرير المقتنيات:**
1. انتقل إلى سجل المقتنيات
2. انقر على **"إجراءات"** ← **"تحرير"**
3. حدّث الحقول
4. انقر على **"حفظ وإغلاق"**

**تحرير العناصر:**
1. انتقل إلى سجل العنصر
2. انقر على **"إجراءات"** ← **"تحرير"**
3. عدّل حسب الحاجة
4. انقر على **"حفظ وإغلاق"**

**التعديلات الشائعة:**
- تصحيح الإملاء
- إضافة معرّفات
- تحديث أرقام الاستدعاء
- إضافة موضوعات
- تغيير حالة العنصر
- إضافة ملاحظات

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 8. Classification and Call Numbers | التصنيف وأرقام الاستدعاء

### 8.1 Dewey Decimal Classification | تصنيف ديوي العشري

#### **English:**

**Main Classes:**
- 000 - Computer Science, Information
- 100 - Philosophy & Psychology
- 200 - Religion
- 300 - Social Sciences
- 400 - Language
- 500 - Science
- 600 - Technology
- 700 - Arts & Recreation
- 800 - Literature
- 900 - History & Geography

**Creating Dewey Call Number:**
```
[Class Number]  [Author Cutter]  [Date]
    150            M994            2020
```

**Example:**
- Title: "Introduction to Psychology" by Myers (2020)
- Class: 150 (Psychology)
- Cutter: M994 (for Myers)
- Date: 2020
- **Full Call Number**: 150 M994i 2020

#### **العربية:**

**الفئات الرئيسية:**
- 000 - علوم الكمبيوتر، المعلومات
- 100 - الفلسفة وعلم النفس
- 200 - الدين
- 300 - العلوم الاجتماعية
- 400 - اللغة
- 500 - العلوم
- 600 - التكنولوجيا
- 700 - الفنون والترفيه
- 800 - الأدب
- 900 - التاريخ والجغرافيا

**إنشاء رقم استدعاء ديوي:**
```
[رقم الفئة]  [قاطع المؤلف]  [التاريخ]
    150         M994        2020
```

**مثال:**
- العنوان: "مقدمة في علم النفس" لمايرز (2020)
- الفئة: 150 (علم النفس)
- القاطع: M994 (لمايرز)
- التاريخ: 2020
- **رقم الاستدعاء الكامل**: 150 M994i 2020

### 8.2 Library of Congress Classification | تصنيف مكتبة الكونجرس

#### **English:**

**Main Classes:**
- A - General Works
- B - Philosophy, Psychology, Religion
- C-F - History
- G - Geography, Anthropology
- H - Social Sciences
- J - Political Science
- K - Law
- L - Education
- M - Music
- N - Fine Arts
- P - Language & Literature
- Q - Science
- R - Medicine
- S - Agriculture
- T - Technology
- U - Military Science
- V - Naval Science
- Z - Bibliography, Library Science

**Creating LC Call Number:**
```
[Class]  [Class Number]  [Cutter]  [Date]
  BF         121           .M94     2020
```

**Example:**
- Title: "Introduction to Psychology" by Myers (2020)
- Class: BF (Psychology)
- Number: 121 (Physiological psychology)
- Cutter: .M94 (for Myers)
- Date: 2020
- **Full Call Number**: BF121 .M94 2020

#### **العربية:**

**الفئات الرئيسية:**
- A - الأعمال العامة
- B - الفلسفة، علم النفس، الدين
- C-F - التاريخ
- G - الجغرافيا، الأنثروبولوجيا
- H - العلوم الاجتماعية
- J - العلوم السياسية
- K - القانون
- L - التعليم
- M - الموسيقى
- N - الفنون الجميلة
- P - اللغة والأدب
- Q - العلوم
- R - الطب
- S - الزراعة
- T - التكنولوجيا
- U - العلوم العسكرية
- V - العلوم البحرية
- Z - الببليوجرافيا، علوم المكتبات

**إنشاء رقم استدعاء مكتبة الكونجرس:**
```
[الفئة]  [رقم الفئة]  [القاطع]  [التاريخ]
  BF        121        .M94     2020
```

**مثال:**
- العنوان: "مقدمة في علم النفس" لمايرز (2020)
- الفئة: BF (علم النفس)
- الرقم: 121 (علم النفس الفسيولوجي)
- القاطع: .M94 (لمايرز)
- التاريخ: 2020
- **رقم الاستدعاء الكامل**: BF121 .M94 2020

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 9. Subject Headings | رؤوس الموضوعات

### 9.1 Library of Congress Subject Headings | رؤوس موضوعات مكتبة الكونجرس

#### **English:**

**LCSH Format:**
Main Heading--Subdivision--Subdivision

**Types of Subdivisions:**
- **Topical**: --History, --Study and teaching
- **Geographic**: --United States, --France
- **Chronological**: --20th century, --1945-1989
- **Form**: --Bibliography, --Dictionaries

**Examples:**
- Psychology
- Psychology--Textbooks
- Psychology--Study and teaching
- Psychology--United States--History
- World War, 1939-1945
- World War, 1939-1945--France
- American literature--20th century
- English language--Grammar

**Best Practices:**
- Use 2-4 subject headings per item
- Check LCSH authority file
- Use complete, authorized forms
- Include general and specific headings

#### **العربية:**

**تنسيق LCSH:**
الرأس الرئيسي--التقسيم--التقسيم

**أنواع التقسيمات:**
- **موضوعي**: --التاريخ، --الدراسة والتدريس
- **جغرافي**: --الولايات المتحدة، --فرنسا
- **زمني**: --القرن العشرون، --1945-1989
- **الشكل**: --ببليوجرافيا، --قواميس

**أمثلة:**
- علم النفس
- علم النفس--كتب مدرسية
- علم النفس--الدراسة والتدريس
- علم النفس--الولايات المتحدة--التاريخ
- الحرب العالمية، 1939-1945
- الحرب العالمية، 1939-1945--فرنسا
- الأدب الأمريكي--القرن العشرون
- اللغة الإنجليزية--القواعد

**أفضل الممارسات:**
- استخدم 2-4 رؤوس موضوعات لكل عنصر
- تحقق من ملف استناد LCSH
- استخدم الأشكال الكاملة المعتمدة
- ضمّن رؤوساً عامة ومحددة

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 10. Quality Control | ضبط الجودة

### 10.1 Checking Your Work | التحقق من عملك

#### **English:**

**Before Saving, Verify:**
- ✓ Correct spelling (especially names)
- ✓ Complete title (including subtitle)
- ✓ All authors/contributors listed
- ✓ ISBN/ISSN accurate
- ✓ Publication date correct
- ✓ Call number follows local practice
- ✓ Subject headings appropriate
- ✓ Barcode unique and working
- ✓ Item status correct
- ✓ No duplicate records

**Common Errors to Avoid:**
- Typos in names or titles
- Missing subtitles
- Incorrect publication dates
- Wrong call numbers
- Duplicate barcodes
- Missing required fields

#### **العربية:**

**قبل الحفظ، تحقق من:**
- ✓ الإملاء الصحيح (خاصة الأسماء)
- ✓ العنوان الكامل (بما في ذلك العنوان الفرعي)
- ✓ جميع المؤلفين/المساهمين مدرجين
- ✓ ISBN/ISSN دقيق
- ✓ تاريخ النشر صحيح
- ✓ رقم الاستدعاء يتبع الممارسة المحلية
- ✓ رؤوس الموضوعات مناسبة
- ✓ الباركود فريد ويعمل
- ✓ حالة العنصر صحيحة
- ✓ لا توجد سجلات مكررة

**الأخطاء الشائعة التي يجب تجنبها:**
- أخطاء مطبعية في الأسماء أو العناوين
- عناوين فرعية مفقودة
- تواريخ نشر غير صحيحة
- أرقام استدعاء خاطئة
- باركودات مكررة
- حقول مطلوبة مفقودة

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 11. Best Practices | أفضل الممارسات

### 11.1 Consistency is Key | الاتساق هو المفتاح

#### **English:**

✅ **Do:**
- Follow cataloging standards (RDA, AACR2)
- Use authority files
- Check for duplicates first
- Complete all required fields
- Use consistent formatting
- Document local decisions
- Proofread carefully
- Keep cataloging manual handy

❌ **Don't:**
- Guess at information
- Skip required fields
- Create unnecessary duplicates
- Use non-standard forms
- Rush through records

#### **العربية:**

✅ **افعل:**
- اتبع معايير الفهرسة (RDA، AACR2)
- استخدم ملفات الاستناد
- تحقق من التكرارات أولاً
- أكمل جميع الحقول المطلوبة
- استخدم تنسيقاً متسقاً
- وثّق القرارات المحلية
- راجع بعناية
- احتفظ بدليل الفهرسة في متناول اليد

❌ **لا تفعل:**
- التخمين في المعلومات
- تخطّي الحقول المطلوبة
- إنشاء تكرارات غير ضرورية
- استخدام أشكال غير معيارية
- التسرع في السجلات

[Back to Top | العودة للأعلى](#table-of-contents--جدول-المحتويات)

---

## 12. Troubleshooting | حل المشكلات

### 12.1 Common Issues | المشاكل الشائعة

#### **English & Arabic:**

| Problem | المشكلة | Solution | الحل |
|---------|----------|----------|------|
| **Duplicate barcode** | **باركود مكرر** | Check for existing item, use different barcode | تحقق من العنصر الموجود، استخدم باركوداً مختلفاً |
| **Can't find existing record** | **لا يمكن العثور على سجل موجود** | Try different search terms, check spelling | جرّب مصطلحات بحث مختلفة، تحقق من الإملاء |
| **Call number format unclear** | **تنسيق رقم الاستدعاء غير واضح** | Check local guidelines, ask supervisor | تحقق من الإرشادات المحلية، اسأل المشرف |
| **Subject headings needed** | **رؤوس موضوعات مطلوبة** | Consult LCSH authority file | استشر ملف استناد LCSH |
| **Missing required field** | **حقل مطلوب مفقود** | Fill in all required fields before saving | املأ جميع الحقول المطلوبة قبل الحفظ |

---

© 2025 FOLIO Library Management System
All rights reserved | جميع الحقوق محفوظة

**[Back to Top | العودة للأعلى](#cataloger-manual--دليل-المفهرس)**

**End of Cataloger Manual | نهاية دليل المفهرس**
