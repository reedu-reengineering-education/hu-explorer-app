-- CreateTable
CREATE TABLE "Schule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Schule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VersiegelungRecord" (
    "id" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "schuleId" TEXT NOT NULL,

    CONSTRAINT "VersiegelungRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtenvielfaltRecord" (
    "id" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "animalId" TEXT NOT NULL,
    "schuleId" TEXT NOT NULL,

    CONSTRAINT "ArtenvielfaltRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VersiegelungRecord" ADD CONSTRAINT "VersiegelungRecord_schuleId_fkey" FOREIGN KEY ("schuleId") REFERENCES "Schule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtenvielfaltRecord" ADD CONSTRAINT "ArtenvielfaltRecord_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtenvielfaltRecord" ADD CONSTRAINT "ArtenvielfaltRecord_schuleId_fkey" FOREIGN KEY ("schuleId") REFERENCES "Schule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
