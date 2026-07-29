export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface IEmailProvider {
  send(options: EmailOptions): Promise<void>;
}
