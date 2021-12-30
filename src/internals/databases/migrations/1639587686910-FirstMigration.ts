import { MigrationInterface, QueryRunner } from 'typeorm';

export class FirstMigration1639587686910 implements MigrationInterface {
  name = 'FirstMigration1639587686910';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM('end-user', 'admin')
        `);
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "firebaseUid" character varying NOT NULL,
                "deletedAt" TIMESTAMP,
                "role" "public"."user_role_enum" NOT NULL,
                CONSTRAINT "UQ_905432b2c46bdcfe1a0dd3cdeff" UNIQUE ("firebaseUid"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "auth_token" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "httpOnlyKey" uuid NOT NULL,
                "expires" TIMESTAMP NOT NULL,
                "userId" uuid,
                CONSTRAINT "PK_4572ff5d1264c4a523f01aa86a0" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "settings" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "forInstance" text NOT NULL,
                CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "auth_token"
            ADD CONSTRAINT "FK_5a326267f11b44c0d62526bc718" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "auth_token" DROP CONSTRAINT "FK_5a326267f11b44c0d62526bc718"
        `);
    await queryRunner.query(`
            DROP TABLE "settings"
        `);
    await queryRunner.query(`
            DROP TABLE "auth_token"
        `);
    await queryRunner.query(`
            DROP TABLE "user"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."user_role_enum"
        `);
  }
}
