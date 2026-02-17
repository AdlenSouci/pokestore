import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 C'EST ICI LA CLÉ. On autorise tout le monde.
  app.enableCors({
    origin: true, // Accepte toutes les origines (ton site React)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(3000);
  console.log("🚀 Serveur prêt et Vannes ouvertes sur le port 3000");
}
bootstrap();