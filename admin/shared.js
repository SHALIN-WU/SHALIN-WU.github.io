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

  function avatarHtml(user, sizeClass) {
    var label = initials(user && (user.displayName || user.username));
    var cls = "avatar " + (sizeClass || "");
    if (user && user.avatarUrl) {
      return '<span class="' + cls + ' has-image"><img src="' + esc(user.avatarUrl) + '" alt=""></span>';
    }
    return '<span class="' + cls + '">' + esc(label) + "</span>";
  }

  function renderShellUser(user) {
    var nameEl = document.getElementById("admin-user");
    var roleEl = document.getElementById("admin-role");
    var avatarEl = document.getElementById("admin-avatar");
    if (nameEl) nameEl.textContent = user.displayName || user.username || "";
    if (roleEl) roleEl.textContent = ROLE_LABELS[user.role] || user.role || "";
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

  global.AdminShared = {
    ROLE_LABELS: ROLE_LABELS,
    esc: esc,
    initials: initials,
    formatDate: formatDate,
    toast: toast,
    api: api,
    avatarHtml: avatarHtml,
    ensureAuth: ensureAuth,
    bindLogout: bindLogout,
    renderShellUser: renderShellUser,
    resizeImageFile: resizeImageFile
  };
})(window);
