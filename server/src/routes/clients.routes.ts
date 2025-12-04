import { Router } from 'express';
import { supabase } from '../db/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// List all clients for authenticated user
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;

        const { data: clients, error } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(clients || []);
    } catch (error: any) {
        console.error('List clients error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new client
router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { name, email, address, phone } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const { data: client, error } = await supabase
            .from('clients')
            .insert({
                user_id: userId,
                name,
                email,
                address,
                phone
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json(client);
    } catch (error: any) {
        console.error('Create client error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single client with stats
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        // Get client
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (clientError) {
            return res.status(404).json({ error: 'Client not found' });
        }

        // Get quotes for this client
        const { data: quotes, error: quotesError } = await supabase
            .from('quotes')
            .select('*')
            .eq('client_id', id)
            .eq('user_id', userId);

        if (quotesError) {
            console.error('Error fetching quotes:', quotesError);
        }

        // Calculate stats
        const totalQuotes = quotes?.length || 0;
        const totalQuoted = quotes?.reduce((sum, q) => sum + (parseFloat(q.total_amount) || 0), 0) || 0;
        const totalPaid = quotes?.filter(q => q.status === 'paid')
            .reduce((sum, q) => sum + (parseFloat(q.total_amount) || 0), 0) || 0;

        res.json({
            ...client,
            stats: {
                total_quotes: totalQuotes,
                total_quoted: totalQuoted,
                total_paid: totalPaid
            },
            quotes: quotes || []
        });
    } catch (error: any) {
        console.error('Get client error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update client
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { name, email, address, phone } = req.body;

        const { data: client, error } = await supabase
            .from('clients')
            .update({
                name,
                email,
                address,
                phone,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(client);
    } catch (error: any) {
        console.error('Update client error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete client
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Client deleted successfully' });
    } catch (error: any) {
        console.error('Delete client error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
