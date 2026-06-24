/*
  Warnings:

  - Added the required column `created_by_id` to the `organizations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('USER', 'SYSTEM');

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "created_by_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "created_by_type" "AuditActorType" NOT NULL DEFAULT 'USER',
ADD COLUMN     "updated_by_type" "AuditActorType" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone_number" TEXT;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
