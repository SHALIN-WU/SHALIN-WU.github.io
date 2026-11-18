(function (global) {
  var ROLE_LABELS = { admin: "管理員", staff: "專員" };

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

  function renderShellUser(user) {
    var nameEl = document.getElementById("admin-user");
    var roleEl = document.getElementById("admin-role");
    var avatarEl = document.getElementById("admin-avatar");
    if (nameEl) nameEl.textContent = user.displayName || user.username || "";
    if (roleEl) roleEl.textContent = ROLE_LABELS[user.role] || user.role || "";
    if (avatarEl) avatarEl.textContent = initials(user.displayName || user.username);
    var usersNav = document.getElementById("nav-users");
    if (usersNav) usersNav.hidden = user.role !== "admin";
  }

  async function ensureAuth() {
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

  global.AdminShared = {
    ROLE_LABELS: ROLE_LABELS,
    esc: esc,
    initials: initials,
    formatDate: formatDate,
    toast: toast,
    api: api,
    ensureAuth: ensureAuth,
    bindLogout: bindLogout,
    renderShellUser: renderShellUser
  };
})(window);
