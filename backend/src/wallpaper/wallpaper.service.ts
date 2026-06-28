import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import sharp from 'sharp';
import { PrismaService } from '../database/prisma.service';

const WALLPAPER_WIDTH = 1080;
const WALLPAPER_HEIGHT = 1920;

export type WallpaperSource = 'gemini';

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
    const apiKey = this.config.get<string>('GEMINI_API_KEY')?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'GEMINI_API_KEY manquante sur le serveur. Ajoute-la dans Render → Environment puis redéploie.',
      );
    }

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
    const seedImage = await this.createCompactSeed(illustration);
    const prompt = this.buildWallpaperPrompt(card.name, card.type, card.rarity);

    const { buffer, lastError } = await this.generateWithGemini(
      apiKey,
      prompt,
      card.name,
      card.type,
      card.rarity,
      seedImage,
    );

    if (!buffer) {
      this.logger.error(
        `Wallpaper échoué carte ${cardId} (${card.name}): ${lastError ?? 'inconnu'}`,
      );
      throw new ServiceUnavailableException(
        lastError
          ? `Génération IA impossible : ${lastError}`
          : "La génération IA n'a pas abouti. Réessaie dans une minute.",
      );
    }

    const normalized = await this.normalizeWallpaper(buffer);
    return {
      imageBase64: normalized.toString('base64'),
      mimeType: 'image/png',
      source: 'gemini',
      cardName: card.name,
    };
  }

  private buildWallpaperPrompt(
    cardName: string,
    type: string,
    rarity: string,
  ): string {
    return [
      `Create a full vertical 9:16 mobile phone wallpaper from this Pokémon card artwork.`,
      `The Pokémon ${cardName} must be the hero — same species, recognizable.`,
      `${type} type atmosphere, ${rarity} cinematic mood.`,
      `Extend the scenery above and below to fill the frame.`,
      `Epic environment, dramatic lighting, painterly detail.`,
      `NO trading card border, NO attack text, NO HP, NO UI, NO watermark.`,
    ].join(' ');
  }

  private buildTextOnlyPrompt(
    cardName: string,
    type: string,
    rarity: string,
  ): string {
    return [
      `Create a vertical 9:16 mobile phone wallpaper featuring the Pokémon ${cardName}.`,
      `${type} type energy, ${rarity} rarity, epic fantasy landscape,`,
      `dramatic lighting, full bleed artwork, no text, no card frame, no UI.`,
    ].join(' ');
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

  /** Seed léger pour l’API Gemini (évite les payloads trop gros). */
  private async createCompactSeed(illustration: Buffer): Promise<Buffer> {
    return sharp(illustration)
      .resize(768, 768, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toBuffer();
  }

  private async normalizeWallpaper(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(WALLPAPER_WIDTH, WALLPAPER_HEIGHT, { fit: 'cover' })
      .png()
      .toBuffer();
  }

  private async generateWithGemini(
    apiKey: string,
    imagePrompt: string,
    cardName: string,
    type: string,
    rarity: string,
    seedImage: Buffer,
  ): Promise<{ buffer: Buffer | null; lastError?: string }> {
    const seedB64 = seedImage.toString('base64');
    const models = [
      'gemini-2.5-flash-image',
      'gemini-2.0-flash-preview-image-generation',
    ];

    let lastError: string | undefined;

    for (const model of models) {
      const withImage = await this.callGemini(apiKey, model, [
        { text: imagePrompt },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: seedB64,
          },
        },
      ]);
      if (withImage.buffer) {
        this.logger.log(`Wallpaper Gemini OK (${model}, image+text)`);
        return withImage;
      }
      lastError = withImage.lastError ?? lastError;

      const textOnly = await this.callGemini(apiKey, model, [
        { text: this.buildTextOnlyPrompt(cardName, type, rarity) },
      ]);
      if (textOnly.buffer) {
        this.logger.log(`Wallpaper Gemini OK (${model}, text-only)`);
        return textOnly;
      }
      lastError = textOnly.lastError ?? lastError;
    }

    return { buffer: null, lastError };
  }

  private async callGemini(
    apiKey: string,
    model: string,
    parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>,
  ): Promise<{ buffer: Buffer | null; lastError?: string }> {
    const configs: Array<Record<string, unknown>> = [
      {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio: '9:16' },
      },
      {
        responseFormat: {
          image: { aspectRatio: '9:16' },
        },
      },
      {},
    ];

    const versions = ['v1beta', 'v1'] as const;
    let lastError: string | undefined;

    for (const version of versions) {
      for (const generationConfig of configs) {
        try {
          const body: Record<string, unknown> = {
            contents: [{ parts }],
          };
          if (Object.keys(generationConfig).length > 0) {
            body.generationConfig = generationConfig;
          }

          const res = await axios.post<{
            candidates?: Array<{
              content?: {
                parts?: Array<{
                  inlineData?: { mimeType?: string; data?: string };
                }>;
              };
            }>;
            error?: { message?: string };
          }>(
            `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent`,
            body,
            {
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
              },
              timeout: 120_000,
              maxContentLength: 25 * 1024 * 1024,
            },
          );

          if (res.data?.error?.message) {
            lastError = res.data.error.message;
            continue;
          }

          const responseParts = res.data?.candidates?.[0]?.content?.parts ?? [];
          for (const part of responseParts) {
            const b64 = part.inlineData?.data;
            if (b64 && b64.length > 10_000) {
              return { buffer: Buffer.from(b64, 'base64') };
            }
          }

          lastError = 'Gemini a répondu sans image';
        } catch (error) {
          lastError = this.formatAxiosError(error);
          this.logger.warn(`Gemini ${model} (${version}): ${lastError}`);
        }
      }
    }

    return { buffer: null, lastError };
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
