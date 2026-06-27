import { useState, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { cartService, type Cart as CartType } from '../services/cart.service';
import { orderService } from '../services/order.service';
import { ModalShell, useDialogTitleId } from './ModalShell';

interface CartPageProps {
    onClose: () => void;
    onCheckout?: () => void;
}

export function CartPage({ onClose }: CartPageProps) {
    const titleId = useDialogTitleId();
    const [cart, setCart] = useState<CartType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingOrder, setProcessingOrder] = useState(false);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            setLoading(true);
            const data = await cartService.getCart();
            setCart(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (cardId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        try {
            const updatedCart = await cartService.updateCartItem(cardId, newQuantity);
            setCart(updatedCart);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
    };

    const removeItem = async (cardId: number) => {
        try {
            const updatedCart = await cartService.removeFromCart(cardId);
            setCart(updatedCart);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
    };

    const handleCheckout = async () => {
        try {
            setProcessingOrder(true);
            setError(null);
            const { url } = await orderService.createCheckoutSession();
            window.location.href = url;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
            setProcessingOrder(false);
        }
    };

    const total = cart?.items.reduce((sum, item) => sum + item.card.price * item.quantity, 0) || 0;

    return (
        <ModalShell onClose={onClose}>
            <div className="w-full max-w-4xl bg-gradient-to-br from-[#a8b5c8] to-[#8b9db5] rounded-2xl shadow-2xl border-4 border-[#2d3561] max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b-4 border-[#2d3561] bg-gradient-to-r from-[#5a4f99] to-[#2d3561] sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-white" aria-hidden="true" />
                        <h2 id={titleId} className="text-white text-2xl pixel-font">MON PANIER</h2>
                        {cart && cart.items.length > 0 && (
                            <span className="bg-white text-[#2d3561] px-3 py-1 rounded-full font-bold text-sm">
                                {cart.items.length} article{cart.items.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer le panier"
                        className="text-white hover:bg-[#7b6eb8] p-2 rounded-xl transition focus-visible:ring-2 focus-visible:ring-[#7ec8a3]"
                    >
                        <X className="w-6 h-6" aria-hidden="true" />
                    </button>
                </div>

                {error && (
                    <div role="alert" className="bg-red-500 text-white p-3 text-center font-bold border-b-4 border-red-700">
                        {error}
                    </div>
                )}

                <div className="p-6" aria-busy={loading || processingOrder}>
                    {loading ? (
                        <div className="text-center py-12" role="status" aria-live="polite">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2d3561] border-t-transparent" aria-hidden="true" />
                            <p className="text-[#2d3561] mt-4 font-bold">Chargement...</p>
                        </div>
                    ) : !cart || cart.items.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingCart className="w-24 h-24 text-[#2d3561] mx-auto mb-4 opacity-40" aria-hidden="true" />
                            <h3 className="text-[#2d3561] text-2xl font-bold mb-2">Votre panier est vide</h3>
                            <p className="text-[#2d3561]/80 mb-6">Ajoutez des cartes Pokémon pour commencer !</p>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 bg-[#2d3561] text-white font-bold rounded-xl hover:bg-[#3d4571] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#7ec8a3]"
                            >
                                Continuer mes achats
                            </button>
                        </div>
                    ) : (
                        <>
                            <ul className="space-y-4 mb-6 list-none p-0 m-0">
                                {cart.items.map((item) => (
                                    <li
                                        key={item.id}
                                        className="bg-white/20 p-4 rounded-xl border-2 border-[#2d3561] flex gap-4 items-center hover:bg-white/30 transition"
                                    >
                                        <img
                                            src={item.card.imageUrl}
                                            alt={item.card.name}
                                            className="w-24 h-32 object-cover rounded-lg border-2 border-[#2d3561]"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[#2d3561] font-bold text-lg">{item.card.name}</h3>
                                            <p className="text-[#2d3561]/75 text-sm">Type: {item.card.type}</p>
                                            <p className="text-[#2d3561]/75 text-sm">Rareté: {item.card.rarity}</p>
                                            <p className="text-[#2d3561] font-bold text-xl mt-2">{item.card.price} €</p>
                                        </div>
                                        <div className="flex items-center gap-3" role="group" aria-label={`Quantité de ${item.card.name}`}>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.cardId, item.quantity - 1)}
                                                className="p-2 bg-[#5a4f99] text-white rounded-lg hover:bg-[#7b6eb8] transition disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#7ec8a3]"
                                                disabled={item.quantity <= 1}
                                                aria-label={`Diminuer la quantité de ${item.card.name}`}
                                            >
                                                <Minus className="w-4 h-4" aria-hidden="true" />
                                            </button>
                                            <span className="text-[#2d3561] font-bold text-xl w-12 text-center" aria-live="polite">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.cardId, item.quantity + 1)}
                                                className="p-2 bg-[#5a4f99] text-white rounded-lg hover:bg-[#7b6eb8] transition focus-visible:ring-2 focus-visible:ring-[#7ec8a3]"
                                                aria-label={`Augmenter la quantité de ${item.card.name}`}
                                            >
                                                <Plus className="w-4 h-4" aria-hidden="true" />
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.cardId)}
                                            className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition focus-visible:ring-2 focus-visible:ring-white"
                                            aria-label={`Retirer ${item.card.name} du panier`}
                                        >
                                            <Trash2 className="w-5 h-5" aria-hidden="true" />
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <div className="bg-white/30 p-6 rounded-xl border-2 border-[#2d3561]">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[#2d3561] text-2xl font-bold">Total</span>
                                    <span className="text-[#2d3561] text-3xl font-bold">{total.toFixed(2)} €</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCheckout}
                                    disabled={processingOrder}
                                    aria-busy={processingOrder}
                                    className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-3 focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    <CreditCard className="w-6 h-6" aria-hidden="true" />
                                    {processingOrder ? 'Traitement...' : 'Passer la commande'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </ModalShell>
    );
}
