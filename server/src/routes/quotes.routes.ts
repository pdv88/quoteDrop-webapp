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

// List Quotes
router.get('/', requireAuth, async (req: any, res) => {
    const { data, error } = await supabase
        .from('quotes')
        .select('*, client:clients(name)')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Create Quote
router.post('/', requireAuth, async (req: any, res) => {
    const { client_id, valid_until, notes, items } = req.body;

    // 1. Create Quote
    const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
            user_id: req.user.id,
            client_id,
            valid_until,
            notes,
            status: 'draft'
        })
        .select()
        .single();

    if (quoteError) return res.status(400).json({ error: quoteError.message });

    // 2. Create Quote Items
    if (items && items.length > 0) {
        const quoteItems = items.map((item: any) => ({
            quote_id: quote.id,
            description: item.description,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            service_id: item.service_id // Optional
        }));

        const { error: itemsError } = await supabase
            .from('quote_items')
            .insert(quoteItems);

        if (itemsError) {
            // Rollback (delete quote) - simplified transaction handling
            await supabase.from('quotes').delete().eq('id', quote.id);
            return res.status(400).json({ error: itemsError.message });
        }
    }

    // 3. Calculate Total (Trigger or manual update)
    // For now, let's just return the quote
    res.json(quote);
});

// Get Quote Details
router.get('/:id', requireAuth, async (req: any, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('quotes')
        .select('*, client:clients(*), items:quote_items(*)')
        .eq('id', id)
        .eq('user_id', req.user.id)
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// Update Quote Status
router.put('/:id/status', requireAuth, async (req: any, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase
        .from('quotes')
        .update({ status, updated_at: new Date() })
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

export default router;
