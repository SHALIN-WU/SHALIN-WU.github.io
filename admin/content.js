(function () {
  var S = window.AdminShared;
  var LOCALE_LABELS = { en: "EN", "zh-tw": "繁中", ja: "日本語", vi: "VI" };

  var state = {
    me: null,
    canEdit: false,
    locale: "zh-tw",
    locales: [],
    keys: [],
    values: {}
  };

  var localeSwitch = document.getElementById("locale-switch");
  var form = document.getElementById("content-form");
  var saveBtn = document.getElementById("save-btn");
  var reloadBtn = document.getElementById("reload-btn");
  var previewBtn = document.getElementById("preview-btn");

  function homePath(locale) {
    return locale === "en" ? "/" : "/" + locale + "/";
  }

  function capture() {
    if (!form) return;
    form.querySelectorAll("[name]").forEach(function (el) {
      if (!state.values[el.name]) state.values[el.name] = {};
      state.values[el.name][state.locale] = el.value;
    });
  }

  function renderLocales() {
    localeSwitch.innerHTML = state.locales.map(function (locale) {
      var selected = locale === state.locale;
      return '<button type="button" role="tab" data-locale="' + S.esc(locale) + '" aria-selected="' + (selected ? "true" : "false") + '">' +
        S.esc(LOCALE_LABELS[locale] || locale) + "</button>";
    }).join("");
  }

  function renderForm() {
    var disabled = state.canEdit ? "" : " disabled";
    var hint = state.canEdit
      ? "留白會讓公開網站沿用頁面上原來的句子。斜體字要出現在標題裡，首頁才會維持斜體。"
      : "目前帳號只能查看內容。有編輯權限的角色才能儲存。";
    var groups = [];
    state.keys.forEach(function (field) {
      var last = groups[groups.length - 1];
      if (!last || last.name !== field.group) {
        groups.push({ name: field.group, fields: [field] });
      } else {
        last.fields.push(field);
      }
    });

    form.innerHTML = '<p class="content-hint">' + S.esc(hint) + "</p>" + groups.map(function (group) {
      var fields = group.fields.map(function (field) {
        var value = (state.values[field.key] && state.values[field.key][state.locale]) || "";
        var control = field.multiline
          ? '<textarea name="' + S.esc(field.key) + '" maxlength="2000"' + disabled + ">" + S.esc(value) + "</textarea>"
          : '<input name="' + S.esc(field.key) + '" maxlength="2000" value="' + S.esc(value) + '"' + disabled + ">";
        return '<label class="field' + (field.multiline ? " span-2" : "") + '"><span>' + S.esc(field.label) + "</span>" + control + "</label>";
      }).join("");
      return '<h2 class="content-group">' + S.esc(group.name) + '</h2><div class="form-grid">' + fields + "</div>";
    }).join("");
    saveBtn.hidden = !state.canEdit;
  }

  function applyPayload(payload) {
    state.locales = payload.locales || [];
    state.keys = payload.keys || [];
    state.canEdit = Boolean(payload.canEdit);
    state.values = {};
    state.keys.forEach(function (field) {
      state.values[field.key] = Object.assign({}, field.values || {});
    });
    if (state.locales.indexOf(state.locale) < 0) state.locale = state.locales[0] || "en";
    renderLocales();
    renderForm();
  }

  function loadContent() {
    return S.api("/api/content").then(applyPayload);
  }

  function payloadItems() {
    capture();
    return {
      items: state.keys.map(function (field) {
        var values = {};
        state.locales.forEach(function (locale) {
          values[locale] = (state.values[field.key] && state.values[field.key][locale]) || "";
        });
        return { key: field.key, values: values };
      })
    };
  }

  localeSwitch.addEventListener("click", function (event) {
    var button = event.target.closest("[data-locale]");
    if (!button) return;
    var next = button.getAttribute("data-locale");
    if (!next || next === state.locale) return;
    capture();
    state.locale = next;
    renderLocales();
    renderForm();
  });

  reloadBtn.addEventListener("click", function () {
    loadContent()
      .then(function () { S.toast("已重新載入"); })
      .catch(function (error) {
        if (error.message !== "unauthorized") S.toast(error.message || "無法載入網站內容", true);
      });
  });

  previewBtn.addEventListener("click", function () {
    window.open(homePath(state.locale), "_blank", "noopener");
  });

  saveBtn.addEventListener("click", function () {
    if (!state.canEdit) return;
    saveBtn.disabled = true;
    S.api("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadItems())
    }).then(function (payload) {
      applyPayload(payload);
      S.toast("已儲存");
    }).catch(function (error) {
      if (error.message !== "unauthorized") S.toast(error.message || "無法儲存", true);
    }).finally(function () {
      saveBtn.disabled = false;
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (state.canEdit) saveBtn.click();
  });

  S.bindLogout();

  S.ensureAuth()
    .then(function (me) {
      state.me = me;
      return loadContent();
    })
    .catch(function (error) {
      if (error.message !== "unauthorized") S.toast(error.message || "無法載入網站內容", true);
    });
})();
