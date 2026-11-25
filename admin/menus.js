(function () {
  var S = window.AdminShared;
  var state = { items: [], permissions: [], canEdit: false, draft: null };
  var bodyEl = document.getElementById("menu-body");
  var createGroupBtn = document.getElementById("create-group-btn");
  var createItemBtn = document.getElementById("create-item-btn");

  function bySort(a, b) {
    return (a.sortOrder - b.sortOrder) || String(a.label).localeCompare(String(b.label), "zh-Hant");
  }

  function siblings(item) {
    var parentId = item.parentId || "";
    return state.items.filter(function (row) { return (row.parentId || "") === parentId; }).sort(bySort);
  }

  function permLabel(key) {
    if (!key) return "登入即可";
    var found = state.permissions.find(function (item) { return item.key === key; });
    return found ? found.label : key;
  }

  function render() {
    createGroupBtn.hidden = !state.canEdit;
    createItemBtn.hidden = !state.canEdit;
    var roots = state.items.filter(function (item) { return !item.parentId; }).sort(bySort);
    var rows = [];
    roots.forEach(function (item) {
      rows.push(item);
      if (item.isGroup) {
        state.items.filter(function (child) { return child.parentId === item.id; }).sort(bySort).forEach(function (child) {
          rows.push(child);
        });
      }
    });
    if (!rows.length) {
      bodyEl.innerHTML = '<tr><td colspan="5"><p class="empty">尚無選單。</p></td></tr>';
      return;
    }
    bodyEl.innerHTML = rows.map(function (item) {
      var group = siblings(item);
      var index = group.findIndex(function (row) { return row.id === item.id; });
      var actions = "";
      if (state.canEdit) {
        actions =
          '<button class="btn ghost" type="button" data-action="up"' + (index <= 0 ? " disabled" : "") + ">上</button>" +
          '<button class="btn ghost" type="button" data-action="down"' + (index >= group.length - 1 ? " disabled" : "") + ">下</button>" +
          '<button class="btn ghost" type="button" data-action="edit">編輯</button>' +
          (item.isSystem
            ? ""
            : '<button class="btn danger" type="button" data-action="delete">刪除</button>');
      }
      return "<tr data-id=\"" + S.esc(item.id) + "\">" +
        "<td><div class=\"menu-name" + (item.parentId ? " child" : "") + "\">" +
          S.esc(item.label) +
          (item.isGroup ? ' <span class="badge">群組</span>' : "") +
          (item.isSystem ? ' <span class="badge">系統</span>' : "") +
        "</div></td>" +
        "<td>" + S.esc(item.href || "—") + "</td>" +
        "<td>" + S.esc(item.isGroup ? "—" : permLabel(item.permission)) + "</td>" +
        "<td><span class=\"badge " + (item.enabled ? "active" : "inactive") + "\">" +
          (item.enabled ? "顯示" : "隱藏") + "</span></td>" +
        '<td class="actions-col"><div class="row-actions">' + actions + "</div></td></tr>";
    }).join("");
  }

  function groups() {
    return state.items.filter(function (item) { return item.isGroup; }).sort(bySort);
  }

  function formHtml(draft) {
    var creating = !draft.id;
    var permOptions = '<option value="">登入即可見</option>' + state.permissions.map(function (perm) {
      return '<option value="' + S.esc(perm.key) + '"' + (draft.permission === perm.key ? " selected" : "") + ">" +
        S.esc(perm.group + " · " + perm.label) + "</option>";
    }).join("");
    var parentOptions = '<option value="">最上層</option>' + groups().map(function (group) {
      return '<option value="' + S.esc(group.id) + '"' + (draft.parentId === group.id ? " selected" : "") + ">" +
        S.esc(group.label) + "</option>";
    }).join("");
    var icons = [
      ["inquiry", "詢問"], ["content", "內容"], ["media", "媒體"], ["pages", "頁面"],
      ["users", "使用者"], ["menus", "選單"], ["roles", "角色"], ["link", "連結"]
    ];
    return '<form id="menu-form">' +
      "<h2>" + (creating ? (draft.isGroup ? "新增群組" : "新增項目") : "編輯選單") + "</h2>" +
      '<div class="form-grid">' +
      (creating
        ? '<label class="field"><span>代碼 *</span><input name="key" required pattern="[a-z][a-z0-9-]{1,39}" value=""></label>'
        : '<label class="field"><span>代碼</span><input value="' + S.esc(draft.key) + '" disabled></label>') +
      '<label class="field"><span>名稱 *</span><input name="label" required maxlength="40" value="' + S.esc(draft.label || "") + '"></label>' +
      (draft.isGroup
        ? ""
        : '<label class="field span-2"><span>連結 *</span><input name="href" required value="' + S.esc(draft.href || "") + '"' +
          (draft.isSystem ? " disabled" : "") + "></label>" +
          '<label class="field"><span>上層</span><select name="parentId">' + parentOptions + "</select></label>" +
          '<label class="field"><span>圖示</span><select name="icon">' + icons.map(function (icon) {
            return '<option value="' + icon[0] + '"' + (draft.icon === icon[0] ? " selected" : "") + ">" + icon[1] + "</option>";
          }).join("") + "</select></label>" +
          '<label class="field span-2"><span>需要權限</span><select name="permission">' + permOptions + "</select></label>") +
      '<label class="field check span-2"><input name="enabled" type="checkbox"' + (draft.enabled !== false ? " checked" : "") + "><span>顯示在側欄</span></label>" +
      "</div>" +
      '<div class="detail-actions"><button class="btn primary" type="submit">儲存</button>' +
      '<button class="btn ghost" type="button" data-close-modal>取消</button></div></form>';
  }

  function openEditor(draft) {
    state.draft = draft;
    S.openModal(formHtml(draft));
    var form = document.getElementById("menu-form");
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
    var payload = {
      label: String(data.get("label") || "").trim(),
      enabled: data.get("enabled") === "on"
    };
    if (!draft.isGroup) {
      payload.parentId = String(data.get("parentId") || "");
      payload.permission = String(data.get("permission") || "");
      payload.icon = String(data.get("icon") || "link");
      if (!draft.isSystem) payload.href = String(data.get("href") || "").trim();
    }
    if (!draft.id) {
      payload.key = String(data.get("key") || "").trim().toLowerCase();
      payload.isGroup = Boolean(draft.isGroup);
      if (!draft.isGroup) payload.href = String(data.get("href") || "").trim();
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

  async function move(item, direction) {
    var list = siblings(item);
    var index = list.findIndex(function (row) { return row.id === item.id; });
    var next = index + direction;
    if (next < 0 || next >= list.length) return;
    var ids = list.map(function (row) { return row.id; });
    var swap = ids[index];
    ids[index] = ids[next];
    ids[next] = swap;
    await S.api("/api/menus", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId: item.parentId || "", ids: ids })
    });
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
    if (action === "edit") openEditor(Object.assign({}, item));
    if (action === "up") move(item, -1).catch(showError);
    if (action === "down") move(item, 1).catch(showError);
    if (action === "delete") {
      if (!window.confirm("確定刪除「" + item.label + "」？")) return;
      S.api("/api/menus/" + encodeURIComponent(item.id), { method: "DELETE" }).then(function () {
        S.toast("已刪除選單");
        return load();
      }).then(function () { return S.ensureAuth(); }).catch(showError);
    }
  });

  function showError(error) {
    if (error.message !== "unauthorized") S.toast(error.message, true);
  }

  createGroupBtn.addEventListener("click", function () {
    openEditor({ isGroup: true, enabled: true, label: "" });
  });
  createItemBtn.addEventListener("click", function () {
    var firstGroup = groups()[0];
    openEditor({
      isGroup: false,
      enabled: true,
      label: "",
      href: "/admin/",
      icon: "link",
      permission: "",
      parentId: firstGroup ? firstGroup.id : ""
    });
  });
  document.getElementById("reload-btn").addEventListener("click", function () {
    load().catch(showError);
  });

  S.bindLogout();
  S.ensureAuth().then(load).catch(showError);
})();
