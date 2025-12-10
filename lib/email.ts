/**
 * Service d'envoi d'emails
 * Pour la production, configurez Resend (https://resend.com) ou un autre service SMTP
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

import { logger } from "@/lib/sentry";

/**
 * Envoie un email de réinitialisation de mot de passe
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName?: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0px auto;
          padding: 20px;
        }
        .header {
          background-color: #f97316;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0px 0px;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0px 0px 8px 8px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #f97316;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Creasoka</h1>
        </div>
        <div class="content">
          <h2>Réinitialisation de votre mot de passe</h2>
          <p>Bonjour${userName ? " " + userName : ""},</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
          </div>
          <p>Ou copiez-collez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <strong>Ce lien expirera dans 1 heure.</strong><br>
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Creasoka. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Réinitialisation de votre mot de passe

Bonjour${userName ? " " + userName : ""},

Vous avez demandé à réinitialiser votre mot de passe.
Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :

${resetUrl}

Ce lien expirera dans 1 heure.
Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.

© ${new Date().getFullYear()} Creasoka. Tous droits réservés.
  `;

  return sendEmail({
    to: email,
    subject: "Réinitialisation de votre mot de passe - Creasoka",
    html,
    text,
  });
}

/**
 * Fonction générique d'envoi d'email
 *
 * EN DÉVELOPPEMENT : Les emails sont loggés dans la console
 * EN PRODUCTION : Configurez un service d'email (Resend, SendGrid, etc.)
 */
import { Resend } from 'resend';

// Initialisation conditionnelle pour éviter les erreurs si la clé manque
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    // En développement, on log l'email dans la console
    logger.info("\n" + "=".repeat(60));
    logger.info("📧 EMAIL ENVOYÉ (MODE DÉVELOPPEMENT)");
    logger.info("=".repeat(60));
    logger.info(`À: ${options.to}`);
    logger.info(`Sujet: ${options.subject}`);
    logger.info("\n--- CONTENU TEXTE ---");
    logger.info(options.text || "Pas de version texte");
    logger.info("\n--- CONTENU HTML ---");
    // logger.info(options.html); // Trop verbeux
    logger.info("(Contenu HTML masqué)");
    logger.info("=".repeat(60) + "\n");
    return true; // Toujours succès en dev
  }

  // EN PRODUCTION
  if (!resend) {
    logger.error("ERREUR: RESEND_API_KEY manquante. L'envoi d'email a échoué.");
    return false;
  }

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'CreaSoka <onboarding@resend.dev>', // Utilisez votre domaine vérifié en prod
      to: options.to, // En test gratuit Resend, seulement vers votre propre email (owner)
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (data.error) {
      logger.error("Resend API Error:", new Error(data.error.message || "Unknown error"));
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Erreur lors de l'envoi de l'email via Resend:", error);
    return false;
  }
}
