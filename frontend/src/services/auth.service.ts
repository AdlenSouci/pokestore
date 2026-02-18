const API_URL = 'http://localhost:3000';

export interface User {
    id: number;
    email: string;
    name: string;
    phone?: string;
    hasPassword?: boolean;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

class AuthService {
    private token: string | null = null;
    private user: User | null = null;

    constructor() {
        // Charger le token depuis localStorage au démarrage
        this.token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');
        if (userStr) {
            this.user = JSON.parse(userStr);
        }
    }

    async register(email: string, password: string, name: string): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de l\'inscription');
        }

        const data: AuthResponse = await response.json();
        this.setAuth(data);
        return data;
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la connexion');
        }

        const data: AuthResponse = await response.json();
        this.setAuth(data);
        return data;
    }

    loginWithGoogle() {
        // Rediriger vers l'endpoint Google OAuth
        window.location.href = `${API_URL}/auth/google`;
    }

    async handleGoogleCallback(token: string) {
        try {
            // Récupérer les infos utilisateur avec le token
            const response = await fetch(`${API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du profil');
            }

            const user = await response.json();
            this.setAuth({ access_token: token, user });
            return user;
        } catch (error) {
            console.error('Erreur lors du callback Google:', error);
            throw error;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
    }

    getUser(): User | null {
        return this.user;
    }

    getToken(): string | null {
        return this.token;
    }

    isAuthenticated(): boolean {
        return !!this.token;
    }

    private setAuth(data: AuthResponse) {
        this.token = data.access_token;
        this.user = data.user;
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }
}

export const authService = new AuthService();
