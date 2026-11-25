(function () {
  var S = window.AdminShared;
  var FEATURES = [
    { key: "inquiries", label: "客戶詢問", href: "/admin/", icon: "inquiry", permission: "inquiries.read" },
    { key: "content", label: "網站內容", href: "/admin/content.html", icon: "content", permission: "content.read" },
    { key: "media", label: "媒體", href: "/admin/media.html", icon: "media", permission: "media.read" },
    { key: "pages", label: "動態頁面", href: "/admin/pages.html", icon: "pages", permission: "pages.read" },
    { key: "users", label: "使用者", href: "/admin/users.html", icon: "users", permission: "users.read" },
    { key: "menus", label: "選單管理", href: "/admin/menus.html", icon: "menus", permission: "menus.read" },
    { key: "roles", label: "角色權限", href: "/admin/roles.html", icon: "roles", permission: "roles.read" }
  ];
  var ADMIN_PERMS = {
    "users.read": true,
    "users.write": true,
    "menus.read": true,
    "menus.write": true,
    "roles.read": true,
    "roles.write": true
  };
  var state = {
    items: [],
    permissions: [],
    canEdit: false,
    draft: null,
    query: "",
    type: "all",
    collapsed: loadCollapsed()
  };
  var bodyEl = document.getElementById("menu-body");
  var createBtn = document.getElementById("create-btn");
  var searchEl = document.getElementById("menu-search");
  var typeEl = document.getElementById("menu-type");

  function bySort(a, b) {
    return (a.sortOrder - b.sortOrder) || String(a.label).localeCompare(String(b.label), "zh-Hant");
  }

  function loadCollapsed() {
    try {
      var saved = JSON.parse(sessionStorage.getItem("ng-menu-rows") || "[]");
      return new Set(Array.isArray(saved) ? saved : []);
    } catch (error) {
      return new Set();
    }
  }

  function saveCollapsed() {
    sessionStorage.setItem("ng-menu-rows", JSON.stringify(Array.from(state.collapsed)));
  }

  function childrenOf(item) {
    return state.items.filter(function (row) { return row.parentId === item.id; }).sort(bySort);
  }

  function groups() {
    return state.items.filter(function (item) { return item.isGroup; }).sort(bySort);
  }

  function isEntry(item) {
    return item && item.key === "menus";
  }

  function featureOf(item) {
    if (!item || item.isGroup) return null;
    return FEATURES.find(function (feature) {
      return feature.href === item.href || feature.key === item.key;
    }) || null;
  }

  function featureLabel(item) {
    if (!item || item.isGroup) return "—";
    var feature = featureOf(item);
    return feature ? feature.label : (item.href || "自訂連結");
  }

  function permLabel(key) {
    if (!key) return "所有人";
    if (ADMIN_PERMS[key]) return "管理者";
    var found = state.permissions.find(function (item) { return item.key === key; });
    return found ? found.label : key;
  }

  function audience(item) {
    if (!item.isGroup) return permLabel(item.permission);
    var kids = childrenOf(item);
    if (kids.length && kids.every(function (kid) { return ADMIN_PERMS[kid.permission]; })) return "管理者";
    return "所有人";
  }

  function filtering() {
    return Boolean(state.query.trim()) || state.type !== "all";
  }

  function matches(item) {
    if (state.type === "group" && !item.isGroup) return false;
    if (state.type === "item" && item.isGroup) return false;
    var query = state.query.trim().toLowerCase();
    if (!query) return true;
    var blob = [item.label, featureLabel(item), item.href || "", audience(item)].join(" ").toLowerCase();
    return blob.indexOf(query) !== -1;
  }

  function visibleRows() {
    var roots = state.items.filter(function (item) { return !item.parentId; }).sort(bySort);
    var rows = [];
    roots.forEach(function (item) {
      var kids = item.isGroup ? childrenOf(item) : [];
      var self = matches(item);
      var shownKids = kids.filter(matches);
      if (state.type === "item") {
        if (!item.isGroup && self) rows.push(item);
        shownKids.forEach(function (child) { rows.push(child); });
        return;
      }
      if (!self && !shownKids.length) return;
      if (state.type === "group") {
        if (self) rows.push(item);
        return;
      }
      rows.push(item);
      var open = filtering() || !state.collapsed.has(item.id);
      if (item.isGroup && open) {
        (filtering() ? shownKids : kids).forEach(function (child) { rows.push(child); });
      }
    });
    state.items.filter(function (item) {
      return item.parentId && !state.items.some(function (parent) { return parent.id === item.parentId; });
    }).filter(matches).forEach(function (item) { rows.push(item); });
    return rows;
  }

  function iconBtn(action, title, kind, svg) {
    return '<button class="icon-btn ' + kind + '" type="button" data-action="' + action + '" title="' +
      S.esc(title) + '" aria-label="' + S.esc(title) + '">' + svg + "</button>";
  }

  function render() {
    createBtn.hidden = !state.canEdit;
    var rows = visibleRows();
    if (!rows.length) {
      bodyEl.innerHTML = '<tr><td colspan="7"><p class="empty">' +
        (state.items.length ? "沒有符合的選單。" : "尚無選單。") + "</p></td></tr>";
      return;
    }
    bodyEl.innerHTML = rows.map(function (item) {
      var open = item.isGroup && state.type !== "group" && (state.query.trim() || !state.collapsed.has(item.id));
      var mark = item.isGroup
        ? '<button class="menu-twist' + (open ? " is-open" : "") + '" type="button" data-action="toggle" aria-expanded="' +
          (open ? "true" : "false") + '" aria-label="' + (open ? "收合" : "展開") + '">' + S.ICONS.chevron + "</button>"
        : '<span class="menu-twist-spacer"></span>';
      var glyph = S.ICONS[item.isGroup ? "folder" : (item.icon || "link")] || S.ICONS.link;
      var actions = "";
      if (state.canEdit) {
        actions =
          (item.isGroup ? iconBtn("add", "新增功能", "add", S.ICONS.plus) : "") +
          iconBtn("edit", "編輯", "edit", S.ICONS.edit) +
          (isEntry(item) ? "" : iconBtn("delete", "刪除", "delete", S.ICONS.trash));
      }
      return '<tr data-id="' + S.esc(item.id) + '">' +
        '<td><div class="menu-name' + (item.parentId ? " child" : "") + '">' + mark +
          '<span class="menu-ico">' + glyph + "</span><span>" + S.esc(item.label) + "</span></div></td>" +
        "<td>" + (item.isGroup ? "群組" : "功能") + "</td>" +
        "<td>" + S.esc(featureLabel(item)) + "</td>" +
        '<td class="col-num">' + S.esc(String(item.sortOrder || 0)) + "</td>" +
        '<td><span class="badge ' + (item.enabled ? "active" : "inactive") + '">' +
          (item.enabled ? "顯示中" : "已隱藏") + "</span></td>" +
        "<td>" + S.esc(audience(item)) + "</td>" +
        '<td class="actions-col"><div class="row-actions">' + actions + "</div></td></tr>";
    }).join("");
  }

  function formHtml(draft) {
    var creating = !draft.id;
    var entry = isEntry(draft);
    var feature = featureOf(draft);
    var featureValue = feature ? feature.key : "custom";
    var permOptions = '<option value="">所有人</option>' + state.permissions.map(function (perm) {
      return '<option value="' + S.esc(perm.key) + '"' + (draft.permission === perm.key ? " selected" : "") + ">" +
        S.esc(perm.group + " · " + perm.label) + "</option>";
    }).join("");
    var parentOptions = '<option value="">最上層</option>' + groups().map(function (group) {
      return '<option value="' + S.esc(group.id) + '"' + (draft.parentId === group.id ? " selected" : "") + ">" +
        S.esc(group.label) + "</option>";
    }).join("");
    var featureOptions = FEATURES.map(function (item) {
      return '<option value="' + item.key + '"' + (featureValue === item.key ? " selected" : "") + ">" +
        S.esc(item.label) + "</option>";
    }).join("") + '<option value="custom"' + (featureValue === "custom" ? " selected" : "") + ">自訂連結</option>";
    var icons = [
      ["inquiry", "詢問"], ["content", "內容"], ["media", "媒體"], ["pages", "頁面"],
      ["users", "使用者"], ["menus", "選單"], ["roles", "角色"], ["link", "連結"]
    ];
    return '<form id="menu-form">' +
      "<h2>" + (creating ? "新增選單" : "編輯選單") + "</h2>" +
      (entry ? '<p class="ref">這是進入選單管理的入口，不能刪除，也不能改為隱藏。</p>' : "") +
      '<div class="form-grid">' +
      (creating
        ? '<label class="field"><span>類型 *</span><select name="kind">' +
            '<option value="item"' + (draft.isGroup ? "" : " selected") + ">功能</option>" +
            '<option value="group"' + (draft.isGroup ? " selected" : "") + ">群組</option></select></label>" +
          '<label class="field"><span>代碼 *</span><input name="key" required pattern="[a-z][a-z0-9-]{1,39}" placeholder="reports"></label>'
        : '<label class="field"><span>類型</span><input value="' + (draft.isGroup ? "群組" : "功能") + '" disabled></label>' +
          '<label class="field"><span>代碼</span><input value="' + S.esc(draft.key) + '" disabled></label>') +
      '<label class="field"><span>名稱 *</span><input name="label" required maxlength="40" value="' + S.esc(draft.label || "") + '"></label>' +
      '<label class="field"><span>排序</span><input name="sortOrder" type="number" min="0" max="9999" step="1" value="' +
        S.esc(draft.sortOrder == null ? "" : String(draft.sortOrder)) + '"></label>' +
      '<div data-for="item" class="field"><span>上層</span><select name="parentId">' + parentOptions + "</select></div>" +
      '<div data-for="item" class="field"><span>對應功能</span><select name="feature"' + (draft.isSystem ? " disabled" : "") + ">" +
        featureOptions + "</select></div>" +
      '<div data-for="custom" class="field span-2"><span>連結 *</span><input name="href" value="' + S.esc(draft.href || "") + '"' +
        (draft.isSystem ? " disabled" : "") + "></div>" +
      '<div data-for="custom" class="field"><span>圖示</span><select name="icon">' + icons.map(function (icon) {
        return '<option value="' + icon[0] + '"' + ((draft.icon || "link") === icon[0] ? " selected" : "") + ">" + icon[1] + "</option>";
      }).join("") + "</select></div>" +
      '<div data-for="item" class="field span-2"><span>權限</span><select name="permission">' + permOptions + "</select></div>" +
      '<label class="field check span-2"><input name="enabled" type="checkbox"' +
        (draft.enabled !== false ? " checked" : "") + (entry ? " disabled" : "") +
        "><span>" + (entry ? "顯示在側欄（不可停用）" : "顯示在側欄") + "</span></label>" +
      "</div>" +
      '<div class="detail-actions"><button class="btn primary" type="submit">儲存</button>' +
      '<button class="btn ghost" type="button" data-close-modal>取消</button></div></form>';
  }

  function syncForm(form) {
    var kind = form.elements.kind ? form.elements.kind.value : (state.draft.isGroup ? "group" : "item");
    var isGroup = kind === "group";
    var feature = form.elements.feature ? form.elements.feature.value : "custom";
    var custom = !isGroup && feature === "custom";
    form.querySelectorAll("[data-for]").forEach(function (node) {
      var slot = node.getAttribute("data-for");
      var show = slot === "item" ? !isGroup : custom;
      node.hidden = !show;
      node.querySelectorAll("input, select, textarea").forEach(function (input) {
        var locked = state.draft.isSystem && (input.name === "feature" || input.name === "href");
        input.disabled = locked || !show;
      });
    });
    var href = form.elements.href;
    if (href) href.required = custom;
  }

  function openEditor(draft) {
    state.draft = draft;
    S.openModal(formHtml(draft));
    var form = document.getElementById("menu-form");
    syncForm(form);
    form.addEventListener("change", function (event) {
      if (event.target.name === "feature") {
        var preset = FEATURES.find(function (item) { return item.key === event.target.value; });
        var previous = event.target.getAttribute("data-perm") || "";
        if (form.elements.permission && (!form.elements.permission.value || form.elements.permission.value === previous)) {
          form.elements.permission.value = preset ? preset.permission : "";
        }
        event.target.setAttribute("data-perm", preset ? preset.permission : "");
      }
      if (event.target.name === "kind" || event.target.name === "feature") syncForm(form);
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      save(form).catch(function (error) {
        if (error.message !== "unauthorized") S.toast(error.message, true);
      });
    });
  }

  async function save(form) {
    var data = new FormData(form);
    var draft = state.draft;
    var creating = !draft.id;
    var isGroup = creating ? data.get("kind") === "group" : Boolean(draft.isGroup);
    var payload = {
      label: String(data.get("label") || "").trim(),
      enabled: isEntry(draft) ? true : data.get("enabled") === "on",
      sortOrder: String(data.get("sortOrder") || "").trim()
    };
    if (!isGroup) {
      payload.parentId = String(data.get("parentId") || "");
      payload.permission = String(data.get("permission") || "");
      if (!draft.isSystem) {
        var preset = FEATURES.find(function (item) { return item.key === data.get("feature"); });
        if (preset) {
          payload.href = preset.href;
          payload.icon = preset.icon;
        } else {
          payload.href = String(data.get("href") || "").trim();
          payload.icon = String(data.get("icon") || "link");
        }
      }
    }
    if (creating) {
      payload.key = String(data.get("key") || "").trim().toLowerCase();
      payload.isGroup = isGroup;
      await S.api("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      await S.api("/api/menus/" + encodeURIComponent(draft.id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }
    S.toast("已儲存選單");
    S.closeModal();
    await load();
    await S.ensureAuth();
  }

  async function load() {
    var payload = await S.api("/api/menus");
    state.items = payload.items || [];
    state.permissions = payload.permissions || [];
    state.canEdit = Boolean(payload.canEdit);
    render();
  }

  bodyEl.addEventListener("click", function (event) {
    var button = event.target.closest("[data-action]");
    if (!button) return;
    var row = button.closest("tr[data-id]");
    var item = state.items.find(function (entry) { return entry.id === row.getAttribute("data-id"); });
    if (!item) return;
    var action = button.getAttribute("data-action");
    if (action === "toggle") {
      if (state.collapsed.has(item.id)) state.collapsed.delete(item.id);
      else state.collapsed.add(item.id);
      saveCollapsed();
      render();
      return;
    }
    if (action === "edit") openEditor(Object.assign({}, item));
    if (action === "add") {
      openEditor({
        isGroup: false,
        enabled: true,
        label: "",
        href: "",
        icon: "link",
        permission: "",
        parentId: item.id,
        sortOrder: ""
      });
    }
    if (action === "delete") {
      if (isEntry(item)) return;
      var message = item.isSystem
        ? "「" + item.label + "」是系統選單，刪除後側欄會少這個入口。確定刪除？"
        : "確定刪除「" + item.label + "」？";
      if (!window.confirm(message)) return;
      S.api("/api/menus/" + encodeURIComponent(item.id), { method: "DELETE" }).then(function () {
        S.toast("已刪除選單");
        return load();
      }).then(function () { return S.ensureAuth(); }).catch(showError);
    }
  });

  function showError(error) {
    if (error.message !== "unauthorized") S.toast(error.message, true);
  }

  createBtn.addEventListener("click", function () {
    var firstGroup = groups()[0];
    openEditor({
      isGroup: false,
      enabled: true,
      label: "",
      href: "",
      icon: "link",
      permission: "",
      parentId: firstGroup ? firstGroup.id : "",
      sortOrder: ""
    });
  });
  searchEl.addEventListener("input", function () {
    state.query = searchEl.value;
    render();
  });
  typeEl.addEventListener("change", function () {
    state.type = typeEl.value;
    render();
  });
  document.getElementById("reload-btn").addEventListener("click", function () {
    load().catch(showError);
  });

  S.bindLogout();
  S.ensureAuth().then(load).catch(showError);
})();
