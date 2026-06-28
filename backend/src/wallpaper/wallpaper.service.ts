import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';
import sharp from 'sharp';
import { PrismaService } from '../database/prisma.service';

const WALLPAPER_WIDTH = 1080;
const WALLPAPER_HEIGHT = 1920;

export type WallpaperSource = 'gemini' | 'pollinations' | 'artwork';

@Injectable()
export class WallpaperService {
  private readonly logger = new Logger(WallpaperService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  isGeminiConfigured(): boolean {
    return Boolean(this.config.get<string>('GEMINI_API_KEY')?.trim());
  }

  async generateForUser(
    userId: number,
    cardId: number,
  ): Promise<{
    imageBase64: string;
    mimeType: string;
    source: WallpaperSource;
    cardName: string;
  }> {
    const ownsCard = await this.userOwnsCard(userId, cardId);
    if (!ownsCard) {
      throw new ForbiddenException(
        'Cette carte ne fait pas partie de ta collection (commande payée requise).',
      );
    }

    const card = await this.prisma.pokemonCard.findUnique({
      where: { id: cardId },
    });
    if (!card) {
      throw new NotFoundException('Carte introuvable');
    }

    const cardImage = await this.fetchCardImage(card.imageUrl);
    const illustration = await this.extractIllustration(cardImage);
    const outpaintSeed = await this.createOutpaintSeed(illustration);
    const prompt = this.buildWallpaperPrompt(card.name, card.type, card.rarity);
    const shortPrompt = this.buildShortPrompt(card.name, card.type);

    let buffer: Buffer | null = null;
    let source: WallpaperSource = 'artwork';

    const geminiKey = this.config.get<string>('GEMINI_API_KEY')?.trim();
    if (geminiKey) {
      const gemini = await this.tryGeminiOnce(
        geminiKey,
        prompt,
        await this.createCompactSeed(illustration),
      );
      if (gemini.buffer) {
        buffer = gemini.buffer;
        source = 'gemini';
        this.logger.log(`Wallpaper OK — Gemini (${card.name})`);
      } else if (gemini.lastError) {
        this.logger.warn(
          `Gemini indisponible (${card.name}): ${gemini.lastError.slice(0, 120)}`,
        );
      }
    }

    if (!buffer) {
      const pollinations = await this.tryPollinations(
        prompt,
        shortPrompt,
        outpaintSeed,
        cardId,
      );
      if (pollinations) {
        buffer = pollinations;
        source = 'pollinations';
        this.logger.log(`Wallpaper OK — Pollinations (${card.name})`);
      }
    }

    if (!buffer) {
      buffer = await this.createArtisticWallpaper(illustration);
      source = 'artwork';
      this.logger.log(`Wallpaper OK — artwork local (${card.name})`);
    }

    const normalized = await this.normalizeWallpaper(buffer);
    return {
      imageBase64: normalized.toString('base64'),
      mimeType: 'image/png',
      source,
      cardName: card.name,
    };
  }

  private buildWallpaperPrompt(
    cardName: string,
    type: string,
    rarity: string,
  ): string {
    return [
      `Vertical 9:16 mobile wallpaper from this Pokémon card art.`,
      `Pokémon ${cardName}, ${type} type, ${rarity} mood.`,
      `Extend scenery, epic lighting, no card border, no text, no UI.`,
    ].join(' ');
  }

  private buildShortPrompt(cardName: string, type: string): string {
    return `Epic vertical 9:16 wallpaper, Pokémon ${cardName}, ${type} energy, fantasy landscape, cinematic, no text`;
  }

  private async userOwnsCard(userId: number, cardId: number): Promise<boolean> {
    const count = await this.prisma.orderItem.count({
      where: {
        cardId,
        order: { userId, status: 'PAID' },
      },
    });
    return count > 0;
  }

  private async fetchCardImage(imageUrl: string): Promise<Buffer> {
    if (!imageUrl?.trim()) {
      throw new BadRequestException('Image de carte indisponible');
    }
    try {
      const res = await axios.get<ArrayBuffer>(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 20_000,
        maxContentLength: 8 * 1024 * 1024,
      });
      return Buffer.from(res.data);
    } catch {
      throw new BadRequestException(
        "Impossible de télécharger l'image de la carte",
      );
    }
  }

  private async extractIllustration(cardImage: Buffer): Promise<Buffer> {
    const meta = await sharp(cardImage).metadata();
    const w = meta.width ?? 400;
    const h = meta.height ?? 560;

    return sharp(cardImage)
      .extract({
        left: Math.round(w * 0.06),
        top: Math.round(h * 0.105),
        width: Math.round(w * 0.88),
        height: Math.round(h * 0.44),
      })
      .png()
      .toBuffer();
  }

