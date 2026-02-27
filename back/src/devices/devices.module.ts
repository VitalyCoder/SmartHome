import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './device.entity';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device]),
    ClientsModule.register([
      {
        name: 'MQTT_SERVICE', // Токен для инъекции
        transport: Transport.MQTT,
        options: {
          url: 'mqtt://95.174.104.37:1883',
        },
      },
    ]),
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
