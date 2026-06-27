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
    const prompt = this.buildWallpaperPrompt(card.name, card.type, card.rarity);

    let output: Buffer;
    let source: WallpaperSource;

    const openAiBuffer = await this.tryOpenAiWallpaper(prompt);
    if (openAiBuffer) {
      output = await this.normalizeWallpaper(openAiBuffer);
      source = 'openai';
    } else {
      const aiBuffer =
        (await this.tryPollinationsImg2Img(prompt, card.imageUrl, cardId)) ??
        (await this.tryPollinationsUpload(prompt, cardImage, cardId));

      if (aiBuffer) {
        output = await this.normalizeWallpaper(aiBuffer);
        source = 'pollinations';
      } else {
        output = await this.createCardBasedWallpaper(cardImage, card.type);
        source = 'card-art';
      }
    }

    return {
      imageBase64: output.toString('base64'),
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
      `Transform this Pokémon card artwork into a vertical phone wallpaper.`,
      `The Pokémon ${cardName} must be the clear hero of the image.`,
      `${type} type energy, ${rarity} rarity mood.`,
      `Extend and stylize the background from the card art.`,
      `Cinematic fantasy atmosphere, full bleed mobile wallpaper.`,
      `No smartphone mockup, no device frame, no text, no card border.`,
    ].join(' ');
  }

  private negativePrompt(): string {
    return [
      'smartphone',
      'phone mockup',
      'device frame',
      'screen bezel',
      'text',
      'watermark',
      'logo',
      'trading card border',
      'UI elements',
    ].join(', ');
  }

  private async userOwnsCard(userId: number, cardId: number): Promise<boolean> {
    const count = await this.prisma.orderItem.count({
      where: {
        cardId,
        order: {
          userId,
          status: 'PAID',
        },
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
      return Buffer.from(b64, 'base64');
    } catch (error) {
      this.logger.warn(
        `OpenAI wallpaper: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  /** IA img2img : la carte (URL publique) sert de référence visuelle. */
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
      const encodedPrompt = encodeURIComponent(prompt);
      const url = `https://gen.pollinations.ai/image/${encodedPrompt}?${params.toString()}`;

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

  /** IA img2img : envoi direct du fichier carte (si l'URL ne suffit pas). */
  private async tryPollinationsUpload(
    prompt: string,
    cardImage: Buffer,
    seed: number,
  ): Promise<Buffer | null> {
    try {
      const form = new FormData();
      form.append('image', cardImage, {
        filename: 'card.png',
        contentType: 'image/png',
      });
      form.append('model', 'flux');
      form.append('width', String(WALLPAPER_WIDTH));
      form.append('height', String(WALLPAPER_HEIGHT));
      form.append('seed', String(seed));
      form.append('nologo', 'true');
      form.append('negative_prompt', this.negativePrompt());

      const encodedPrompt = encodeURIComponent(prompt);
      const res = await axios.post<ArrayBuffer>(
        `https://gen.pollinations.ai/image/${encodedPrompt}`,
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

  /**
   * Secours fiable : le Pokémon de la carte reste visible (artwork agrandi + fond étendu).
   */
  private async createCardBasedWallpaper(
    cardImage: Buffer,
    type: string,
  ): Promise<Buffer> {
    const accent = this.typeAccentRgb(type);

    const background = await sharp(cardImage)
      .resize(WALLPAPER_WIDTH, WALLPAPER_HEIGHT, {
        fit: 'cover',
        position: 'attention',
      })
      .blur(38)
      .modulate({ brightness: 0.45, saturation: 1.35 })
      .toBuffer();

    const heroWidth = Math.round(WALLPAPER_WIDTH * 0.88);
    const heroHeight = Math.round(heroWidth * (88 / 63));
    const heroTop = Math.round(WALLPAPER_HEIGHT * 0.1);
    const heroLeft = Math.round((WALLPAPER_WIDTH - heroWidth) / 2);

    const hero = await sharp(cardImage)
      .resize(heroWidth, heroHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    const vignette = Buffer.from(
      `<svg width="${WALLPAPER_WIDTH}" height="${WALLPAPER_HEIGHT}">
        <defs>
          <radialGradient id="glow" cx="50%" cy="38%" r="55%">
            <stop offset="0%" stop-color="rgba(${accent.r},${accent.g},${accent.b},0.25)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
          </radialGradient>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="70%" stop-color="rgba(0,0,0,0)"/>
            <stop offset="100%" stop-color="rgba(5,8,20,0.75)"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#glow)"/>
        <rect width="100%" height="100%" fill="url(#fade)"/>
      </svg>`,
    );

    return sharp(background)
      .composite([
        { input: hero, top: heroTop, left: heroLeft },
        { input: vignette, top: 0, left: 0 },
      ])
      .png()
      .toBuffer();
  }
}
