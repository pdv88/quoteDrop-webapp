import { Router } from 'express';
import { supabase } from '../db/supabase';

const router = Router();

// Middleware to check auth (simplified)
const requireAuth = async (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

    req.user = user;
    next();
};

// Get Profile
router.get('/profile', requireAuth, async (req: any, res) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', req.user.id)
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Update Profile
router.put('/profile', requireAuth, async (req: any, res) => {
    const { full_name, company_name, phone, logo_url } = req.body;
    const { data, error } = await supabase
        .from('profiles')
        .update({ full_name, company_name, phone, logo_url, updated_at: new Date() })
        .eq('id', req.user.id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

export default router;
