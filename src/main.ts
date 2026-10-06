import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApplication } from './bootstrap/configure-application';
import { configureSwagger } from './bootstrap/configure-swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApplication(app);
  configureSwagger(app);

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('port');

  await app.listen(port);
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start application', error);
  process.exit(1);
});
