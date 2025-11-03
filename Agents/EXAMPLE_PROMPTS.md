# Example Prompts for Claude Code

Use these prompts at each stage of your enhancement project.

## Initial Setup Prompts

### 1. Project Initialization
```
I'm enhancing a Library Management System for Oman Ministry of Education.
Please help me set up the context engineering structure:

1. Create .docs/tasks/context.md with project overview
2. Create .docs/research/ directory for sub-agent plans
3. Create a todo.md file to track current tasks
4. Initialize the project with proper structure

The goal is to transform this into a ministry-grade application with:
- Professional UI using shadcn/ui
- Comprehensive Playwright testing
- Enhanced Arabic/RTL support
- Multi-library management features
- Ministry-level reports and analytics
```

## Phase 1: UI Enhancement

### 2. Initial UI Assessment
```
Please analyze the current UI of the Library Management System and:

1. Read .docs/tasks/context.md first
2. Consult the ui-designer-agent to:
   - Review current React components
   - Identify areas needing improvement
   - Recommend shadcn/ui components to use
   - Create a comprehensive UI enhancement plan
3. Save the plan to .docs/research/ui-design-plan.md
4. Report back with the plan summary

Focus on creating a professional, government-standard interface suitable 
for Oman Ministry of Education.
```

### 3. Install shadcn/ui
```
Please install and configure shadcn/ui in the frontend:

1. Navigate to frontend directory
2. Run shadcn/ui init command
3. Configure with:
   - TypeScript: Yes
   - Style: Default
   - Base color: Slate (professional for ministry)
   - CSS variables: Yes
   - Tailwind config: Yes
4. Install these initial components:
   - button
   - card
   - table
   - form
   - dialog
   - dropdown-menu
   - select
   - input
   - label
5. Update context.md when done
```

### 4. Implement Dashboard
```
Now that we have the UI plan from the ui-designer-agent, please implement 
the ministry-level dashboard:

1. Read .docs/research/ui-design-plan.md
2. Create a new Dashboard component using shadcn/ui components:
   - Statistics cards showing key metrics
   - Recent activities feed
   - Quick actions menu
   - Charts for circulation trends (use Recharts)
3. Make it responsive for mobile/tablet/desktop
4. Ensure it works with both English and Arabic
5. Update context.md after completion

Follow the design principles from the UI plan.
```

### 5. Enhance Forms
```
Please enhance all forms in the application using shadcn/ui:

1. Review current forms (login, add book, user management, etc.)
2. Implement using shadcn/ui Form components
3. Add proper validation with Zod schemas
4. Include helpful error messages
5. Add field-level help text
6. Implement auto-save for long forms
7. Ensure Arabic RTL compatibility
8. Update context.md

Make forms professional and user-friendly for ministry staff.
```

### 6. Upgrade Data Tables
```
Please upgrade all data tables to use shadcn/ui Table component:

1. Replace current tables with shadcn/ui Table
2. Add features:
   - Sortable columns
   - Pagination
   - Filters
   - Search
   - Row selection
   - Export to CSV/Excel
3. Make responsive for mobile
4. Add Arabic RTL support
5. Update context.md

Tables should handle large datasets efficiently (1000+ rows).
```

## Phase 2: Testing Infrastructure

### 7. Test Plan Creation
```
Consult the testing-agent to create a comprehensive Playwright test plan:

1. Read .docs/tasks/context.md for current implementation status
2. Assign task to testing-agent to:
   - Analyze all implemented features
   - Design test scenarios for each user role
   - Plan test data requirements
   - Define selectors and locators
   - Create test file structure
3. Save plan to .docs/research/test-plan.md
4. Report back with summary

Include tests for Arabic RTL layout and ministry-specific features.
```

### 8. Install Playwright
```
Please set up Playwright for end-to-end testing:

1. Navigate to frontend directory
2. Install Playwright: npm install -D @playwright/test
3. Install browsers: npx playwright install
4. Create playwright.config.ts with:
   - baseURL: http://localhost:3000
   - testDir: ./tests
   - timeout: 30 seconds
   - retries: 2
5. Create test directory structure based on test plan
6. Update context.md
```

### 9. Implement Authentication Tests
```
Please implement authentication tests based on the test plan:

1. Read .docs/research/test-plan.md
2. Create tests for:
   - Login (all user roles)
   - Logout
   - Password reset
   - Session management
   - Permission checks
3. Use proper test data fixtures
4. Add data-testid attributes where needed
5. Run tests to verify they pass
6. Update context.md

Tests should cover both English and Arabic interfaces.
```

