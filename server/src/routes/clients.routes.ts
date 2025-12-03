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

// List Clients
router.get('/', requireAuth, async (req: any, res) => {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Create Client
router.post('/', requireAuth, async (req: any, res) => {
    const { name, email, address, phone } = req.body;
    const { data, error } = await supabase
        .from('clients')
        .insert({ user_id: req.user.id, name, email, address, phone })
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Get Client Details
router.get('/:id', requireAuth, async (req: any, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .eq('user_id', req.user.id)
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Update Client
router.put('/:id', requireAuth, async (req: any, res) => {
    const { id } = req.params;
    const { name, email, address, phone } = req.body;
    const { data, error } = await supabase
        .from('clients')
        .update({ name, email, address, phone, updated_at: new Date() })
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

export default router;
