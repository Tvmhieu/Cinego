import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, body }) => {
  // Tạm thời tắt chức năng gửi mail theo yêu cầu
  console.log("Email sending is temporarily disabled.");
  console.log(`[Email Blocked] To: ${to}, Subject: ${subject}`);
  
  return true;
  
  /*
  const response = await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    html: body,
  });

  return response;
  */
};

export default sendEmail;
