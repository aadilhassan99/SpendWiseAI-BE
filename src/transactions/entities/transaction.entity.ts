import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FinancialAccount } from '../../accounts/entities/financial-account.entity';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';

export enum TransactionType {
  Income = 'income',
  Expense = 'expense',
  Transfer = 'transfer',
}

export enum TransactionSourceType {
  Manual = 'manual',
  Statement = 'statement',
  Receipt = 'receipt',
}

export enum TransactionStatus {
  PendingReview = 'pending_review',
  Confirmed = 'confirmed',
}

@Entity({ name: 'transactions' })
@Index('IDX_transactions_user_date', ['userId', 'transactionDate'])
@Index('IDX_transactions_account_date', ['accountId', 'transactionDate'])
@Index('IDX_transactions_user_status', ['userId', 'status'])
@Index('IDX_transactions_user_account', ['userId', 'accountId'])
@Index('IDX_transactions_user_category', ['userId', 'categoryId'])
@Index('IDX_transactions_user_currency', ['userId', 'currency'])
@Index('IDX_transactions_user_type', ['userId', 'type'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @Column({ type: 'numeric', precision: 20, scale: 6 })
  amount: string;

  @Column({ type: 'char', length: 3 })
  currency: string;

  @Column({ type: 'enum', enum: TransactionType, enumName: 'transaction_type' })
  type: TransactionType;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  merchant: string | null;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: string;

  @Column({
    name: 'source_type',
    type: 'enum',
    enum: TransactionSourceType,
    enumName: 'transaction_source_type',
  })
  sourceType: TransactionSourceType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    enumName: 'transaction_status',
  })
  status: TransactionStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => FinancialAccount, (account) => account.transactions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'account_id' })
  account: FinancialAccount;

  @ManyToOne(() => Category, (category) => category.transactions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;
}
