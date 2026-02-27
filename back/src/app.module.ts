import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // или 'mysql', 'sqlite', 'mariadb'
      host: 'localhost', // твой хост БД
      port: 5433, // порт БД
      username: 'postgres', // имя пользователя
      password: 'root', // пароль
      database: 'smart', // имя базы данных
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // авто-создание таблиц (только для dev!)
    }),
    DevicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
