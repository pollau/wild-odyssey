// Les chaines des sections migrees vivent dans src/content/ui/*.json, pilotes
// par Keystatic : elles ne sont plus ecrites ici, seulement referencees, afin
// qu il n existe jamais deux sources pour un meme texte.
import statsUi from "../content/ui/stats.json";
import thematicsUi from "../content/ui/thematics.json";
import footerUi from "../content/ui/footer.json";
import seoUi from "../content/ui/seo.json";
import contactUi from "../content/ui/contact.json";
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
    "thematics.body": lang(thematicsUi, "fr", "body"),
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
    "reasons.body": lang(reasonsUi, "fr", "body"),

    "footer.heading": lang(footerUi, "fr", "heading"),
    "footer.ctaBody": lang(footerUi, "fr", "ctaBody"),
    "footer.ctaBtn": lang(footerUi, "fr", "ctaBtn"),
    "footer.copyright": lang(footerUi, "fr", "copyright"),

    "nav.cta": lang(footerUi, "fr", "headerCta"),

    "seo.home.title": lang(seoUi, "fr", "homeTitle"),
    "seo.home.description": lang(seoUi, "fr", "homeDescription"),
    "seo.contact.title": lang(seoUi, "fr", "contactTitle"),
    "seo.contact.description": lang(seoUi, "fr", "contactDescription"),

    "contact.title": lang(contactUi, "fr", "title"),
    "contact.subtitle": lang(contactUi, "fr", "subtitle"),
    "contact.lastName": lang(contactUi, "fr", "lastName"),
    "contact.firstName": lang(contactUi, "fr", "firstName"),
    "contact.organization": lang(contactUi, "fr", "organization"),
    "contact.role": lang(contactUi, "fr", "role"),
    "contact.email": lang(contactUi, "fr", "email"),
    "contact.phonePrefix": "Préfixe",
    "contact.phone": lang(contactUi, "fr", "phone"),
    "contact.message": lang(contactUi, "fr", "message"),
    "contact.consent": lang(contactUi, "fr", "consent"),
    "contact.optional": lang(contactUi, "fr", "optional"),
    "contact.submit": lang(contactUi, "fr", "submit"),
    "contact.successTitle": lang(contactUi, "fr", "successTitle"),
    "contact.successBody": lang(contactUi, "fr", "successBody"),
    "contact.error": lang(contactUi, "fr", "error"),
    "contact.error400": lang(contactUi, "fr", "error400"),
    "contact.error429": lang(contactUi, "fr", "error429"),
    "contact.error500": lang(contactUi, "fr", "error500"),
    "contact.errorNetwork": lang(contactUi, "fr", "errorNetwork"),
  },
  en: {

    "thematics.badge": lang(thematicsUi, "en", "badge"),
    "thematics.heading": lang(thematicsUi, "en", "heading"),
    "thematics.body": lang(thematicsUi, "en", "body"),
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
    "reasons.body": lang(reasonsUi, "en", "body"),

    "footer.heading": lang(footerUi, "en", "heading"),
    "footer.ctaBody": lang(footerUi, "en", "ctaBody"),
    "footer.ctaBtn": lang(footerUi, "en", "ctaBtn"),
    "footer.copyright": lang(footerUi, "en", "copyright"),

    "nav.cta": lang(footerUi, "en", "headerCta"),

    "seo.home.title": lang(seoUi, "en", "homeTitle"),
    "seo.home.description": lang(seoUi, "en", "homeDescription"),
    "seo.contact.title": lang(seoUi, "en", "contactTitle"),
    "seo.contact.description": lang(seoUi, "en", "contactDescription"),

    "contact.title": lang(contactUi, "en", "title"),
    "contact.subtitle": lang(contactUi, "en", "subtitle"),
    "contact.lastName": lang(contactUi, "en", "lastName"),
    "contact.firstName": lang(contactUi, "en", "firstName"),
    "contact.organization": lang(contactUi, "en", "organization"),
    "contact.role": lang(contactUi, "en", "role"),
    "contact.email": lang(contactUi, "en", "email"),
    "contact.phonePrefix": "Code",
    "contact.phone": lang(contactUi, "en", "phone"),
    "contact.message": lang(contactUi, "en", "message"),
    "contact.consent": lang(contactUi, "en", "consent"),
    "contact.optional": lang(contactUi, "en", "optional"),
    "contact.submit": lang(contactUi, "en", "submit"),
    "contact.successTitle": lang(contactUi, "en", "successTitle"),
    "contact.successBody": lang(contactUi, "en", "successBody"),
    "contact.error": lang(contactUi, "en", "error"),
    "contact.error400": lang(contactUi, "en", "error400"),
    "contact.error429": lang(contactUi, "en", "error429"),
    "contact.error500": lang(contactUi, "en", "error500"),
    "contact.errorNetwork": lang(contactUi, "en", "errorNetwork"),
  },
  es: {

    "thematics.badge": lang(thematicsUi, "es", "badge"),
    "thematics.heading": lang(thematicsUi, "es", "heading"),
    "thematics.body": lang(thematicsUi, "es", "body"),
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
    "reasons.body": lang(reasonsUi, "es", "body"),

    "footer.heading": lang(footerUi, "es", "heading"),
    "footer.ctaBody": lang(footerUi, "es", "ctaBody"),
    "footer.ctaBtn": lang(footerUi, "es", "ctaBtn"),
    "footer.copyright": lang(footerUi, "es", "copyright"),

    "nav.cta": lang(footerUi, "es", "headerCta"),

    "seo.home.title": lang(seoUi, "es", "homeTitle"),
    "seo.home.description": lang(seoUi, "es", "homeDescription"),
    "seo.contact.title": lang(seoUi, "es", "contactTitle"),
    "seo.contact.description": lang(seoUi, "es", "contactDescription"),

    "contact.title": lang(contactUi, "es", "title"),
    "contact.subtitle": lang(contactUi, "es", "subtitle"),
    "contact.lastName": lang(contactUi, "es", "lastName"),
    "contact.firstName": lang(contactUi, "es", "firstName"),
    "contact.organization": lang(contactUi, "es", "organization"),
    "contact.role": lang(contactUi, "es", "role"),
    "contact.email": lang(contactUi, "es", "email"),
    "contact.phonePrefix": "Prefijo",
    "contact.phone": lang(contactUi, "es", "phone"),
    "contact.message": lang(contactUi, "es", "message"),
    "contact.consent": lang(contactUi, "es", "consent"),
    "contact.optional": lang(contactUi, "es", "optional"),
    "contact.submit": lang(contactUi, "es", "submit"),
    "contact.successTitle": lang(contactUi, "es", "successTitle"),
    "contact.successBody": lang(contactUi, "es", "successBody"),
    "contact.error": lang(contactUi, "es", "error"),
    "contact.error400": lang(contactUi, "es", "error400"),
    "contact.error429": lang(contactUi, "es", "error429"),
    "contact.error500": lang(contactUi, "es", "error500"),
    "contact.errorNetwork": lang(contactUi, "es", "errorNetwork"),
  },
} as const;

export type Lang = keyof typeof ui;
export type UiKey = keyof typeof ui.fr;

export function t(lang: string, key: UiKey): string {
  const l = lang as Lang;
  return (ui[l]?.[key] ?? ui.fr[key]) as string;
}
