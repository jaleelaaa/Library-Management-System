# FOLIO LMS Patron Manual | دليل القارئ في نظام فوليو

**Library Patron User Guide | دليل مستخدم القارئ**

---

## Table of Contents | جدول المحتويات

### English | الإنجليزية
1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Catalog Search](#3-catalog-search)
4. [Item Details](#4-item-details)
5. [Personal Account](#5-personal-account)
6. [Holds and Requests](#6-holds-and-requests)
7. [Renewing Items](#7-renewing-items)
8. [Notifications](#8-notifications)
9. [Troubleshooting](#9-troubleshooting)
10. [FAQs](#10-frequently-asked-questions)

### العربية | Arabic
1. [المقدمة](#1-introduction)
2. [البدء](#2-getting-started)
3. [البحث في الفهرس](#3-catalog-search)
4. [تفاصيل المواد](#4-item-details)
5. [الحساب الشخصي](#5-personal-account)
6. [الحجوزات والطلبات](#6-holds-and-requests)
7. [تجديد المواد](#7-renewing-items)
8. [الإشعارات](#8-notifications)
9. [حل المشكلات](#9-troubleshooting)
10. [الأسئلة الشائعة](#10-frequently-asked-questions)

---

## 1. Introduction

### English

Welcome to the FOLIO Library Management System Patron Manual. This guide will help you navigate the library catalog, manage your account, and make the most of library services.

#### What You Can Do

As a library patron, you can:
- **Search** the library catalog
- **Browse** available materials
- **View** item availability and location
- **Access** your personal account information
- **View** checked-out items and due dates
- **Renew** eligible items online
- **View** fines and fees
- **Place** holds on available items

#### System Access

- **URL**: http://localhost:3000
- **Username**: Your library card number or assigned username
- **Password**: Your personal password
- **Support**: Contact your library staff for assistance

### العربية

مرحباً بك في دليل القارئ لنظام إدارة المكتبات فوليو. سيساعدك هذا الدليل في التنقل في فهرس المكتبة، وإدارة حسابك، والاستفادة القصوى من خدمات المكتبة.

#### ما يمكنك القيام به

كقارئ في المكتبة، يمكنك:
- **البحث** في فهرس المكتبة
- **تصفح** المواد المتاحة
- **عرض** توفر المواد وموقعها
- **الوصول** إلى معلومات حسابك الشخصي
- **عرض** المواد المعارة وتواريخ الاستحقاق
- **تجديد** المواد المؤهلة عبر الإنترنت
- **عرض** الغرامات والرسوم
- **وضع** حجوزات على المواد المتاحة

#### الوصول إلى النظام

- **الرابط**: http://localhost:3000
- **اسم المستخدم**: رقم بطاقة المكتبة أو اسم المستخدم المعين
- **كلمة المرور**: كلمة المرور الشخصية
- **الدعم**: اتصل بموظفي المكتبة للمساعدة

---

## 2. Getting Started

### 2.1 First Time Login | تسجيل الدخول لأول مرة

| English | العربية |
|---------|---------|
| **Step 1: Access the System** | **الخطوة 1: الوصول إلى النظام** |
| 1. Open your web browser | 1. افتح متصفح الويب |
| 2. Go to: `http://localhost:3000` | 2. انتقل إلى: `http://localhost:3000` |
| 3. You'll see the login page | 3. سترى صفحة تسجيل الدخول |
| **Step 2: Enter Credentials** | **الخطوة 2: إدخال بيانات الاعتماد** |
| 1. Enter your username (library card number) | 1. أدخل اسم المستخدم (رقم بطاقة المكتبة) |
| 2. Enter your password | 2. أدخل كلمة المرور |
| 3. Click "Sign In" | 3. انقر على "تسجيل الدخول" |
| **Step 3: Change Password (Recommended)** | **الخطوة 3: تغيير كلمة المرور (موصى به)** |
| 1. Click on your profile icon (top-right) | 1. انقر على أيقونة الملف الشخصي (أعلى اليمين) |
| 2. Select "Profile Settings" | 2. اختر "إعدادات الملف الشخصي" |
| 3. Click "Change Password" | 3. انقر على "تغيير كلمة المرور" |
| 4. Enter current and new password | 4. أدخل كلمة المرور الحالية والجديدة |
| 5. Click "Update Password" | 5. انقر على "تحديث كلمة المرور" |

### 2.2 Understanding the Interface | فهم الواجهة

#### Main Navigation | التنقل الرئيسي

| Component | المكون | Description | الوصف |
|-----------|---------|-------------|--------|
| **Home** | **الرئيسية** | Return to main page | العودة إلى الصفحة الرئيسية |
| **Catalog** | **الفهرس** | Search and browse materials | البحث وتصفح المواد |
| **My Account** | **حسابي** | View personal information | عرض المعلومات الشخصية |
| **Profile** | **الملف الشخصي** | Account settings | إعدادات الحساب |
| **Help** | **المساعدة** | Access help resources | الوصول إلى موارد المساعدة |
| **Sign Out** | **تسجيل الخروج** | Log out of system | تسجيل الخروج من النظام |

### 2.3 Language Selection | اختيار اللغة

| English | العربية |
|---------|---------|
| **Changing Interface Language** | **تغيير لغة الواجهة** |
| 1. Click on language selector (top-right) | 1. انقر على محدد اللغة (أعلى اليمين) |
| 2. Choose your preferred language: | 2. اختر لغتك المفضلة: |
|    - English | - الإنجليزية |
|    - العربية (Arabic) | - العربية |
| 3. Interface updates automatically | 3. تتحدث الواجهة تلقائياً |

---

## 3. Catalog Search

### 3.1 Basic Search | البحث الأساسي

| English | العربية |
|---------|---------|
| **Performing a Basic Search** | **إجراء بحث أساسي** |
| 1. Click on "Catalog" in the main menu | 1. انقر على "الفهرس" في القائمة الرئيسية |
| 2. Enter your search term in the search box | 2. أدخل كلمة البحث في مربع البحث |
| 3. Press Enter or click the search icon | 3. اضغط Enter أو انقر على أيقونة البحث |
| 4. View search results | 4. عرض نتائج البحث |

#### Search Tips | نصائح البحث

| English | العربية |
|---------|---------|
| **Keyword Search** | **البحث بالكلمات المفتاحية** |
| - Enter any word from title, author, or subject | - أدخل أي كلمة من العنوان أو المؤلف أو الموضوع |
| - Use quotation marks for exact phrases: "climate change" | - استخدم علامات الاقتباس للعبارات الدقيقة: "تغير المناخ" |
| - Use AND to combine terms: biology AND genetics | - استخدم AND لدمج المصطلحات: biology AND genetics |
| - Use OR for alternatives: Shakespeare OR Marlowe | - استخدم OR للبدائل: شكسبير OR مارلو |
| - Use NOT to exclude: fiction NOT horror | - استخدم NOT للاستبعاد: قصص NOT رعب |

### 3.2 Advanced Search | البحث المتقدم

| English | العربية |
|---------|---------|
| **Accessing Advanced Search** | **الوصول إلى البحث المتقدم** |
| 1. Click "Advanced Search" link | 1. انقر على رابط "البحث المتقدم" |
| 2. Fill in specific search fields | 2. املأ حقول البحث المحددة |
| 3. Apply filters as needed | 3. طبق المرشحات حسب الحاجة |
| 4. Click "Search" | 4. انقر على "بحث" |

#### Advanced Search Fields | حقول البحث المتقدم

| Field | الحقل | Description | الوصف |
|-------|-------|-------------|--------|
| **Title** | **العنوان** | Search by book/item title | البحث بعنوان الكتاب/المادة |
| **Author** | **المؤلف** | Search by author name | البحث باسم المؤلف |
| **Subject** | **الموضوع** | Search by topic or subject heading | البحث بالموضوع أو رأس الموضوع |
| **ISBN** | **ISBN** | Search by ISBN number | البحث برقم ISBN |
| **Publisher** | **الناشر** | Search by publisher name | البحث باسم الناشر |
| **Publication Year** | **سنة النشر** | Search by year or year range | البحث بالسنة أو نطاق السنوات |
| **Language** | **اللغة** | Filter by language | الترشيح حسب اللغة |
| **Format** | **الصيغة** | Filter by material type | الترشيح حسب نوع المادة |

### 3.3 Filtering Results | تصفية النتائج

| English | العربية |
|---------|---------|
| **Available Filters** | **المرشحات المتاحة** |
| After searching, use left sidebar filters: | بعد البحث، استخدم مرشحات الشريط الجانبي الأيسر: |
| **Availability** | **التوفر** |
| - Available now | - متاح الآن |
| - Checked out | - معار |
| - On hold | - محجوز |
| **Material Type** | **نوع المادة** |
| - Books | - كتب |
| - E-books | - كتب إلكترونية |
| - Journals | - دوريات |
| - Audio/Video | - صوتيات/فيديو |
| - Digital Resources | - موارد رقمية |
| **Language** | **اللغة** |
| - English | - الإنجليزية |
| - Arabic | - العربية |
| - Other languages | - لغات أخرى |
| **Publication Date** | **تاريخ النشر** |
| - Last year | - السنة الماضية |
| - Last 5 years | - آخر 5 سنوات |
| - Older | - أقدم |
| **Location** | **الموقع** |
| - Main Library | - المكتبة الرئيسية |
| - Branch Libraries | - المكتبات الفرعية |
| - Special Collections | - المجموعات الخاصة |

### 3.4 Browsing the Catalog | تصفح الفهرس

| English | العربية |
|---------|---------|
| **Browse by Category** | **التصفح حسب الفئة** |
| 1. Click "Browse" in catalog menu | 1. انقر على "تصفح" في قائمة الفهرس |
| 2. Select browse type: | 2. اختر نوع التصفح: |
| **Browse by Author** | **التصفح حسب المؤلف** |
| - Alphabetical list of authors | - قائمة أبجدية بالمؤلفين |
| - Click author name to see all works | - انقر على اسم المؤلف لرؤية جميع الأعمال |
| **Browse by Title** | **التصفح حسب العنوان** |
| - Alphabetical list of titles | - قائمة أبجدية بالعناوين |
| - Click title to view details | - انقر على العنوان لعرض التفاصيل |
| **Browse by Subject** | **التصفح حسب الموضوع** |
| - Subject heading categories | - فئات رؤوس الموضوعات |
| - Click subject to see related materials | - انقر على الموضوع لرؤية المواد ذات الصلة |
| **Browse by Call Number** | **التصفح حسب رقم الاستدعاء** |
| - Browse by Dewey or LC classification | - التصفح حسب تصنيف ديوي أو مكتبة الكونغرس |
| - Find items on virtual shelf | - العثور على المواد على الرف الافتراضي |

---

## 4. Item Details

### 4.1 Viewing Item Information | عرض معلومات المادة

| English | العربية |
|---------|---------|
| **Accessing Item Details** | **الوصول إلى تفاصيل المادة** |
| 1. Click on any item from search results | 1. انقر على أي مادة من نتائج البحث |
| 2. View detailed information page | 2. عرض صفحة المعلومات التفصيلية |

#### Item Information Display | عرض معلومات المادة

| Section | القسم | Information Included | المعلومات المتضمنة |
|---------|-------|---------------------|-------------------|
| **Bibliographic Details** | **التفاصيل الببليوغرافية** | Title, author, publisher, year, ISBN | العنوان، المؤلف، الناشر، السنة، ISBN |
| **Physical Description** | **الوصف المادي** | Pages, dimensions, format | الصفحات، الأبعاد، الصيغة |
| **Subject Headings** | **رؤوس الموضوعات** | Topics and categories | المواضيع والفئات |
| **Summary** | **الملخص** | Brief description of content | وصف موجز للمحتوى |
| **Contents** | **المحتويات** | Table of contents (if available) | جدول المحتويات (إن وجد) |
| **Holdings** | **المقتنيات** | Copy information and location | معلومات النسخة والموقع |
| **Availability** | **التوفر** | Current status of each copy | الحالة الحالية لكل نسخة |

### 4.2 Checking Availability | التحقق من التوفر

| Status | الحالة | Meaning | المعنى | Action | الإجراء |
|--------|--------|---------|--------|--------|---------|
| **Available** | **متاح** | Item is on shelf and ready to borrow | المادة على الرف وجاهزة للاستعارة | Visit library to check out | زر المكتبة للاستعارة |
| **Checked Out** | **معار** | Item is currently borrowed | المادة معارة حالياً | See due date; place hold if desired | راجع تاريخ الاستحقاق؛ ضع حجز إن رغبت |
| **On Hold** | **محجوز** | Item reserved for another patron | المادة محجوزة لقارئ آخر | Join hold queue | انضم إلى قائمة الانتظار |
| **In Transit** | **قيد النقل** | Item being moved between locations | المادة قيد النقل بين المواقع | Wait for arrival | انتظر الوصول |
| **In Processing** | **قيد المعالجة** | Item being prepared for circulation | المادة قيد الإعداد للإعارة | Check back later | راجع لاحقاً |
| **Missing** | **مفقود** | Item cannot be located | لا يمكن تحديد موقع المادة | Ask library staff | استفسر من موظفي المكتبة |
| **On Order** | **قيد الطلب** | Item ordered but not yet received | المادة مطلوبة لكن لم تصل بعد | Check back later | راجع لاحقاً |

### 4.3 Item Location | موقع المادة

| English | العربية |
|---------|---------|
| **Understanding Item Location** | **فهم موقع المادة** |
| Each item displays location information: | كل مادة تعرض معلومات الموقع: |
| **Library Name** | **اسم المكتبة** |
| - Which branch or location | - أي فرع أو موقع |
| **Collection** | **المجموعة** |
| - General Collection | - المجموعة العامة |
| - Reference Collection | - مجموعة المراجع |
| - Reserve Collection | - مجموعة الاحتياط |
| - Special Collections | - المجموعات الخاصة |
| **Call Number** | **رقم الاستدعاء** |
| - Shelf location identifier | - معرف موقع الرف |
| - Use to find item on shelf | - استخدمه للعثور على المادة على الرف |
| **Floor/Section** | **الطابق/القسم** |
| - Specific area in library | - منطقة محددة في المكتبة |

### 4.4 Multiple Copies | نسخ متعددة

| English | العربية |
|---------|---------|
| **When Multiple Copies Exist** | **عندما توجد نسخ متعددة** |
| You may see multiple copies listed: | قد ترى نسخ متعددة مدرجة: |
| 1. Compare availability status | 1. قارن حالة التوفر |
| 2. Check due dates for checked-out copies | 2. راجع تواريخ الاستحقاق للنسخ المعارة |
| 3. Note different locations | 3. لاحظ المواقع المختلفة |
| 4. Choose most convenient copy | 4. اختر النسخة الأنسب |
| 5. Note any usage restrictions | 5. لاحظ أي قيود على الاستخدام |

---

## 5. Personal Account

### 5.1 Accessing Your Account | الوصول إلى حسابك

| English | العربية |
|---------|---------|
| **Opening My Account** | **فتح حسابي** |
| 1. Click "My Account" in main menu | 1. انقر على "حسابي" في القائمة الرئيسية |
| 2. View account dashboard | 2. عرض لوحة معلومات الحساب |

### 5.2 Account Dashboard | لوحة معلومات الحساب

#### Overview Section | قسم النظرة العامة

| Information | المعلومات | Details | التفاصيل |
|-------------|-----------|---------|----------|
| **Items Checked Out** | **المواد المعارة** | Total number currently borrowed | العدد الإجمالي المعار حالياً |
| **Items Due Soon** | **مواد مستحقة قريباً** | Items due within 7 days | مواد مستحقة خلال 7 أيام |
| **Overdue Items** | **مواد متأخرة** | Items past due date | مواد تجاوزت تاريخ الاستحقاق |
| **Active Holds** | **حجوزات نشطة** | Number of requested items | عدد المواد المطلوبة |
| **Ready for Pickup** | **جاهز للاستلام** | Holds available to collect | حجوزات متاحة للجمع |
| **Outstanding Fines** | **غرامات مستحقة** | Total amount owed | المبلغ الإجمالي المستحق |
| **Account Expiration** | **انتهاء صلاحية الحساب** | Library card expiration date | تاريخ انتهاء بطاقة المكتبة |

### 5.3 Checked Out Items | المواد المعارة

| English | العربية |
|---------|---------|
| **Viewing Your Loans** | **عرض إعاراتك** |
| 1. Click "Checked Out Items" tab | 1. انقر على تبويب "المواد المعارة" |
| 2. See list of all borrowed items | 2. شاهد قائمة بجميع المواد المعارة |

#### Loan Information Display | عرض معلومات الإعارة

| Column | العمود | Information | المعلومات |
|--------|--------|-------------|-----------|
| **Title** | **العنوان** | Item title and author | عنوان المادة والمؤلف |
| **Checkout Date** | **تاريخ الإعارة** | When item was borrowed | متى تم استعارة المادة |
| **Due Date** | **تاريخ الاستحقاق** | When item must be returned | متى يجب إرجاع المادة |
| **Renewals** | **التجديدات** | Number of times renewed | عدد مرات التجديد |
| **Status** | **الحالة** | Current loan status | حالة الإعارة الحالية |
| **Actions** | **الإجراءات** | Available actions (Renew, etc.) | الإجراءات المتاحة (تجديد، إلخ) |

#### Loan Status Indicators | مؤشرات حالة الإعارة

| Indicator | المؤشر | Meaning | المعنى |
|-----------|---------|---------|--------|
| **Green** | **أخضر** | On time - due more than 7 days | في الوقت المحدد - مستحق بعد أكثر من 7 أيام |
| **Yellow** | **أصفر** | Due soon - within 7 days | مستحق قريباً - خلال 7 أيام |
| **Red** | **أحمر** | Overdue - past due date | متأخر - تجاوز تاريخ الاستحقاق |

### 5.4 Loan History | سجل الإعارات

| English | العربية |
|---------|---------|
| **Viewing Past Loans** | **عرض الإعارات السابقة** |
| 1. Click "Loan History" tab | 1. انقر على تبويب "سجل الإعارات" |
| 2. See previously borrowed items | 2. شاهد المواد المعارة سابقاً |
| 3. Filter by date range | 3. قم بالترشيح حسب نطاق التاريخ |
| 4. Search within history | 4. ابحث ضمن السجل |

### 5.5 Profile Information | معلومات الملف الشخصي

| English | العربية |
|---------|---------|
| **Viewing Personal Information** | **عرض المعلومات الشخصية** |
| 1. Click "Profile" tab | 1. انقر على تبويب "الملف الشخصي" |
| 2. Review your information: | 2. راجع معلوماتك: |
| - Full name | - الاسم الكامل |
| - Library card number | - رقم بطاقة المكتبة |
| - Email address | - عنوان البريد الإلكتروني |
| - Phone number | - رقم الهاتف |
| - Address | - العنوان |
| - Account status | - حالة الحساب |
| - Member since date | - عضو منذ تاريخ |
| - Expiration date | - تاريخ الانتهاء |

#### Updating Contact Information | تحديث معلومات الاتصال

| English | العربية |
|---------|---------|
| **Editable Information** | **المعلومات القابلة للتعديل** |
| You can update: | يمكنك تحديث: |
| - Email address | - عنوان البريد الإلكتروني |
| - Phone number | - رقم الهاتف |
| - Password | - كلمة المرور |
| **Steps to Update** | **خطوات التحديث** |
| 1. Click "Edit" next to field | 1. انقر على "تعديل" بجوار الحقل |
| 2. Enter new information | 2. أدخل المعلومات الجديدة |
| 3. Click "Save Changes" | 3. انقر على "حفظ التغييرات" |
| 4. Verify confirmation message | 4. تحقق من رسالة التأكيد |

**Note | ملاحظة**: For name or address changes, contact library staff | لتغيير الاسم أو العنوان، اتصل بموظفي المكتبة

---

## 6. Holds and Requests

### 6.1 Placing a Hold | وضع حجز

| English | العربية |
|---------|---------|
| **What is a Hold?** | **ما هو الحجز؟** |
| A hold allows you to reserve an item that is: | الحجز يتيح لك حجز مادة: |
| - Currently checked out to another patron | - معارة حالياً لقارئ آخر |
| - Located at another branch | - موجودة في فرع آخر |
| - Soon to be available | - ستتاح قريباً |

#### How to Place a Hold | كيفية وضع حجز

| English | العربية |
|---------|---------|
| **Step-by-Step Process** | **العملية خطوة بخطوة** |
| 1. Find the item in catalog search | 1. ابحث عن المادة في البحث بالفهرس |
| 2. Click on item to view details | 2. انقر على المادة لعرض التفاصيل |
| 3. Click "Place Hold" button | 3. انقر على زر "وضع حجز" |
| 4. Confirm hold request | 4. أكد طلب الحجز |
| 5. Receive confirmation message | 5. استلم رسالة تأكيد |

#### Hold Options | خيارات الحجز

| Option | الخيار | Description | الوصف |
|--------|--------|-------------|--------|
| **Pickup Location** | **موقع الاستلام** | Choose which library to collect item | اختر أي مكتبة لجمع المادة |
| **Hold Type** | **نوع الحجز** | Item-level or title-level hold | حجز على مستوى المادة أو العنوان |
| **Not Needed After** | **غير مطلوب بعد** | Automatic cancellation date (optional) | تاريخ الإلغاء التلقائي (اختياري) |

### 6.2 Managing Your Holds | إدارة حجوزاتك

| English | العربية |
|---------|---------|
| **Viewing Active Holds** | **عرض الحجوزات النشطة** |
| 1. Go to "My Account" | 1. انتقل إلى "حسابي" |
| 2. Click "Holds" tab | 2. انقر على تبويب "الحجوزات" |
| 3. View list of all holds | 3. عرض قائمة بجميع الحجوزات |

#### Hold Status Types | أنواع حالة الحجز

| Status | الحالة | Meaning | المعنى | Your Action | إجراؤك |
|--------|--------|---------|--------|-------------|---------|
| **Pending** | **قيد الانتظار** | Waiting in queue | في قائمة الانتظار | Wait for notification | انتظر الإشعار |
| **In Transit** | **قيد النقل** | Being delivered to your pickup location | قيد التوصيل إلى موقع الاستلام | Wait for arrival | انتظر الوصول |
| **Ready for Pickup** | **جاهز للاستلام** | Available at pickup location | متاح في موقع الاستلام | Visit library within hold period | زر المكتبة خلال فترة الحجز |
| **Expired** | **منتهي** | Not picked up in time | لم يتم الاستلام في الوقت المحدد | Request again if still needed | اطلب مرة أخرى إن كان لا يزال مطلوباً |

### 6.3 Cancelling a Hold | إلغاء حجز

| English | العربية |
|---------|---------|
| **How to Cancel** | **كيفية الإلغاء** |
| 1. Go to "My Account" → "Holds" | 1. انتقل إلى "حسابي" ← "الحجوزات" |
| 2. Find the hold to cancel | 2. ابحث عن الحجز المراد إلغاؤه |
| 3. Click "Cancel Hold" button | 3. انقر على زر "إلغاء الحجز" |
| 4. Confirm cancellation | 4. أكد الإلغاء |
| 5. Hold is removed from queue | 5. يتم إزالة الحجز من قائمة الانتظار |

**Note | ملاحظة**: You cannot cancel holds that are "Ready for Pickup" online. Contact library staff. | لا يمكنك إلغاء الحجوزات "الجاهزة للاستلام" عبر الإنترنت. اتصل بموظفي المكتبة.

### 6.4 Picking Up Holds | استلام الحجوزات

| English | العربية |
|---------|---------|
| **When Your Hold is Ready** | **عندما يكون حجزك جاهزاً** |
| 1. You'll receive notification via: | 1. ستتلقى إشعاراً عبر: |
|    - Email | - البريد الإلكتروني |
|    - Text message (if enabled) | - رسالة نصية (إذا كانت مفعلة) |
|    - In-app notification | - إشعار في التطبيق |
| 2. Note the pickup location | 2. لاحظ موقع الاستلام |
| 3. Note the hold expiration date | 3. لاحظ تاريخ انتهاء الحجز |
| **At the Library** | **في المكتبة** |
| 1. Go to circulation desk | 1. اذهب إلى مكتب الإعارة |
| 2. Provide library card or ID | 2. قدم بطاقة المكتبة أو الهوية |
| 3. Collect your item | 3. استلم مادتك |
| 4. Check due date | 4. راجع تاريخ الاستحقاق |

#### Hold Shelf Period | فترة رف الحجز

| English | العربية |
|---------|---------|
| Standard hold shelf period: **7 days** | فترة رف الحجز القياسية: **7 أيام** |
| If not picked up within this time: | إذا لم يتم الاستلام خلال هذا الوقت: |
| - Hold expires automatically | - ينتهي الحجز تلقائياً |
| - Item returns to circulation | - تعود المادة للإعارة |
| - You can place hold again if needed | - يمكنك وضع حجز مرة أخرى إذا لزم الأمر |

---

## 7. Renewing Items

### 7.1 Understanding Renewals | فهم التجديدات

| English | العربية |
|---------|---------|
| **What is a Renewal?** | **ما هو التجديد؟** |
| Extending the loan period for an item you already have | تمديد فترة الإعارة لمادة لديك بالفعل |
| **Benefits** | **الفوائد** |
| - Keep items longer without returning | - احتفظ بالمواد لفترة أطول دون إرجاعها |
| - Avoid overdue fines | - تجنب غرامات التأخير |
| - Convenient online process | - عملية سهلة عبر الإنترنت |

### 7.2 Renewal Eligibility | أهلية التجديد

| Condition | الشرط | Can Renew? | يمكن التجديد؟ |
|-----------|--------|------------|---------------|
| **Item has no holds** | **المادة ليس عليها حجوزات** | ✅ Yes | ✅ نعم |
| **Not yet renewed maximum times** | **لم يتم التجديد أقصى عدد من المرات** | ✅ Yes | ✅ نعم |
| **Not overdue** | **غير متأخرة** | ✅ Yes | ✅ نعم |
| **Item has active hold** | **المادة عليها حجز نشط** | ❌ No | ❌ لا |
| **Maximum renewals reached** | **تم الوصول إلى الحد الأقصى للتجديدات** | ❌ No | ❌ لا |
| **Overdue more than 30 days** | **متأخر أكثر من 30 يوماً** | ❌ No | ❌ لا |
| **Outstanding fines exceed limit** | **الغرامات المستحقة تتجاوز الحد** | ❌ No | ❌ لا |

### 7.3 How to Renew Items | كيفية تجديد المواد

#### Online Renewal | التجديد عبر الإنترنت

| English | العربية |
|---------|---------|
| **Renewing Individual Items** | **تجديد المواد الفردية** |
| 1. Log in to your account | 1. سجل الدخول إلى حسابك |
| 2. Go to "My Account" → "Checked Out Items" | 2. انتقل إلى "حسابي" ← "المواد المعارة" |
| 3. Find item to renew | 3. ابحث عن المادة المراد تجديدها |
| 4. Click "Renew" button | 4. انقر على زر "تجديد" |
| 5. Confirm renewal | 5. أكد التجديد |
| 6. Note new due date | 6. لاحظ تاريخ الاستحقاق الجديد |
| **Renewing All Items** | **تجديد جميع المواد** |
| 1. Go to "Checked Out Items" | 1. انتقل إلى "المواد المعارة" |
| 2. Click "Renew All" button (top-right) | 2. انقر على زر "تجديد الكل" (أعلى اليمين) |
| 3. System renews all eligible items | 3. يجدد النظام جميع المواد المؤهلة |
| 4. Review renewal results | 4. راجع نتائج التجديد |
| 5. Note any items that couldn't be renewed | 5. لاحظ أي مواد لم يمكن تجديدها |

#### Renewal Results | نتائج التجديد

| Result | النتيجة | Message | الرسالة | Action | الإجراء |
|--------|---------|---------|---------|--------|---------|
| **Success** | **نجح** | "Item renewed successfully" | "تم تجديد المادة بنجاح" | Note new due date | لاحظ تاريخ الاستحقاق الجديد |
| **Has Holds** | **عليها حجوزات** | "Cannot renew - item has holds" | "لا يمكن التجديد - المادة عليها حجوزات" | Return by due date | أرجعها بحلول تاريخ الاستحقاق |
| **Max Renewals** | **حد التجديدات الأقصى** | "Maximum renewals reached" | "تم الوصول إلى الحد الأقصى للتجديدات" | Return by due date | أرجعها بحلول تاريخ الاستحقاق |
| **Overdue** | **متأخر** | "Cannot renew - item is overdue" | "لا يمكن التجديد - المادة متأخرة" | Return immediately | أرجعها فوراً |

### 7.4 Renewal Limits | حدود التجديد

| Item Type | نوع المادة | Max Renewals | الحد الأقصى للتجديدات | Loan Period | فترة الإعارة |
|-----------|-----------|--------------|----------------------|-------------|--------------|
| **Regular Books** | **الكتب العادية** | 3 times | 3 مرات | 21 days each | 21 يوماً لكل مرة |
| **New Books** | **الكتب الجديدة** | 1 time | مرة واحدة | 14 days each | 14 يوماً لكل مرة |
| **Reference Books** | **كتب المراجع** | No renewals | لا تجديدات | 7 days | 7 أيام |
| **Audiovisual** | **صوتيات ومرئيات** | 2 times | مرتان | 7 days each | 7 أيام لكل مرة |
| **Periodicals** | **دوريات** | 1 time | مرة واحدة | 7 days each | 7 أيام لكل مرة |

### 7.5 Automatic Renewal | التجديد التلقائي

| English | العربية |
|---------|---------|
| **Enabling Automatic Renewal** | **تفعيل التجديد التلقائي** |
| (If available at your library) | (إذا كان متاحاً في مكتبتك) |
| 1. Go to "Profile Settings" | 1. انتقل إلى "إعدادات الملف الشخصي" |
| 2. Find "Auto-Renewal" option | 2. ابحث عن خيار "التجديد التلقائي" |
| 3. Enable auto-renewal | 3. فعّل التجديد التلقائي |
| 4. System attempts renewal 2 days before due date | 4. يحاول النظام التجديد قبل يومين من الاستحقاق |
| 5. You receive email confirmation | 5. تتلقى تأكيداً بالبريد الإلكتروني |
| **Important Notes** | **ملاحظات مهمة** |
| - Auto-renewal is not guaranteed | - التجديد التلقائي غير مضمون |
| - Items with holds cannot auto-renew | - المواد عليها حجوزات لا يمكن تجديدها تلقائياً |
| - Check your account regularly | - راجع حسابك بانتظام |

---

## 8. Notifications

### 8.1 Notification Types | أنواع الإشعارات

| Notification | الإشعار | When You Receive It | متى تستلمه |
|--------------|---------|---------------------|-----------|
| **Checkout Confirmation** | **تأكيد الإعارة** | When item is checked out | عند إعارة المادة |
| **Due Date Reminder** | **تذكير بتاريخ الاستحقاق** | 3 days before item is due | قبل 3 أيام من استحقاق المادة |
| **Overdue Notice** | **إشعار بالتأخير** | When item becomes overdue | عندما تصبح المادة متأخرة |
| **Hold Available** | **حجز متاح** | When your hold is ready for pickup | عندما يكون حجزك جاهزاً للاستلام |
| **Hold Expiring Soon** | **حجز ينتهي قريباً** | 2 days before hold expires | قبل يومين من انتهاء الحجز |
| **Fine Notice** | **إشعار بالغرامة** | When fines are assessed | عند فرض الغرامات |
| **Account Expiration** | **انتهاء صلاحية الحساب** | 30 days before card expires | قبل 30 يوماً من انتهاء البطاقة |
| **Renewal Confirmation** | **تأكيد التجديد** | When item is renewed | عند تجديد المادة |

### 8.2 Notification Preferences | تفضيلات الإشعارات

| English | العربية |
|---------|---------|
| **Setting Your Preferences** | **تحديد تفضيلاتك** |
| 1. Go to "Profile Settings" | 1. انتقل إلى "إعدادات الملف الشخصي" |
| 2. Click "Notifications" tab | 2. انقر على تبويب "الإشعارات" |
| 3. Choose notification methods | 3. اختر طرق الإشعار |
| 4. Save changes | 4. احفظ التغييرات |

#### Notification Methods | طرق الإشعار

| Method | الطريقة | Requirements | المتطلبات | Advantages | المزايا |
|--------|---------|--------------|-----------|------------|----------|
| **Email** | **البريد الإلكتروني** | Valid email address | عنوان بريد إلكتروني صالح | Detailed information | معلومات مفصلة |
| **SMS** | **رسالة نصية** | Mobile phone number | رقم هاتف محمول | Instant delivery | توصيل فوري |
| **In-App** | **داخل التطبيق** | None (automatic) | لا شيء (تلقائي) | Always available | متاح دائماً |
| **Phone Call** | **مكالمة هاتفية** | Phone number | رقم هاتف | Personal reminder | تذكير شخصي |

### 8.3 Managing Notifications | إدارة الإشعارات

| English | العربية |
|---------|---------|
| **Customizing Notifications** | **تخصيص الإشعارات** |
| For each notification type, you can: | لكل نوع إشعار، يمكنك: |
| 1. Enable or disable | 1. تفعيل أو تعطيل |
| 2. Choose delivery method | 2. اختيار طريقة التوصيل |
| 3. Set timing preferences | 3. تحديد تفضيلات التوقيت |

#### Recommended Settings | الإعدادات الموصى بها

| Notification Type | نوع الإشعار | Recommended Method | الطريقة الموصى بها | Why | لماذا |
|-------------------|------------|-------------------|-------------------|-----|------|
| **Due Date Reminders** | **تذكيرات تاريخ الاستحقاق** | Email + SMS | بريد إلكتروني + رسالة نصية | Ensure you don't miss it | لضمان عدم تفويته |
| **Hold Available** | **حجز متاح** | SMS + In-App | رسالة نصية + داخل التطبيق | Quick notification | إشعار سريع |
| **Overdue Notices** | **إشعارات التأخير** | Email | بريد إلكتروني | Detailed information | معلومات مفصلة |
| **Fine Notices** | **إشعارات الغرامات** | Email | بريد إلكتروني | Record keeping | حفظ السجلات |

### 8.4 Viewing Past Notifications | عرض الإشعارات السابقة

| English | العربية |
|---------|---------|
| **Accessing Notification History** | **الوصول إلى سجل الإشعارات** |
| 1. Go to "My Account" | 1. انتقل إلى "حسابي" |
| 2. Click "Notifications" tab | 2. انقر على تبويب "الإشعارات" |
| 3. View chronological list | 3. عرض القائمة الزمنية |
| 4. Filter by type or date | 4. قم بالترشيح حسب النوع أو التاريخ |
| 5. Mark as read/unread | 5. ضع علامة كمقروء/غير مقروء |

---

## 9. Troubleshooting

### 9.1 Login Issues | مشاكل تسجيل الدخول

| Problem | المشكلة | Solution | الحل |
|---------|---------|----------|------|
| **Forgot Password** | **نسيت كلمة المرور** | 1. Click "Forgot Password?" on login page<br>2. Enter your email or library card number<br>3. Check email for reset link<br>4. Create new password | 1. انقر على "نسيت كلمة المرور؟" في صفحة تسجيل الدخول<br>2. أدخل بريدك الإلكتروني أو رقم بطاقة المكتبة<br>3. راجع البريد الإلكتروني للحصول على رابط إعادة التعيين<br>4. أنشئ كلمة مرور جديدة |
| **Account Locked** | **الحساب مقفل** | After 5 failed login attempts, account locks for 30 minutes. Wait or contact library staff. | بعد 5 محاولات فاشلة، يُقفل الحساب لمدة 30 دقيقة. انتظر أو اتصل بموظفي المكتبة. |
| **Invalid Credentials** | **بيانات اعتماد غير صالحة** | Double-check username and password. Ensure Caps Lock is off. | راجع اسم المستخدم وكلمة المرور. تأكد من إيقاف Caps Lock. |
| **Account Expired** | **انتهت صلاحية الحساب** | Library card expired. Visit library to renew membership. | انتهت صلاحية بطاقة المكتبة. زر المكتبة لتجديد العضوية. |

### 9.2 Search Issues | مشاكل البحث

| Problem | المشكلة | Solution | الحل |
|---------|---------|----------|------|
| **No Results Found** | **لم يتم العثور على نتائج** | - Check spelling<br>- Try fewer or different keywords<br>- Use broader search terms<br>- Try Advanced Search | - راجع الإملاء<br>- جرب كلمات مفتاحية أقل أو مختلفة<br>- استخدم مصطلحات بحث أوسع<br>- جرب البحث المتقدم |
| **Too Many Results** | **نتائج كثيرة جداً** | - Use quotation marks for exact phrases<br>- Apply filters<br>- Add more specific keywords<br>- Use Advanced Search with multiple fields | - استخدم علامات الاقتباس للعبارات الدقيقة<br>- طبق المرشحات<br>- أضف كلمات مفتاحية أكثر تحديداً<br>- استخدم البحث المتقدم بحقول متعددة |
| **Wrong Results** | **نتائج خاطئة** | - Review search syntax<br>- Check filters applied<br>- Try different search fields in Advanced Search | - راجع صيغة البحث<br>- راجع المرشحات المطبقة<br>- جرب حقول بحث مختلفة في البحث المتقدم |

### 9.3 Renewal Issues | مشاكل التجديد

| Problem | المشكلة | Solution | الحل |
|---------|---------|----------|------|
| **Cannot Renew - Has Holds** | **لا يمكن التجديد - عليها حجوزات** | Another patron has requested the item. Return by due date. | قارئ آخر طلب المادة. أرجعها بحلول تاريخ الاستحقاق. |
| **Maximum Renewals Reached** | **تم الوصول إلى الحد الأقصى للتجديدات** | You've renewed this item the maximum number of times. Return it and check out again if available. | جددت هذه المادة العدد الأقصى من المرات. أرجعها واستعرها مرة أخرى إن كانت متاحة. |
| **Renewal Button Greyed Out** | **زر التجديد معطل** | Item may be overdue, have holds, or maximum renewals reached. Check item status. | قد تكون المادة متأخرة، أو عليها حجوزات، أو وصلت للحد الأقصى من التجديدات. راجع حالة المادة. |
| **Outstanding Fines** | **غرامات مستحقة** | Pay outstanding fines to enable renewals. | ادفع الغرامات المستحقة لتفعيل التجديدات. |

### 9.4 Hold Issues | مشاكل الحجوزات

| Problem | المشكلة | Solution | الحل |
|---------|---------|----------|------|
| **Cannot Place Hold** | **لا يمكن وضع حجز** | - Check if you already have this item checked out<br>- Verify account is in good standing<br>- Check if item is holdable (some reference items aren't) | - تحقق إذا كانت المادة معارة لك بالفعل<br>- تحقق من أن الحساب في حالة جيدة<br>- تحقق إذا كانت المادة قابلة للحجز (بعض مواد المراجع ليست كذلك) |
| **Hold Taking Too Long** | **الحجز يستغرق وقتاً طويلاً** | Check your position in hold queue. Popular items may take weeks. Consider alternative copies or similar titles. | راجع موقعك في قائمة انتظار الحجز. المواد الشعبية قد تستغرق أسابيع. فكر في نسخ بديلة أو عناوين مشابهة. |
| **Missed Pickup Window** | **فاتت نافذة الاستلام** | Hold expired after 7 days. Place hold again if still needed. | انتهى الحجز بعد 7 أيام. ضع حجزاً مرة أخرى إن كان لا يزال مطلوباً. |
| **Hold Cancelled by Library** | **ألغت المكتبة الحجز** | Item may be damaged, lost, or removed. Contact library for alternatives. | قد تكون المادة تالفة، أو مفقودة، أو تمت إزالتها. اتصل بالمكتبة للبدائل. |

### 9.5 Technical Issues | المشاكل التقنية

| Problem | المشكلة | Solution | الحل |
|---------|---------|----------|------|
| **Page Not Loading** | **الصفحة لا تحمّل** | - Refresh page (F5 or Ctrl+R)<br>- Clear browser cache<br>- Try different browser<br>- Check internet connection | - حدّث الصفحة (F5 أو Ctrl+R)<br>- امسح ذاكرة التخزين المؤقت للمتصفح<br>- جرب متصفحاً مختلفاً<br>- راجع اتصال الإنترنت |
| **Session Timeout** | **انتهت مهلة الجلسة** | For security, sessions expire after 30 minutes of inactivity. Log in again. | للأمان، تنتهي الجلسات بعد 30 دقيقة من عدم النشاط. سجل الدخول مرة أخرى. |
| **Features Not Working** | **الميزات لا تعمل** | - Ensure JavaScript is enabled<br>- Update your browser<br>- Disable browser extensions temporarily<br>- Try incognito/private mode | - تأكد من تفعيل JavaScript<br>- حدّث متصفحك<br>- عطّل امتدادات المتصفح مؤقتاً<br>- جرب وضع التصفح المتخفي/الخاص |
| **Error Messages** | **رسائل الخطأ** | Take screenshot of error message and contact library IT support. | التقط لقطة شاشة لرسالة الخطأ واتصل بدعم تكنولوجيا المعلومات بالمكتبة. |

### 9.6 Account Issues | مشاكل الحساب

| Problem | المشكلة | Solution | الحل |
|---------|---------|----------|------|
| **Wrong Personal Information** | **معلومات شخصية خاطئة** | Contact library circulation desk to update name, address, or date of birth. | اتصل بمكتب الإعارة في المكتبة لتحديث الاسم، أو العنوان، أو تاريخ الميلاد. |
| **Can't Update Email** | **لا يمكن تحديث البريد الإلكتروني** | Ensure email format is correct. If error persists, contact library. | تأكد من صحة صيغة البريد الإلكتروني. إذا استمر الخطأ، اتصل بالمكتبة. |
| **Not Receiving Notifications** | **لا تستلم الإشعارات** | - Check spam/junk folder<br>- Verify email address is correct<br>- Check notification preferences<br>- Ensure notification methods are enabled | - راجع مجلد البريد العشوائي<br>- تحقق من صحة عنوان البريد الإلكتروني<br>- راجع تفضيلات الإشعارات<br>- تأكد من تفعيل طرق الإشعار |
| **Fines Dispute** | **نزاع حول الغرامات** | Contact circulation desk with details. Bring receipt if you returned item on time. | اتصل بمكتب الإعارة مع التفاصيل. أحضر الإيصال إذا أرجعت المادة في الوقت المحدد. |

---

## 10. Frequently Asked Questions

### 10.1 Account & Registration | الحساب والتسجيل

| Question | السؤال | Answer | الإجابة |
|----------|---------|--------|---------|
| **How do I get a library card?** | **كيف أحصل على بطاقة مكتبة؟** | Visit your local library branch with photo ID and proof of address. Fill out registration form. Card is issued immediately. | زر فرع المكتبة المحلي مع هوية مصورة وإثبات عنوان. املأ نموذج التسجيل. تُصدر البطاقة فوراً. |
| **Is there a fee for library card?** | **هل هناك رسوم لبطاقة المكتبة؟** | Library cards are free for residents. Non-residents may have annual fee (check with your library). | بطاقات المكتبة مجانية للمقيمين. قد يكون لغير المقيمين رسم سنوي (استفسر من مكتبتك). |
| **How long is my card valid?** | **إلى متى تكون بطاقتي صالحة؟** | Library cards typically expire after 1-3 years depending on library policy. Renewal is free. | عادة تنتهي صلاحية بطاقات المكتبة بعد 1-3 سنوات حسب سياسة المكتبة. التجديد مجاني. |
| **Can I have multiple accounts?** | **هل يمكنني الحصول على حسابات متعددة؟** | No. Each person is allowed one library account. Family members need individual cards. | لا. مسموح لكل شخص بحساب مكتبة واحد. أفراد الأسرة يحتاجون بطاقات فردية. |

### 10.2 Borrowing & Returns | الاستعارة والإرجاع

| Question | السؤال | Answer | الإجابة |
|----------|---------|--------|---------|
| **How many items can I borrow?** | **كم عدد المواد التي يمكنني استعارتها؟** | Standard limit is 10 items per patron. Some libraries have higher limits for certain material types. | الحد القياسي هو 10 مواد لكل قارئ. بعض المكتبات لديها حدود أعلى لأنواع معينة من المواد. |
| **How long can I keep items?** | **إلى متى يمكنني الاحتفاظ بالمواد؟** | Standard loan: 21 days. New books: 14 days. Audiovisual: 7 days. Reference: 7 days or in-library only. | الإعارة القياسية: 21 يوماً. الكتب الجديدة: 14 يوماً. صوتيات ومرئيات: 7 أيام. مراجع: 7 أيام أو داخل المكتبة فقط. |
| **Where can I return items?** | **أين يمكنني إرجاع المواد؟** | Any library branch, regardless of where you borrowed it. Use book drops available 24/7. | أي فرع مكتبة، بغض النظر عن مكان استعارتها. استخدم صناديق الإرجاع المتاحة على مدار الساعة. |
| **What if I return late?** | **ماذا لو أرجعت متأخراً؟** | Overdue fines apply: $0.25/day for books, $1/day for audiovisual. Maximum fine per item varies. | تُطبق غرامات التأخير: 0.25 دولار/يوم للكتب، دولار واحد/يوم للصوتيات والمرئيات. الغرامة القصوى لكل مادة تختلف. |

### 10.3 Holds & Requests | الحجوزات والطلبات

| Question | السؤال | Answer | الإجابة |
|----------|---------|--------|---------|
| **How many holds can I have?** | **كم عدد الحجوزات التي يمكنني الحصول عليها؟** | Standard limit is 10 active holds per account. | الحد القياسي هو 10 حجوزات نشطة لكل حساب. |
| **How long do I wait for holds?** | **كم أنتظر للحجوزات؟** | Depends on item popularity and number of copies. Can range from few days to several weeks. | يعتمد على شعبية المادة وعدد النسخ. يمكن أن يتراوح من أيام قليلة إلى عدة أسابيع. |
| **Can I see my position in queue?** | **هل يمكنني رؤية موقعي في قائمة الانتظار؟** | Yes. Go to "My Account" → "Holds". Your position is shown for each hold. | نعم. انتقل إلى "حسابي" ← "الحجوزات". يظهر موقعك لكل حجز. |
| **Can I change pickup location?** | **هل يمكنني تغيير موقع الاستلام؟** | Yes, before item is in transit. Go to hold details and select "Change Pickup Location". | نعم، قبل أن تكون المادة قيد النقل. انتقل إلى تفاصيل الحجز واختر "تغيير موقع الاستلام". |

### 10.4 Fines & Fees | الغرامات والرسوم

| Question | السؤال | Answer | الإجابة |
|----------|---------|--------|---------|
| **How do I pay fines?** | **كيف أدفع الغرامات؟** | - In person at circulation desk (cash or card)<br>- Online through patron account (credit/debit card)<br>- Mail check to library | - شخصياً في مكتب الإعارة (نقداً أو بالبطاقة)<br>- عبر الإنترنت من خلال حساب القارئ (بطاقة ائتمان/خصم)<br>- أرسل شيكاً بالبريد إلى المكتبة |
| **What if I lost an item?** | **ماذا لو فقدت مادة؟** | You'll be charged replacement cost plus processing fee. If you find it later within 6 months, bring it in for refund (minus overdue fines). | ستُحاسب بتكلفة الاستبدال بالإضافة إلى رسوم المعالجة. إذا وجدتها لاحقاً خلال 6 أشهر، أحضرها لاسترداد الأموال (ناقص غرامات التأخير). |
| **What if item was damaged?** | **ماذا لو كانت المادة تالفة؟** | Report damage when returning. Charges depend on severity. Minor wear is normal and not charged. | أبلغ عن التلف عند الإرجاع. الرسوم تعتمد على الشدة. الاهتراء البسيط عادي ولا يُحاسب عليه. |
| **Is there a fine limit?** | **هل يوجد حد للغرامات؟** | Overdue fines cap at replacement cost of item. Total account may be blocked if fines exceed $25. | غرامات التأخير تصل إلى سقف تكلفة استبدال المادة. قد يُحظر الحساب الإجمالي إذا تجاوزت الغرامات 25 دولاراً. |

### 10.5 Digital Resources | الموارد الرقمية

| Question | السؤال | Answer | الإجابة |
|----------|---------|--------|---------|
| **Can I borrow e-books?** | **هل يمكنني استعارة كتب إلكترونية؟** | Yes, if your library offers e-book service. Access through library website or mobile app. | نعم، إذا كانت مكتبتك تقدم خدمة الكتب الإلكترونية. الوصول من خلال موقع المكتبة أو تطبيق الهاتف المحمول. |
| **Do e-books have due dates?** | **هل للكتب الإلكترونية تواريخ استحقاق؟** | Yes. E-books auto-return on due date, so no overdue fines. Loan period typically 7-21 days. | نعم. الكتب الإلكترونية تُرجع تلقائياً في تاريخ الاستحقاق، لذا لا غرامات تأخير. فترة الإعارة عادة 7-21 يوماً. |
| **Can I access databases from home?** | **هل يمكنني الوصول إلى قواعد البيانات من المنزل؟** | Yes, with valid library card. Log in through library website to access subscription databases. | نعم، ببطاقة مكتبة صالحة. سجل الدخول من خلال موقع المكتبة للوصول إلى قواعد البيانات بالاشتراك. |
| **What devices can I use?** | **ما الأجهزة التي يمكنني استخدامها؟** | E-books and digital resources work on computers, tablets, smartphones, and e-readers (check compatibility). | الكتب الإلكترونية والموارد الرقمية تعمل على أجهزة الكمبيوتر، والأجهزة اللوحية، والهواتف الذكية، وقارئات الكتب الإلكترونية (راجع التوافق). |

### 10.6 Services | الخدمات

| Question | السؤال | Answer | الإجابة |
|----------|---------|--------|---------|
| **Can library staff help with research?** | **هل يمكن لموظفي المكتبة المساعدة في البحث؟** | Yes. Librarians provide research assistance, database training, and reference help. Schedule appointment or ask at reference desk. | نعم. يقدم أمناء المكتبات المساعدة في البحث، والتدريب على قواعد البيانات، ومساعدة المراجع. حدد موعداً أو اسأل في مكتب المراجع. |
| **Are there study rooms?** | **هل توجد غرف دراسة؟** | Most libraries have study rooms. Reserve online or at circulation desk. Free for library card holders. | معظم المكتبات لديها غرف دراسة. احجز عبر الإنترنت أو في مكتب الإعارة. مجاناً لحاملي بطاقات المكتبة. |
| **Can I print/copy/scan?** | **هل يمكنني الطباعة/النسخ/المسح؟** | Yes. Self-service stations available. Small fee per page (typically $0.10/page B&W, $0.25/page color). | نعم. محطات الخدمة الذاتية متاحة. رسم صغير للصفحة (عادة 0.10 دولار/صفحة أبيض وأسود، 0.25 دولار/صفحة ملونة). |
| **Does library have WiFi?** | **هل توجد شبكة WiFi في المكتبة؟** | Yes. Free WiFi available to all visitors. Network name and password posted in library. | نعم. شبكة WiFi مجانية متاحة لجميع الزوار. اسم الشبكة وكلمة المرور معلنة في المكتبة. |

### 10.7 Privacy & Security | الخصوصية والأمان

| Question | السؤال | Answer | الإجابة |
|----------|---------|--------|---------|
| **Is my borrowing history private?** | **هل سجل استعارتي خاص؟** | Yes. Library protects patron privacy. Borrowing records are confidential and only accessible to you. | نعم. تحمي المكتبة خصوصية القراء. سجلات الاستعارة سرية ويمكنك فقط الوصول إليها. |
| **Can someone else access my account?** | **هل يمكن لشخص آخر الوصول إلى حسابي؟** | No, unless you share your password. Keep your password secure. Library staff never ask for passwords. | لا، إلا إذا شاركت كلمة مرورك. احتفظ بكلمة مرورك آمنة. موظفو المكتبة لا يطلبون كلمات المرور أبداً. |
| **How is my data used?** | **كيف تُستخدم بياناتي؟** | Only for library services. Data is not sold or shared with third parties. See library privacy policy for details. | فقط لخدمات المكتبة. البيانات لا تُباع أو تُشارك مع أطراف ثالثة. راجع سياسة خصوصية المكتبة للتفاصيل. |
| **Can I delete my account data?** | **هل يمكنني حذف بيانات حسابي؟** | You can opt out of loan history retention. Contact library to discuss data deletion options. | يمكنك إلغاء الاشتراك في الاحتفاظ بسجل الإعارة. اتصل بالمكتبة لمناقشة خيارات حذف البيانات. |

---

## 11. Tips for Best Experience

### 11.1 Getting the Most from Library Services | الاستفادة القصوى من خدمات المكتبة

| English | العربية |
|---------|---------|
| **Plan Ahead** | **خطط مسبقاً** |
| - Place holds on popular items early | - ضع حجوزات على المواد الشعبية مبكراً |
| - Check due dates regularly | - راجع تواريخ الاستحقاق بانتظام |
| - Set reminders for returns | - ضع تذكيرات للإرجاع |
| **Use Digital Services** | **استخدم الخدمات الرقمية** |
| - Explore e-books and audiobooks | - استكشف الكتب الإلكترونية والكتب المسموعة |
| - Access online databases | - الوصول إلى قواعد البيانات على الإنترنت |
| - Stream videos through library services | - شاهد مقاطع الفيديو من خلال خدمات المكتبة |
| **Stay Connected** | **ابق على اتصال** |
| - Follow library social media | - تابع وسائل التواصل الاجتماعي للمكتبة |
| - Subscribe to newsletter | - اشترك في النشرة الإخبارية |
| - Check for events and programs | - تحقق من الفعاليات والبرامج |
| **Ask for Help** | **اطلب المساعدة** |
| - Librarians are experts - use their knowledge | - أمناء المكتبات خبراء - استفد من معرفتهم |
| - Attend library workshops | - احضر ورش عمل المكتبة |
| - Request materials not in collection | - اطلب مواد ليست في المجموعة |

### 11.2 Avoiding Common Mistakes | تجنب الأخطاء الشائعة

| Mistake | الخطأ | How to Avoid | كيفية التجنب |
|---------|-------|--------------|---------------|
| **Missing Due Dates** | **تفويت تواريخ الاستحقاق** | Enable email/SMS reminders. Check account weekly. | فعّل تذكيرات البريد الإلكتروني/الرسائل النصية. راجع الحساب أسبوعياً. |
| **Not Renewing on Time** | **عدم التجديد في الوقت المحدد** | Renew 3-5 days before due date to avoid issues. | جدد قبل 3-5 أيام من تاريخ الاستحقاق لتجنب المشاكل. |
| **Missing Hold Notifications** | **تفويت إشعارات الحجز** | Keep email current. Check spam folder. Enable multiple notification methods. | حدّث البريد الإلكتروني. راجع مجلد البريد العشوائي. فعّل طرق إشعار متعددة. |
| **Accumulating Fines** | **تراكم الغرامات** | Return on time. Pay fines promptly. Set up auto-renewal if available. | أرجع في الوقت المحدد. ادفع الغرامات فوراً. فعّل التجديد التلقائي إن كان متاحاً. |

### 11.3 Efficient Searching | البحث الفعّال

| English | العربية |
|---------|---------|
| **Quick Search Tips** | **نصائح البحث السريع** |
| **Use Boolean Operators** | **استخدم عوامل التشغيل المنطقية** |
| - AND: both terms must appear | - AND: يجب أن يظهر كلا المصطلحين |
| - OR: either term appears | - OR: يظهر أي من المصطلحين |
| - NOT: exclude term | - NOT: استبعد المصطلح |
| **Use Quotation Marks** | **استخدم علامات الاقتباس** |
| - For exact phrases: "solar system" | - للعبارات الدقيقة: "النظام الشمسي" |
| **Truncation** | **البتر** |
| - Use * for variations: librar* finds library, librarian, libraries | - استخدم * للتنويعات: مكتب* يجد مكتبة، مكتبي، مكتبات |
| **Filter Early** | **رشّح مبكراً** |
| - Apply material type and language filters before searching | - طبق مرشحات نوع المادة واللغة قبل البحث |

---

## 12. Glossary of Terms

### 12.1 Common Library Terms | المصطلحات المكتبية الشائعة

| Term | المصطلح | Definition | التعريف |
|------|---------|------------|---------|
| **Barcode** | **الباركود** | Unique identifier on library materials and cards | معرف فريد على مواد المكتبة والبطاقات |
| **Call Number** | **رقم الاستدعاء** | Classification code that indicates item location | رمز التصنيف الذي يشير إلى موقع المادة |
| **Check Out** | **إعارة** | Borrowing an item from library | استعارة مادة من المكتبة |
| **Check In** | **إرجاع** | Returning an item to library | إرجاع مادة إلى المكتبة |
| **Circulation** | **الإعارة** | Department handling check-out/check-in | القسم الذي يتعامل مع الإعارة/الإرجاع |
| **Due Date** | **تاريخ الاستحقاق** | Date item must be returned | التاريخ الذي يجب إرجاع المادة فيه |
| **Fine** | **غرامة** | Penalty for late return or damage | عقوبة للإرجاع المتأخر أو التلف |
| **Hold** | **حجز** | Request to reserve an item | طلب لحجز مادة |
| **Holdings** | **المقتنيات** | Copies of item owned by library | نسخ المادة المملوكة للمكتبة |
| **ILL (Interlibrary Loan)** | **الإعارة بين المكتبات** | Borrowing from another library system | الاستعارة من نظام مكتبة آخر |
| **OPAC** | **الفهرس العام على الإنترنت** | Online Public Access Catalog | فهرس الوصول العام عبر الإنترنت |
| **Overdue** | **متأخر** | Item returned after due date | مادة أُرجعت بعد تاريخ الاستحقاق |
| **Patron** | **القارئ** | Library user | مستخدم المكتبة |
| **Recall** | **استرجاع** | Request for early return of checked-out item | طلب للإرجاع المبكر لمادة معارة |
| **Reference** | **مراجع** | Materials for in-library use only | مواد للاستخدام داخل المكتبة فقط |
| **Renewal** | **تجديد** | Extending loan period | تمديد فترة الإعارة |
| **Reserve** | **احتياطي** | Items set aside for specific purpose/course | مواد منحّاة جانباً لغرض/مقرر محدد |
| **Stack** | **رفوف الكتب** | Shelving area for library materials | منطقة الرفوف لمواد المكتبة |

---

## Appendix A: Quick Reference Guide

### Login Credentials | بيانات تسجيل الدخول
- **URL**: http://localhost:3000
- **Username**: Library card number
- **Password**: Personal password

### Important Links | روابط مهمة
- **Catalog Search**: /catalog
- **My Account**: /account
- **Profile Settings**: /account/profile
- **Holds**: /account/holds
- **Checked Out Items**: /account/loans

### Keyboard Shortcuts | اختصارات لوحة المفاتيح
- **Search**: Ctrl + K
- **My Account**: Ctrl + A
- **Logout**: Ctrl + L
- **Help**: F1

### Loan Periods | فترات الإعارة
- **Books**: 21 days
- **New Books**: 14 days
- **Audiovisual**: 7 days
- **Periodicals**: 7 days

### Renewal Limits | حدود التجديد
- **Books**: 3 times
- **New Books**: 1 time
- **Audiovisual**: 2 times
- **Periodicals**: 1 time

### Fines | الغرامات
- **Books**: $0.25/day
- **Audiovisual**: $1.00/day
- **Maximum per item**: Replacement cost

---

## Document Information | معلومات الوثيقة

**Version | الإصدار**: 1.0
**Last Updated | آخر تحديث**: October 2025
**Language | اللغة**: English/Arabic | إنجليزي/عربي
**Applicable to System Version | ينطبق على إصدار النظام**: FOLIO LMS 1.0+

---

## Copyright Notice | إشعار حقوق النشر

© 2025 FOLIO Library Management System
All rights reserved | جميع الحقوق محفوظة

This manual is provided for educational and informational purposes. Unauthorized reproduction or distribution is prohibited.

يُقدم هذا الدليل لأغراض تعليمية وإعلامية. الاستنساخ أو التوزيع غير المصرح به ممنوع.

---

**For additional assistance, please contact your local library staff.**
**للحصول على مساعدة إضافية، يرجى الاتصال بموظفي المكتبة المحلية.**

---

**End of Patron Manual | نهاية دليل القارئ**
