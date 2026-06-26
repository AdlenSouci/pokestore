import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const role = request.user?.role as UserRole | undefined;

    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Accès réservé aux administrateurs.');
    }

    return true;
  }
}
