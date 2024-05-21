/*
  Warnings:

  - You are about to drop the column `descriptiom` on the `Facility` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Facility` DROP COLUMN `descriptiom`,
    ADD COLUMN `description` VARCHAR(191) NULL;
