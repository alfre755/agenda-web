import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
// Para desarrollo, usa un remitente válido de Resend si no tienes dominio verificado
// https://resend.com/docs/send-with-nodejs
const from = process.env.RESEND_FROM || "onboarding@resend.dev";

export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text?: string; html?: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurada. Fallback a console.log");
    console.log("[sendEmail]", { to, subject, text, html });
    return;
  }
  try {
    const resp = await resend.emails.send({ from, to, subject, text, html });
    if ((resp as any)?.error) {
      console.error("[sendEmail] Resend error:", (resp as any).error);
    } else {
      console.log("[sendEmail] Resend queued:", resp);
    }
  } catch (err) {
    console.error("[sendEmail] Exception:", err);
  }
}


