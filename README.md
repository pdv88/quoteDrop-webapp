# QuoteDrop Webapp - README

## Project Structure

```
quoteDrop-webapp/
├── client/          # Frontend (Vite + React + TypeScript + Tailwind)
├── server/          # Backend (Node + Express + TypeScript)
└── package.json     # Root package for running both
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Configure Environment Variables

Create `server/.env` file:
```
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 3. Setup Database

Run the SQL schema in your Supabase project:
```bash
# Execute server/src/db/schema.sql in Supabase SQL Editor
```

### 4. Run Development Servers

From the root directory:
```bash
npm start
```

This will run both:
- Client: http://localhost:5173
- Server: http://localhost:3000

## Features Implemented

### Frontend Pages
- ✅ Homepage (with hero, features, pricing)
- ✅ Login Page
- ✅ Register Page (with Google OAuth button)
- ✅ Dashboard (with graphs and stats)
- ✅ Clients Management (list, create, details)
- ✅ Client Details (with quotes and analytics)
- ✅ Create Quote (with service selection and preview)
- ✅ Settings (user info and services management)

### Backend API
- ✅ Auth routes (/api/auth)
- ✅ User routes (/api/users)
- ✅ Clients routes (/api/clients)
- ✅ Services routes (/api/services)
- ✅ Quotes routes (/api/quotes)

### Database Schema
- ✅ Profiles table
- ✅ Clients table
- ✅ Services table
- ✅ Quotes table
- ✅ Quote Items table
- ✅ Row Level Security policies

## Next Steps

1. **Connect Frontend to Backend**: Update API calls in pages to use actual backend endpoints
2. **Implement Authentication**: Connect Supabase Auth with frontend
3. **Google OAuth**: Configure Google OAuth in Supabase
4. **PDF Generation**: Implement PDF generation for quotes
5. **Email Service**: Setup email sending for quotes
6. **Stripe Integration**: Complete subscription payment flow
7. **Deploy to Railway**: Configure deployment settings

## Tech Stack

- **Frontend**: Vite, React, TypeScript, Tailwind CSS, React Router, Recharts
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Payment**: Stripe
- **Deployment**: Railway
