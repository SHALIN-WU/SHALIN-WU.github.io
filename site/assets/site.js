(function () {
  window.dataLayer = window.dataLayer || [];

  function track(event, extra) {
    window.dataLayer.push(Object.assign({ event: event }, extra || {}));
  }

  var gtm = document.querySelector('meta[name="gtm-container"]');
  var gtmId = gtm && gtm.content ? gtm.content.trim() : "";
  if (/^GTM-[A-Z0-9]+$/.test(gtmId)) {
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(gtmId);
    document.head.appendChild(script);
  }

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a") && window.matchMedia("(max-width: 860px)").matches) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (nav && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (toggle) toggle.focus();
    }
    var details = document.querySelector(".services-details[open]");
    if (details) details.removeAttribute("open");
  });

  document.addEventListener("click", function (event) {
    var el = event.target.closest("[data-track]");
    if (!el) return;
    track(el.dataset.track, {
      service: el.dataset.service || undefined,
      office: el.dataset.office || undefined,
      locale: el.dataset.locale || undefined
    });
  });

  function cmsOrigin() {
    var host = location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host.slice(-10) === ".pages.dev") return "";
    return "https://northgo-73a.pages.dev";
  }

  function pageLocale() {
    var path = location.pathname;
    if (path === "/zh-tw" || path.indexOf("/zh-tw/") === 0) return "zh-tw";
    if (path === "/ja" || path.indexOf("/ja/") === 0) return "ja";
    if (path === "/vi" || path.indexOf("/vi/") === 0) return "vi";
    return "en";
  }

  function blockText(blocks, key) {
    var value = blocks[key];
    if (typeof value !== "string" || !value.replace(/^\s+|\s+$/g, "")) return "";
    return value;
  }

  function renderHeroTitle(heading, title, accent) {
    var word = accent;
    if (!word) {
      var current = heading.querySelector("[data-cms='home.hero.accent']");
      word = current ? current.textContent : "";
    }
    heading.textContent = "";
    if (word && title.indexOf(word) !== -1) {
      var index = title.indexOf(word);
      heading.appendChild(document.createTextNode(title.slice(0, index)));
      var em = document.createElement("em");
      em.setAttribute("data-cms", "home.hero.accent");
      em.textContent = word;
      heading.appendChild(em);
      heading.appendChild(document.createTextNode(title.slice(index + word.length)));
      return;
    }
    heading.textContent = title;
  }

  function applyBlocks(blocks) {
    var title = blockText(blocks, "home.hero.title");
    var accent = blockText(blocks, "home.hero.accent");
    document.querySelectorAll("[data-cms]").forEach(function (el) {
      var key = el.getAttribute("data-cms");
      if (el.querySelector("[data-cms]")) {
        if (key === "home.hero.title" && title) renderHeroTitle(el, title, accent);
        return;
      }
      var value = blockText(blocks, key);
      if (!value) return;
      el.textContent = value;
      if (key === "site.phone" && el.tagName === "A") {
        var tel = value.replace(/[^\d+]/g, "");
        if (tel) el.setAttribute("href", "tel:" + tel);
      }
      if (key === "site.email" && el.tagName === "A") {
        var email = value.replace(/^\s+|\s+$/g, "");
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) el.setAttribute("href", "mailto:" + email);
      }
    });
  }

  function applyPublishedContent() {
    if (!document.querySelector("[data-cms]")) return;
    var locale = pageLocale();
    fetch(cmsOrigin() + "/api/public/content?locale=" + encodeURIComponent(locale), { credentials: "omit" })
      .then(function (response) {
        if (!response.ok) throw new Error("cms");
        return response.json();
      })
      .then(function (payload) {
        if (!payload || !payload.blocks) return;
        applyBlocks(payload.blocks);
      })
      .catch(function () {});
  }

  var PAGE_NOT_FOUND = {
    en: "Page not found",
    "zh-tw": "找不到這個頁面",
    ja: "ページが見つかりません",
    vi: "Không tìm thấy trang"
  };
  var DYNAMIC_MEDIA_ID = "([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})";
  var DYNAMIC_MEDIA_ABS = new RegExp("^https://northgo-73a\\.pages\\.dev/api/media/" + DYNAMIC_MEDIA_ID + "$", "i");
  var DYNAMIC_MEDIA_REL = new RegExp("^/api/media/" + DYNAMIC_MEDIA_ID + "$", "i");

  function dynamicMediaId(line) {
    var text = String(line || "").replace(/^\s+|\s+$/g, "");
    var match = text.match(DYNAMIC_MEDIA_ABS) || text.match(DYNAMIC_MEDIA_REL);
    return match ? match[1].toLowerCase() : "";
  }

  function renderDynamicBody(container, value) {
    container.textContent = "";
    String(value || "").split("\n").forEach(function (line, index) {
      if (index) container.appendChild(document.createTextNode("\n"));
      var id = dynamicMediaId(line);
      if (!id) {
        container.appendChild(document.createTextNode(line));
        return;
      }
      var image = document.createElement("img");
      image.src = "https://northgo-73a.pages.dev/api/media/" + id;
      image.alt = "";
      container.appendChild(image);
    });
  }

  function syncDynamicLangs(slug) {
    var paths = { en: "/p/", "zh-tw": "/zh-tw/p/", ja: "/ja/p/", vi: "/vi/p/" };
    document.querySelectorAll("[data-dynamic-lang]").forEach(function (el) {
      var lang = el.getAttribute("data-dynamic-lang");
      var href = paths[lang] || "/p/";
      if (slug) href += "?slug=" + encodeURIComponent(slug);
      el.setAttribute("href", href);
    });
  }

  function showDynamicMissing(message) {
    var title = document.getElementById("page-title");
    var status = document.getElementById("page-status");
    var body = document.getElementById("page-body");
    var crumb = document.getElementById("page-crumb");
    if (title) title.textContent = message;
    if (crumb) crumb.textContent = message;
    if (body) body.textContent = "";
    if (status) {
      status.hidden = true;
      status.textContent = message;
    }
    document.title = message + " | Northgo";
  }

  function showDynamicPage(page) {
    var title = document.getElementById("page-title");
    var status = document.getElementById("page-status");
    var body = document.getElementById("page-body");
    var crumb = document.getElementById("page-crumb");
    if (title) title.textContent = page.title;
    if (crumb) crumb.textContent = page.title;
    if (status) {
      status.hidden = true;
      status.textContent = "";
    }
    if (body) renderDynamicBody(body, page.body);
    document.title = page.title + " | Northgo";
  }

  function loadDynamicPage() {
    var root = document.querySelector("[data-dynamic-page]");
    if (!root) return;
    var locale = pageLocale();
    var slug = (new URLSearchParams(location.search).get("slug") || "").replace(/^\s+|\s+$/g, "").toLowerCase();
    syncDynamicLangs(slug);
    var message = PAGE_NOT_FOUND[locale] || PAGE_NOT_FOUND.en;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length < 2 || slug.length > 48) {
      showDynamicMissing(message);
      return;
    }
    fetch(cmsOrigin() + "/api/public/pages?locale=" + encodeURIComponent(locale) + "&slug=" + encodeURIComponent(slug), { credentials: "omit" })
      .then(function (response) {
        if (!response.ok) throw new Error("missing");
        return response.json();
      })
      .then(function (payload) {
        var page = payload && payload.page;
        if (!page || typeof page.title !== "string" || typeof page.body !== "string") throw new Error("missing");
        showDynamicPage(page);
      })
      .catch(function () {
        showDynamicMissing(message);
      });
  }

  applyPublishedContent();
  loadDynamicPage();

  var form = document.getElementById("enquiry-form");
  if (!form) return;

  var copy = JSON.parse(document.getElementById("rfq-copy").textContent);
  var step1 = form.querySelector('[data-step="1"]');
  var step2 = form.querySelector('[data-step="2"]');
  var confirm = form.querySelector("[data-confirm]");
  var kicker = document.getElementById("step-kicker");
  var service = form.querySelector('[name="service"]');
  var cargo = form.querySelector('[name="cargo"]');
  var office = form.querySelector('[name="office"]');
  var country = form.querySelector('[name="country"]');
  var originLabel = document.getElementById("origin-label-text");
  var destWrap = document.getElementById("dest-wrap");
  var destLabel = document.getElementById("dest-label-text");
  var destInput = form.querySelector('[name="destination"]');
  var submitButton = form.querySelector('button[type="submit"]');
  var officeDirty = false;
  var started = false;
  var submitting = false;

  function fillCargo() {
    var key = service.value;
    var options = key ? (copy.cargoTypes[key] || copy.cargoTypes.other) : [];
    var current = cargo.value;
    cargo.innerHTML = "";
    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = copy.select;
    cargo.appendChild(placeholder);
    options.forEach(function (label) {
      var option = document.createElement("option");
      option.value = label;
      option.textContent = label;
      if (label === current) option.selected = true;
      cargo.appendChild(option);
    });
  }

  function applyServiceLabels() {
    var key = service.value;
    originLabel.textContent = copy.origin[key] || copy.origin.default;
    var dest = copy.destination[key] || copy.destination.default;
    var hideDest = key === "agency";
    destWrap.hidden = hideDest;
    destInput.required = !hideDest;
    destLabel.textContent = dest;
    fillCargo();
  }

  function suggestOffice() {
    if (officeDirty) return;
    var selected = country.options[country.selectedIndex];
    var suggested = selected && selected.dataset.office;
    if (suggested) office.value = suggested;
  }

  function clearErrors(scope) {
    scope.querySelectorAll(".field-error").forEach(function (node) { node.remove(); });
    scope.querySelectorAll("[aria-invalid]").forEach(function (node) { node.removeAttribute("aria-invalid"); });
  }

  function fail(field, message) {
    field.setAttribute("aria-invalid", "true");
    var note = document.createElement("span");
    note.className = "field-error";
    note.textContent = message;
    field.closest("label").appendChild(note);
    return field;
  }

  function validate(scope) {
    clearErrors(scope);
    var first = null;
    scope.querySelectorAll("input, select, textarea").forEach(function (field) {
      if (field.closest(".hp") || field.closest("[hidden]")) return;
      if (field.type === "checkbox") {
        if (field.required && !field.checked) first = first || fail(field, copy.terms);
        return;
      }
      if (field.required && !String(field.value || "").trim()) {
        first = first || fail(field, copy.required);
        return;
      }
      if (field.type === "email" && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        first = first || fail(field, copy.email);
      }
      if (field.type === "number" && field.value && Number(field.value) < 0) {
        first = first || fail(field, copy.number);
      }
    });
    if (first) first.focus();
    return !first;
  }

  form.addEventListener("focusin", function () {
    if (started) return;
    started = true;
    track("rfq_start", {});
  });

  service.addEventListener("change", applyServiceLabels);
  country.addEventListener("change", suggestOffice);
  office.addEventListener("change", function () { officeDirty = true; });

  form.querySelector("[data-next]").addEventListener("click", function () {
    if (!validate(step1)) return;
    step1.hidden = true;
    step2.hidden = false;
    confirm.hidden = true;
    kicker.textContent = copy.step2;
    service.focus();
  });

  form.querySelector("[data-back]").addEventListener("click", function () {
    step2.hidden = true;
    step1.hidden = false;
    kicker.textContent = copy.step1;
  });

  function rfqId() {
    var now = new Date();
    var stamp = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var bytes = new Uint32Array(4);
    crypto.getRandomValues(bytes);
    var tail = "";
    for (var i = 0; i < bytes.length; i++) tail += alphabet[bytes[i] % alphabet.length];
    return "NG-" + stamp + "-" + tail;
  }

  function buildMailBody(data, id, officeName) {
    return [
      copy.mailIntro + " " + id,
      copy.service + ": " + service.options[service.selectedIndex].textContent,
      copy.cargo + ": " + data.get("cargo"),
      copy.originLabel + ": " + data.get("origin"),
      data.get("destination") ? copy.destLabel + ": " + data.get("destination") : "",
      data.get("pieces") ? copy.pieces + ": " + data.get("pieces") : "",
      data.get("weight") ? copy.weight + ": " + data.get("weight") : "",
      data.get("volume") ? copy.volume + ": " + data.get("volume") : "",
      copy.ready + ": " + data.get("ready"),
      copy.office + ": " + officeName,
      "",
      data.get("first") + " " + data.get("last"),
      data.get("company"),
      data.get("email"),
      data.get("phone"),
      data.get("country"),
      "",
      data.get("message") || ""
    ].filter(Boolean).join("\n");
  }

  function showConfirm(title, bodyText, actions) {
    confirm.hidden = false;
    step2.hidden = true;
    kicker.hidden = true;
    confirm.replaceChildren();
    var heading = document.createElement("h2");
    heading.textContent = title;
    var paragraph = document.createElement("p");
    paragraph.textContent = bodyText;
    confirm.append(heading, paragraph);
    if (actions) confirm.append(actions);
    confirm.scrollIntoView({ block: "start" });
  }

  function mailtoFallback(data, id, officeName, email, notice) {
    var body = buildMailBody(data, id, officeName);
    var mailto = "mailto:" + email + "?subject=" + encodeURIComponent(copy.subject + " " + id) + "&body=" + encodeURIComponent(body);
    var actions = document.createElement("p");
    if (notice) {
      var note = document.createElement("p");
      note.textContent = notice;
      actions.append(note);
    }
    var mailLink = document.createElement("a");
    mailLink.className = "btn";
    mailLink.href = mailto;
    mailLink.textContent = copy.send.replace("{email}", email);
    var copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "btn ghost";
    copyButton.textContent = copy.copy;
    copyButton.addEventListener("click", function () {
      navigator.clipboard.writeText(body);
      copyButton.textContent = copy.copied;
    });
    actions.append(mailLink, document.createTextNode(" "), copyButton);
    showConfirm(
      copy.readyTitle,
      copy.readyBody.replace("{id}", id).replace("{office}", officeName).replace("{email}", email),
      actions
    );
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (submitting) return;
    if (form.querySelector(".hp-field").value) return;
    if (!validate(step2)) return;

    var data = new FormData(form);
    var id = rfqId();
    var officeOption = office.options[office.selectedIndex];
    var officeName = officeOption.textContent;
    var email = officeOption.dataset.email;
    var payload = {
      reference: id,
      locale: copy.locale || document.documentElement.lang || "en",
      first: data.get("first"),
      last: data.get("last"),
      company: data.get("company"),
      email: data.get("email"),
      phone: data.get("phone"),
      country: data.get("country"),
      service: service.value,
      serviceLabel: service.options[service.selectedIndex].textContent,
      cargo: data.get("cargo"),
      office: office.value,
      officeName: officeName,
      officeEmail: email,
      origin: data.get("origin"),
      destination: data.get("destination") || "",
      pieces: data.get("pieces") || "",
      weight: data.get("weight") || "",
      volume: data.get("volume") || "",
      ready: data.get("ready"),
      message: data.get("message") || "",
      company_website: data.get("company_website") || ""
    };

    submitting = true;
    var originalLabel = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = copy.submitting || "Sending…";

    try {
      var response = await fetch("https://northgo-73a.pages.dev/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok && response.status !== 204) throw new Error("save failed");
      if (response.status === 204) return;

      var result = await response.json().catch(function () { return {}; });
      var reference = result.reference || id;
      showConfirm(
        copy.submittedTitle || copy.readyTitle,
        (copy.submittedBody || copy.readyBody)
          .replace("{id}", reference)
          .replace("{office}", officeName)
          .replace("{email}", email)
      );
      track("rfq_submit", {
        service: service.value,
        office: office.value,
        rfq_id: reference,
        country: data.get("country"),
        channel: "api"
      });
    } catch (_) {
      mailtoFallback(data, id, officeName, email, copy.submitFailed || "");
      track("rfq_submit", {
        service: service.value,
        office: office.value,
        rfq_id: id,
        country: data.get("country"),
        channel: "mailto_fallback"
      });
    } finally {
      submitting = false;
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  });

  var params = new URLSearchParams(location.search);
  var wantedService = params.get("service") || "";
  var aliases = copy.aliases || {};
  if (aliases[wantedService]) wantedService = aliases[wantedService];
  if (wantedService && copy.cargoTypes[wantedService]) service.value = wantedService;
  var wantedOffice = params.get("office");
  if (wantedOffice && form.querySelector('[name="office"] option[value="' + wantedOffice + '"]')) {
    office.value = wantedOffice;
    officeDirty = true;
  }
  applyServiceLabels();
  if (!officeDirty) suggestOffice();
})();
