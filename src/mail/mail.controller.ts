import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { QrApprovalDto } from './dto/qr-approval.dto';
import { RawMailDto } from './dto/raw-mail.dto';

@Controller('send')
@UseGuards(ApiKeyGuard)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('qr-approval')
  @HttpCode(200)
  async sendQrApproval(@Body() dto: QrApprovalDto) {
    await this.mailService.sendQrApproval(dto.to, dto.userName, dto.qrBase64);
    return { success: true };
  }

  @Post('raw')
  @HttpCode(200)
  async sendRaw(@Body() dto: RawMailDto) {
    await this.mailService.sendRaw(dto.to, dto.subject, dto.html);
    return { success: true };
  }
}
