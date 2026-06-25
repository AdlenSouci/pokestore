import { useMemo } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppShell } from '../components/AppShell';
import { ProductCard } from '../components/ProductCard';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../context/AuthContext';
import { buildCollectionFromOrders } from '../lib/collectionFromOrders';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Collection'>;

export function CollectionScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { orders, loading, error } = useOrders();
  const { width } = useWindowDimensions();

  const collection = useMemo(() => buildCollectionFromOrders(orders), [orders]);
  const totalCards = useMemo(
    () => collection.reduce((sum, entry) => sum + entry.quantity, 0),
    [collection],
  );

  const horizontalPad = 16;
  const gap = 12;
  const numCols = width >= 640 ? 3 : 2;
  const colWidth = (width - horizontalPad * 2 - gap * (numCols - 1)) / numCols;

  if (!user) {
    return (
      <AppShell>
        <View style={styles.center}>
          <Text style={styles.info}>Connecte-toi pour voir ta collection.</Text>
          <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.primaryBtnText}>Connexion</Text>
          </Pressable>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <View style={styles.root}>
        <View style={[styles.header, { paddingHorizontal: horizontalPad }]}>
          <MaterialCommunityIcons name="view-grid" size={28} color={colors.text} />
          <View style={styles.headerText}>
            <Text style={styles.title}>MA COLLECTION</Text>
            {!loading && collection.length > 0 && (
              <Text style={styles.subtitle}>
                {collection.length} carte{collection.length > 1 ? 's uniques' : ' unique'} · {totalCards} au total
              </Text>
            )}
            <Text style={styles.hint}>
              Cartes achetées — appuie pour les effets 3D et animations de type
            </Text>
          </View>
        </View>

        {error && (
          <Text style={[styles.error, { marginHorizontal: horizontalPad }]}>{error}</Text>
        )}

        {loading ? (
          <View style={styles.centerInline}>
            <ActivityIndicator size="large" color={colors.mint} />
          </View>
        ) : collection.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="cards-outline" size={72} color={colors.violet} />
            <Text style={styles.emptyTitle}>Collection vide</Text>
            <Text style={styles.emptySub}>
              Achète des cartes dans la boutique pour les retrouver ici.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('Shop')}>
              <Text style={styles.primaryBtnText}>Aller à la boutique</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={collection}
            key={numCols}
            numColumns={numCols}
            keyExtractor={(item) => item.product.id}
            contentContainerStyle={{
              paddingHorizontal: horizontalPad,
              paddingBottom: 40,
            }}
            columnWrapperStyle={numCols > 1 ? { gap } : undefined}
            renderItem={({ item }) => (
              <View style={{ width: colWidth }}>
                <ProductCard
                  product={item.product}
                  columnWidth={colWidth}
                  quantity={item.quantity}
                />
              </View>
            )}
          />
        )}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  centerInline: {
    flex: 1,
    justifyContent: 'center',
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
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 4,
    borderBottomColor: colors.border,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: font.pixel,
    fontSize: 12,
    color: colors.text,
  },
  subtitle: {
    fontFamily: font.sansMedium,
    color: colors.indigoText,
    fontSize: 13,
    marginTop: 4,
  },
  hint: {
    fontFamily: font.sans,
    color: colors.violet,
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  error: {
    fontFamily: font.sansBold,
    color: '#fecaca',
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontFamily: font.sansBold,
    fontSize: 20,
    color: colors.border,
    marginTop: 12,
  },
  emptySub: {
    fontFamily: font.sans,
    color: colors.violet,
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
});
