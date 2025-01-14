import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1736571477981 implements MigrationInterface {
    name = 'Migrations1736571477981'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "food" ADD "name_lowercase" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "food" ADD CONSTRAINT "UQ_e6f5805b34fb53391e7aecb8b0e" UNIQUE ("name_lowercase")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "food" DROP CONSTRAINT "UQ_e6f5805b34fb53391e7aecb8b0e"`);
        await queryRunner.query(`ALTER TABLE "food" DROP COLUMN "name_lowercase"`);
    }

}
