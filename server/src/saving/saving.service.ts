import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavingDto, EditSavingDto } from './dto';

@Injectable()
export class SavingService {
  constructor(private prisma: PrismaService) {}

  async createSaving(uid: number, dto: CreateSavingDto) {
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
        message: 'Can not add saving to this income reference',
      };
    } else {
      console.log(dto.amount);
      console.log(incomeRef.amount);
      console.log(totalExpenses);
      console.log(totalSavings);

      const saving = await this.prisma.saving.create({
        data: {
          uid,
          source: dto.source,
          deadline: new Date(dto.deadline),
          amount: dto.amount,
          description: dto.description,
        },
      });

      const income_saving_relationship =
        await this.prisma.incomeSavingRelationship.create({
          data: {
            incomeID: dto.incomeID,
            savingID: saving.id,
          },
        });

      return saving;
    }
  }

  // async createSaving(uid: number, dto: CreateSavingDto) {
  //   const saving = await this.prisma.saving.create({
  //     data: {
  //       uid,
  //       source: dto.source,
  //       deadline: new Date(dto.deadline),
  //       amount: dto.amount,
  //       description: dto.description,
  //     },
  //   });

  //   return saving;
  // }

  getSavings(uid: number) {
    return this.prisma.saving.findMany({
      where: {
        uid,
      },
    });
  }

  getSavingById(uid: number, id: number) {
    return this.prisma.saving.findFirst({
      where: {
        id: id,
        uid,
      },
    });
  }

  async editSavingById(uid: number, dto: EditSavingDto, id: number) {
    //get the reference to incomeExpenseRelationship
    const savingIncomeRelationship =
      await this.prisma.incomeSavingRelationship.findFirst({
        where: {
          savingID: id,
        },
      });

    console.log('Relation to Income --> ', savingIncomeRelationship);

    let income: any;
    //get the reference to the income to which expense belongs
    if (savingIncomeRelationship) {
      income = await this.prisma.income.findFirst({
        where: {
          id: savingIncomeRelationship.incomeID,
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

    const filteredSavingRefs = savingsRefs.filter((ref) => ref.savingID !== id);

    console.log('Filtered Saving Refs: ', filteredSavingRefs);

    //check the totals of saving related to that income
    let totalSavings = 0;

    if (filteredSavingRefs.length > 0) {
      const savingPromises = filteredSavingRefs.map(async (ref) => {
        const savings = await this.prisma.saving.findMany({
          where: {
            id: ref.savingID,
          },
        });
        return savings.reduce((store, item) => {
          return store + item.amount;
        }, 0);
      });

      const totalSavingArray = await Promise.all(savingPromises);
      totalSavings = totalSavingArray.reduce((sum, value) => sum + value, 0);
    }

    let totalExpenses = 0;

    const expensesPromises = expenseRefs.map(async (ref) => {
      const expenses = await this.prisma.expense.findMany({
        where: {
          id: ref.expenseID,
        },
      });
      return expenses.reduce((store, item) => {
        return store + item.amount;
      }, 0);
    });

    const totalExpensesArray = await Promise.all(expensesPromises);
    totalExpenses = totalExpensesArray.reduce((sum, value) => sum + value, 0);

    console.log('Total Expenses', totalExpenses);

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
          'Can not update saving to this income reference, amount is greater',
      };
    } else {
      //else update expense
      console.log('Updating Saving ..... ');
      const saving = await this.prisma.saving.findUnique({
        where: {
          id: id,
        },
      });

      if (!saving || saving.uid !== uid) {
        throw new ForbiddenException('No access to this resource');
      }

      const updatedSaving = await this.prisma.saving.update({
        where: {
          id: id,
        },
        data: {
          uid,
          amount: dto.amount,
          deadline: new Date(dto.deadline),
          source: dto.source,
          description: dto.description,
        },
      });

      return {
        success: true,
        message: 'Saving Updated Successfully',
        saving: updatedSaving,
      };
    }
  }

  async deleteSavingById(uid: number, id: number) {
    const incomeRelationRef =
      await this.prisma.incomeSavingRelationship.findFirst({
        where: {
          savingID: id,
        },
      });

    if (incomeRelationRef) {
      console.log(incomeRelationRef);
      await this.prisma.incomeSavingRelationship.delete({
        where: {
          id: incomeRelationRef.id,
        },
      });
    }

    const saving = await this.prisma.saving.findUnique({
      where: {
        id: id,
      },
    });

    if (!saving || saving.uid !== uid) {
      throw new ForbiddenException('No access to this resource');
    }

    const deletedSaving = await this.prisma.saving.delete({
      where: {
        id: id,
      },
    });

    return {
      success: true,
      message: 'Saving deleted successfully',
      saving: deletedSaving,
    };
  }
}
