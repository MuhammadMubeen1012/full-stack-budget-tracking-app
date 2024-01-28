import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { IncomeService } from './income.service';
import { CreateIncomeDto, EditIncomeDto } from './dto';

@UseGuards(JwtGuard)
@Controller('incomes')
export class IncomeController {
  constructor(private income: IncomeService) {}

  @Post()
  createIncome(@GetUser('id') uid: number, @Body() dto: CreateIncomeDto) {
    return this.income.createIncome(uid, dto);
  }

  @Get()
  getIncomes(@GetUser('id') uid: number) {
    return this.income.getIncomes(uid);
  }

  @Get(':id')
  getIncomeById(
    @GetUser('id') uid: number,
    @Param('id', ParseIntPipe) incomeId: number,
  ) {
    return this.income.getIncomeById(uid, incomeId);
  }

  @Patch(':id')
  editIncomeById(
    @GetUser('id') uid: number,
    @Body() dto: EditIncomeDto,
    @Param('id', ParseIntPipe) incomeId: number,
  ) {
    return this.income.editIncomeById(uid, dto, incomeId);
  }

  @Delete(':id')
  deleteIncomeById(
    @GetUser('id') uid: number,
    @Param('id', ParseIntPipe) incomeId: number,
  ) {
    return this.income.deleteIncomeById(uid, incomeId);
  }
}
