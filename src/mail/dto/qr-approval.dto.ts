import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class QrApprovalDto {
  @IsEmail()
  to: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  qrBase64: string;
}
