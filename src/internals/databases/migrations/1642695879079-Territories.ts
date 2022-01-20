import { MigrationInterface, QueryRunner } from 'typeorm';

export class Territories1642695879079 implements MigrationInterface {
  name = 'Territories1642695879079';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "door_block" DROP CONSTRAINT "FK_d148b102b6b874ab4e34ce2a4ce"
        `);
    await queryRunner.query(`
            ALTER TABLE "door_block"
            ADD CONSTRAINT "FK_59ac94911bc414b8160fca38b94" FOREIGN KEY ("toLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
                CONSTRAINT "PK_2250448f958bc52a8d040b48f82" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "territory"
            ADD CONSTRAINT "FK_cecb42404553f9206361f9c097e" FOREIGN KEY ("inLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "block_entry"
            ADD "territoryId" uuid
        `);

    await queryRunner.query(`
            ALTER TABLE "block_entry"
            ADD CONSTRAINT "FK_2852ddc4bd878319ad53f04d7bc" FOREIGN KEY ("territoryId") REFERENCES "territory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "door_block" DROP CONSTRAINT "FK_59ac94911bc414b8160fca38b94"
        `);
    await queryRunner.query(`
        ALTER TABLE "door_block"
        ADD CONSTRAINT "FK_d148b102b6b874ab4e34ce2a4ce" FOREIGN KEY ("toLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
        ALTER TABLE "block_entry" DROP CONSTRAINT "FK_2852ddc4bd878319ad53f04d7bc"
    `);
    await queryRunner.query(`
        ALTER TABLE "block_entry" DROP COLUMN "territoryId"
    `);

    await queryRunner.query(`
            ALTER TABLE "territory" DROP CONSTRAINT "FK_cecb42404553f9206361f9c097e"
        `);
    await queryRunner.query(`
            DROP TABLE "territory"
        `);
  }
}
