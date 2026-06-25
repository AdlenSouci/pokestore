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
    series?: string | null;
    tcgSetName?: string | null;
    releaseYear?: number | null;
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
