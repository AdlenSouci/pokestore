import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { GenerateWallpaperDto } from './dto/generate-wallpaper.dto';
import { WallpaperService } from './wallpaper.service';

@Controller('wallpaper')
@UseGuards(JwtAuthGuard)
export class WallpaperController {
  constructor(private readonly wallpaperService: WallpaperService) {}

  @Post('generate')
  @Throttle({ default: { limit: 5, ttl: 3_600_000 } })
  async generate(@Req() req: { user: { userId: number } }, @Body() dto: GenerateWallpaperDto) {
    return this.wallpaperService.generateForUser(req.user.userId, dto.cardId);
  }
}
