import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationSchemaUpdate1759335786102 implements MigrationInterface {
    name = 'NotificationSchemaUpdate1759335786102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" character varying(20) NOT NULL, "title" character varying(255) NOT NULL, "message" text NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "read_at" TIMESTAMP, "metadata" jsonb DEFAULT '{}', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "email_enabled" boolean NOT NULL DEFAULT true, "push_enabled" boolean NOT NULL DEFAULT true, "in_app_enabled" boolean NOT NULL DEFAULT true, "chat_notifications" boolean NOT NULL DEFAULT true, "study_notifications" boolean NOT NULL DEFAULT true, "assignment_notifications" boolean NOT NULL DEFAULT true, "quiz_notifications" boolean NOT NULL DEFAULT true, "achievement_notifications" boolean NOT NULL DEFAULT true, "reminder_notifications" boolean NOT NULL DEFAULT true, "system_notifications" boolean NOT NULL DEFAULT true, "social_notifications" boolean NOT NULL DEFAULT true, "updates_notifications" boolean NOT NULL DEFAULT true, "quiet_hours_enabled" boolean NOT NULL DEFAULT false, "quiet_hours_start" character varying(5), "quiet_hours_end" character varying(5), "digest_enabled" boolean NOT NULL DEFAULT false, "digest_frequency" character varying(20), "digest_time" character varying(5), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_64c90edc7310c6be7c10c96f675" UNIQUE ("user_id"), CONSTRAINT "REL_64c90edc7310c6be7c10c96f67" UNIQUE ("user_id"), CONSTRAINT "PK_e94e2b543f2f218ee68e4f4fad2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" ADD CONSTRAINT "FK_64c90edc7310c6be7c10c96f675" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_preferences" DROP CONSTRAINT "FK_64c90edc7310c6be7c10c96f675"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`);
        await queryRunner.query(`DROP TABLE "notification_preferences"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
    }

}
