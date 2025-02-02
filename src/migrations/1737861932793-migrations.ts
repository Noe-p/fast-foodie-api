import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1737861932793 implements MigrationInterface {
    name = 'Migrations1737861932793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingredient" DROP CONSTRAINT "FK_04fb9dfaa7954d6aad75f5e406e"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "profilePictureId" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_f58f9c73bc58e409038e56a4055" UNIQUE ("profilePictureId")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_f58f9c73bc58e409038e56a4055" FOREIGN KEY ("profilePictureId") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ingredient" ADD CONSTRAINT "FK_04fb9dfaa7954d6aad75f5e406e" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingredient" DROP CONSTRAINT "FK_04fb9dfaa7954d6aad75f5e406e"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_f58f9c73bc58e409038e56a4055"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_f58f9c73bc58e409038e56a4055"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profilePictureId"`);
        await queryRunner.query(`ALTER TABLE "ingredient" ADD CONSTRAINT "FK_04fb9dfaa7954d6aad75f5e406e" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
