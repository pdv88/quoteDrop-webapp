# QuoteDrop Server - Quick Start Guide

## The server won't start because Supabase credentials are missing!

You have two options:

### Option 1: Use Supabase (Recommended for Production)

1. **Create a Supabase project:**
   - Go to https://supabase.com
   - Create a free account
   - Create a new project

2. **Get your credentials:**
   - In your Supabase project dashboard, go to Settings → API
   - Copy the **Project URL** and **anon/public key**

3. **Update server/.env file:**
   ```env
   PORT=3000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   STRIPE_SECRET_KEY=
   ```

4. **Run the database schema:**
   - In Supabase dashboard, go to SQL Editor
   - Copy and paste the contents of `server/src/db/schema.sql`
   - Click "Run"

5. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

### Option 2: Skip Supabase for Now (Quick Test)

If you just want to test the server without setting up Supabase:

1. **Comment out Supabase in the code temporarily:**
   
   Edit `server/src/db/supabase.ts` and change it to:
   ```typescript
   // Temporary mock for testing without Supabase
   export const supabase = null as any;
   ```

2. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

   **Note:** This will let the server start, but auth routes won't work until you set up Supabase.

## Current Server Commands

- `npm run dev` - Start development server (use this!)
- `npm run build` - Build for production
- `npm start` - Run production build (requires `npm run build` first)

## What's Next?

Once the server is running, you can:
- Test login/register from the frontend (http://localhost:5173)
- The server will run on http://localhost:3000
- API endpoints will be available at http://localhost:3000/api/*
