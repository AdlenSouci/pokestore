const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface CartItem {
    id: number;
    cardId: number;
    quantity: number;
    card: {
        id: number;
        name: string;
        type: string;
        rarity: string;
        imageUrl: string;
        price: number;
    };
}

export interface Cart {
    id: number;
    userId: number;
    status: string;
    items: CartItem[];
}

class CartService {
    private getAuthHeader(): Record<string, string> {
        const token = localStorage.getItem('access_token');
        console.log('🔑 Cart Service - Token récupéré:', token ? `${token.substring(0, 20)}...` : 'AUCUN TOKEN');
        if (!token) return {};
        return { Authorization: `Bearer ${token}` };
    }

    async getCart(): Promise<Cart> {
        console.log('🛒 Cart Service - Récupération du panier...');
        const headers = this.getAuthHeader();
        console.log('📋 Headers:', headers);

        const response = await fetch(`${API_URL}/cart`, {
            headers,
        });

        if (!response.ok) {
            console.error('❌ Erreur réponse:', response.status, response.statusText);
            throw new Error('Erreur lors de la récupération du panier');
        }

        const data = await response.json();
        console.log('✅ Panier récupéré:', data);
        return data;
    }

    async addToCart(cardId: number, quantity: number = 1): Promise<Cart> {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
            },
            body: JSON.stringify({ cardId, quantity }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de l\'ajout au panier');
        }

        return response.json();
    }

    async updateCartItem(cardId: number, quantity: number): Promise<Cart> {
        const response = await fetch(`${API_URL}/cart/${cardId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeader(),
            },
            body: JSON.stringify({ quantity }),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour du panier');
        }

        return response.json();
    }

    async removeFromCart(cardId: number): Promise<Cart> {
        const response = await fetch(`${API_URL}/cart/${cardId}`, {
            method: 'DELETE',
            headers: this.getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de l\'article');
        }

        return response.json();
    }

    async clearCart(): Promise<Cart> {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'DELETE',
            headers: this.getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error('Erreur lors du vidage du panier');
        }

        return response.json();
    }
}

export const cartService = new CartService();
