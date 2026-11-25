(function () {
  var S = window.AdminShared;
  var MAX_BYTES = 4 * 1024 * 1024;

  var state = { canEdit: false, items: [] };

  var hint = document.getElementById("media-hint");
  var grid = document.getElementById("media-grid");
  var fileInput = document.getElementById("file-input");
  var uploadField = document.getElementById("upload-field");
  var uploadBtn = document.getElementById("upload-btn");
  var reloadBtn = document.getElementById("reload-btn");

  function formatBytes(value) {
    var size = Number(value) || 0;
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  }

  function render() {
    hint.textContent = state.canEdit
      ? "JPEG、PNG 或 WebP，單檔 4 MB 以內。縮圖是同一張圖，用 CSS 縮小。"
      : "專員可以查看與複製網址。只有管理者可以上傳或刪除。";
    uploadField.hidden = !state.canEdit;
    uploadBtn.hidden = !state.canEdit;

    if (!state.items.length) {
      grid.innerHTML = '<div class="empty">還沒有圖片。</div>';
      return;
    }

    grid.innerHTML = state.items.map(function (item) {
      var actions = '<button class="btn ghost" type="button" data-copy="' + S.esc(item.url) + '">複製網址</button>';
      if (state.canEdit) {
        actions += '<button class="icon-btn delete" type="button" data-delete="' + S.esc(item.id) + '" data-name="' + S.esc(item.filename) + '" title="刪除">' + S.ICONS.trash + "</button>";
      }
      return '<article class="media-card">' +
        '<img class="media-thumb" src="/api/media/' + S.esc(item.id) + '" alt="' + S.esc(item.alt || item.filename) + '">' +
        '<div class="media-meta">' +
          '<div class="media-name">' + S.esc(item.filename) + "</div>" +
          '<div class="media-sub">' + S.esc(formatBytes(item.bytes)) + " · " + S.esc(S.formatDate(item.createdAt)) + "</div>" +
          '<div class="media-url" title="' + S.esc(item.url) + '">' + S.esc(item.url) + "</div>" +
          '<div class="media-actions">' + actions + "</div>" +
        "</div>" +
      "</article>";
    }).join("");
  }

  async function load() {
    var payload = await S.api("/api/media");
    state.canEdit = Boolean(payload.canEdit);
    state.items = payload.items || [];
    render();
  }

  async function upload() {
    var file = fileInput.files && fileInput.files[0];
    if (!file) {
      S.toast("請先選擇圖片", true);
      return;
    }
    if (file.type && !/^image\/(jpe?g|png|webp)$/i.test(file.type)) {
      S.toast("僅支援 JPEG、PNG、WebP", true);
      return;
    }
    if (file.size > MAX_BYTES) {
      S.toast("單檔需在 4 MB 以內", true);
      return;
    }
    var body = new FormData();
    body.append("file", file);
    uploadBtn.disabled = true;
    try {
      await S.api("/api/media", { method: "POST", body: body });
      fileInput.value = "";
      S.toast("已上傳");
      await load();
    } catch (error) {
      if (error.message !== "unauthorized") S.toast(error.message, true);
    } finally {
      uploadBtn.disabled = false;
    }
  }

  async function copyUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      S.toast("已複製圖片網址");
    } catch (_) {
      S.toast("無法複製，請手動選取網址", true);
    }
  }

  async function remove(id, name) {
    if (!window.confirm("確定刪除「" + name + "」？刪除後公開網址會失效。")) return;
    try {
      await S.api("/api/media/" + id, { method: "DELETE" });
      S.toast("已刪除");
      await load();
    } catch (error) {
      if (error.message !== "unauthorized") S.toast(error.message, true);
    }
  }

  grid.addEventListener("click", function (event) {
    var copy = event.target.closest("[data-copy]");
    if (copy) {
      copyUrl(copy.getAttribute("data-copy"));
      return;
    }
    var del = event.target.closest("[data-delete]");
    if (del) remove(del.getAttribute("data-delete"), del.getAttribute("data-name") || "圖片");
  });

  uploadBtn.addEventListener("click", upload);
  reloadBtn.addEventListener("click", function () {
    load().catch(function (error) {
      if (error.message !== "unauthorized") S.toast(error.message, true);
    });
  });

  S.bindLogout();
  S.ensureAuth()
    .then(load)
    .catch(function (error) {
      if (error.message !== "unauthorized") S.toast(error.message || "無法載入媒體", true);
    });
})();
