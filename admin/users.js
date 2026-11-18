(function () {
  var S = window.AdminShared;
  var state = {
    me: null,
    items: [],
    selectedId: null,
    selected: null,
    mode: "view"
  };

  var listEl = document.getElementById("user-list");
  var bodyEl = document.getElementById("user-body");
  var emptyEl = document.getElementById("user-empty");
  var statsEl = document.getElementById("user-stats");

  function emptyForm() {
    return {
      username: "",
      displayName: "",
      email: "",
      role: "staff",
      active: true,
      password: ""
    };
  }

  function renderStats() {
    var total = state.items.length;
    var admins = state.items.filter(function (u) { return u.role === "admin"; }).length;
    var staff = state.items.filter(function (u) { return u.role === "staff"; }).length;
    var active = state.items.filter(function (u) { return u.active; }).length;
    statsEl.innerHTML = [
      ["全部", total],
      ["管理員", admins],
      ["專員", staff],
      ["啟用中", active]
    ].map(function (pair) {
      return '<article class="stat"><div class="label">' + S.esc(pair[0]) + '</div><div class="value">' + S.esc(pair[1]) + "</div></article>";
    }).join("");
  }

  function renderList() {
    if (!state.items.length) {
      listEl.innerHTML = '<p class="empty">尚無使用者，請先新增。</p>';
      return;
    }
    listEl.innerHTML = state.items.map(function (user) {
      var selected = user.id === state.selectedId ? " is-selected" : "";
      return (
        '<button class="row user-row' + selected + '" type="button" data-id="' + S.esc(user.id) + '">' +
          '<div class="row-top">' +
            '<span class="avatar tiny">' + S.esc(S.initials(user.displayName || user.username)) + "</span>" +
            '<span class="row-title">' + S.esc(user.displayName || user.username) + "</span>" +
            '<span class="badge ' + (user.active ? "quoted" : "closed") + '">' + (user.active ? "啟用" : "停用") + "</span>" +
          "</div>" +
          '<div class="row-sub">@' + S.esc(user.username) + " · " + S.esc(S.ROLE_LABELS[user.role] || user.role) + "</div>" +
          '<div class="meta"><span>' + S.esc(user.email || "未填 Email") + "</span><span>" + S.esc(S.formatDate(user.lastLoginAt)) + "</span></div>" +
        "</button>"
      );
    }).join("");
  }

  function renderForm(data, mode) {
    return (
      '<form id="user-form" class="inquiry-form" novalidate>' +
        "<h2>" + (mode === "create" ? "新增使用者" : "編輯使用者") + "</h2>" +
        '<p class="ref">' + (mode === "create" ? "建立後即可登入後台" : "@" + S.esc(data.username)) + "</p>" +
        '<div class="form-grid">' +
          (mode === "create"
            ? '<label class="field"><span>帳號 *</span><input name="username" required pattern="[a-zA-Z0-9._-]{3,32}" value="' + S.esc(data.username || "") + '"></label>'
            : "") +
          '<label class="field' + (mode === "create" ? "" : " span-2") + '"><span>顯示名稱 *</span><input name="displayName" required value="' + S.esc(data.displayName || "") + '"></label>' +
          '<label class="field span-2"><span>Email</span><input name="email" type="email" value="' + S.esc(data.email || "") + '"></label>' +
          '<label class="field"><span>角色 *</span><select name="role">' +
            '<option value="admin"' + (data.role === "admin" ? " selected" : "") + ">管理員</option>" +
            '<option value="staff"' + (data.role === "staff" ? " selected" : "") + ">專員</option>" +
          "</select></label>" +
          '<label class="field"><span>狀態</span><select name="active">' +
            '<option value="1"' + (data.active !== false ? " selected" : "") + ">啟用</option>" +
            '<option value="0"' + (data.active === false ? " selected" : "") + ">停用</option>" +
          "</select></label>" +
          '<label class="field span-2"><span>' + (mode === "create" ? "密碼 *" : "新密碼（留空則不變更）") + "</span>" +
            '<input name="password" type="password" autocomplete="new-password"' + (mode === "create" ? " required minlength=\"8\"" : " minlength=\"8\"") + "></label>" +
        "</div>" +
        '<div class="detail-actions">' +
          '<button class="btn" type="submit">' + (mode === "create" ? "建立" : "儲存") + "</button>" +
          '<button class="btn ghost" type="button" id="cancel-user-btn">取消</button>' +
          (mode === "edit" ? '<button class="btn danger" type="button" id="delete-user-btn">刪除</button>' : "") +
        "</div>" +
      "</form>"
    );
  }

  function renderReadonly(user) {
    return (
      '<div class="user-profile">' +
        '<div class="avatar large">' + S.esc(S.initials(user.displayName || user.username)) + "</div>" +
        "<h2>" + S.esc(user.displayName || user.username) + "</h2>" +
        '<p class="ref">@' + S.esc(user.username) + " · " + S.esc(S.ROLE_LABELS[user.role] || user.role) + "</p>" +
      "</div>" +
      '<dl class="kv">' +
        "<dt>Email</dt><dd>" + S.esc(user.email || "—") + "</dd>" +
        "<dt>狀態</dt><dd>" + (user.active ? "啟用" : "停用") + "</dd>" +
        "<dt>建立時間</dt><dd>" + S.esc(S.formatDate(user.createdAt)) + "</dd>" +
        "<dt>最近登入</dt><dd>" + S.esc(S.formatDate(user.lastLoginAt)) + "</dd>" +
      "</dl>" +
      '<div class="detail-actions">' +
        '<button class="btn" type="button" id="edit-user-btn">編輯</button>' +
        '<button class="btn danger" type="button" id="delete-user-btn">刪除</button>' +
      "</div>"
    );
  }

  function bindDetail() {
    var form = document.getElementById("user-form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        saveForm(form).catch(function (error) {
          if (error.message !== "unauthorized") S.toast(error.message, true);
        });
      });
    }
    var cancelBtn = document.getElementById("cancel-user-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        state.mode = state.selected ? "view" : "view";
        if (!state.selected) state.selectedId = null;
        renderDetail();
        renderList();
      });
    }
    var editBtn = document.getElementById("edit-user-btn");
    if (editBtn) {
      editBtn.addEventListener("click", function () {
        state.mode = "edit";
        renderDetail();
      });
    }
    var deleteBtn = document.getElementById("delete-user-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", function () {
        deleteSelected().catch(function (error) {
          if (error.message !== "unauthorized") S.toast(error.message, true);
        });
      });
    }
  }

  function renderDetail() {
    if (state.mode === "create") {
      emptyEl.hidden = true;
      bodyEl.hidden = false;
      bodyEl.innerHTML = renderForm(emptyForm(), "create");
      bindDetail();
      return;
    }
    if (!state.selected) {
      bodyEl.hidden = true;
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;
    bodyEl.hidden = false;
    bodyEl.innerHTML = state.mode === "edit"
      ? renderForm(state.selected, "edit")
      : renderReadonly(state.selected);
    bindDetail();
  }

  async function loadUsers() {
    var data = await S.api("/api/users");
    state.items = data.items || [];
    if (state.selectedId) {
      state.selected = state.items.find(function (item) { return item.id === state.selectedId; }) || null;
      if (!state.selected) {
        state.selectedId = null;
        state.mode = "view";
      }
    }
    renderStats();
    renderList();
    renderDetail();
  }

  async function selectUser(id) {
    state.selectedId = id;
    state.mode = "view";
    state.selected = state.items.find(function (item) { return item.id === id; }) || null;
    renderList();
    renderDetail();
  }

  async function saveForm(form) {
    var data = new FormData(form);
    var payload = {
      displayName: String(data.get("displayName") || "").trim(),
      email: String(data.get("email") || "").trim(),
      role: String(data.get("role") || "staff"),
      active: String(data.get("active")) === "1",
      password: String(data.get("password") || "")
    };

    if (state.mode === "create") {
      payload.username = String(data.get("username") || "").trim().toLowerCase();
      var created = await S.api("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      S.toast("已建立使用者");
      state.selectedId = created.item.id;
      state.selected = created.item;
      state.mode = "view";
      await loadUsers();
      return;
    }

    if (!payload.password) delete payload.password;
    var updated = await S.api("/api/users/" + encodeURIComponent(state.selected.id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    S.toast("已儲存使用者");
    state.selected = updated.item;
    state.selectedId = updated.item.id;
    state.mode = "view";
    await loadUsers();
  }

  async function deleteSelected() {
    if (!state.selected) return;
    if (!window.confirm("確定刪除使用者「" + (state.selected.displayName || state.selected.username) + "」？")) return;
    await S.api("/api/users/" + encodeURIComponent(state.selected.id), { method: "DELETE" });
    S.toast("已刪除使用者");
    state.selected = null;
    state.selectedId = null;
    state.mode = "view";
    await loadUsers();
  }

  listEl.addEventListener("click", function (event) {
    var button = event.target.closest("[data-id]");
    if (!button) return;
    selectUser(button.getAttribute("data-id"));
  });

  document.getElementById("create-user-btn").addEventListener("click", function () {
    state.mode = "create";
    state.selected = null;
    state.selectedId = null;
    renderList();
    renderDetail();
  });

  document.getElementById("refresh-users-btn").addEventListener("click", function () {
    loadUsers().catch(function (error) {
      if (error.message !== "unauthorized") S.toast(error.message, true);
    });
  });

  S.bindLogout();
  S.ensureAuth()
    .then(function (me) {
      state.me = me;
      if (me.role !== "admin") {
        S.toast("需要管理員權限", true);
        location.replace("/admin/");
        return null;
      }
      return loadUsers();
    })
    .catch(function (error) {
      if (error.message !== "unauthorized") S.toast(error.message || "無法載入使用者", true);
    });
})();
