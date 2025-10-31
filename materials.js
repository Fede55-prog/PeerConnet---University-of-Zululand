// public/materials.js
const API_BASE = (window.PEERCONNECT_API_BASE || "https://educonnect-backend-spso.onrender.com/api").replace(/\/+$/, "");
const AUTH_KEY = "peerconnect_auth_token";
const token = localStorage.getItem(AUTH_KEY);

// Protect page
if (!token) window.location.href = "index.html";

// Elements
const materialsList  = document.getElementById("materialsList");
const emptyMessage   = document.getElementById("emptyMessage");
const searchInput    = document.getElementById("searchInput");
const moduleFilter   = document.getElementById("moduleFilter");
const yearFilter     = document.getElementById("yearFilter");
const typeFilter     = document.getElementById("typeFilter");
const sortFilter     = document.getElementById("sortFilter");
const uploadModal    = document.getElementById("uploadModal");
const fileInput      = document.getElementById("fileInput");
const fileName       = document.getElementById("fileName");
const uploadForm     = document.getElementById("uploadForm");
const linkInput      = document.getElementById("linkInput");

// Optional access modal
const accessModal    = document.getElementById("accessModal");

// Gate banner
let gateBanner;
function ensureGateBanner() {
  if (gateBanner) return gateBanner;
  gateBanner = document.createElement("div");
  gateBanner.id = "downloadGateBanner";
  gateBanner.style.cssText =
    "max-width:1200px;margin:0 auto 16px auto;padding:10px 14px;border-radius:10px;" +
    "background:rgba(255,255,255,0.10);color:#fff;text-align:center;display:none;";
  gateBanner.innerHTML = `🔒 To view or download study materials (including links), please upload at least <b>one</b> material.`;
  const container = document.querySelector(".container");
  container.insertBefore(gateBanner, container.querySelector(".materials-grid"));
  return gateBanner;
}

// Pagination
const paginationContainer = document.createElement("div");
paginationContainer.id = "pagination";
paginationContainer.style.textAlign = "center";
paginationContainer.style.margin = "20px";
paginationContainer.style.color = "white";
materialsList.insertAdjacentElement("afterend", paginationContainer);

let studyMaterials = [];
let currentPage = 1;
let totalPages = 1;
const limit = 10;

// Gate state
let canDownload = false;

function authHeaders(extra = {}) {
  return { Authorization: `Bearer ${token}`, ...extra };
}

// ---------------- API ----------------
async function fetchDownloadStatus() {
  try {
    const res = await fetch(`${API_BASE}/study-materials/me/status`, { headers: authHeaders() });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    canDownload = !!data.can_download;
    ensureGateBanner().style.display = canDownload ? "none" : "block";
  } catch {
    canDownload = false;
    ensureGateBanner().style.display = "block";
  }
}

