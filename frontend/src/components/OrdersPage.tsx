import { useState, useEffect } from 'react';
import { Package, X, Calendar, DollarSign } from 'lucide-react';
import { orderService, type Order } from '../services/order.service';

interface OrdersPageProps {
    onClose: () => void;
    paymentSuccess?: boolean;
    paymentSessionId?: string | null;
}

export function OrdersPage({ onClose, paymentSuccess, paymentSessionId }: OrdersPageProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        const bootstrapOrders = async () => {
            if (paymentSuccess && paymentSessionId) {
                try {
                    await orderService.confirmPayment(paymentSessionId);
                } catch (err: any) {
                    setError(err.message || 'Impossible de confirmer le paiement');
                }
            }
            await loadOrders();
        };

        bootstrapOrders();
    }, [paymentSuccess, paymentSessionId]);

    const loadOrders = async () => {
        try {
            console.log('📦 Chargement des commandes...');
            setLoading(true);
            const data = await orderService.getOrders();
            console.log('✅ Commandes récupérées:', data.length, 'commande(s)');
            console.log('📋 Détails:', data);
            setOrders(data);
        } catch (err: any) {
            console.error('❌ Erreur chargement commandes:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-500';
            case 'PAID':
                return 'bg-green-500';
            case 'CANCELLED':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'En attente';
            case 'PAID':
                return 'Payée';
            case 'CANCELLED':
                return 'Annulée';
            default:
                return status;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative z-10 w-full max-w-6xl bg-gradient-to-br from-[#a8b5c8] to-[#8b9db5] rounded-2xl shadow-2xl border-4 border-[#2d3561] max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-4 border-[#2d3561] bg-gradient-to-r from-[#5a4f99] to-[#2d3561] sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Package className="w-8 h-8 text-white" />
                        <h2 className="text-white text-2xl pixel-font">MES COMMANDES</h2>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-[#7b6eb8] p-2 rounded-xl transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Bandeau succès paiement */}
                {paymentSuccess && (
                    <div className="bg-green-500 text-white p-4 text-center font-bold border-b-4 border-green-700 flex items-center justify-center gap-2">
                        🎉 Paiement confirmé ! Ta commande est validée. Un email de confirmation t'a été envoyé.
                    </div>
                )}

                {/* Messages */}
                {error && <div className="bg-red-500 text-white p-3 text-center font-bold border-b-4 border-red-700">{error}</div>}

                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2d3561] border-t-transparent"></div>
                            <p className="text-[#2d3561] mt-4 font-bold">Chargement...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-24 h-24 text-[#5a4f99] mx-auto mb-4 opacity-50" />
                            <h3 className="text-[#2d3561] text-2xl font-bold mb-2">Aucune commande</h3>
                            <p className="text-[#5a4f99] mb-6">Vous n'avez pas encore passé de commande</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-white/20 p-6 rounded-xl border-2 border-[#2d3561] hover:bg-white/30 transition cursor-pointer"
                                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-[#2d3561] font-bold text-xl">Commande #{order.id}</h3>
                                            <div className="flex items-center gap-2 mt-2 text-[#5a4f99]">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`${getStatusColor(order.status)} text-white px-4 py-2 rounded-full font-bold text-sm`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                            <div className="flex items-center gap-2 mt-3 text-[#2d3561] font-bold text-2xl">
                                                <DollarSign className="w-6 h-6" />
                                                <span>{order.total.toFixed(2)} €</span>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedOrder?.id === order.id && (
                                        <div className="mt-4 pt-4 border-t-2 border-[#2d3561]">
                                            <h4 className="text-[#2d3561] font-bold mb-3">Articles commandés :</h4>
                                            <div className="space-y-3">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="flex gap-4 items-center bg-white/30 p-3 rounded-lg">
                                                        <img
                                                            src={item.card.imageUrl}
                                                            alt={item.card.name}
                                                            className="w-16 h-20 object-cover rounded border-2 border-[#2d3561]"
                                                        />
                                                        <div className="flex-1">
                                                            <h5 className="text-[#2d3561] font-bold">{item.card.name}</h5>
                                                            <p className="text-[#5a4f99] text-sm">Quantité: {item.quantity}</p>
                                                        </div>
                                                        <div className="text-[#2d3561] font-bold">
                                                            {(item.price * item.quantity).toFixed(2)} €
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
