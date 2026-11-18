(function () {
  var S = window.AdminShared;
  var state = {
    me: null,
    items: [],
    filtered: [],
    q: "",
    role: "",
    page: 1,
    pageSize: 20,
    mode: null,
    editing: null,
    pendingAvatar: null,
    removeAvatar: false,
    accountOnly: false
  };

  var tableBody = document.getElementById("user-table-body");
  var pagerMeta = document.getElementById("pager-meta");
  var prevBtn = document.getElementById("prev-page");
  var nextBtn = document.getElementById("next-page");
  var searchInput = document.getElementById("search-input");
  var roleFilter = document.getElementById("role-filter");
  var pageSizeSelect = document.getElementById("page-size");
  var settingsBtn = document.getElementById("settings-btn");
  var settingsMenu = document.getElementById("settings-menu");
  var refreshBtn = document.getElementById("refresh-users-btn");
  var createBtn = document.getElementById("create-user-btn");

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

  function applyFilters() {
    var q = state.q.trim().toLowerCase();
    state.filtered = state.items.filter(function (user) {
      if (state.role && user.role !== state.role) return false;
      if (!q) return true;
      var roleLabel = (S.ROLE_LABELS[user.role] || user.role || "").toLowerCase();
      var hay = [
        user.username,
        user.displayName,
        user.email,
        user.role,
        roleLabel
      ].join(" ").toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    var pages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize) || 1);
    if (state.page > pages) state.page = pages;
  }

  function renderTable() {
    applyFilters();
    var pageData = S.paginate(state.filtered, state.page, state.pageSize);
    state.page = pageData.page;

    if (!pageData.items.length) {
      tableBody.innerHTML =
        '<tr><td colspan="5"><p class="empty">' +
        (state.items.length ? "沒有符合條件的使用者。" : "尚無使用者，請先新增。") +
        "</p></td></tr>";
    } else {
      tableBody.innerHTML = pageData.items.map(function (user) {
        var isMe = state.me && state.me.id === user.id;
        var lastLogin = user.lastLoginAt
          ? S.formatDate(user.lastLoginAt, true)
          : "尚未登入";
        var roleClass = user.role === "admin" ? "role-admin" : "role-staff";
        return (
          "<tr data-id=\"" + S.esc(user.id) + "\">" +
            "<td>" +
              '<div class="account-cell">' +
                S.avatarHtml(user, "tiny") +
                '<span class="handle">@' + S.esc(user.username) + "</span>" +
                (isMe ? '<span class="badge you">你</span>' : "") +
              "</div>" +
            "</td>" +
            "<td>" + S.esc(user.displayName || "—") + "</td>" +
            "<td><span class=\"badge " + roleClass + "\">" + S.ICONS.star + " " +
              S.esc(S.ROLE_LABELS[user.role] || user.role) + "</span></td>" +
            "<td>" + S.esc(lastLogin) + "</td>" +
            '<td class="actions-col"><div class="actions">' +
              '<button class="icon-btn edit" type="button" data-action="edit" title="編輯" aria-label="編輯">' +
                S.ICONS.edit + "</button>" +
              '<button class="icon-btn delete' + (isMe ? " is-disabled" : "") +
                '" type="button" data-action="delete" title="' +
                (isMe ? "無法刪除自己的帳號" : "刪除") +
                '" aria-label="刪除"' + (isMe ? " disabled" : "") + ">" +
                S.ICONS.trash + "</button>" +
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

  function renderForm(data, mode) {
    var title = mode === "create" ? "新增使用者" : (state.accountOnly ? "我的帳號" : "編輯使用者");
    var roleLocked = state.accountOnly && state.me && state.me.role !== "admin";
    return (
      '<form id="user-form" class="inquiry-form" novalidate>' +
        "<h2>" + title + "</h2>" +
        '<p class="ref">' +
          (mode === "create" ? "建立後即可登入後台" : "@" + S.esc(data.username || "")) +
        "</p>" +
        avatarEditor(data) +
        '<div class="form-grid">' +
          (mode === "create"
            ? '<label class="field"><span>帳號 *</span><input name="username" required pattern="[a-zA-Z0-9._-]{3,32}" value="' + S.esc(data.username || "") + '"></label>'
            : "") +
          '<label class="field' + (mode === "create" ? "" : " span-2") + '"><span>顯示名稱 *</span><input name="displayName" required value="' + S.esc(data.displayName || "") + '"></label>' +
          '<label class="field span-2"><span>Email</span><input name="email" type="email" value="' + S.esc(data.email || "") + '"></label>' +
          '<label class="field"><span>角色 *</span><select name="role"' + (roleLocked ? " disabled" : "") + ">" +
            '<option value="admin"' + (data.role === "admin" ? " selected" : "") + ">管理者</option>" +
            '<option value="staff"' + (data.role === "staff" ? " selected" : "") + ">專員</option>" +
          "</select></label>" +
          '<label class="field"><span>狀態</span><select name="active"' + (state.accountOnly ? " disabled" : "") + ">" +
            '<option value="1"' + (data.active !== false ? " selected" : "") + ">啟用</option>" +
            '<option value="0"' + (data.active === false ? " selected" : "") + ">停用</option>" +
          "</select></label>" +
          '<label class="field span-2"><span>' + (mode === "create" ? "密碼 *" : "新密碼（留空則不變更）") + "</span>" +
            '<input name="password" type="password" autocomplete="new-password"' + (mode === "create" ? " required minlength=\"8\"" : " minlength=\"8\"") + "></label>" +
        "</div>" +
        '<div class="detail-actions">' +
          '<button class="btn primary" type="submit">' + (mode === "create" ? "建立" : "儲存") + "</button>" +
          '<button class="btn ghost" type="button" data-close-modal>取消</button>' +
          (mode === "edit" && !state.accountOnly && !(state.me && state.me.id === data.id)
            ? '<button class="btn danger" type="button" id="delete-user-btn">刪除</button>'
            : "") +
        "</div>" +
      "</form>"
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
        openEditor(state.editing, state.mode, state.accountOnly);
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
            openEditor(state.editing, state.mode, state.accountOnly);
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

  function bindForm() {
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
    var deleteBtn = document.getElementById("delete-user-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", function () {
        deleteUser(state.editing).catch(function (error) {
          if (error.message !== "unauthorized") S.toast(error.message, true);
        });
      });
    }
  }

  function openEditor(user, mode, accountOnly) {
    state.mode = mode;
    state.editing = user || emptyForm();
    state.accountOnly = Boolean(accountOnly);
    if (mode === "create") {
      state.pendingAvatar = null;
      state.removeAvatar = false;
    }
    S.openModal(renderForm(state.editing, mode));
    bindForm();
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
    renderTable();
  }

  async function saveForm(form) {
    var data = new FormData(form);
    var payload = {
      displayName: String(data.get("displayName") || "").trim(),
      email: String(data.get("email") || "").trim(),
      role: String(data.get("role") || (state.editing && state.editing.role) || "staff"),
      active: String(data.get("active") || (state.editing && state.editing.active === false ? "0" : "1")) === "1",
      password: String(data.get("password") || "")
    };

    if (state.mode === "create") {
      payload.username = String(data.get("username") || "").trim().toLowerCase();
      if (state.pendingAvatar) payload.avatarData = state.pendingAvatar;
      await S.api("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      S.toast("已建立使用者");
      state.pendingAvatar = null;
      state.removeAvatar = false;
      S.closeModal();
      await loadUsers();
      return;
    }

    if (!payload.password) delete payload.password;
    if (state.accountOnly) {
      delete payload.role;
      delete payload.active;
    }
    var id = state.editing.id;
    var updated = await S.api("/api/users/" + encodeURIComponent(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    var withAvatar = await syncAvatar(id);
    S.toast("已儲存使用者");
    state.pendingAvatar = null;
    state.removeAvatar = false;
    S.closeModal();
    await loadUsers();
    if (state.me && state.me.id === id) {
      state.me = withAvatar || updated.item;
      await S.ensureAuth();
    }
  }

  async function deleteUser(user) {
    if (!user || !user.id) return;
    if (state.me && state.me.id === user.id) {
      S.toast("無法刪除目前登入的帳號", true);
      return;
    }
    if (!window.confirm("確定刪除使用者「" + (user.displayName || user.username) + "」？")) return;
    await S.api("/api/users/" + encodeURIComponent(user.id), { method: "DELETE" });
    S.toast("已刪除使用者");
    S.closeModal();
    await loadUsers();
  }

  function openMyAccount() {
    if (!state.me) return;
    var mine = state.items.find(function (item) { return item.id === state.me.id; }) || state.me;
    state.pendingAvatar = null;
    state.removeAvatar = false;
    openEditor(mine, "edit", true);
  }

  function wireToolbarIcons() {
    settingsBtn.innerHTML = S.ICONS.settings + " 設定";
    refreshBtn.innerHTML = S.ICONS.refresh + " 重新載入";
    createBtn.innerHTML = S.ICONS.plus + " 新增使用者";
  }

  tableBody.addEventListener("click", function (event) {
    var button = event.target.closest("[data-action]");
    if (!button) return;
    var row = button.closest("tr[data-id]");
    if (!row) return;
    var user = state.items.find(function (item) { return item.id === row.getAttribute("data-id"); });
    if (!user) return;
    var action = button.getAttribute("data-action");
    if (action === "edit") {
      state.pendingAvatar = null;
      state.removeAvatar = false;
      openEditor(user, "edit", false);
    } else if (action === "delete") {
      deleteUser(user).catch(function (error) {
        if (error.message !== "unauthorized") S.toast(error.message, true);
      });
    }
  });

  var searchTimer = null;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.q = searchInput.value;
      state.page = 1;
      renderTable();
    }, 180);
  });

  roleFilter.addEventListener("change", function () {
    state.role = roleFilter.value;
    state.page = 1;
    renderTable();
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

  createBtn.addEventListener("click", function () {
    state.pendingAvatar = null;
    state.removeAvatar = false;
    openEditor(emptyForm(), "create", false);
  });

  refreshBtn.addEventListener("click", function () {
    loadUsers().catch(function (error) {
      if (error.message !== "unauthorized") S.toast(error.message, true);
    });
  });

  document.getElementById("my-account-btn").addEventListener("click", openMyAccount);

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
      roleFilter.value = "";
      pageSizeSelect.value = "20";
      state.q = "";
      state.role = "";
      state.pageSize = 20;
      state.page = 1;
      renderTable();
    } else if (action === "account") {
      openMyAccount();
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
