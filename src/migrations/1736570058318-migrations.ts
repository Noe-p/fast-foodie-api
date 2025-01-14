import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1736570058318 implements MigrationInterface {
    name = 'Migrations1736570058318'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_128abc0f24534d6f32ba699dc95"`);
        await queryRunner.query(`ALTER TABLE "ingredient" DROP CONSTRAINT "FK_7c9b1a5446b05b56654617af02c"`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_128abc0f24534d6f32ba699dc95" FOREIGN KEY ("dishId") REFERENCES "dish"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ingredient" ADD CONSTRAINT "FK_7c9b1a5446b05b56654617af02c" FOREIGN KEY ("dishId") REFERENCES "dish"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ingredient" DROP CONSTRAINT "FK_7c9b1a5446b05b56654617af02c"`);
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_128abc0f24534d6f32ba699dc95"`);
        await queryRunner.query(`ALTER TABLE "ingredient" ADD CONSTRAINT "FK_7c9b1a5446b05b56654617af02c" FOREIGN KEY ("dishId") REFERENCES "dish"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_128abc0f24534d6f32ba699dc95" FOREIGN KEY ("dishId") REFERENCES "dish"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
