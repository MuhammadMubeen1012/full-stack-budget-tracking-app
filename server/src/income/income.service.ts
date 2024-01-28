import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateIncomeDto, EditIncomeDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IncomeService {
  constructor(private prisma: PrismaService) {}

  async createIncome(uid: number, dto: CreateIncomeDto) {
    const income = await this.prisma.income.create({
      data: {
        uid,
        amount: dto.amount,
        type: dto.type,
        date: new Date(dto.date),
        name: dto.name,
        description: dto.description,
      },
    });

    return income;
  }

  getIncomes(uid: number) {
    console.log('Getting incomes ...');
    return this.prisma.income.findMany({
      where: {
        uid,
      },
    });
  }

  getIncomeById(uid: number, id: number) {
    return this.prisma.income.findFirst({
      where: {
        id: id,
        uid,
      },
    });
  }

  async editIncomeById(uid: number, dto: EditIncomeDto, id: number) {
    const income = await this.prisma.income.findUnique({
      where: {
        id: id,
      },
    });

    if (!income || income.uid !== uid) {
      throw new ForbiddenException('No access to this resource');
    }

    const updatedIncome = await this.prisma.income.update({
      where: {
        id: id,
      },
      data: {
        uid,
        amount: dto.amount,
        type: dto.type,
        date: new Date(dto.date),
        name: dto.name,
        description: dto.description,
      },
    });

    if (updatedIncome) {
      return {
        success: true,
        message: 'Income updated successfully',
        income: updatedIncome,
      };
    } else {
      return {
        success: false,
        message: 'Try Again!',
      };
    }
  }

  async deleteIncomeById(uid: number, id: number) {
    const income = await this.prisma.income.findUnique({
      where: {
        id: id,
      },
    });

    if (!income || income.uid !== uid) {
      throw new ForbiddenException('No access to this resource');
    }

    try {
      const deletedIncome = await this.prisma.income.delete({
        where: {
          id: id,
        },
      });

      if (deletedIncome) {
        return {
          success: true,
          message: 'Income deleted successfully',
          income: deletedIncome,
        };
      } else {
        return {
          success: false,
          message: 'Try Again!',
        };
      }
    } catch (e) {
      return {
        success: false,
        message: 'Income has references to expenses or savings ...',
      };
    }
  }
}
