import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma'; // Use singleton instance

// const prisma = new PrismaClient(); // Removed local instantiation


// Configure transporter
const port = parseInt(process.env.EMAIL_PORT || '587');
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: port,
  secure: port === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(email: string, type: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET') {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }

  // Save OTP to database
  try {
      console.log(`[OTP] Creating OTP entry for user ${user.id} (${email})`);
      await prisma.oTP.create({
        data: {
          email,
          code: otp,
          type,
          expiresAt,
          userId: user.id
        }
      });
      console.log(`[OTP] OTP stored in database for ${email}`);
  } catch (dbError) {
      console.error(`[OTP] Database error storing OTP for ${email}:`, dbError);
      throw new Error(`Failed to store OTP: ${dbError}`);
  }

  // Send email
  // Only skip if credentials are truly missing
  if (!process.env.EMAIL_HOST_USER || !process.env.EMAIL_PASSWORD) {
      console.warn(`[OTP] Email credentials missing. OTP for ${email} is: ${otp}`);
      return true; 
  }

  const mailOptions = {
    from: process.env.DEFAULT_FROM_EMAIL || '"NeuraSec" <noreply@neurasec.com>',
    to: email,
    subject: `${type === 'REGISTRATION' ? 'Verify your account' : 'Your OTP Code'} - NeuraSec`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">NeuraSec Verification</h2>
        <p>Hello ${user.username},</p>
        <p>Your One-Time Password (OTP) for ${type.toLowerCase().replace('_', ' ')} is:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Best regards,<br>The NeuraSec Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
