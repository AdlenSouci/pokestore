import { useCallback, useEffect, useMemo, useState } from 'react';
import { type Product } from '../types/product';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';
import { API_URL } from '../lib/api';

interface ShopProps {
  onAddToCart: (product: Product) => void;
  onViewCard: (product: Product) => void;
}

interface ShopMeta {
  series: string[];
  years: number[];
  sets: { id: string; name: string }[];
  priceMin: number;
  priceMax: number;
}

const PAGE_SIZE = 24;

interface CardsApiResponse {
  items: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function mapCardToProduct(card: Record<string, unknown>): Product {
  const id = card.id as number;
  const releaseYear = card.releaseYear as number | null | undefined;
  const tcgSetName = (card.tcgSetName as string | null | undefined) ?? '';
  const series = (card.series as string | null | undefined) ?? '';
  const extra = [tcgSetName, series, releaseYear != null ? String(releaseYear) : '']
    .filter(Boolean)
    .join(' · ');

  return {
    id: String(id),
    name: String(card.name),
    description: extra
      ? `Carte ${card.rarity} — ${extra}`
      : `Carte ${card.rarity} de type ${card.type}`,
    price: Number(card.price),
    image: String(card.imageUrl),
    category: String(card.type),
    rarity: String(card.rarity),
    series: (card.series as string | null) ?? null,
    tcgSetName: (card.tcgSetName as string | null) ?? null,
    releaseYear: releaseYear ?? null,
  };
}

function buildCardsQuery(params: Record<string, string>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v.trim() !== '') {
      sp.set(k, v.trim());
    }
  });
  const q = sp.toString();
  return q ? `?${q}` : '';
}

function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 0) {
    return [1];
  }
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>();
  set.add(1);
  set.add(total);
  for (let d = -2; d <= 2; d++) {
    const p = current + d;
    if (p >= 1 && p <= total) {
      set.add(p);
    }
  }
  const arr = [...set].sort((a, b) => a - b);
  const out: (number | 'ellipsis')[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (i > 0 && arr[i] - arr[i - 1] > 1) {
      out.push('ellipsis');
    }
    out.push(arr[i]);
  }
  return out;
}

