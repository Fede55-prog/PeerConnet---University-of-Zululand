// public/dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = (window.PEERCONNECT_API_BASE || "https://educonnect-backend-spso.onrender.com/api").replace(/\/+$/, "");
  const AUTH_KEY = "peerconnect_auth_token";
  const token = localStorage.getItem(AUTH_KEY);

  // 🔒 Redirect if not logged in
  if (!token) {
    window.location.href = "log-in.html";
    return;
  }

  // Reusable fetch with JWT
  async function fetchJSON(path, options = {}) {
    const headers = {
      "Authorization": `Bearer ${localStorage.getItem(AUTH_KEY)}`,
      "Accept": "application/json",
      ...(options.headers || {}),
    };

    const res = await fetch(API_BASE + path, { ...options, headers });
    if (res.status === 401) {
      // Token invalid or expired → logout
      localStorage.removeItem(AUTH_KEY);
      alert("Your session expired. Please log in again.");
      window.location.href = "log-in.html";
      throw new Error("Unauthorized");
    }
    if (!res.ok) throw new Error("API error " + res.status);
    return res.json();
  }

  // Validate token
  try {
    await fetchJSON("/auth/validate");
  } catch (err) {
    console.error("Token validation failed:", err);
    localStorage.removeItem(AUTH_KEY);
    window.location.href = "log-in.html";
    return;
  }

  // 🔘 Logout
  const logoutLink = document.querySelector(".dropdown-menu a:last-child");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem(AUTH_KEY);
      window.location.href = "log-in.html";
    });
  }

  // ---- Load Profile ----
  (async () => {
    try {
      const profile = await fetchJSON(`/users/me`);
      document.getElementById("username").textContent =
        `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Student";
      document.querySelector(".profile-pic img").src =
        `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&background=3498db&color=fff`;
    } catch (e) {
      console.error("Profile load error", e);
    }
  })();

  // ---- Notifications ----
  (async () => {
    const container = document.getElementById("notifications-list");
    const empty = document.getElementById("notifications-empty");
    try {
      const data = await fetchJSON(`/notifications?limit=5`);
      container.innerHTML = "";
      if (!data || !data.length) {
        empty.style.display = "block";
        return;
      }
      data.forEach(n => {
        const item = document.createElement("div");
        item.className = "notification-item";
        item.innerHTML = `<i class="fas fa-bell"></i><span>${n.text}</span>`;
        container.appendChild(item);
      });
    } catch {
      empty.style.display = "block";
    }
  })();

  // ---- Trending ----
  (async () => {
    const container = document.getElementById("trending-list");
    const empty = document.getElementById("trending-empty");
    try {
      const data = await fetchJSON(`/discussions/trending?limit=5`);
      container.innerHTML = "";
      if (!data || !data.length) {
        empty.style.display = "block";
        return;
      }
      data.forEach(d => {
        const item = document.createElement("div");
        item.className = "notification-item";
        item.innerHTML = `<span>${d.title}</span>`;
        item.onclick = () => (window.location.href = `forum.html?id=${d.id}`);
        container.appendChild(item);
      });
    } catch {
      empty.style.display = "block";
    }
  })();

  // ---- Resources ----
  (async () => {
    const container = document.getElementById("resources-list");
    const empty = document.getElementById("resources-empty");
    try {
      const data = await fetchJSON(`/study-materials?limit=5`);
      container.innerHTML = "";
      if (!data || !data.length) {
        empty.style.display = "block";
        return;
      }
      data.forEach(r => {
        const item = document.createElement("div");
        item.className = "notification-item";
        item.innerHTML = r.url
          ? `<a href="${r.url}" target="_blank" rel="noopener">${r.title}</a>`
          : `<span>${r.title}</span>`;
        container.appendChild(item);
      });
    } catch {
      empty.style.display = "block";
    }
  })();

  // ---- Progress ----
  (async () => {
    const meter = document.getElementById("progress-meter");
    const fill = document.getElementById("progress-fill");
    const text = document.getElementById("progress-text");
    try {
      const data = await fetchJSON(`/users/me/progress`);
      const percent = data?.percent || 0;
      meter.style.display = "block";
      requestAnimationFrame(() => {
        fill.style.width = percent + "%";
      });
      text.textContent = percent + "% Complete";
    } catch {
      text.textContent = "No progress data.";
    }
  })();

  // ---- Notification Badge ----
  (async () => {
    const badge = document.getElementById("notificationBadge");
    try {
      const data = await fetchJSON(`/notifications/unread-count`);
      if (data && typeof data.count === "number" && data.count > 0) {
        badge.style.width = "auto";
        badge.style.height = "auto";
        badge.style.padding = "2px 6px";
        badge.textContent = data.count;
      } else {
        badge.textContent = "";
      }
    } catch {
      badge.textContent = "";
    }
  })();
});

