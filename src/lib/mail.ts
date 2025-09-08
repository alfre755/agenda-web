export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  // TODO: integra tu proveedor (Sendgrid, Resend, SES). Por ahora, log.
  console.log("[sendEmail]", { to, subject, text });
}


