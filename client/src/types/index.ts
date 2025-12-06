// TypeScript interfaces for API data types

export interface User {
    id: string;
    email: string;
    full_name?: string;
    company_name?: string;
    phone?: string;
    logo_url?: string;
    subscription_tier: 'free' | 'premium';
    stripe_customer_id?: string;
    tax_rate?: number;
    terms_conditions?: string;
    created_at: string;
    updated_at: string;
}

export interface Client {
    id: string;
    user_id: string;
    name: string;
    email: string;
    address?: string;
    phone?: string;
    created_at: string;
    updated_at: string;
    total_quotes?: number;
}

export interface ClientWithStats extends Client {
    stats: {
        total_quotes: number;
        total_quoted: number;
        total_paid: number;
    };
    quotes?: Quote[];
}

export interface Service {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    unit_cost: number;
    unit_type: string;
    created_at: string;
}

export interface QuoteItem {
    id: string;
    quote_id: string;
    service_id?: string;
    description: string;
    quantity: number;
    unit_cost: number;
    total: number;
    created_at: string;
}

export interface Quote {
    id: string;
    user_id: string;
    client_id: string;
    quote_number: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'paid' | 'partial';
    template?: 'standard' | 'modern' | 'minimal';
    total_amount: number;
    paid_amount?: number;
    tax_rate?: number;
    terms_conditions?: string;
    expiration_date?: string;
    valid_until?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    clients?: {
        id: string;
        name: string;
        email: string;
        address?: string;
        phone?: string;
    };
    items?: QuoteItem[];
}

export interface CreateClientData {
    name: string;
    email: string;
    address?: string;
    phone?: string;
}

export interface CreateServiceData {
    name: string;
    description?: string;
    unit_cost: number;
    unit_type?: string;
}

export interface CreateQuoteData {
    client_id: string;
    items: {
        service_id?: string;
        description: string;
        quantity: number;
        unit_cost: number;
    }[];
    tax_rate?: number;
    terms_conditions?: string;
    expiration_date?: string;
    notes?: string;
    valid_until?: string;
    template?: 'standard' | 'modern' | 'minimal';
}

export interface UpdateProfileData {
    full_name?: string;
    company_name?: string;
    phone?: string;
    logo_url?: string;
    tax_rate?: number;
    terms_conditions?: string;
}
