import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOAuthFields1756492024196 implements MigrationInterface {
    name = 'AddOAuthFields1756492024196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "google_id" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "github_id" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "auth_provider" character varying NOT NULL DEFAULT 'email'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "first_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "last_name" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "last_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "first_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "auth_provider"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "github_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "google_id"`);
    }

}
