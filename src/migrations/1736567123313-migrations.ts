import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1736567123313 implements MigrationInterface {
    name = 'Migrations1736567123313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingredient" DROP COLUMN "ration"`);
        await queryRunner.query(`ALTER TABLE "dish" ADD "ration" integer NOT NULL DEFAULT '2'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dish" DROP COLUMN "ration"`);
        await queryRunner.query(`ALTER TABLE "ingredient" ADD "ration" integer NOT NULL DEFAULT '2'`);
    }

}
