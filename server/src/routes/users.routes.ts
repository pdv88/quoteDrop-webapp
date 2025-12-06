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

// Upload logo
import multer from 'multer';
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1 * 1024 * 1024 // 1MB limit
    }
});

router.post('/logo', requireAuth, upload.single('logo'), async (req, res) => {
    try {
        const userId = req.user?.id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Check subscription tier
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', userId)
            .single();

        if (profile?.subscription_tier !== 'premium') {
            return res.status(403).json({ error: 'Logo upload is a premium feature' });
        }

        const fileExt = file.originalname.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (uploadError) {
            console.error('Supabase storage error:', uploadError);
            return res.status(500).json({ error: 'Failed to upload logo' });
        }

        const { data: { publicUrl } } = supabase.storage
            .from('logos')
            .getPublicUrl(filePath);

        // Update profile with new logo URL
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                logo_url: publicUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) {
            return res.status(400).json({ error: updateError.message });
        }

        res.json({ logo_url: publicUrl });
    } catch (error: any) {
        console.error('Upload logo error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
