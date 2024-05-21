/*
  Warnings:

  - You are about to drop the column `roomId` on the `Facility` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Facility` DROP FOREIGN KEY `Facility_roomId_fkey`;

-- AlterTable
ALTER TABLE `Facility` DROP COLUMN `roomId`,
    ADD COLUMN `descriptiom` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `RoomFacility` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `facilityId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RoomFacility` ADD CONSTRAINT `RoomFacility_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomFacility` ADD CONSTRAINT `RoomFacility_facilityId_fkey` FOREIGN KEY (`facilityId`) REFERENCES `Facility`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
