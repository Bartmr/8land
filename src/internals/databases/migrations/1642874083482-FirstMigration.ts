import { MigrationInterface, QueryRunner } from 'typeorm-bartmr';

export class FirstMigration1642874083482 implements MigrationInterface {
  name = 'FirstMigration1642874083482';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM('end-user', 'admin')
        `);
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "firebaseUid" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "role" "public"."user_role_enum" NOT NULL,
                "walletPublicKey" text,
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
            CREATE TABLE "territory" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "hasAssets" boolean,
                "startX" integer NOT NULL,
                "startY" integer NOT NULL,
                "endX" integer NOT NULL,
                "endY" integer NOT NULL,
                "inLandId" uuid,
                "nftTransactionHash" text,
                CONSTRAINT "PK_2250448f958bc52a8d040b48f82" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "land" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "name" text NOT NULL,
                "searchableName" text NOT NULL,
                "backgroundMusicUrl" text,
                "hasAssets" boolean,
                CONSTRAINT "UQ_9020e736255b750fcdfd5c4860c" UNIQUE ("searchableName"),
                CONSTRAINT "PK_a6b43171b11dc6bab4a449e7b79" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "door_block" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "inLandId" uuid,
                "inTerritoryId" uuid,
                "toLandId" uuid,
                CONSTRAINT "PK_807d55b046288e491692f3262e2" PRIMARY KEY ("id")
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
    await queryRunner.query(`
            ALTER TABLE "territory"
            ADD CONSTRAINT "FK_cecb42404553f9206361f9c097e" FOREIGN KEY ("inLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "door_block"
            ADD CONSTRAINT "FK_2e09a81c863b57c8b0097916d31" FOREIGN KEY ("inLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "door_block"
            ADD CONSTRAINT "FK_b63fbd42c71566e795ce91dfce4" FOREIGN KEY ("inTerritoryId") REFERENCES "territory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "door_block"
            ADD CONSTRAINT "FK_59ac94911bc414b8160fca38b94" FOREIGN KEY ("toLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "door_block" DROP CONSTRAINT "FK_59ac94911bc414b8160fca38b94"
        `);
    await queryRunner.query(`
            ALTER TABLE "door_block" DROP CONSTRAINT "FK_b63fbd42c71566e795ce91dfce4"
        `);
    await queryRunner.query(`
            ALTER TABLE "door_block" DROP CONSTRAINT "FK_2e09a81c863b57c8b0097916d31"
        `);
    await queryRunner.query(`
            ALTER TABLE "territory" DROP CONSTRAINT "FK_cecb42404553f9206361f9c097e"
        `);
    await queryRunner.query(`
            ALTER TABLE "auth_token" DROP CONSTRAINT "FK_5a326267f11b44c0d62526bc718"
        `);
    await queryRunner.query(`
            DROP TABLE "settings"
        `);
    await queryRunner.query(`
            DROP TABLE "door_block"
        `);
    await queryRunner.query(`
            DROP TABLE "land"
        `);
    await queryRunner.query(`
            DROP TABLE "territory"
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
