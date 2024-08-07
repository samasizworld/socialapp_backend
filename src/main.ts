import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);
  const config = app.get(ConfigService);
  const port = config.get('APP_PORT');
  app.useStaticAssets(join(__dirname, 'uploads'));
  await app.listen(port);
}
bootstrap();
