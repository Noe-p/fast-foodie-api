import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1736568944661 implements MigrationInterface {
    name = 'Migrations1736568944661'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dish" DROP COLUMN "tags"`);
        await queryRunner.query(`ALTER TABLE "dish" ADD "tags" text array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dish" DROP COLUMN "tags"`);
        await queryRunner.query(`ALTER TABLE "dish" ADD "tags" text NOT NULL`);
    }

}
