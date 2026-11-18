(function () {
  var S = window.AdminShared;
  var state = {
    me: null,
    items: [],
    selectedId: null,
    selected: null,
    mode: "view",
    pendingAvatar: null,
    removeAvatar: false
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
      password: "",
      avatarUrl: null,
      hasAvatar: false
    };
  }

  function previewSrc(user) {
    if (state.pendingAvatar) return state.pendingAvatar;
    if (state.removeAvatar) return null;
    return user && user.avatarUrl ? user.avatarUrl : null;
  }

  function avatarEditor(user) {
    var src = previewSrc(user);
    var media = src
      ? '<span class="avatar large has-image"><img src="' + S.esc(src) + '" alt=""></span>'
      : '<span class="avatar large">' + S.esc(S.initials(user.displayName || user.username || "?")) + "</span>";

    return (
      '<div class="avatar-editor">' +
        '<div class="avatar-preview">' + media +
          '<button class="avatar-edit-btn" type="button" id="pick-avatar-btn" title="更換頭像">編輯</button>' +
        "</div>" +
        '<div class="avatar-actions">' +
          '<button class="btn ghost" type="button" id="pick-avatar-btn-2">上傳圖片</button>' +
          ((src || (user && user.hasAvatar)) && !state.removeAvatar
            ? '<button class="btn ghost" type="button" id="clear-avatar-btn">移除頭像</button>'
            : "") +
          '<p class="avatar-hint">建議正方形照片，系統會自動裁切為 256×256。</p>' +
        "</div>" +
        '<input id="avatar-file" type="file" accept="image/jpeg,image/png,image/webp" hidden>' +
      "</div>"
    );
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
            S.avatarHtml(user, "tiny") +
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
        avatarEditor(data) +
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
        S.avatarHtml(user, "large") +
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

  function bindAvatarPicker() {
    var fileInput = document.getElementById("avatar-file");
    function openPicker() {
      if (fileInput) fileInput.click();
    }
    var pick1 = document.getElementById("pick-avatar-btn");
    var pick2 = document.getElementById("pick-avatar-btn-2");
    if (pick1) pick1.addEventListener("click", openPicker);
    if (pick2) pick2.addEventListener("click", openPicker);
    var clearBtn = document.getElementById("clear-avatar-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        state.pendingAvatar = null;
        state.removeAvatar = true;
        renderDetail();
      });
    }
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;
        S.resizeImageFile(file, 256)
          .then(function (dataUrl) {
            state.pendingAvatar = dataUrl;
            state.removeAvatar = false;
            renderDetail();
          })
          .catch(function (error) {
            S.toast(error.message || "無法處理圖片", true);
          })
          .finally(function () {
            fileInput.value = "";
          });
      });
    }
  }

  function bindDetail() {
    bindAvatarPicker();
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
        state.pendingAvatar = null;
        state.removeAvatar = false;
        state.mode = "view";
        if (!state.selected) state.selectedId = null;
        renderDetail();
        renderList();
      });
    }
    var editBtn = document.getElementById("edit-user-btn");
    if (editBtn) {
      editBtn.addEventListener("click", function () {
        state.pendingAvatar = null;
        state.removeAvatar = false;
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

  async function syncAvatar(userId) {
    if (state.pendingAvatar) {
      var updated = await S.api("/api/users/" + encodeURIComponent(userId) + "/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarData: state.pendingAvatar })
      });
      return updated.item;
    }
    if (state.removeAvatar) {
      var cleared = await S.api("/api/users/" + encodeURIComponent(userId) + "/avatar", {
        method: "DELETE"
      });
      return cleared.item;
    }
    return null;
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
    state.pendingAvatar = null;
    state.removeAvatar = false;
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
      if (state.pendingAvatar) payload.avatarData = state.pendingAvatar;
      var created = await S.api("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      S.toast("已建立使用者");
      state.selectedId = created.item.id;
      state.selected = created.item;
      state.pendingAvatar = null;
      state.removeAvatar = false;
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
    var withAvatar = await syncAvatar(state.selected.id);
    S.toast("已儲存使用者");
    state.selected = withAvatar || updated.item;
    state.selectedId = state.selected.id;
    state.pendingAvatar = null;
    state.removeAvatar = false;
    state.mode = "view";
    await loadUsers();
    if (state.me && state.me.id === state.selected.id) {
      await S.ensureAuth();
    }
  }

  async function deleteSelected() {
    if (!state.selected) return;
    if (!window.confirm("確定刪除使用者「" + (state.selected.displayName || state.selected.username) + "」？")) return;
    await S.api("/api/users/" + encodeURIComponent(state.selected.id), { method: "DELETE" });
    S.toast("已刪除使用者");
    state.selected = null;
    state.selectedId = null;
    state.pendingAvatar = null;
    state.removeAvatar = false;
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
    state.pendingAvatar = null;
    state.removeAvatar = false;
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
