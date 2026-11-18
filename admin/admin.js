(function () {
  var STATUS_LABELS = {
    all: "全部",
    new: "新詢價",
    in_progress: "處理中",
    quoted: "已報價",
    closed: "已結案",
    spam: "垃圾"
  };

  var state = {
    username: "",
    status: "all",
    office: "",
    q: "",
    items: [],
    counts: {},
    selectedId: null,
    selected: null,
    mode: "view", // view | edit | create
    meta: { offices: [], services: [], locales: [], statuses: [] }
  };

  var statsEl = document.getElementById("stats");
  var listEl = document.getElementById("inquiry-list");
  var detailBody = document.getElementById("detail-body");
  var detailEmpty = document.getElementById("detail-empty");
  var searchInput = document.getElementById("search-input");
  var officeFilter = document.getElementById("office-filter");
  var refreshBtn = document.getElementById("refresh-btn");
  var logoutBtn = document.getElementById("logout-btn");
  var createBtn = document.getElementById("create-btn");
  var adminUser = document.getElementById("admin-user");
  var toastEl = document.getElementById("toast");

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(value) {
    if (!value) return "—";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function toast(message, isError) {
    toastEl.hidden = false;
    toastEl.textContent = message;
    toastEl.classList.toggle("is-error", Boolean(isError));
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () { toastEl.hidden = true; }, 2600);
  }

  async function api(url, options) {
    var response = await fetch(url, Object.assign({ credentials: "same-origin" }, options || {}));
    if (response.status === 401) {
      location.replace("/admin/login.html");
      throw new Error("unauthorized");
    }
    var payload = null;
    var text = await response.text();
    if (text) {
      try { payload = JSON.parse(text); } catch (_) { payload = { error: text }; }
    }
    if (!response.ok) {
      throw new Error((payload && payload.error) || "Request failed");
    }
    return payload;
  }

  function emptyForm() {
    return {
      first: "",
      last: "",
      company: "",
      email: "",
      phone: "",
      country: "",
      service: "ocean",
      cargo: "",
      office: "tpe",
      origin: "",
      destination: "",
      pieces: "",
      weight: "",
      volume: "",
      ready: "",
      message: "",
      locale: "zh-tw",
      status: "new",
      notes: "",
      reference: ""
    };
  }

  function optionsHtml(items, selected, valueKey, labelKey) {
    return items.map(function (item) {
      var value = item[valueKey];
      var label = item[labelKey];
      return '<option value="' + esc(value) + '"' + (value === selected ? " selected" : "") + ">" + esc(label) + "</option>";
    }).join("");
  }

  function statusOptions(selected) {
    return state.meta.statuses.map(function (status) {
      return '<option value="' + esc(status) + '"' + (status === selected ? " selected" : "") + ">" +
        esc(STATUS_LABELS[status] || status) + "</option>";
    }).join("");
  }

  function formField(name, label, value, attrs) {
    return (
      '<label class="field">' +
        "<span>" + esc(label) + "</span>" +
        '<input name="' + esc(name) + '" value="' + esc(value || "") + '" ' + (attrs || "") + ">" +
      "</label>"
    );
  }

  function renderForm(data, mode) {
    var title = mode === "create" ? "新增詢價" : "編輯詢價";
    var serviceOptions = optionsHtml(state.meta.services, data.service, "id", "label");
    var officeOptions = optionsHtml(state.meta.offices, data.office, "id", "name");
    var localeOptions = optionsHtml(state.meta.locales, data.locale || "zh-tw", "id", "label");

    return (
      '<form id="inquiry-form" class="inquiry-form" novalidate>' +
        "<h2>" + esc(title) + "</h2>" +
        (data.reference
          ? '<p class="ref">' + esc(data.reference) + (data.createdAt ? " · " + esc(formatDate(data.createdAt)) : "") + "</p>"
          : '<p class="ref">後台手動建立</p>') +
        '<div class="form-grid">' +
          formField("first", "名字 *", data.first, "required autocomplete=\"given-name\"") +
          formField("last", "姓氏 *", data.last, "required autocomplete=\"family-name\"") +
          '<label class="field span-2"><span>公司 *</span><input name="company" value="' + esc(data.company || "") + '" required></label>' +
          formField("email", "Email *", data.email, "type=\"email\" required") +
          formField("phone", "電話 *", data.phone, "required") +
          '<label class="field span-2"><span>國家 *</span><input name="country" value="' + esc(data.country || "") + '" required></label>' +
          '<label class="field"><span>服務 *</span><select name="service" required>' + serviceOptions + "</select></label>" +
          formField("cargo", "貨型 *", data.cargo, "required") +
          '<label class="field"><span>辦公室 *</span><select name="office" required>' + officeOptions + "</select></label>" +
          '<label class="field"><span>語系</span><select name="locale">' + localeOptions + "</select></label>" +
          formField("origin", "起運地 *", data.origin, "required") +
          formField("destination", "目的地", data.destination, "") +
          formField("pieces", "件數", data.pieces, "") +
          formField("weight", "重量 (kg)", data.weight, "") +
          formField("volume", "體積 (cbm)", data.volume, "") +
          formField("ready", "可出貨日 *", data.ready, "type=\"date\" required") +
          '<label class="field"><span>狀態</span><select name="status">' + statusOptions(data.status || "new") + "</select></label>" +
          '<label class="field span-2"><span>補充說明</span><textarea name="message">' + esc(data.message || "") + "</textarea></label>" +
          '<label class="field span-2"><span>內部備註</span><textarea name="notes">' + esc(data.notes || "") + "</textarea></label>" +
        "</div>" +
        '<div class="detail-actions">' +
          '<button class="btn" type="submit">' + (mode === "create" ? "建立" : "儲存") + "</button>" +
          '<button class="btn ghost" type="button" id="cancel-form-btn">取消</button>' +
          (mode === "edit"
            ? '<button class="btn danger" type="button" id="delete-btn">刪除</button>'
            : "") +
        "</div>" +
      "</form>"
    );
  }

  function renderReadonly(item) {
    function row(label, value) {
      if (!value) return "";
      return "<dt>" + esc(label) + "</dt><dd>" + esc(value) + "</dd>";
    }
    return (
      "<h2>" + esc(item.first + " " + item.last) + "</h2>" +
      '<p class="ref">' + esc(item.reference) + " · " + esc(formatDate(item.createdAt)) + "</p>" +
      '<dl class="kv">' +
        row("公司", item.company) +
        row("Email", item.email) +
        row("電話", item.phone) +
        row("國家", item.country) +
        row("服務", item.serviceLabel || item.service) +
        row("貨型", item.cargo) +
        row("辦公室", item.officeName) +
        row("辦公室信箱", item.officeEmail) +
        row("起運地", item.origin) +
        row("目的地", item.destination) +
        row("件數", item.pieces) +
        row("重量", item.weight) +
        row("體積", item.volume) +
        row("可出貨日", item.ready) +
        row("語系", item.locale) +
        row("狀態", STATUS_LABELS[item.status] || item.status) +
        row("補充說明", item.message) +
        row("內部備註", item.notes) +
        row("更新時間", formatDate(item.updatedAt)) +
      "</dl>" +
      '<div class="detail-actions">' +
        '<button class="btn" type="button" id="edit-btn">編輯</button>' +
        '<a class="btn ghost" href="mailto:' + esc(item.email) +
          "?subject=" + encodeURIComponent("Re: Northgo " + item.reference) + '">回信客戶</a>' +
        '<button class="btn danger" type="button" id="delete-btn">刪除</button>' +
      "</div>"
    );
  }

  function bindDetailActions() {
    var form = document.getElementById("inquiry-form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        saveForm(form).catch(function (error) {
          if (error.message !== "unauthorized") toast(error.message, true);
        });
      });
    }
    var cancelBtn = document.getElementById("cancel-form-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        if (state.mode === "create") {
          state.mode = "view";
          state.selected = null;
          state.selectedId = null;
        } else {
          state.mode = "view";
        }
        renderDetail();
        renderList();
      });
    }
    var editBtn = document.getElementById("edit-btn");
    if (editBtn) {
      editBtn.addEventListener("click", function () {
        state.mode = "edit";
        renderDetail();
      });
    }
    var deleteBtn = document.getElementById("delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", function () {
        deleteSelected().catch(function (error) {
          if (error.message !== "unauthorized") toast(error.message, true);
        });
      });
    }
  }

  function readForm(form) {
    var data = new FormData(form);
    return {
      first: String(data.get("first") || "").trim(),
      last: String(data.get("last") || "").trim(),
      company: String(data.get("company") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      country: String(data.get("country") || "").trim(),
      service: String(data.get("service") || "").trim(),
      cargo: String(data.get("cargo") || "").trim(),
      office: String(data.get("office") || "").trim(),
      origin: String(data.get("origin") || "").trim(),
      destination: String(data.get("destination") || "").trim(),
      pieces: String(data.get("pieces") || "").trim(),
      weight: String(data.get("weight") || "").trim(),
      volume: String(data.get("volume") || "").trim(),
      ready: String(data.get("ready") || "").trim(),
      message: String(data.get("message") || "").trim(),
      locale: String(data.get("locale") || "").trim(),
      status: String(data.get("status") || "new").trim(),
      notes: String(data.get("notes") || "").trim()
    };
  }

  async function saveForm(form) {
    var payload = readForm(form);
    if (state.mode === "create") {
      var created = await api("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      toast("已建立詢價 " + (created.reference || ""));
      state.selectedId = created.id;
      state.selected = created.item || null;
      state.mode = "view";
      await loadList();
      if (!state.selected && state.selectedId) await selectInquiry(state.selectedId);
      return;
    }

    var updated = await api("/api/inquiries/" + encodeURIComponent(state.selected.id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    toast("已儲存變更");
    state.selected = updated.item;
    state.selectedId = updated.item.id;
    state.mode = "view";
    await loadList();
  }

  async function ensureAuth() {
    var me = await api("/api/auth/me");
    state.username = me.username || "";
    adminUser.textContent = state.username;
  }

  async function loadMeta() {
    state.meta = await api("/api/meta");
    officeFilter.innerHTML = '<option value="">全部辦公室</option>' +
      state.meta.offices.map(function (office) {
        return '<option value="' + esc(office.id) + '">' + esc(office.name) + "</option>";
      }).join("");
    officeFilter.value = state.office;
  }

  function renderStats() {
    var keys = ["all", "new", "in_progress", "quoted", "closed", "spam"];
    statsEl.innerHTML = keys.map(function (key) {
      var active = state.status === key ? " is-active" : "";
      return (
        '<article class="stat' + active + '">' +
          '<button type="button" data-status="' + key + '">' +
            '<div class="label">' + esc(STATUS_LABELS[key]) + "</div>" +
            '<div class="value">' + esc(state.counts[key] || 0) + "</div>" +
          "</button>" +
        "</article>"
      );
    }).join("");
  }

  function renderList() {
    if (!state.items.length) {
      listEl.innerHTML = '<p class="empty">目前沒有符合條件的詢價。</p>';
      return;
    }
    listEl.innerHTML = state.items.map(function (item) {
      var selected = item.id === state.selectedId ? " is-selected" : "";
      return (
        '<button class="row' + selected + '" type="button" data-id="' + esc(item.id) + '">' +
          '<div class="row-top">' +
            '<span class="row-title">' + esc(item.company || (item.first + " " + item.last)) + "</span>" +
            '<span class="badge ' + esc(item.status) + '">' + esc(STATUS_LABELS[item.status] || item.status) + "</span>" +
          "</div>" +
          '<div class="row-sub">' + esc(item.serviceLabel || item.service) + " · " + esc(item.officeName || item.office) + "</div>" +
          '<div class="meta">' +
            "<span>" + esc(item.reference) + "</span>" +
            "<span>" + esc(formatDate(item.createdAt)) + "</span>" +
          "</div>" +
        "</button>"
      );
    }).join("");
  }

  function renderDetail() {
    if (state.mode === "create") {
      detailEmpty.hidden = true;
      detailBody.hidden = false;
      detailBody.innerHTML = renderForm(emptyForm(), "create");
      bindDetailActions();
      return;
    }

    var item = state.selected;
    if (!item) {
      detailBody.hidden = true;
      detailEmpty.hidden = false;
      return;
    }

    detailEmpty.hidden = true;
    detailBody.hidden = false;
    detailBody.innerHTML = state.mode === "edit" ? renderForm(item, "edit") : renderReadonly(item);
    bindDetailActions();
  }

  async function loadList() {
    var params = new URLSearchParams();
    if (state.status && state.status !== "all") params.set("status", state.status);
    if (state.office) params.set("office", state.office);
    if (state.q) params.set("q", state.q);
    params.set("limit", "200");
    var data = await api("/api/inquiries?" + params.toString());
    state.items = data.items || [];
    state.counts = data.counts || {};
    if (state.selectedId && state.mode !== "create") {
      state.selected = state.items.find(function (item) { return item.id === state.selectedId; }) || state.selected;
      if (!state.selected || state.selected.id !== state.selectedId) {
        state.selectedId = null;
        state.selected = null;
        state.mode = "view";
      }
    }
    renderStats();
    renderList();
    renderDetail();
  }

  async function selectInquiry(id) {
    state.selectedId = id;
    state.mode = "view";
    state.selected = state.items.find(function (item) { return item.id === id; }) || null;
    renderList();
    if (!state.selected) {
      var data = await api("/api/inquiries/" + encodeURIComponent(id));
      state.selected = data.item;
    }
    renderDetail();
  }

  async function deleteSelected() {
    if (!state.selected) return;
    if (!window.confirm("確定刪除這筆詢價？此動作無法復原。")) return;
    await api("/api/inquiries/" + encodeURIComponent(state.selected.id), { method: "DELETE" });
    toast("已刪除");
    state.selected = null;
    state.selectedId = null;
    state.mode = "view";
    await loadList();
  }

  function startCreate() {
    state.mode = "create";
    state.selected = null;
    state.selectedId = null;
    renderList();
    renderDetail();
    detailBody.scrollIntoView({ block: "start" });
  }

  statsEl.addEventListener("click", function (event) {
    var button = event.target.closest("[data-status]");
    if (!button) return;
    state.status = button.getAttribute("data-status");
    loadList().catch(function (error) {
      if (error.message !== "unauthorized") toast(error.message, true);
    });
  });

  listEl.addEventListener("click", function (event) {
    var button = event.target.closest("[data-id]");
    if (!button) return;
    selectInquiry(button.getAttribute("data-id")).catch(function (error) {
      if (error.message !== "unauthorized") toast(error.message, true);
    });
  });

  var searchTimer = null;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.q = searchInput.value.trim();
      loadList().catch(function (error) {
        if (error.message !== "unauthorized") toast(error.message, true);
      });
    }, 250);
  });

  officeFilter.addEventListener("change", function () {
    state.office = officeFilter.value;
    loadList().catch(function (error) {
      if (error.message !== "unauthorized") toast(error.message, true);
    });
  });

  refreshBtn.addEventListener("click", function () {
    loadList().catch(function (error) {
      if (error.message !== "unauthorized") toast(error.message, true);
    });
  });

  createBtn.addEventListener("click", startCreate);

  logoutBtn.addEventListener("click", async function () {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch (_) {}
    location.replace("/admin/login.html");
  });

  ensureAuth()
    .then(loadMeta)
    .then(loadList)
    .catch(function (error) {
      if (error.message !== "unauthorized") toast(error.message || "無法載入後台", true);
    });
})();
