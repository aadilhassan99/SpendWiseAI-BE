import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

export function configureApplication(app: INestApplication): void {
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const corsOrigin = configService.getOrThrow<string>('corsOrigin');
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });
}
