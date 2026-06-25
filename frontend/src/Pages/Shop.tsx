import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const PAGE_SIZE = 20;

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
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>();
  set.add(1);
  set.add(total);
  for (let d = -1; d <= 1; d++) {
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [year, setYear] = useState('');
  const [series, setSeries] = useState('');
  const [setId, setSetId] = useState('');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  const gridRef = useRef<HTMLDivElement>(null);
  const prevPageRef = useRef(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [minPrice, maxPrice, year, series, setId, debouncedQ]);

  const filterParams = useMemo(
    () => ({
      minPrice,
      maxPrice,
      year,
      series,
      setId,
      q: debouncedQ,
    }),
    [minPrice, maxPrice, year, series, setId, debouncedQ],
  );

  const queryWithPagination = useMemo(
    () => ({
      ...filterParams,
      page: String(page),
      pageSize: String(PAGE_SIZE),
    }),
    [filterParams, page],
  );

  useEffect(() => {
    if (page !== prevPageRef.current && gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    prevPageRef.current = page;
  }, [page]);

  useEffect(() => {
    const ac = new AbortController();
    const isFirstLoad = products.length === 0;
    if (isFirstLoad) {
      setInitialLoading(true);
    } else {
      setPageLoading(true);
    }
    setError(null);

    (async () => {
      try {
        const qs = buildCardsQuery(queryWithPagination);
        const res = await fetch(`${API_URL}/cards${qs}`, { signal: ac.signal });
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
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        console.error('Erreur lors du chargement des cartes:', err);
        setError('Impossible de charger les cartes Pokémon.');
      } finally {
        if (!ac.signal.aborted) {
          setInitialLoading(false);
          setPageLoading(false);
        }
      }
    })();

    return () => ac.abort();
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
    if (page > totalPages) {
      setPage(Math.max(1, totalPages));
    }
  }, [totalPages, page]);

  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setYear('');
    setSeries('');
    setSetId('');
    setQ('');
    setDebouncedQ('');
    setPage(1);
  };

  const goToPage = useCallback((p: number) => {
    if (p < 1 || p > totalPages || pageLoading) {
      return;
    }
    setPage(p);
  }, [totalPages, pageLoading]);

  const pageNumbers = useMemo(() => buildPageNumbers(page, totalPages), [page, totalPages]);

  if (error && products.length === 0 && !initialLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-red-500 text-xl pixel-font text-center px-4">
          ERREUR: {error}
          <br />
          <span className="text-sm text-white mt-2 block font-sans">
            Vérifie que l&apos;API est en ligne
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-24">
      <SEO
        title="Boutique – Cartes Pokémon"
        description="Catalogue de cartes Pokémon avec filtres par prix, série, année et extension."
        url="https://pokestore-hazel.vercel.app/shop"
      />

      <div ref={gridRef} className="mb-6 text-center scroll-mt-24">
        <h2 className="text-[#2d3561] text-3xl md:text-4xl font-bold mb-2 pixel-font text-white">
          Boutique
        </h2>
        <p className="text-[#a5b4fc] text-sm md:text-base font-sans">
          Trouve ta carte par prix, année, série ou extension.
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
              onChange={(e) => setMinPrice(e.target.value)}
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
              onChange={(e) => setMaxPrice(e.target.value)}
              className="rounded-xl border-2 border-[#2d3561] bg-white/90 px-3 py-2 text-[#2d3561] font-sans"
            />
          </label>
          <label className="flex flex-col gap-1 text-left">
            <span className="text-xs font-bold text-[#a5b4fc] uppercase tracking-wide">
              Année
            </span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
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
              Série
            </span>
            <select
              value={series}
              onChange={(e) => setSeries(e.target.value)}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-left">
            <span className="text-xs font-bold text-[#a5b4fc] uppercase tracking-wide">
              Extension (set)
            </span>
            <select
              value={setId}
              onChange={(e) => setSetId(e.target.value)}
              className="rounded-xl border-2 border-[#2d3561] bg-white/90 px-3 py-2 text-[#2d3561] font-sans"
            >
              <option value="">Toutes</option>
              {(meta?.sets ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-left">
            <span className="text-xs font-bold text-[#a5b4fc] uppercase tracking-wide">
              Recherche
            </span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pikachu, Dracaufeu…"
              className="rounded-xl border-2 border-[#2d3561] bg-white/90 px-3 py-2 text-[#2d3561] font-sans"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="px-6 py-2 rounded-xl bg-[#2d3561] text-white font-bold border-2 border-[#5a4f99] hover:bg-[#3d4571] transition font-sans text-sm"
          >
            Réinitialiser
          </button>
          {meta && (
            <p className="text-xs text-[#a5b4fc]/80 font-sans">
              {totalCards} carte{totalCards > 1 ? 's' : ''} · page {page}/{totalPages}
              {pageLoading ? ' · chargement…' : ''}
            </p>
          )}
        </div>
      </div>

      {initialLoading && products.length === 0 ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-[#7ec8a3] text-xl pixel-font animate-pulse">
            Chargement du catalogue…
          </div>
        </div>
      ) : (
        <>
          <div
            className={`relative grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 lg:gap-6 transition-opacity duration-200 ${
              pageLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'
            }`}
          >
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
                disabled={page <= 1 || pageLoading}
                onClick={() => goToPage(page - 1)}
                className="px-4 py-2 rounded-xl bg-[#2d3561] text-white font-bold border-2 border-[#5a4f99] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3d4571] transition font-sans text-sm"
              >
                Précédent
              </button>

              <div className="flex flex-wrap items-center justify-center gap-1 max-w-full">
                {pageNumbers.map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`e-${idx}`} className="px-2 text-[#a5b4fc] font-sans">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      aria-current={page === item ? 'page' : undefined}
                      onClick={() => goToPage(item)}
                      className={`min-w-[2.5rem] px-3 py-2 rounded-lg font-sans text-sm font-bold border-2 transition ${
                        page === item
                          ? 'bg-[#5a4f99] text-white border-[#a5b4fc]'
                          : 'bg-white/10 text-[#a5b4fc] border-[#2d3561] hover:bg-white/20'
                      } ${pageLoading ? 'opacity-60' : ''}`}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>

              <button
                type="button"
                disabled={page >= totalPages || pageLoading}
                onClick={() => goToPage(page + 1)}
                className="px-4 py-2 rounded-xl bg-[#2d3561] text-white font-bold border-2 border-[#5a4f99] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3d4571] transition font-sans text-sm"
              >
                Suivant
              </button>
            </nav>
          )}
        </>
      )}

      {!initialLoading && !pageLoading && products.length === 0 && (
        <p className="text-center text-[#a5b4fc] pixel-font mt-8">
          Aucune carte ne correspond aux filtres.
        </p>
      )}
    </div>
  );
}
