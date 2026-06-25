import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('captcha')
  getCaptcha() {
    const { question, token } = this.contactService.createCaptchaChallenge();
    return { question, token };
  }

  @Post()
  async send(@Body() dto: ContactDto, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      'unknown';
    return this.contactService.sendContact(dto, ip);
  }
}
