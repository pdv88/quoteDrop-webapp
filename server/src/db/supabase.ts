import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
    try {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
        console.log('✅ Supabase client initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error);
    }
} else {
    console.warn('');
    console.warn('⚠️  ========================================');
    console.warn('⚠️  WARNING: Supabase is NOT configured!');
    console.warn('⚠️  ========================================');
    console.warn('⚠️  The server will start but auth will NOT work.');
    console.warn('⚠️  ');
    console.warn('⚠️  To fix this:');
    console.warn('⚠️  1. Go to https://supabase.com');
    console.warn('⚠️  2. Create a project');
    console.warn('⚠️  3. Get your URL and anon key from Settings → API');
    console.warn('⚠️  4. Add them to server/.env:');
    console.warn('⚠️     SUPABASE_URL=https://your-project.supabase.co');
    console.warn('⚠️     SUPABASE_ANON_KEY=your-anon-key-here');
    console.warn('⚠️  ========================================');
    console.warn('');
}

// Export a proxy that provides helpful error messages
export const supabase = new Proxy({} as SupabaseClient, {
    get(target, prop) {
        if (!supabaseClient) {
            throw new Error(
                'Supabase is not configured. Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file.'
            );
        }
        return (supabaseClient as any)[prop];
    }
});
