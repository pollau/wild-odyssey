import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EVENTS_FILE = join(ROOT, 'src/content/events.json');
const CACHE_FILE = join(ROOT, 'src/content/events-cache.json');

const { list: events } = JSON.parse(await readFile(EVENTS_FILE, 'utf8'));

let cache = {};
try {
  cache = JSON.parse(await readFile(CACHE_FILE, 'utf8'));
} catch {}

let updated = false;

function decodeHtmlEntities(str) {
  if (!str) return str;
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x(\w+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveImage(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  // Next.js image optimization URL — extract the real image from the `url=` param
  const match = url.match(/[?&]url=([^&]+)/);
  if (match) {
    try {
      const decoded = decodeURIComponent(match[1]);
      if (decoded.startsWith('http')) return decoded;
    } catch {}
  }
  return null;
}

function extractLocation(locationObj) {
  if (!locationObj) return { venue: null, city: null, country: null };

  const addr = locationObj.address;
  const name = decodeHtmlEntities(locationObj.name ?? null);

  let city = addr?.addressLocality ?? null;
  let country = addr?.addressCountry ?? null;

  // BilletWeb puts full address in location.name — parse last parts
  if ((!city || !country) && name) {
    const parts = name.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      const lastPart = parts[parts.length - 1];
      const secondToLast = parts[parts.length - 2];
      if (!/\d/.test(lastPart) && !country) country = lastPart;
      if (!/\d/.test(secondToLast) && !city) city = secondToLast;
    }
  }

  let venue = name;
  if (venue && venue.split(',').length >= 3) {
    venue = venue.split(',')[0].trim();
  }

  return { venue: venue ?? null, city: city ?? null, country: country?.toUpperCase() ?? null };
}

function ogMeta(html, prop) {
  return html.match(new RegExp(`<meta[^>]+property="${prop}"[^>]+content="([^"]+)"`))?.[1]
    ?? html.match(new RegExp(`<meta[^>]+content="([^"]+)"[^>]+property="${prop}"`))?.[1]
    ?? null;
}

for (const { externalUrl } of events) {
  if (!externalUrl || cache[externalUrl]) continue;

  console.log(`Scraping: ${externalUrl}`);

  try {
    const res = await fetch(externalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'Referer': 'https://www.google.fr/',
      },
    });

    if (!res.ok) {
      console.error(`  ❌ HTTP ${res.status}`);
      continue;
    }

    const html = await res.text();

    // 1. JSON-LD (most reliable)
    const ldMatches = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    let eventLd = null;
    for (const match of ldMatches) {
      try {
        const ld = JSON.parse(match[1]);
        const candidates = Array.isArray(ld) ? ld : [ld];
        eventLd = candidates.find(e => e['@type'] === 'Event');
        if (eventLd) break;
      } catch {}
    }

    if (eventLd) {
      const { venue, city, country } = extractLocation(eventLd.location);
      const ldRawImage = Array.isArray(eventLd.image) ? eventLd.image[0] : (eventLd.image ?? null);
      const ldImage = resolveImage(ldRawImage);
      // Prefer OG image — more reliable (BilletWeb JSON-LD image paths often 404)
      const ogImage = resolveImage(ogMeta(html, 'og:image:secure_url') ?? ogMeta(html, 'og:image'));
      cache[externalUrl] = {
        name:        decodeHtmlEntities(eventLd.name ?? null),
        startDate:   eventLd.startDate ?? null,
        endDate:     eventLd.endDate ?? null,
        venue, city, country,
        description: decodeHtmlEntities(eventLd.description ?? null),
        image:       ogImage ?? ldImage,
        scrapedAt:   new Date().toISOString(),
      };
      console.log(`  ✅ JSON-LD: ${cache[externalUrl].name} — ${city ?? 'lieu inconnu'}`);
      updated = true;
      continue;
    }

    // 2. OG + event: OG extensions (Eventbrite UK uses these when no JSON-LD)
    const ogTitle = ogMeta(html, 'og:title');
    if (ogTitle) {
      const rawImage = ogMeta(html, 'og:image:secure_url') ?? ogMeta(html, 'og:image');
      cache[externalUrl] = {
        name:        decodeHtmlEntities(ogTitle),
        startDate:   ogMeta(html, 'event:start_time') ?? null,
        endDate:     ogMeta(html, 'event:end_time') ?? null,
        venue:       null,
        city:        ogMeta(html, 'event:location') ?? null,
        country:     null,
        description: decodeHtmlEntities(ogMeta(html, 'og:description')),
        image:       resolveImage(rawImage),
        scrapedAt:   new Date().toISOString(),
      };
      console.log(`  ⚠️  OG fallback: ${cache[externalUrl].name} — start: ${cache[externalUrl].startDate ?? 'unknown'}`);
      updated = true;
    } else {
      console.warn(`  ⚠️  No data found for ${externalUrl}`);
    }
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
  }
}

if (updated) {
  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  console.log(`\nCache updated: ${CACHE_FILE}`);
} else {
  console.log('\nNo new URLs to scrape — cache is up to date.');
}
