import nodemailer from 'nodemailer';

/**
 * Email Provider - Handles sending emails (V2.0 feature, currently reserved).
 *
 * When SMTP credentials are configured, this module can send:
 * - Inquiry confirmation emails to customers
 * - New inquiry notifications to sales team
 * - Follow-up reminders
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailProvider {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }

  /**
   * Checks if email sending is configured and ready.
   */
  isConfigured(): boolean {
    return this.transporter !== null;
  }

  /**
   * Sends an email.
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email provider not configured. Skipping email send.');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        ...options,
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Sends an inquiry confirmation email to the customer.
   */
  async sendInquiryConfirmation(
    customerEmail: string,
    customerName: string,
    inquiryNo: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: customerEmail,
      subject: `Inquiry Received - ${inquiryNo}`,
      html: `
        <h2>Thank you for your inquiry, ${customerName}!</h2>
        <p>We have received your inquiry (<strong>${inquiryNo}</strong>) and our sales team will contact you within 24 hours.</p>
        <p>Best regards,<br>Qianfan Team</p>
      `,
    });
  }

  /**
   * Sends a notification to the sales team about a new inquiry.
   */
  async sendInquiryNotification(
    inquiryNo: string,
    customerName: string,
    email: string,
    message: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: 'web@tsianfan.com',
      subject: `New Inquiry: ${inquiryNo} - ${customerName}`,
      html: `
        <h2>New Inquiry Received</h2>
        <p><strong>Inquiry No:</strong> ${inquiryNo}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });
  }
}

export const emailProvider = new EmailProvider();
