import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import sharp from 'sharp';
import { PrismaService } from '../database/prisma.service';

const WALLPAPER_WIDTH = 1080;
const WALLPAPER_HEIGHT = 1920;

type WallpaperSource = 'openai' | 'composite';

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
    const openAiBuffer = await this.tryOpenAiWallpaper(card.type, card.rarity);

    let output: Buffer;
    let source: WallpaperSource;

    if (openAiBuffer) {
      output = await this.compositeCardOnBackground(openAiBuffer, cardImage, card.name);
      source = 'openai';
    } else {
      output = await this.compositeWallpaper(cardImage, card.name, card.type);
      source = 'composite';
    }

    return {
      imageBase64: output.toString('base64'),
      mimeType: 'image/png',
      source,
      cardName: card.name,
    };
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

  private async tryOpenAiWallpaper(
    type: string,
    rarity: string,
  ): Promise<Buffer | null> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY')?.trim();
    if (!apiKey) {
      return null;
    }

    const prompt = [
      'Vertical smartphone wallpaper, cinematic fantasy atmosphere,',
      `inspired by a ${type} elemental trading card, ${rarity} rarity,`,
      'rich colors, light particles, scenic abstract background,',
      'no text, no logos, no copyrighted character names',
    ].join(' ');

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
        `OpenAI wallpaper fallback: ${error instanceof Error ? error.message : String(error)}`,
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

  private async compositeWallpaper(
    cardImage: Buffer,
    cardName: string,
    type: string,
  ): Promise<Buffer> {
    const accent = this.typeAccentRgb(type);

    const background = await sharp(cardImage)
      .resize(WALLPAPER_WIDTH, WALLPAPER_HEIGHT, { fit: 'cover' })
      .blur(28)
      .modulate({ brightness: 0.55, saturation: 1.25 })
      .toBuffer();

    const cardWidth = Math.round(WALLPAPER_WIDTH * 0.68);
    const cardHeight = Math.round(cardWidth * (88 / 63));
    const cardTop = Math.round((WALLPAPER_HEIGHT - cardHeight) / 2 - 60);
    const cardLeft = Math.round((WALLPAPER_WIDTH - cardWidth) / 2);

    const cardOverlay = await sharp(cardImage)
      .resize(cardWidth, cardHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    const vignette = Buffer.from(
      `<svg width="${WALLPAPER_WIDTH}" height="${WALLPAPER_HEIGHT}">
        <defs>
          <radialGradient id="g" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,0.75)"/>
          </radialGradient>
          <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(${accent.r},${accent.g},${accent.b},0.15)"/>
            <stop offset="100%" stop-color="rgba(10,12,30,0.9)"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#b)"/>
        <rect width="100%" height="100%" fill="url(#g)"/>
      </svg>`,
    );

    const safeName = this.escapeXml(cardName).slice(0, 48);
    const label = Buffer.from(
      `<svg width="${WALLPAPER_WIDTH}" height="200">
        <text x="50%" y="120" text-anchor="middle"
          font-family="Arial, sans-serif" font-size="42" font-weight="700"
          fill="white" stroke="rgba(0,0,0,0.5)" stroke-width="3">
          ${safeName}
        </text>
        <text x="50%" y="165" text-anchor="middle"
          font-family="Arial, sans-serif" font-size="24"
          fill="rgba(255,255,255,0.85)">
          PokéStore · ${this.escapeXml(type)}
        </text>
      </svg>`,
    );

    return sharp(background)
      .composite([
        { input: vignette, top: 0, left: 0 },
        { input: cardOverlay, top: cardTop, left: cardLeft },
        { input: label, top: WALLPAPER_HEIGHT - 200, left: 0 },
      ])
      .png()
      .toBuffer();
  }

  private async compositeCardOnBackground(
    background: Buffer,
    cardImage: Buffer,
    cardName: string,
  ): Promise<Buffer> {
    const bg = await sharp(background)
      .resize(WALLPAPER_WIDTH, WALLPAPER_HEIGHT, { fit: 'cover' })
      .toBuffer();

    const cardWidth = Math.round(WALLPAPER_WIDTH * 0.62);
    const cardHeight = Math.round(cardWidth * (88 / 63));
    const cardTop = Math.round((WALLPAPER_HEIGHT - cardHeight) / 2);
    const cardLeft = Math.round((WALLPAPER_WIDTH - cardWidth) / 2);

    const cardOverlay = await sharp(cardImage)
      .resize(cardWidth, cardHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    const shadow = Buffer.from(
      `<svg width="${cardWidth + 40}" height="${cardHeight + 40}">
        <rect x="20" y="20" width="${cardWidth}" height="${cardHeight}" rx="18"
          fill="rgba(0,0,0,0.45)"/>
      </svg>`,
    );

    const label = Buffer.from(
      `<svg width="${WALLPAPER_WIDTH}" height="120">
        <text x="50%" y="70" text-anchor="middle"
          font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="white">
          ${this.escapeXml(cardName).slice(0, 48)}
        </text>
      </svg>`,
    );

    return sharp(bg)
      .composite([
        { input: shadow, top: cardTop - 10, left: cardLeft - 10 },
        { input: cardOverlay, top: cardTop, left: cardLeft },
        { input: label, top: WALLPAPER_HEIGHT - 130, left: 0 },
      ])
      .png()
      .toBuffer();
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
