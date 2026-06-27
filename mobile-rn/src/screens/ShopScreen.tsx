import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppShell } from '../components/AppShell';
import { FilterDropdown } from '../components/FilterDropdown';
import { ProductCard } from '../components/ProductCard';
import { fetchCards, fetchShopMeta, type ShopMeta } from '../api/cards';
import { mapCardToProduct } from '../lib/mapCard';
import { buildPageNumbers } from '../lib/pagination';
import type { Product } from '../types/product';
import type { RootStackParamList } from '../types/navigation';
import { getApiBaseUrl } from '../config/api';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Shop'>;

const PAGE_SIZE = 24;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function ShopScreen({}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const horizontalPad = 12;
  const gridCols = windowWidth >= 900 ? 3 : windowWidth >= 360 ? 2 : 1;
  const gridGap = 12;
  const colW = (windowWidth - horizontalPad * 2 - gridGap * (gridCols - 1)) / gridCols;
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ShopMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [year, setYear] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [series, setSeries] = useState('');
  const [setId, setSetId] = useState('');
  const [q, setQ] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const chevronRotate = useRef(new Animated.Value(0)).current;

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFiltersOpen((o) => !o);
    Animated.timing(chevronRotate, {
      toValue: filtersOpen ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const chevronDeg = chevronRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const yearOptions = useMemo(
    () => [
      { label: 'Toutes', value: '' },
      ...(meta?.years ?? []).map((y) => ({ label: String(y), value: String(y) })),
    ],
    [meta?.years],
  );

  const seriesOptions = useMemo(
    () => [
      { label: 'Toutes', value: '' },
      ...(meta?.series ?? []).map((s) => ({ label: s, value: s })),
    ],
    [meta?.series],
  );

  const setOptions = useMemo(
    () => [
      { label: 'Toutes', value: '' },
      ...(meta?.sets ?? []).map((s) => ({ label: `${s.name} (${s.id})`, value: s.id })),
    ],
    [meta?.sets],
  );

  const filterParams = useMemo(
    () => ({
      minPrice,
      maxPrice,
      year,
      minYear,
      maxYear,
      series,
      setId,
      q,
    }),
    [minPrice, maxPrice, year, minYear, maxYear, series, setId, q],
  );

  const queryWithPagination = useMemo(
    () => ({
      ...filterParams,
      page: String(page),
      pageSize: String(PAGE_SIZE),
    }),
    [filterParams, page],
  );

  const loadCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchCards(queryWithPagination);
      if (Array.isArray(raw)) {
        const items = raw as Record<string, unknown>[];
        setProducts(items.map(mapCardToProduct));
        setTotalCards(items.length);
        setTotalPages(1);
        return;
      }
      const data = raw;
      const items = Array.isArray(data.items) ? data.items : [];
      setProducts(items.map(mapCardToProduct));
      setTotalCards(typeof data.total === 'number' ? data.total : items.length);
      setTotalPages(typeof data.totalPages === 'number' ? Math.max(1, data.totalPages) : 1);
    } catch (err) {
      console.error(err);
      const msg =
        err instanceof Error
          ? err.message
          : 'Impossible de charger les cartes Pokémon.';
      setError(msg);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [queryWithPagination]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const m = await fetchShopMeta();
        if (!cancelled) setMeta(m);
      } catch {
        /* meta optionnel */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(Math.max(1, totalPages));
    }
  }, [totalPages, page]);

  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setYear('');
    setMinYear('');
    setMaxYear('');
    setSeries('');
    setSetId('');
    setQ('');
    setPage(1);
  };

  const pageNumbers = useMemo(() => buildPageNumbers(page, totalPages), [page, totalPages]);

  if (error && products.length === 0 && !loading) {
    return (
      <AppShell>
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Boutique indisponible</Text>
          <Text style={styles.errorHint}>{error}</Text>
          <Text style={styles.errorHint}>
            L&apos;API Render peut mettre ~30 s à démarrer (plan gratuit). Réessaie.
          </Text>
          <Pressable style={styles.retryBtn} onPress={() => void loadCards()}>
            <Text style={styles.retryBtnText}>Réessayer</Text>
          </Pressable>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.headerBlock}>
          <Text style={styles.h2}>Boutique PokéStore</Text>
          <Text style={styles.subtitle}>
            Filtre par prix, année, série ou extension.
          </Text>
        </View>

        <LinearGradient
          colors={['rgba(90,79,153,0.35)', 'rgba(45,53,97,0.5)']}
          style={styles.filterPanel}
        >
          <Pressable
            style={({ pressed }) => [styles.filterToggle, pressed && { opacity: 0.9 }]}
            onPress={toggleFilters}
            accessibilityRole="button"
            accessibilityState={{ expanded: filtersOpen }}
          >
            <Text style={styles.filterToggleText}>Filtres de recherche</Text>
            <Animated.View style={{ transform: [{ rotate: chevronDeg }] }}>
              <MaterialCommunityIcons name="chevron-down" size={24} color={colors.caption} />
            </Animated.View>
          </Pressable>

          {filtersOpen && (
          <View style={styles.filterBody}>
          <View style={styles.row4}>
            <Field label="Prix min (€)">
              <TextInput
                keyboardType="numeric"
                placeholder={meta ? String(meta.priceMin) : '—'}
                placeholderTextColor={colors.indigoText}
                value={minPrice}
                onChangeText={(v) => {
                  setPage(1);
                  setMinPrice(v);
                }}
                style={styles.input}
              />
            </Field>
            <Field label="Prix max (€)">
              <TextInput
                keyboardType="numeric"
                placeholder={meta ? String(meta.priceMax) : '—'}
                placeholderTextColor={colors.caption}
                value={maxPrice}
                onChangeText={(v) => {
                  setPage(1);
                  setMaxPrice(v);
                }}
                style={styles.input}
              />
            </Field>
            <FilterDropdown
              label="Année (sortie set)"
              value={year}
              options={yearOptions}
              onChange={(v) => {
                setPage(1);
                setYear(v);
              }}
            />
            <FilterDropdown
              label="Série / bloc"
              value={series}
              options={seriesOptions}
              onChange={(v) => {
                setPage(1);
                setSeries(v);
              }}
            />
          </View>

          <View style={styles.row4}>
            <View style={styles.span2}>
              <FilterDropdown
                label="Extension (set)"
                value={setId}
                options={setOptions}
                onChange={(v) => {
                  setPage(1);
                  setSetId(v);
                }}
              />
            </View>
            <Field label="Année min">
              <TextInput
                keyboardType="numeric"
                placeholder="ex: 2015"
                placeholderTextColor={colors.indigoText}
                value={minYear}
                onChangeText={(v) => {
                  setPage(1);
                  setMinYear(v);
                }}
                style={styles.input}
              />
            </Field>
            <Field label="Année max">
              <TextInput
                keyboardType="numeric"
                placeholder="ex: 2024"
                placeholderTextColor={colors.indigoText}
                value={maxYear}
                onChangeText={(v) => {
                  setPage(1);
                  setMaxYear(v);
                }}
                style={styles.input}
              />
            </Field>
          </View>

          <View style={styles.searchRow}>
            <Field label="Recherche (nom)" style={{ flex: 1 }}>
              <TextInput
                value={q}
                onChangeText={(v) => {
                  setPage(1);
                  setQ(v);
                }}
                placeholder="Pikachu, Dracaufeu…"
                placeholderTextColor={colors.indigoText}
                style={styles.input}
              />
            </Field>
            <Pressable style={styles.resetBtn} onPress={resetFilters}>
              <Text style={styles.resetBtnText}>Réinitialiser</Text>
            </Pressable>
          </View>

          {meta && (
            <Text style={styles.metaLine}>
              Plage de prix en base : {meta.priceMin} € – {meta.priceMax} € · {totalCards} carte
              {totalCards > 1 ? 's' : ''} au total (page {page}/{totalPages}, {PAGE_SIZE} par page)
              {loading ? ' · chargement…' : ''}
            </Text>
          )}
          </View>
          )}
        </LinearGradient>

        {loading && products.length === 0 ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>CHARGEMENT DU POKÉDEX...</Text>
            <ActivityIndicator size="large" color={colors.mint} style={{ marginTop: 16 }} />
          </View>
        ) : (
          <>
            <View style={[styles.grid, { flexDirection: 'row', flexWrap: 'wrap', gap: gridGap }]}>
              {products.map((product) => (
                <View key={product.id} style={{ width: colW }}>
                  <ProductCard product={product} columnWidth={colW} />
                </View>
              ))}
            </View>

            {totalPages > 1 && (
              <View style={styles.pagination}>
                <Pressable
                  style={[styles.pageNavBtn, page <= 1 && styles.disabled]}
                  disabled={page <= 1 || loading}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <Text style={styles.pageNavBtnText}>Précédent</Text>
                </Pressable>

                <View style={styles.pageNums}>
                  {pageNumbers.map((item, idx) =>
                    item === 'ellipsis' ? (
                      <Text key={`e-${idx}`} style={styles.ellipsis}>
                        …
                      </Text>
                    ) : (
                      <Pressable
                        key={item}
                        disabled={loading}
                        onPress={() => setPage(item)}
                        style={[styles.pageBtn, page === item && styles.pageBtnActive]}
                      >
                        <Text style={[styles.pageBtnText, page === item && styles.pageBtnTextActive]}>
                          {item}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>

                <Pressable
                  style={[styles.pageNavBtn, page >= totalPages && styles.disabled]}
                  disabled={page >= totalPages || loading}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <Text style={styles.pageNavBtnText}>Suivant</Text>
                </Pressable>
              </View>
            )}
          </>
        )}

        {!loading && products.length === 0 && (
          <Text style={styles.empty}>
            Aucune carte ne correspond aux filtres. Essaie d’élargir la recherche ou réinitialise.
          </Text>
        )}

        {__DEV__ && (
          <Text style={styles.devApi} selectable>
            API : {getApiBaseUrl()}
          </Text>
        )}
      </ScrollView>
    </AppShell>
  );
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: ReactNode;
  style?: object;
}) {
  return (
    <View style={[{ gap: 4 }, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 48,
  },
  headerBlock: {
    marginBottom: 20,
    alignItems: 'center',
  },
  h2: {
    fontFamily: font.pixel,
    fontSize: 16,
    lineHeight: 26,
    color: '#e0e7ff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#1e293b',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  subtitle: {
    fontFamily: font.sans,
    color: colors.indigoText,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  filterPanel: {
    borderRadius: 16,
    borderWidth: 4,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  filterToggleText: {
    fontFamily: font.sansBold,
    fontSize: 16,
    color: colors.text,
  },
  filterBody: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(90,79,153,0.4)',
    paddingTop: 12,
  },
  row4: {
    gap: 12,
  },
  span2: {
    width: '100%',
  },
  fieldLabel: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: colors.indigoText,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    fontFamily: font.sans,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.inputText,
    fontSize: 15,
  },
  pickerWrap: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    overflow: 'hidden',
  },
  picker: {
    fontFamily: font.sans,
    color: colors.inputText,
    marginVertical: -4,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  resetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.borderAccent,
  },
  resetBtnText: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 14,
  },
  metaLine: {
    fontFamily: font.sans,
    fontSize: 11,
    color: 'rgba(165,180,252,0.85)',
    marginTop: 4,
  },
  loadingBox: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: font.pixel,
    fontSize: 11,
    color: colors.mint,
    textAlign: 'center',
  },
  grid: {
    width: '100%',
  },
  devApi: {
    fontFamily: font.sans,
    fontSize: 10,
    color: 'rgba(165,180,252,0.5)',
    marginTop: 24,
    textAlign: 'center',
  },
  pagination: {
    marginTop: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  pageNavBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.borderAccent,
  },
  pageNavBtnText: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 13,
  },
  disabled: {
    opacity: 0.4,
  },
  pageNums: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
    maxWidth: '100%',
  },
  pageBtn: {
    minWidth: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pageBtnActive: {
    backgroundColor: colors.borderAccent,
    borderColor: colors.mint,
  },
  pageBtnText: {
    fontFamily: font.sansBold,
    color: colors.caption,
    fontSize: 13,
    textAlign: 'center',
  },
  pageBtnTextActive: {
    fontFamily: font.sansBold,
    color: colors.text,
  },
  ellipsis: {
    color: colors.indigoText,
    paddingHorizontal: 6,
    alignSelf: 'center',
  },
  empty: {
    fontFamily: font.pixel,
    textAlign: 'center',
    color: colors.indigoText,
    fontSize: 10,
    lineHeight: 18,
    marginTop: 24,
  },
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 320,
  },
  errorTitle: {
    fontFamily: font.pixel,
    fontSize: 10,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorHint: {
    fontFamily: font.sans,
    color: colors.text,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  retryBtnText: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 15,
  },
});
