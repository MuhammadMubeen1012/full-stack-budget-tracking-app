import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto, EditExpenseDto } from './dto';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async createExpense(uid: number, dto: CreateExpenseDto) {
    // Search in relationships the ids of expenses and savings.
    const expenseRefs = await this.prisma.incomeExpensesRelationship.findMany({
      where: {
        incomeID: dto.incomeID,
      },
    });

    console.log('Expenses Reference', expenseRefs);

    const savingsRefs = await this.prisma.incomeSavingRelationship.findMany({
      where: {
        incomeID: dto.incomeID,
      },
    });

    console.log('Savings Reference', savingsRefs);

    const incomeRef = await this.prisma.income.findUnique({
      where: {
        id: dto.incomeID,
      },
    });

    console.log('Income Reference', incomeRef);

    // with theses ids get the total expense and savings.
    let totalExpenses = 0;

    const expensePromises = expenseRefs.map(async (ref) => {
      const expenses = await this.prisma.expense.findMany({
        where: {
          id: ref.expenseID,
        },
      });
      return expenses.reduce((store, item) => {
        return store + item.amount;
      }, 0);
    });

    const totalExpensesArray = await Promise.all(expensePromises);
    totalExpenses = totalExpensesArray.reduce((sum, value) => sum + value, 0);

    // for (let ref of expenseRefs) {
    //   const expenses = await this.prisma.expense.findMany({
    //     where: {
    //       id: ref.expenseID,
    //     },
    //   });

    //   console.log(expenses);

    //   totalExpenses = expenses.reduce((store, item) => {
    //     return store + item.amount;
    //   }, 0);
    // }

    console.log('Total Expenses', totalExpenses);

    // with theses ids get the total expense and savings.
    let totalSavings = 0;

    // for (let ref of savingsRefs) {
    //   const savings = await this.prisma.saving.findMany({
    //     where: {
    //       id: ref.savingID,
    //     },
    //   });

    //   console.log(savings);

    //   totalSavings = savings.reduce((store, item) => {
    //     return store + item.amount;
    //   }, 0);
    // }

    const savingsPromises = savingsRefs.map(async (ref) => {
      const savings = await this.prisma.saving.findMany({
        where: {
          id: ref.savingID,
        },
      });
      return savings.reduce((store, item) => {
        return store + item.amount;
      }, 0);
    });

    const totalSavingsArray = await Promise.all(savingsPromises);
    totalSavings = totalSavingsArray.reduce((sum, value) => sum + value, 0);

    console.log('Total Savings', totalSavings);

    const balance = incomeRef.amount - (totalExpenses + totalSavings);
    // check if the new expense is not greater  then the total of expenses and savings of particular income.
    // if not then creeate the new expense, else return with the message
    if (dto.amount > balance) {
      console.log(dto.amount);
      console.log(incomeRef.amount);
      console.log(totalExpenses);
      console.log(totalSavings);
      return {
        message: 'Can not add expense to this income reference',
      };
    } else {
      console.log(dto.amount);
      console.log(incomeRef.amount);
      console.log(totalExpenses);
      console.log(totalSavings);

      const expense = await this.prisma.expense.create({
        data: {
          uid,
          amount: dto.amount,
          type: dto.type,
          date: new Date(dto.date),
          name: dto.name,
          description: dto.description,
        },
      });

      const income_expense_relationship =
        await this.prisma.incomeExpensesRelationship.create({
          data: {
            incomeID: dto.incomeID,
            expenseID: expense.id,
          },
        });

      return expense;
    }
  }

  getExpenses(uid: number) {
    return this.prisma.expense.findMany({
      where: {
        uid,
      },
    });
  }

  getExpenseById(uid: number, id: number) {
    return this.prisma.expense.findFirst({
      where: {
        id: id,
        uid,
      },
    });
  }

  async editExpenseById(uid: number, dto: EditExpenseDto, id: number) {
    //get the reference to incomeExpenseRelationship
    const expenseIncomeRelationship =
      await this.prisma.incomeExpensesRelationship.findFirst({
        where: {
          expenseID: id,
        },
      });

    console.log('Relation to Income --> ', expenseIncomeRelationship);

    let income: any;
    //get the reference to the income to which expense belongs
    if (expenseIncomeRelationship) {
      income = await this.prisma.income.findFirst({
        where: {
          id: expenseIncomeRelationship.incomeID,
        },
      });
    }

    console.log('Related Income is --> ', income);

    //get the reference to the savings and other expenses of the income have
    const expenseRefs = await this.prisma.incomeExpensesRelationship.findMany({
      where: {
        incomeID: income.id,
      },
    });

    console.log('Expenses Reference', expenseRefs);

    const savingsRefs = await this.prisma.incomeSavingRelationship.findMany({
      where: {
        incomeID: income.id,
      },
    });

    console.log('Savings Reference', savingsRefs);

    const filteredExpenseRefs = expenseRefs.filter(
      (ref) => ref.expenseID !== id,
    );

    console.log('Filtered Expense Refs: ', filteredExpenseRefs);

    //check the totals of saving related to that income
    let totalExpenses = 0;

    if (filteredExpenseRefs.length > 0) {
      const expensePromises = filteredExpenseRefs.map(async (ref) => {
        const expenses = await this.prisma.expense.findMany({
          where: {
            id: ref.expenseID,
          },
        });
        return expenses.reduce((store, item) => {
          return store + item.amount;
        }, 0);
      });

      const totalExpensesArray = await Promise.all(expensePromises);
      totalExpenses = totalExpensesArray.reduce((sum, value) => sum + value, 0);
    }

    let totalSavings = 0;

    const savingsPromises = savingsRefs.map(async (ref) => {
      const savings = await this.prisma.saving.findMany({
        where: {
          id: ref.savingID,
        },
      });
      return savings.reduce((store, item) => {
        return store + item.amount;
      }, 0);
    });

    const totalSavingsArray = await Promise.all(savingsPromises);
    totalSavings = totalSavingsArray.reduce((sum, value) => sum + value, 0);

    console.log('Total Savings', totalSavings);

    //if updated expense is greater than income - saving then dont update expense
    const balance = income.amount - (totalExpenses + totalSavings);
    // check if the new expense is not greater  then the total of expenses and savings of particular income.
    // if not then creeate the new expense, else return with the message
    if (dto.amount > balance) {
      console.log(dto.amount);
      console.log(income.amount);
      console.log(totalExpenses);
      console.log(totalSavings);
      return {
        message:
          'Can not update expense to this income reference, amount is greater',
      };
    } else {
      //else update expense
      console.log('Updating expense ..... ');
      const expense = await this.prisma.expense.findUnique({
        where: {
          id: id,
        },
      });

      if (!expense || expense.uid !== uid) {
        throw new ForbiddenException('No access to this resource');
      }

      const updatedExpense = await this.prisma.expense.update({
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

      return {
        success: true,
        message: 'Expense Updated Successfully',
        expense: updatedExpense,
      };
    }
  }

  async deleteExpenseById(uid: number, id: number) {
    const incomeRelationRef =
      await this.prisma.incomeExpensesRelationship.findFirst({
        where: {
          expenseID: id,
        },
      });

    if (incomeRelationRef) {
      console.log(incomeRelationRef);
      await this.prisma.incomeExpensesRelationship.delete({
        where: {
          id: incomeRelationRef.id,
        },
      });
    }

    const expense = await this.prisma.expense.findUnique({
      where: {
        id: id,
      },
    });

    if (!expense || expense.uid !== uid) {
      throw new ForbiddenException('No access to this resource');
    }

    await this.prisma.expense.delete({
      where: {
        id: id,
      },
    });
  }
}
