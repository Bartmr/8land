import { MigrationInterface, QueryRunner } from "typeorm";

export class Squash1775318794517 implements MigrationInterface {
    name = 'Squash1775318794517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "territory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "hasAssets" boolean, "startX" integer NOT NULL, "startY" integer NOT NULL, "endX" integer NOT NULL, "endY" integer NOT NULL, "inLandId" uuid, CONSTRAINT "PK_2250448f958bc52a8d040b48f82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "door_block" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "inLandId" uuid, "inTerritoryId" uuid, "toLandId" uuid, CONSTRAINT "PK_807d55b046288e491692f3262e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firebaseUid" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isAdmin" boolean NOT NULL DEFAULT false, "appId" uuid NOT NULL DEFAULT uuid_generate_v4(), CONSTRAINT "UQ_905432b2c46bdcfe1a0dd3cdeff" UNIQUE ("firebaseUid"), CONSTRAINT "UQ_0f153cdd5f58aa839137bf5657b" UNIQUE ("appId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "world" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "hasStartLand" boolean, "userId" uuid, CONSTRAINT "PK_9a0e469d5311d0d95ce1202c990" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "land" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, "searchableName" text NOT NULL, "backgroundMusicUrl" text, "hasAssets" boolean, "isStartingLand" boolean, "isTrainStation" boolean, "worldId" uuid, CONSTRAINT "UQ_9020e736255b750fcdfd5c4860c" UNIQUE ("searchableName"), CONSTRAINT "PK_a6b43171b11dc6bab4a449e7b79" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "app_block" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" text NOT NULL, "inLandId" uuid, "inTerritoryId" uuid, CONSTRAINT "PK_78547aa0c549f1798273bb011cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "navigation_state" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cameBack" boolean, "lastPlayedBackgroundMusicUrl" text, "lastCheckpointWasDeleted" boolean, "userId" uuid, "lastDoorId" uuid, "boardedOnTrainStationId" uuid, "traveledByTrainToLandId" uuid, CONSTRAINT "PK_c00f123645b2f6459ce3404d539" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_auth_session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, CONSTRAINT "PK_4572ff5d1264c4a523f01aa86a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "territory" ADD CONSTRAINT "FK_cecb42404553f9206361f9c097e" FOREIGN KEY ("inLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "door_block" ADD CONSTRAINT "FK_2e09a81c863b57c8b0097916d31" FOREIGN KEY ("inLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "door_block" ADD CONSTRAINT "FK_b63fbd42c71566e795ce91dfce4" FOREIGN KEY ("inTerritoryId") REFERENCES "territory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "door_block" ADD CONSTRAINT "FK_59ac94911bc414b8160fca38b94" FOREIGN KEY ("toLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "world" ADD CONSTRAINT "FK_5c6f20a4c309c357a2934164b5e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "land" ADD CONSTRAINT "FK_17c933a8881643469968048493a" FOREIGN KEY ("worldId") REFERENCES "world"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_block" ADD CONSTRAINT "FK_4c8be6c6f03207f54791f6969ab" FOREIGN KEY ("inLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_block" ADD CONSTRAINT "FK_b9ccf4c88004f91f78e382b94af" FOREIGN KEY ("inTerritoryId") REFERENCES "territory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "navigation_state" ADD CONSTRAINT "FK_c44f8f1437e623151f30873e309" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "navigation_state" ADD CONSTRAINT "FK_68dc18c31bab1edc1cab35a403a" FOREIGN KEY ("lastDoorId") REFERENCES "door_block"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "navigation_state" ADD CONSTRAINT "FK_e66855387d146176c776aaeeda2" FOREIGN KEY ("boardedOnTrainStationId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "navigation_state" ADD CONSTRAINT "FK_9dee9df35965624b61838c3c400" FOREIGN KEY ("traveledByTrainToLandId") REFERENCES "land"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_auth_session" ADD CONSTRAINT "FK_5a326267f11b44c0d62526bc718" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_auth_session" DROP CONSTRAINT "FK_5a326267f11b44c0d62526bc718"`);
        await queryRunner.query(`ALTER TABLE "navigation_state" DROP CONSTRAINT "FK_9dee9df35965624b61838c3c400"`);
        await queryRunner.query(`ALTER TABLE "navigation_state" DROP CONSTRAINT "FK_e66855387d146176c776aaeeda2"`);
        await queryRunner.query(`ALTER TABLE "navigation_state" DROP CONSTRAINT "FK_68dc18c31bab1edc1cab35a403a"`);
        await queryRunner.query(`ALTER TABLE "navigation_state" DROP CONSTRAINT "FK_c44f8f1437e623151f30873e309"`);
        await queryRunner.query(`ALTER TABLE "app_block" DROP CONSTRAINT "FK_b9ccf4c88004f91f78e382b94af"`);
        await queryRunner.query(`ALTER TABLE "app_block" DROP CONSTRAINT "FK_4c8be6c6f03207f54791f6969ab"`);
        await queryRunner.query(`ALTER TABLE "land" DROP CONSTRAINT "FK_17c933a8881643469968048493a"`);
        await queryRunner.query(`ALTER TABLE "world" DROP CONSTRAINT "FK_5c6f20a4c309c357a2934164b5e"`);
        await queryRunner.query(`ALTER TABLE "door_block" DROP CONSTRAINT "FK_59ac94911bc414b8160fca38b94"`);
        await queryRunner.query(`ALTER TABLE "door_block" DROP CONSTRAINT "FK_b63fbd42c71566e795ce91dfce4"`);
        await queryRunner.query(`ALTER TABLE "door_block" DROP CONSTRAINT "FK_2e09a81c863b57c8b0097916d31"`);
        await queryRunner.query(`ALTER TABLE "territory" DROP CONSTRAINT "FK_cecb42404553f9206361f9c097e"`);
        await queryRunner.query(`DROP TABLE "user_auth_session"`);
        await queryRunner.query(`DROP TABLE "navigation_state"`);
        await queryRunner.query(`DROP TABLE "app_block"`);
        await queryRunner.query(`DROP TABLE "land"`);
        await queryRunner.query(`DROP TABLE "world"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "door_block"`);
        await queryRunner.query(`DROP TABLE "territory"`);
    }

}
