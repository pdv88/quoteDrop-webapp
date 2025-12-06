import { Router } from 'express';
import { supabase } from '../db/supabase';
import { requireAuth } from '../middleware/auth';
import { generateQuotePDF } from '../services/pdf.service';
import { sendQuoteEmail } from '../services/email.service';

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
        const { client_id, items, notes, valid_until, tax_rate, terms_conditions, expiration_date, template = 'standard' } = req.body;

        if (!client_id || !items || items.length === 0) {
            return res.status(400).json({ error: 'Client and items are required' });
        }

        // Check quote limit for free users
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', userId)
            .single();

        if (profile?.subscription_tier === 'free') {
            // Get first day of current month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const { count, error: countError } = await supabase
                .from('quotes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', startOfMonth.toISOString());

            if (countError) {
                console.error('Error counting quotes:', countError);
                return res.status(500).json({ error: 'Error checking quote limit' });
            }

            if (count !== null && count >= 5) {
                return res.status(403).json({
                    error: 'Monthly quote limit reached. Please upgrade to Premium to create more quotes.'
                });
            }
        }

        // Validate template for premium users (existing check, slightly modified to reuse profile)
        if (template !== 'standard') {
            if (profile?.subscription_tier !== 'premium') {
                return res.status(403).json({ error: 'Premium templates are only available for premium users' });
            }
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
                tax_rate,
                terms_conditions,
                expiration_date,
                template,
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
        const { client_id, items, notes, valid_until, tax_rate, terms_conditions, expiration_date, template } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Items are required' });
        }

        // Validate template for premium users
        if (template && template !== 'standard') {
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_tier')
                .eq('id', userId)
                .single();

            if (profile?.subscription_tier !== 'premium') {
                return res.status(403).json({ error: 'Premium templates are only available for premium users' });
            }
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
                tax_rate,
                terms_conditions,
                expiration_date,
                template,
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

// Send quote via email
router.post('/:id/send', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { subject, message } = req.body;

        // 1. Fetch quote with client and items
        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .select(`
                *,
                clients (
                    name,
                    email,
                    address,
                    phone
                )
            `)
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (quoteError || !quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }

        // Fetch items separately to ensure we get them all
        const { data: items, error: itemsError } = await supabase
            .from('quote_items')
            .select('*')
            .eq('quote_id', id);

        if (items) {
            quote.items = items;
        }

        // 2. Fetch user profile for company info
        const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError) {
            return res.status(400).json({ error: 'User profile not found' });
        }

        // 3. Generate PDF
        const pdfBuffer = await generateQuotePDF(quote, userProfile);

        // 4. Send Email
        const emailSubject = subject || `Quote #${quote.quote_number} from ${userProfile.company_name || userProfile.full_name}`;
        const emailMessage = message || `Dear ${quote.clients.name},\n\nPlease find attached the quote #${quote.quote_number}.\n\nBest regards,\n${userProfile.full_name}`;

        const emailResult = await sendQuoteEmail(
            quote.clients.email,
            emailSubject,
            emailMessage,
            pdfBuffer,
            `Quote_${quote.quote_number}.pdf`
        );

        // 5. Update status to 'sent'
        const { error: updateError } = await supabase
            .from('quotes')
            .update({
                status: 'sent',
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) {
            console.error('Error updating quote status:', updateError);
        }

        res.json({
            message: 'Email sent successfully',
            previewUrl: emailResult.previewUrl
        });

    } catch (error: any) {
        console.error('Send quote error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