### 10. Implement Feature Tests
```
Please implement tests for all main features:

1. Read test plan from .docs/research/test-plan.md
2. Create test files for:
   - Catalog management (add/edit/search books)
   - Circulation (checkout/checkin/renewals)
   - User management
   - Reports generation
   - Ministry dashboard
3. Include happy path and error scenarios
4. Test Arabic RTL layout
5. Run all tests and fix any failures
6. Update context.md with test coverage percentage
```

## Phase 3: Ministry Features

### 11. Multi-Library Backend Design
```
Consult the backend-agent to design multi-library management:

1. Read .docs/tasks/context.md
2. Assign task to backend-agent to:
   - Design database schema for ministry library network
   - Plan API endpoints for library management
   - Define permissions for ministry roles
   - Plan inter-library features (book transfers, shared catalog)
   - Consider performance and scalability
3. Save plan to .docs/research/backend-plan.md
4. Report summary

System should support 100+ libraries across Oman.
```

### 12. Implement Multi-Library Backend
```
Please implement the multi-library system based on the backend plan:

1. Read .docs/research/backend-plan.md
2. Create database migrations for new tables
3. Add SQLAlchemy models
4. Create Pydantic schemas
5. Implement API endpoints
6. Add new permissions
7. Write backend tests
8. Update API documentation
9. Update context.md

Ensure proper isolation between libraries and ministry-level oversight.
```

### 13. Implement Multi-Library Frontend
```
Please implement the multi-library management UI:

1. Create Ministry Admin dashboard
2. Add library management screens:
   - List all libraries with filters
   - Add/edit library details
   - View library statistics
   - Manage library staff
3. Add library switcher for staff
4. Implement inter-library book transfer
5. Use shadcn/ui components
6. Ensure Arabic RTL support
7. Update context.md
```

### 14. Ministry Reports
```
Please implement ministry-level reporting features:

1. Create report templates for:
   - Monthly circulation summary (all libraries)
   - Collection statistics by library
   - Budget and acquisitions
   - User statistics by governorate
   - Comparative library performance
2. Add report generation UI
3. Implement export to PDF and Excel
4. Support bilingual reports (English/Arabic)
5. Add report scheduling feature
6. Update context.md

Reports should use proper Omani government formatting.
```

## Phase 4: Arabic Enhancement

### 15. Arabic Localization Plan
```
Consult the arabic-localization-agent for comprehensive Arabic support:

1. Read .docs/tasks/context.md
2. Assign task to arabic-localization-agent to:
   - Review current Arabic translations
   - Provide ministry terminology translations
   - Plan RTL CSS fixes
   - Recommend Arabic typography
   - Plan date/number formatting (Hijri + Arabic numerals)
   - Consider cultural appropriateness for Oman
3. Save plan to .docs/research/arabic-localization-plan.md
4. Report summary
```

### 16. Implement Arabic Translations
```
Please implement Arabic translations based on the localization plan:

1. Read .docs/research/arabic-localization-plan.md
2. Update i18n configuration
3. Add all Arabic translations to locale files
4. Use proper ministry terminology
5. Implement RTL layout fixes
6. Add Arabic fonts (Cairo or Tajawal)
7. Update context.md

Verify translations with native Arabic speaker if possible.
```

### 17. Implement Date/Number Formatting
```
Please implement Arabic date and number formatting:

1. Add Hijri calendar support alongside Gregorian
2. Implement Eastern Arabic numerals (٠-٩) option
3. Add locale-aware date formatting
4. Add locale-aware number formatting
5. Create user preference settings for:
   - Calendar system (Gregorian/Hijri/Both)
   - Number format (Western/Eastern)
6. Apply throughout application
7. Update context.md
```

## Phase 5: Security & Audit

### 18. Enhanced Security
```
Please implement ministry-level security features:

1. Enhance password policies:
   - Minimum 12 characters
   - Require uppercase, lowercase, numbers, symbols
   - Password history (prevent reuse of last 5)
   - Force password change every 90 days
2. Add two-factor authentication
3. Implement session management
4. Add IP whitelisting for admin access
5. Create security alerts for suspicious activity
6. Update context.md
```

### 19. Audit Trail System
```
Please implement comprehensive audit logging:

1. Create audit_logs table
2. Log all user actions:
   - Login/logout
   - Data modifications (create/update/delete)
   - Report generation
   - Admin actions
   - Permission changes
3. Add audit log viewer UI (admin only)
4. Implement audit log export
5. Add audit log search and filtering
6. Update context.md

Logs should be tamper-proof and retained for 7 years (ministry requirement).
```