  private async createCompactSeed(illustration: Buffer): Promise<Buffer> {
    return sharp(illustration)
      .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  private async createOutpaintSeed(illustration: Buffer): Promise<Buffer> {
    const artW = Math.round(WALLPAPER_WIDTH * 0.78);
    const art = await sharp(illustration)
      .resize(artW, artW, { fit: 'inside' })
      .png()
      .toBuffer();
    const artMeta = await sharp(art).metadata();
    const placedW = artMeta.width ?? artW;
    const placedH = artMeta.height ?? artW;
    const top = Math.round(WALLPAPER_HEIGHT * 0.14);
    const left = Math.round((WALLPAPER_WIDTH - placedW) / 2);

    const base = await sharp({
      create: {
        width: WALLPAPER_WIDTH,
        height: WALLPAPER_HEIGHT,
        channels: 3,
        background: { r: 18, g: 24, b: 42 },
      },
    })
      .png()
      .toBuffer();

    return sharp(base)
      .composite([{ input: art, top, left }])
      .png()
      .toBuffer();
  }

  /** Fond flou depuis l’illustration + Pokémon centré — toujours disponible. */
  private async createArtisticWallpaper(illustration: Buffer): Promise<Buffer> {
    const art = await sharp(illustration)
      .resize(Math.round(WALLPAPER_WIDTH * 0.88), Math.round(WALLPAPER_WIDTH * 0.88), {
        fit: 'inside',
      })
      .png()
      .toBuffer();

    const artMeta = await sharp(art).metadata();
    const placedW = artMeta.width ?? WALLPAPER_WIDTH;
    const placedH = artMeta.height ?? WALLPAPER_HEIGHT;
    const top = Math.round((WALLPAPER_HEIGHT - placedH) / 2);
    const left = Math.round((WALLPAPER_WIDTH - placedW) / 2);

    const bg = await sharp(illustration)
      .resize(WALLPAPER_WIDTH, WALLPAPER_HEIGHT, { fit: 'cover' })
      .blur(28)
      .modulate({ brightness: 0.9, saturation: 1.15 })
      .png()
      .toBuffer();

    return sharp(bg)
      .composite([{ input: art, top, left }])
      .png()
      .toBuffer();
  }

  private async normalizeWallpaper(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(WALLPAPER_WIDTH, WALLPAPER_HEIGHT, { fit: 'cover' })
      .png()
      .toBuffer();
  }

  /** Un seul appel Gemini — évite de brûler le quota. */
  private async tryGeminiOnce(
    apiKey: string,
    prompt: string,
    seedJpeg: Buffer,
  ): Promise<{ buffer: Buffer | null; lastError?: string }> {
    try {
      const res = await axios.post<{
        candidates?: Array<{
          content?: {
            parts?: Array<{ inlineData?: { data?: string } }>;
          };
        }>;
        error?: { message?: string };
      }>(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
        {
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: seedJpeg.toString('base64'),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            imageConfig: { aspectRatio: '9:16' },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          timeout: 90_000,
          maxContentLength: 25 * 1024 * 1024,
        },
      );

      if (res.data?.error?.message) {
        return { buffer: null, lastError: res.data.error.message };
      }

      for (const part of res.data?.candidates?.[0]?.content?.parts ?? []) {
        const b64 = part.inlineData?.data;
        if (b64 && b64.length > 5_000) {
          return { buffer: Buffer.from(b64, 'base64') };
        }
      }

      return { buffer: null, lastError: 'Gemini sans image' };
    } catch (error) {
      return { buffer: null, lastError: this.formatAxiosError(error) };
    }
  }

  private async tryPollinations(
    prompt: string,
    shortPrompt: string,
    seedImage: Buffer,
    cardId: number,
  ): Promise<Buffer | null> {
    const apiKey = this.config.get<string>('POLLINATIONS_API_KEY')?.trim();

    const post = await this.pollinationsPost(prompt, seedImage, cardId, apiKey);
    if (post) return post;

    try {
      const url =
        `https://image.pollinations.ai/prompt/${encodeURIComponent(shortPrompt)}` +
        `?width=${WALLPAPER_WIDTH}&height=${WALLPAPER_HEIGHT}&nologo=true&enhance=true&seed=${cardId}`;

      const res = await axios.get<ArrayBuffer>(url, {
        responseType: 'arraybuffer',
        timeout: 120_000,
        maxContentLength: 20 * 1024 * 1024,
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      });

      const buffer = Buffer.from(res.data);
      if (buffer.length > 20_000) {
        return buffer;
      }
    } catch (error) {
      this.logger.warn(
        `Pollinations GET: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return null;
  }

  private async pollinationsPost(
    prompt: string,
    seedImage: Buffer,
    seed: number,
    apiKey?: string,
  ): Promise<Buffer | null> {
    try {
      const form = new FormData();
      form.append('image', seedImage, {
        filename: 'seed.png',
        contentType: 'image/png',
      });
      form.append('model', 'flux');
      form.append('width', String(WALLPAPER_WIDTH));
      form.append('height', String(WALLPAPER_HEIGHT));
      form.append('seed', String(seed));
      form.append('nologo', 'true');
      form.append('enhance', 'true');

      const headers: Record<string, string> = form.getHeaders();
      if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`;
      }

      const res = await axios.post<ArrayBuffer>(
        `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}`,
        form,
        {
          headers,
          responseType: 'arraybuffer',
          timeout: 120_000,
          maxContentLength: 20 * 1024 * 1024,
        },
      );

      const buffer = Buffer.from(res.data);
      if (buffer.length > 20_000) {
        return buffer;
      }
    } catch (error) {
      this.logger.warn(
        `Pollinations POST: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return null;
  }

  private formatAxiosError(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as
        | { error?: { message?: string }; message?: string }
        | undefined;
      const msg =
        data?.error?.message ??
        (typeof data?.message === 'string' ? data.message : undefined);
      if (msg) return msg.slice(0, 200);
      return error.message;
    }
    return error instanceof Error ? error.message : String(error);
  }
}
