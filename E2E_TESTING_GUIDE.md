# 🧪 FOLIO LMS - Comprehensive End-to-End Testing Guide

**Version:** 1.0
**Last Updated:** 2025-10-28
**Testing Scope:** Full application functionality across both user roles and both languages

---

## 📋 Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Authentication Testing](#authentication-testing)
3. [Admin Role Testing](#admin-role-testing)
4. [Patron/Member Role Testing](#patronmember-role-testing)
5. [Bilingual Testing (English/Arabic)](#bilingual-testing-englisharabic)
6. [Cross-Functional Testing](#cross-functional-testing)
7. [Error Handling & Edge Cases](#error-handling--edge-cases)
8. [Performance & UX Testing](#performance--ux-testing)
9. [Acceptance Criteria Checklist](#acceptance-criteria-checklist)

---

## 🔧 Pre-Testing Setup

### Environment Verification

**Before starting any tests, verify:**

- [ ] Backend is running on `http://localhost:8000`
- [ ] Frontend is running on `http://localhost:3000`
- [ ] Database is initialized with default users
- [ ] Browser cache is cleared (Ctrl+Shift+R)
- [ ] Browser console is open (F12) to monitor errors

**Test Credentials:**
```
Admin Account:
  Username: admin
  Password: Admin@123

Patron Account:
  Username: patron
  Password: Patron@123
```

### Browser Requirements
- **Recommended:** Chrome, Firefox, or Edge (latest version)
- **Test in:** Both Desktop (1920x1080) and Mobile (375x667) viewports
- **Language Settings:** Test with both English and Arabic

---

## 🔐 Authentication Testing

### Test Case 1.1: Login Page Load
**Steps:**
1. Navigate to `http://localhost:3000`
2. Observe the login page appearance

**Expected Results:**
- [ ] Login page loads within 2 seconds
- [ ] Gradient background (blue-50 to purple-50) is visible
- [ ] White rounded card with shadow is centered
- [ ] Language switcher is visible in top-right corner (or top-left for Arabic)
- [ ] Login form has username and password fields
- [ ] "Sign In" button is visible
- [ ] Default credentials are displayed in a blue info box
- [ ] No console errors

### Test Case 1.2: Language Switcher Visibility
**Steps:**
1. On login page, locate the language switcher
2. Click on the language switcher

**Expected Results:**
- [ ] Language switcher shows current language (EN/AR flag)
- [ ] Dropdown shows both English and Arabic options
- [ ] Clicking switches language immediately
- [ ] All text on page translates correctly
- [ ] Layout switches to RTL for Arabic, LTR for English
- [ ] Language switcher moves from top-right to top-left when Arabic is selected

### Test Case 1.3: Valid Admin Login
**Steps:**
1. Ensure language is set to English
2. Enter username: `admin`
3. Enter password: `Admin@123` (note capital A)
4. Click "Sign In" button

**Expected Results:**
- [ ] Button text changes to "Signing In..." during loading
- [ ] Button is disabled during loading
- [ ] Success toast notification appears: "Login successful!"
- [ ] Redirects to `/dashboard` within 1 second
- [ ] Dashboard header shows "admin" username
- [ ] Admin navigation menu is visible
- [ ] JWT token is stored in Redux store

### Test Case 1.4: Valid Patron Login
**Steps:**
1. If logged in, logout first
2. Return to login page
3. Enter username: `patron`
4. Enter password: `Patron@123` (note capital P)
5. Click "Sign In" button

**Expected Results:**
- [ ] Login succeeds with success toast
- [ ] Redirects to patron dashboard
- [ ] Patron-specific navigation is visible (no admin features)
- [ ] Username "patron" is displayed

### Test Case 1.5: Invalid Login Attempts
**Test with these invalid credentials:**

**Attempt 1:** Wrong password
- Username: `admin`
- Password: `admin123` (lowercase, no @)
- **Expected:** Error toast: "Login failed" or specific error message

**Attempt 2:** Wrong username
- Username: `wronguser`
- Password: `Admin@123`
- **Expected:** Error toast with authentication failure

**Attempt 3:** Empty fields
- Leave both fields empty
- Click "Sign In"
- **Expected:** HTML5 validation prevents submission

**Attempt 4:** Case sensitivity
- Username: `Admin` (capital A)
- Password: `Admin@123`
- **Expected:** Login failure (usernames are case-sensitive)

### Test Case 1.6: Bilingual Login
**Steps:**
1. Switch to Arabic language
2. Verify all login form text is in Arabic
3. Login with admin credentials
4. Verify success message is in Arabic

**Expected Results:**
- [ ] Form labels are in Arabic
- [ ] Placeholders are in Arabic
- [ ] Button text is in Arabic
- [ ] Success/error messages are in Arabic
- [ ] Layout is RTL
- [ ] Input text alignment is right-aligned

---

## 👨‍💼 Admin Role Testing

### Test Case 2.1: Admin Dashboard Access
**Prerequisites:** Logged in as admin

**Steps:**
1. After successful admin login, observe dashboard

**Expected Results:**
- [ ] Dashboard displays admin-specific metrics (total books, active loans, users, overdue)
- [ ] Statistics cards are visible
- [ ] Recent activities section is visible
- [ ] Quick actions are available
- [ ] Navigation sidebar shows admin menu items:
  - Dashboard
  - Books Management
  - Users Management
  - Borrowing Records
  - Analytics
  - Settings

### Test Case 2.2: Books Management - View All Books
**Steps:**
1. Click "Books" or "Books Management" in sidebar
2. Observe the books catalog page

**Expected Results:**
- [ ] Books catalog page loads
- [ ] Books are displayed in grid or list view
- [ ] Each book card shows:
  - Cover image
  - Title
  - Author
  - ISBN
  - Available copies count
  - Category/Genre
- [ ] Search bar is visible
- [ ] Filter options are available
- [ ] "Add New Book" button is visible (admin only)
- [ ] Pagination or infinite scroll works

### Test Case 2.3: Books Management - Search & Filter
**Steps:**
1. On books catalog page, use search bar
2. Type "Harry" or any book title keyword
3. Apply category filter
4. Apply availability filter

**Expected Results:**
- [ ] Search results update in real-time
- [ ] Filtered books match search criteria
- [ ] No results message appears if no matches
- [ ] Clear filter button works
- [ ] Multiple filters work together (AND logic)

### Test Case 2.4: Books Management - Add New Book
**Steps:**
1. Click "Add New Book" button
2. Fill in all required fields:
   - Title: "Test Book Title"
   - Author: "Test Author"
   - ISBN: "978-0-123456-78-9"
   - Publisher: "Test Publisher"
   - Publication Year: 2024
   - Category: Select a category
   - Total Copies: 5
   - Description: "This is a test book description"
3. Upload a cover image (optional)
4. Click "Save" or "Add Book"

**Expected Results:**
- [ ] Form validation works (required fields marked)
- [ ] ISBN format validation (if implemented)
- [ ] Year validation (must be valid year)
- [ ] Success toast appears
- [ ] New book appears in catalog
- [ ] Book details are correctly saved
- [ ] Available copies = Total copies for new book
- [ ] Redirects to book details or books list

### Test Case 2.5: Books Management - Edit Book
**Steps:**
1. Select any existing book from catalog
2. Click "Edit" button
3. Modify the title to "Updated Title - Test"
4. Change total copies to different number
5. Click "Save Changes"

**Expected Results:**
- [ ] Edit form pre-fills with current data
- [ ] Changes save successfully
- [ ] Success toast appears
- [ ] Updated information reflects in catalog
- [ ] If total copies reduced below borrowed copies, appropriate error/warning

### Test Case 2.6: Books Management - Delete Book
**Steps:**
1. Select a book with no active borrows
2. Click "Delete" button
3. Confirm deletion in modal

**Expected Results:**
- [ ] Confirmation modal appears with warning
- [ ] Book is removed from catalog after confirmation
- [ ] Success toast appears
- [ ] If book has active borrows, deletion is prevented with error message

### Test Case 2.7: Book Details Page
**Steps:**
1. Click on any book from catalog
2. Observe detailed book view

**Expected Results:**
- [ ] Book details page loads
- [ ] Large cover image is displayed
- [ ] All book information is shown:
  - Title, Author, ISBN
  - Publisher, Year
  - Category, Description
  - Total copies, Available copies
- [ ] Borrowing history is visible (admin view)
- [ ] Admin actions: Edit, Delete buttons
- [ ] Animations work smoothly (framer-motion)
- [ ] Back button returns to catalog

### Test Case 2.8: User Management - View All Users
**Steps:**
1. Navigate to "Users" or "User Management"
2. Observe users list

**Expected Results:**
- [ ] All registered users are displayed
- [ ] User table/cards show:
  - Username
  - Full Name
  - Email
  - Role (Admin/Patron)
  - Status (Active/Inactive)
  - Registration Date
- [ ] Search users functionality works
- [ ] Filter by role works
- [ ] "Add New User" button is visible

### Test Case 2.9: User Management - Add New User
**Steps:**
1. Click "Add New User"
2. Fill in form:
   - Username: "testuser123"
   - Full Name: "Test User"
   - Email: "testuser@example.com"
   - Password: "Test@123"
   - Role: Patron
3. Submit form

**Expected Results:**
- [ ] Form validation works
- [ ] Email format validated
- [ ] Password strength requirements enforced
- [ ] Username uniqueness checked
- [ ] New user created successfully
- [ ] New user appears in users list
- [ ] Can login with new credentials

### Test Case 2.10: User Management - Edit User
**Steps:**
1. Select existing user
2. Click "Edit"
3. Change full name
4. Change role (Patron → Admin or vice versa)
5. Save changes

**Expected Results:**
- [ ] Changes save successfully
- [ ] User's role permissions update immediately
- [ ] Cannot edit own role (security measure)
- [ ] Cannot downgrade last admin to patron

### Test Case 2.11: Borrowing Management - View All Borrows
**Steps:**
1. Navigate to "Borrowing Records" or "Loans"
2. Observe borrowing records

**Expected Results:**
- [ ] All borrowing records displayed
- [ ] Each record shows:
  - Borrower name/username
  - Book title
  - Borrow date
  - Due date
  - Return date (if returned)
  - Status (Active/Returned/Overdue)
- [ ] Filter by status works
- [ ] Search by borrower or book works
- [ ] Overdue items are highlighted in red

### Test Case 2.12: Borrowing Management - Mark as Returned
**Steps:**
1. Find an active borrow record
2. Click "Mark as Returned" or "Return Book"
3. Confirm return

**Expected Results:**
- [ ] Book marked as returned
- [ ] Return date set to current date
- [ ] Book's available copies increment by 1
- [ ] Status changes to "Returned"
- [ ] Success notification appears

### Test Case 2.13: Analytics/Reports (if implemented)
**Steps:**
1. Navigate to Analytics/Reports section
2. Observe charts and statistics

**Expected Results:**
- [ ] Charts render correctly
- [ ] Data is accurate and up-to-date
- [ ] Can filter by date range
- [ ] Export functionality works (if available)

---

## 👤 Patron/Member Role Testing

### Test Case 3.1: Patron Dashboard Access
**Prerequisites:** Logged in as patron

**Steps:**
1. Login as patron user
2. Observe dashboard

**Expected Results:**
- [ ] Patron dashboard displays
- [ ] Shows patron-specific information:
  - Currently borrowed books
  - Borrowing history
  - Due dates
  - Recommendations
- [ ] Admin menu items are NOT visible
- [ ] Cannot access admin routes

### Test Case 3.2: Browse Books Catalog (Patron View)
**Steps:**
1. Navigate to Books section
2. Browse available books

**Expected Results:**
- [ ] Can view all books
- [ ] Can search and filter
- [ ] "Add New Book" button is NOT visible
- [ ] "Edit" and "Delete" buttons are NOT visible
- [ ] "Borrow" button is visible for available books

### Test Case 3.3: Borrow a Book
**Steps:**
1. Find a book with available copies > 0
2. Click on the book to view details
3. Click "Borrow" or "Borrow This Book" button
4. Confirm borrowing (if confirmation modal appears)

**Expected Results:**
- [ ] Borrowing succeeds with success toast
- [ ] Book's available copies decrements by 1
- [ ] Book appears in "My Borrowed Books" section
- [ ] Due date is set (typically 14 days from now)
- [ ] Cannot borrow same book again while already borrowed
- [ ] Cannot borrow if no copies available

### Test Case 3.4: View Borrowed Books
**Steps:**
1. Navigate to "My Books" or "Borrowed Books"
2. Observe currently borrowed books

**Expected Results:**
- [ ] All currently borrowed books are listed
- [ ] Each book shows:
  - Book cover and title
  - Borrow date
  - Due date
  - Days remaining
- [ ] Overdue books are highlighted
- [ ] "Renew" button available (if feature exists)
- [ ] Can view borrowing history

### Test Case 3.5: Attempt to Access Admin Features
**Steps:**
1. Try to navigate to `/admin` or `/users` URL directly
2. Try accessing admin API endpoints via browser console (if possible)

**Expected Results:**
- [ ] Redirected to unauthorized page or dashboard
- [ ] Error message displayed
- [ ] Admin routes are protected
- [ ] API returns 403 Forbidden for admin endpoints

### Test Case 3.6: Book Renewal (if implemented)
**Steps:**
1. On a borrowed book, click "Renew"
2. Confirm renewal

**Expected Results:**
- [ ] Due date extends by renewal period
- [ ] Success notification
- [ ] Renewal limit enforced (e.g., max 2 renewals)
- [ ] Cannot renew if book is reserved by others

### Test Case 3.7: View Borrowing History
**Steps:**
1. Navigate to borrowing history
2. Observe past borrows

**Expected Results:**
- [ ] All past borrows displayed
- [ ] Shows return dates
- [ ] Can filter by date range
- [ ] Can search by book title

---

## 🌐 Bilingual Testing (English/Arabic)

### Test Case 4.1: Language Switching (Not Logged In)
**Steps:**
1. On login page, click language switcher
2. Switch to Arabic
3. Switch back to English

**Expected Results:**
- [ ] Language changes immediately
- [ ] No page reload required
- [ ] All UI text translates correctly
- [ ] RTL layout applied for Arabic
- [ ] LTR layout restored for English
- [ ] Language preference persists on page refresh

### Test Case 4.2: Language Switching (Logged In)
**Steps:**
1. Login as any user
2. Navigate through different pages
3. Switch language on each page
4. Verify translations

**Pages to test:**
- [ ] Dashboard
- [ ] Books Catalog
- [ ] Book Details
- [ ] User Profile
- [ ] Borrowing Records

**Expected Results:**
- [ ] All navigation menu items translate
- [ ] Page titles translate
- [ ] Form labels translate
- [ ] Button text translates
- [ ] Toast notifications translate
- [ ] Error messages translate
- [ ] Table headers translate
- [ ] Data labels translate

### Test Case 4.3: RTL Layout Verification
**Steps:**
1. Switch to Arabic
2. Observe layout changes across pages

**Expected Results:**
- [ ] Text alignment: right-aligned
- [ ] Navigation sidebar: on right side
- [ ] Icons: mirrored appropriately
- [ ] Forms: labels on right
- [ ] Tables: columns read right-to-left
- [ ] Breadcrumbs: arrows point left
- [ ] Dropdowns: align to right
- [ ] Modals: close button on left

### Test Case 4.4: Mixed Content (Arabic UI, English Data)
**Steps:**
1. Set UI to Arabic
2. View books with English titles/authors
3. Observe display

**Expected Results:**
- [ ] English book data displays correctly in RTL layout
- [ ] No text overlap or cutoff
- [ ] Readable and properly aligned
- [ ] Numbers display correctly

### Test Case 4.5: Form Submission in Both Languages
**Steps:**
1. In English: Add a new book
2. Switch to Arabic
3. Add another book
4. Verify both save correctly

**Expected Results:**
- [ ] Forms work in both languages
- [ ] Validation messages in correct language
- [ ] Data saves regardless of UI language
- [ ] Success/error messages in UI language

---

## 🔄 Cross-Functional Testing

### Test Case 5.1: Real-Time Updates (WebSocket)
**Prerequisites:** Two browser windows/tabs open

**Steps:**
1. Window 1: Login as admin
2. Window 2: Login as patron
3. Window 1: Add a new book
4. Window 2: Observe books catalog

**Expected Results:**
- [ ] New book appears in Window 2 without refresh
- [ ] WebSocket connection established
- [ ] Real-time sync works

### Test Case 5.2: Session Persistence
**Steps:**
1. Login as admin
2. Navigate to several pages
3. Refresh the page (F5)
4. Close and reopen browser tab

**Expected Results:**
- [ ] Session persists after page refresh
- [ ] JWT token stored in localStorage/sessionStorage
- [ ] Remains logged in after tab close/reopen
- [ ] Session expires after timeout (if configured)

### Test Case 5.3: Logout Functionality
**Steps:**
1. While logged in, click "Logout" button
2. Observe redirect

**Expected Results:**
- [ ] Logged out successfully
- [ ] Redirected to login page
- [ ] Token cleared from storage
- [ ] Cannot access protected routes
- [ ] Accessing protected URL redirects to login

### Test Case 5.4: Concurrent Borrowing Scenario
**Prerequisites:** Book with only 1 copy available

**Steps:**
1. Window 1: Login as patron1
2. Window 2: Login as patron2
3. Both try to borrow the same book simultaneously

**Expected Results:**
- [ ] Only one user succeeds
- [ ] Other user gets "No copies available" error
- [ ] Race condition handled properly
- [ ] Data consistency maintained

---

## ⚠️ Error Handling & Edge Cases

### Test Case 6.1: Network Errors
**Steps:**
1. Stop the backend server
2. Try to login
3. Try to load books page
4. Restart backend

**Expected Results:**
- [ ] User-friendly error messages displayed
- [ ] No app crash
- [ ] Loading states handled
- [ ] Retry mechanisms work
- [ ] App recovers when backend restored

### Test Case 6.2: Invalid JWT Token
**Steps:**
1. Login successfully
2. Manually modify JWT token in storage
3. Try to access protected route

**Expected Results:**
- [ ] Invalid token detected
- [ ] Logged out automatically
- [ ] Redirected to login
- [ ] Error message shown

### Test Case 6.3: XSS Prevention
**Steps:**
1. Try to add a book with title: `<script>alert('XSS')</script>`
2. Submit form

**Expected Results:**
- [ ] Script does not execute
- [ ] Input is sanitized
- [ ] Displayed as plain text

### Test Case 6.4: SQL Injection Prevention
**Steps:**
1. In search box, enter: `' OR '1'='1`
2. Submit search

**Expected Results:**
- [ ] No database error
- [ ] Treated as literal search string
- [ ] Parameterized queries protect against injection

### Test Case 6.5: File Upload Edge Cases (if image upload exists)
**Steps:**
1. Try to upload 10MB+ image
2. Try to upload .exe file
3. Try to upload valid image

**Expected Results:**
- [ ] File size limit enforced
- [ ] File type validation works
- [ ] Error messages for invalid files
- [ ] Valid images upload successfully

### Test Case 6.6: Boundary Testing
**Test these edge cases:**

- [ ] Username with special characters
- [ ] Very long book title (500+ characters)
- [ ] Publication year: 0, negative, future year
- [ ] Borrow 100 books simultaneously (if no limit)
- [ ] Return book twice
- [ ] Delete user with active borrows

---

## ⚡ Performance & UX Testing

### Test Case 7.1: Page Load Performance
**Steps:**
1. Open browser DevTools → Network tab
2. Navigate to different pages
3. Measure load times

**Expected Results:**
- [ ] Login page: < 2 seconds
- [ ] Dashboard: < 3 seconds
- [ ] Books catalog: < 3 seconds
- [ ] Book details: < 2 seconds
- [ ] No unnecessary network requests

### Test Case 7.2: Search Performance
**Steps:**
1. Books catalog with 100+ books
2. Type in search box
3. Observe response time

**Expected Results:**
- [ ] Search results appear within 500ms
- [ ] Debouncing prevents excessive requests
- [ ] Smooth, no lag

### Test Case 7.3: Responsive Design
**Steps:**
1. Test on different screen sizes:
   - Desktop: 1920x1080
   - Laptop: 1366x768
   - Tablet: 768x1024
   - Mobile: 375x667

**Expected Results:**
- [ ] Layout adapts to screen size
- [ ] No horizontal scroll
- [ ] Buttons/links are tappable (min 44x44px)
- [ ] Text is readable
- [ ] Navigation collapses to hamburger menu on mobile

### Test Case 7.4: Accessibility (A11y)
**Steps:**
1. Test keyboard navigation (Tab key)
2. Use screen reader (if available)
3. Check color contrast

**Expected Results:**
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators visible
- [ ] Proper ARIA labels
- [ ] Semantic HTML
- [ ] Color contrast ratio meets WCAG standards
- [ ] Alt text for images

### Test Case 7.5: Browser Compatibility
**Test in multiple browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Expected Results:**
- [ ] Consistent appearance
- [ ] All features work
- [ ] No browser-specific bugs

---

## ✅ Acceptance Criteria Checklist

### Authentication & Authorization
- [ ] Users can login with correct credentials
- [ ] Invalid credentials are rejected
- [ ] Passwords are case-sensitive
- [ ] JWT tokens are properly stored and used
- [ ] Sessions persist across page refreshes
- [ ] Logout clears session completely
- [ ] Role-based access control works (Admin vs Patron)
- [ ] Unauthorized access is prevented

### Bilingual Support
- [ ] Language switcher visible on all pages
- [ ] Can switch between English and Arabic
- [ ] All UI text translates correctly
- [ ] RTL layout works for Arabic
- [ ] LTR layout works for English
- [ ] Language preference persists
- [ ] No untranslated text visible

### Books Management (Admin)
- [ ] Can view all books
- [ ] Can add new books with all required fields
- [ ] Can edit existing books
- [ ] Can delete books (with safeguards)
- [ ] Search and filter work correctly
- [ ] Book cover images display properly
- [ ] Available copies count is accurate

### User Management (Admin)
- [ ] Can view all users
- [ ] Can add new users
- [ ] Can edit user roles
- [ ] Can activate/deactivate users
- [ ] Cannot delete users with active borrows

### Borrowing System
- [ ] Patrons can borrow available books
- [ ] Available copies decrement on borrow
- [ ] Cannot borrow when no copies available
- [ ] Cannot borrow same book twice
- [ ] Borrowed books show in patron dashboard
- [ ] Due dates are calculated correctly
- [ ] Admins can mark books as returned
- [ ] Available copies increment on return
- [ ] Overdue books are highlighted

### UI/UX
- [ ] Consistent design across all pages
- [ ] Responsive on all screen sizes
- [ ] Loading states for async operations
- [ ] Toast notifications for user actions
- [ ] Form validation with helpful error messages
- [ ] Smooth animations (framer-motion)
- [ ] Intuitive navigation
- [ ] Icons display correctly (lucide-react)

### Data Integrity
- [ ] No data loss on page refresh
- [ ] Concurrent operations handled correctly
- [ ] Database constraints enforced
- [ ] Optimistic UI updates work correctly

### Security
- [ ] Passwords are hashed (not visible in network tab)
- [ ] XSS attacks prevented
- [ ] SQL injection prevented
- [ ] Protected routes require authentication
- [ ] Admin routes require admin role
- [ ] CORS configured correctly

### Performance
- [ ] Pages load within acceptable time
- [ ] No memory leaks
- [ ] Efficient database queries
- [ ] Images are optimized
- [ ] Code splitting implemented (if applicable)

---

## 📊 Testing Report Template

After completing all tests, document results:

```markdown
## Test Execution Report
**Date:** [Date]
**Tester:** [Name]
**Environment:** [Frontend URL, Backend URL, Database]

### Summary
- Total Test Cases: [Number]
- Passed: [Number]
- Failed: [Number]
- Blocked: [Number]
- Pass Rate: [Percentage]

### Failed Test Cases
| Test Case ID | Description | Expected | Actual | Severity |
|--------------|-------------|----------|--------|----------|
| TC 2.4       | Add Book    | Success  | Error  | High     |

### Bugs Found
1. **Bug #1:** [Description]
   - Steps to Reproduce: [Steps]
   - Expected: [Expected]
   - Actual: [Actual]
   - Severity: [High/Medium/Low]
   - Screenshot: [Link]

### Recommendations
- [Improvement suggestions]

### Sign-off
Tested by: [Name]
Date: [Date]
```

---

## 🎯 Quick Test Execution Order

For fastest comprehensive testing, execute in this order:

1. **Pre-flight checks** (5 min)
   - Verify servers running
   - Clear cache
   - Prepare test credentials

2. **Authentication flow** (10 min)
   - Test Cases 1.1 - 1.6

3. **Admin workflow** (30 min)
   - Test Cases 2.1 - 2.13

4. **Patron workflow** (20 min)
   - Test Cases 3.1 - 3.7

5. **Bilingual testing** (15 min)
   - Test Cases 4.1 - 4.5

6. **Edge cases & errors** (15 min)
   - Test Cases 6.1 - 6.6

7. **Performance & UX** (15 min)
   - Test Cases 7.1 - 7.5

**Total Estimated Time:** ~2 hours for full E2E testing

---

## 📝 Notes for Testers

- **Take screenshots** at each major step for documentation
- **Document any deviations** from expected results immediately
- **Test in incognito/private mode** to avoid cache issues
- **Use real-world data** where possible (realistic book titles, names)
- **Test error scenarios** as thoroughly as success scenarios
- **Verify backend logs** for any server errors during testing
- **Check browser console** for JavaScript errors throughout testing

---

## 🚀 Ready to Test?

This guide provides a systematic approach to validate all functionality of the FOLIO LMS application. Follow each test case carefully, document results, and report any issues found.

**Good luck testing!** 🎉
