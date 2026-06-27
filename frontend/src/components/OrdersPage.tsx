import { useState, useEffect } from 'react';
import { Package, X, Calendar, DollarSign, ChevronDown } from 'lucide-react';
import { orderService, type Order } from '../services/order.service';
import { ModalShell, useDialogTitleId } from './ModalShell';

interface OrdersPageProps {
    onClose: () => void;
    paymentSuccess?: boolean;
    paymentSessionId?: string | null;
}

export function OrdersPage({ onClose, paymentSuccess, paymentSessionId }: OrdersPageProps) {
    const titleId = useDialogTitleId();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        const bootstrapOrders = async () => {
            if (paymentSuccess && paymentSessionId) {
                try {
                    await orderService.confirmPayment(paymentSessionId);
                } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : 'Impossible de confirmer le paiement');
                }
            }
            await loadOrders();
        };

        bootstrapOrders();
    }, [paymentSuccess, paymentSessionId]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrders();
            setOrders(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
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

    const toggleOrder = (order: Order) => {
        setSelectedOrder(selectedOrder?.id === order.id ? null : order);
    };

    return (
        <ModalShell onClose={onClose}>
            <div className="w-full max-w-6xl bg-gradient-to-br from-[#a8b5c8] to-[#8b9db5] rounded-2xl shadow-2xl border-4 border-[#2d3561] max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b-4 border-[#2d3561] bg-gradient-to-r from-[#5a4f99] to-[#2d3561] sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Package className="w-8 h-8 text-white" aria-hidden="true" />
                        <h2 id={titleId} className="text-white text-2xl pixel-font">MES COMMANDES</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer les commandes"
                        className="text-white hover:bg-[#7b6eb8] p-2 rounded-xl transition focus-visible:ring-2 focus-visible:ring-[#7ec8a3]"
                    >
                        <X className="w-6 h-6" aria-hidden="true" />
                    </button>
                </div>

                {paymentSuccess && (
                    <div role="status" className="bg-green-500 text-white p-4 text-center font-bold border-b-4 border-green-700 flex items-center justify-center gap-2">
                        Paiement confirmé ! Ta commande est validée. Un email de confirmation t&apos;a été envoyé.
                    </div>
                )}

                {error && (
                    <div role="alert" className="bg-red-500 text-white p-3 text-center font-bold border-b-4 border-red-700">
                        {error}
                    </div>
                )}

                <div className="p-6" aria-busy={loading}>
                    {loading ? (
                        <div className="text-center py-12" role="status" aria-live="polite">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2d3561] border-t-transparent" aria-hidden="true" />
                            <p className="text-[#2d3561] mt-4 font-bold">Chargement...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-24 h-24 text-[#2d3561] mx-auto mb-4 opacity-40" aria-hidden="true" />
                            <h3 className="text-[#2d3561] text-2xl font-bold mb-2">Aucune commande</h3>
                            <p className="text-[#2d3561]/80 mb-6">Vous n&apos;avez pas encore passé de commande</p>
                        </div>
                    ) : (
                        <ul className="grid grid-cols-1 gap-4 list-none p-0 m-0">
                            {orders.map((order) => {
                                const isExpanded = selectedOrder?.id === order.id;
                                const panelId = `order-panel-${order.id}`;
                                return (
                                    <li key={order.id} className="bg-white/20 rounded-xl border-2 border-[#2d3561] overflow-hidden">
                                        <button
                                            type="button"
                                            className="w-full p-6 text-left hover:bg-white/30 transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7ec8a3]"
                                            onClick={() => toggleOrder(order)}
                                            aria-expanded={isExpanded}
                                            aria-controls={panelId}
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h3 className="text-[#2d3561] font-bold text-xl flex items-center gap-2">
                                                        Commande #{order.id}
                                                        <ChevronDown
                                                            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                            aria-hidden="true"
                                                        />
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-2 text-[#2d3561]/75">
                                                        <Calendar className="w-4 h-4" aria-hidden="true" />
                                                        <time dateTime={order.createdAt}>
                                                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                                        </time>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className={`${getStatusColor(order.status)} text-white px-4 py-2 rounded-full font-bold text-sm`}>
                                                        {getStatusLabel(order.status)}
                                                    </span>
                                                    <div className="flex items-center justify-end gap-2 mt-3 text-[#2d3561] font-bold text-2xl">
                                                        <DollarSign className="w-6 h-6" aria-hidden="true" />
                                                        <span>{order.total.toFixed(2)} €</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div id={panelId} className="px-6 pb-6 border-t-2 border-[#2d3561]">
                                                <h4 className="text-[#2d3561] font-bold mb-3 pt-4">Articles commandés :</h4>
                                                <ul className="space-y-3 list-none p-0 m-0">
                                                    {order.items.map((item) => (
                                                        <li key={item.id} className="flex gap-4 items-center bg-white/30 p-3 rounded-lg">
                                                            <img
                                                                src={item.card.imageUrl}
                                                                alt={item.card.name}
                                                                className="w-16 h-20 object-cover rounded border-2 border-[#2d3561]"
                                                            />
                                                            <div className="flex-1">
                                                                <h5 className="text-[#2d3561] font-bold">{item.card.name}</h5>
                                                                <p className="text-[#2d3561]/75 text-sm">Quantité: {item.quantity}</p>
                                                            </div>
                                                            <div className="text-[#2d3561] font-bold">
                                                                {(item.price * item.quantity).toFixed(2)} €
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </ModalShell>
    );
}
