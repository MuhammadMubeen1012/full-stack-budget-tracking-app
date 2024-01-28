import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() //to make the exports, a prisma service to whole project
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
