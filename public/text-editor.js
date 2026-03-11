(function () {
  function normalizeUrl(url) {
    return url.replace(/\/$/, "");
  }

  function mountEditor(container) {
    var serviceUrl = container.dataset.editorServiceUrl;
    if (!serviceUrl) {
      throw new Error("Missing data-editor-service-url attribute");
    }

    var iframe = document.createElement("iframe");
    var params = new URLSearchParams();
    var docId = container.dataset.editorDocId;
    var sidebar = container.dataset.editorSidebar;

    if (docId) params.set("docId", docId);
    if (sidebar) params.set("sidebar", sidebar);

    var query = params.toString();
    // iframe.src = normalizeUrl(serviceUrl) + "/embed" + (query ? "?" + query : "");
    iframe.style.width = container.dataset.editorWidth || "100%";
    iframe.style.height = container.dataset.editorHeight || "720px";
    iframe.style.border = "0";
    iframe.style.display = "block";
    iframe.allow = "clipboard-read; clipboard-write";
    iframe.loading = "lazy";

    container.innerHTML = "";
    container.appendChild(iframe);
  }

  function init() {
    var containers = document.querySelectorAll("[data-editor-service-url]");
    containers.forEach(mountEditor);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
