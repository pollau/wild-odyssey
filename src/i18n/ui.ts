// Les chaines des sections migrees vivent dans src/content/ui/*.json, pilotes
// par Keystatic : elles ne sont plus ecrites ici, seulement referencees, afin
// qu il n existe jamais deux sources pour un meme texte.
import statsUi from "../content/ui/stats.json";
import thematicsUi from "../content/ui/thematics.json";
import footerUi from "../content/ui/footer.json";
import sessionsUi from "../content/ui/sessions.json";
import reasonsUi from "../content/ui/reasons.json";

// Les JSON pilotes par Keystatic sont groupes par langue : on lit
// fichier[langue][cle]. Les deux niveaux peuvent manquer, Keystatic
// omettant les champs vides, d'ou les deux replis sur chaine vide.
const lang = (o: unknown, lg: string, k: string): string =>
  ((o as Record<string, Record<string, string>>)[lg] ?? {})[k] ?? "";


export const ui = {
  fr: {

    "thematics.badge": lang(thematicsUi, "fr", "badge"),
    "thematics.heading": lang(thematicsUi, "fr", "heading"),
    "thematics.body1": lang(thematicsUi, "fr", "body1"),
    "thematics.body2": lang(thematicsUi, "fr", "body2"),
    "thematics.body3": lang(thematicsUi, "fr", "body3"),
    "thematics.learnMore": lang(thematicsUi, "fr", "learnMore"),

    "sessions.heading": lang(sessionsUi, "fr", "heading"),
    "sessions.feat1": lang(sessionsUi, "fr", "feat1"),
    "sessions.feat2": lang(sessionsUi, "fr", "feat2"),
    "sessions.feat3": lang(sessionsUi, "fr", "feat3"),
    "sessions.feat4": lang(sessionsUi, "fr", "feat4"),
    "sessions.feat5": lang(sessionsUi, "fr", "feat5"),
    "sessions.feat6": lang(sessionsUi, "fr", "feat6"),
    "sessions.seeAll": lang(sessionsUi, "fr", "seeAll"),

    "badge.science": lang(statsUi, "fr", "badgeScience"),
    "stats.heading": lang(statsUi, "fr", "heading"),
    "stats.participants": lang(statsUi, "fr", "participants"),
    "stats.organizations": lang(statsUi, "fr", "organizations"),
    "stats.years": lang(statsUi, "fr", "years"),
    "reasons.heading": lang(reasonsUi, "fr", "heading"),
    "reasons.body1": lang(reasonsUi, "fr", "body1"),
    "reasons.body2": lang(reasonsUi, "fr", "body2"),

    "footer.heading": lang(footerUi, "fr", "heading"),
    "footer.ctaBody1": lang(footerUi, "fr", "ctaBody1"),
    "footer.ctaBody2": lang(footerUi, "fr", "ctaBody2"),
    "footer.ctaBtn": lang(footerUi, "fr", "ctaBtn"),
    "footer.copyright": lang(footerUi, "fr", "copyright"),

    "nav.events": "Événements",
    "nav.cta": "Nous contacter",

    "seo.home.title": "Team Building Durable & Ateliers Climat",
    "seo.home.description": "Expériences RSE & climat personnalisées pour vos équipes. Ateliers scientifiques sur l'empreinte carbone, la biodiversité et l'océan. En EN, FR, ES.",
    "seo.contact.title": "Contactez-nous pour une Expérience Sur Mesure",
    "seo.contact.description": "Une question ? Prêt à engager votre équipe dans une expérience personnalisée ? Contactez-nous & rejoignez l'odyssée ! Réponse rapide en EN, ES, FR.",

    "contact.title": "Tout commence par une conversation",
    "contact.subtitle": "Une idée qui germe, une question qui flotte, une envie de faire quelque chose de différent et sur mesure pour vos élèves ou vos équipes ?",
    "contact.lastName": "Nom",
    "contact.firstName": "Prénom",
    "contact.organization": "Votre organisation",
    "contact.role": "Votre rôle",
    "contact.email": "Email",
    "contact.phonePrefix": "Préfixe",
    "contact.phone": "Téléphone",
    "contact.message": "Partagez-nous vos idées, votre cap, là où vous souhaitez aller",
    "contact.consent": "J'accepte d'être recontacté·e et que mes données soient traitées dans ce but.",
    "contact.optional": "facultatif",
    "contact.submit": "Envoyer !",
    "contact.successTitle": "Message envoyé, merci !",
    "contact.successBody": "Message bien reçu, on file le transmettre à l'équipage !\nOn revient vers vous au plus vite pour tracer le cap :)",
    "contact.error": "Oups, l'envoi a échoué. Réessayez ou écrivez-nous directement.",
    "contact.error400": "Certaines informations semblent invalides. Vérifiez les champs et réessayez.",
    "contact.error429": "Trop de tentatives pour le moment. Patientez un instant puis réessayez.",
    "contact.error500": "Le service est momentanément indisponible. Réessayez dans quelques minutes.",
    "contact.errorNetwork": "Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.",
  },
  en: {

    "thematics.badge": lang(thematicsUi, "en", "badge"),
    "thematics.heading": lang(thematicsUi, "en", "heading"),
    "thematics.body1": lang(thematicsUi, "en", "body1"),
    "thematics.body2": lang(thematicsUi, "en", "body2"),
    "thematics.body3": lang(thematicsUi, "en", "body3"),
    "thematics.learnMore": lang(thematicsUi, "en", "learnMore"),

    "sessions.heading": lang(sessionsUi, "en", "heading"),
    "sessions.feat1": lang(sessionsUi, "en", "feat1"),
    "sessions.feat2": lang(sessionsUi, "en", "feat2"),
    "sessions.feat3": lang(sessionsUi, "en", "feat3"),
    "sessions.feat4": lang(sessionsUi, "en", "feat4"),
    "sessions.feat5": lang(sessionsUi, "en", "feat5"),
    "sessions.feat6": lang(sessionsUi, "en", "feat6"),
    "sessions.seeAll": lang(sessionsUi, "en", "seeAll"),

    "badge.science": lang(statsUi, "en", "badgeScience"),
    "stats.heading": lang(statsUi, "en", "heading"),
    "stats.participants": lang(statsUi, "en", "participants"),
    "stats.organizations": lang(statsUi, "en", "organizations"),
    "stats.years": lang(statsUi, "en", "years"),
    "reasons.heading": lang(reasonsUi, "en", "heading"),
    "reasons.body1": lang(reasonsUi, "en", "body1"),
    "reasons.body2": lang(reasonsUi, "en", "body2"),

    "footer.heading": lang(footerUi, "en", "heading"),
    "footer.ctaBody1": lang(footerUi, "en", "ctaBody1"),
    "footer.ctaBody2": lang(footerUi, "en", "ctaBody2"),
    "footer.ctaBtn": lang(footerUi, "en", "ctaBtn"),
    "footer.copyright": lang(footerUi, "en", "copyright"),

    "nav.events": "Events",
    "nav.cta": "Contact me",

    "seo.home.title": "Sustainability Team Building & Climate Workshops",
    "seo.home.description": "Personalized ESG & climate experiences your teams will remember. Science based workshops on carbon footprint, biodiversity, ocean & more. EN, FR, ES.",
    "seo.contact.title": "Get in Touch for a Personalised Experience",
    "seo.contact.description": "A question? Ready to engage your team in a personalized experience? Contact us & join the odyssey! Fast response in English, French & Spanish.",

    "contact.title": "It all starts with a conversation",
    "contact.subtitle": "A budding idea, a floating question, or a desire to create something different and tailor-made for your students or teams?",
    "contact.lastName": "Last name",
    "contact.firstName": "First name",
    "contact.organization": "Your organization",
    "contact.role": "Your role",
    "contact.email": "Email",
    "contact.phonePrefix": "Code",
    "contact.phone": "Phone",
    "contact.message": "Share your ideas, your course, where you want to go",
    "contact.consent": "I agree to be contacted and to my data being processed for this purpose.",
    "contact.optional": "optional",
    "contact.submit": "Send!",
    "contact.successTitle": "Message sent, thank you!",
    "contact.successBody": "Message received, we're passing it on to the crew!\nWe'll get back to you soon to set the course :)",
    "contact.error": "Oops, sending failed. Try again or email us directly.",
    "contact.error400": "Some of the information looks invalid. Check the fields and try again.",
    "contact.error429": "Too many attempts right now. Wait a moment and try again.",
    "contact.error500": "The service is temporarily unavailable. Try again in a few minutes.",
    "contact.errorNetwork": "We could not reach the server. Check your connection and try again.",
  },
  es: {

    "thematics.badge": lang(thematicsUi, "es", "badge"),
    "thematics.heading": lang(thematicsUi, "es", "heading"),
    "thematics.body1": lang(thematicsUi, "es", "body1"),
    "thematics.body2": lang(thematicsUi, "es", "body2"),
    "thematics.body3": lang(thematicsUi, "es", "body3"),
    "thematics.learnMore": lang(thematicsUi, "es", "learnMore"),

    "sessions.heading": lang(sessionsUi, "es", "heading"),
    "sessions.feat1": lang(sessionsUi, "es", "feat1"),
    "sessions.feat2": lang(sessionsUi, "es", "feat2"),
    "sessions.feat3": lang(sessionsUi, "es", "feat3"),
    "sessions.feat4": lang(sessionsUi, "es", "feat4"),
    "sessions.feat5": lang(sessionsUi, "es", "feat5"),
    "sessions.feat6": lang(sessionsUi, "es", "feat6"),
    "sessions.seeAll": lang(sessionsUi, "es", "seeAll"),

    "badge.science": lang(statsUi, "es", "badgeScience"),
    "stats.heading": lang(statsUi, "es", "heading"),
    "stats.participants": lang(statsUi, "es", "participants"),
    "stats.organizations": lang(statsUi, "es", "organizations"),
    "stats.years": lang(statsUi, "es", "years"),
    "reasons.heading": lang(reasonsUi, "es", "heading"),
    "reasons.body1": lang(reasonsUi, "es", "body1"),
    "reasons.body2": lang(reasonsUi, "es", "body2"),

    "footer.heading": lang(footerUi, "es", "heading"),
    "footer.ctaBody1": lang(footerUi, "es", "ctaBody1"),
    "footer.ctaBody2": lang(footerUi, "es", "ctaBody2"),
    "footer.ctaBtn": lang(footerUi, "es", "ctaBtn"),
    "footer.copyright": lang(footerUi, "es", "copyright"),

    "nav.events": "Eventos",
    "nav.cta": "Contacto",

    "seo.home.title": "Team Building Sostenible y Talleres de Clima",
    "seo.home.description": "Experiencias personalizadas de RSC y clima para tu equipo. Talleres científicos sobre huella de carbono, biodiversidad y océano. En EN, FR, ES.",
    "seo.contact.title": "Contacta con Nosotros para una Experiencia Personalizada",
    "seo.contact.description": "¿Una pregunta? ¿Listo para inspirar a tu equipo con una experiencia a medida? ¡Contáctanos y súmate a la odisea! Respuesta rápida en EN, ES, FR.",

    "contact.title": "Todo empieza con una conversación",
    "contact.subtitle": "¿Una idea en mente, una duda en el aire o las ganas de crear algo diferente y a medida para tus alumnos o equipos?",
    "contact.lastName": "Apellido",
    "contact.firstName": "Nombre",
    "contact.organization": "Tu organización",
    "contact.role": "Tu rol",
    "contact.email": "Email",
    "contact.phonePrefix": "Prefijo",
    "contact.phone": "Teléfono",
    "contact.message": "Comparte tus ideas, tu rumbo, a dónde quieres llegar",
    "contact.consent": "Acepto ser contactado·a y que mis datos se traten con este fin.",
    "contact.optional": "opcional",
    "contact.submit": "¡Enviar!",
    "contact.successTitle": "¡Mensaje enviado, gracias!",
    "contact.successBody": "¡Mensaje recibido, se lo pasamos a la tripulación!\nVolvemos pronto para marcar el rumbo :)",
    "contact.error": "Vaya, el envío falló. Inténtalo de nuevo o escríbenos directamente.",
    "contact.error400": "Algunos datos parecen no ser válidos. Revisa los campos y vuelve a intentarlo.",
    "contact.error429": "Demasiados intentos por ahora. Espera un momento y vuelve a intentarlo.",
    "contact.error500": "El servicio no está disponible temporalmente. Vuelve a intentarlo en unos minutos.",
    "contact.errorNetwork": "No se pudo conectar con el servidor. Comprueba tu conexión y vuelve a intentarlo.",
  },
} as const;

export type Lang = keyof typeof ui;
export type UiKey = keyof typeof ui.fr;

export function t(lang: string, key: UiKey): string {
  const l = lang as Lang;
  return (ui[l]?.[key] ?? ui.fr[key]) as string;
}
