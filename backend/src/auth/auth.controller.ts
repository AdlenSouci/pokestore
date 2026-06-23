import { Controller, Post, Body, Get, Put, Patch, UseGuards, Req, Res, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';
import { GoogleAuthGuard, JwtAuthGuard } from './guards/auth.guard';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private config: ConfigService,
    ) { }

    private frontendBaseUrl(): string {
        return (
            this.config.get<string>('FRONTEND_URL')?.replace(/\/$/, '') ||
            'http://localhost:5173'
        );
    }

    private isAppRedirect(url: string): boolean {
        return url.startsWith('pokestore://') || url.startsWith('exp://');
    }

    private buildOAuthRedirect(base: string, params: Record<string, string>): string {
        const separator = base.includes('?') ? '&' : '?';
        const query = new URLSearchParams(params).toString();
        return `${base}${separator}${query}`;
    }

    private oauthRedirectBase(req: Request): string {
        const fromCookie = req.cookies?.oauth_redirect as string | undefined;
        if (fromCookie) {
            return decodeURIComponent(fromCookie);
        }
        return this.frontendBaseUrl();
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

  /** Démarre OAuth Google pour l'app mobile (Expo Go). */
  @Get('google/mobile')
  googleAuthMobile(@Query('redirect_uri') redirectUri: string, @Res() res: Response) {
    const fallback = 'pokestore://auth';
    const target = redirectUri?.trim() || fallback;
    res.cookie('oauth_redirect', encodeURIComponent(target), {
      httpOnly: true,
      maxAge: 5 * 60 * 1000,
      sameSite: 'lax',
      secure: true,
    });
    return res.redirect('/api/auth/google');
  }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth() {
        // La redirection est gérée par le guard
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
        const redirectBase = this.oauthRedirectBase(req);
        res.clearCookie('oauth_redirect');

        if (!req.user) {
            const errorMsg = 'Jeune dresseur, ton compte existe déjà ! Connecte-toi avec ton email et mot de passe.';
            if (this.isAppRedirect(redirectBase)) {
                return res.redirect(this.buildOAuthRedirect(redirectBase, { error: errorMsg }));
            }
            const frontendUrl = `${redirectBase}/?error=${encodeURIComponent(errorMsg)}`;
            return res.redirect(frontendUrl);
        }

        const result = await this.authService.googleLogin(req.user);

        if (this.isAppRedirect(redirectBase)) {
            return res.redirect(this.buildOAuthRedirect(redirectBase, { token: result.access_token }));
        }

        res.redirect(`${redirectBase}/?token=${result.access_token}`);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req) {
        return this.authService.getProfile(req.user.userId);
    }

    @Put('profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
        return this.authService.updateProfile(req.user.userId, updateProfileDto);
    }

    @Patch('password')
    @UseGuards(JwtAuthGuard)
    async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
        return this.authService.changePassword(req.user.userId, changePasswordDto);
    }

    @Post('set-password')
    @UseGuards(JwtAuthGuard)
    async setPassword(@Req() req, @Body() setPasswordDto: { newPassword: string }) {
        return this.authService.setPassword(req.user.userId, setPasswordDto);
    }
}
