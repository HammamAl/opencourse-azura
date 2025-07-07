/*
  Warnings:

  - You are about to drop the column `is_deleted` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `video_language` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `course_learning_target` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `course_material` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `course_section` table. All the data in the column will be lost.
  - You are about to drop the column `paid_at` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `course_and_category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `frontpage_course` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category_id` to the `course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoice_id` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "course_and_category" DROP CONSTRAINT "course_and_category_category_id_fkey";

-- DropForeignKey
ALTER TABLE "course_and_category" DROP CONSTRAINT "course_and_category_course_id_fkey";

-- DropForeignKey
ALTER TABLE "frontpage_course" DROP CONSTRAINT "frontpage_course_id_fkey";

-- AlterTable
ALTER TABLE "category" DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "course" DROP COLUMN "is_deleted",
DROP COLUMN "video_language",
ADD COLUMN     "category_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "course_learning_target" DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "course_material" DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "course_section" DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "paid_at",
ADD COLUMN     "invoice_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_deleted";

-- DropTable
DROP TABLE "course_and_category";

-- DropTable
DROP TABLE "frontpage_course";

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
