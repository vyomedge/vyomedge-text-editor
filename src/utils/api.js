function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) return "";
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function buildUrl(baseUrl, path) {
  return `${normalizeBaseUrl(baseUrl)}${path}`;
}

async function request(baseUrl, path, options = {}) {
  const res = await fetch(buildUrl(baseUrl, path), {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export function createApiClient(baseUrl = process.env.NEXT_PUBLIC_API_URL || "") {
  return {
    listDocuments({ page = 1, limit = 50, search = "", status = "" } = {}) {
      const params = new URLSearchParams({ page, limit });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      return request(baseUrl, `/api/v1/documents?${params}`);
    },

    createDocument({
      title = "Untitled Document",
      html = "",
      tags = [],
    } = {}) {
      return request(baseUrl, "/api/v1/documents", {
        method: "POST",
        body: JSON.stringify({ title, html, tags }),
      });
    },

    getDocument(id) {
      return request(baseUrl, `/api/v1/documents/${id}`);
    },

    saveDocument(id, { title, html, tags, status, versionLabel }) {
      return request(baseUrl, `/api/v1/documents/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title, html, tags, status, versionLabel }),
      });
    },

    autoSaveDocument(id, { html, title }) {
      return request(baseUrl, `/api/v1/documents/${id}/autosave`, {
        method: "PATCH",
        body: JSON.stringify({ html, title }),
      });
    },

    deleteDocument(id) {
      return request(baseUrl, `/api/v1/documents/${id}`, { method: "DELETE" });
    },

    getVersions(id) {
      return request(baseUrl, `/api/v1/documents/${id}/versions`);
    },

    restoreVersion(id, index) {
      return request(baseUrl, `/api/v1/documents/${id}/versions/${index}/restore`, {
        method: "POST",
      });
    },

    uploadImage(file, onProgress) {
      const formData = new FormData();
      formData.append("image", file);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", buildUrl(baseUrl, "/api/v1/uploads/image"));

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && data.success) {
              resolve(data);
            } else {
              reject(new Error(data.message || "Upload failed"));
            }
          } catch {
            reject(new Error("Upload failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
      });
    },

    listImages() {
      return request(baseUrl, "/api/v1/uploads");
    },

    deleteImage(filename) {
      return request(baseUrl, `/api/v1/uploads/image/${filename}`, {
        method: "DELETE",
      });
    },

    healthCheck() {
      return request(baseUrl, "/api/v1/health");
    },
  };
}

const defaultClient = createApiClient();

export const listDocuments = (...args) => defaultClient.listDocuments(...args);
export const createDocument = (...args) => defaultClient.createDocument(...args);
export const getDocument = (...args) => defaultClient.getDocument(...args);
export const saveDocument = (...args) => defaultClient.saveDocument(...args);
export const autoSaveDocument = (...args) => defaultClient.autoSaveDocument(...args);
export const deleteDocument = (...args) => defaultClient.deleteDocument(...args);
export const getVersions = (...args) => defaultClient.getVersions(...args);
export const restoreVersion = (...args) => defaultClient.restoreVersion(...args);
export const uploadImage = (...args) => defaultClient.uploadImage(...args);
export const listImages = (...args) => defaultClient.listImages(...args);
export const deleteImage = (...args) => defaultClient.deleteImage(...args);
export const healthCheck = (...args) => defaultClient.healthCheck(...args);
