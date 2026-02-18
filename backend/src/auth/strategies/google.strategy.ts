import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private prisma: PrismaService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        try {
            const { id, name, emails } = profile;
            const email = emails[0].value;
            const fullName = name.givenName + ' ' + name.familyName;

            // Vérifier si un utilisateur existe déjà avec ce googleId
            let user = await this.prisma.user.findUnique({
                where: { googleId: id },
            });

            if (user) {
                // Mettre à jour les infos si l'utilisateur existe déjà
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        name: fullName,
                        email: email,
                    },
                });
            } else {
                // Vérifier si un utilisateur existe avec cet email (inscription classique)
                const existingUser = await this.prisma.user.findUnique({
                    where: { email },
                });

                if (existingUser && !existingUser.googleId) {
                    // Un compte existe déjà avec cet email mais sans Google
                    const error = new Error('Jeune dresseur, ton compte existe déjà ! Connecte-toi avec ton email et mot de passe.');
                    error.name = 'AccountExistsError';
                    done(error, false);
                    return;
                } else if (existingUser) {
                    // Le compte a déjà un googleId, mettre à jour
                    user = await this.prisma.user.update({
                        where: { id: existingUser.id },
                        data: {
                            googleId: id,
                            name: fullName,
                        },
                    });
                } else {
                    // Créer un nouveau utilisateur
                    user = await this.prisma.user.create({
                        data: {
                            googleId: id,
                            email: email,
                            name: fullName,
                        },
                    });
                }
            }

            done(null, user);
        } catch (error) {
            console.error('Google OAuth error:', error);
            done(error, false);
        }
    }
}
