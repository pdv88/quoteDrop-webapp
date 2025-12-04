import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email?: string;
                [key: string]: any;
            };
        }
    }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Auth middleware: No token provided');
            return res.status(401).json({ error: 'Unauthorized - No token provided' });
        }

        const token = authHeader.split(' ')[1];
        // console.log('Auth middleware: Verifying token:', token.substring(0, 20) + '...');

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Auth middleware: Token verification failed:', error?.message);
            return res.status(401).json({ error: 'Unauthorized - Invalid token', details: error?.message });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
};
