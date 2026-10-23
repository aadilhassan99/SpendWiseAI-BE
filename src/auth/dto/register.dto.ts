import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Ada Lovelace', maxLength: 50 })
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @MaxLength(320)
  email: string;

  @ApiProperty({ example: 'correct-horse-battery-staple', minLength: 12 })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password: string;
}
