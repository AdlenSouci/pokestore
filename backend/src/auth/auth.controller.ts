import { Controller, Post, Body, Get, Put, Patch, UseGuards, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';
import { GoogleAuthGuard, JwtAuthGuard } from './guards/auth.guard';
import type { Response } from 'express';

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

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth() {
        // La redirection est gérée par le guard
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthCallback(@Req() req, @Res() res: Response) {
        // Vérifier si une erreur s'est produite
        if (!req.user) {
            const base = this.frontendBaseUrl();
            const frontendUrl = `${base}/?error=${encodeURIComponent('Jeune dresseur, ton compte existe déjà ! Connecte-toi avec ton email et mot de passe.')}`;
            return res.redirect(frontendUrl);
        }

        const result = await this.authService.googleLogin(req.user);

        const base = this.frontendBaseUrl();
        const frontendUrl = `${base}/auth/callback?token=${result.access_token}`;
        res.redirect(frontendUrl);
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