export function Shop({ onAddToCart, onViewCard }: ShopProps) {
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
      const qs = buildCardsQuery(queryWithPagination);
      const res = await fetch(`${API_URL}/cards${qs}`);
      if (!res.ok) {
        throw new Error('Erreur réseau');
      }
      const raw = await res.json();
      if (Array.isArray(raw)) {
        const items = raw as Record<string, unknown>[];
        setProducts(items.map(mapCardToProduct));
        setTotalCards(items.length);
        setTotalPages(1);
        return;
      }
      const data = raw as CardsApiResponse;
      const items = Array.isArray(data.items) ? data.items : [];
      setProducts(items.map(mapCardToProduct));
      setTotalCards(typeof data.total === 'number' ? data.total : items.length);
      setTotalPages(
        typeof data.totalPages === 'number' ? Math.max(1, data.totalPages) : 1,
      );
    } catch (err) {
      console.error('Erreur lors du chargement des cartes:', err);
      setError('Impossible de charger les cartes Pokémon.');
    } finally {
      setLoading(false);
    }
  }, [queryWithPagination]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/cards/meta`);
        if (!res.ok) {
          return;
        }
        const m = (await res.json()) as ShopMeta;
        if (!cancelled) {
          setMeta(m);
        }
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
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-red-500 text-xl pixel-font text-center px-4">
          ERREUR: {error}
          <br />
          <span className="text-sm text-white mt-2 block font-sans">
            Vérifie que le backend tourne sur le port 3000
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <SEO
        title="Boutique – Cartes Pokémon rares"
        description={`Parcourez notre catalogue de cartes Pokémon : filtres par prix, série, année et set.`}
        url="https://pokecardstore.com/shop"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Catalogue de cartes Pokémon',
          description: 'Collection de cartes Pokémon rares à acheter en ligne',
          numberOfItems: totalCards,
          itemListElement: products.slice(0, 10).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'Product',
              name: p.name,
              description: p.description,
              offers: {
                '@type': 'Offer',
                price: p.price,
                priceCurrency: 'EUR',
                availability: 'https://schema.org/InStock',
              },
            },
          })),
        }}
      />

      <div className="mb-6 text-center">
        <h2 className="text-[#2d3561] text-3xl md:text-4xl font-bold mb-2 pixel-font">
          Cartes Pokémon
        </h2>
        <p className="text-[#a5b4fc] text-sm md:text-base">
          Filtre par prix, année, série ou extension — mélange de plusieurs générations selon ton import.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border-4 border-[#2d3561] bg-gradient-to-br from-[#5a4f99]/30 to-[#2d3561]/40 p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1 text-left">
            <span className="text-xs font-bold text-[#a5b4fc] uppercase tracking-wide">
              Prix min (€)
            </span>
            <input
              type="number"
              min={0}
              placeholder={meta ? String(meta.priceMin) : '—'}
              value={minPrice}
              onChange={(e) => {
                setPage(1);
                setMinPrice(e.target.value);
              }}
              className="rounded-xl border-2 border-[#2d3561] bg-white/90 px-3 py-2 text-[#2d3561] font-sans"
            />
          </label>
          <label className="flex flex-col gap-1 text-left">
            <span className="text-xs font-bold text-[#a5b4fc] uppercase tracking-wide">
              Prix max (€)
            </span>
            <input
              type="number"
              min={0}
              placeholder={meta ? String(meta.priceMax) : '—'}
              value={maxPrice}
              onChange={(e) => {
                setPage(1);
                setMaxPrice(e.target.value);
              }}
              className="rounded-xl border-2 border-[#2d3561] bg-white/90 px-3 py-2 text-[#2d3561] font-sans"
            />
          </label>
          <label className="flex flex-col gap-1 text-left">
            <span className="text-xs font-bold text-[#a5b4fc] uppercase tracking-wide">
              Année (sortie set)
            </span>
            <select
              value={year}
              onChange={(e) => {
                setPage(1);
                setYear(e.target.value);
              }}
              className="rounded-xl border-2 border-[#2d3561] bg-white/90 px-3 py-2 text-[#2d3561] font-sans"
            >
              <option value="">Toutes</option>
              {(meta?.years ?? []).map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-left">
            <span className="text-xs font-bold text-[#a5b4fc] uppercase tracking-wide">
              Série / bloc
            </span>
            <select
              value={series}
              onChange={(e) => {
                setPage(1);
                setSeries(e.target.value);
              }}
              className="rounded-xl border-2 border-[#2d3561] bg-white/90 px-3 py-2 text-[#2d3561] font-sans"
            >
              <option value="">Toutes</option>
              {(meta?.series ?? []).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1 text-left sm:col-span-2">
            <span className="text-xs font-bold text-[#a5b4fc] uppercase tracking-wide">
              Extension (set)
            </span>
            <select
              value={setId}
              onChange={(e) => {
                setPage(1);
                setSetId(e.target.value);
              }}
              className="rounded-xl border-2 border-[#2d3561] bg-white/90 px-3 py-2 text-[#2d3561] font-sans"
            >
              <option value="">Toutes</option>
              {(meta?.sets ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-left">
            <span className="text-xs font-bold text-[#a5b4fc] uppercase tracking-wide">
              Année min
            </span>
            <input
              type="number"
              placeholder="ex: 2015"
              value={minYear}
              onChange={(e) => {
                setPage(1);
                setMinYear(e.target.value);
              }}
              className="rounded-xl border-2 border-[#2d3561] bg-white/90 px-3 py-2 text-[#2d3561] font-sans"
            />
          </label>
          <label className="flex flex-col gap-1 text-left">
            <span className="text-xs font-bold text-[#a5b4fc] uppercase tracking-wide">
              Année max
            </span>
            <input
              type="number"
              placeholder="ex: 2024"
              value={maxYear}
              onChange={(e) => {
                setPage(1);
                setMaxYear(e.target.value);
              }}
              className="rounded-xl border-2 border-[#2d3561] bg-white/90 px-3 py-2 text-[#2d3561] font-sans"
            />
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <label className="flex-1 flex flex-col gap-1 text-left">
            <span className="text-xs font-bold text-[#a5b4fc] uppercase tracking-wide">
              Recherche (nom)
            </span>
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="Pikachu, Dracaufeu…"
              className="rounded-xl border-2 border-[#2d3561] bg-white/90 px-3 py-2 text-[#2d3561] font-sans"
            />
          </label>
          <button
            type="button"
            onClick={resetFilters}
            className="px-6 py-2 rounded-xl bg-[#2d3561] text-white font-bold border-2 border-[#5a4f99] hover:bg-[#3d4571] transition"
          >
            Réinitialiser
          </button>
        </div>

        {meta && (
          <p className="text-xs text-[#a5b4fc]/80 font-sans">
            Plage de prix en base : {meta.priceMin} € – {meta.priceMax} € · {totalCards} carte
            {totalCards > 1 ? 's' : ''} au total (page {page}/{totalPages}, {PAGE_SIZE} par page)
            {loading ? ' · chargement…' : ''}
          </p>
        )}
      </div>

      {loading && products.length === 0 ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-[#7ec8a3] text-xl pixel-font animate-pulse">
            CHARGEMENT DU POKÉDEX...
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onViewCard={onViewCard}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap"
              aria-label="Pagination"
            >
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-xl bg-[#2d3561] text-white font-bold border-2 border-[#5a4f99] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3d4571] transition font-sans text-sm"
              >
                Précédent
              </button>

              <div className="flex flex-wrap items-center justify-center gap-1 max-w-full">
                {pageNumbers.map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span
                      key={`e-${idx}`}
                      className="px-2 text-[#a5b4fc] font-sans"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      disabled={loading}
                      onClick={() => setPage(item)}
                      className={`min-w-[2.5rem] px-3 py-2 rounded-lg font-sans text-sm font-bold border-2 transition ${
                        page === item
                          ? 'bg-[#5a4f99] text-white border-[#a5b4fc]'
                          : 'bg-white/10 text-[#a5b4fc] border-[#2d3561] hover:bg-white/20'
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>

              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-xl bg-[#2d3561] text-white font-bold border-2 border-[#5a4f99] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3d4571] transition font-sans text-sm"
              >
                Suivant
              </button>
            </nav>
          )}
        </>
      )}

      {!loading && products.length === 0 && (
        <p className="text-center text-[#a5b4fc] pixel-font mt-8">
          Aucune carte ne correspond aux filtres. Essaie d’élargir la recherche ou réinitialise.
        </p>
      )}
    </div>
  );
}
