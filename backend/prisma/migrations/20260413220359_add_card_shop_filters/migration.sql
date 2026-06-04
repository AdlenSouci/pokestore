-- AlterTable
ALTER TABLE "PokemonCard" ADD COLUMN     "releaseYear" INTEGER,
ADD COLUMN     "series" TEXT,
ADD COLUMN     "tcgSetId" TEXT,
ADD COLUMN     "tcgSetName" TEXT;

-- CreateIndex
CREATE INDEX "PokemonCard_price_idx" ON "PokemonCard"("price");

-- CreateIndex
CREATE INDEX "PokemonCard_releaseYear_idx" ON "PokemonCard"("releaseYear");

-- CreateIndex
CREATE INDEX "PokemonCard_series_idx" ON "PokemonCard"("series");

-- CreateIndex
CREATE INDEX "PokemonCard_tcgSetId_idx" ON "PokemonCard"("tcgSetId");
