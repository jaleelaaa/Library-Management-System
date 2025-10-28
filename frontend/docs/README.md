# FOLIO LMS Documentation

This directory contains documentation resources for the FOLIO LMS (Library Management System) application.

## Directory Structure

```
docs/
├── README.md                          # This file
├── mockups/                           # UI mockups for user manual
│   ├── index.html                     # Interactive index of all mockups
│   ├── english/                       # English version mockups
│   │   ├── 01-login.html
│   │   ├── 02-dashboard.html
│   │   ├── 03-users.html
│   │   ├── 04-circulation.html
│   │   ├── 05-inventory.html
│   │   ├── 06-holdings.html
│   │   ├── 07-items.html
│   │   ├── 08-fees-fines.html
│   │   ├── 09-reports.html
│   │   └── 10-settings.html
│   └── arabic/                        # Arabic version mockups (RTL)
│       ├── 01-login.html
│       ├── 02-dashboard.html
│       ├── 03-users.html
│       ├── 04-circulation.html
│       ├── 05-inventory.html
│       ├── 06-holdings.html
│       ├── 07-items.html
│       ├── 08-fees-fines.html
│       ├── 09-reports.html
│       └── 10-settings.html
├── assets/
│   └── css/
│       └── mockup-styles.css          # Shared styles for all mockups
└── manual/                            # Future: User manual documents
    ├── english/                       # Future: English user guides
    └── arabic/                        # Future: Arabic user guides
```

## UI Mockups

### Overview

The `mockups/` directory contains HTML mockups representing the user interface of the FOLIO LMS application. These mockups are designed to support user manual creation and documentation.

### Features

- **Bilingual Support**: Each page is available in English and Arabic (with RTL layout)
- **Responsive Design**: Mockups use Tailwind-inspired CSS for clean, modern styling
- **Complete Coverage**: All major features and pages are represented
- **Interactive Elements**: Hover effects and visual feedback (non-functional)

### Viewing the Mockups

1. **Using the Index Page** (Recommended):
   - Open `docs/mockups/index.html` in any web browser
   - Click on the language links to view each page mockup

2. **Direct Access**:
   - Navigate to `docs/mockups/english/` or `docs/mockups/arabic/`
   - Open any HTML file directly in your browser

### Available Mockups

| # | Page | Description |
|---|------|-------------|
| 01 | Login | User authentication with language selection |
| 02 | Dashboard | System overview with statistics and recent activity |
| 03 | Users Management | Patron and staff management interface |
| 04 | Circulation | Check-out and check-in operations |
| 05 | Inventory Management | Bibliographic instances and resources |
| 06 | Holdings Management | Copy-level holdings records |
| 07 | Items Management | Physical items and barcode management |
| 08 | Fees & Fines | Fee tracking and payment processing |
| 09 | Reports | Report generation and analytics |
| 10 | Settings | System configuration and policies |

### Creating Screenshots from Mockups

To create screenshots for the user manual:

1. **Manual Method**:
   - Open the mockup in your browser
   - Use browser's full-page screenshot tool or extension
   - Save images to `docs/manual/[language]/images/`

2. **Automated Method** (Optional):
   - Install Puppeteer or Playwright
   - Create a script to automatically capture screenshots
   - Example script location: `docs/scripts/capture-screenshots.js`

### Styling

All mockups share a common stylesheet (`assets/css/mockup-styles.css`) that includes:

- **Layout Components**: Header, sidebar, main content
- **UI Elements**: Buttons, cards, tables, forms
- **Navigation**: Tabs, pagination
- **Utilities**: Flex, spacing, colors
- **RTL Support**: Right-to-left layout for Arabic

### User Manual (Future)

The `manual/` directory is reserved for comprehensive user guide documents that will include:

- **Role-based guides**: Admin, Staff, Patron
- **Feature documentation**: Step-by-step instructions
- **Screenshots**: From the UI mockups
- **Best practices**: Usage recommendations

## Development Notes

### Technical Details

- **Framework**: Static HTML + CSS (no JavaScript required)
- **Styling Approach**: Tailwind-inspired utility classes
- **Browser Compatibility**: All modern browsers
- **File Format**: UTF-8 encoded HTML5

### Maintenance

When updating mockups:

1. Update the shared `mockup-styles.css` for global style changes
2. Maintain consistency between English and Arabic versions
3. Ensure RTL layout works correctly for Arabic pages
4. Update the index page when adding new mockups

### Contributing

To add new mockups:

1. Create both English and Arabic versions
2. Follow the existing naming convention (`##-pagename.html`)
3. Use the shared stylesheet (`../assets/css/mockup-styles.css`)
4. Add entry to the index page (`mockups/index.html`)
5. Update this README

## License

This documentation is part of the FOLIO LMS project.

---

**Last Updated**: October 2024
**Version**: 1.0.0
