const nodemailer = require("nodemailer");
require("dotenv").config();

// Initialize Resend if key exists
let resend = null;
if (process.env.RESEND_API_KEY) {
  try {
    const { Resend } = require("resend");
    resend = new Resend(process.env.RESEND_API_KEY);
  } catch (e) {
    console.warn("Resend package not loaded:", e.message);
  }
}

/**
 * Send email using Nodemailer (Direct Gmail SMTP)
 * Best for: Localhost & servers where outbound port 465 is open.
 * Can send to ANY email address with no domain verification required.
 */
const sendViaNodemailer = async (email, title, body) => {
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
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

/**
 * Send email using Resend (HTTP API)
 * Note: Free sandbox (`onboarding@resend.dev`) can ONLY send to your registered email (e.g., jarautnithin@gmail.com).
 * Sending to other emails requires a verified custom domain on resend.com.
 */
const sendViaResend = async (email, title, body) => {
  if (!resend) throw new Error("Resend client is not initialized or RESEND_API_KEY missing");

  const response = await resend.emails.send({
    from: "Study Notion <onboarding@resend.dev>",
    to: [email],
    subject: title,
    html: body,
  });

  if (response.error) {
    throw new Error(`Resend Error: ${response.error.message || JSON.stringify(response.error)}`);
  }

  console.log("Email sent successfully via Resend API:", response.data);
  return response.data;
};

/**
 * Send email using Brevo (HTTP API)
 * Free 300 emails/day, can send to any email once your sender email is verified in Brevo.
 */
const sendViaBrevo = async (email, title, body) => {
  if (!process.env.BREVO_API_KEY) throw new Error("BREVO_API_KEY is not defined in .env");

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
        email: process.env.MAIL_USER,
      },
      to: [{ email: email }],
      subject: title,
      htmlContent: body,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Brevo Error: ${data.message || response.statusText}`);
  }

  console.log("Email sent successfully via Brevo API:", data);
  return data;
};

/**
 * Unified mailSender function with automatic smart fallback:
 * 1. Resend HTTP API (Fast, works 100% on Cloud/Render/Vercel without SMTP port blocking)
 * 2. Nodemailer SMTP (Gmail direct - works on localhost or wherever SMTP is open)
 * 3. Brevo HTTP API (Alternative HTTP provider if configured)
 */
const mailSender = async (email, title, body) => {
  try {
    // 1. Resend HTTP API (Preferred for Cloud/Vercel/Render - no port blocking)
    if (process.env.RESEND_API_KEY && resend) {
      try {
        return await sendViaResend(email, title, body);
      } catch (resendErr) {
        console.warn("Resend failed, attempting fallback to Nodemailer:", resendErr.message);
      }
    }

    // 2. Nodemailer SMTP (Gmail - backup or localhost)
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      try {
        return await sendViaNodemailer(email, title, body);
      } catch (nodemailerErr) {
        console.warn("Nodemailer SMTP failed:", nodemailerErr.message);
      }
    }

    // 3. Brevo HTTP API (Optional fallback)
    if (process.env.BREVO_API_KEY) {
      try {
        return await sendViaBrevo(email, title, body);
      } catch (brevoErr) {
        console.warn("Brevo failed:", brevoErr.message);
      }
    }

    throw new Error("No available email provider succeeded. Check your email credentials in .env");
  } catch (error) {
    console.error("mailSender error:", error.message);
    throw error;
  }
};

module.exports = mailSender;
