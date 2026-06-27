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

export type WallpaperSource = 'openai' | 'pollinations' | 'card-art';

type ArtLayers = {
  artwork: Buffer;
  hero: Buffer;
  glow: Buffer;
  heroTop: number;
  heroLeft: number;
  overlay: Buffer;
};

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
    const layers = await this.prepareArtLayers(cardImage, card.type);
    const bgPrompt = this.buildBackgroundPrompt(
      card.name,
      card.type,
      card.rarity,
    );

    const blurredSeed = await this.createBlurredBackground(layers.artwork);

    let background: Buffer;
    let source: WallpaperSource;

    const openAiBg = await this.tryOpenAiBackground(bgPrompt);
    if (openAiBg) {
      background = openAiBg;
      source = 'openai';
    } else {
      const aiBg =
        (await this.tryPollinationsImg2Img(
          bgPrompt,
          card.imageUrl,
          cardId,
        )) ??
        (await this.tryPollinationsUpload(bgPrompt, blurredSeed, cardId));

      if (aiBg) {
        background = await this.normalizeWallpaper(aiBg);
        source = 'pollinations';
      } else {
        background = blurredSeed;
        source = 'card-art';
      }
    }

    /** Le Pokémon reste l'artwork carte (calque net) — l'IA ne stylise que l'arrière-plan. */
    const output = await sharp(background)
      .composite([
        { input: layers.glow, top: layers.heroTop + 8, left: layers.heroLeft },
        { input: layers.hero, top: layers.heroTop, left: layers.heroLeft },
        { input: layers.overlay, top: 0, left: 0 },
      ])
      .png()
      .toBuffer();

    return {
      imageBase64: output.toString('base64'),
      mimeType: 'image/png',
      source,
      cardName: card.name,
    };
  }

  private buildBackgroundPrompt(
    cardName: string,
    type: string,
    rarity: string,
  ): string {
    return [
      `Vertical phone wallpaper background for the Pokémon ${cardName}.`,
      `${type} type energy, ${rarity} mood.`,
      `Extend and stylize ONLY the scenery and atmosphere around the character.`,
      `Cinematic fantasy environment, dramatic lighting, full bleed mobile wallpaper.`,
      `Do not add text, logos, card borders, or device frames.`,
      `The Pokémon ${cardName} from the reference must remain recognizable.`,
    ].join(' ');
  }

  private negativePrompt(): string {
    return [
      'smartphone',
      'phone mockup',
      'device frame',
      'text',
      'watermark',
      'logo',
      'trading card border',
      'UI elements',
      'different pokemon',
      'wrong character',
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

  private async normalizeWallpaper(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(WALLPAPER_WIDTH, WALLPAPER_HEIGHT, { fit: 'cover' })
      .png()
      .toBuffer();
  }

  private typeAccentRgb(type: string): { r: number; g: number; b: number } {
    const key = type.toLowerCase();
    const map: Record<string, { r: number; g: number; b: number }> = {
      fire: { r: 255, g: 120, b: 40 },
      water: { r: 40, g: 160, b: 255 },
      grass: { r: 80, g: 200, b: 80 },
      electric: { r: 255, g: 220, b: 60 },
      psychic: { r: 200, g: 80, b: 200 },
      fighting: { r: 200, g: 80, b: 60 },
      darkness: { r: 80, g: 60, b: 120 },
      dark: { r: 80, g: 60, b: 120 },
      metal: { r: 160, g: 170, b: 190 },
      dragon: { r: 120, g: 80, b: 220 },
      fairy: { r: 255, g: 140, b: 200 },
      colorless: { r: 200, g: 200, b: 210 },
    };
    return map[key] ?? { r: 120, g: 140, b: 255 };
  }

  private async extractArtwork(cardImage: Buffer): Promise<Buffer> {
    const meta = await sharp(cardImage).metadata();
    const w = meta.width ?? 400;
    const h = meta.height ?? 560;
    const padX = Math.round(w * 0.07);
    const padY = Math.round(h * 0.09);
    return sharp(cardImage)
      .extract({
        left: padX,
        top: padY,
        width: w - padX * 2,
        height: h - padY * 2,
      })
      .toBuffer();
  }

  private async prepareArtLayers(
    cardImage: Buffer,
    type: string,
  ): Promise<ArtLayers> {
    const artwork = await this.extractArtwork(cardImage);
    const meta = await sharp(artwork).metadata();
    const artW = meta.width ?? 360;
    const artH = meta.height ?? 500;
    const accent = this.typeAccentRgb(type);

    const heroW = Math.round(WALLPAPER_WIDTH * 0.94);
    const heroH = Math.round(heroW * (artH / artW));
    const heroTop = Math.round(WALLPAPER_HEIGHT * 0.06);
    const heroLeft = Math.round((WALLPAPER_WIDTH - heroW) / 2);

    const glow = await sharp(artwork)
      .resize(heroW, heroH, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .blur(18)
      .modulate({ brightness: 1.2, saturation: 1.3 })
      .png()
      .toBuffer();

    const hero = await sharp(artwork)
      .resize(heroW, heroH, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    const overlay = Buffer.from(
      `<svg width="${WALLPAPER_WIDTH}" height="${WALLPAPER_HEIGHT}">
        <defs>
          <radialGradient id="g" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stop-color="rgba(${accent.r},${accent.g},${accent.b},0.35)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
          </radialGradient>
          <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(0,0,0,0.1)"/>
            <stop offset="75%" stop-color="rgba(0,0,0,0)"/>
            <stop offset="100%" stop-color="rgba(8,10,24,0.8)"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
        <rect width="100%" height="100%" fill="url(#v)"/>
      </svg>`,
    );

    return { artwork, hero, glow, heroTop, heroLeft, overlay };
  }

  private async createBlurredBackground(artwork: Buffer): Promise<Buffer> {
    return sharp(artwork)
      .resize(WALLPAPER_WIDTH, WALLPAPER_HEIGHT, {
        fit: 'cover',
        position: 'attention',
      })
      .blur(36)
      .modulate({ brightness: 0.42, saturation: 1.5 })
      .png()
      .toBuffer();
  }

  /** IA OpenAI : génère l'ambiance / le décor (DALL·E 3). */
  private async tryOpenAiBackground(prompt: string): Promise<Buffer | null> {
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
          n: 1,
        },
        {
          headers: { Authorization: `Bearer ${apiKey}` },
          timeout: 90_000,
        },
      );

      const b64 = res.data?.data?.[0]?.b64_json;
      if (!b64) {
        return null;
      }
      return this.normalizeWallpaper(Buffer.from(b64, 'base64'));
    } catch (error) {
      this.logger.warn(
        `OpenAI wallpaper: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  /** IA Flux img2img : la carte sert de référence visuelle pour le décor. */
  private async tryPollinationsImg2Img(
    prompt: string,
    cardImageUrl: string,
    seed: number,
  ): Promise<Buffer | null> {
    try {
      const params = new URLSearchParams({
        model: 'flux',
        width: String(WALLPAPER_WIDTH),
        height: String(WALLPAPER_HEIGHT),
        seed: String(seed),
        nologo: 'true',
        image: cardImageUrl,
        negative_prompt: this.negativePrompt(),
      });
      const url = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?${params.toString()}`;

      const res = await axios.get<ArrayBuffer>(url, {
        responseType: 'arraybuffer',
        timeout: 120_000,
        maxContentLength: 15 * 1024 * 1024,
        headers: { Accept: 'image/*' },
      });
      const buffer = Buffer.from(res.data);
      if (buffer.length < 2_000) {
        return null;
      }
      return buffer;
    } catch (error) {
      this.logger.warn(
        `Pollinations img2img: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  private async tryPollinationsUpload(
    prompt: string,
    seedImage: Buffer,
    seed: number,
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
      form.append('negative_prompt', this.negativePrompt());

      const res = await axios.post<ArrayBuffer>(
        `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}`,
        form,
        {
          headers: form.getHeaders(),
          responseType: 'arraybuffer',
          timeout: 120_000,
          maxContentLength: 15 * 1024 * 1024,
        },
      );

      const buffer = Buffer.from(res.data);
      if (buffer.length < 2_000) {
        return null;
      }
      return buffer;
    } catch (error) {
      this.logger.warn(
        `Pollinations upload: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }
}
