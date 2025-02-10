export const resetPasswordEmail = (resetUrl) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}" 
       style="display: inline-block; padding: 10px 20px; background-color: #5865f2; color: white; text-decoration: none; border-radius: 5px;">
       Reset Password
    </a>
    <p style="margin-top: 20px; color: #666;">
      This link will expire in 1 hour. If you didn't request this, please ignore this email.
    </p>
  </div>
`;