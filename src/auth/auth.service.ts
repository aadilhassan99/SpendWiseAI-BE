import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import type { StringValue } from 'ms';
import { DataSource, Repository } from 'typeorm';
import { Category, CategoryType } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { AuthTokenPayload } from '../common/auth/authenticated-request.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const PASSWORD_HASH_ROUNDS = 12;

const DEFAULT_CATEGORIES: ReadonlyArray<{ name: string; type: CategoryType }> =
  [
    { name: 'Food', type: CategoryType.Expense },
    { name: 'Groceries', type: CategoryType.Expense },
    { name: 'Transport', type: CategoryType.Expense },
    { name: 'Shopping', type: CategoryType.Expense },
    { name: 'Entertainment', type: CategoryType.Expense },
    { name: 'Bills', type: CategoryType.Expense },
    { name: 'Rent', type: CategoryType.Expense },
    { name: 'Healthcare', type: CategoryType.Expense },
    { name: 'Education', type: CategoryType.Expense },
    { name: 'Salary', type: CategoryType.Income },
    { name: 'Freelance', type: CategoryType.Income },
    { name: 'Other', type: CategoryType.Expense },
  ];

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: AuthenticatedUser; accessToken: string }> {
    const email = this.normalizeEmail(registerDto.email);
    const passwordHash = await hash(registerDto.password, PASSWORD_HASH_ROUNDS);

    try {
      const user = await this.dataSource.transaction(async (manager) => {
        const userRepository = manager.getRepository(User);
        const categoryRepository = manager.getRepository(Category);
        const newUser = userRepository.create({ email, name: registerDto.name, passwordHash });
        const savedUser = await userRepository.save(newUser);

        await categoryRepository.save(
          DEFAULT_CATEGORIES.map((category) =>
            categoryRepository.create({ ...category, userId: savedUser.id }),
          ),
        );

        return savedUser;
      });

      return {
        user: this.toAuthenticatedUser(user),
        accessToken: await this.createAccessToken(user),
      };
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
      throw error;
    }
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ user: AuthenticatedUser; accessToken: string }> {
    const email = this.normalizeEmail(loginDto.email);
    const user = await this.usersRepository.findOne({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !(await compare(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      user: this.toAuthenticatedUser(user),
      accessToken: await this.createAccessToken(user),
    };
  }

  async getCurrentUser(userId: string): Promise<AuthenticatedUser> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.toAuthenticatedUser(user);
  }

  getSessionCookieOptions(): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax';
    maxAge: number;
    path: string;
  } {
    return {
      httpOnly: true,
      secure: this.configService.get<string>('nodeEnv') === 'production',
      sameSite: 'lax',
      maxAge: this.sessionDurationMilliseconds(),
      path: '/api/v1',
    };
  }

  private async createAccessToken(user: User): Promise<string> {
    const payload: AuthTokenPayload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.getOrThrow<string>(
        'auth.jwtExpiresIn',
      ) as StringValue,
    });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toAuthenticatedUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private isUniqueViolation(error: unknown): error is { code: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }

  private sessionDurationMilliseconds(): number {
    const expiresIn =
      this.configService.getOrThrow<string>('auth.jwtExpiresIn');
    const matched = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!matched) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const value = Number(matched[1]);
    const unitMilliseconds: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * unitMilliseconds[matched[2]];
  }
}
