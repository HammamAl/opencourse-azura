import sgMail from "@sendgrid/mail";

export async function sendMagicLink(email: string, resetToken: string) {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const msg = {
      to: email,
      from: "me@widzzz.com",
      subject: "[THIS IS A TEST MAIL] Reset Your Password - Magic Link",
      text: `Click the following link to reset your password: ${resetUrl}
      
This link will expire in 10 minutes for security reasons.

If you didn't request a password reset, please ignore this email.`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; color: #2563eb;">Password Reset Request</h1>
          </div>
          
          <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hello,
            </p>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 15px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 14px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; margin-bottom: 25px;">
              ${resetUrl}
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
                ⏰ <strong>Important:</strong> This link will expire in 10 minutes for security reasons.
              </p>
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
                If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
            <p style="margin: 0;">
              This email was sent from a secure system. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log("Magic link sent successfully to:", email);
    return { success: true };
  } catch (error) {
    console.error("Error sending magic link:", error);
    return { success: false, error };
  }
}
