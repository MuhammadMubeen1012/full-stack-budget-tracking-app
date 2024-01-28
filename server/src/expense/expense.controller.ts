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
import { ExpenseService } from './expense.service';
import { CreateExpenseDto, EditExpenseDto } from './dto';

@UseGuards(JwtGuard)
@Controller('expense')
export class ExpenseController {
  constructor(private expense: ExpenseService) {}

  @Post()
  createExpense(@GetUser('id') uid: number, @Body() dto: CreateExpenseDto) {
    return this.expense.createExpense(uid, dto);
  }

  @Get()
  getExpenses(@GetUser('id') uid: number) {
    return this.expense.getExpenses(uid);
  }

  @Get(':id')
  getExpenseById(
    @GetUser('id') uid: number,
    @Param('id', ParseIntPipe) expenseId: number,
  ) {
    return this.expense.getExpenseById(uid, expenseId);
  }

  @Patch(':id')
  editExpenseById(
    @GetUser('id') uid: number,
    @Body() dto: EditExpenseDto,
    @Param('id', ParseIntPipe) expenseId: number,
  ) {
    return this.expense.editExpenseById(uid, dto, expenseId);
  }

  @Delete(':id')
  deleteExpenseById(
    @GetUser('id') uid: number,
    @Param('id', ParseIntPipe) expenseId: number,
  ) {
    return this.expense.deleteExpenseById(uid, expenseId);
  }
}
