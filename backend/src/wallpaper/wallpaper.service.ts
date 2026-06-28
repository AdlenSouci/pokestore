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
import FormData from 'form-data';
import sharp from 'sharp';
import { PrismaService } from '../database/prisma.service';

const WALLPAPER_WIDTH = 1080;
const WALLPAPER_HEIGHT = 1920;

export type WallpaperSource = 'openai' | 'pollinations' | 'gemini';

@Injectable()
export class WallpaperService {
  private readonly logger = new Logger(WallpaperService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

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
    const hasGemini = Boolean(this.config.get<string>('GEMINI_API_KEY')?.trim());

    if (hasGemini) {
      const gemini = await this.tryGeminiWallpaper(prompt, outpaintSeed);
      if (gemini) {
        return {
          imageBase64: gemini.toString('base64'),
          mimeType: 'image/png',
          source: 'gemini',
          cardName: card.name,
        };
      }
    }

    const pollinations = await this.tryPollinationsWallpaper(
      prompt,
      outpaintSeed,
      cardId,
    );
    if (pollinations) {
      return {
        imageBase64: pollinations.toString('base64'),
        mimeType: 'image/png',
        source: 'pollinations',
        cardName: card.name,
      };
    }

    const openAi = await this.tryOpenAiWallpaper(prompt);
    if (openAi) {
      return {
        imageBase64: openAi.toString('base64'),
        mimeType: 'image/png',
        source: 'openai',
        cardName: card.name,
      };
    }

    this.logger.error(
      `Wallpaper IA échoué pour carte ${cardId} (${card.name}) — aucun fournisseur disponible`,
    );
    throw new ServiceUnavailableException(
      hasGemini
        ? "La génération IA n'a pas abouti. Vérifie que GEMINI_API_KEY est bien configurée sur Render, puis redéploie l'API."
        : "La génération IA n'a pas abouti. Configure GEMINI_API_KEY sur Render (dashboard → Environment).",
    );
  }

  private buildWallpaperPrompt(
    cardName: string,
    type: string,
    rarity: string,
  ): string {
    return [
      `Transform this Pokémon card illustration into a full vertical 9:16 mobile phone wallpaper.`,
      `The Pokémon ${cardName} must stay the hero — same species, same pose, recognizable.`,
      `${type} type atmosphere, ${rarity} cinematic mood.`,
      `Outpaint and extend the scenery above and below to fill the entire frame.`,
      `Epic fantasy environment, dramatic lighting, painterly detail.`,
      `NO trading card, NO card border, NO attack text, NO HP, NO UI, NO watermark, NO phone frame.`,
      `Full bleed wallpaper art only.`,
    ].join(' ');
  }

