import cookieParser from 'cookie-parser';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const API_PREFIX = 'api';
export const API_DOCS_PATH = `${API_PREFIX}/docs`;

export function configureApp(app: INestApplication) {
  const configService = app.get(ConfigService);
  const frontendUrl = configService.getOrThrow<string>('FRONTEND_URL');
  const cookieName = configService.get<string>('COOKIE_NAME', 'auth_token');

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix(API_PREFIX);
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('User Auth API')
    .setDescription('NestJS + Prisma API for self-service user authentication')
    .setVersion('1.0.0')
    .addCookieAuth(cookieName)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(API_DOCS_PATH, app, document);
}
