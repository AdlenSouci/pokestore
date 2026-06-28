import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password, name } = registerDto;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new UnauthorizedException('Cet email est déjà utilisé');
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: UserRole.USER,
            },
        });

        // Email de bienvenue en arrière-plan — ne pas bloquer l'inscription (SMTP lent sur Render)
        void this.mailService.sendWelcomeEmail(user.email, user.name ?? 'Dresseur');

        return this.generateToken(user);
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Trouver l'utilisateur
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        // Générer le token JWT
        return this.generateToken(user);
    }

    /** Connexion réservée au panel Electron — rôle ADMIN obligatoire. */
    async adminLogin(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        if (user.role !== UserRole.ADMIN) {
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        return this.generateToken(user);
    }

    async googleLogin(user: any) {
        // L'utilisateur est déjà créé/mis à jour par GoogleStrategy
        return this.generateToken(user);
    }

    async getProfile(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            hasPassword: !!user.password,
            role: user.role,
        };
    }

    async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                name: updateProfileDto.name,
                phone: updateProfileDto.phone,
            },
        });

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            hasPassword: !!user.password,
            role: user.role,
        };
    }

    async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.password) {
            throw new NotFoundException('Utilisateur non trouvé');
        }

        // Vérifier l'ancien mot de passe
        const isPasswordValid = await bcrypt.compare(
            changePasswordDto.currentPassword,
            user.password
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Mot de passe actuel incorrect');
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

        // Mettre à jour le mot de passe
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { message: 'Mot de passe modifié avec succès' };
    }

    async setPassword(userId: number, setPasswordDto: { newPassword: string }) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }

        if (user.password) {
            throw new UnauthorizedException('Tu as déjà un mot de passe ! Utilise la fonction de changement de mot de passe.');
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(setPasswordDto.newPassword, 10);

        // Définir le mot de passe
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { message: 'Mot de passe défini avec succès ! Tu peux maintenant te connecter avec ton email et mot de passe.' };
    }

    private generateToken(user: { id: number; email: string; name: string | null; phone?: string | null; password?: string | null; role?: UserRole }) {
        const payload = {
            email: user.email,
            sub: user.id,
            name: user.name,
            role: user.role ?? UserRole.USER,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                hasPassword: !!user.password,
                role: user.role ?? UserRole.USER,
            },
        };
    }
}