  private negativePrompt(): string {
    return [
      'trading card',
      'card border',
      'card frame',
      'text',
      'letters',
      'numbers',
      'hp',
      'attack',
      'damage',
      'watermark',
      'logo',
      'smartphone',
      'phone mockup',
      'device frame',
      'ui',
      'flat color background',
      'solid background',
      'wrong pokemon',
    ].join(', ');
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

  /** Fenêtre illustration TCG (sans texte d'attaque en bas). */
  private async extractIllustration(cardImage: Buffer): Promise<Buffer> {
    const meta = await sharp(cardImage).metadata();
    const w = meta.width ?? 400;
    const h = meta.height ?? 560;

    const left = Math.round(w * 0.06);
    const top = Math.round(h * 0.105);
    const width = Math.round(w * 0.88);
    const height = Math.round(h * 0.44);

    return sharp(cardImage)
      .extract({ left, top, width, height })
      .png()
      .toBuffer();
  }

  /**
   * Illustration centrée sur toile verticale — l'IA doit remplir le reste (outpainting).
   */
  private async createOutpaintSeed(illustration: Buffer): Promise<Buffer> {
    const artMeta = await sharp(illustration).metadata();
    const artW = Math.round(WALLPAPER_WIDTH * 0.78);
    const artH = Math.round(
      artW * ((artMeta.height ?? 1) / (artMeta.width ?? 1)),
    );
    const top = Math.round(WALLPAPER_HEIGHT * 0.14);
    const left = Math.round((WALLPAPER_WIDTH - artW) / 2);

    const art = await sharp(illustration)
      .resize(artW, artH, { fit: 'inside' })
      .png()
      .toBuffer();

    const artPlaced = await sharp(art).metadata();
    const placedW = artPlaced.width ?? artW;
    const placedH = artPlaced.height ?? artH;
    const adjLeft = Math.round((WALLPAPER_WIDTH - placedW) / 2);

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
      .composite([{ input: art, top, left: adjLeft }])
      .png()
      .toBuffer();
  }

  private async normalizeWallpaper(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(WALLPAPER_WIDTH, WALLPAPER_HEIGHT, { fit: 'cover' })
      .png()
      .toBuffer();
  }

  /** Rejette les images plates (fond uni) ou trop petites. */
  private async isValidAiWallpaper(
    buffer: Buffer,
    options?: { relaxed?: boolean },
  ): Promise<boolean> {
    const minSize = options?.relaxed ? 40_000 : 80_000;
    if (buffer.length < minSize) {
      return false;
    }

    const { channels } = await sharp(buffer)
      .resize(120, 120, { fit: 'cover' })
      .stats();

    const avgStdev =
      (channels[0].stdev + channels[1].stdev + channels[2].stdev) / 3;

    const minStdev = options?.relaxed ? 12 : 22;
    if (avgStdev < minStdev) {
      this.logger.warn(`Wallpaper rejeté: image trop plate (stdev=${avgStdev.toFixed(1)})`);
      return false;
    }

    const bottom = await sharp(buffer)
      .extract({
        left: 0,
        top: Math.round(WALLPAPER_HEIGHT * 0.72),
        width: WALLPAPER_WIDTH,
        height: Math.round(WALLPAPER_HEIGHT * 0.28),
      })
      .resize(80, 40)
      .stats();

    const bottomStdev =
      (bottom.channels[0].stdev +
        bottom.channels[1].stdev +
        bottom.channels[2].stdev) /
      3;

    const minBottomStdev = options?.relaxed ? 8 : 15;
    if (bottomStdev < minBottomStdev) {
      this.logger.warn(
        `Wallpaper rejeté: bas de l'image vide/uniforme (stdev=${bottomStdev.toFixed(1)})`,
      );
      return false;
    }

    return true;
  }

  private async tryPollinationsWallpaper(
    prompt: string,
    seedImage: Buffer,
    seed: number,
  ): Promise<Buffer | null> {
    const apiKey = this.config.get<string>('POLLINATIONS_API_KEY')?.trim();

    const attempts: Array<() => Promise<Buffer | null>> = [
      () => this.pollinationsPost(prompt, seedImage, seed, 'flux', apiKey),
      () => this.pollinationsPost(prompt, seedImage, seed, 'kontext', apiKey),
    ];

    for (const attempt of attempts) {
      const buffer = await attempt();
      if (!buffer) continue;
      const normalized = await this.normalizeWallpaper(buffer);
      if (await this.isValidAiWallpaper(normalized)) {
        return normalized;
      }
    }

    return null;
  }

  private async pollinationsPost(
    prompt: string,
    seedImage: Buffer,
    seed: number,
    model: string,
    apiKey?: string,
  ): Promise<Buffer | null> {
    try {
      const form = new FormData();
      form.append('image', seedImage, {
        filename: 'seed.png',
        contentType: 'image/png',
      });
      form.append('model', model);
      form.append('width', String(WALLPAPER_WIDTH));
      form.append('height', String(WALLPAPER_HEIGHT));
      form.append('seed', String(seed));
      form.append('nologo', 'true');
      form.append('enhance', 'true');
      form.append('guidance_scale', '9');
      form.append('negative_prompt', this.negativePrompt());

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
          timeout: 180_000,
          maxContentLength: 20 * 1024 * 1024,
        },
      );

      const buffer = Buffer.from(res.data);
      if (buffer.length < 5_000) {
        return null;
      }
      return buffer;
    } catch (error) {
      this.logger.warn(
        `Pollinations ${model}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  /** Gemini en priorité — modèles image natifs Google (Nano Banana). */
  private async tryGeminiWallpaper(
    prompt: string,
    seedImage: Buffer,
  ): Promise<Buffer | null> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY')?.trim();
    if (!apiKey) {
      return null;
    }

    const models = [
      'gemini-2.5-flash-image',
      'gemini-2.0-flash-preview-image-generation',
    ];

    const parts = [
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/png',
          data: seedImage.toString('base64'),
        },
      },
    ];

    for (const model of models) {
      const configs: Array<Record<string, unknown>> = [
        {
          responseFormat: {
            image: { aspectRatio: '9:16' },
          },
        },
        {
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: { aspectRatio: '9:16' },
        },
      ];

      for (const generationConfig of configs) {
        const buffer = await this.callGeminiGenerate(
          apiKey,
          model,
          parts,
          generationConfig,
        );
        if (!buffer) continue;

        const normalized = await this.normalizeWallpaper(buffer);
        if (await this.isValidAiWallpaper(normalized, { relaxed: true })) {
          this.logger.log(`Wallpaper Gemini OK (${model})`);
          return normalized;
        }
        if (normalized.length > 50_000) {
          this.logger.warn(
            `Wallpaper Gemini: validation souple — image conservée (${model})`,
          );
          return normalized;
        }
      }
    }

    this.logger.warn('Gemini wallpaper: aucun modèle n’a renvoyé une image valide');
    return null;
  }

  private async callGeminiGenerate(
    apiKey: string,
    model: string,
    parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>,
    generationConfig: Record<string, unknown>,
  ): Promise<Buffer | null> {
    const apiVersions = ['v1beta', 'v1'] as const;

    for (const version of apiVersions) {
      try {
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
          {
            contents: [{ parts }],
            generationConfig,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            timeout: 180_000,
          },
        );

        const responseParts = res.data?.candidates?.[0]?.content?.parts ?? [];
        for (const part of responseParts) {
          const b64 = part.inlineData?.data;
          if (b64) {
            return Buffer.from(b64, 'base64');
          }
        }
      } catch (error) {
        const msg =
          axios.isAxiosError(error) && error.response?.data
            ? JSON.stringify(error.response.data).slice(0, 300)
            : error instanceof Error
              ? error.message
              : String(error);
        this.logger.warn(`Gemini ${model} (${version}): ${msg}`);
      }
    }

    return null;
  }

  /** Dernier secours si Gemini indisponible. */
  private async tryOpenAiWallpaper(prompt: string): Promise<Buffer | null> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY')?.trim();
    if (!apiKey) {
      return null;
    }

    try {
      const res = await axios.post<{
        data?: Array<{ b64_json?: string }>;
      }>(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'dall-e-3',
          prompt,
          size: '1024x1792',
          response_format: 'b64_json',
          quality: 'hd',
          n: 1,
        },
        {
          headers: { Authorization: `Bearer ${apiKey}` },
          timeout: 120_000,
        },
      );

      const b64 = res.data?.data?.[0]?.b64_json;
      if (!b64) {
        return null;
      }

      const normalized = await this.normalizeWallpaper(
        Buffer.from(b64, 'base64'),
      );

      if (!(await this.isValidAiWallpaper(normalized))) {
        this.logger.warn('OpenAI wallpaper rejeté après validation');
        return null;
      }

      return normalized;
    } catch (error) {
      this.logger.warn(
        `OpenAI wallpaper: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }
}
