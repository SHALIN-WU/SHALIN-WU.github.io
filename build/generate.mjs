import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES } from "./l10n.mjs";
import { offices } from "./offices.mjs";
import { services, industry } from "./services.mjs";
import { ui, countries, home, about, legal, servicesIndex, locationsCopy, contactCopy } from "./copy.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://www.northgo.com";
const DATE = "2026-11-11";
const VERSION = "v1";
const OG = "https://cdn.prod.website-files.com/66fc7398f8b5d731b52bcefb/670eea7be3b8c90fbb9dd350_NG_Planes-Duotone-p-500.webp";

const htmlLang = { en: "en", "zh-tw": "zh-Hant", ja: "ja", vi: "vi" };
const ogLocale = { en: "en_US", "zh-tw": "zh_TW", ja: "ja_JP", vi: "vi_VN" };
const hreflang = { en: "en", "zh-tw": "zh-TW", ja: "ja", vi: "vi" };

const byId = Object.fromEntries(services.map((service) => [service.id, service]));
byId.offshore = industry;

const related = {
  freight: ["project", "warehouse"],
  ocean: ["air", "land", "customs"],
  air: ["ocean", "customs"],
  land: ["ocean", "warehouse"],
  customs: ["ocean", "air"],
  project: ["warehouse", "offshore", "ocean"],
  warehouse: ["project", "land"],
  agency: ["project", "ocean"],
  offshore: ["project", "warehouse"]
};

const aliases = {
  "freight-logistics": "freight",
  "ocean-freight": "ocean",
  "air-freight": "air",
  "land-transport": "land",
  "customs-clearance": "customs",
  "project-logistics": "project",
  "warehouse-logistics": "warehouse",
  "shipping-agency": "agency",
  "offshore-wind": "project"
};

function fitDescription(text, locale) {
  const length = Array.from(text).length;
  if ((locale !== "zh-tw" && locale !== "ja") || length >= 120) return text;
  const tail = locale === "zh-tw"
    ? "詢價寄到指定辦公室後，由該辦公室回覆才算報價。據點在台北、台中、高雄、東京、大阪、胡志明市與洛杉磯。"
    : "見積は指定した拠点の返信で確定します。拠点は台北、台中、高雄、東京、大阪、ホーチミン、ロサンゼルスです。";
  const next = text + tail;
  return Array.from(next).length > 185 ? text : next;
}

function t(value, locale) {
  if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "en")) {
    const text = value[locale];
    if (!text || !String(text).trim()) throw new Error(`Missing ${locale} string`);
    return String(text);
  }
  return value;
}

function href(locale, slug) {
  const prefix = locale === "en" ? "" : `/${locale}`;
  return slug ? `${prefix}/${slug}/` : `${prefix}/`;
}

function absolute(locale, slug) {
  return `${SITE}${href(locale, slug)}`;
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

function accent(text, word) {
  const safe = esc(text);
  if (!word || !text.includes(word)) return safe;
  return safe.replace(esc(word), `<em>${esc(word)}</em>`);
}

function telHref(tel) {
  return `tel:${tel.replace(/[^\d+]/g, "")}`;
}

function jsonScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

function serviceCase(service) {
  if (service.case) return service.case;
  if (service.caseFrom) return byId[service.caseFrom].case;
  return null;
}

function renderCase(kase, locale) {
  const rows = ["cargo", "lane", "challenge", "approach", "result"]
    .map((key) => `<dt>${esc(t(ui[key], locale))}</dt><dd>${esc(t(kase[key], locale))}</dd>`)
    .join("");
  return `<section class="case">
    <p class="eyebrow">${esc(t(ui.caseEyebrow, locale))}</p>
    <h2>${esc(t(ui.caseEyebrow, locale))}</h2>
    <dl>${rows}</dl>
    <p class="note">${esc(t(ui.caseNote, locale))}</p>
  </section>`;
}

function renderPoints(points, locale) {
  return `<ul class="points">${points.map((point) => `<li><h3>${esc(t(point.title, locale))}</h3><p>${esc(t(point.text, locale))}</p></li>`).join("")}</ul>`;
}

function enquireHref(locale, id) {
  return `${href(locale, "contact")}?service=${id}#enquiry-form`;
}

function band(locale, id) {
  return `<section class="section"><div class="wrap"><div class="band">
    <h2>${esc(t(ui.sendTitle, locale))}</h2>
    <p>${esc(t(ui.sendText, locale))}</p>
    <div class="band-actions"><a class="btn" href="${esc(enquireHref(locale, id))}" data-track="service_cta" data-service="${esc(id)}">${esc(t(ui.enquireService, locale))}</a></div>
  </div></div></section>`;
}

function relatedBlock(locale, id) {
  const links = (related[id] || []).map((item) => {
    const page = byId[item];
    return `<a href="${href(locale, page.slug)}">${esc(t(page.title, locale))}</a>`;
  }).join("");
  return `<section class="section"><div class="wrap"><h2>${esc(t(ui.related, locale))}</h2><p class="sublinks">${links}</p></div></section>`;
}

function crumbs(locale, items) {
  const parts = [{ href: href(locale, ""), label: t(ui.crumbsHome, locale) }, ...items];
  return `<ol class="crumbs">${parts.map((item, index) => {
    const last = index === parts.length - 1;
    return `<li>${last ? esc(item.label) : `<a href="${item.href}">${esc(item.label)}</a>`}${last ? "" : " /"}</li>`;
  }).join("")}</ol>`;
}

function breadcrumbLd(locale, items) {
  const parts = [{ href: absolute(locale, ""), label: t(ui.crumbsHome, locale) }, ...items];
  return {
    "@type": "BreadcrumbList",
    itemListElement: parts.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.abs || item.href
    }))
  };
}

