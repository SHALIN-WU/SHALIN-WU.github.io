(function () {
  var S = window.AdminShared;
  var MEDIA_ID = "([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})";
  var MEDIA_ABS = new RegExp("^https://northgo-73a\\.pages\\.dev/api/media/" + MEDIA_ID + "$", "i");
  var MEDIA_REL = new RegExp("^/api/media/" + MEDIA_ID + "$", "i");
  var LOCALE_LABEL = { en: "EN", "zh-tw": "繁中", ja: "日本語", vi: "VI" };

  var state = { canEdit: false, items: [], locale: "" };
  var hint = document.getElementById("pages-hint");
  var bodyEl = document.getElementById("pages-body");
  var localeFilter = document.getElementById("locale-filter");
  var createBtn = document.getElementById("create-btn");
  var reloadBtn = document.getElementById("reload-btn");

  function mediaId(line) {
    var text = String(line || "").replace(/^\s+|\s+$/g, "");
    var match = text.match(MEDIA_ABS) || text.match(MEDIA_REL);
    return match ? match[1].toLowerCase() : "";
  }

  function renderBody(container, value) {
    container.textContent = "";
    var lines = String(value || "").split("\n");
    lines.forEach(function (line, index) {
      if (index) container.appendChild(document.createTextNode("\n"));
      var id = mediaId(line);
      if (!id) {
        container.appendChild(document.createTextNode(line));
        return;
      }
      var img = document.createElement("img");
      img.src = "https://northgo-73a.pages.dev/api/media/" + id;
      img.alt = "";
      container.appendChild(img);
    });
  }

  function publicPath(locale, slug) {
    var prefix = locale === "en" ? "" : "/" + locale;
    return prefix + "/p/?slug=" + encodeURIComponent(slug);
  }

  function visibleItems() {
    return state.items.filter(function (item) {
      return !state.locale || item.locale === state.locale;
    });
  }

  function render() {
    hint.textContent = state.canEdit
      ? "內文是純文字。單獨一行貼上媒體庫網址才會顯示成圖片。"
      : "目前帳號只能查看頁面。有管理權限的角色才能新增、編輯、刪除或發布。";
    createBtn.hidden = !state.canEdit;
    var items = visibleItems();
    if (!items.length) {
      bodyEl.innerHTML = '<tr><td colspan="6"><div class="empty">還沒有頁面。</div></td></tr>';
      return;
    }
    bodyEl.innerHTML = items.map(function (item) {
      var status = item.published
        ? '<span class="badge active">已發布</span>'
        : '<span class="badge inactive">草稿</span>';
      var actions = '<a class="btn ghost" href="' + S.esc(publicPath(item.locale, item.slug)) + '" target="_blank" rel="noopener">查看</a>';
      if (state.canEdit) {
        actions += '<button class="btn ghost" type="button" data-publish="' + S.esc(item.id) + '">' +
          (item.published ? "下架" : "發布") + "</button>";
        actions += '<button class="icon-btn edit" type="button" data-edit="' + S.esc(item.id) + '" title="編輯" aria-label="編輯">' + S.ICONS.edit + "</button>";
        actions += '<button class="icon-btn delete" type="button" data-delete="' + S.esc(item.id) + '" data-name="' + S.esc(item.title) + '" title="刪除" aria-label="刪除">' + S.ICONS.trash + "</button>";
      }
      return "<tr>" +
        "<td><span class=\"handle\">" + S.esc(item.slug) + "</span></td>" +
        "<td>" + S.esc(LOCALE_LABEL[item.locale] || item.locale) + "</td>" +
        "<td>" + S.esc(item.title) + "</td>" +
        "<td>" + status + "</td>" +
        "<td>" + S.esc(S.formatDate(item.updatedAt)) + "</td>" +
        '<td class="actions-col"><div class="actions">' + actions + "</div></td>" +
        "</tr>";
    }).join("");
  }

  function findItem(id) {
    return state.items.find(function (item) { return item.id === id; }) || null;
  }

  function formHtml(item) {
    var creating = !item;
    var data = item || { slug: "", locale: "zh-tw", title: "", body: "", published: false };
    var locales = [
      ["en", "EN"],
      ["zh-tw", "繁中"],
      ["ja", "日本語"],
      ["vi", "VI"]
    ].map(function (pair) {
      return '<option value="' + pair[0] + '"' + (data.locale === pair[0] ? " selected" : "") + ">" + pair[1] + "</option>";
    }).join("");
    return '<form id="page-form" novalidate>' +
      "<h2>" + (creating ? "新增頁面" : "編輯頁面") + "</h2>" +
      '<p class="ref">同一網址代碼可以有四種語系，各自發布。</p>' +
      '<label class="field"><span>網址代碼 *</span><input name="slug" required maxlength="48" autocomplete="off" value="' + S.esc(data.slug) + '" placeholder="newsroom"></label>' +
      '<label class="field"><span>語系 *</span><select name="locale">' + locales + "</select></label>" +
      '<label class="field"><span>標題 *</span><input name="title" required maxlength="160" value="' + S.esc(data.title) + '"></label>' +
      '<label class="field"><span>內文</span><textarea name="body" maxlength="20000">' + S.esc(data.body) + "</textarea></label>" +
      '<label class="field check"><input name="published" type="checkbox"' + (data.published ? " checked" : "") + "><span>發布</span></label>" +
      '<div class="field"><span>預覽</span><div class="page-preview" id="page-preview"></div></div>' +
      '<div class="detail-actions">' +
        '<button class="btn primary" type="submit">' + (creating ? "建立" : "儲存") + "</button>" +
        '<button class="btn ghost" type="button" data-close-modal>取消</button>' +
      "</div></form>";
  }

  function openEditor(item) {
    S.openModal(formHtml(item), true);
    var form = document.getElementById("page-form");
    var preview = document.getElementById("page-preview");
    var bodyInput = form.querySelector('[name="body"]');
    function paint() { renderBody(preview, bodyInput.value); }
    bodyInput.addEventListener("input", paint);
    paint();
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      saveForm(form, item).catch(function (error) {
        if (error.message !== "unauthorized") S.toast(error.message, true);
      });
    });
  }

  function payloadFrom(form) {
    var data = new FormData(form);
    return {
      slug: String(data.get("slug") || ""),
      locale: String(data.get("locale") || ""),
      title: String(data.get("title") || ""),
      body: String(data.get("body") || ""),
      published: Boolean(form.querySelector('[name="published"]').checked)
    };
  }

  async function saveForm(form, item) {
    var submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      var payload = payloadFrom(form);
      if (item) {
        await S.api("/api/pages/" + item.id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        S.toast("已儲存");
      } else {
        await S.api("/api/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        S.toast("已建立");
      }
      S.closeModal();
      await load();
    } finally {
      submit.disabled = false;
    }
  }

  async function setPublished(item) {
    await S.api("/api/pages/" + item.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: item.slug,
        locale: item.locale,
        title: item.title,
        body: item.body,
        published: !item.published
      })
    });
    S.toast(item.published ? "已下架" : "已發布");
    await load();
  }

  async function remove(item) {
    if (!window.confirm("確定刪除「" + item.title + "」？")) return;
    await S.api("/api/pages/" + item.id, { method: "DELETE" });
    S.toast("已刪除");
    await load();
  }

  async function load() {
    var payload = await S.api("/api/pages");
    state.canEdit = Boolean(payload.canEdit);
    state.items = payload.items || [];
    render();
  }

  localeFilter.addEventListener("change", function () {
    state.locale = localeFilter.value;
    render();
  });

  reloadBtn.addEventListener("click", function () {
    load()
      .then(function () { S.toast("已重新載入"); })
      .catch(function (error) {
        if (error.message !== "unauthorized") S.toast(error.message || "無法載入頁面", true);
      });
  });

  createBtn.addEventListener("click", function () {
    if (!state.canEdit) return;
    openEditor(null);
  });

  bodyEl.addEventListener("click", function (event) {
    var button = event.target.closest("[data-publish], [data-edit], [data-delete]");
    if (!button) return;
    var item = findItem(button.getAttribute("data-publish") || button.getAttribute("data-edit") || button.getAttribute("data-delete"));
    if (!item) return;
    var action = button.hasAttribute("data-publish")
      ? setPublished(item)
      : button.hasAttribute("data-edit")
        ? openEditor(item)
        : remove(item);
    Promise.resolve(action).catch(function (error) {
      if (error.message !== "unauthorized") S.toast(error.message || "操作失敗", true);
    });
  });

  S.bindModalChrome();
  S.bindLogout();
  S.ensureAuth()
    .then(load)
    .catch(function (error) {
      if (error.message !== "unauthorized") S.toast(error.message || "無法載入頁面", true);
    });
})();
