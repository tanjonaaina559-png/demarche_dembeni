const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 465,
  secure: process.env.EMAIL_PORT == 465, // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendEmail = async (options) => {
  try {
    console.log(`[Email Service] Préparation des options d'e-mail pour: ${options.email}`);
    const mailOptions = {
      from: 'Mairie de Dembéni <noreply@dembeni.fr>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`
    };

    console.log(`[Email Service] Appel de transporter.sendMail()...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Succès! L'e-mail a été envoyé à: ${options.email}`);
    console.log(`[Email Service] Réponse de Gmail: ${info.response}`);
  } catch (error) {
    console.error(`[Email Service] ERREUR SMTP CRITIQUE lors de l'envoi:`, error);
    throw error;
  }
};
