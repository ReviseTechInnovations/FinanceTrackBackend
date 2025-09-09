import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS')
      }
    });
  }

  async sendOtpEmail(
    email: string,
    otp: string,
    firstName: string
  ): Promise<void> {
    try {
      const template = await this.loadTemplate('otp-verification');
      const html = template({
        firstName,
        otp,
        expiryMinutes: this.configService.get('OTP_EXPIRY_MINUTES') || 10
      });

      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM'),
        to: email,
        subject: 'Verify Your Email - FinTrack',
        html
      });

      this.logger.log(`OTP email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      throw error;
    }
  }

  async sendConfirmationEmail(email: string, firstName: string): Promise<void> {
    try {
      const template = await this.loadTemplate('email-confirmation');
      const html = template({
        firstName,
        loginUrl: `${this.configService.get('CORS_ORIGIN')}/login`
      });

      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM'),
        to: email,
        subject: 'Welcome to FinTrack - Email Verified!',
        html
      });

      this.logger.log(`Confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send confirmation email to ${email}:`,
        error
      );
      throw error;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    firstName: string
  ): Promise<void> {
    try {
      const template = await this.loadTemplate('password-reset');
      const resetUrl = `${this.configService.get('CORS_ORIGIN')}/reset-password?token=${resetToken}`;
      const html = template({
        firstName,
        resetUrl,
        expiryHours: 24
      });

      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM'),
        to: email,
        subject: 'Reset Your Password - FinTrack',
        html
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}:`,
        error
      );
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      const template = await this.loadTemplate('welcome');
      const html = template({
        firstName,
        dashboardUrl: `${this.configService.get('CORS_ORIGIN')}/dashboard`,
        supportEmail: 'support@fintrack.com'
      });

      await this.transporter.sendMail({
        from: this.configService.get('EMAIL_FROM'),
        to: email,
        subject: 'Welcome to FinTrack!',
        html
      });

      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      throw error;
    }
  }

  private async loadTemplate(
    templateName: string
  ): Promise<HandlebarsTemplateDelegate> {
    const templatePath = path.join(
      __dirname,
      'templates',
      `${templateName}.hbs`
    );

    try {
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      return handlebars.compile(templateContent);
    } catch (error) {
      this.logger.error(`Failed to load template ${templateName}:`, error);
      // Return a simple fallback template
      return handlebars.compile(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>FinTrack</h2>
          <p>Hello {{firstName}},</p>
          <p>{{{content}}}</p>
          <p>Best regards,<br>The FinTrack Team</p>
        </div>
      `);
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email service connection verified');
      return true;
    } catch (error) {
      this.logger.error('Email service connection failed:', error);
      return false;
    }
  }
}
