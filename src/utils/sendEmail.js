const nodeMailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: "mail.teamrabbil.com",
      port: 25,
      secure: false,
      auth: {
        user: "info@teamrabbil.com",
        pass: "~sR4[bhaC[Qs",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    let mailOptions = {
      from: "Task Manager <info@teamrabbil.com>",
      to: to,
      subject: subject,
      text: text,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendEmail;
