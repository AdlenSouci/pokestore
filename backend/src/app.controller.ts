import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health(): { ok: boolean; geminiWallpaper: boolean } {
    return {
      ok: true,
      geminiWallpaper: Boolean(process.env.GEMINI_API_KEY?.trim()),
    };
  }
}
