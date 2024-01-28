import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  cleanDb() {
    return this.$transaction([
      this.incomeExpensesRelationship.deleteMany(),
      this.incomeSavingRelationship.deleteMany(),
      this.income.deleteMany(),
      this.expense.deleteMany(),
      this.saving.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