function pageHero(locale, eyebrow, title, lead, crumbItems) {
  return `<header class="page-hero"><div class="wrap">${crumbs(locale, crumbItems)}<p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1><p class="lead">${esc(lead)}</p></div></header>`;
}

function childLinks(locale, parentId) {
  return services.filter((service) => service.parent === parentId).map((service) =>
    `<a href="${href(locale, service.slug)}">${esc(t(service.title, locale))}</a>`
  ).join("");
}

function renderHome(locale) {
  const mains = ["freight", "project", "warehouse", "agency"].map((id) => byId[id]);
  const cards = mains.map((service) => {
    const extra = service.id === "freight"
      ? `<ul class="sublinks">${["ocean", "air", "land", "customs"].map((id) => `<li><a href="${href(locale, byId[id].slug)}">${esc(t(byId[id].title, locale))}</a></li>`).join("")}</ul>`
      : service.id === "project"
        ? `<ul class="sublinks"><li><a href="${href(locale, industry.slug)}">${esc(t(industry.title, locale))}</a></li></ul>`
        : "";
    return `<article class="card"><h3><a href="${href(locale, service.slug)}">${esc(t(service.title, locale))}</a></h3><p>${esc(t(service.lead, locale))}</p>${extra}<a class="more" href="${enquireHref(locale, service.id)}" data-track="service_cta" data-service="${service.id}">${esc(t(ui.enquire, locale))}</a></article>`;
  }).join("");
  const pills = offices.map((office) => `<a href="${href(locale, "locations")}#${office.id}" data-track="office_click" data-office="${office.id}">${esc(t(office.name, locale))}${office.hq ? ` · ${esc(t(ui.hq, locale))}` : ""}</a>`).join("");
  const trusts = home.trusts.map((item) => `<article><h3>${esc(t(item.title, locale))}</h3><p>${esc(t(item.text, locale))}</p></article>`).join("");
  return `<header class="hero"><div class="wrap">
      <h1>${accent(t(home.title, locale), t(home.accent, locale))}</h1>
      <p class="lead">${esc(t(home.lead, locale))}</p>
      <div class="hero-actions">
        <a class="btn" href="${href(locale, "contact")}#enquiry-form">${esc(t(ui.enquire, locale))}</a>
        <a class="btn secondary" href="${href(locale, "locations")}">${esc(t(ui.seeMap, locale))}</a>
      </div>
    </div></header>
    <section class="section"><div class="wrap">
      <h2>${esc(t(home.servicesTitle, locale))}</h2>
      <p class="intro">${esc(t(home.servicesIntro, locale))}</p>
      <div class="grid-4">${cards}</div>
    </div></section>
    <section class="section"><div class="wrap">
      <h2>${esc(t(home.networkTitle, locale))}</h2>
      <p class="intro">${esc(t(home.networkLead, locale))}</p>
      <div class="office-pills">${pills}</div>
    </div></section>
    <section class="section" id="why-northgo"><div class="wrap">
      <h2>${esc(t(home.trustTitle, locale))}</h2>
      <div class="trust">${trusts}</div>
    </div></section>
    <section class="section"><div class="wrap">
      ${renderCase(industry.case, locale)}
      <p><a class="more" href="${href(locale, industry.slug)}">${esc(t(industry.title, locale))}</a></p>
    </div></section>
    ${band(locale, "freight")}`;
}

