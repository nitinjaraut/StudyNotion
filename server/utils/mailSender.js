// const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Send email using Brevo (HTTP REST API)
 * - Uses HTTPS (Port 443) -> Works 100% on Render/Vercel (no SMTP port blocking)
 * - Sends to ANY email address (no custom domain required)
 */
const sendViaBrevo = async (email, title, body) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not defined in .env or dashboard");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Study Notion",
        email: process.env.MAIL_USER || "jarautnithin@gmail.com",
      },
      to: [{ email: email }],
      subject: title,
      htmlContent: body,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Brevo Error: ${data.message || JSON.stringify(data)}`);
  }

  console.log("Email sent successfully via Brevo API:", data);
  return data;
};

/*
// Nodemailer SMTP (Direct Gmail SMTP - Commented Out)
const sendViaNodemailer = async (email, title, body) => {
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  const info = await transporter.sendMail({
    from: `"Study Notion" <${process.env.MAIL_USER}>`,
    to: `${email}`,
    subject: `${title}`,
    html: `${body}`,
  });

  console.log("Email sent successfully via Nodemailer SMTP:", info.messageId);
  return info;
};
*/

/**
 * Main mailSender function powered by Brevo HTTP API
 */
const mailSender = async (email, title, body) => {
  try {
    return await sendViaBrevo(email, title, body);
  } catch (error) {
    console.error("mailSender error:", error.message);
    throw error;
  }
};

module.exports = mailSender;
