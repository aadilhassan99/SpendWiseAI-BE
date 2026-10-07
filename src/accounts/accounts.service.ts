import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { FinancialAccount } from './entities/financial-account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(FinancialAccount)
    private readonly accountsRepository: Repository<FinancialAccount>,
  ) {}

  findAll(userId: string): Promise<FinancialAccount[]> {
    return this.accountsRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
  }

  create(
    userId: string,
    createAccountDto: CreateAccountDto,
  ): Promise<FinancialAccount> {
    return this.accountsRepository.save(
      this.accountsRepository.create({ ...createAccountDto, userId }),
    );
  }

  async update(
    userId: string,
    accountId: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<FinancialAccount> {
    const account = await this.findOneForUser(userId, accountId);
    Object.assign(account, this.withDefinedValues(updateAccountDto));
    return this.accountsRepository.save(account);
  }

  getOwnedAccount(
    userId: string,
    accountId: string,
  ): Promise<FinancialAccount> {
    return this.findOneForUser(userId, accountId);
  }

  async remove(userId: string, accountId: string): Promise<void> {
    const result = await this.accountsRepository.delete({
      id: accountId,
      userId,
    });
    if (result.affected !== 1) {
      throw new NotFoundException('Account not found');
    }
  }

  private async findOneForUser(
    userId: string,
    accountId: string,
  ): Promise<FinancialAccount> {
    const account = await this.accountsRepository.findOneBy({
      id: accountId,
      userId,
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  private withDefinedValues(
    updateAccountDto: UpdateAccountDto,
  ): Partial<FinancialAccount> {
    return Object.fromEntries(
      Object.entries(updateAccountDto).filter(
        ([, value]) => value !== undefined,
      ),
    );
  }
}
