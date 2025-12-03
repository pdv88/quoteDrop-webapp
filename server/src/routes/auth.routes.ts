import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../db/supabase';

const router = Router();

// Register - Create user with hashed password
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Validate input
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: `${firstName} ${lastName}`,
                    first_name: firstName,
                    last_name: lastName
                }
            }
        });

        if (authError) {
            return res.status(400).json({ error: authError.message });
        }

        // Store hashed password in profiles table (optional - Supabase already handles this)
        // But if you want to manage passwords yourself, you'd store hashedPassword in a custom table

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: authData.user?.id,
                email: authData.user?.email,
                full_name: `${firstName} ${lastName}`
            }
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login - Verify password and create session
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Sign in with Supabase (it handles password comparison internally)
        const { data: session, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        res.json({
            message: 'Login successful',
            session: {
                access_token: session.session?.access_token,
                refresh_token: session.session?.refresh_token,
                user: {
                    id: session.user.id,
                    email: session.user.email,
                    full_name: profile?.full_name,
                    company_name: profile?.company_name,
                    subscription_tier: profile?.subscription_tier
                }
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Logout successful' });
    } catch (error: any) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

