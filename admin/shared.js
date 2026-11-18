(function (global) {
  var ROLE_LABELS = { admin: "管理者", staff: "專員" };

  var ICONS = {
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
    star: '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="m12 2.5 2.7 5.5 6 .9-4.4 4.3 1 6-5.3-2.8-5.3 2.8 1-6L3.3 8.9l6-.9Z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>'
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
    toast._timer = setTimeout(function () { el.hidden = true; }, 2600);
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

  function renderShellUser(user) {
    var nameEl = document.getElementById("admin-user");
    var handleEl = document.getElementById("admin-handle");
    var roleEl = document.getElementById("admin-role");
    var avatarEl = document.getElementById("admin-avatar");
    if (nameEl) nameEl.textContent = user.displayName || user.username || "";
    if (handleEl) handleEl.textContent = user.username ? "@" + user.username : "";
    if (roleEl) {
      roleEl.textContent = ROLE_LABELS[user.role] || user.role || "";
      roleEl.classList.remove("role-admin", "role-staff");
      roleEl.classList.add(user.role === "admin" ? "role-admin" : "role-staff");
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
    var usersNav = document.getElementById("nav-users");
    if (usersNav) usersNav.hidden = user.role !== "admin";
    var myAccountBtn = document.getElementById("my-account-btn");
    if (myAccountBtn && myAccountBtn.tagName === "A") {
      myAccountBtn.hidden = user.role !== "admin";
    }
    renderVersion();
  }

  async function ensureAuth() {
    renderVersion();
    var me = await api("/api/auth/me");
    renderShellUser(me);
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
    renderVersion: renderVersion,
    resizeImageFile: resizeImageFile,
    openModal: openModal,
    closeModal: closeModal,
    bindModalChrome: bindModalChrome,
    paginate: paginate
  };
})(window);
