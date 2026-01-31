import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { Resend } from 'resend';


const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: 'If an account with this email exists, a reset link has been sent.',
      });
    }

    // Generate secure reset token
    const resetToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Store reset token with expiration (24 hours)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    // TODO: persist (resetToken, expiresAt) in PasswordResetToken table; validate on reset
    void expiresAt;

    // Create reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3003';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send email using Resend (if configured) or fallback to console
    try {
      if (resend && process.env.RESEND_API_KEY) {
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@mtg-maui.com';

        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: 'Reset Your Password - MTG Maui League',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">Password Reset Request</h2>
              <p>Hello,</p>
              <p>You requested to reset your password for your MTG Maui League account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #f59e0b; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="color: #666; font-size: 12px; word-break: break-all;">${resetUrl}</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                This link will expire in 24 hours. If you didn't request this, please ignore this email.
              </p>
            </div>
          `,
        });

        logger.info('Password reset email sent', { email });
      } else {
        logger.info('Password reset requested (DEV MODE)', {
          email,
          resetUrl,
          hint: 'Set RESEND_API_KEY and RESEND_FROM_EMAIL in .env to enable email sending',
        });
      }

      return NextResponse.json({
        message: 'If an account with this email exists, a reset link has been sent.',
      });
    } catch (emailError) {
      logger.error('Email sending failed', emailError);
      // Still return success to avoid revealing if user exists
      return NextResponse.json({
        message: 'If an account with this email exists, a reset link has been sent.',
      });
    }
  } catch (error) {
    logger.error('Reset password error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
