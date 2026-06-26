import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Ne limite que les requêtes mutantes (POST, PUT, PATCH, DELETE).
 * La navigation GET (boutique, panier, meta…) reste fluide pour les utilisateurs.
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    if (await super.shouldSkip(context)) {
      return true;
    }
    const { method } = context.switchToHttp().getRequest<{ method: string }>();
    return method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
  }
}
