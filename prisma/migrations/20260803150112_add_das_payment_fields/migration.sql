-- CreateEnum
CREATE TYPE "BusinessSector" AS ENUM ('SERVICE', 'COMMERCE', 'INDUSTRY', 'TRANSPORT');

-- CreateEnum
CREATE TYPE "DasStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'INSTALLMENT');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "businessSector" "BusinessSector" DEFAULT 'SERVICE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultSector" "BusinessSector" NOT NULL DEFAULT 'SERVICE',
ADD COLUMN     "openingDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DasPayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "DasStatus" NOT NULL DEFAULT 'PENDING',
    "pixCode" TEXT,
    "authCode" TEXT,
    "paidAt" TIMESTAMP(3),
    "installmentRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DasPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DasPayment_userId_year_month_key" ON "DasPayment"("userId", "year", "month");

-- AddForeignKey
ALTER TABLE "DasPayment" ADD CONSTRAINT "DasPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
