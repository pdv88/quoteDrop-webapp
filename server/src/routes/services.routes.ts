import { Router } from 'express';
import { supabase } from '../db/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// List all services for authenticated user
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;

        const { data: services, error } = await supabase
            .from('services')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(services || []);
    } catch (error: any) {
        console.error('List services error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new service
router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { name, description, unit_cost, unit_type } = req.body;

        if (!name || unit_cost === undefined) {
            return res.status(400).json({ error: 'Name and unit cost are required' });
        }

        const { data: service, error } = await supabase
            .from('services')
            .insert({
                user_id: userId,
                name,
                description,
                unit_cost,
                unit_type: unit_type || 'hour'
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json(service);
    } catch (error: any) {
        console.error('Create service error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update service
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { name, description, unit_cost, unit_type } = req.body;

        const { data: service, error } = await supabase
            .from('services')
            .update({
                name,
                description,
                unit_cost,
                unit_type
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(service);
    } catch (error: any) {
        console.error('Update service error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete service
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Service deleted successfully' });
    } catch (error: any) {
        console.error('Delete service error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
