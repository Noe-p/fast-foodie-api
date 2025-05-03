import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1738984800069 implements MigrationInterface {
    name = 'Migrations1738984800069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingredient" ALTER COLUMN "quantity" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingredient" ALTER COLUMN "quantity" SET NOT NULL`);
    }

}
