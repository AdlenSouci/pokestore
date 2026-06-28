import { fetchJson } from '../api/http';

export type WallpaperSource = 'gemini';

export interface WallpaperResult {
  imageBase64: string;
  mimeType: string;
  source: WallpaperSource;
  cardName: string;
}

export async function generateWallpaper(cardId: number): Promise<WallpaperResult> {
  return fetchJson<WallpaperResult>(
    '/wallpaper/generate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId }),
    },
    300_000,
  );
}
