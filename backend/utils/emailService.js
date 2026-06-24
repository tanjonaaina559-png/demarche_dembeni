const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER || 'user',
    pass: process.env.EMAIL_PASS || 'pass'
  }
});

exports.sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: 'Mairie de Dembéni <noreply@dembeni.fr>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`
    };

    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('EMAIL SIMULATOR:');
      console.log(`To: ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Message: ${options.message}`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
  }
};
