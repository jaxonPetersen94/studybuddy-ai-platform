import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUserPreferences1759463167922 implements MigrationInterface {
    name = 'AddedUserPreferences1759463167922'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "appearance" jsonb, "timezone" character varying, "location" character varying, "learning_level" character varying, "bio" text, "study_goal" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_458057fa75b66e68a275647da2e" UNIQUE ("user_id"), CONSTRAINT "REL_458057fa75b66e68a275647da2" UNIQUE ("user_id"), CONSTRAINT "PK_e8cfb5b31af61cd363a6b6d7c25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_preferences" ADD CONSTRAINT "FK_458057fa75b66e68a275647da2e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_preferences" DROP CONSTRAINT "FK_458057fa75b66e68a275647da2e"`);
        await queryRunner.query(`DROP TABLE "user_preferences"`);
    }

}
