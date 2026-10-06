import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AUTH_COOKIE_NAME } from '../common/auth/jwt-auth.guard';

export function configureSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('SpendWise API')
    .setDescription('REST API for the SpendWise personal finance analyzer.')
    .setVersion('v1')
    .addServer('/api/v1')
    .addCookieAuth(AUTH_COOKIE_NAME)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
