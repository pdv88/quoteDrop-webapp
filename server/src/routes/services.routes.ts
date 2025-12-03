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

// List Services
router.get('/', requireAuth, async (req: any, res) => {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Create Service
router.post('/', requireAuth, async (req: any, res) => {
    const { name, description, unit_cost, unit_type } = req.body;
    const { data, error } = await supabase
        .from('services')
        .insert({ user_id: req.user.id, name, description, unit_cost, unit_type })
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Update Service
router.put('/:id', requireAuth, async (req: any, res) => {
    const { id } = req.params;
    const { name, description, unit_cost, unit_type } = req.body;
    const { data, error } = await supabase
        .from('services')
        .update({ name, description, unit_cost, unit_type })
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Delete Service
router.delete('/:id', requireAuth, async (req: any, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Service deleted' });
});

export default router;
