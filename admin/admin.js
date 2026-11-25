(function () {
  var S = window.AdminShared;
  var STATUS_LABELS = {
    all: "全部",
    new: "新進",
    in_progress: "處理中",
    replied: "已回覆"
  };
  var STATUS_KEYS = ["new", "in_progress", "replied"];

  var state = {
    status: "all",
    office: "",
    q: "",
    page: 1,
    pageSize: 20,
    items: [],
    selected: null,
    mode: "view",
    canEdit: false,
    canCreate: false,
    canDelete: false,
    canWrite: false,
    canAssign: false,
    canEditFields: false,
    ownOnly: false,
    allowedStatuses: STATUS_KEYS.slice(),
    createStatuses: STATUS_KEYS.slice(),
    assignees: [],
    meta: { offices: [], services: [], locales: [], statuses: [] }
  };

  var tableBody = document.getElementById("inquiry-table-body");
  var pagerMeta = document.getElementById("pager-meta");
  var prevBtn = document.getElementById("prev-page");
  var nextBtn = document.getElementById("next-page");
  var searchInput = document.getElementById("search-input");
  var statusFilter = document.getElementById("status-filter");
  var officeFilter = document.getElementById("office-filter");
  var pageSizeSelect = document.getElementById("page-size");
  var refreshBtn = document.getElementById("refresh-btn");
  var createBtn = document.getElementById("create-btn");
  var accessHint = document.getElementById("access-hint");
  var settingsBtn = document.getElementById("settings-btn");
  var settingsMenu = document.getElementById("settings-menu");

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
      return '<option value="' + S.esc(value) + '"' + (value === selected ? " selected" : "") + ">" + S.esc(label) + "</option>";
    }).join("");
  }

  function statusList() {
    var fromMeta = state.meta && Array.isArray(state.meta.statuses) ? state.meta.statuses : [];
    return fromMeta.length ? fromMeta : STATUS_KEYS;
  }

  function statusOptions(selected, keys) {
    var list = keys && keys.length ? keys : statusList();
    return list.map(function (status) {
      return '<option value="' + S.esc(status) + '"' + (status === selected ? " selected" : "") + ">" +
        S.esc(STATUS_LABELS[status] || status) + "</option>";
    }).join("");
  }

  function statusChoices(current, creating) {
    var base = creating
      ? (state.createStatuses.length ? state.createStatuses.slice() : STATUS_KEYS.slice())
      : (state.allowedStatuses.length ? state.allowedStatuses.slice() : STATUS_KEYS.slice());
    if (!creating && current && base.indexOf(current) < 0) base.unshift(current);
    return base;
  }

  function assigneeOptions(selected) {
    var known = false;
    var html = '<option value="">未指派</option>' + state.assignees.map(function (user) {
      if (user.id === selected) known = true;
      var label = (user.displayName || user.username || "使用者") + (user.roleName ? " · " + user.roleName : "");
      return '<option value="' + S.esc(user.id) + '"' + (user.id === selected ? " selected" : "") + ">" +
        S.esc(label) + "</option>";
    }).join("");
    if (selected && !known) {
      html += '<option value="' + S.esc(selected) + '" selected>目前負責人</option>';
    }
    return html;
  }

  function assigneeField(selected) {
    if (!state.canAssign) return "";
    return '<label class="field span-2"><span>負責客服</span><select name="assigneeId">' +
      assigneeOptions(selected || "") + "</select></label>";
  }

  function revealUpdatedStatus(item) {
    if (!item || !item.status) return;
    if (state.status && state.status !== "all" && item.status !== state.status) {
      state.status = "all";
      if (statusFilter) statusFilter.value = "all";
    }
  }

  function formField(name, label, value, attrs) {
    return (
      '<label class="field">' +
        "<span>" + S.esc(label) + "</span>" +
        '<input name="' + S.esc(name) + '" value="' + S.esc(value || "") + '" ' + (attrs || "") + ">" +
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
        "<h2>" + S.esc(title) + "</h2>" +
        (data.reference
          ? '<p class="ref">' + S.esc(data.reference) + (data.createdAt ? " · " + S.esc(S.formatDate(data.createdAt)) : "") + "</p>"
          : '<p class="ref">後台手動建立</p>') +
        '<div class="form-grid">' +
          formField("first", "名字 *", data.first, "required autocomplete=\"given-name\"") +
          formField("last", "姓氏 *", data.last, "required autocomplete=\"family-name\"") +
          '<label class="field span-2"><span>公司 *</span><input name="company" value="' + S.esc(data.company || "") + '" required></label>' +
          formField("email", "Email *", data.email, "type=\"email\" required") +
          formField("phone", "電話 *", data.phone, "required") +
          '<label class="field span-2"><span>國家 *</span><input name="country" value="' + S.esc(data.country || "") + '" required></label>' +
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
          '<label class="field"><span>狀態 *</span><select name="status" required>' + statusOptions(data.status || "new", statusChoices(data.status, mode === "create")) + "</select></label>" +
          assigneeField(data.assigneeId) +
          '<label class="field span-2"><span>補充說明</span><textarea name="message">' + S.esc(data.message || "") + "</textarea></label>" +
          '<label class="field span-2"><span>內部備註</span><textarea name="notes">' + S.esc(data.notes || "") + "</textarea></label>" +
        "</div>" +
        '<div class="detail-actions">' +
          '<button class="btn primary" type="submit">' + (mode === "create" ? "建立" : "儲存") + "</button>" +
          '<button class="btn ghost" type="button" data-close-modal>取消</button>' +
          (mode === "edit" && state.canDelete ? '<button class="btn danger" type="button" id="delete-btn">刪除</button>' : "") +
        "</div>" +
      "</form>"
    );
  }

  function renderReadonly(item) {
    function row(label, value) {
      if (!value) return "";
      return "<dt>" + S.esc(label) + "</dt><dd>" + S.esc(value) + "</dd>";
    }
    return (
      "<h2>" + S.esc(item.first + " " + item.last) + "</h2>" +
      '<p class="ref">' + S.esc(item.reference) + " · " + S.esc(S.formatDate(item.createdAt)) + "</p>" +
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
        row("負責人", item.assigneeName || "未指派") +
        row("補充說明", item.message) +
        row("內部備註", item.notes) +
        row("更新時間", S.formatDate(item.updatedAt)) +
      "</dl>" +
      '<div class="detail-actions">' +
        (state.canEdit ? '<button class="btn primary" type="button" id="edit-btn">' + (state.canEditFields ? "編輯" : "更新狀態") + "</button>" : "") +
        (state.canWrite ? '<button class="btn ghost" type="button" id="reply-quote-btn">回信並標為已回覆</button>' : "") +
        (state.canDelete ? '<button class="btn danger" type="button" id="delete-btn">刪除</button>' : "") +
        '<button class="btn ghost" type="button" data-close-modal>關閉</button>' +
      "</div>"
    );
  }

  function renderLimited(item) {
    var hint = state.canWrite
      ? "可以修改狀態與備註。不能刪除這筆詢問。"
      : "只能把狀態改成處理中，或維持目前狀態並更新備註。不能改成已回覆，也不能刪除。";
    return (
      '<form id="inquiry-form" class="inquiry-form" novalidate>' +
        "<h2>更新狀態</h2>" +
        '<p class="ref">' + S.esc(item.reference || "") + " · " + S.esc((item.first || "") + " " + (item.last || "")).trim() + "</p>" +
        '<p class="media-hint">' + S.esc(hint) + "</p>" +
        '<div class="form-grid">' +
          '<label class="field"><span>狀態 *</span><select name="status" required>' +
            statusOptions(item.status || "new", statusChoices(item.status, false)) +
          "</select></label>" +
          assigneeField(item.assigneeId) +
          '<label class="field span-2"><span>內部備註</span><textarea name="notes">' + S.esc(item.notes || "") + "</textarea></label>" +
        "</div>" +
        '<div class="detail-actions">' +
          '<button class="btn primary" type="submit">儲存</button>' +
          '<button class="btn ghost" type="button" data-close-modal>取消</button>' +
        "</div>" +
      "</form>"
    );
  }

  function showFormError(message) {
    var form = document.getElementById("inquiry-form");
    if (!form) {
      S.toast(message, true);
      return;
    }
    var existing = form.querySelector(".form-error");
    if (!existing) {
      existing = document.createElement("p");
      existing.className = "form-error";
      existing.setAttribute("role", "alert");
      var actions = form.querySelector(".detail-actions");
      if (actions) form.insertBefore(existing, actions);
      else form.appendChild(existing);
    }
    existing.hidden = false;
    existing.textContent = message;
    S.toast(message, true);
  }

  function clearFormError() {
    var existing = document.querySelector("#inquiry-form .form-error");
    if (existing) existing.hidden = true;
  }

  function bindModalActions() {
    var form = document.getElementById("inquiry-form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearFormError();
        saveForm(form).catch(function (error) {
          if (error.message !== "unauthorized") showFormError(error.message || "儲存失敗");
        });
      });
    }
    var editBtn = document.getElementById("edit-btn");
    if (editBtn) {
      editBtn.addEventListener("click", function () {
        state.mode = "edit";
        openModalForSelection();
      });
    }
    var replyBtn = document.getElementById("reply-quote-btn");
    if (replyBtn) {
      replyBtn.addEventListener("click", function () {
        replyQuote().catch(function (error) {
          if (error.message !== "unauthorized") S.toast(error.message || "回信報價失敗", true);
        });
      });
    }
    var deleteBtn = document.getElementById("delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", function () {
        deleteSelected().catch(function (error) {
          if (error.message !== "unauthorized") S.toast(error.message, true);
        });
      });
    }
  }

  function openModalForSelection() {
    if (state.mode === "create") {
      S.openModal(renderForm(emptyForm(), "create"), true);
    } else if (state.mode === "edit" && state.selected && state.canEditFields) {
      S.openModal(renderForm(state.selected, "edit"), true);
    } else if (state.mode === "edit" && state.selected) {
      S.openModal(renderLimited(state.selected), false);
    } else if (state.selected) {
      S.openModal(renderReadonly(state.selected), true);
    } else {
      return;
    }
    bindModalActions();
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
      status: String(data.get("status") || "").trim(),
      notes: String(data.get("notes") || "").trim()
    };
  }

  function withAssignee(payload, form) {
    if (form.querySelector('[name="assigneeId"]')) {
      payload.assigneeId = String(new FormData(form).get("assigneeId") || "");
    }
    return payload;
  }

  async function saveForm(form) {
    var creating = state.mode === "create";
    var payload = withAssignee(readForm(form), form);
    var choices = statusChoices(state.selected && state.selected.status, creating);
    if (!payload.status) {
      throw new Error("請選擇狀態");
    }
    if (choices.indexOf(payload.status) < 0) {
      throw new Error("狀態不正確，請重新選擇");
    }
    if (!creating && (!state.selected || !state.selected.id)) {
      throw new Error("找不到要儲存的詢價");
    }

    if (creating) {
      var created = await S.api("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      S.toast("已建立詢價 " + (created.reference || ""));
      state.selected = created.item || null;
      state.mode = "view";
      S.closeModal();
      await loadList();
      return;
    }

    var requestBody = payload;
    var method = "PUT";
    if (!state.canEditFields) {
      method = "PATCH";
      requestBody = { status: payload.status, notes: payload.notes };
      if (Object.prototype.hasOwnProperty.call(payload, "assigneeId")) requestBody.assigneeId = payload.assigneeId;
    }

    var updated = await S.api("/api/inquiries/" + encodeURIComponent(state.selected.id), {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    if (!updated || !updated.item) {
      throw new Error("儲存失敗：伺服器未回傳資料");
    }
    if (updated.item.status !== payload.status) {
      throw new Error(
        "狀態未能寫入資料庫（仍為「" +
          (STATUS_LABELS[updated.item.status] || updated.item.status || "未知") +
          "」），請重試"
      );
    }
    S.toast("已儲存變更（" + (STATUS_LABELS[updated.item.status] || updated.item.status) + "）");
    state.selected = updated.item;
    state.mode = "view";
    revealUpdatedStatus(updated.item);
    S.closeModal();
    await loadList();
  }

  async function replyQuote() {
    if (!state.canWrite || !state.selected || !state.selected.id) return;
    var item = state.selected;
    var mailto =
      "mailto:" + String(item.email || "") +
      "?subject=" + encodeURIComponent("Re: Northgo " + (item.reference || ""));

    if (item.status !== "replied") {
      var updated = await S.api("/api/inquiries/" + encodeURIComponent(item.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "replied" })
      });
      if (!updated || !updated.item || updated.item.status !== "replied") {
        throw new Error("無法將狀態更新為「已回覆」");
      }
      state.selected = updated.item;
      revealUpdatedStatus(updated.item);
      await loadList();
      S.toast("已將狀態更新為「已回覆」");
    }

    window.location.href = mailto;
  }

  async function loadMeta() {
    state.meta = await S.api("/api/meta");
    officeFilter.innerHTML = '<option value="">全部</option>' +
      state.meta.offices.map(function (office) {
        return '<option value="' + S.esc(office.id) + '">' + S.esc(office.name) + "</option>";
      }).join("");
    officeFilter.value = state.office;
    var current = state.status || "all";
    statusFilter.innerHTML = '<option value="all">全部</option>' + statusList().map(function (status) {
      return '<option value="' + S.esc(status) + '">' + S.esc(STATUS_LABELS[status] || status) + "</option>";
    }).join("");
    statusFilter.value = current === "all" || statusList().indexOf(current) >= 0 ? current : "all";
    state.status = statusFilter.value || "all";
  }

  function renderTable() {
    var pageData = S.paginate(state.items, state.page, state.pageSize);
    state.page = pageData.page;

    if (!pageData.items.length) {
      tableBody.innerHTML =
        '<tr><td colspan="8"><p class="empty">目前沒有符合條件的詢價。</p></td></tr>';
    } else {
      tableBody.innerHTML = pageData.items.map(function (item) {
        var name = (item.company || ((item.first || "") + " " + (item.last || "")).trim() || "—");
        return (
          "<tr data-id=\"" + S.esc(item.id) + "\">" +
            "<td><strong>" + S.esc(item.reference || "—") + "</strong></td>" +
            "<td>" +
              S.esc(name) +
              '<div style="color:var(--muted);font-size:0.82rem">' +
                S.esc(((item.first || "") + " " + (item.last || "")).trim()) +
              "</div>" +
            "</td>" +
            "<td>" + S.esc(item.serviceLabel || item.service || "—") + "</td>" +
            "<td>" + S.esc(item.officeName || item.office || "—") + "</td>" +
            '<td><span class="badge ' + S.esc(item.status || "") + '">' +
              S.esc(STATUS_LABELS[item.status] || item.status || "—") +
            "</span></td>" +
            "<td>" + S.esc(item.assigneeName || "未指派") + "</td>" +
            "<td>" + S.esc(S.formatDate(item.createdAt, true)) + "</td>" +
            '<td class="actions-col"><div class="actions">' +
              (state.canEdit
                ? '<button class="icon-btn edit" type="button" data-action="edit" title="' +
                  (state.canEditFields ? "編輯" : "更新狀態") + '" aria-label="編輯">' +
                  S.ICONS.edit + "</button>"
                : "") +
              (state.canDelete
                ? '<button class="icon-btn delete" type="button" data-action="delete" title="刪除" aria-label="刪除">' +
                  S.ICONS.trash + "</button>"
                : "") +
            "</div></td>" +
          "</tr>"
        );
      }).join("");
    }

    pagerMeta.textContent =
      "共 " + pageData.total + " 筆, 第 " + pageData.page + "/" + pageData.pages + " 頁";
    prevBtn.disabled = pageData.page <= 1;
    nextBtn.disabled = pageData.page >= pageData.pages;
  }

  async function loadList() {
    var params = new URLSearchParams();
    if (state.status && state.status !== "all") params.set("status", state.status);
    if (state.office) params.set("office", state.office);
    if (state.q) params.set("q", state.q);
    params.set("limit", "500");
    var data = await S.api("/api/inquiries?" + params.toString());
    state.items = data.items || [];
    var access = data.access || {};
    state.canEdit = access.canEdit != null ? Boolean(access.canEdit) : data.canEdit !== false;
    state.canCreate = access.canCreate != null ? Boolean(access.canCreate) : state.canEdit;
    state.canDelete = Boolean(access.canDelete);
    state.canWrite = Boolean(access.canWrite) || (access.allowedStatuses || []).indexOf("replied") >= 0;
    state.canAssign = Boolean(access.canAssign);
    state.canEditFields = Boolean(access.canEditFields);
    state.ownOnly = Boolean(access.ownOnly);
    state.allowedStatuses = access.allowedStatuses && access.allowedStatuses.length ? access.allowedStatuses : STATUS_KEYS.slice();
    state.createStatuses = access.createStatuses && access.createStatuses.length ? access.createStatuses : state.allowedStatuses.slice();
    state.assignees = data.assignees || [];
    if (createBtn) createBtn.hidden = !state.canCreate;
    if (accessHint) {
      if (state.ownOnly) {
        accessHint.hidden = false;
        accessHint.textContent = "你是客服，只看得到指派給自己的詢問。狀態只能改成處理中，不能改成已回覆，也不能刪除。";
      } else if (state.canEdit && !state.canDelete) {
        accessHint.hidden = false;
        accessHint.textContent = "你可以查看全部詢問，並修改狀態與備註。不能刪除詢問。";
      } else {
        accessHint.hidden = true;
        accessHint.textContent = "";
      }
    }
    var pages = Math.max(1, Math.ceil(state.items.length / state.pageSize) || 1);
    if (state.page > pages) state.page = pages;
    renderTable();
  }

  async function selectInquiry(id, mode) {
    state.selected = state.items.find(function (item) { return item.id === id; }) || null;
    if (!state.selected) {
      var data = await S.api("/api/inquiries/" + encodeURIComponent(id));
      state.selected = data.item;
    }
    state.mode = mode || "view";
    openModalForSelection();
  }

  async function deleteSelected() {
    if (!state.selected) return;
    if (!window.confirm("確定刪除這筆詢價？此動作無法復原。")) return;
    await S.api("/api/inquiries/" + encodeURIComponent(state.selected.id), { method: "DELETE" });
    S.toast("已刪除");
    state.selected = null;
    state.mode = "view";
    S.closeModal();
    await loadList();
  }

  function startCreate() {
    if (!state.canCreate) return;
    state.mode = "create";
    state.selected = null;
    openModalForSelection();
  }

  function wireToolbarIcons() {
    settingsBtn.innerHTML = S.ICONS.settings + " 設定";
    refreshBtn.innerHTML = S.ICONS.refresh + " 重新載入";
    createBtn.innerHTML = S.ICONS.plus + " 新增詢價";
  }

  tableBody.addEventListener("click", function (event) {
    var button = event.target.closest("[data-action]");
    var row = event.target.closest("tr[data-id]");
    if (!row) return;
    var id = row.getAttribute("data-id");

    if (button) {
      var action = button.getAttribute("data-action");
      if (action === "edit") {
        selectInquiry(id, "edit").catch(function (error) {
          if (error.message !== "unauthorized") S.toast(error.message, true);
        });
      } else if (action === "delete") {
        state.selected = state.items.find(function (item) { return item.id === id; }) || null;
        deleteSelected().catch(function (error) {
          if (error.message !== "unauthorized") S.toast(error.message, true);
        });
      }
      return;
    }

    selectInquiry(id, "view").catch(function (error) {
      if (error.message !== "unauthorized") S.toast(error.message, true);
    });
  });

  var searchTimer = null;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.q = searchInput.value.trim();
      state.page = 1;
      loadList().catch(function (error) {
        if (error.message !== "unauthorized") S.toast(error.message, true);
      });
    }, 250);
  });

  statusFilter.addEventListener("change", function () {
    state.status = statusFilter.value || "all";
    state.page = 1;
    loadList().catch(function (error) {
      if (error.message !== "unauthorized") S.toast(error.message, true);
    });
  });

  officeFilter.addEventListener("change", function () {
    state.office = officeFilter.value;
    state.page = 1;
    loadList().catch(function (error) {
      if (error.message !== "unauthorized") S.toast(error.message, true);
    });
  });

  pageSizeSelect.addEventListener("change", function () {
    state.pageSize = Number(pageSizeSelect.value) || 20;
    state.page = 1;
    renderTable();
  });

  prevBtn.addEventListener("click", function () {
    state.page -= 1;
    renderTable();
  });

  nextBtn.addEventListener("click", function () {
    state.page += 1;
    renderTable();
  });

  refreshBtn.addEventListener("click", function () {
    loadList().catch(function (error) {
      if (error.message !== "unauthorized") S.toast(error.message, true);
    });
  });

  createBtn.addEventListener("click", startCreate);

  settingsBtn.addEventListener("click", function (event) {
    event.stopPropagation();
    var open = settingsMenu.hidden;
    settingsMenu.hidden = !open;
    settingsBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  settingsMenu.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-settings]");
    if (!btn) return;
    var action = btn.getAttribute("data-settings");
    settingsMenu.hidden = true;
    settingsBtn.setAttribute("aria-expanded", "false");
    if (action === "reset") {
      searchInput.value = "";
      statusFilter.value = "all";
      officeFilter.value = "";
      pageSizeSelect.value = "20";
      state.q = "";
      state.status = "all";
      state.office = "";
      state.pageSize = 20;
      state.page = 1;
      loadList().catch(function (error) {
        if (error.message !== "unauthorized") S.toast(error.message, true);
      });
    } else if (action === "site") {
      window.open("/", "_blank", "noopener");
    }
  });

  document.addEventListener("click", function (event) {
    if (!settingsMenu.hidden && !event.target.closest(".settings-wrap")) {
      settingsMenu.hidden = true;
      settingsBtn.setAttribute("aria-expanded", "false");
    }
  });

  S.bindModalChrome();
  S.bindLogout();
  wireToolbarIcons();

  S.ensureAuth()
    .then(loadMeta)
    .then(loadList)
    .catch(function (error) {
      if (error.message !== "unauthorized") S.toast(error.message || "無法載入後台", true);
    });
})();
