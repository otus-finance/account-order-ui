/*
  Warnings:

  - The primary key for the `Trade` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Url` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[hash]` on the table `Url` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `optionType` on the `Trade` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `urlId` on table `Trade` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `hash` to the `Url` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_urlId_fkey";

-- DropIndex
DROP INDEX "Trade_id_key";

-- DropIndex
DROP INDEX "Url_id_key";

-- AlterTable
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "optionType",
ADD COLUMN     "optionType" INTEGER NOT NULL,
ALTER COLUMN "urlId" SET NOT NULL,
ALTER COLUMN "urlId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Trade_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Url" DROP CONSTRAINT "Url_pkey",
ADD COLUMN     "hash" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Url_pkey" PRIMARY KEY ("id");

-- DropEnum
DROP TYPE "OptionType";

-- CreateIndex
CREATE UNIQUE INDEX "Url_hash_key" ON "Url"("hash");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "Url"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
