import { apiRequest } from './auth';
import type {
    Client,
    ClientWithStats,
    Service,
    Quote,
    CreateClientData,
    CreateServiceData,
    CreateQuoteData,
    UpdateProfileData
} from '../types';

// User API
export const userApi = {
    getProfile: () => apiRequest('/api/users/profile'),

    updateProfile: (data: UpdateProfileData) =>
        apiRequest('/api/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    updateSubscription: (tier: 'free' | 'premium', stripeCustomerId?: string) =>
        apiRequest('/api/users/subscription', {
            method: 'PUT',
            body: JSON.stringify({
                subscription_tier: tier,
                stripe_customer_id: stripeCustomerId
            })
        }),

    uploadLogo: (file: File) => {
        const formData = new FormData();
        formData.append('logo', file);
        return apiRequest('/api/users/logo', {
            method: 'POST',
            body: formData as any, // apiRequest handles FormData if body is not stringified? No, fetch handles it.
            headers: {} // Let browser set Content-Type with boundary
        });
    }
};

// Clients API
export const clientsApi = {
    list: (): Promise<Client[]> => apiRequest('/api/clients'),

    create: (data: CreateClientData): Promise<Client> =>
        apiRequest('/api/clients', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    get: (id: string): Promise<ClientWithStats> =>
        apiRequest(`/api/clients/${id}`),

    update: (id: string, data: Partial<CreateClientData>): Promise<Client> =>
        apiRequest(`/api/clients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    delete: (id: string): Promise<{ message: string }> =>
        apiRequest(`/api/clients/${id}`, {
            method: 'DELETE'
        })
};

// Services API
export const servicesApi = {
    list: (): Promise<Service[]> => apiRequest('/api/services'),

    create: (data: CreateServiceData): Promise<Service> =>
        apiRequest('/api/services', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    update: (id: string, data: Partial<CreateServiceData>): Promise<Service> =>
        apiRequest(`/api/services/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    delete: (id: string): Promise<{ message: string }> =>
        apiRequest(`/api/services/${id}`, {
            method: 'DELETE'
        })
};

// Quotes API
export const quotesApi = {
    list: (): Promise<Quote[]> => apiRequest('/api/quotes'),

    create: (data: CreateQuoteData): Promise<Quote> =>
        apiRequest('/api/quotes', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    get: (id: string): Promise<Quote> =>
        apiRequest(`/api/quotes/${id}`),

    update: (id: string, data: CreateQuoteData): Promise<Quote> =>
        apiRequest(`/api/quotes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    updateStatus: (id: string, status: Quote['status'], paidAmount?: number): Promise<Quote> =>
        apiRequest(`/api/quotes/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, paid_amount: paidAmount })
        }),

    delete: (id: string): Promise<{ message: string }> =>
        apiRequest(`/api/quotes/${id}`, {
            method: 'DELETE'
        }),

    sendQuote: (id: string, data?: { subject: string; message: string }): Promise<{ message: string; previewUrl?: string }> =>
        apiRequest(`/api/quotes/${id}/send`, {
            method: 'POST',
            body: JSON.stringify(data || {})
        })
};

// Dashboard stats helper
export const dashboardApi = {
    getStats: async () => {
        const quotes = await quotesApi.list();

        const totalQuotes = quotes.length;
        const totalQuoted = quotes.reduce((sum, q) => sum + q.total_amount, 0);
        const totalPaid = quotes
            .filter(q => q.status === 'paid')
            .reduce((sum, q) => sum + q.total_amount, 0);

        // Group by month for chart
        const quotesByMonth: Record<string, number> = {};
        quotes.forEach(quote => {
            const month = new Date(quote.created_at).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
            });
            quotesByMonth[month] = (quotesByMonth[month] || 0) + 1;
        });

        // Status distribution
        const statusCounts: Record<string, number> = {};
        quotes.forEach(quote => {
            statusCounts[quote.status] = (statusCounts[quote.status] || 0) + 1;
        });

        return {
            totalQuotes,
            totalQuoted,
            totalPaid,
            quotesByMonth,
            statusCounts,
            recentQuotes: quotes.slice(0, 5),
            allQuotes: quotes
        };
    }
};
