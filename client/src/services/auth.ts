// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Auth Helper Functions
export const authService = {
    // Login
    async login(email: string, password: string) {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Store session
        localStorage.setItem('access_token', data.session.access_token);
        localStorage.setItem('refresh_token', data.session.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.session.user));

        return data;
    },

    // Register
    async register(email: string, password: string, firstName: string, lastName: string) {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, firstName, lastName }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        return data;
    },

    // Logout
    async logout() {
        const token = localStorage.getItem('access_token');

        if (token) {
            try {
                await fetch(`${API_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        // Clear local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Get access token
    getAccessToken() {
        return localStorage.getItem('access_token');
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem('access_token');
    },
};

// API request helper with auth
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const token = authService.getAccessToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Merge with any additional headers from options
    if (options.headers) {
        Object.assign(headers, options.headers);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}
