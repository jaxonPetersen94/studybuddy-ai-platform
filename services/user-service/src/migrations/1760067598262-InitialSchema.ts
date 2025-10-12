import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1760067598262 implements MigrationInterface {
    name = 'InitialSchema1760067598262'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "token" text NOT NULL, "expires_at" TIMESTAMP NOT NULL, "device_info" character varying, "ip_address" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ccc78af11ba25b380c6a78e7f2" ON "refresh_tokens" ("user_id", "token") `);
        await queryRunner.query(`CREATE TABLE "password_resets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "used" boolean NOT NULL DEFAULT false, "ip_address" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9b34edd5264effbbc875c266a9e" UNIQUE ("token"), CONSTRAINT "PK_4816377aa98211c1de34469e742" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3c5d410ac4b60c6a3412ffa07b" ON "password_resets" ("user_id", "token") `);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" character varying(20) NOT NULL, "title" character varying(255) NOT NULL, "message" text NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "read_at" TIMESTAMP, "metadata" jsonb DEFAULT '{}', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "email_enabled" boolean NOT NULL DEFAULT true, "push_enabled" boolean NOT NULL DEFAULT true, "in_app_enabled" boolean NOT NULL DEFAULT true, "chat_notifications" boolean NOT NULL DEFAULT true, "study_notifications" boolean NOT NULL DEFAULT true, "assignment_notifications" boolean NOT NULL DEFAULT true, "quiz_notifications" boolean NOT NULL DEFAULT true, "achievement_notifications" boolean NOT NULL DEFAULT true, "reminder_notifications" boolean NOT NULL DEFAULT true, "system_notifications" boolean NOT NULL DEFAULT true, "social_notifications" boolean NOT NULL DEFAULT true, "updates_notifications" boolean NOT NULL DEFAULT true, "quiet_hours_enabled" boolean NOT NULL DEFAULT false, "quiet_hours_start" character varying(5), "quiet_hours_end" character varying(5), "digest_enabled" boolean NOT NULL DEFAULT false, "digest_frequency" character varying(20), "digest_time" character varying(5), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_64c90edc7310c6be7c10c96f67" UNIQUE ("user_id"), CONSTRAINT "PK_e94e2b543f2f218ee68e4f4fad2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "appearance" jsonb, "timezone" character varying, "location" character varying, "learning_level" character varying, "bio" text, "study_goal" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_458057fa75b66e68a275647da2" UNIQUE ("user_id"), CONSTRAINT "PK_e8cfb5b31af61cd363a6b6d7c25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "profile_picture" character varying, "is_active" boolean NOT NULL DEFAULT true, "role" character varying NOT NULL DEFAULT 'user', "permissions" text, "last_login_at" TIMESTAMP, "google_id" character varying, "github_id" character varying, "auth_provider" character varying NOT NULL DEFAULT 'email', "first_login" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "password_resets" ADD CONSTRAINT "FK_f7a4c3bc48f24df007936d217be" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" ADD CONSTRAINT "FK_64c90edc7310c6be7c10c96f675" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_preferences" ADD CONSTRAINT "FK_458057fa75b66e68a275647da2e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_preferences" DROP CONSTRAINT "FK_458057fa75b66e68a275647da2e"`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" DROP CONSTRAINT "FK_64c90edc7310c6be7c10c96f675"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`);
        await queryRunner.query(`ALTER TABLE "password_resets" DROP CONSTRAINT "FK_f7a4c3bc48f24df007936d217be"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "user_preferences"`);
        await queryRunner.query(`DROP TABLE "notification_preferences"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3c5d410ac4b60c6a3412ffa07b"`);
        await queryRunner.query(`DROP TABLE "password_resets"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ccc78af11ba25b380c6a78e7f2"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    }

}
