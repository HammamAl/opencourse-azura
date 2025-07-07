/*
  Warnings:

  - Added the required column `title` to the `course_material` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "course_material" ADD COLUMN     "title" TEXT NOT NULL;
