/*
  Warnings:

  - You are about to drop the column `incomeID` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `incomeID` on the `Saving` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_incomeID_fkey";

-- DropForeignKey
ALTER TABLE "Saving" DROP CONSTRAINT "Saving_incomeID_fkey";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "incomeID";

-- AlterTable
ALTER TABLE "Saving" DROP COLUMN "incomeID";

-- CreateTable
CREATE TABLE "IncomeExpensesRelationship" (
    "id" SERIAL NOT NULL,
    "incomeID" INTEGER NOT NULL,
    "expenseID" INTEGER NOT NULL,

    CONSTRAINT "IncomeExpensesRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomeSavingRelationship" (
    "id" SERIAL NOT NULL,
    "incomeID" INTEGER NOT NULL,
    "savingID" INTEGER NOT NULL,

    CONSTRAINT "IncomeSavingRelationship_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IncomeExpensesRelationship" ADD CONSTRAINT "IncomeExpensesRelationship_incomeID_fkey" FOREIGN KEY ("incomeID") REFERENCES "Income"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomeExpensesRelationship" ADD CONSTRAINT "IncomeExpensesRelationship_expenseID_fkey" FOREIGN KEY ("expenseID") REFERENCES "Expense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomeSavingRelationship" ADD CONSTRAINT "IncomeSavingRelationship_incomeID_fkey" FOREIGN KEY ("incomeID") REFERENCES "Income"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomeSavingRelationship" ADD CONSTRAINT "IncomeSavingRelationship_savingID_fkey" FOREIGN KEY ("savingID") REFERENCES "Saving"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
