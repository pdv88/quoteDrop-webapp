import { Router } from 'express';
import { supabase } from '../db/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// List all quotes for authenticated user
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;

        const { data: quotes, error } = await supabase
            .from('quotes')
            .select(`
        *,
        clients (
          id,
          name,
          email
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(quotes || []);
    } catch (error: any) {
        console.error('List quotes error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new quote with items
router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { client_id, items, notes, valid_until } = req.body;

        if (!client_id || !items || items.length === 0) {
            return res.status(400).json({ error: 'Client and items are required' });
        }

        // Calculate total
        const total_amount = items.reduce((sum: number, item: any) => {
            return sum + (item.quantity * item.unit_cost);
        }, 0);

        // Create quote
        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .insert({
                user_id: userId,
                client_id,
                total_amount,
                notes,
                valid_until,
                status: 'draft'
            })
            .select()
            .single();

        if (quoteError) {
            return res.status(400).json({ error: quoteError.message });
        }

        // Create quote items
        const quoteItems = items.map((item: any) => ({
            quote_id: quote.id,
            service_id: item.service_id || null,
            description: item.description,
            quantity: item.quantity,
            unit_cost: item.unit_cost
        }));

        const { data: createdItems, error: itemsError } = await supabase
            .from('quote_items')
            .insert(quoteItems)
            .select();

        if (itemsError) {
            // Rollback quote if items fail
            await supabase.from('quotes').delete().eq('id', quote.id);
            return res.status(400).json({ error: itemsError.message });
        }

        res.status(201).json({
            ...quote,
            items: createdItems
        });
    } catch (error: any) {
        console.error('Create quote error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single quote with items
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        // Get quote
        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .select(`
        *,
        clients (
          id,
          name,
          email,
          address,
          phone
        )
      `)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (quoteError) {
            return res.status(404).json({ error: 'Quote not found' });
        }

        // Get quote items
        const { data: items, error: itemsError } = await supabase
            .from('quote_items')
            .select('*')
            .eq('quote_id', id);

        if (itemsError) {
            console.error('Error fetching items:', itemsError);
        }

        res.json({
            ...quote,
            items: items || []
        });
    } catch (error: any) {
        console.error('Get quote error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update quote
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { client_id, items, notes, valid_until } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Items are required' });
        }

        // Calculate total
        const total_amount = items.reduce((sum: number, item: any) => {
            return sum + (item.quantity * item.unit_cost);
        }, 0);

        // Update quote
        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .update({
                client_id,
                total_amount,
                notes,
                valid_until,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (quoteError) {
            return res.status(400).json({ error: quoteError.message });
        }

        // Delete existing items
        const { error: deleteError } = await supabase
            .from('quote_items')
            .delete()
            .eq('quote_id', id);

        if (deleteError) {
            return res.status(400).json({ error: deleteError.message });
        }

        // Create new items
        const quoteItems = items.map((item: any) => ({
            quote_id: id,
            service_id: item.service_id || null,
            description: item.description,
            quantity: item.quantity,
            unit_cost: item.unit_cost
        }));

        const { data: createdItems, error: itemsError } = await supabase
            .from('quote_items')
            .insert(quoteItems)
            .select();

        if (itemsError) {
            return res.status(400).json({ error: itemsError.message });
        }

        res.json({
            ...quote,
            items: createdItems
        });
    } catch (error: any) {
        console.error('Update quote error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update quote status
router.put('/:id/status', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { status, paid_amount } = req.body;

        const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'paid', 'partial'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updateData: any = {
            status,
            updated_at: new Date().toISOString()
        };

        // Handle paid amount logic
        if (status === 'paid') {
            // If paid, set paid_amount to total_amount (need to fetch quote first or use a trigger, 
            // but for now let's just assume we want to set it equal to total if not provided, 
            // or better yet, let's fetch the quote to get the total)
            const { data: currentQuote } = await supabase
                .from('quotes')
                .select('total_amount')
                .eq('id', id)
                .single();

            if (currentQuote) {
                updateData.paid_amount = currentQuote.total_amount;
            }
        } else if (status === 'partial' && paid_amount !== undefined) {
            updateData.paid_amount = paid_amount;
        }

        const { data: quote, error } = await supabase
            .from('quotes')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(quote);
    } catch (error: any) {
        console.error('Update quote status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete quote
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        // Items will be deleted automatically due to cascade
        const { error } = await supabase
            .from('quotes')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Quote deleted successfully' });
    } catch (error: any) {
        console.error('Delete quote error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
