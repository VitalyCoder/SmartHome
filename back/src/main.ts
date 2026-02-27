import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // MQTT микросервис
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: 'mqtt://95.174.104.37:1883',
      username: 'vifrolov',
      password: '6325',
    },
  });

  await app.startAllMicroservices();

  // ===== Swagger конфигурация =====
  const config = new DocumentBuilder()
    .setTitle('IoT API')
    .setDescription('API для управления датчиками')
    .setVersion('1.0')
    .addTag('devices')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // ================================

  await app.listen(4200);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger доступен на: ${await app.getUrl()}/api`);
}
void bootstrap();
