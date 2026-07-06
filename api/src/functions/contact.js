const { app } = require("@azure/functions");
const nodemailer = require("nodemailer");

// Strip CR/LF to prevent email header injection through user provided fields.
const clean = (v) => String(v ?? "").replace(/[\r\n]+/g, " ").trim();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.http("contact", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: async (request, context) => {
        let body;
        try {
            body = await request.json();
        } catch {
            return { status: 400, jsonBody: { ok: false, error: "invalid_json" } };
        }

        // Honeypot: pretend success for bots, send nothing.
        if (body.hp_check) {
            context.log("contact: honeypot triggered, dropping silently");
            return { status: 200, jsonBody: { ok: true } };
        }

        const lastName = clean(body.lastName);
        const firstName = clean(body.firstName);
        const organization = clean(body.organization);
        const role = clean(body.role);
        const email = clean(body.email);
        const phonePrefix = clean(body.phonePrefix);
        const phone = clean(body.phone);
        const locale = clean(body.locale);
        const message = String(body.message ?? "").trim();
        const consent = body.consent === "on" || body.consent === true;

        if (!lastName || !firstName || !organization || !message || !consent || !EMAIL_RE.test(email)) {
            return { status: 400, jsonBody: { ok: false, error: "invalid_fields" } };
        }

        const { SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;
        if (!SMTP_USER || !SMTP_PASS || !CONTACT_TO) {
            context.error("contact: missing SMTP_USER / SMTP_PASS / CONTACT_TO configuration");
            return { status: 500, jsonBody: { ok: false, error: "not_configured" } };
        }

        const transporter = nodemailer.createTransport({
            host: "mail.infomaniak.com",
            port: 587,
            secure: false, // STARTTLS is negotiated on port 587
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        const lines = [
            `Nom : ${lastName}`,
            `Prénom : ${firstName}`,
            `Organisation : ${organization}`,
            `Rôle : ${role || "(non renseigné)"}`,
            `Email : ${email}`,
            `Téléphone : ${phone ? `${phonePrefix} ${phone}` : "(non renseigné)"}`,
            `Langue du site : ${locale || "fr"}`,
            "",
            "Message :",
            message,
        ];

        try {
            await transporter.sendMail({
                from: `"Wild Odyssey (formulaire)" <${SMTP_USER}>`,
                to: CONTACT_TO,
                replyTo: `"${firstName} ${lastName}" <${email}>`,
                subject: `Nouveau contact : ${firstName} ${lastName} (${organization})`,
                text: lines.join("\n"),
            });
        } catch (err) {
            context.error("contact: SMTP send failed", err);
            return { status: 500, jsonBody: { ok: false, error: "send_failed" } };
        }

        context.log(`contact: lead sent for ${email}`);
        return { status: 200, jsonBody: { ok: true } };
    },
});
