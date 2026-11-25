(function (global) {
  var ROLE_LABELS = { admin: "管理員", editor: "編輯者", staff: "編輯者", sales: "業務", support: "客服" };

  function roleClass(role) {
    if (role === "admin") return "role-admin";
    if (role === "sales") return "role-sales";
    if (role === "support") return "role-support";
    return "role-editor";
  }

  function icon(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + "</svg>";
  }

  var ICONS = {
    edit: icon('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
    trash: icon('<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>'),
    refresh: icon('<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>'),
    settings: icon('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'),
    star: '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="m12 2.5 2.7 5.5 6 .9-4.4 4.3 1 6-5.3-2.8-5.3 2.8 1-6L3.3 8.9l6-.9Z"/></svg>',
    plus: icon('<path d="M12 5v14"/><path d="M5 12h14"/>'),
    user: '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8" r="3.2"/><path d="M5.2 19.2c1.3-2.8 3.8-4.2 6.8-4.2s5.5 1.4 6.8 4.2"/></svg>',
    folder: icon('<path d="M3 7.5h5.2l1.8 2H21v8.2a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 17.7Z"/>'),
    chevron: icon('<path d="m9 6 6 6-6 6"/>'),
    inquiry: icon('<path d="M7 3.5h7l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-10.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z"/><path d="M14 3.5V9h5.5"/><path d="M8.5 13h7"/><path d="M8.5 16.5h5"/>'),
    content: icon('<path d="M5 5.5h14"/><path d="M5 10h14"/><path d="M5 14.5h9"/><path d="M5 19h6"/>'),
    media: icon('<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.4"/><path d="m8 16 2.4-2.4a1.2 1.2 0 0 1 1.7 0L16 17"/>'),
    pages: icon('<rect x="4" y="4" width="7" height="7" rx="1.4"/><rect x="13" y="4" width="7" height="7" rx="1.4"/><rect x="4" y="13" width="7" height="7" rx="1.4"/><rect x="13" y="13" width="7" height="7" rx="1.4"/>'),
    users: icon('<circle cx="9" cy="9" r="2.4"/><path d="M4.8 17.2c.8-2 2.4-3 4.2-3s3.4 1 4.2 3"/><circle cx="16.2" cy="9.2" r="2"/><path d="M15.2 14.2c1.6.2 2.8 1.1 3.6 2.8"/>'),
    menus: icon('<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h10"/>'),
    roles: icon('<path d="M12 3.5 19 6.2v5.2c0 4.2-2.8 6.8-7 8.1-4.2-1.3-7-3.9-7-8.1V6.2Z"/>'),
    link: icon('<path d="M10 14a4 4 0 0 1 0-5.7l2.2-2.2a4 4 0 0 1 5.7 5.7L16.5 13"/><path d="M14 10a4 4 0 0 1 0 5.7L11.8 17.9a4 4 0 0 1-5.7-5.7L7.5 11"/>')
  };

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initials(name) {
    var text = String(name || "?").trim();
    if (!text) return "?";
    var parts = text.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function formatDate(value, withSeconds) {
    if (!value) return "—";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    var opts = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    };
    if (withSeconds) opts.second = "2-digit";
    return date.toLocaleString("zh-TW", opts);
  }

  function toast(message, isError) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.hidden = false;
    el.textContent = message;
    el.classList.toggle("is-error", Boolean(isError));
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () { el.hidden = true; }, isError ? 5600 : 2600);
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
    if (!response.ok) throw new Error((payload && payload.error) || "Request failed");
    return payload;
  }

  function avatarHtml(user, sizeClass) {
    var label = initials(user && (user.displayName || user.username));
    var cls = "avatar " + (sizeClass || "");
    if (user && user.avatarUrl) {
      return '<span class="' + cls + ' has-image"><img src="' + esc(user.avatarUrl) + '" alt=""></span>';
    }
    return '<span class="' + cls + '">' + esc(label) + "</span>";
  }

  function renderVersion() {
    var versionEl = document.getElementById("admin-version");
    if (!versionEl) return;
    var version = window.ADMIN_VERSION || "";
    versionEl.textContent = version ? "v" + version : "v—";
  }

  function normalizePath(pathname) {
    var path = String(pathname || "");
    if (path.endsWith("/index.html")) path = path.slice(0, -"/index.html".length);
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    return path || "/";
  }

  function collapsedKeys() {
    try {
      var parsed = JSON.parse(sessionStorage.getItem("ng-nav-collapsed") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function navLink(item) {
    var href = item.href || "#";
    var path = href.split("?")[0];
    var active = !/^https?:/i.test(href) && normalizePath(path) === normalizePath(location.pathname);
    var mark = ICONS[item.icon] || ICONS.link;
    var external = /^https?:/i.test(href);
    return '<a class="' + (active ? "is-active" : "") + '" href="' + esc(href) + '"' +
      (external ? ' target="_blank" rel="noopener"' : "") + ">" +
      mark + "<span>" + esc(item.label) + "</span></a>";
  }

  function renderNav(menus) {
    var root = document.getElementById("sidenav-tree");
    if (!root) return;
    var closed = collapsedKeys();
    root.innerHTML = (menus || []).map(function (item) {
      if (!item.isGroup) return navLink(item);
      var open = closed.indexOf(item.key) === -1;
      var children = (item.children || []).map(navLink).join("");
      return '<section class="nav-group' + (open ? " is-open" : "") + '" data-group="' + esc(item.key) + '">' +
        '<button type="button" class="nav-group-btn" aria-expanded="' + (open ? "true" : "false") + '">' +
          ICONS.folder + "<span>" + esc(item.label) + '</span><span class="chev">' + ICONS.chevron + "</span></button>" +
        '<div class="nav-items">' + children + "</div></section>";
    }).join("");

    root.querySelectorAll(".nav-group-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        var group = button.closest(".nav-group");
        var key = group.getAttribute("data-group");
        var keys = collapsedKeys();
        var willOpen = !group.classList.contains("is-open");
        group.classList.toggle("is-open", willOpen);
        button.setAttribute("aria-expanded", willOpen ? "true" : "false");
        if (willOpen) keys = keys.filter(function (item) { return item !== key; });
        else if (keys.indexOf(key) === -1) keys.push(key);
        sessionStorage.setItem("ng-nav-collapsed", JSON.stringify(keys));
      });
    });
  }

  function firstMenuHref(menus) {
    var list = menus || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].href) return list[i].href;
      var children = list[i].children || [];
      for (var j = 0; j < children.length; j++) {
        if (children[j].href) return children[j].href;
      }
    }
    return "";
  }

  var accountDraft = { pending: null, remove: false, user: null };

  function accountAvatarHtml() {
    var user = accountDraft.user || {};
    var src = accountDraft.pending || (!accountDraft.remove && user.avatarUrl) || "";
    if (src) return '<span class="avatar large has-image"><img src="' + esc(src) + '" alt=""></span>';
    return '<span class="avatar large">' + esc(initials(user.displayName || user.username || "?")) + "</span>";
  }

  function renderAccountForm() {
    var user = accountDraft.user || {};
    openModal(
      '<form id="account-form" novalidate>' +
        "<h2>我的帳號</h2>" +
        '<p class="ref">@' + esc(user.username || "") + "</p>" +
        '<div class="avatar-editor">' +
          '<div class="avatar-preview">' + accountAvatarHtml() +
            '<button class="avatar-edit-btn" type="button" id="account-pick">編輯</button>' +
          "</div>" +
          '<div class="avatar-actions">' +
            '<button class="btn ghost" type="button" id="account-pick-2">上傳圖片</button>' +
            ((accountDraft.pending || user.avatarUrl) && !accountDraft.remove
              ? '<button class="btn ghost" type="button" id="account-clear">移除頭像</button>'
              : "") +
            '<p class="avatar-hint">建議正方形照片，系統會自動裁切為 256×256。</p>' +
          "</div>" +
          '<input id="account-file" type="file" accept="image/jpeg,image/png,image/webp" hidden>' +
        "</div>" +
        '<div class="form-grid">' +
          '<label class="field span-2"><span>顯示名稱 *</span><input name="displayName" required value="' + esc(user.displayName || "") + '"></label>' +
          '<label class="field span-2"><span>Email</span><input name="email" type="email" value="' + esc(user.email || "") + '"></label>' +
          '<label class="field span-2"><span>新密碼（留空則不變更）</span><input name="password" type="password" minlength="8" autocomplete="new-password"></label>' +
        "</div>" +
        '<div class="detail-actions">' +
          '<button class="btn primary" type="submit">儲存</button>' +
          '<button class="btn ghost" type="button" data-close-modal>取消</button>' +
        "</div>" +
      "</form>"
    );
    var fileInput = document.getElementById("account-file");
    function pick() { if (fileInput) fileInput.click(); }
    var pick1 = document.getElementById("account-pick");
    var pick2 = document.getElementById("account-pick-2");
    if (pick1) pick1.addEventListener("click", pick);
    if (pick2) pick2.addEventListener("click", pick);
    var clearBtn = document.getElementById("account-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        accountDraft.pending = null;
        accountDraft.remove = true;
        renderAccountForm();
      });
    }
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;
        resizeImageFile(file, 256).then(function (dataUrl) {
          accountDraft.pending = dataUrl;
          accountDraft.remove = false;
          renderAccountForm();
        }).catch(function (error) {
          toast(error.message || "無法處理圖片", true);
        });
      });
    }
    var form = document.getElementById("account-form");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var payload = {
        displayName: String(data.get("displayName") || "").trim(),
        email: String(data.get("email") || "").trim(),
        password: String(data.get("password") || "")
      };
      if (!payload.password) delete payload.password;
      if (accountDraft.pending) payload.avatarData = accountDraft.pending;
      if (accountDraft.remove) payload.removeAvatar = true;
      api("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function () {
        toast("已更新帳號");
        accountDraft.pending = null;
        accountDraft.remove = false;
        closeModal();
        return ensureAuth();
      }).catch(function (error) {
        if (error.message !== "unauthorized") toast(error.message || "無法更新帳號", true);
      });
    });
  }

  function openSelfAccount() {
    accountDraft.pending = null;
    accountDraft.remove = false;
    api("/api/account").then(function (payload) {
      accountDraft.user = payload.item;
      renderAccountForm();
    }).catch(function (error) {
      if (error.message !== "unauthorized") toast(error.message || "無法讀取帳號", true);
    });
  }

  function bindSelfAccount() {
    var button = document.getElementById("my-account-btn");
    if (!button || button.dataset.selfAccount !== "1" || button.dataset.bound) return;
    button.dataset.bound = "1";
    button.hidden = false;
    button.addEventListener("click", openSelfAccount);
  }

  function renderShellUser(user) {
    var nameEl = document.getElementById("admin-user");
    var handleEl = document.getElementById("admin-handle");
    var roleEl = document.getElementById("admin-role");
    var avatarEl = document.getElementById("admin-avatar");
    if (nameEl) nameEl.textContent = user.displayName || user.username || "";
    if (handleEl) handleEl.textContent = user.username ? "@" + user.username : "";
    if (roleEl) {
      var label = user.roleName || ROLE_LABELS[user.role] || user.role || "";
      roleEl.innerHTML = (user.role === "admin" ? ICONS.star : ICONS.user) + " " + esc(label);
      roleEl.classList.remove("role-admin", "role-staff", "role-editor", "role-sales", "role-support");
      roleEl.classList.add(roleClass(user.role));
    }
    if (avatarEl) {
      if (user.avatarUrl) {
        avatarEl.classList.add("has-image");
        avatarEl.innerHTML = '<img src="' + esc(user.avatarUrl) + '" alt="">';
      } else {
        avatarEl.classList.remove("has-image");
        avatarEl.textContent = initials(user.displayName || user.username);
      }
    }
    renderNav(user.menus || []);
    renderVersion();
  }

  async function ensureAuth() {
    renderVersion();
    var me = await api("/api/auth/me");
    renderShellUser(me);
    bindModalChrome();
    bindSelfAccount();
    var needed = document.body.getAttribute("data-permission");
    if (needed && (me.permissions || []).indexOf(needed) === -1) {
      var href = firstMenuHref(me.menus);
      if (href && normalizePath(href.split("?")[0]) !== normalizePath(location.pathname)) {
        location.replace(href);
      } else {
        toast("沒有權限", true);
      }
      return new Promise(function () {});
    }
    return me;
  }

  function bindLogout() {
    var logoutBtn = document.getElementById("logout-btn");
    if (!logoutBtn) return;
    logoutBtn.addEventListener("click", async function () {
      try { await api("/api/auth/logout", { method: "POST" }); } catch (_) {}
      location.replace("/admin/login.html");
    });
  }

  function openModal(html, wide) {
    var root = document.getElementById("modal-root");
    var panel = document.getElementById("modal-panel");
    if (!root || !panel) return;
    panel.classList.toggle("wide", Boolean(wide));
    panel.innerHTML = html;
    root.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    var root = document.getElementById("modal-root");
    var panel = document.getElementById("modal-panel");
    if (!root || !panel) return;
    root.hidden = true;
    panel.innerHTML = "";
    document.body.style.overflow = "";
  }

  function bindModalChrome() {
    var root = document.getElementById("modal-root");
    if (!root || root.dataset.bound) return;
    root.dataset.bound = "1";
    root.addEventListener("click", function (event) {
      if (event.target.matches("[data-close-modal], .modal-backdrop")) closeModal();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !root.hidden) closeModal();
    });
  }

  function resizeImageFile(file, size) {
    size = size || 256;
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\/(jpeg|png|webp)$/i.test(file.type)) {
        reject(new Error("請選擇 JPEG / PNG / WebP 圖片"));
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        reject(new Error("原始圖片請小於 8MB"));
        return;
      }
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("無法讀取圖片")); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error("圖片格式無法解析")); };
        img.onload = function () {
          var canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          var ctx = canvas.getContext("2d");
          var min = Math.min(img.width, img.height);
          var sx = (img.width - min) / 2;
          var sy = (img.height - min) / 2;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
          resolve(canvas.toDataURL("image/jpeg", 0.86));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function paginate(items, page, pageSize) {
    var total = items.length;
    var pages = Math.max(1, Math.ceil(total / pageSize) || 1);
    var safePage = Math.min(Math.max(1, page), pages);
    var start = (safePage - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total: total,
      page: safePage,
      pages: pages,
      pageSize: pageSize
    };
  }

  global.AdminShared = {
    ROLE_LABELS: ROLE_LABELS,
    roleClass: roleClass,
    ICONS: ICONS,
    esc: esc,
    initials: initials,
    formatDate: formatDate,
    toast: toast,
    api: api,
    avatarHtml: avatarHtml,
    ensureAuth: ensureAuth,
    bindLogout: bindLogout,
    renderShellUser: renderShellUser,
    renderNav: renderNav,
    hasPermission: function (user, key) {
      return Boolean(user && (user.permissions || []).indexOf(key) !== -1);
    },
    renderVersion: renderVersion,
    resizeImageFile: resizeImageFile,
    openModal: openModal,
    closeModal: closeModal,
    bindModalChrome: bindModalChrome,
    paginate: paginate
  };
})(window);
