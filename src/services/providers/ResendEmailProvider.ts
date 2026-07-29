import { IEmailProvider, EmailOptions } from './IEmailProvider.js';

export class ResendEmailProvider implements IEmailProvider {
  constructor(
    private readonly apiKey: string,
    private readonly verifiedSender: boolean,
    private readonly defaultFrom: string
  ) {}

  async send(options: EmailOptions): Promise<void> {
    const from = this.verifiedSender
      ? this.defaultFrom
      : `Project Work Tracker <onboarding@resend.dev>`;

    console.log(`[Resend] Sending email to ${options.to} | from: ${from} | subject: "${options.subject}"`);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      }),
    });

    const responseBody = await response.text();
    console.log(`[Resend] Response status: ${response.status} | body: ${responseBody}`);

    if (!response.ok) {
      throw new Error(`Failed to send email via Resend API: ${response.statusText} (${response.status}) - ${responseBody}`);
    }
  }
}
