import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  // rawBody: true est nécessaire pour que le webhook Stripe puisse vérifier la signature
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use(helmet());
  app.use(cookieParser());

  // Page d'accueil de l'API (avant le prefix global) — évite "Cannot GET /"
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/' || req.path === '') {
      res.type('html').send(`<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>PokéStore API</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #1a1f3a; color: #fff;
           display: flex; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; padding: 24px; }
    .card { background: #2d3561; border: 4px solid #5a4f99; padding: 32px 40px;
            border-radius: 16px; max-width: 520px; }
    h1 { color: #7ec8a3; margin: 0 0 8px; }
    p { color: #c4b5fd; line-height: 1.6; margin: 8px 0; }
    a { color: #7ec8a3; text-decoration: none; font-weight: bold; }
    a:hover { text-decoration: underline; }
    code { background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>PokéStore API</h1>
    <p>API REST opérationnelle. Toutes les routes sont préfixées par <code>/api</code>.</p>
    <p>
      📚 <a href="/api/docs">Documentation Swagger</a><br/>
      ❤️ <a href="/api/health">Health check</a><br/>
      🃏 <a href="/api/cards?pageSize=5">Exemple : 5 cartes</a>
    </p>
    <p style="opacity:.6;font-size:13px;margin-top:24px;">
      Projet pédagogique Ynov B3 DEV — Pokémon™ © Nintendo / Game Freak.
    </p>
  </div>
</body>
</html>`);
      return;
    }
    next();
  });

  // Préfixe global /api pour toutes les routes (utile pour l'app mobile)
  app.setGlobalPrefix('api');

  // CORS — frontend Vercel + mobile + localhost
  const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = [
        frontendUrl,
        'https://pokestore-hazel.vercel.app',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ].filter(Boolean) as string[];
      if (allowed.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      callback(null, true);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
    credentials: true,
  });

  // Documentation Swagger — accessible sur /api/docs
  const config = new DocumentBuilder()
    .setTitle('PokéStore API')
    .setDescription('API REST de la boutique de cartes Pokémon virtuelles')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Serveur prêt sur le port ${port} (LAN : http://<IP_DU_PC>:${port})`);
  console.log('📚 Documentation API : http://localhost:3000/api/docs');
}
bootstrap();
