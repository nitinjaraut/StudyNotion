// ============================================================================
// ISSUE WITH NODEMAILER (SMTP-based email sending):
// ============================================================================
// 1. RENDER FREE TIER: Render blocks outbound SMTP ports (25, 465, 587) on
//    free-tier instances to prevent spam. This causes Nodemailer to hang
//    indefinitely when trying to open a TCP connection to smtp.gmail.com,
//    eventually timing out with ETIMEDOUT / ECONNREFUSED errors.
//
// 2. VERCEL SERVERLESS: Vercel has a strict 10-second execution limit on
//    serverless functions (free plan). Nodemailer opens a raw TCP/TLS socket
//    to the SMTP server, which often takes 5-12 seconds just for the
//    handshake + authentication. This causes 504 FUNCTION_INVOCATION_TIMEOUT
//    errors before the email is even sent.
//
// 3. COLD START DELAYS: On platforms like Render (free tier), the server
//    sleeps after 15 minutes of inactivity. Cold starts add 30-50 seconds,
//    and combined with SMTP connection time, emails almost never send
//    successfully.
//
// SOLUTION: Switched to Resend — an HTTP API-based email service.
// Resend sends emails via a simple HTTPS POST request (~200-400ms),
// which works reliably on ALL hosting platforms (Vercel, Render, Railway,
// Koyeb, etc.) without any port restrictions or timeout issues.
// ============================================================================

// --------------- OLD NODEMAILER CODE (COMMENTED OUT) ---------------
// const nodemailer = require('nodemailer');
// require("dotenv").config()
//
// const mailSender = async (email,title,body) => {
//     try {
//         let transporter = nodemailer.createTransport({
//             host: process.env.MAIL_HOST,
//             port: 465,
//             secure: true,
//             auth: {
//                 user: process.env.MAIL_USER,
//                 pass: process.env.MAIL_PASS,
//             },
//         });
//
//         // send mail with defined transport object
//         let info = await transporter.sendMail({
//             from: `"Study Notion" <${process.env.MAIL_USER}>`, // sender address
//             to: `${email}`, // list of receivers
//             subject: `${title}`,
//             html: `${body}`, // html content as it is formatted into user mail
//         });
//
//         console.log('Message sent: ', info);
//         return info;
//
//     }
//     catch (error) {
//         console.log(error.message);
//         console.error('Error sending email:', error);
//         throw error;
//     }
// }
// --------------- END OF OLD NODEMAILER CODE ---------------


// --------------- NEW RESEND CODE (HTTP API - works on all platforms) ---------------
const { Resend } = require('resend');
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

const mailSender = async (email, title, body) => {
    try {
        // Resend sends email via HTTPS POST — no SMTP ports needed
        // Completes in ~200-400ms, well within Vercel's 10s limit
        const { data, error } = await resend.emails.send({
            from: `Study Notion <onboarding@resend.dev>`,  // Use your verified domain in production
            to: [email],
            subject: title,
            html: body,
        });

        if (error) {
            console.error('Resend API error:', error);
            throw new Error(error.message || 'Failed to send email via Resend');
        }

        console.log('Email sent successfully via Resend:', data);
        return data;

    } catch (error) {
        console.log(error.message);
        console.error('Error sending email:', error);
        throw error;
    }
};
// --------------- END OF NEW RESEND CODE ---------------

module.exports = mailSender;
