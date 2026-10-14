async function sendViaResend({ to, subject, html, text, replyTo, headers }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { ok: false, error: "RESEND_API_KEY manquant sur Vercel" };
  }

  const from =
    process.env.MAILBOX_FROM ||
    process.env.LEAD_FROM_EMAIL ||
    "Leads Opportunities <contact@leadsopportunities.fr>";

  const payload = {
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html: html || undefined,
    text: text || undefined,
    reply_to: replyTo || process.env.MAILBOX_REPLY_TO || undefined,
    headers: headers || undefined,
  };

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await r.text();
  if (!r.ok) {
    var friendly = body.slice(0, 500) || "Erreur Resend " + r.status;
    try {
      var errJson = JSON.parse(body);
      if (errJson && errJson.message) {
        friendly = String(errJson.message);
        if (/domain is not verified/i.test(friendly)) {
          friendly =
            "Domaine leadsopportunities.fr non verifie chez Resend. " +
            "Ajoutez le domaine sur https://resend.com/domains (DNS SPF/DKIM), " +
            "ou temporairement sur Vercel : MAILBOX_FROM=Leads Opportunities <onboarding@resend.dev>";
        }
      }
    } catch (parseErr) {
      /* keep raw */
    }
    return { ok: false, error: friendly };
  }
  let data = {};
  try {
    data = JSON.parse(body);
  } catch (e) {
    /* ignore */
  }
  return { ok: true, resendId: data.id };
}

module.exports = { sendViaResend };
