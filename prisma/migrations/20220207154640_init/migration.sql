-- CreateTable
CREATE TABLE "Schule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Schule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VersiegelungRecord" (
    "id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "group" TEXT NOT NULL,
    "school" TEXT,
    "deviceId" TEXT,
    "area" DOUBLE PRECISION,
    "created_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VersiegelungRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtenvielfaltRecord" (
    "id" TEXT NOT NULL,
    "simpsonIndex" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "group" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "school" TEXT,
    "created_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtenvielfaltRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtRecord" (
    "id" SERIAL NOT NULL,
    "art" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "artenvielfaltId" TEXT NOT NULL,

    CONSTRAINT "ArtRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VersiegelungRecord_created_at_key" ON "VersiegelungRecord"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "VersiegelungRecord_deviceId_group_created_at_key" ON "VersiegelungRecord"("deviceId", "group", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ArtenvielfaltRecord_deviceId_group_created_at_key" ON "ArtenvielfaltRecord"("deviceId", "group", "created_at");

-- AddForeignKey
ALTER TABLE "ArtRecord" ADD CONSTRAINT "ArtRecord_artenvielfaltId_fkey" FOREIGN KEY ("artenvielfaltId") REFERENCES "ArtenvielfaltRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
