import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class RawMailDto {
  @IsEmail()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  html: string;
}
