import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './infrastructure/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //  Habilitar CORS si tenés frontend aparte
app.enableCors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
})
 app.useWebSocketAdapter(new IoAdapter(app));

  //  Inyectar ConfigService para usar .env
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3002;

  // ✅ Validaciones automáticas con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               // Elimina campos no declarados en el DTO
      forbidNonWhitelisted: true,   // Lanza error si se envían campos no permitidos
      transform: true               // Transforma payloads a instancias de clase
    }),
  );

// Documentación Swagger
const config = new DocumentBuilder()
.setTitle('Client API')
.setDescription('API para gestionar clientes y autenticación')
.setVersion('1.0.0')
.addBearerAuth({
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
}, 'JWT')
.build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(port);
  console.log(`🚀 Application running on: http://localhost:${port}`);
}
bootstrap();
