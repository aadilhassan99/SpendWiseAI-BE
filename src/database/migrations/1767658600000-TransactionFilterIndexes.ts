import { MigrationInterface, QueryRunner } from 'typeorm';

export class TransactionFilterIndexes1767658600000 implements MigrationInterface {
  name = 'TransactionFilterIndexes1767658600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX "IDX_transactions_user_account" ON "transactions" ("user_id", "account_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_transactions_user_category" ON "transactions" ("user_id", "category_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_transactions_user_currency" ON "transactions" ("user_id", "currency")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_transactions_user_type" ON "transactions" ("user_id", "type")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_transactions_user_type"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_transactions_user_currency"',
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_transactions_user_category"',
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_transactions_user_account"',
    );
  }
}
