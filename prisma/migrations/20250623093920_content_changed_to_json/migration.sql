/*
  Warnings:

  - You are about to drop the column `richtext` on the `course_material` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "course_material" DROP COLUMN "richtext",
ADD COLUMN     "content" JSONB;
