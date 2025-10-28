# 📚 FOLIO Library Management System

<div align="center">

**A Modern, Full-Stack Library Management System**

[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-key-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Tech Stack](#-technology-stack) • [Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**FOLIO LMS** is a comprehensive, modern library management system designed to streamline library operations, from cataloging and circulation to patron management and reporting. Built with cutting-edge technologies, it offers a bilingual (English/Arabic) interface and role-based access control for different user types.

### Target Users

- **Administrators**: Complete system control and configuration
- **Librarians**: Full library operations management
- **Circulation Staff**: Check-out, check-in, and patron services
- **Catalogers**: Inventory and bibliographic record management
- **Patrons**: Self-service catalog search and account management

---

## ✨ Key Features

<details open>
<summary><strong>📚 Catalog Management</strong></summary>

- Three-level inventory hierarchy (Instance → Holdings → Items)
- Support for multiple cataloging standards (MARC, RDA, AACR2)
- Classification systems (Dewey Decimal, Library of Congress)
- Advanced search with filters and facets
- Bulk import/export functionality
- Authority control for names and subjects

</details>

<details open>
<summary><strong>🔄 Circulation Operations</strong></summary>

- Quick check-out and check-in
- Automated renewals with configurable limits
- Hold/request management with queue system
- Overdue notifications and fine calculation
- Barcode scanning support
- Multiple pickup locations

</details>

<details open>
<summary><strong>👥 User Management</strong></summary>

- Role-based access control (5 roles, 23 granular permissions)
- Patron account self-service
- User profile management
- Activity logs and audit trails
- Customizable user groups

</details>

<details open>
<summary><strong>💰 Financial Management</strong></summary>

- Fine and fee tracking
- Automated fine calculation
- Payment processing
- Fee waivers and adjustments
- Financial reports

</details>

<details open>
<summary><strong>📊 Reporting & Analytics</strong></summary>

- Real-time dashboard
- Circulation statistics
- Collection analytics
- Custom report builder
- Data export (CSV, Excel, PDF)

</details>

<details open>
<summary><strong>🌐 Additional Features</strong></summary>

- **Bilingual Interface**: Full English and Arabic support
- **Real-time Notifications**: WebSocket-based instant updates
- **Advanced Search**: Elasticsearch-powered full-text search
- **Responsive Design**: Mobile-friendly interface
- **Offline Capability**: Service worker support
- **API-First**: RESTful API with comprehensive documentation
- **Security**: JWT authentication, role-based authorization

</details>

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2 | UI Framework |
| **TypeScript** | 5.3 | Type Safety |
| **Vite** | 5.0 | Build Tool |
| **Redux Toolkit** | 2.0 | State Management |
| **React Query** | 5.14 | Server State |
| **React Router** | 6.21 | Routing |
| **Tailwind CSS** | 3.4 | Styling |
| **Framer Motion** | 12.23 | Animations |
| **React Hook Form** | 7.49 | Forms |
| **Zod** | 3.22 | Validation |
| **Axios** | 1.6 | HTTP Client |
| **Socket.io Client** | 4.7 | Real-time Communication |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11+ | Language |
| **FastAPI** | Latest | Web Framework |
| **SQLAlchemy** | 2.0 | ORM |
| **Alembic** | Latest | Database Migrations |
| **PostgreSQL** | 15 | Primary Database |
| **Redis** | 7 | Caching & Sessions |
| **Elasticsearch** | 8.11 | Search Engine |
| **Celery** | Latest | Task Queue |
| **Flower** | Latest | Task Monitoring |
| **Pydantic** | 2.0 | Data Validation |
| **JWT** | - | Authentication |

### Infrastructure

- **Docker** & **Docker Compose**: Containerization
- **Nginx**: Reverse Proxy (Production)
- **GitHub Actions**: CI/CD
- **Playwright**: E2E Testing
- **Vitest**: Unit Testing

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FOLIO LMS                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │   Frontend   │────────▶│   Backend    │            │
│  │   (React)    │  HTTP   │  (FastAPI)   │            │
│  │   Port 3000  │◀────────│  Port 8000   │            │
│  └──────────────┘         └──────┬───────┘            │
│         │                         │                     │
│         │                         ├──▶ PostgreSQL      │
│         │                         │    (Database)       │
│         │                         │                     │
│         │                         ├──▶ Redis           │
│         │                         │    (Cache/Queue)    │
│         │                         │                     │
│         │                         ├──▶ Elasticsearch   │
│         │                         │    (Search)         │
│         │                         │                     │
│         │                         ├──▶ Celery Worker   │
│         │                         │    (Async Tasks)    │
│         │                         │                     │
│         │                         └──▶ Celery Beat     │
│         │                              (Scheduler)      │
│         │                                               │
│         └──────────▶ Socket.io (Real-time Updates)     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

Get FOLIO LMS running in 3 steps:

```bash
# 1. Clone the repository
git clone <repository-url>
cd folio-lms

# 2. Start all services with Docker Compose
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# Flower (Task Monitor): http://localhost:5555
```

### Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| **Administrator** | `admin` | `Admin@123` |
| **Librarian** | `librarian` | `Librarian@123` |
| **Circulation Staff** | `circulation` | `Circulation@123` |
| **Cataloger** | `cataloger` | `Cataloger@123` |
| **Patron** | `patron` | `Patron@123` |

> ⚠️ **Important**: Change default passwords immediately after first login!

---

## 📦 Installation

<details>
<summary><strong>Prerequisites</strong></summary>

Before you begin, ensure you have the following installed:

- **Docker** (20.10+) and **Docker Compose** (2.0+)
- **Node.js** (18+) and **npm** (for local development)
- **Python** (3.11+) and **pip** (for local development)
- **Git**

</details>

<details>
<summary><strong>Option 1: Docker Installation (Recommended)</strong></summary>

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd folio-lms
```

### Step 2: Environment Configuration

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database
POSTGRES_USER=folio
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=folio_lms

# Backend
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@folio-lms.com
SMTP_FROM_NAME=FOLIO Library Management System
```

### Step 3: Build and Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### Step 4: Initialize Database

The database is automatically initialized on first run with:
- Database schema (via Alembic migrations)
- Default roles and permissions
- Sample admin user

### Step 5: Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Flower Dashboard**: http://localhost:5555

</details>

<details>
<summary><strong>Option 2: Local Development Setup</strong></summary>

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up database
alembic upgrade head
python -m app.db.init_db

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Required Services

You still need PostgreSQL, Redis, and Elasticsearch running. Use Docker Compose for these:

```bash
docker-compose up -d postgres redis elasticsearch
```

</details>

---

## ⚙️ Configuration

<details>
<summary><strong>Environment Variables</strong></summary>

### Backend Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `REDIS_URL` | Redis connection string | - | Yes |
| `ELASTICSEARCH_URL` | Elasticsearch URL | - | Yes |
| `SECRET_KEY` | JWT secret key (32+ chars) | - | Yes |
| `ALGORITHM` | JWT algorithm | HS256 | No |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime | 30 | No |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime | 7 | No |
| `BACKEND_CORS_ORIGINS` | Allowed CORS origins | - | Yes |
| `SMTP_HOST` | SMTP server host | - | No |
| `SMTP_PORT` | SMTP server port | 587 | No |
| `SMTP_USERNAME` | SMTP username | - | No |
| `SMTP_PASSWORD` | SMTP password | - | No |

### Frontend Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | http://localhost:8000/api/v1 | Yes |

</details>

<details>
<summary><strong>Application Settings</strong></summary>

### Circulation Policies

Configure in Admin Panel → Settings → Circulation:

- Loan periods by item type
- Renewal limits
- Fine rates
- Hold shelf period
- Grace period

### User Permissions

Configure in Admin Panel → Settings → Roles:

- Role-based access control
- 23 granular permissions
- Custom role creation

### Notification Settings

Configure in Admin Panel → Settings → Notifications:

- Email templates
- Notification triggers
- Delivery methods

</details>

---

## 💻 Usage

<details>
<summary><strong>For Administrators</strong></summary>

### Managing Users

1. Navigate to **Users** → **User Management**
2. Click **Add User** to create new user
3. Fill in user details (name, email, role)
4. Assign permissions
5. Click **Save**

### System Configuration

1. Go to **Settings** in the main menu
2. Configure:
   - Circulation policies
   - Fine rates
   - Notification templates
   - System preferences

### Viewing Reports

1. Navigate to **Reports**
2. Select report type:
   - Circulation statistics
   - Collection analytics
   - Financial reports
   - User activity
3. Apply filters and generate report

</details>

<details>
<summary><strong>For Librarians</strong></summary>

### Cataloging Items

1. Go to **Inventory** → **Add Instance**
2. Fill in bibliographic details:
   - Title, author, publisher
   - ISBN, classification
   - Subject headings
3. Add holdings information
4. Add item records
5. Save and publish

### Managing Circulation

1. Navigate to **Circulation**
2. Perform operations:
   - Check out items
   - Check in items
   - Process renewals
   - Manage holds

</details>

<details>
<summary><strong>For Patrons</strong></summary>

### Searching Catalog

1. Use search bar on homepage
2. Enter keywords, title, or author
3. Apply filters (format, language, availability)
4. Click on item for details

### Managing Your Account

1. Click **My Account** in top menu
2. View:
   - Checked out items
   - Hold requests
   - Fines and fees
   - Loan history
3. Renew items online
4. Place holds on available items

</details>

---

## 📁 Project Structure

```
folio-lms/
├── backend/                    # Backend API (FastAPI)
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   └── v1/
│   │   │       ├── endpoints/ # Endpoint modules
│   │   │       └── router.py  # API router
│   │   ├── core/              # Core functionality
│   │   │   ├── config.py      # Configuration
│   │   │   ├── security.py    # Security utilities
│   │   │   └── celery_app.py  # Celery configuration
│   │   ├── db/                # Database
│   │   │   ├── base.py        # Base models
│   │   │   ├── session.py     # DB session
│   │   │   └── init_db.py     # DB initialization
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   ├── tasks/             # Celery tasks
│   │   └── main.py            # Application entry point
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Backend tests
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile
│
├── frontend/                   # Frontend Application (React)
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── common/        # Shared components
│   │   │   ├── layout/        # Layout components
│   │   │   └── features/      # Feature components
│   │   ├── pages/             # Page components
│   │   ├── store/             # Redux store
│   │   │   ├── slices/        # Redux slices
│   │   │   └── index.ts       # Store configuration
│   │   ├── services/          # API services
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utility functions
│   │   ├── types/             # TypeScript types
│   │   ├── routes/            # Route configuration
│   │   ├── App.tsx            # App component
│   │   └── main.tsx           # Entry point
│   ├── tests/                 # Frontend tests
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── docs/                       # Documentation
│   ├── user-manuals/          # User manuals
│   │   ├── 01-administrator-manual.md
│   │   ├── 02-librarian-manual.md
│   │   ├── 03-circulation-staff-manual.md
│   │   ├── 04-cataloger-manual.md
│   │   └── 05-patron-manual.md
│   └── api/                   # API documentation
│
├── docker/                     # Docker configuration
│   └── init-scripts/          # Database init scripts
│
├── docker-compose.yml          # Docker Compose configuration
├── .env.example               # Environment variables template
├── .gitignore
└── README.md                  # This file
```

---

## 🔧 Development

<details>
<summary><strong>Running Development Server</strong></summary>

### Backend

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Run with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Start development server
npm run dev

# Access at http://localhost:5173
```

### Celery Worker (for async tasks)

```bash
cd backend
celery -A app.core.celery_app worker --loglevel=info
```

### Celery Beat (for scheduled tasks)

```bash
cd backend
celery -A app.core.celery_app beat --loglevel=info
```

</details>

<details>
<summary><strong>Code Quality Tools</strong></summary>

### Backend

```bash
# Linting with flake8
flake8 app/

# Type checking with mypy
mypy app/

# Code formatting with black
black app/

# Import sorting with isort
isort app/
```

### Frontend

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format with Prettier (if configured)
npm run format
```

</details>

<details>
<summary><strong>Database Migrations</strong></summary>

### Creating a Migration

```bash
cd backend

# Auto-generate migration
alembic revision --autogenerate -m "Description of changes"

# Review generated migration in alembic/versions/

# Apply migration
alembic upgrade head
```

### Rollback Migration

```bash
# Rollback one version
alembic downgrade -1

# Rollback to specific version
alembic downgrade <revision_id>
```

### View Migration History

```bash
alembic history
alembic current
```

</details>

---

## 🧪 Testing

<details>
<summary><strong>Backend Tests</strong></summary>

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run specific test
pytest tests/test_auth.py::test_login
```

### Test Structure

```
backend/tests/
├── conftest.py              # Test fixtures
├── test_auth.py             # Authentication tests
├── test_users.py            # User management tests
├── test_inventory.py        # Inventory tests
└── test_circulation.py      # Circulation tests
```

</details>

<details>
<summary><strong>Frontend Tests</strong></summary>

### Unit Tests (Vitest)

```bash
cd frontend

# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run in UI mode
npm run test:e2e:ui

# Run specific test
npx playwright test tests/login.spec.ts
```

### Test Structure

```
frontend/tests/
├── unit/                    # Unit tests
│   ├── components/
│   └── utils/
└── e2e/                    # E2E tests
    ├── auth.spec.ts
    ├── circulation.spec.ts
    └── catalog.spec.ts
```

</details>

---

## 🚢 Deployment

<details>
<summary><strong>Production Deployment</strong></summary>

### Using Docker Compose

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Environment Variables for Production

```env
# Set secure values
SECRET_KEY=<64-character-random-string>
POSTGRES_PASSWORD=<strong-password>
ENVIRONMENT=production
DEBUG=false

# Configure email
SMTP_HOST=smtp.yourprovider.com
SMTP_USERNAME=your-email@domain.com
SMTP_PASSWORD=your-email-password
```

### SSL/TLS Configuration

Use a reverse proxy (Nginx) with Let's Encrypt:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

</details>

<details>
<summary><strong>Performance Optimization</strong></summary>

### Backend

- Enable Redis caching for frequently accessed data
- Use database connection pooling
- Implement query optimization with indexes
- Use Celery for CPU-intensive tasks
- Enable gzip compression

### Frontend

- Build with production mode: `npm run build`
- Enable code splitting
- Lazy load routes and components
- Optimize images
- Use CDN for static assets

</details>

---

## 📚 Documentation

### User Manuals

Comprehensive bilingual (English/Arabic) user manuals are available in the `docs/user-manuals/` directory:

- [**Administrator Manual**](docs/user-manuals/01-administrator-manual.md) - Complete system administration
- [**Librarian Manual**](docs/user-manuals/02-librarian-manual.md) - Library operations
- [**Circulation Staff Manual**](docs/user-manuals/03-circulation-staff-manual.md) - Circulation desk operations
- [**Cataloger Manual**](docs/user-manuals/04-cataloger-manual.md) - Cataloging and inventory
- [**Patron Manual**](docs/user-manuals/05-patron-manual.md) - Patron self-service guide

### API Documentation

- **Interactive API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc (Alternative documentation)

### Additional Resources

- Architecture diagrams: `docs/architecture/`
- Database schema: `docs/database/`
- Contributing guidelines: `CONTRIBUTING.md`

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

<details>
<summary><strong>How to Contribute</strong></summary>

### 1. Fork the Repository

Click the "Fork" button in the top-right corner of this repository.

### 2. Clone Your Fork

```bash
git clone https://github.com/your-username/folio-lms.git
cd folio-lms
```

### 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes

- Write clean, documented code
- Follow existing code style
- Add tests for new features
- Update documentation as needed

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Maintenance tasks

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

- Go to the original repository
- Click "New Pull Request"
- Select your fork and branch
- Fill in the PR template
- Submit for review

</details>

<details>
<summary><strong>Development Guidelines</strong></summary>

### Code Style

**Backend (Python):**
- Follow PEP 8
- Use type hints
- Maximum line length: 100 characters
- Use docstrings for functions and classes

**Frontend (TypeScript):**
- Follow Airbnb style guide
- Use functional components
- Use TypeScript strictly (no `any` types)
- Maximum line length: 100 characters

### Testing Requirements

- Write unit tests for new features
- Maintain >80% code coverage
- Ensure all tests pass before submitting PR

### Documentation

- Update user manuals for user-facing changes
- Add JSDoc/docstrings for new functions
- Update README if needed

</details>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 FOLIO Library Management System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/), [FastAPI](https://fastapi.tiangolo.com/), and [PostgreSQL](https://www.postgresql.org/)
- Icons by [Lucide](https://lucide.dev/)
- UI components inspired by modern design principles
- Thanks to all contributors and the open-source community

---

## 📞 Support

For issues, questions, or feature requests:

1. Check the [User Manuals](docs/user-manuals/)
2. Search [existing issues](https://github.com/your-org/folio-lms/issues)
3. Create a [new issue](https://github.com/your-org/folio-lms/issues/new) if needed

---

<div align="center">

**Built with ❤️ for libraries worldwide**

⭐ Star this repository if you find it helpful!

[Back to Top](#-folio-library-management-system)

</div>
