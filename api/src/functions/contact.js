const { app } = require("@azure/functions");
const nodemailer = require("nodemailer");

// Strip CR/LF to prevent email header injection through user provided fields.
const clean = (v) => String(v ?? "").replace(/[\r\n]+/g, " ").trim();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Server side length caps: keep generated emails sane and reject absurd
// payloads with a clean 400 instead of accepting them silently.
const LIMITS = {
    lastName: 100,
    firstName: 100,
    organization: 200,
    role: 200,
    email: 254,
    phonePrefix: 8,
    phone: 30,
    locale: 8,
    message: 5000,
};

// Naive in-memory rate limit (per instance, resets on cold start): above
// RATE_MAX submissions per IP per window the endpoint answers 429. Enough
// for this traffic level; the client already maps 429 to a dedicated message.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const hits = new Map(); // ip -> timestamps of recent submissions

function isRateLimited(ip) {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 1000) {
        for (const [k, v] of hits) {
            if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
        }
    }
    return recent.length > RATE_MAX;
}

app.http("contact", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: async (request, context) => {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        if (isRateLimited(ip)) {
            context.log(`contact: rate limited (${ip})`);
            return { status: 429, jsonBody: { ok: false, error: "rate_limited" } };
        }

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

        const fields = { lastName, firstName, organization, role, email, phonePrefix, phone, locale, message };
        const withinLimits = Object.entries(LIMITS).every(([f, max]) => fields[f].length <= max);

        if (!withinLimits || !lastName || !firstName || !organization || !message || !consent || !EMAIL_RE.test(email)) {
            return { status: 400, jsonBody: { ok: false, error: "invalid_fields" } };
        }

        const { SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;
        if (!SMTP_USER || !SMTP_PASS || !CONTACT_TO) {
            context.error("contact: missing SMTP_USER / SMTP_PASS / CONTACT_TO configuration");
            return { status: 500, jsonBody: { ok: false, error: "not_configured" } };
        }

        // SMTP_DEBUG=true logs the full SMTP dialogue to the console (flows to
        // Application Insights traces). NEVER enable in production: the dialogue
        // includes the AUTH exchange in base64, trivially decodable back to the
        // password. Dev and short lived QA debugging only.
        const smtpDebug = process.env.SMTP_DEBUG === "true";
        const transporter = nodemailer.createTransport({
            host: "mail.infomaniak.com",
            port: 587,
            secure: false, // STARTTLS is negotiated on port 587
            auth: { user: SMTP_USER, pass: SMTP_PASS },
            logger: smtpDebug,
            debug: smtpDebug,
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

        // The display name sits inside quotes in the Reply-To header: drop the
        // characters that could break out of the quoted string.
        const displayName = `${firstName} ${lastName}`.replace(/["<>]/g, "");

        let info;
        try {
            info = await transporter.sendMail({
                from: `"Wild Odyssey (formulaire)" <${SMTP_USER}>`,
                to: CONTACT_TO,
                replyTo: `"${displayName}" <${email}>`,
                subject: `Nouveau contact : ${firstName} ${lastName} (${organization})`,
                text: lines.join("\n"),
            });
        } catch (err) {
            context.error("contact: SMTP send failed", err);
            return { status: 500, jsonBody: { ok: false, error: "send_failed" } };
        }

        // info.response holds the server acceptance line (queue id), the proof
        // to hand to Infomaniak support if a message goes missing downstream.
        context.log(`contact: lead sent for ${email}, to=${CONTACT_TO}, server=${info.response}, id=${info.messageId}`);
        return { status: 200, jsonBody: { ok: true } };
    },
});