## Phase 6: Documentation

### 20. Documentation Plan
```
Consult the documentation-agent for comprehensive documentation:

1. Read .docs/tasks/context.md
2. Assign task to documentation-agent to:
   - Plan all required documentation
   - Create document structure
   - Plan screenshots and diagrams
   - Define bilingual requirements
3. Save plan to .docs/research/documentation-plan.md
4. Report summary

Documentation must be suitable for Oman ministry standards.
```

### 21. Create User Manuals
```
Please create user manuals based on the documentation plan:

1. Read .docs/research/documentation-plan.md
2. Create manuals for:
   - Ministry Administrator Guide
   - Librarian Guide
   - Circulation Staff Guide
   - Patron Guide
3. Include:
   - Screenshots
   - Step-by-step instructions
   - Troubleshooting sections
   - FAQs
4. Create both English and Arabic versions
5. Generate PDFs
6. Save to .docs/manuals/
7. Update context.md
```

### 22. API Documentation
```
Please update API documentation:

1. Review all API endpoints
2. Update OpenAPI/Swagger documentation
3. Add examples for each endpoint
4. Document authentication requirements
5. Add error response examples
6. Create API usage guide
7. Update context.md

API docs should be accessible at /docs endpoint.
```

## Final Steps

### 23. Performance Optimization
```
Please optimize application performance:

1. Analyze current performance
2. Implement optimizations:
   - React component lazy loading
   - Image optimization
   - Database query optimization
   - Redis caching for frequently accessed data
   - API response compression
3. Run performance tests
4. Document optimization results
5. Update context.md

Target: Page load < 2 seconds, API response < 200ms
```

### 24. Final Review
```
Please perform a comprehensive review of the enhanced system:

1. Read entire .docs/tasks/context.md
2. Verify all phases completed
3. Run all tests (Playwright + Vitest)
4. Check code quality (lint + type-check)
5. Review documentation completeness
6. Test Arabic RTL thoroughly
7. Create deployment checklist
8. Update context.md with final status

Generate a final report summarizing all enhancements.
```

### 25. Deployment Preparation
```
Please prepare the system for production deployment:

1. Update production environment configuration
2. Create production docker-compose.yml
3. Set up database migration strategy
4. Configure Nginx reverse proxy
5. Set up SSL certificates
6. Create deployment scripts
7. Write deployment guide
8. Create rollback procedure
9. Update context.md

System should be ready for Oman ministry production environment.
```

## Debugging Prompts

### When Sub-Agent Not Responding
```
I notice the [agent-name] didn't respond. Please:
1. Check if the agent configuration exists
2. Verify the agent.md file has correct format
3. Try assigning the task again with explicit context file reference
4. If still fails, proceed with direct implementation and note the issue
```

### When Tests Fail
```
The tests are failing. Please:
1. Review the test failures in detail
2. Identify the root cause
3. Fix the underlying issues (not just the tests)
4. Re-run tests to verify fixes
5. Keep failed test results in context for learning
6. Update context.md with learnings
```

### When Need to See Progress
```
Please provide a progress summary:
1. Read .docs/tasks/context.md
2. List completed phases with checkmarks
3. Show current phase in progress
4. Estimate remaining work
5. Highlight any blockers
6. Suggest next steps
```

## Tips for Writing Good Prompts

1. **Be Specific**: Say exactly what you want
2. **Reference Context**: Always mention context.md
3. **Set Expectations**: Define success criteria
4. **Request Updates**: Ask for context.md updates
5. **Allow Iteration**: Accept that AI might need multiple attempts
6. **Keep Errors**: Don't ask to remove error messages

## Example Multi-Step Prompt

```
I need to enhance the circulation module with ministry-level features:

Step 1: Consult backend-agent to design:
- Inter-library loan system
- Centralized waitlist across libraries
- Ministry-level circulation policies
Save plan to .docs/research/circulation-enhancement-plan.md

Step 2: After getting the plan:
- Implement backend changes
- Create database migrations
- Add new API endpoints
- Write tests

Step 3: Implement frontend:
- Update circulation UI
- Add inter-library loan interface
- Implement waitlist management
- Use shadcn/ui components

Step 4: Test:
- Write Playwright tests
- Run all tests
- Fix any issues

Step 5: Documentation:
- Update user manual
- Update API docs
- Add feature to changelog

Step 6: Update context.md with completion status

Start with Step 1 - consulting the backend-agent.
```

---

These prompts will guide you through the entire enhancement process systematically. Customize them based on your specific needs.
