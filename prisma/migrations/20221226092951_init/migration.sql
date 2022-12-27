-- CreateEnum
CREATE TYPE "OptionType" AS ENUM ('LONGCALL', 'LONGPUT', 'SHORTCALL', 'SHORTPUT');

-- CreateTable
CREATE TABLE "Url" (
    "id" INTEGER NOT NULL,
    "generatedBy" TEXT,
    "asset" TEXT,
    "expiry" INTEGER NOT NULL,
    "board" INTEGER NOT NULL,

    CONSTRAINT "Url_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" INTEGER NOT NULL,
    "strikeId" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "optionType" "OptionType" NOT NULL,
    "urlId" INTEGER,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Url_id_key" ON "Url"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_id_key" ON "Trade"("id");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "Url"("id") ON DELETE SET NULL ON UPDATE CASCADE;