function renderService(locale, service) {
  const crumb = [
    { href: href(locale, "services"), abs: absolute(locale, "services"), label: t(servicesIndex.title, locale) },
    ...(service.parent ? [{ href: href(locale, byId[service.parent].slug), abs: absolute(locale, byId[service.parent].slug), label: t(byId[service.parent].title, locale) }] : []),
    { href: absolute(locale, service.slug), abs: absolute(locale, service.slug), label: t(service.title, locale) }
  ];
  const children = services.filter((item) => item.parent === service.id);
  const childBlock = children.length
    ? `<div class="grid-2">${children.map((item) => `<article class="card"><h3><a href="${href(locale, item.slug)}">${esc(t(item.title, locale))}</a></h3><p>${esc(t(item.lead, locale))}</p></article>`).join("")}</div>`
    : "";
  const kase = serviceCase(service);
  return `${pageHero(locale, t(service.eyebrow, locale), t(service.title, locale), t(service.lead, locale), crumb)}
    <section class="section"><div class="wrap"><h2>${esc(t(ui.solves, locale))}</h2><p class="intro">${esc(t(service.solves, locale))}</p>
      <h2>${esc(t(ui.coverage, locale))}</h2>${renderPoints(service.points, locale)}${childBlock}</div></section>
    <section class="section"><div class="wrap">${renderCase(kase, locale)}</div></section>
    ${relatedBlock(locale, service.id)}
    ${band(locale, service.id)}`;
}

function renderIndustry(locale) {
  const crumb = [
    { href: href(locale, "services"), abs: absolute(locale, "services"), label: t(servicesIndex.title, locale) },
    { href: href(locale, byId.project.slug), abs: absolute(locale, byId.project.slug), label: t(byId.project.title, locale) },
    { href: absolute(locale, industry.slug), abs: absolute(locale, industry.slug), label: t(industry.title, locale) }
  ];
  return `${pageHero(locale, t(industry.eyebrow, locale), t(industry.title, locale), t(industry.lead, locale), crumb)}
    <section class="section"><div class="wrap"><h2>${esc(t(ui.solves, locale))}</h2><p class="intro">${esc(t(industry.solves, locale))}</p>${renderPoints(industry.points, locale)}</div></section>
    <section class="section"><div class="wrap">${renderCase(industry.case, locale)}</div></section>
    ${relatedBlock(locale, "offshore")}
    ${band(locale, "project")}`;
}

function renderServices(locale) {
  const crumb = [{ href: absolute(locale, "services"), abs: absolute(locale, "services"), label: t(servicesIndex.title, locale) }];
  const cards = ["freight", "project", "warehouse", "agency"].map((id) => {
    const service = byId[id];
    const subs = id === "freight" ? childLinks(locale, "freight") : id === "project" ? `<a href="${href(locale, industry.slug)}">${esc(t(industry.title, locale))}</a>` : "";
    return `<article class="card"><h3><a href="${href(locale, service.slug)}">${esc(t(service.title, locale))}</a></h3><p>${esc(t(service.lead, locale))}</p><p class="sublinks">${subs}</p></article>`;
  }).join("");
  return `${pageHero(locale, t(ui.services, locale), t(servicesIndex.title, locale), t(servicesIndex.lead, locale), crumb)}
    <section class="section"><div class="wrap"><div class="grid-2">${cards}</div></div></section>`;
}

