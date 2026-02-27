import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './device.entity';
import { RfPayload } from './rf-payload.interface'; // импортируйте правильный путь

@Injectable()
export class DevicesService {
  constructor(
    @Inject('MQTT_SERVICE') private client: ClientProxy,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  private pairingMode: {
    enabled: boolean;
    name?: string;
    type?: 'DOOR_WINDOW' | 'MOTION' | 'LEAK' | 'BUTTON' | 'SMOKE';
    timeout?: NodeJS.Timeout;
  } = {
    enabled: false,
  };

  startPairing(data: {
    name: string;
    type: 'DOOR_WINDOW' | 'MOTION' | 'LEAK' | 'BUTTON' | 'SMOKE';
  }) {
    if (this.pairingMode.enabled) {
      return { error: 'Уже идет добавление датчика' };
    }

    this.pairingMode.enabled = true;
    this.pairingMode.name = data.name;
    this.pairingMode.type = data.type;

    // авто-отключение через 60 секунд
    this.pairingMode.timeout = setTimeout(() => {
      this.pairingMode.enabled = false;
      console.log('⏳ Время добавления истекло');
    }, 60000);

    return { status: 'Ожидание сигнала с датчика...' };
  }

  // Логика отправки сообщения
  sendMessage(target: string, msg: string) {
    this.client.emit(target, msg);
    return { status: 'Message sent to MQTT broker' };
  }

  // Логика обработки температуры
  processTemperature(topic: string, data: any) {
    console.log('--- Received Temp Message ---');
    console.log(`Topic: ${topic}`);
    console.log('Payload:', data);
  }

  // Логика обработки сигнала 433 МГц
  async processRfSignal(topic: string, data: RfPayload) {
    console.log('\n🟢 --- Пойман сигнал 433 МГц ---');

    if (this.pairingMode.enabled) {
      const newDevice = {
        name: this.pairingMode.name,
        type: this.pairingMode.type,
        hex: data.hex,
        decimal: data.decimal,
        bit: data.bit,
        proto: data.proto,
        topic,
      };

      // 👉 Сохраняем в БД
      console.log('💾 Сохраняем новый датчик:', newDevice);

      const candidate = await this.deviceRepository.findOneBy({
        key: data.hex.slice(0, 6),
      });

      console.log(candidate);

      if (candidate) throw new ConflictException('Датчик уже зарегистрирован');

      const device = this.deviceRepository.create({
        name: this.pairingMode.name,
        type: this.pairingMode.type,
        hex: data.hex,
        key: data.hex.slice(0, 6),
      });

      await this.deviceRepository.save(device);

      // тут должен быть вызов репозитория:
      // await this.devicesRepository.save(newDevice);

      // выключаем режим
      clearTimeout(this.pairingMode.timeout);
      this.pairingMode.enabled = false;

      console.log('✅ Датчик успешно добавлен');
      return;
    }

    console.log('Обычный режим. Payload:', data);
  }

  // Логика для остальных сенсоров
  processOtherSensors(topic: string, data: any) {
    // Исключаем топики, для которых есть отдельные обработчики
    if (topic === 'sensors/temp' || topic === 'sensors/rf433') return;

    console.log(`Wildcard handler: ${topic}`, data);
  }
}
