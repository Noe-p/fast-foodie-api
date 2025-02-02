import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1737168239240 implements MigrationInterface {
    name = 'Migrations1737168239240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingredient" ADD "unit" character varying`);
        await queryRunner.query(`ALTER TABLE "ingredient" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "ingredient" ADD "quantity" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingredient" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "ingredient" ADD "quantity" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ingredient" DROP COLUMN "unit"`);
    }

}
