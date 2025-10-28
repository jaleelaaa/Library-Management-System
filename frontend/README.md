# FOLIO LMS Frontend

React TypeScript frontend for the FOLIO Library Management System.

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
VITE_API_URL=http://localhost:8000/api/v1
```

## Technologies

- React 18+
- TypeScript
- Tailwind CSS
- Redux Toolkit
- React Router v6
- Vite

## Project Structure

```
src/
├── components/       # React components
├── pages/           # Page components
├── store/           # Redux store
├── services/        # API services
├── types/           # TypeScript types
└── utils/           # Utility functions
```
