// public/dashboard.js - Update the trending section
document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = (window.PEERCONNECT_API_BASE || "http://localhost:5000/api").replace(/\/+$/, "");
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
      "Content-Type": "application/json",
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

  // Validate token and load user profile
  let currentUser = null;
  
  try {
    const profileData = await fetchJSON("/users/me");
    currentUser = profileData.user || profileData;
    
    // Update welcome banner with user's actual name
    const usernameElement = document.getElementById("username");
    if (usernameElement && currentUser) {
      const firstName = currentUser.first_name || currentUser.firstName || '';
      const lastName = currentUser.last_name || currentUser.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      
      usernameElement.textContent = fullName || "Student";
    }
    
    // Update profile picture
    const profilePic = document.querySelector(".profile-pic img");
    if (profilePic && currentUser) {
      const firstName = currentUser.first_name || currentUser.firstName || 'User';
      const lastName = currentUser.last_name || currentUser.lastName || 'Name';
      profilePic.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=3498db&color=fff`;
    }
    
  } catch (err) {
    console.error("Token validation or profile load failed:", err);
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

  // ---- Trending Discussions - 4 Most Viewed Posts ----
  (async () => {
    const container = document.getElementById("trending-list");
    const empty = document.getElementById("trending-empty");
    
    try {
      const data = await fetchJSON("/discussions/trending?limit=4");
      container.innerHTML = "";
      
      if (!data.success || !data.discussions || data.discussions.length === 0) {
        empty.style.display = "block";
        empty.textContent = "No trending discussions yet";
        return;
      }
      
      empty.style.display = "none";
      
      data.discussions.forEach(discussion => {
        const item = document.createElement("div");
        item.className = "notification-item";
        item.style.cursor = "pointer";
        item.style.padding = "12px";
        item.style.borderRadius = "8px";
        item.style.transition = "all 0.3s ease";
        item.style.border = "1px solid rgba(255,255,255,0.1)";
        
        item.innerHTML = `
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
              <div style="flex: 1;">
                <strong style="font-size: 14px; display: block; margin-bottom: 5px; line-height: 1.3;">
                  ${discussion.title}
                </strong>
                <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 8px;">
                  by ${discussion.first_name} ${discussion.last_name}
                </div>
              </div>
              <div style="text-align: right; min-width: 60px;">
                <div style="font-size: 16px; font-weight: bold; color: #e74c3c; margin-bottom: 2px;">
                  ${discussion.views}
                </div>
                <div style="font-size: 10px; color: rgba(255,255,255,0.6);">
                  views
                </div>
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
              <div style="display: flex; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <i class="fas fa-eye" style="font-size: 11px; color: rgba(255,255,255,0.6);"></i>
                  <span style="font-size: 11px; color: rgba(255,255,255,0.7);">${discussion.views} views</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <i class="fas fa-heart" style="font-size: 11px; color: rgba(255,255,255,0.6);"></i>
                  <span style="font-size: 11px; color: rgba(255,255,255,0.7);">${discussion.likes} likes</span>
                </div>
              </div>
              <div style="font-size: 10px; color: rgba(255,255,255,0.5);">
                ${formatTimeAgo(discussion.created_at)}
              </div>
            </div>
            
            ${discussion.category ? `
              <div style="margin-top: 8px;">
                <span style="background: rgba(52, 152, 219, 0.3); color: #3498db; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 500;">
                  ${discussion.category}
                </span>
              </div>
            ` : ''}
          </div>
        `;
        
        // Hover effect
        item.addEventListener('mouseenter', () => {
          item.style.background = 'rgba(255,255,255,0.15)';
          item.style.transform = 'translateY(-2px)';
        });
        
        item.addEventListener('mouseleave', () => {
          item.style.background = 'rgba(255,255,255,0.1)';
          item.style.transform = 'translateY(0)';
        });
        
        // Click to open discussion
        item.addEventListener('click', () => {
          window.location.href = `forum.html?id=${discussion.id}`;
        });
        
        container.appendChild(item);
      });
      
    } catch (error) {
      console.error("Trending discussions load error:", error);
      empty.style.display = "block";
      empty.textContent = "Failed to load trending discussions";
    }
  })();

  // ---- Notifications - Display 4 Latest ----
  (async () => {
    const container = document.getElementById("notifications-list");
    const empty = document.getElementById("notifications-empty");
    
    try {
      const data = await fetchJSON("/notifications/latest");
      container.innerHTML = "";
      
      if (!data.success || !data.notifications || data.notifications.length === 0) {
        empty.style.display = "block";
        return;
      }
      
      empty.style.display = "none";
      
      data.notifications.forEach(n => {
        const item = document.createElement("div");
        item.className = `notification-item ${n.read ? '' : 'unread'}`;
        
        // Get appropriate icon based on notification type
        let icon = "fa-bell";
        switch(n.type) {
          case "material": icon = "fa-file-alt"; break;
          case "discussion": icon = "fa-comments"; break;
          case "comment": icon = "fa-comment"; break;
          case "like": icon = "fa-heart"; break;
          case "message": icon = "fa-envelope"; break;
          case "announcement": icon = "fa-bullhorn"; break;
          default: icon = "fa-bell";
        }
        
        item.innerHTML = `
          <i class="fas ${icon}" style="color: ${n.read ? '#95a5a6' : '#3498db'};"></i>
          <div style="flex: 1;">
            <div style="font-size: 14px; ${n.read ? 'opacity: 0.8;' : 'font-weight: 500;'}">
              ${n.message || 'New notification'}
            </div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 4px;">
              ${formatTimeAgo(n.created_at)}
              ${n.first_name ? ` • By ${n.first_name} ${n.last_name}` : ''}
            </div>
          </div>
        `;
        
        // Make notification clickable
        item.style.cursor = "pointer";
        item.addEventListener("click", () => {
          // Mark as read when clicked
          if (!n.read) {
            fetchJSON(`/notifications/${n.id}/read`, { method: "PUT" });
          }
          // Navigate based on notification type
          handleNotificationClick(n);
        });
        
        container.appendChild(item);
      });
    } catch (error) {
      console.error("Notifications load error:", error);
      empty.style.display = "block";
      empty.textContent = "Failed to load notifications";
    }
  })();

  // ---- Recent Study Materials ----
  (async () => {
    const container = document.getElementById("resources-list");
    const empty = document.getElementById("resources-empty");
    try {
      const data = await fetchJSON("/study-materials?limit=5");
      container.innerHTML = "";
      
      if (!data.success || !data.materials || data.materials.length === 0) {
        empty.style.display = "block";
        return;
      }
      
      empty.style.display = "none";
      
      data.materials.forEach(material => {
        const item = document.createElement("div");
        item.className = "notification-item";
        
        let icon = "fa-file";
        if (material.type === "pdf") icon = "fa-file-pdf";
        else if (material.type === "video") icon = "fa-video";
        else if (material.type === "link") icon = "fa-link";
        
        item.innerHTML = `
          <i class="fas ${icon}" style="color: #e74c3c;"></i>
          <div style="flex: 1;">
            <div style="font-size: 14px; font-weight: 500;">${material.title}</div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.6);">
              ${material.module} • ${material.downloads} downloads
            </div>
          </div>
        `;
        
        item.style.cursor = "pointer";
        item.onclick = () => {
          window.location.href = "study-materials.html";
        };
        
        container.appendChild(item);
      });
    } catch (e) {
      console.error("Resources fetch failed:", e);
      empty.style.display = "block";
    }
  })();

  // ---- Progress ----
  (async () => {
    const meter = document.getElementById("progress-meter");
    const fill = document.getElementById("progress-fill");
    const text = document.getElementById("progress-text");
    try {
      const data = await fetchJSON("/users/me/progress");
      const percent = data?.percent || Math.floor(Math.random() * 100);
      meter.style.display = "block";
      requestAnimationFrame(() => {
        fill.style.width = percent + "%";
      });
      text.textContent = percent + "% Complete";
    } catch {
      const percent = Math.floor(Math.random() * 100);
      meter.style.display = "block";
      requestAnimationFrame(() => {
        fill.style.width = percent + "%";
      });
      text.textContent = percent + "% Complete";
    }
  })();

  // ---- Notification Badge ----
  (async () => {
    const badge = document.getElementById("notificationBadge");
    try {
      const data = await fetchJSON("/notifications/unread-count");
      if (data && data.success && typeof data.count === "number" && data.count > 0) {
        badge.style.display = "flex";
        badge.style.width = "auto";
        badge.style.height = "auto";
        badge.style.padding = "2px 6px";
        badge.textContent = data.count;
      } else {
        badge.style.display = "none";
        badge.textContent = "";
      }
    } catch {
      badge.style.display = "none";
      badge.textContent = "";
    }
  })();

  // Helper Functions
  function formatTimeAgo(timestamp) {
    if (!timestamp) return "Recently";
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return time.toLocaleDateString();
  }

  function handleNotificationClick(notification) {
    switch(notification.type) {
      case "material":
        window.location.href = "study-materials.html";
        break;
      case "discussion":
      case "comment":
      case "like":
        window.location.href = "forum.html";
        break;
      case "message":
        window.location.href = "messages.html";
        break;
      default:
        break;
    }
  }
});


