import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1736486975480 implements MigrationInterface {
    name = 'Migrations1736486975480'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."dish_status_enum" AS ENUM('PRIVATE', 'PUBLIC')`);
        await queryRunner.query(`CREATE TABLE "dish" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "instructions" character varying, "status" "public"."dish_status_enum" NOT NULL DEFAULT 'PUBLIC', "weeklyDish" boolean NOT NULL DEFAULT false, "tags" text NOT NULL, "chefId" uuid NOT NULL, CONSTRAINT "PK_59ac7b35af39b231276bfc4c00c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "media" ADD "dishId" uuid`);
        await queryRunner.query(`ALTER TABLE "ingredient" ADD "dishId" uuid`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_128abc0f24534d6f32ba699dc95" FOREIGN KEY ("dishId") REFERENCES "dish"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dish" ADD CONSTRAINT "FK_8d7bf18dc0b2cdc04267c240b6f" FOREIGN KEY ("chefId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ingredient" ADD CONSTRAINT "FK_7c9b1a5446b05b56654617af02c" FOREIGN KEY ("dishId") REFERENCES "dish"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingredient" DROP CONSTRAINT "FK_7c9b1a5446b05b56654617af02c"`);
        await queryRunner.query(`ALTER TABLE "dish" DROP CONSTRAINT "FK_8d7bf18dc0b2cdc04267c240b6f"`);
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_128abc0f24534d6f32ba699dc95"`);
        await queryRunner.query(`ALTER TABLE "ingredient" DROP COLUMN "dishId"`);
        await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "dishId"`);
        await queryRunner.query(`DROP TABLE "dish"`);
        await queryRunner.query(`DROP TYPE "public"."dish_status_enum"`);
    }

}
