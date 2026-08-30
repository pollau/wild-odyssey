// Les chaines des sections migrees vivent dans src/content/ui/*.json, pilotes
// par Keystatic : elles ne sont plus ecrites ici, seulement referencees, afin
// qu il n existe jamais deux sources pour un meme texte.
import statsUi from "../content/ui/stats.json";
import workshopsUi from "../content/ui/workshops.json";
import footerUi from "../content/ui/footer.json";
import formatsUi from "../content/ui/formats.json";
import reasonsUi from "../content/ui/reasons.json";

// Les JSON pilotes par Keystatic sont groupes par langue : on lit
// fichier[langue][cle]. Les deux niveaux peuvent manquer, Keystatic
// omettant les champs vides, d'ou les deux replis sur chaine vide.
const lang = (o: unknown, lg: string, k: string): string =>
  ((o as Record<string, Record<string, string>>)[lg] ?? {})[k] ?? "";


export const ui = {
  fr: {

    "workshops.badge": lang(workshopsUi, "fr", "badge"),
    "workshops.heading": lang(workshopsUi, "fr", "heading"),
    "workshops.body1": lang(workshopsUi, "fr", "body1"),
    "workshops.body2": lang(workshopsUi, "fr", "body2"),
    "workshops.body3": lang(workshopsUi, "fr", "body3"),
    "workshops.learnMore": lang(workshopsUi, "fr", "learnMore"),

    "formats.heading": lang(formatsUi, "fr", "heading"),
    "formats.feat1": lang(formatsUi, "fr", "feat1"),
    "formats.feat2": lang(formatsUi, "fr", "feat2"),
    "formats.feat3": lang(formatsUi, "fr", "feat3"),
    "formats.feat4": lang(formatsUi, "fr", "feat4"),
    "formats.feat5": lang(formatsUi, "fr", "feat5"),
    "formats.feat6": lang(formatsUi, "fr", "feat6"),
    "formats.seeAll": lang(formatsUi, "fr", "seeAll"),

    "badge.science": lang(statsUi, "fr", "badgeScience"),
    "stats.heading": lang(statsUi, "fr", "heading"),
    "stats.participants": lang(statsUi, "fr", "participants"),
    "stats.organizations": lang(statsUi, "fr", "organizations"),
    "stats.years": lang(statsUi, "fr", "years"),
    "reasons.heading": lang(reasonsUi, "fr", "heading"),
    "reasons.body1": "Pour les DRH qui ont besoin d'engagement. Pour les responsables RSE qui ont besoin d'adhésion. Pour la direction qui doit justifier le budget. Et pour toutes les personnes dans la salle qui veulent faire partie de la solution.",
    "reasons.body2": "Une expérience durable scientifique, 6 raisons de dire oui : facile à justifier, impossible à oublier.",
    "reasons.r1.title": lang(reasonsUi, "fr", "r1"),
    "reasons.r1.text": "Du stagiaire au directeur : même expérience, même langage, même vision systémique des enjeux. Pas parce qu'ils y étaient obligés ; parce qu'ils ont vécu la même chose.",
    "reasons.r2.title": lang(reasonsUi, "fr", "r2"),
    "reasons.r2.text": "Nous ne donnons pas de leçon. Nous faisons ressentir les enjeux par la science, les récits et une expérience qui dure dans le temps.",
    "reasons.r3.title": lang(reasonsUi, "fr", "r3"),
    "reasons.r3.text": "70 % de la Gen Z et des Millennials considèrent la durabilité dans le choix de leur employeur (Deloitte, 2023). Donnez-leur une raison de vous choisir et de rester.",
    "reasons.r4.title": lang(reasonsUi, "fr", "r4"),
    "reasons.r4.text": "Chaque session se termine par des étapes concrètes choisies par l'équipe. C'est la différence entre un atelier et un cap.",
    "reasons.r5.title": lang(reasonsUi, "fr", "r5"),
    "reasons.r5.text": "De la prise de parole à la pensée systémique, vos collaborateurs acquièrent de vraies compétences. Et pour ceux qui veulent aller plus loin : une formation spécifique pour devenir facilitateurs certifiés. L'impact ne s'arrête pas à la porte, il se propage de l'intérieur.",
    "reasons.r6.title": lang(reasonsUi, "fr", "r6"),
    "reasons.r6.text": "Obtenir ou conserver vos labels EcoVadis, B Corp, ISO 14001, GSTC… ces référentiels valorisent la sensibilisation interne et l'engagement des équipes, et la CSRD demande de le documenter. Nos ateliers vous en fournissent une preuve concrète et traçable.",

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

    "workshops.badge": lang(workshopsUi, "en", "badge"),
    "workshops.heading": lang(workshopsUi, "en", "heading"),
    "workshops.body1": lang(workshopsUi, "en", "body1"),
    "workshops.body2": lang(workshopsUi, "en", "body2"),
    "workshops.body3": lang(workshopsUi, "en", "body3"),
    "workshops.learnMore": lang(workshopsUi, "en", "learnMore"),

    "formats.heading": lang(formatsUi, "en", "heading"),
    "formats.feat1": lang(formatsUi, "en", "feat1"),
    "formats.feat2": lang(formatsUi, "en", "feat2"),
    "formats.feat3": lang(formatsUi, "en", "feat3"),
    "formats.feat4": lang(formatsUi, "en", "feat4"),
    "formats.feat5": lang(formatsUi, "en", "feat5"),
    "formats.feat6": lang(formatsUi, "en", "feat6"),
    "formats.seeAll": lang(formatsUi, "en", "seeAll"),

    "badge.science": lang(statsUi, "en", "badgeScience"),
    "stats.heading": lang(statsUi, "en", "heading"),
    "stats.participants": lang(statsUi, "en", "participants"),
    "stats.organizations": lang(statsUi, "en", "organizations"),
    "stats.years": lang(statsUi, "en", "years"),
    "reasons.heading": lang(reasonsUi, "en", "heading"),
    "reasons.body1": "For HR managers who need engagement. For CSR officers who need buy-in. For the board who needs to justify the budget. And for everyone in the room who wants to feel part of the solution.",
    "reasons.body2": "One science-based sustainability experience, 6 reasons to say yes: easy to justify, impossible to forget.",
    "reasons.r1.title": lang(reasonsUi, "en", "r1"),
    "reasons.r1.text": "From the intern to the director: same experience, same language, same systemic vision of what's at stake. Not because they had to, but because they lived the same team building experience.",
    "reasons.r2.title": lang(reasonsUi, "en", "r2"),
    "reasons.r2.text": "We don't lecture. We make people feel the stakes through science, stories, and an experience that stays with them long after the day is over.",
    "reasons.r3.title": lang(reasonsUi, "en", "r3"),
    "reasons.r3.text": "70% of Gen Z and Millennials consider sustainability when choosing an employer (Deloitte, 2023). Give them a reason to choose you & stay.",
    "reasons.r4.title": lang(reasonsUi, "en", "r4"),
    "reasons.r4.text": "Every session ends with concrete next steps: chosen by the team. That's the difference between a workshop and a turning point.",
    "reasons.r5.title": lang(reasonsUi, "en", "r5"),
    "reasons.r5.text": "From public speaking to systemic thinking, your people gain real skills. And for those who want to go further: a specific training to become certified facilitators. The impact doesn't stop at the door, it spreads from within.",
    "reasons.r6.title": lang(reasonsUi, "en", "r6"),
    "reasons.r6.text": "Earn or keep your labels\nEcoVadis, B Corp, ISO 14001, GSTC reward proof of internal awareness and team engagement. Our workshops give you a concrete, traceable record to back it up.",

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

    "workshops.badge": lang(workshopsUi, "es", "badge"),
    "workshops.heading": lang(workshopsUi, "es", "heading"),
    "workshops.body1": lang(workshopsUi, "es", "body1"),
    "workshops.body2": lang(workshopsUi, "es", "body2"),
    "workshops.body3": lang(workshopsUi, "es", "body3"),
    "workshops.learnMore": lang(workshopsUi, "es", "learnMore"),

    "formats.heading": lang(formatsUi, "es", "heading"),
    "formats.feat1": lang(formatsUi, "es", "feat1"),
    "formats.feat2": lang(formatsUi, "es", "feat2"),
    "formats.feat3": lang(formatsUi, "es", "feat3"),
    "formats.feat4": lang(formatsUi, "es", "feat4"),
    "formats.feat5": lang(formatsUi, "es", "feat5"),
    "formats.feat6": lang(formatsUi, "es", "feat6"),
    "formats.seeAll": lang(formatsUi, "es", "seeAll"),

    "badge.science": lang(statsUi, "es", "badgeScience"),
    "stats.heading": lang(statsUi, "es", "heading"),
    "stats.participants": lang(statsUi, "es", "participants"),
    "stats.organizations": lang(statsUi, "es", "organizations"),
    "stats.years": lang(statsUi, "es", "years"),
    "reasons.heading": lang(reasonsUi, "es", "heading"),
    "reasons.body1": "Para los responsables de RRHH que necesitan compromiso. Para los directores de RSE que necesitan apoyo. Para la dirección que debe justificar el presupuesto. Y para todas las personas en la sala que quieren ser parte de la solución.",
    "reasons.body2": "Una experiencia de sostenibilidad basada en ciencia, 6 razones para decir sí: fácil de justificar, imposible de olvidar.",
    "reasons.r1.title": lang(reasonsUi, "es", "r1"),
    "reasons.r1.text": "Del becario al director: misma experiencia, mismo lenguaje, misma visión sistémica de lo que está en juego. No porque tuvieran que hacerlo, sino porque vivieron la misma experiencia de team building.",
    "reasons.r2.title": lang(reasonsUi, "es", "r2"),
    "reasons.r2.text": "No damos charlas. Hacemos sentir los riesgos a través de la ciencia, las historias y una experiencia que dura en el tiempo.",
    "reasons.r3.title": lang(reasonsUi, "es", "r3"),
    "reasons.r3.text": "El 70% de la Gen Z y los Millennials consideran la sostenibilidad al elegir empleador (Deloitte, 2023). Dales una razón para elegirte y quedarse.",
    "reasons.r4.title": lang(reasonsUi, "es", "r4"),
    "reasons.r4.text": "Cada sesión termina con pasos concretos elegidos por el equipo. Esa es la diferencia entre un taller y un punto de inflexión.",
    "reasons.r5.title": lang(reasonsUi, "es", "r5"),
    "reasons.r5.text": "De la comunicación al pensamiento sistémico, tus colaboradores adquieren competencias reales. Y para quienes quieran ir más lejos: una formación específica para convertirse en facilitadores certificados. El impacto no se detiene en la puerta, se propaga desde adentro.",
    "reasons.r6.title": lang(reasonsUi, "es", "r6"),
    "reasons.r6.text": "EcoVadis, B Corp, ISO 14001, GSTC… estos referentes valoran la sensibilización interna y el compromiso de los equipos, y la CSRD exige documentarlo. Nuestros talleres les proporcionan una prueba concreta y trazable (asistencia, temática, formato) para añadir a su expediente.",

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
