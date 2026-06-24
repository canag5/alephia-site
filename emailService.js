// emailService.js
// Envoi d'emails via Resend (https://resend.com).
// Pourquoi Resend : gratuit jusqu'à 3000 emails/mois, configuration en 5 minutes,
// pas besoin de gérer un serveur SMTP. Alternative possible : Sendgrid, Mailjet.
//
// SETUP (à faire une seule fois) :
// 1. Créer un compte sur https://resend.com (gratuit)
// 2. Récupérer une clé API (Dashboard > API Keys)
// 3. Vérifier ton domaine (alephia-stage.fr) dans Resend > Domains
//    (ou utiliser le domaine de test Resend en attendant, voir leur doc)
// 4. Coller la clé dans le fichier .env -> RESEND_API_KEY=re_xxxxxxxx
//
// Si RESEND_API_KEY n'est pas configurée, les emails sont juste affichés
// dans la console (mode "dry run") pour que tu puisses tester sans bloquer.

const { Resend } = require("resend");

const API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "Aléphia <onboarding@resend.dev>";
const resend = API_KEY ? new Resend(API_KEY) : null;

async function sendConfirmationEmail({ to, name, periodName, weekLabel, weekDates }) {
  const subject = `Inscription confirmée — Stage de ${periodName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1535;">
      <h2 style="color: #5046c8;">Inscription confirmée !</h2>
      <p>Bonjour ${name},</p>
      <p>Ton inscription au stage de mathématiques Aléphia est bien enregistrée. Voici le récapitulatif :</p>
      <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding:8px 0; color:#6b7280;">Période</td><td style="padding:8px 0; font-weight:bold;">${periodName}</td></tr>
        <tr><td style="padding:8px 0; color:#6b7280;">Semaine</td><td style="padding:8px 0; font-weight:bold;">${weekLabel} (${weekDates})</td></tr>
      </table>
      <p>Nous reviendrons vers toi rapidement avec les détails pratiques (lieu, horaires, matériel à prévoir).</p>
      <p>Une question ? Réponds simplement à cet email, ou contacte-nous :</p>
      <p>📧 can.ozogul@outlook.fr<br>📞 06 12 27 57 49</p>
      <p style="margin-top: 32px; color: #6b7280; font-size: 13px;">— L'équipe Aléphia</p>
    </div>
  `;

  if (!resend) {
    console.log("\n[EMAIL — mode test, pas de clé Resend configurée]");
    console.log("À :", to);
    console.log("Sujet :", subject);
    console.log("(configure RESEND_API_KEY dans .env pour un envoi réel)\n");
    return { simulated: true };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    return result;
  } catch (err) {
    console.error("Erreur envoi email :", err);
    throw err;
  }
}

module.exports = { sendConfirmationEmail };
