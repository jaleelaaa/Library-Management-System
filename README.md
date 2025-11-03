# FOLIO MVP - Library Management System

A modern, full-stack library management system built with **Python FastAPI** backend and **React** frontend, inspired by the FOLIO library services platform.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11%2B-blue)
![React](https://img.shields.io/badge/react-18.2-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [AI Agents](#ai-agents)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

FOLIO MVP is a **Minimum Viable Product** implementation of a library management system, inspired by the [FOLIO Project](https://www.folio.org/). This project replicates core FOLIO functionalities using a Python-based backend (instead of Java/Vert.x) and a modern React frontend.

### Key Objectives

- **Educational**: Learn about library management systems and microservices architecture
- **Modernized Stack**: Use Python FastAPI for rapid API development
- **Clean Architecture**: Follow best practices for maintainable code
- **Production-Ready Patterns**: Implement authentication, authorization, and data validation

---

## Features

### Core Modules

#### 1. User Management
- Create, read, update, and delete users
- Patron groups (Undergraduate, Graduate, Faculty, Staff)
- User profiles with personal information
- Multiple addresses per user
- Custom fields support
- User barcode system
- Account expiration management

#### 2. Inventory Management
- **Instances**: Bibliographic records (titles, authors, ISBNs)
- **Holdings**: Copy holdings information with call numbers
- **Items**: Physical copies with barcodes and statuses
- **Locations**: Library locations and service points
- Full MARC-style metadata support
- Classification and subject management

#### 3. Circulation
- **Check-out/Check-in**: Item circulation by barcode
- **Loans**: Track borrowed items with due dates
- **Renewals**: Automatic and manual loan renewal
- **Requests/Holds**: Item reservation system
- Patron queue management
- Overdue tracking

#### 4. Authentication & Authorization
- JWT-based authentication
- Token-based API access
- User session management
- Role-based access control (basic implementation)

### Technical Features

- RESTful API with OpenAPI documentation
- Async database operations with SQLAlchemy
- Pagination for all list endpoints
- Advanced search and filtering
- Input validation with Pydantic
- CORS support for frontend
- Error handling and logging

---

## Architecture

### System Architecture

```
┌─────────────────┐
│  React Frontend │
│  (Port 3000)    │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  FastAPI Backend│
│  (Port 8000)    │
└────────┬────────┘
         │ SQL
         ▼
┌─────────────────────────┐
│  PostgreSQL Database    │
│  (Local or Supabase)    │
└─────────────────────────┘
```

### Backend Architecture

**Layered Architecture Pattern:**

```
API Layer (FastAPI Routes)
    ↓
Business Logic Layer (Services)
    ↓
Data Access Layer (SQLAlchemy Models)
    ↓
Database (PostgreSQL)
```

**Key Patterns:**
- Repository Pattern for data access
- Dependency Injection for services
- Schema Validation with Pydantic
- JWT Authentication middleware

### Frontend Architecture

**Component Structure:**

```
App (Redux Provider)
  ├── Layout Components (Header, Sidebar)
  ├── Pages (Dashboard, Users, Inventory, Circulation)
  ├── Feature Components (User-specific, Inventory-specific)
  └── Common Components (Button, Table, Modal)
```

**State Management:**
- Redux Toolkit for global state
- React hooks for local state
- Async thunks for API calls

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Programming language |
| FastAPI | 0.109 | Web framework |
| SQLAlchemy | 2.0 | ORM and database toolkit |
| Pydantic | 2.5 | Data validation |
| PostgreSQL | 14+ | Database |
| asyncpg | 0.29 | Async PostgreSQL driver |
| python-jose | 3.3 | JWT handling |
| passlib | 1.7 | Password hashing |
| uvicorn | 0.27 | ASGI server |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI library |
| Redux Toolkit | 2.0 | State management |
| React Router | 6.20 | Routing |
| Axios | 1.6 | HTTP client |
| Vite | 5.0 | Build tool |
| React Hook Form | 7.49 | Form handling |

---

## Quick Start

### Prerequisites

- Python 3.11 or higher
- Node.js 18.x or higher
- **Supabase account (free)** OR PostgreSQL 14+ (local)
- Git (optional)

### Installation

1. **Clone or navigate to the project:**

```bash
cd E:\Folio\folio-mvp
```

2. **Set up the backend:**

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux
```

3. **Set up the database (Choose one):**

### 🌟 Option A: Supabase (Recommended - No local install!)

**5-minute cloud database setup:**

1. Go to https://supabase.com and create free account
2. Create new project, set password
3. Get connection string from Project Settings → Database → Connection string (URI)
4. Update `backend/.env`:

```ini
# Change from local to Supabase
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

**📖 Detailed guide:** `SUPABASE_QUICKSTART.txt`

### Option B: Local PostgreSQL

```sql
-- Using psql or pgAdmin
CREATE DATABASE folio_db;
CREATE USER folio_user WITH PASSWORD 'folio_password';
GRANT ALL PRIVILEGES ON DATABASE folio_db TO folio_user;
```

**📖 Detailed guide:** `START_POSTGRESQL.md`

4. **Create admin user:**

```bash
python create_admin.py
```

5. **Run the backend:**

```bash
python -m app.main
```

Backend will be available at http://localhost:8000

5. **Set up the frontend (new terminal):**

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at http://localhost:3000

6. **Login:**
   - Go to http://localhost:3000
   - Username: `admin`
   - Password: `admin123`

---

## Documentation

### Quick Start Guides
- **[START_HERE.txt](START_HERE.txt)** ⭐ - Main entry point, start here!
- **[SUPABASE_QUICKSTART.txt](SUPABASE_QUICKSTART.txt)** - 5-minute Supabase setup
- **[DATABASE_OPTIONS.md](DATABASE_OPTIONS.md)** - Compare database options

### Detailed Documentation
- **[Beginner Setup Guide](docs/BEGINNER_SETUP_GUIDE.md)** - Complete setup instructions
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Full API reference
- **[Supabase Setup Guide](SUPABASE_SETUP.md)** - Detailed Supabase documentation
- **Interactive API Docs**: http://localhost:8000/docs (when backend is running)

---

## AI Agents

The `Agents/` folder contains comprehensive documentation and configurations for AI-powered development agents designed to accelerate UI development and enhance the project workflow.

### What's Included

- **[README.md](Agents/README.md)** - Overview of the AI agent system
- **[QUICK_START.md](Agents/QUICK_START.md)** - Get started with AI agents in 5 minutes
- **[QUICK_START_GUIDE.md](Agents/QUICK_START_GUIDE.md)** - Detailed quick start guide
- **[IMPLEMENTATION_GUIDE.md](Agents/IMPLEMENTATION_GUIDE.md)** - Step-by-step implementation instructions
- **[AGENT_CONFIGURATIONS.md](Agents/AGENT_CONFIGURATIONS.md)** - Agent configuration reference
- **[EXAMPLE_PROMPTS.md](Agents/EXAMPLE_PROMPTS.md)** - Ready-to-use example prompts
- **[SETUP_CHECKLIST.md](Agents/SETUP_CHECKLIST.md)** - Complete setup checklist
- **[PROGRESS_CHECKLIST.md](Agents/PROGRESS_CHECKLIST.md)** - Track your implementation progress
- **[ui-designer-agent.json](Agents/ui-designer-agent.json)** - UI Designer agent configuration
- **[context-template.md](Agents/context-template.md)** - Template for providing context to agents

### Key Features

- **UI Designer Agent**: Automates React component creation with best practices
- **Pre-configured Prompts**: Ready-to-use prompts for common development tasks
- **Context Management**: Templates for providing project context to AI agents
- **Implementation Guides**: Step-by-step instructions for integrating AI agents
- **Progress Tracking**: Checklists to monitor your agent implementation

### Getting Started with Agents

1. Read the [Quick Start Guide](Agents/QUICK_START.md)
2. Review the [Example Prompts](Agents/EXAMPLE_PROMPTS.md)
3. Use the [UI Designer Agent](Agents/ui-designer-agent.json) configuration
4. Follow the [Implementation Guide](Agents/IMPLEMENTATION_GUIDE.md) for integration

These AI agents are designed to work with tools like Claude, ChatGPT, or other AI assistants to streamline your development workflow.

---

## Project Structure

```
folio-mvp/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/            # API version 1 endpoints
│   │   │       ├── auth.py    # Authentication endpoints
│   │   │       ├── users.py   # User management
│   │   │       ├── inventory.py   # Inventory management
│   │   │       └── circulation.py # Circulation endpoints
│   │   ├── core/              # Core utilities
│   │   │   ├── config.py      # Configuration
│   │   │   └── security.py    # Authentication & security
│   │   ├── db/                # Database
│   │   │   └── session.py     # Database session management
│   │   ├── models/            # SQLAlchemy models
│   │   │   ├── user.py        # User models
│   │   │   ├── inventory.py  # Inventory models
│   │   │   └── circulation.py # Circulation models
│   │   ├── schemas/           # Pydantic schemas
│   │   │   ├── user.py
│   │   │   ├── inventory.py
│   │   │   └── circulation.py
│   │   └── main.py            # Application entry point
│   ├── tests/                 # Backend tests
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment variables template
│
├── frontend/                  # React frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── common/       # Reusable components
│   │   │   └── layout/       # Layout components
│   │   ├── pages/            # Page components
│   │   │   └── Users/        # User management pages
│   │   ├── services/         # API service layer
│   │   │   └── api.js        # Axios API client
│   │   ├── store/            # Redux store
│   │   │   ├── slices/       # Redux slices
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── usersSlice.js
│   │   │   │   ├── inventorySlice.js
│   │   │   │   └── circulationSlice.js
│   │   │   └── store.js      # Store configuration
│   │   ├── styles/           # CSS styles
│   │   │   └── main.css
│   │   ├── App.jsx           # Main App component
│   │   └── main.jsx          # Application entry point
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite configuration
│
├── Agents/                   # AI Development Agents
│   ├── README.md             # Agents overview
│   ├── QUICK_START.md        # Quick start guide
│   ├── QUICK_START_GUIDE.md  # Detailed quick start
│   ├── IMPLEMENTATION_GUIDE.md # Implementation instructions
│   ├── AGENT_CONFIGURATIONS.md # Configuration reference
│   ├── EXAMPLE_PROMPTS.md    # Example prompts
│   ├── SETUP_CHECKLIST.md    # Setup checklist
│   ├── PROGRESS_CHECKLIST.md # Progress tracking
│   ├── ui-designer-agent.json # UI Designer config
│   └── context-template.md   # Context template
│
└── docs/                     # Documentation
    ├── API_DOCUMENTATION.md
    └── BEGINNER_SETUP_GUIDE.md
```

---

## Development

### Backend Development

**Running with auto-reload:**

```bash
cd backend
uvicorn app.main:app --reload
```

**Database migrations** (future enhancement):

Currently, the app creates tables automatically on startup. For production, consider using Alembic:

```bash
pip install alembic
alembic init migrations
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

**Adding new endpoints:**

1. Create model in `app/models/`
2. Create Pydantic schemas in `app/schemas/`
3. Create API endpoints in `app/api/v1/`
4. Register router in `app/main.py`

### Frontend Development

**Running development server:**

```bash
cd frontend
npm run dev
```

**Building for production:**

```bash
npm run build
```

**Adding new features:**

1. Create Redux slice in `src/store/slices/`
2. Add API methods in `src/services/api.js`
3. Create components in `src/components/`
4. Create pages in `src/pages/`
5. Add routes in `src/App.jsx`

---

## Testing

### Backend Testing

```bash
cd backend
pytest
```

### Frontend Testing

```bash
cd frontend
npm test
```

---

## Deployment

### Backend Deployment

**Using Docker:**

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Environment Variables** (Production):

```ini
DEBUG=False
ENVIRONMENT=production
SECRET_KEY=<generate-strong-secret-key>
DATABASE_URL=postgresql+asyncpg://user:pass@prod-db:5432/folio_db
```

### Frontend Deployment

```bash
npm run build
# Serve the dist/ folder with nginx or any static file server
```

---

## Comparison with Original FOLIO

| Feature | Original FOLIO | This MVP |
|---------|----------------|----------|
| Backend Language | Java + Vert.x | Python + FastAPI |
| API Gateway | Okapi | None (direct API) |
| Multi-tenancy | Full support | Basic (single tenant) |
| Module System | Dynamic module loading | Monolithic API |
| Authentication | Okapi + OAuth/SAML | JWT tokens |
| Database | PostgreSQL | PostgreSQL |
| Frontend | React (Stripes framework) | React (standard setup) |
| Microservices | Yes | No (MVP monolith) |

**When to use this MVP:**
- Learning library management concepts
- Small library (< 10,000 items)
- Prototyping new features
- Educational purposes

**When to use original FOLIO:**
- Large academic/research libraries
- Need for complex multi-tenancy
- Require extensive third-party integrations
- Production-scale deployments

---

## Future Enhancements

- [ ] Add comprehensive test suite
- [ ] Implement database migrations with Alembic
- [ ] Add fee/fine management
- [ ] Implement patron blocks
- [ ] Add reports and analytics
- [ ] Email notifications
- [ ] Barcode scanning interface
- [ ] Mobile-responsive design
- [ ] Docker Compose setup
- [ ] Multi-tenancy support
- [ ] Role-based permissions (full RBAC)
- [ ] Integration with external systems (Z39.50, SIP2)

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Acknowledgments

- Inspired by the [FOLIO Project](https://www.folio.org/)
- Based on FOLIO's module architecture and API design patterns
- Built for educational and demonstration purposes

---

## Support

For questions or issues:

1. Check the [Beginner Setup Guide](docs/BEGINNER_SETUP_GUIDE.md)
2. Review the [API Documentation](docs/API_DOCUMENTATION.md)
3. Open an issue on the project repository

---

## Authors

Created as an MVP implementation of FOLIO using modern Python and React technologies.

**Original FOLIO Project**: https://www.folio.org/
**FOLIO GitHub**: https://github.com/folio-org

---

**Note**: This is an educational MVP and not affiliated with the official FOLIO project. For production library systems, please refer to the official FOLIO platform at https://www.folio.org/.
