import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // rawBody: true est nécessaire pour que le webhook Stripe puisse vérifier la signature
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Préfixe global /api pour toutes les routes (utile pour l'app mobile)
  app.setGlobalPrefix('api');

  // CORS — accepte le frontend React et l'app mobile
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
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

  const port = 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Serveur prêt sur le port ${port} (LAN : http://<IP_DU_PC>:${port})`);
  console.log('📚 Documentation API : http://localhost:3000/api/docs');
}
bootstrap();
