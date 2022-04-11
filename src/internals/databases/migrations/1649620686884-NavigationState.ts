import { MigrationInterface, QueryRunner } from 'typeorm';

export class NavigationState1649620686884 implements MigrationInterface {
  name = 'NavigationState1649620686884';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "navigation_state" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "lastDoorWasDeleted" boolean,
                "lastSavedAt" TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                "lastDoorId" uuid,
                "isComingBack" boolean,
                "lastPlayedBackgroundMusicUrl" text,
                CONSTRAINT "PK_c00f123645b2f6459ce3404d539" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "navigation_state"
            ADD CONSTRAINT "FK_c44f8f1437e623151f30873e309" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "navigation_state"
            ADD CONSTRAINT "FK_68dc18c31bab1edc1cab35a403a" FOREIGN KEY ("lastDoorId") REFERENCES "door_block"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "navigation_state" DROP CONSTRAINT "FK_68dc18c31bab1edc1cab35a403a"
        `);
    await queryRunner.query(`
            ALTER TABLE "navigation_state" DROP CONSTRAINT "FK_c44f8f1437e623151f30873e309"
        `);
    await queryRunner.query(`
            DROP TABLE "navigation_state"
        `);
  }
}
