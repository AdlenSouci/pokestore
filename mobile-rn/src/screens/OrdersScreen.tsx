import { useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppShell } from '../components/AppShell';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../types/navigation';
import type { Order } from '../types/order';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;

function statusColor(status: Order['status']): string {
  switch (status) {
    case 'PAID':
      return '#22c55e';
    case 'PENDING':
      return '#eab308';
    case 'CANCELLED':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

function statusLabel(status: Order['status']): string {
  switch (status) {
    case 'PAID':
      return 'Payée';
    case 'PENDING':
      return 'En attente';
    case 'CANCELLED':
      return 'Annulée';
    default:
      return status;
  }
}

export function OrdersScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { orders, loading, error } = useOrders();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const paidCount = useMemo(() => orders.filter((o) => o.status === 'PAID').length, [orders]);

  if (!user) {
    return (
      <AppShell>
        <View style={styles.center}>
          <Text style={styles.info}>Connecte-toi pour voir tes commandes.</Text>
          <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.primaryBtnText}>Connexion</Text>
          </Pressable>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="package-variant" size={28} color={colors.text} />
          <Text style={styles.title}>MES COMMANDES</Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        {loading ? (
          <View style={styles.centerInline}>
            <ActivityIndicator size="large" color={colors.mint} />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="package-variant-closed" size={72} color={colors.caption} />
            <Text style={styles.emptyTitle}>Aucune commande</Text>
            <Text style={styles.emptySub}>Tu n&apos;as pas encore passé de commande.</Text>
            <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('Shop')}>
              <Text style={styles.primaryBtnText}>Aller à la boutique</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.summary}>
              {orders.length} commande{orders.length > 1 ? 's' : ''} · {paidCount} payée
              {paidCount > 1 ? 's' : ''}
            </Text>
            {orders.map((order) => {
              const expanded = expandedId === order.id;
              return (
                <Pressable
                  key={order.id}
                  style={styles.card}
                  onPress={() => setExpandedId(expanded ? null : order.id)}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.cardLeft}>
                      <Text style={styles.orderId}>Commande #{order.id}</Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                    <View style={styles.cardRight}>
                      <View style={[styles.badge, { backgroundColor: statusColor(order.status) }]}>
                        <Text style={styles.badgeText}>{statusLabel(order.status)}</Text>
                      </View>
                      <Text style={styles.orderTotal}>{order.total.toFixed(2)} €</Text>
                    </View>
                  </View>

                  {expanded && (
                    <View style={styles.itemsBlock}>
                      <Text style={styles.itemsTitle}>Articles commandés</Text>
                      {order.items.map((item) => (
                        <View key={item.id} style={styles.itemRow}>
                          <Image source={{ uri: item.card.imageUrl }} style={styles.thumb} />
                          <View style={styles.itemMeta}>
                            <Text style={styles.itemName}>{item.card.name}</Text>
                            <Text style={styles.itemQty}>Quantité : {item.quantity}</Text>
                          </View>
                          <Text style={styles.itemPrice}>
                            {(item.price * item.quantity).toFixed(2)} €
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            })}
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
  centerInline: {
    paddingVertical: 48,
    alignItems: 'center',
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
  error: {
    fontFamily: font.sansBold,
    color: '#fecaca',
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  summary: {
    fontFamily: font.sansMedium,
    color: colors.indigoText,
    marginBottom: 16,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontFamily: font.sansBold,
    fontSize: 20,
    color: colors.text,
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
  card: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  orderId: {
    fontFamily: font.sansBold,
    fontSize: 18,
    color: colors.text,
  },
  orderDate: {
    fontFamily: font.sans,
    color: colors.indigoText,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 12,
  },
  orderTotal: {
    fontFamily: font.sansBold,
    fontSize: 22,
    color: colors.mint,
    marginTop: 8,
  },
  itemsBlock: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  itemsTitle: {
    fontFamily: font.sansBold,
    color: colors.text,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  thumb: {
    width: 56,
    height: 78,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 14,
  },
  itemQty: {
    fontFamily: font.sans,
    color: colors.indigoText,
    fontSize: 13,
    marginTop: 2,
  },
  itemPrice: {
    fontFamily: font.sansBold,
    color: colors.text,
  },
});
