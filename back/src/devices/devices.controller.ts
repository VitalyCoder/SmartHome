import { Body, Controller, Post } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { RfPayload } from './rf-payload.interface';

@ApiTags('devices')
@Controller()
export class DevicesController {
  // Инжектим наш новый сервис
  constructor(private readonly devicesService: DevicesService) {}

  @Post('start-pairing')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'sensors/rf433' },
        type: { type: 'string', example: 'DOOR_WINDOW' },
      },
    },
  })
  startPairing(
    @Body()
    body: {
      name: string;
      type: 'DOOR_WINDOW' | 'MOTION' | 'LEAK' | 'BUTTON' | 'SMOKE';
    },
  ) {
    return this.devicesService.startPairing(body);
  }

  @Post('send-mqtt')
  sendMessage(@Body() body: { target: string; msg: string }) {
    return this.devicesService.sendMessage(body.target, body.msg);
  }

  @MessagePattern('sensors/temp')
  getTemperature(@Payload() data: any, @Ctx() context: MqttContext) {
    this.devicesService.processTemperature(context.getTopic(), data);
  }

  // ==========================================
  // Ловим сигнал пульта 433 МГц
  // ==========================================
  @MessagePattern('sensors/rf433')
  async getRfSignal(@Payload() data: RfPayload, @Ctx() context: MqttContext) {
    await this.devicesService.processRfSignal(context.getTopic(), data);
  }

  // Обработчик всех остальных сенсоров
  @MessagePattern('sensors/+')
  getAllSensors(@Payload() data: any, @Ctx() context: MqttContext) {
    this.devicesService.processOtherSensors(context.getTopic(), data);
  }
}
