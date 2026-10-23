import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactions1791739045972 implements MigrationInterface {
  name = 'AddTransactions1791739045972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_account"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "financial_accounts" DROP CONSTRAINT "FK_financial_accounts_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "name" character varying(50)`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "name" = LEFT(SPLIT_PART("email", '@', 1), 50) WHERE "name" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_2296b7fe012d95646fa41921c8b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_49c0d6e8ba4bfb5582000d851f0" FOREIGN KEY ("account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_c9e41213ca42d50132ed7ab2b0f" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "financial_accounts" ADD CONSTRAINT "FK_478d324d4950fa627e39d268edc" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "financial_accounts" DROP CONSTRAINT "FK_478d324d4950fa627e39d268edc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_c9e41213ca42d50132ed7ab2b0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_49c0d6e8ba4bfb5582000d851f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_2296b7fe012d95646fa41921c8b"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "financial_accounts" ADD CONSTRAINT "FK_financial_accounts_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_account" FOREIGN KEY ("account_id") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
