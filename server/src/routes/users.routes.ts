import { Router } from 'express';
import { supabase } from '../db/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Get profile error:', error);
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(profile);
    } catch (error: any) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { full_name, company_name, phone, logo_url, tax_rate, terms_conditions } = req.body;

        const { data: profile, error } = await supabase
            .from('profiles')
            .update({
                full_name,
                company_name,
                phone,
                logo_url,
                tax_rate,
                terms_conditions,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Supabase update error:', error);
            return res.status(400).json({ error: error.message });
        }

        res.json(profile);
    } catch (error: any) {
        console.error('❌ Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update subscription tier
router.put('/subscription', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { subscription_tier, stripe_customer_id } = req.body;

        if (!['free', 'premium'].includes(subscription_tier)) {
            return res.status(400).json({ error: 'Invalid subscription tier' });
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .update({
                subscription_tier,
                stripe_customer_id,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(profile);
    } catch (error: any) {
        console.error('Update subscription error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
