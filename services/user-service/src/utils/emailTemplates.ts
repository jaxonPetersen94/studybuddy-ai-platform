export interface EmailTemplateParams {
  firstName: string;
  email?: string;
  resetUrl?: string;
  logoIconBase64: string;
}

export const passwordResetEmailTemplate = {
  html: (params: EmailTemplateParams) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your StudyBuddy Password</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family:'JetBrains Mono', monospace; background:#f0f4f8; color:#cbd5e1; }
    </style>
  </head>
  <body style="padding:24px; background:#f0f4f8; min-height:100vh;">

    <!-- Container -->
    <div style="max-width:640px; margin:0 auto; border-radius:12px; overflow:hidden; box-shadow:0 0 40px rgba(0,0,0,0.05);">

      <!-- Header -->
      <div style="position:relative; text-align:center; padding:40px 24px; background:#243042;">
        <div style="position:relative; z-index:1;">
          <div style="position:relative; width:64px; height:64px; margin:0 auto 16px; display:flex; align-items:center; justify-content:center; border:2px solid rgba(34,211,238,0.3); border-radius:12px; overflow:hidden; background:#1e293b;">
            <!-- Gradient overlay -->
            <div style="position:absolute; inset:0; background:linear-gradient(90deg, #22d3ee, #a78bfa); filter:blur(6px); opacity:0.25;"></div>
            <!-- Logo/Icon -->
            <img src="${params.logoIconBase64}" alt="StudyBuddy Logo" style="width:32px; height:32px; position:relative;" />
          </div>
          <h1 style="font-size:28px; font-weight:700; color:#ffffff;">StudyBuddy AI</h1>
          <p style="font-size:13px; color:#94a3b8;">// Intelligent Learning Platform</p>
        </div>
      </div>

      <!-- Content -->
      <div style="padding:40px 32px; background:#1e293b; color:#cbd5e1;">

        <h2 style="font-size:22px; font-weight:600; color:#22d3ee; text-align:center; margin-bottom:20px;">Hello ${params.firstName},</h2>

        <p style="font-size:15px; line-height:1.6; text-align:center; margin-bottom:20px;">
          We received a request to reset your password for your <span style="color:#22d3ee; font-weight:600;">StudyBuddy AI</span> account.
        </p>

        <p style="font-size:15px; line-height:1.6; text-align:center; margin-bottom:32px;">
          If you made this request, click the button below to create a new password. If not, you can safely ignore this email.
        </p>

        <!-- CTA -->
        <div style="text-align:center; margin:40px 0;">
          <a href="${params.resetUrl}"
            style="display:inline-block; background:#22d3ee; color:#0f172a; padding:14px 32px; border-radius:8px; font-weight:600; font-size:15px; text-decoration:none; box-shadow:0 0 20px rgba(34,211,238,0.3);">
            Reset My Password
          </a>
        </div>

        <!-- Code Fallback -->
        <div style="background:#243042; border:1px solid #334155; border-radius:8px; padding:20px; margin:32px 0;">
          <p style="font-size:13px; color:#94a3b8; margin-bottom:12px;">Button not working? Copy & paste this into your browser:</p>
          <pre style="background:#334155; padding:12px; border-radius:6px; color:#22d3ee; font-size:13px; overflow-x:auto;">${params.resetUrl}</pre>
        </div>

        <!-- Expiry Notice -->
        <div style="background:rgba(34,211,238,0.1); border:1px solid rgba(34,211,238,0.4); border-radius:8px; padding:16px; text-align:center; margin:24px 0;">
          <p style="color:#22d3ee; font-size:13px;">Security Notice: This link expires in 1 hour</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#243042; padding:24px; text-align:center; border-top:1px solid #334155;">
        <p style="font-size:13px; color:#94a3b8; margin-bottom:12px;">
          Didn’t request this reset? Just ignore this email.
        </p>
        <p style="font-size:13px; color:#22d3ee; font-weight:600;">— The StudyBuddy AI Team</p>
      </div>
    </div>

    <div style="text-align:center; margin-top:20px;">
      <p style="color:#475569; font-size:11px;">StudyBuddy AI • Learning Companion</p>
    </div>
  </body>
  </html>
  `,

  text: (params: EmailTemplateParams) => `
🔑 Reset Your StudyBuddy Password

Hello ${params.firstName},

We received a request to reset your password for your StudyBuddy AI account.

If you made this request, click below to create a new password:
${params.resetUrl}

If not, just ignore this email.

Security Notice: This link expires in 1 hour.

Best,
The StudyBuddy AI Team
// Intelligent Learning Platform
  `,
};
