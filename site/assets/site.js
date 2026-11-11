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
  var officeDirty = false;
  var started = false;

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

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (form.querySelector(".hp-field").value) return;
    if (!validate(step2)) return;
    var data = new FormData(form);
    var id = rfqId();
    var officeOption = office.options[office.selectedIndex];
    var officeName = officeOption.textContent;
    var email = officeOption.dataset.email;
    var lines = [
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
    ].filter(Boolean);
    var body = lines.join("\n");
    var mailto = "mailto:" + email + "?subject=" + encodeURIComponent(copy.subject + " " + id) + "&body=" + encodeURIComponent(body);
    confirm.hidden = false;
    step2.hidden = true;
    kicker.hidden = true;
    confirm.replaceChildren();
    var heading = document.createElement("h2");
    heading.textContent = copy.readyTitle;
    var paragraph = document.createElement("p");
    paragraph.textContent = copy.readyBody.replace("{id}", id).replace("{office}", officeName).replace("{email}", email);
    var actions = document.createElement("p");
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
    confirm.append(heading, paragraph, actions);
    track("rfq_submit", {
      service: service.value,
      office: office.value,
      rfq_id: id,
      country: data.get("country")
    });
    confirm.scrollIntoView({ block: "start" });
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
