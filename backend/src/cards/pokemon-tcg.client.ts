import axios from 'axios';

const BASE_URL = 'https://api.pokemontcg.io/v2';

export interface PokemonTcgApiCard {
  id: string;
  name: string;
  types?: string[];
  rarity?: string;
  images?: { small?: string; large?: string };
  set?: {
    id: string;
    name: string;
    series: string;
    /** Format API souvent "YYYY/MM/DD" */
    releaseDate?: string;
  };
}

interface CardsPageResponse {
  data: PokemonTcgApiCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

/**
 * Récupère les cartes d'un set (pagination API v2, pageSize max 250).
 * Si `maxCards` est défini, s'arrête dès qu'on a assez de cartes (évite de tout télécharger).
 */
export async function fetchCardsBySetId(
  setId: string,
  apiKey: string | undefined,
  maxCards?: number,
): Promise<PokemonTcgApiCard[]> {
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }

  const pageSize = 250;
  let page = 1;
  const all: PokemonTcgApiCard[] = [];

  for (;;) {
    if (maxCards !== undefined && all.length >= maxCards) {
      break;
    }

    const { data } = await axios.get<CardsPageResponse>(`${BASE_URL}/cards`, {
      headers,
      params: {
        q: `set.id:${setId}`,
        page,
        pageSize,
      },
      timeout: 60_000,
    });

    const batch = data.data ?? [];
    if (maxCards !== undefined) {
      const need = maxCards - all.length;
      if (need <= 0) {
        break;
      }
      all.push(...batch.slice(0, need));
    } else {
      all.push(...batch);
    }

    if (batch.length < pageSize) {
      break;
    }
    if (maxCards !== undefined && all.length >= maxCards) {
      break;
    }
    page += 1;
    if (page > 200) {
      break;
    }
  }

  return all;
}
