// ============================================================================
// ISSUE WITH NODEMAILER (SMTP-based email sending):
// ============================================================================
// 1. RENDER FREE TIER: Render blocks/throttles outbound SMTP ports (25, 465, 587)
//    on free-tier instances. This causes Nodemailer to hang indefinitely when
//    trying to open a TCP connection to smtp.gmail.com, eventually timing out
//    with ETIMEDOUT / ECONNREFUSED errors.
//
// 2. VERCEL SERVERLESS: Vercel has a strict 10-second execution limit on
//    serverless functions (free plan). Nodemailer opens a raw TCP/TLS socket
//    which often takes 5-12 seconds, causing 504 FUNCTION_INVOCATION_TIMEOUT.
//
// 3. COLD START DELAYS: Render free tier sleeps after 15 min of inactivity.
//    Cold starts add 30-50 seconds, and combined with SMTP connection time,
//    emails almost never send successfully.
// ============================================================================
//
// ISSUE WITH RESEND (sandbox / onboarding@resend.dev):
// ============================================================================
// Resend's sandbox domain `onboarding@resend.dev` can ONLY send emails to the
// Resend account owner's email. It also has strict rate limits — the 1st email
// works but the 2nd fails. To remove this restriction, Resend requires a
// verified CUSTOM DOMAIN, which is extra hassle for a college project.
// ============================================================================
//
// SOLUTION: Switched to Brevo (formerly Sendinblue) HTTP API.
// - 300 free emails/day (no credit card required)
// - Just verify your Gmail address (no custom domain needed)
// - Sends via HTTPS POST (~200-400ms) — works on Render, Vercel, Railway, etc.
// - Can send FROM your verified Gmail TO any email address
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


// --------------- OLD RESEND CODE (COMMENTED OUT) ---------------
// Issue: Resend's sandbox (onboarding@resend.dev) only allows sending to the
// account owner's email and has strict rate limits. 1st email works, 2nd fails.
// Requires a verified custom domain to lift restrictions.
//
// const { Resend } = require('resend');
// require("dotenv").config();
//
// const resend = new Resend(process.env.RESEND_API_KEY);
//
// const mailSender = async (email, title, body) => {
//     try {
//         const { data, error } = await resend.emails.send({
//             from: `Study Notion <onboarding@resend.dev>`,
//             to: [email],
//             subject: title,
//             html: body,
//         });
//
//         if (error) {
//             console.error('Resend API error:', error);
//             throw new Error(error.message || 'Failed to send email via Resend');
//         }
//
//         console.log('Email sent successfully via Resend:', data);
//         return data;
//
//     } catch (error) {
//         console.log(error.message);
//         console.error('Error sending email:', error);
//         throw error;
//     }
// };
// --------------- END OF OLD RESEND CODE ---------------


// --------------- NEW BREVO CODE (HTTP API - works on all platforms) ---------------
// Brevo (formerly Sendinblue) — 300 free emails/day
// No custom domain needed — just verify your Gmail address on brevo.com
// Uses native fetch (Node 18+) — no extra npm package required
// -------------------------------------------------------------------------------
require("dotenv").config();

const mailSender = async (email, title, body) => {
    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: {
                    name: 'Study Notion',
                    email: process.env.MAIL_USER,  // Your verified Gmail address
                },
                to: [{ email: email }],
                subject: title,
                htmlContent: body,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Brevo API error:', data);
            throw new Error(data.message || `Brevo API error: ${response.status}`);
        }

        console.log('Email sent successfully via Brevo:', data);
        return data;

    } catch (error) {
        console.log(error.message);
        console.error('Error sending email:', error);
        throw error;
    }
};
// --------------- END OF NEW BREVO CODE ---------------

module.exports = mailSender;