function renderLocations(locale) {
  const crumb = [{ href: absolute(locale, "locations"), abs: absolute(locale, "locations"), label: t(locationsCopy.title, locale) }];
  const regions = ["all", "asia", "taiwan", "japan", "sea", "na"].map((id, index) =>
    `<button type="button" data-region="${id}" aria-pressed="${index === 0 ? "true" : "false"}">${esc(t(ui.regions[id], locale))}</button>`
  ).join("");
  const cards = offices.map((office) => {
    const fax = office.fax ? `<p>${esc(t(ui.fax, locale))} ${esc(office.fax)}</p>` : "";
    return `<article class="office-card" id="${office.id}" data-region="${office.region}" data-area="${office.area}">
      ${office.hq ? `<p class="badge">${esc(t(ui.hq, locale))}</p>` : ""}
      <h3>${esc(t(office.name, locale))}</h3>
      <p>${esc(t(office.address, locale))}</p>
      <p><a href="${telHref(office.tel)}">${esc(t(ui.tel, locale))} ${esc(office.tel)}</a></p>
      ${fax}
      <p><a href="mailto:${office.email}">${esc(office.email)}</a></p>
      <p class="actions">
        <a href="${esc(`https://www.google.com/maps/search/?api=1&query=${office.lat},${office.lng}`)}" target="_blank" rel="noopener">${esc(t(ui.maps, locale))}</a>
        <a href="${href(locale, "contact")}?office=${office.id}#enquiry-form" data-track="office_click" data-office="${office.id}">${esc(t(ui.enquireOffice, locale))}</a>
      </p>
    </article>`;
  }).join("");
  const data = offices.map((office) => ({
    id: office.id, hq: office.hq, lat: office.lat, lng: office.lng, region: office.region, area: office.area, name: t(office.name, locale)
  }));
  return `${pageHero(locale, t(ui.locations, locale), t(locationsCopy.title, locale), t(locationsCopy.lead, locale), crumb)}
    <section class="section"><div class="wrap">
      <div class="grid-3">
        <article class="stat"><strong>7</strong><span>${esc(t(ui.locations, locale))}</span></article>
        <article class="stat"><strong>4</strong><span>${esc(t(ui.regions.taiwan, locale))} · ${esc(t(ui.regions.japan, locale))} · ${esc(t(ui.regions.sea, locale))} · ${esc(t(ui.regions.na, locale))}</span></article>
        <article class="stat"><strong>${esc(t(ui.hq, locale))}</strong><span>${esc(t(offices[0].name, locale))}</span></article>
      </div>
      <div class="regions" role="group" aria-label="${esc(t(ui.regionLabel, locale))}">${regions}</div>
      <div class="map-layout">
        <div id="map" role="region" aria-label="${esc(t(ui.mapLabel, locale))}"></div>
        <div class="office-list">${cards}</div>
      </div>
      <p class="note">${esc(t(ui.mapFallback, locale))}</p>
      <script type="application/json" id="office-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
    </div></section>`;
}

function cargoMap(locale) {
  const map = {};
  for (const [key, options] of Object.entries(ui.form.cargoMap)) {
    map[key] = options.map((item) => (typeof item === "string" ? item : t(item, locale)));
  }
  return map;
}

function renderContact(locale) {
  const f = ui.form;
  const sorted = [...countries].sort((a, b) => t(a[2], locale).localeCompare(t(b[2], locale), locale === "zh-tw" ? "zh-Hant" : locale));
  const countryOptions = [`<option value="">${esc(t(f.select, locale))}</option>`].concat(sorted.map(([code, office, name]) =>
    `<option value="${esc(t(name, locale))}"${office ? ` data-office="${office}"` : ""}>${esc(t(name, locale))}</option>`
  )).join("");
  const serviceOptions = [`<option value="">${esc(t(f.select, locale))}</option>`]
    .concat(["ocean", "air", "land", "customs", "freight", "project", "warehouse", "agency"].map((id) =>
      `<option value="${id}">${esc(t(byId[id].title, locale))}</option>`
    ))
    .concat(`<option value="other">${esc(t(f.other, locale))}</option>`)
    .join("");
  const officeOptions = [`<option value="">${esc(t(f.select, locale))}</option>`].concat(offices.map((office) =>
    `<option value="${office.id}" data-email="${office.email}">${esc(t(office.name, locale))}${office.hq ? ` · ${esc(t(ui.hq, locale))}` : ""}</option>`
  )).join("");
  const copy = {
    step1: t(f.step1, locale),
    step2: t(f.step2, locale),
    required: t(f.required, locale),
    email: t(f.email, locale),
    terms: t(f.terms, locale),
    number: t(f.number, locale),
    select: t(f.select, locale),
    origin: {
      default: t(f.origin.default, locale),
      warehouse: t(f.origin.warehouse, locale),
      agency: t(f.origin.agency, locale)
    },
    destination: {
      default: t(f.destination.default, locale),
      warehouse: t(f.destination.warehouse, locale),
      agency: t(f.destination.agency, locale)
    },
    cargo: t(f.cargo, locale),
    cargoTypes: cargoMap(locale),
    aliases,
    readyTitle: t(f.readyTitle, locale),
    readyBody: t(f.readyBody, locale),
    send: t(f.send, locale),
    copy: t(f.copy, locale),
    copied: t(f.copied, locale),
    subject: t(f.subject, locale),
    mailIntro: t(f.mailIntro, locale),
    service: t(f.service, locale),
    cargoLabel: t(f.cargo, locale),
    originLabel: t(f.origin.default, locale),
    destLabel: t(f.destination.default, locale),
    pieces: t(f.pieces, locale),
    weight: t(f.weight, locale),
    volume: t(f.volume, locale),
    ready: t(f.ready, locale),
    office: t(f.office, locale)
  };
  const emails = offices.map((office) => `<li><a href="mailto:${office.email}">${esc(t(office.name, locale))} — ${office.email}</a></li>`).join("");
  return `${pageHero(locale, t(ui.contact, locale), t(contactCopy.title, locale), t(contactCopy.lead, locale), [
    { href: absolute(locale, "contact"), abs: absolute(locale, "contact"), label: t(contactCopy.title, locale) }
  ])}
    <section class="section"><div class="wrap form-card">
      <form id="enquiry-form" novalidate>
        <p class="step-kicker" id="step-kicker">${esc(t(f.step1, locale))}</p>
        <div data-step="1">
          <div class="form-grid two">
            <label>${esc(t(f.first, locale))} *<input name="first" autocomplete="given-name" required></label>
            <label>${esc(t(f.last, locale))} *<input name="last" autocomplete="family-name" required></label>
            <label class="span-2">${esc(t(f.company, locale))} *<input name="company" autocomplete="organization" required></label>
            <label>${esc(t(f.emailLabel, locale))} *<input name="email" type="email" autocomplete="email" required></label>
            <label>${esc(t(f.phone, locale))} *<input name="phone" type="tel" autocomplete="tel" required></label>
            <label class="span-2">${esc(t(f.country, locale))} *<select name="country" autocomplete="country-name" required>${countryOptions}</select></label>
          </div>
          <div class="form-actions"><button class="btn" type="button" data-next>${esc(t(f.next, locale))}</button></div>
        </div>
        <div data-step="2" hidden>
          <div class="form-grid two">
            <label class="span-2">${esc(t(f.service, locale))} *<select name="service" required>${serviceOptions}</select></label>
            <label>${esc(t(f.cargo, locale))} *<select name="cargo" required></select></label>
            <label>${esc(t(f.office, locale))} *<select name="office" required>${officeOptions}</select></label>
            <label><span id="origin-label-text">${esc(t(f.origin.default, locale))}</span> *<input name="origin" required></label>
            <label id="dest-wrap"><span id="dest-label-text">${esc(t(f.destination.default, locale))}</span> *<input name="destination" required></label>
            <label>${esc(t(f.pieces, locale))}<input name="pieces" type="number" min="0" inputmode="numeric"></label>
            <label>${esc(t(f.weight, locale))}<input name="weight" type="number" min="0" step="0.01" inputmode="decimal"></label>
            <label>${esc(t(f.volume, locale))}<input name="volume" type="number" min="0" step="0.01" inputmode="decimal"></label>
            <label>${esc(t(f.ready, locale))} *<input name="ready" type="date" required></label>
            <label class="span-2">${esc(t(f.message, locale))}<textarea name="message"></textarea></label>
            <label class="span-2"><input name="terms" type="checkbox" required> ${esc(t(f.termsLead, locale))} <a href="${href(locale, "legal/terms")}">${esc(t(ui.terms, locale))}</a></label>
          </div>
          <label class="hp">Company website<input class="hp-field" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true"></label>
          <div class="form-actions">
            <button class="btn ghost" type="button" data-back>${esc(t(f.back, locale))}</button>
            <button class="btn" type="submit">${esc(t(f.submit, locale))}</button>
          </div>
        </div>
        <div class="confirm" data-confirm hidden></div>
      </form>
      <p class="note">${esc(t(ui.privacyNote, locale))} <a href="${href(locale, "legal/privacy-policy")}">${esc(t(ui.privacy, locale))}</a></p>
      <noscript><p>${esc(t(f.noscript, locale))}</p><ul>${emails}</ul></noscript>
      <script type="application/json" id="rfq-copy">${JSON.stringify(copy).replace(/</g, "\\u003c")}</script>
    </div></section>`;
}

function renderAbout(locale) {
  const blocks = about.blocks.map((block) => `<h2>${esc(t(block.heading, locale))}</h2><p>${esc(t(block.text, locale))}</p>`).join("");
  const certs = ["IATA", "ISO 45001", "AEO"].map((name) => `<li>${name}</li>`).join("");
  return `${pageHero(locale, t(ui.about, locale), t(about.title, locale), t(about.lead, locale), [
    { href: absolute(locale, "about"), abs: absolute(locale, "about"), label: t(about.title, locale) }
  ])}
    <section class="section"><div class="wrap prose">${blocks}<ul class="certs">${certs}</ul></div></section>`;
}

function renderLegal(locale, page) {
  const body = page.paragraphs.map((paragraph) => `<p>${esc(t(paragraph, locale))}</p>`).join("");
  return `${pageHero(locale, t(ui.footerLegal, locale), t(page.title, locale), t(page.description, locale), [
    { href: absolute(locale, page.slug), abs: absolute(locale, page.slug), label: t(page.title, locale) }
  ])}
    <section class="section"><div class="wrap prose">${body}</div></section>`;
}

function nav(locale, slug) {
  const inServices = !slug || false;
  const servicesOpen = slug.startsWith("services") || slug.startsWith("industries");
  const link = (itemSlug, label) => `<a href="${href(locale, itemSlug)}"${slug === itemSlug ? ' aria-current="page"' : ""}>${esc(label)}</a>`;
  const panel = [
    ["freight", ["ocean", "air", "land", "customs"]],
    ["project", []],
    ["warehouse", []],
    ["agency", []]
  ].map(([id, children]) => {
    const service = byId[id];
    const subs = children.map((child) => `<a class="sub" href="${href(locale, byId[child].slug)}">${esc(t(byId[child].title, locale))}</a>`).join("");
    const wind = id === "project" ? `<a class="sub" href="${href(locale, industry.slug)}">${esc(t(industry.title, locale))}</a>` : "";
    return `${link(service.slug, t(service.title, locale))}${subs}${wind}`;
  }).join("");
  const langs = LOCALES.map((code) => {
    const label = code === "zh-tw" ? "繁中" : code === "ja" ? "日本語" : code === "vi" ? "VI" : "EN";
    const current = code === locale ? ' aria-current="page"' : "";
    return `<a href="${href(code, slug)}" hreflang="${hreflang[code]}" lang="${htmlLang[code]}"${current} data-track="locale_switch" data-locale="${code}">${label}</a>`;
  }).join("");
  return `<nav id="site-nav" aria-label="${esc(t(ui.services, locale))}">
      <details class="services-details">
        <summary${servicesOpen ? ' aria-current="true"' : ""}>${esc(t(ui.services, locale))}</summary>
        <div class="services-panel">${panel}</div>
      </details>
      ${link("locations", t(ui.locations, locale))}
      ${link("about", t(ui.about, locale))}
      <div class="langs" role="group" aria-label="${esc(t(ui.langLabel, locale))}">${langs}</div>
    </nav>`;
}

function footer(locale) {
  const serviceLinks = ["freight", "ocean", "air", "land", "customs", "project", "warehouse", "agency"]
    .map((id) => `<li><a href="${href(locale, byId[id].slug)}">${esc(t(byId[id].title, locale))}</a></li>`).join("");
  const company = [
    ["about", ui.about],
    ["locations", ui.locations],
    ["contact", ui.contact]
  ].map(([slug, label]) => `<li><a href="${href(locale, slug)}">${esc(t(label, locale))}</a></li>`).join("");
  const legalLinks = [
    ["legal/privacy-policy", ui.privacy],
    ["legal/terms", ui.terms],
    ["legal/cookie-policy", ui.cookie],
    ["legal/disclaimer", ui.disclaimer]
  ].map(([slug, label]) => `<li><a href="${href(locale, slug)}">${esc(t(label, locale))}</a></li>`).join("");
  return `<footer class="site-footer"><div class="wrap foot-grid">
      <div><a class="brand" href="${href(locale, "")}" aria-label="Northgo"><img src="/assets/logo-on-dark.svg" alt="" width="168" height="33"></a><p>${esc(t(ui.rights, locale))}</p><p><a href="${telHref(offices[0].tel)}">${esc(offices[0].tel)}</a></p></div>
      <div><h2>${esc(t(ui.footerServices, locale))}</h2><ul>${serviceLinks}</ul></div>
      <div><h2>${esc(t(ui.footerCompany, locale))}</h2><ul>${company}</ul></div>
      <div><h2>${esc(t(ui.footerLegal, locale))}</h2><ul>${legalLinks}</ul></div>
    </div><div class="wrap"><p class="fine">${esc(t(ui.rights, locale))} · ${VERSION}</p></div></footer>`;
}

function organizationLd() {
  return {
    "@type": "Organization",
    name: "Northgo",
    url: `${SITE}/`,
    foundingDate: "1988",
    slogan: "Making logistics effortless.",
    email: offices[0].email,
    telephone: offices[0].tel,
    address: {
      "@type": "PostalAddress",
      streetAddress: "7F., No. 10, Sec. 3, Minsheng E. Rd.",
      addressLocality: "Taipei",
      postalCode: "104511",
      addressCountry: "TW"
    }
  };
}

function layout({ locale, slug, title, description, body, jsonld, map }) {
  const canon = absolute(locale, slug);
  const alternates = LOCALES.map((code) => `<link rel="alternate" hreflang="${hreflang[code]}" href="${absolute(code, slug)}">`).join("");
  const xdefault = `<link rel="alternate" hreflang="x-default" href="${absolute("en", slug)}">`;
  const ogAlternates = LOCALES.filter((code) => code !== locale).map((code) => `<meta property="og:locale:alternate" content="${ogLocale[code]}">`).join("");
  const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">`;
  const leaflet = map
    ? `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">`
    : "";
  const scripts = map
    ? `<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script><script src="/assets/map.js"></script>`
    : "";
  return `<!DOCTYPE html>
<html lang="${htmlLang[locale]}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${canon}">
  ${alternates}
  ${xdefault}
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canon}">
  <meta property="og:image" content="${OG}">
  <meta property="og:image:alt" content="Northgo">
  <meta property="og:locale" content="${ogLocale[locale]}">
  ${ogAlternates}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#001b3a">
  ${fonts}
  ${leaflet}
  <link rel="stylesheet" href="/assets/site.css">
  ${jsonScript({ "@context": "https://schema.org", "@graph": jsonld })}
</head>
<body>
  <a class="skip" href="#main">${esc(t(ui.skip, locale))}</a>
  <header class="site-header"><div class="wrap bar">
    <a class="brand" href="${href(locale, "")}" aria-label="Northgo"><img src="/assets/logo.svg" alt="" width="168" height="33"></a>
    ${nav(locale, slug)}
    <a class="btn enquire" href="${href(locale, "contact")}#enquiry-form">${esc(t(ui.enquire, locale))}</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">${esc(t(ui.menu, locale))}</button>
  </div></header>
  <main id="main">${body}</main>
  ${footer(locale)}
  <script src="/assets/site.js"></script>
  ${scripts}
</body>
</html>`;
}

function pages() {
  return [
    { kind: "home", slug: "", title: home.seoTitle, description: home.description },
    { kind: "about", slug: "about", title: about.seoTitle, description: about.description },
    { kind: "contact", slug: "contact", title: contactCopy.seoTitle, description: contactCopy.description },
    { kind: "locations", slug: "locations", title: locationsCopy.seoTitle, description: locationsCopy.description },
    { kind: "services", slug: "services", title: servicesIndex.seoTitle, description: servicesIndex.description },
    ...services.map((service) => ({ kind: "service", slug: service.slug, service, title: service.seoTitle, description: service.description })),
    { kind: "industry", slug: industry.slug, title: industry.seoTitle, description: industry.description },
    ...legal.map((page) => ({ kind: "legal", slug: page.slug, legal: page, title: page.seoTitle, description: page.description }))
  ];
}

function renderBody(page, locale) {
  if (page.kind === "home") return renderHome(locale);
  if (page.kind === "about") return renderAbout(locale);
  if (page.kind === "contact") return renderContact(locale);
  if (page.kind === "locations") return renderLocations(locale);
  if (page.kind === "services") return renderServices(locale);
  if (page.kind === "service") return renderService(locale, page.service);
  if (page.kind === "industry") return renderIndustry(locale);
  return renderLegal(locale, page.legal);
}

function structured(page, locale) {
  const graph = [];
  if (page.kind === "home") {
    graph.push(organizationLd());
  }
  if (page.kind === "locations") {
    graph.push(...offices.map((office) => ({
      "@type": "LocalBusiness",
      name: `Northgo ${t(office.name, locale)}`,
      telephone: office.tel,
      email: office.email,
      address: { "@type": "PostalAddress", streetAddress: t(office.address, locale), addressCountry: office.country },
      geo: { "@type": "GeoCoordinates", latitude: office.lat, longitude: office.lng },
      url: `${absolute(locale, "locations")}#${office.id}`,
      parentOrganization: { "@type": "Organization", name: "Northgo", url: `${SITE}/` }
    })));
  }
  if (page.kind === "service" || page.kind === "industry") {
    const source = page.service || industry;
    graph.push({
      "@type": "Service",
      name: t(source.title, locale),
      serviceType: t(source.title, locale),
      description: t(source.description, locale),
      provider: { "@type": "Organization", name: "Northgo", url: `${SITE}/` },
      areaServed: ["TW", "JP", "VN", "US"]
    });
  }
  if (page.slug) {
    graph.push(breadcrumbLd(locale, [{ href: absolute(locale, page.slug), abs: absolute(locale, page.slug), label: t(page.title, locale).replace(/\s*[|｜]\s*Northgo$/, "") }]));
  }
  if (!graph.length) graph.push(organizationLd());
  return graph;
}

function outFile(locale, slug) {
  const prefix = locale === "en" ? "" : `${locale}/`;
  const tail = slug ? `${slug}/index.html` : "index.html";
  return path.join(ROOT, "site", prefix, tail);
}

async function writePage(locale, page) {
  const title = t(page.title, locale);
  const description = fitDescription(t(page.description, locale), locale);
  const html = layout({
    locale,
    slug: page.slug,
    title,
    description,
    body: renderBody(page, locale),
    jsonld: structured(page, locale),
    map: page.kind === "locations"
  });
  const file = outFile(locale, page.slug);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html, "utf8");
  return { file, title, description, html, locale, slug: page.slug, kind: page.kind };
}

function assertPage(record, englishTitle) {
  const errors = [];
  const length = Array.from(record.description).length;
  const min = record.locale === "zh-tw" || record.locale === "ja" ? 100 : 70;
  if (length < min || length > 200) errors.push(`description length ${length}`);
  if (!record.title.includes("Northgo")) errors.push("title missing brand");
  if (record.locale !== "en" && record.title === englishTitle) errors.push("title not translated");
  for (const needle of ["Name Surname", "placeholder image", "Mastering Complexity", 'href="#"', "?r=0", "/news"]) {
    if (record.html.includes(needle)) errors.push(`contains ${needle}`);
  }
  if (!record.html.includes('rel="canonical"')) errors.push("canonical");
  if ((record.html.match(/rel="alternate"/g) || []).length < 5) errors.push("hreflang");
  if (!record.html.includes("application/ld+json")) errors.push("jsonld");
  if (record.kind === "contact") {
    for (const name of ["origin", "destination", "office", "cargo", "ready", "service"]) {
      if (!record.html.includes(`name="${name}"`)) errors.push(`form ${name}`);
    }
  }
  if ((record.kind === "service" || record.kind === "industry") && !record.html.includes('class="case"')) errors.push("case");
  if (record.kind === "locations" && !record.html.includes('id="map"')) errors.push("map");
  if (errors.length) throw new Error(`${record.locale} ${record.slug || "/"}: ${errors.join(", ")}`);
}

async function main() {
  const list = pages();
  const written = [];
  for (const locale of LOCALES) {
    for (const page of list) written.push(await writePage(locale, page));
  }
  const english = new Map(written.filter((item) => item.locale === "en").map((item) => [item.slug, item.title]));
  const failures = [];
  for (const record of written) {
    try { assertPage(record, english.get(record.slug)); }
    catch (error) { failures.push(error.message); }
  }
  if (failures.length) throw new Error(failures.join("\n"));

  const urls = [];
  for (const page of list) {
    for (const locale of LOCALES) {
      urls.push({ loc: absolute(locale, page.slug), slug: page.slug });
    }
  }
  const body = urls.map((url) => {
    const links = LOCALES.map((locale) => `    <xhtml:link rel="alternate" hreflang="${hreflang[locale]}" href="${absolute(locale, url.slug)}"/>`).join("\n");
    return `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${DATE}</lastmod>\n${links}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${absolute("en", url.slug)}"/>\n  </url>`;
  }).join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
  if (sitemap.includes("/news")) throw new Error("sitemap lists news");
  await writeFile(path.join(ROOT, "site", "sitemap.xml"), sitemap, "utf8");
  await writeFile(path.join(ROOT, "site", "robots.txt"), "User-agent: *\nAllow: /\n\nSitemap: https://www.northgo.com/sitemap.xml\n", "utf8");

  const redirects = `# 301 map for the previous Webflow site.
# News was linked and returned 404. Send it home.
/news                 /           301!
/news/                /           301!
/zh-tw/news           /zh-tw/     301!
/zh-tw/news/          /zh-tw/     301!
/ja/news              /ja/        301!
/ja/news/             /ja/        301!
/vi/news              /vi/        301!
/vi/news/             /vi/        301!

# The old language switch used /?r=0 for English. Drop the query.
/                     /?          301  r=0
/zh-tw                /zh-tw/     301  r=0
/ja                   /ja/        301  r=0
/vi                   /vi/        301  r=0
`;
  await writeFile(path.join(ROOT, "site", "_redirects"), redirects, "utf8");
  const vercel = {
    redirects: [
      { source: "/news", destination: "/", permanent: true },
      { source: "/:locale(zh-tw|ja|vi)/news", destination: "/:locale/", permanent: true },
      { source: "/", has: [{ type: "query", key: "r", value: "0" }], destination: "/?", permanent: true },
      { source: "/:locale(zh-tw|ja|vi)", has: [{ type: "query", key: "r", value: "0" }], destination: "/:locale/", permanent: true }
    ]
  };
  await writeFile(path.join(ROOT, "site", "vercel.json"), `${JSON.stringify(vercel, null, 2)}\n`, "utf8");
  await writeFile(path.join(ROOT, "site", "content-model.json"), `${JSON.stringify({
    platform: "static-html",
    source: "build/copy.mjs, build/services.mjs, build/offices.mjs",
    note: "Replace the build modules with a headless CMS when editors need it. Keep these URLs and apply site/_redirects on the host.",
    locales: LOCALES,
    urls: [...new Set(urls.map((url) => url.loc))]
  }, null, 2)}\n`, "utf8");

  const notFound = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found | Northgo</title><meta name="robots" content="noindex"><link rel="stylesheet" href="/assets/site.css"></head><body><main class="section"><div class="wrap prose"><h1>Page not found</h1><p><a href="/">English</a> · <a href="/zh-tw/">繁中</a> · <a href="/ja/">日本語</a> · <a href="/vi/">Tiếng Việt</a></p><p class="fine">Northgo. Founded in Taipei in 1988. · ${VERSION}</p></div></main></body></html>`;
  await writeFile(path.join(ROOT, "site", "404.html"), notFound, "utf8");

  const robots = await readFile(path.join(ROOT, "site", "robots.txt"), "utf8");
  if (!robots.includes("Sitemap: https://www.northgo.com/sitemap.xml")) throw new Error("robots");
  const sample = written.find((item) => item.locale === "zh-tw" && item.slug === "");
  if (!sample.html.includes("讓物流變得輕鬆")) throw new Error("zh home");
  const japanese = written.find((item) => item.locale === "ja" && item.slug === "");
  if (japanese.html.includes("<h1>Making logistics effortless.")) throw new Error("ja home still English");
  console.log(`Wrote ${written.length} pages, sitemap ${urls.length} urls`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
