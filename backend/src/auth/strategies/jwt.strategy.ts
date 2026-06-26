import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'votre-secret-jwt-super-securise-changez-moi-en-production',
        });
    }

    async validate(payload: { sub: number; email: string; name?: string; role?: UserRole }) {
        return {
            userId: payload.sub,
            email: payload.email,
            name: payload.name,
            role: payload.role ?? UserRole.USER,
        };
    }
}
