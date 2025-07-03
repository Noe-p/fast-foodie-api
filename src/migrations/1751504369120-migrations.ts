import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751504369120 implements MigrationInterface {
    name = 'Migrations1751504369120'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingredient" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "ingredient" ADD "quantity" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingredient" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "ingredient" ADD "quantity" integer`);
    }

}
