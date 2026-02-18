const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface OrderItem {
    id: number;
    cardId: number;
    quantity: number;
    price: number;
    card: {
        id: number;
        name: string;
        type: string;
        rarity: string;
        imageUrl: string;
        price: number;
    };
}

export interface Order {
    id: number;
    userId: number;
    total: number;
    status: 'PENDING' | 'PAID' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}

class OrderService {
    private getAuthHeader(): Record<string, string> {
        const token = localStorage.getItem('access_token');
        if (!token) return {};
        return { Authorization: `Bearer ${token}` };
    }

    async createOrder(): Promise<Order> {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: this.getAuthHeader(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la création de la commande');
        }

        return response.json();
    }

    async getOrders(): Promise<Order[]> {
        const response = await fetch(`${API_URL}/orders`, {
            headers: this.getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des commandes');
        }

        return response.json();
    }

    async getOrder(orderId: number): Promise<Order> {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            headers: this.getAuthHeader(),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération de la commande');
        }

        return response.json();
    }
}

export const orderService = new OrderService();
