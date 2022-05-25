import { MigrationInterface, QueryRunner } from 'typeorm';

export class Train1651758178120 implements MigrationInterface {
  name = 'Train1651758178120';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "settings" ADD "landLimitPerWorld" INT NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "settings" ADD "startLandsTotalLimit" INT NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "navigation_state" RENAME COLUMN "lastDoorWasDeleted" TO "lastCheckpointWasDeleted";`,
    );
    await queryRunner.query(
      `ALTER TABLE "navigation_state" DROP COLUMN "lastSavedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "navigation_state" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "navigation_state" ADD "traveledByTrainToLandId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "navigation_state" ADD "boardedOnTrainStationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "navigation_state" ADD CONSTRAINT "FK_9dee9df35965624b61838c3c400" FOREIGN KEY ("traveledByTrainToLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "navigation_state" ADD CONSTRAINT "FK_e66855387d146176c776aaeeda2" FOREIGN KEY ("boardedOnTrainStationId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`
            CREATE TABLE "world" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                "hasStartLand" boolean,
                CONSTRAINT "PK_9a0e469d5311d0d95ce1202c990" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "train_state" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid,
                "destinationLandId" uuid,
                "boardedInId" uuid,
                CONSTRAINT "PK_27b832cb7188013cabd4aa9de76" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "land"
            ADD "isStartingLand" boolean
        `);
    await queryRunner.query(`
            ALTER TABLE "land"
            ADD "worldId" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "world"
            ADD CONSTRAINT "FK_5c6f20a4c309c357a2934164b5e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "land"
            ADD CONSTRAINT "FK_17c933a8881643469968048493a" FOREIGN KEY ("worldId") REFERENCES "world"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "train_state"
            ADD CONSTRAINT "FK_5eebbbae9fc14bb9e37ca760a72" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "train_state"
            ADD CONSTRAINT "FK_371a712c8759a8ebd9276680f71" FOREIGN KEY ("boardedInId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "train_state"
            ADD CONSTRAINT "FK_b6d065bccaade9f8af80bc7fb56" FOREIGN KEY ("destinationLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "train_state" DROP CONSTRAINT "FK_b6d065bccaade9f8af80bc7fb56"
        `);
    await queryRunner.query(`
            ALTER TABLE "train_state" DROP CONSTRAINT "FK_371a712c8759a8ebd9276680f71"
        `);
    await queryRunner.query(`
            ALTER TABLE "train_state" DROP CONSTRAINT "FK_5eebbbae9fc14bb9e37ca760a72"
        `);
    await queryRunner.query(`
            ALTER TABLE "land" DROP CONSTRAINT "FK_17c933a8881643469968048493a"
        `);
    await queryRunner.query(`
            ALTER TABLE "world" DROP CONSTRAINT "FK_5c6f20a4c309c357a2934164b5e"
        `);
    await queryRunner.query(`
            ALTER TABLE "land" DROP COLUMN "worldId"
        `);
    await queryRunner.query(`
            ALTER TABLE "land" DROP COLUMN "isStartingLand"
        `);
    await queryRunner.query(`
            DROP TABLE "train_state"
        `);
    await queryRunner.query(`
            DROP TABLE "world"
        `);

    await queryRunner.query(
      `ALTER TABLE "navigation_state" DROP CONSTRAINT "FK_e66855387d146176c776aaeeda2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "navigation_state" DROP CONSTRAINT "FK_9dee9df35965624b61838c3c400"`,
    );
    await queryRunner.query(
      `ALTER TABLE "navigation_state" DROP COLUMN "boardedOnTrainStationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "navigation_state" DROP COLUMN "traveledByTrainToLandId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "navigation_state" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "navigation_state" ADD "lastSavedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "navigation_state" RENAME COLUMN "lastCheckpointWasDeleted" TO "lastDoorWasDeleted";`,
    );

    await queryRunner.query(
      `ALTER TABLE "settings" DROP COLUMN "landLimitPerWorld"`,
    );
    await queryRunner.query(
      `ALTER TABLE "settings" DROP COLUMN "startLandsTotalLimit"`,
    );
  }
}
