import fs from 'fs';
import nodemailer from 'nodemailer';
import path from 'path';
import sharp from 'sharp';
import {
  passwordResetEmailTemplate,
  EmailTemplateParams,
} from '../utils/emailTemplates';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isInitialized = false;
  private logoIconBase64: string = '';

  constructor() {
    this.loadAndConvertLogoIcon();
  }

  private async loadAndConvertLogoIcon(): Promise<void> {
    try {
      let iconPath = path.join(process.cwd(), 'assets', 'logo.svg');

      if (!fs.existsSync(iconPath)) {
        console.warn(
          'No logo file found in assets/. Using default placeholder.',
        );
        this.logoIconBase64 =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        return;
      }

      let pngBuffer: Buffer;

      if (iconPath.endsWith('.svg')) {
        const svgContent = fs.readFileSync(iconPath, 'utf8');
        pngBuffer = await sharp(Buffer.from(svgContent))
          .resize(96, 96, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png({ compressionLevel: 9, quality: 90 })
          .toBuffer();
      } else {
        pngBuffer = await sharp(iconPath)
          .resize(96, 96, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png({ compressionLevel: 9, quality: 90 })
          .toBuffer();
      }

      this.logoIconBase64 = `data:image/png;base64,${pngBuffer.toString(
        'base64',
      )}`;
      console.log(
        `✅ Logo icon converted and encoded as base64 (${Math.round(
          pngBuffer.length / 1024,
        )}KB)`,
      );
    } catch (error) {
      console.error('Failed to load/convert logo icon:', error);
      this.logoIconBase64 =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
  }

  private initializeTransporter(): void {
    if (this.isInitialized) return;

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.isInitialized = true;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.verifyConnection();
    } else {
      console.warn('SMTP credentials not found. Email functionality disabled.');
    }
  }

  private async verifyConnection(): Promise<void> {
    if (!this.transporter) return;
    try {
      await this.transporter.verify();
      console.log('SMTP server connection verified successfully');
    } catch (error) {
      console.error('SMTP server connection failed:', error);
      console.warn(
        'Email functionality may not work properly. Please check your SMTP configuration.',
      );
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    this.initializeTransporter();

    if (!this.transporter) {
      throw new Error('Email service not properly configured');
    }

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'StuddyBuddy',
        address: process.env.EMAIL_FROM_ADDRESS || 'noreply@studdybuddy.com',
      },
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    this.initializeTransporter();

    if (!this.transporter) {
      throw new Error('Email service not properly configured');
    }

    const resetUrl = `${
      process.env.FRONTEND_URL || 'http://localhost:3000'
    }/reset-password/${resetToken}`;

    const templateParams: EmailTemplateParams = {
      firstName,
      resetUrl,
      logoIconBase64: this.logoIconBase64,
    };

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'StuddyBuddy',
        address: process.env.EMAIL_FROM_ADDRESS || 'noreply@studdybuddy.com',
      },
      to: email,
      subject: '🔑 Reset Your StuddyBuddy Password',
      html: passwordResetEmailTemplate.html(templateParams),
      text: passwordResetEmailTemplate.text(templateParams),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

export const emailService = new EmailService();