async function fetchMaterials(page = 1) {
  try {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", limit);
    if (searchInput?.value) params.set("search", searchInput.value);
    if (moduleFilter?.value) params.set("module", moduleFilter.value);
    if (yearFilter?.value) params.set("year", yearFilter.value);
    if (typeFilter?.value) params.set("type", typeFilter.value);
    if (sortFilter?.value) params.set("sort", sortFilter.value);

    const res = await fetch(`${API_BASE}/study-materials?${params.toString()}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const data = await res.json();

    studyMaterials = data.materials || [];
    currentPage = data.page || page;
    totalPages = data.totalPages || 1;

    renderMaterials();
    renderPagination();
  } catch (err) {
    console.error("API error:", err);
    materialsList.innerHTML = "";
    emptyMessage.style.display = "block";
  }
}

async function uploadMaterial(formData) {
  try {
    const res = await fetch(`${API_BASE}/study-materials/upload`, {
      method: "POST",
      headers: authHeaders(), // do NOT set Content-Type for FormData
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || `Upload failed (${res.status})`);

    alert("Material uploaded successfully!");
    closeUploadModal();

    // Unlock gate and refresh list
    await fetchDownloadStatus();
    await fetchMaterials(currentPage);
  } catch (err) {
    console.error("Upload error:", err);
    alert("Error uploading material: " + err.message);
  }
}

// Always use gated endpoint (even for external links). Server will redirect when appropriate.

function downloadMaterial(id) {
  // Always hit the gated endpoint, include token, and open in a new tab.
  const url = `${API_BASE}/study-materials/download/${id}?token=${encodeURIComponent(token)}`;

  // Try to open in a new tab (best UX for external links). If blocked, fall back to same tab.
  const w = window.open(url, "_blank", "noopener");
  if (!w) window.location.href = url;
}


// ---------------- UI ----------------
function renderMaterials() {
  materialsList.innerHTML = "";
  if (!studyMaterials.length) {
    emptyMessage.style.display = "block";
    return;
  }
  emptyMessage.style.display = "none";

  studyMaterials.forEach((m) => {
    const card = document.createElement("div");
    card.className = "material-card glass-card";

    const title = escapeHtml(m.title || "Untitled");
    const desc  = escapeHtml(m.description || "");
    const type  = m.type || "";
    const mod   = m.module || "";
    const year  = m.year || "";
    const when  = formatDate(m.uploaded_at);
    const by    = m.uploader_name || "Unknown";

    // Determine if there's any viewable target at all
    const hasExternal = !!(
      (m.link && /^https?:\/\//i.test(m.link)) ||
      (m.file_url && /^https?:\/\//i.test(m.file_url))
    );
    const hasLocalFile = !!(m.file_url && !/^https?:\/\//i.test(m.file_url));
    const hasAnything = hasExternal || hasLocalFile;

    const fileTypeLabel = getFileType(
      hasExternal ? "LINK" : (hasLocalFile ? m.file_url : "")
    );

    // One button path for both local file & external link:
    let actionHtml = "";
    if (hasAnything) {
      actionHtml = canDownload
        ? `<button class="download-btn" data-id="${m.id}">
             <i class="fas fa-download"></i> View / Download
           </button>`
        : `<button class="download-btn disabled" title="Upload at least one material to unlock access">
             <i class="fas fa-lock"></i> Access Locked
           </button>`;
    } else {
      actionHtml = `<span class="hint">No file available</span>`;
    }

    card.innerHTML = `
      <div class="material-header">
        <span class="material-type">${type}</span>
        <span>${when}</span>
      </div>
      <div class="material-title">${title}</div>
      <div class="material-meta">
        <span><i class="fas fa-book"></i> ${mod}</span>
        <span><i class="fas fa-calendar"></i> ${year}</span>
      </div>
      <div class="material-uploader">
        <div class="avatar-small">${by.trim().charAt(0).toUpperCase()}</div>
        <span>Uploaded by: ${by}</span>
      </div>
      <div class="material-description">${desc}</div>
      <div class="material-actions">
        <div class="material-stats">
          <span><i class="fas fa-download"></i> ${m.downloads || 0}</span>
          <span><i class="fas fa-file"></i> ${fileTypeLabel}</span>
        </div>
        ${actionHtml}
      </div>
    `;
    materialsList.appendChild(card);
  });

  // Wire gated action buttons
  materialsList.querySelectorAll(".download-btn[data-id]").forEach(btn => {
    btn.addEventListener("click", () => downloadMaterial(btn.getAttribute("data-id")));
  });

  materialsList.querySelectorAll(".download-btn.disabled").forEach(btn => {
    btn.addEventListener("click", () => {
      if (accessModal) {
        accessModal.style.display = "flex";
        document.body.style.overflow = "hidden";
      } else {
        alert("To access study materials, please upload at least one item first.");
      }
    });
  });
}

function renderPagination() {
  paginationContainer.innerHTML = "";
  if (totalPages <= 1) return;

  const prev = document.createElement("button");
  prev.textContent = "Previous";
  prev.disabled = currentPage === 1;
  prev.onclick = () => fetchMaterials(currentPage - 1);

  const info = document.createElement("span");
  info.textContent = ` Page ${currentPage} of ${totalPages} `;

  const next = document.createElement("button");
  next.textContent = "Next";
  next.disabled = currentPage === totalPages;
  next.onclick = () => fetchMaterials(currentPage + 1);

  paginationContainer.appendChild(prev);
  paginationContainer.appendChild(info);
  paginationContainer.appendChild(next);
}

// ---------------- Helpers ----------------
function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function getFileType(fileUrl) {
  if (!fileUrl) return "—";
  if (fileUrl === "LINK" || /^https?:\/\//i.test(String(fileUrl))) return "LINK";
  const ext = String(fileUrl).split(".").pop().toLowerCase();
  const map = { pdf:"PDF", doc:"DOC", docx:"DOCX", ppt:"PPT", pptx:"PPTX", xls:"XLS", xlsx:"XLSX", zip:"ZIP", txt:"TXT" };
  return map[ext] || ext.toUpperCase();
}
function formatDate(str) {
  if (!str) return "";
  const d = new Date(str);
  return d.toLocaleDateString();
}

// ---------------- Modal / Events ----------------
function openUploadModal() {
  uploadModal.style.display = "flex";
  document.body.style.overflow = "hidden";
}
function closeUploadModal() {
  uploadModal.style.display = "none";
  document.body.style.overflow = "auto";
  uploadForm.reset();
  if (fileName) fileName.textContent = "";
}

document.getElementById("uploadBtn")?.addEventListener("click", openUploadModal);
document.getElementById("closeUpload")?.addEventListener("click", closeUploadModal);
document.getElementById("resetBtn")?.addEventListener("click", () => {
  searchInput.value = "";
  moduleFilter.value = "";
  yearFilter.value = "";
  typeFilter.value = "";
  sortFilter.value = "recent";
  fetchMaterials(1);
});
document.getElementById("uploadNowBtn")?.addEventListener("click", () => {
  if (accessModal) {
    accessModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
  openUploadModal();
});
document.getElementById("cancelAccessBtn")?.addEventListener("click", () => {
  if (accessModal) {
    accessModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

[searchInput, moduleFilter, yearFilter, typeFilter, sortFilter].forEach(el => {
  el?.addEventListener(el.tagName === "INPUT" ? "input" : "change", () => fetchMaterials(1));
});

uploadForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(uploadForm);

  const hasFile = fileInput?.files?.length > 0;
  const hasLink = linkInput && linkInput.value.trim() !== "";

  if (hasFile && hasLink) return alert("Please provide either a file OR a link, not both.");
  if (!hasFile && !hasLink) return alert("Please upload a file or provide a link.");

  if (hasFile && fileName) fileName.textContent = fileInput.files[0].name;

  uploadMaterial(formData);
});

fileInput?.addEventListener("change", () => {
  if (fileName) fileName.textContent = fileInput.files.length ? fileInput.files[0].name : "";
});

window.addEventListener("click", (e) => {
  if (e.target === uploadModal) closeUploadModal();
  if (accessModal && e.target === accessModal) {
    accessModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

// ---------------- Init ----------------
(async () => {
  await fetchDownloadStatus();
  await fetchMaterials(1);
})();



