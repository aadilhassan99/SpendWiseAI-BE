import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @MaxLength(320)
  email: string;

  @ApiProperty({ example: 'correct-horse-battery-staple' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password: string;
}
