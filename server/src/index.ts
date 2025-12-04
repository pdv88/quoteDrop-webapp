import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration for production
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import clientsRoutes from './routes/clients.routes';
import servicesRoutes from './routes/services.routes';
import quotesRoutes from './routes/quotes.routes';

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/quotes', quotesRoutes);

app.get('/', (req, res) => {
    res.send('QuoteDrop API is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
