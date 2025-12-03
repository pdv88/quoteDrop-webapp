import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../db/supabase';

const router = Router();

/**
 * ALTERNATIVE AUTH IMPLEMENTATION
 * This version uses custom password storage instead of Supabase Auth
 * Use this if you want full control over password management
 */

// Register - Create user with custom password storage
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

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user in Supabase Auth first
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

        // Store hashed password in custom table (optional)
        const { error: credError } = await supabase
            .from('user_credentials')
            .insert({
                user_id: authData.user?.id,
                password_hash: hashedPassword
            });

        if (credError) {
            console.error('Error storing credentials:', credError);
            // Continue anyway since Supabase Auth has the password
        }

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

// Login - Custom password verification
router.post('/login-custom', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, full_name, company_name, subscription_tier')
            .eq('email', email)
            .single();

        if (profileError || !profile) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Get stored password hash
        const { data: credentials, error: credError } = await supabase
            .from('user_credentials')
            .select('password_hash')
            .eq('user_id', profile.id)
            .single();

        if (credError || !credentials) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, credentials.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create session with Supabase Auth
        const { data: session, error: sessionError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (sessionError) {
            return res.status(401).json({ error: 'Failed to create session' });
        }

        res.json({
            message: 'Login successful',
            session: {
                access_token: session.session?.access_token,
                refresh_token: session.session?.refresh_token,
                user: {
                    id: profile.id,
                    email: profile.email,
                    full_name: profile.full_name,
                    company_name: profile.company_name,
                    subscription_tier: profile.subscription_tier
                }
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Change password
router.post('/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Validate new password
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        // Get current password hash
        const { data: credentials } = await supabase
            .from('user_credentials')
            .select('password_hash')
            .eq('user_id', user.id)
            .single();

        if (credentials) {
            // Verify current password
            const isValid = await bcrypt.compare(currentPassword, credentials.password_hash);
            if (!isValid) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password in Supabase Auth
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            return res.status(400).json({ error: updateError.message });
        }

        // Update custom credentials table
        await supabase
            .from('user_credentials')
            .update({ password_hash: hashedPassword, updated_at: new Date() })
            .eq('user_id', user.id);

        res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
