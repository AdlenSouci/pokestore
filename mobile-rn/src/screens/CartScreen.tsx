import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import * as cartService from '../services/cart';
import * as orderService from '../services/order';
import { getWebReturnUrl } from '../config/api';
import { parseOAuthCallback } from '../lib/parseOAuthCallback';
import type { RootStackParamList } from '../types/navigation';
import type { Cart as CartType } from '../services/cart';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export function CartScreen({ navigation }: Props) {
  const { user, refreshCart } = useAuth();
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setCart(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const removeLine = async (cardId: number) => {
    try {
      const c = await cartService.removeFromCart(cardId);
      setCart(c);
      await refreshCart();
    } catch (e) {
      Alert.alert('Panier', e instanceof Error ? e.message : 'Erreur');
    }
  };

  const updateQty = async (cardId: number, q: number) => {
    if (q < 1) {
      await removeLine(cardId);
      return;
    }
    try {
      const c = await cartService.updateCartItem(cardId, q);
      setCart(c);
      await refreshCart();
    } catch (e) {
      Alert.alert('Panier', e instanceof Error ? e.message : 'Erreur');
    }
  };

  const checkout = async () => {
    setCheckoutLoading(true);
    try {
      const { url } = await orderService.createCheckoutSession();
      const returnUrl = `${getWebReturnUrl()}/orders`;
      const result = await WebBrowser.openAuthSessionAsync(url, returnUrl);

      if (result.type === 'success' && result.url) {
        const { sessionId, payment } = parseOAuthCallback(result.url);

        if (payment === 'success' && sessionId) {
          await orderService.confirmPayment(sessionId);
          Alert.alert('Paiement', 'Commande validée ! Un email de confirmation t’a été envoyé.', [
            { text: 'Ma collection', onPress: () => navigation.navigate('Collection') },
            { text: 'Mes commandes', onPress: () => navigation.navigate('Orders') },
            { text: 'OK' },
          ]);
          setCart(null);
          await refreshCart();
        } else if (payment === 'cancelled') {
          Alert.alert('Paiement', 'Paiement annulé.');
        }
      }
    } catch (e) {
      Alert.alert('Paiement', e instanceof Error ? e.message : 'Erreur');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!user) {
    return (
      <AppShell>
        <View style={styles.center}>
          <Text style={styles.info}>Connecte-toi pour voir ton panier.</Text>
          <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.primaryBtnText}>Connexion</Text>
          </Pressable>
        </View>
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.mint} />
        </View>
      </AppShell>
    );
  }

  const total =
    cart?.items.reduce((sum, it) => sum + it.card.price * it.quantity, 0) ?? 0;

  return (
    <AppShell>
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="cart" size={28} color={colors.text} />
        <Text style={styles.title}>MON PANIER</Text>
      </View>

      {!cart || cart.items.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="cart-off" size={72} color={colors.caption} style={{ opacity: 0.7 }} />
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptySub}>Ajoutez des cartes Pokémon pour commencer !</Text>
          <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('Shop')}>
            <Text style={styles.primaryBtnText}>Continuer mes achats</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {cart.items.map((item) => (
            <View key={item.id} style={styles.line}>
              <Image source={{ uri: item.card.imageUrl }} style={styles.thumb} />
              <View style={styles.lineMeta}>
                <Text style={styles.lineName}>{item.card.name}</Text>
                <Text style={styles.linePrice}>
                  {(item.card.price * item.quantity).toFixed(2)} €
                </Text>
                <View style={styles.qtyRow}>
                  <Pressable onPress={() => updateQty(item.cardId, item.quantity - 1)}>
                    <MaterialCommunityIcons name="minus-circle" size={28} color={colors.text} />
                  </Pressable>
                  <Text style={styles.qty}>{item.quantity}</Text>
                  <Pressable onPress={() => updateQty(item.cardId, item.quantity + 1)}>
                    <MaterialCommunityIcons name="plus-circle" size={28} color={colors.text} />
                  </Pressable>
                  <Pressable onPress={() => removeLine(item.cardId)} style={styles.trash}>
                    <MaterialCommunityIcons name="delete" size={24} color="#fecaca" />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
          <Text style={styles.total}>Total : {total.toFixed(2)} €</Text>
          <Pressable
            style={[styles.checkoutBtn, checkoutLoading && styles.disabled]}
            onPress={checkout}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <MaterialCommunityIcons name="credit-card" size={22} color={colors.text} />
                <Text style={styles.checkoutText}>Payer avec Stripe</Text>
              </>
            )}
          </Pressable>
        </>
      )}
    </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  info: {
    fontFamily: font.sans,
    color: colors.indigoText,
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 4,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: font.pixel,
    fontSize: 12,
    color: colors.text,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontFamily: font.sansBold,
    fontSize: 20,
    color: colors.border,
    marginTop: 12,
  },
  emptySub: {
    fontFamily: font.sans,
    color: colors.caption,
    marginBottom: 24,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.border,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryBtnText: {
    fontFamily: font.sansBold,
    color: colors.text,
  },
  line: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  thumb: {
    width: 72,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  lineMeta: {
    flex: 1,
  },
  lineName: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 15,
  },
  linePrice: {
    fontFamily: font.sansBold,
    color: colors.mint,
    marginTop: 4,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  qty: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  trash: {
    marginLeft: 'auto',
  },
  total: {
    fontFamily: font.sansBold,
    fontSize: 22,
    color: colors.mint,
    textAlign: 'right',
    marginTop: 16,
    marginBottom: 16,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.borderAccent,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  checkoutText: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});
