import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true for 465, false for other ports like 587
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  /**
   * Sends a password reset email to the user.
   */
  async sendPasswordResetEmail(to: string, resetToken: string, name: string): Promise<void> {
    const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0b0f19;
            color: #f3f4f6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 32px;
            background: linear-gradient(135deg, #111827 0%, #0f172a 100%);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            background: linear-gradient(to right, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            color: #3b82f6;
            letter-spacing: -0.5px;
          }
          .content {
            line-height: 1.6;
            color: #d1d5db;
          }
          h1 {
            font-size: 22px;
            color: #ffffff;
            margin-top: 0;
            font-weight: 700;
          }
          p {
            margin: 16px 0;
            font-size: 15px;
          }
          .btn-container {
            text-align: center;
            margin: 32px 0;
          }
          .btn {
            display: inline-block;
            padding: 14px 30px;
            background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3);
            transition: all 0.2s ease-in-out;
          }
          .footer {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 13px;
            color: #6b7280;
            text-align: center;
          }
          .link-fallback {
            word-break: break-all;
            color: #60a5fa;
            text-decoration: none;
          }
          .warning {
            margin-top: 24px;
            font-size: 13px;
            color: #9ca3af;
            background-color: rgba(245, 158, 11, 0.1);
            border-left: 3px solid #f59e0b;
            padding: 12px 16px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">Project Work Tracker</span>
          </div>
          <div class="content">
            <h1>Password Reset Request</h1>
            <p>Hello ${name},</p>
            <p>We received a request to reset the password for your Project Work Tracker account. Click the button below to choose a new password. This link is valid for 1 hour.</p>
            
            <div class="btn-container">
              <a href="${resetUrl}" class="btn">Reset Password</a>
            </div>
            
            <div class="warning">
              If you did not request a password reset, please ignore this email. Your password will remain unchanged.
            </div>

            <p>If you're having trouble clicking the button, copy and paste this URL into your web browser:</p>
            <p><a href="${resetUrl}" class="link-fallback">${resetUrl}</a></p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Project Work Tracker. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Hello ${name},

We received a request to reset the password for your Project Work Tracker account.

Please reset your password by copying the following URL and pasting it in your browser:
${resetUrl}

This link is valid for 1 hour. If you did not request this, please ignore this email.

Best regards,
Project Work Tracker Team
    `;

    await this.transporter.sendMail({
      from: `"${env.SMTP_FROM.split('@')[0]}" <${env.SMTP_FROM}>`,
      to,
      subject: 'Reset Your Password - Project Work Tracker',
      text: textContent,
      html: htmlContent,
    });
  }

  async sendCollaborationInvitationEmail(
    to: string,
    inviterName: string,
    inviterEmail: string,
    acceptUrl: string
  ): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Collaboration Invitation</title>
        <style>
          body {
            font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0b0f19;
            color: #f3f4f6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 32px;
            background: linear-gradient(135deg, #111827 0%, #0f172a 100%);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            background: linear-gradient(to right, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            color: #3b82f6;
            letter-spacing: -0.5px;
          }
          .content {
            line-height: 1.6;
            color: #d1d5db;
          }
          h1 {
            font-size: 22px;
            color: #ffffff;
            margin-top: 0;
            font-weight: 700;
          }
          p {
            margin: 16px 0;
            font-size: 15px;
          }
          .btn-container {
            text-align: center;
            margin: 32px 0;
          }
          .btn {
            display: inline-block;
            padding: 14px 30px;
            background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3);
            transition: all 0.2s ease-in-out;
          }
          .footer {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 13px;
            color: #6b7280;
            text-align: center;
          }
          .link-fallback {
            word-break: break-all;
            color: #60a5fa;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">Project Work Tracker</span>
          </div>
          <div class="content">
            <h1>Collaboration Invitation</h1>
            <p>Hello,</p>
            <p><strong>${inviterName}</strong> (${inviterEmail}) has invited you to collaborate on Project Work Tracker.</p>
            <p>Click the button below to accept the invitation and add them to your frequent collaborators:</p>
            
            <div class="btn-container">
              <a href="${acceptUrl}" class="btn">Accept Invitation</a>
            </div>
            
            <p>If you're having trouble clicking the button, copy and paste this URL into your web browser:</p>
            <p><a href="${acceptUrl}" class="link-fallback">${acceptUrl}</a></p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Project Work Tracker. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Hello,

${inviterName} (${inviterEmail}) has invited you to collaborate on Project Work Tracker.

Please accept the invitation by copying the following URL and pasting it in your browser:
${acceptUrl}

Best regards,
Project Work Tracker Team
    `;

    await this.transporter.sendMail({
      from: `"${env.SMTP_FROM.split('@')[0]}" <${env.SMTP_FROM}>`,
      to,
      subject: `Collaboration Invitation from ${inviterName}`,
      text: textContent,
      html: htmlContent,
    });
  }
}
