import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // constructor(private readonly prisma: PrismaService) {}
  getHello(): string {
    return 'Hello World!';
  }
}
