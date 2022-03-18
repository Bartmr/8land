import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserAppId1647382874239 implements MigrationInterface {
  name = 'UserAppId1647382874239';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "appId" uuid NULL`);

    await queryRunner.query(
      'UPDATE "user" SET "appId" = uuid_generate_v4() WHERE "appId" IS NULL;',
    );

    await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "appId"
            SET DEFAULT uuid_generate_v4()
        `);

    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "appId" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_0f153cdd5f58aa839137bf5657b" UNIQUE ("appId")`,
    );

    //

    await queryRunner.query(`
            CREATE TABLE "app_block" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "url" text NOT NULL,
                "inLandId" uuid,
                "inTerritoryId" uuid,
                CONSTRAINT "PK_78547aa0c549f1798273bb011cb" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            ALTER TABLE "app_block"
            ADD CONSTRAINT "FK_4c8be6c6f03207f54791f6969ab" FOREIGN KEY ("inLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "app_block"
            ADD CONSTRAINT "FK_b9ccf4c88004f91f78e382b94af" FOREIGN KEY ("inTerritoryId") REFERENCES "territory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "app_block" DROP CONSTRAINT "FK_b9ccf4c88004f91f78e382b94af"
    `);
    await queryRunner.query(`
        ALTER TABLE "app_block" DROP CONSTRAINT "FK_4c8be6c6f03207f54791f6969ab"
    `);
    await queryRunner.query(`
        ALTER TABLE "user"
        ALTER COLUMN "appId" DROP DEFAULT
    `);
    await queryRunner.query(`
        DROP TABLE "app_block"
    `);

    //

    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_0f153cdd5f58aa839137bf5657b"`,
    );

    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "appId"`);
  }
}
