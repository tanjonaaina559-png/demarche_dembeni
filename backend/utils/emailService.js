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

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to: ${options.email}`);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};
