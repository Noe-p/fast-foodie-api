import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1738638379778 implements MigrationInterface {
    name = 'Migrations1738638379778'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "collaborator" ADD "receveidId" uuid`);
        await queryRunner.query(`ALTER TABLE "collaborator" ADD "senderId" uuid`);
        await queryRunner.query(`ALTER TABLE "collaborator" ADD CONSTRAINT "FK_b218d02a2a4e30173b4a84c5982" FOREIGN KEY ("receveidId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "collaborator" ADD CONSTRAINT "FK_105ae12063ede024645ec6f8246" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "collaborator" DROP CONSTRAINT "FK_105ae12063ede024645ec6f8246"`);
        await queryRunner.query(`ALTER TABLE "collaborator" DROP CONSTRAINT "FK_b218d02a2a4e30173b4a84c5982"`);
        await queryRunner.query(`ALTER TABLE "collaborator" DROP COLUMN "senderId"`);
        await queryRunner.query(`ALTER TABLE "collaborator" DROP COLUMN "receveidId"`);
    }

}
