const nodemailer = require('nodemailer');

function getMailerConfig() {
  const port = Number(process.env.SMTP_PORT || 587);
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    },
    from
  };
}

function createTransporter() {
  const config = getMailerConfig();
  if (!config) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth
  });
}

async function sendOnboardingEmail({ name, email, password, role }) {
  const config = getMailerConfig();
  const transporter = createTransporter();

  if (!config || !transporter) {
    return {
      sent: false,
      reason: 'SMTP is not configured'
    };
  }

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: `Your ${role || 'Developer'} account for Abhee Management`,
    text: [
      `Hello ${name},`,
      '',
      'Your account has been created for Abhee Management.',
      '',
      `Role: ${role || 'Developer'}`,
      `Email: ${email}`,
      `Temporary password: ${password}`,
      '',
      'Please sign in and change your password after your first login.',
      '',
      'Regards,',
      'Abhee Management'
    ].join('\n')
  });

  return { sent: true };
}

module.exports = {
  sendOnboardingEmail
};
