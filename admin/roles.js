(function () {
  var S = window.AdminShared;
  var state = { items: [], permissions: [], canEdit: false, draft: null };
  var bodyEl = document.getElementById("role-body");
  var createBtn = document.getElementById("create-btn");

  function groupedPermissions() {
    var groups = [];
    state.permissions.forEach(function (perm) {
      var group = groups.find(function (item) { return item.name === perm.group; });
      if (!group) {
        group = { name: perm.group, items: [] };
        groups.push(group);
      }
      group.items.push(perm);
    });
    return groups;
  }

  function render() {
    createBtn.hidden = !state.canEdit;
    if (!state.items.length) {
      bodyEl.innerHTML = '<tr><td colspan="5"><p class="empty">尚無角色。</p></td></tr>';
      return;
    }
    bodyEl.innerHTML = state.items.map(function (role) {
      var canDelete = state.canEdit && !role.isSystem && !role.userCount;
      return "<tr data-id=\"" + S.esc(role.id) + "\">" +
        "<td><strong>" + S.esc(role.name) + "</strong>" +
          (role.isSystem ? ' <span class="badge">系統</span>' : "") +
          '<div style="color:var(--muted);font-size:0.82rem">' + S.esc(role.key) + "</div></td>" +
        "<td>" + S.esc(role.description || "—") + "</td>" +
        "<td>" + S.esc(String(role.userCount || 0)) + "</td>" +
        "<td>" + S.esc(String((role.permissions || []).length)) + "</td>" +
        '<td class="actions-col"><div class="row-actions">' +
          (state.canEdit ? '<button class="btn ghost" type="button" data-action="edit">編輯</button>' : "") +
          (canDelete ? '<button class="btn danger" type="button" data-action="delete">刪除</button>' : "") +
        "</div></td></tr>";
    }).join("");
  }

  function formHtml(draft) {
    var locked = draft.key === "admin";
    var selected = new Set(draft.permissions || []);
    var grid = groupedPermissions().map(function (group) {
      return '<section class="perm-group"><h3>' + S.esc(group.name) + "</h3><div class=\"perm-options\">" +
        group.items.map(function (perm) {
          var checked = locked || selected.has(perm.key);
          return '<label><input type="checkbox" name="permission" value="' + S.esc(perm.key) + '"' +
            (checked ? " checked" : "") + (locked || !state.canEdit ? " disabled" : "") + "> " +
            S.esc(perm.label) + "</label>";
        }).join("") +
        "</div></section>";
    }).join("");
    return '<form id="role-form">' +
      "<h2>" + (draft.id ? "編輯角色" : "新增角色") + "</h2>" +
      (locked ? '<p class="ref">管理者固定擁有全部權限。</p>' : '<p class="ref">勾選「管理」時會一併帶上對應的檢視權限。</p>') +
      '<div class="form-grid">' +
      (draft.id
        ? '<label class="field"><span>代碼</span><input value="' + S.esc(draft.key) + '" disabled></label>'
        : '<label class="field"><span>代碼 *</span><input name="key" required pattern="[a-z][a-z0-9-]{1,31}" placeholder="reviewer"></label>') +
      '<label class="field"><span>名稱 *</span><input name="name" required maxlength="40" value="' + S.esc(draft.name || "") + '"></label>' +
      '<label class="field span-2"><span>說明</span><input name="description" maxlength="160" value="' + S.esc(draft.description || "") + '"></label>' +
      "</div>" +
      '<div class="perm-grid">' + grid + "</div>" +
      '<div class="detail-actions"><button class="btn primary" type="submit">儲存</button>' +
      '<button class="btn ghost" type="button" data-close-modal>取消</button></div></form>';
  }

  function openEditor(draft) {
    state.draft = draft;
    S.openModal(formHtml(draft), true);
    document.getElementById("role-form").addEventListener("submit", function (event) {
      event.preventDefault();
      save(event.currentTarget).catch(showError);
    });
  }

  async function save(form) {
    var data = new FormData(form);
    var permissions = Array.from(form.querySelectorAll('input[name="permission"]:checked')).map(function (input) {
      return input.value;
    });
    var payload = {
      name: String(data.get("name") || "").trim(),
      description: String(data.get("description") || "").trim(),
      permissions: permissions
    };
    if (!state.draft.id) {
      payload.key = String(data.get("key") || "").trim().toLowerCase();
      await S.api("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      await S.api("/api/roles/" + encodeURIComponent(state.draft.id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }
    S.toast("已儲存角色");
    S.closeModal();
    await load();
    await S.ensureAuth();
  }

  async function load() {
    var payload = await S.api("/api/roles");
    state.items = payload.items || [];
    state.permissions = payload.permissions || [];
    state.canEdit = Boolean(payload.canEdit);
    render();
  }

  function showError(error) {
    if (error.message !== "unauthorized") S.toast(error.message, true);
  }

  bodyEl.addEventListener("click", function (event) {
    var button = event.target.closest("[data-action]");
    if (!button) return;
    var row = button.closest("tr[data-id]");
    var role = state.items.find(function (item) { return item.id === row.getAttribute("data-id"); });
    if (!role) return;
    if (button.getAttribute("data-action") === "edit") {
      openEditor({
        id: role.id,
        key: role.key,
        name: role.name,
        description: role.description,
        permissions: (role.permissions || []).slice()
      });
    }
    if (button.getAttribute("data-action") === "delete") {
      if (!window.confirm("確定刪除角色「" + role.name + "」？")) return;
      S.api("/api/roles/" + encodeURIComponent(role.id), { method: "DELETE" })
        .then(function () {
          S.toast("已刪除角色");
          return load();
        })
        .catch(showError);
    }
  });

  createBtn.addEventListener("click", function () {
    openEditor({ name: "", description: "", permissions: [] });
  });
  document.getElementById("reload-btn").addEventListener("click", function () {
    load().catch(showError);
  });

  S.bindLogout();
  S.ensureAuth().then(load).catch(showError);
})();
