// Les chaines des sections migrees vivent dans src/content/ui/*.json, pilotes
// par Keystatic : elles ne sont plus ecrites ici, seulement referencees, afin
// qu il n existe jamais deux sources pour un meme texte.
import footerUi from "../content/ui/footer.json";
import seoUi from "../content/ui/seo.json";
import contactUi from "../content/ui/contact.json";

// Les JSON pilotes par Keystatic sont groupes par langue : on lit
// fichier[langue][cle]. Les deux niveaux peuvent manquer, Keystatic
// omettant les champs vides, d'ou les deux replis sur chaine vide.
const lang = (o: unknown, lg: string, k: string): string =>
  ((o as Record<string, Record<string, string>>)[lg] ?? {})[k] ?? "";


export const ui = {
  fr: {

    "footer.heading": lang(footerUi, "fr", "heading"),
    "footer.ctaBody": lang(footerUi, "fr", "ctaBody"),
    "footer.ctaBtn": lang(footerUi, "fr", "ctaBtn"),
    "footer.copyright": lang(footerUi, "fr", "copyright"),

    "nav.cta": lang(footerUi, "fr", "headerCta"),

    "seo.home.title": lang(seoUi, "fr", "homeTitle"),
    "seo.home.description": lang(seoUi, "fr", "homeDescription"),
    "seo.contact.title": lang(seoUi, "fr", "contactTitle"),
    "seo.contact.description": lang(seoUi, "fr", "contactDescription"),
    "seo.university.title": lang(seoUi, "fr", "universityTitle"),
    "seo.university.description": lang(seoUi, "fr", "universityDescription"),

    "nav.university": lang(footerUi, "fr", "headerUniversity"),

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

    "footer.heading": lang(footerUi, "en", "heading"),
    "footer.ctaBody": lang(footerUi, "en", "ctaBody"),
    "footer.ctaBtn": lang(footerUi, "en", "ctaBtn"),
    "footer.copyright": lang(footerUi, "en", "copyright"),

    "nav.cta": lang(footerUi, "en", "headerCta"),

    "seo.home.title": lang(seoUi, "en", "homeTitle"),
    "seo.home.description": lang(seoUi, "en", "homeDescription"),
    "seo.contact.title": lang(seoUi, "en", "contactTitle"),
    "seo.contact.description": lang(seoUi, "en", "contactDescription"),
    "seo.university.title": lang(seoUi, "en", "universityTitle"),
    "seo.university.description": lang(seoUi, "en", "universityDescription"),

    "nav.university": lang(footerUi, "en", "headerUniversity"),

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

    "footer.heading": lang(footerUi, "es", "heading"),
    "footer.ctaBody": lang(footerUi, "es", "ctaBody"),
    "footer.ctaBtn": lang(footerUi, "es", "ctaBtn"),
    "footer.copyright": lang(footerUi, "es", "copyright"),

    "nav.cta": lang(footerUi, "es", "headerCta"),

    "seo.home.title": lang(seoUi, "es", "homeTitle"),
    "seo.home.description": lang(seoUi, "es", "homeDescription"),
    "seo.contact.title": lang(seoUi, "es", "contactTitle"),
    "seo.contact.description": lang(seoUi, "es", "contactDescription"),
    "seo.university.title": lang(seoUi, "es", "universityTitle"),
    "seo.university.description": lang(seoUi, "es", "universityDescription"),

    "nav.university": lang(footerUi, "es", "headerUniversity"),

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
