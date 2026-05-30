import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private from: string;
  private appUrl: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.from = process.env.MAIL_FROM || 'destek@mail.ceptecash.com';
    this.appUrl = process.env.APP_URL || 'https://ceptecash.com';
  }

  async sendQrApproval(to: string, userName: string, qrBase64: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: [to],
      subject: 'Hesabınız Onaylandı — Google Authenticator Kurulumu',
      html: this.buildQrApprovalHtml(userName, qrBase64),
      attachments: [
        {
          filename: 'authenticator-qr.png',
          content: Buffer.from(qrBase64, 'base64'),
        },
      ],
    });

    if (error) {
      throw new InternalServerErrorException(`Mail gönderilemedi: ${error.message}`);
    }
  }

  async sendRaw(to: string, subject: string, html: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: [to],
      subject,
      html,
    });

    if (error) {
      throw new InternalServerErrorException(`Mail gönderilemedi: ${error.message}`);
    }
  }

  private buildQrApprovalHtml(userName: string, qrBase64: string): string {
    return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hesabınız Onaylandı</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:#0f172a;padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:1px;">CepteCash</h1>
              <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;">Ödeme Yönetim Sistemi</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 40px 20px;">
              <h2 style="margin:0 0 12px;color:#1e293b;font-size:20px;">Merhaba ${userName},</h2>
              <p style="margin:0;color:#475569;line-height:1.7;font-size:15px;">
                Hesabınız yönetici tarafından onaylandı. Sisteme güvenli giriş yapabilmek için
                <strong>Google Authenticator</strong> uygulamasını kurmanız gerekmektedir.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0 0 16px;color:#334155;font-weight:bold;font-size:15px;">QR Kodu Okutun</p>
                    <img src="data:image/png;base64,${qrBase64}" alt="Google Authenticator QR Kodu"
                      style="width:180px;height:180px;display:block;margin:0 auto;" />
                    <p style="margin:16px 0 0;color:#64748b;font-size:12px;">
                      QR kodu görünmüyorsa ekteki <strong>authenticator-qr.png</strong> dosyasını açın.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 40px;">
              <p style="margin:0 0 12px;color:#334155;font-weight:bold;font-size:15px;">Kurulum Adımları</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;color:#475569;font-size:14px;">
                    <span style="display:inline-block;width:24px;height:24px;background:#0f172a;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;margin-right:10px;">1</span>
                    Telefonunuza <strong>Google Authenticator</strong> uygulamasını indirin.
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#475569;font-size:14px;">
                    <span style="display:inline-block;width:24px;height:24px;background:#0f172a;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;margin-right:10px;">2</span>
                    Uygulamada <strong>"+"</strong> butonuna basarak <strong>"QR Kodu Tara"</strong> seçeneğini seçin.
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#475569;font-size:14px;">
                    <span style="display:inline-block;width:24px;height:24px;background:#0f172a;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;margin-right:10px;">3</span>
                    Yukarıdaki QR kodu okutun — hesabınız uygulamaya eklenecektir.
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#475569;font-size:14px;">
                    <span style="display:inline-block;width:24px;height:24px;background:#0f172a;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;margin-right:10px;">4</span>
                    Giriş ekranında e-posta + şifrenizi girdikten sonra uygulamadaki <strong>6 haneli kodu</strong> girin.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 40px 40px;text-align:center;">
              <a href="${this.appUrl}/auth/login"
                style="display:inline-block;background:#0f172a;color:#ffffff;padding:14px 36px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;">
                Giriş Yap
              </a>
            </td>
          </tr>

          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Bu e-posta CepteCash tarafından otomatik olarak gönderilmiştir.<br>
                Bir sorun yaşıyorsanız sistem yöneticinizle iletişime geçin.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
