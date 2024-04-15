import { Email, Mailer } from '../ports/mailer.interface';

export class InMemoryMailer implements Mailer {
  public readonly sentEmails: Email[] = [];

  async send(email: {
    to: string;
    subject: string;
    body: string;
  }): Promise<void> {
    this.sentEmails.push(email);
  }
}
