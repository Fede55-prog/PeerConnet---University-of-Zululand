// public/auth.js
document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const loginForm = document.getElementById("loginForm");
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const activateAccountForm = document.getElementById("activateAccountForm");

  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");
  const forgotPasswordError = document.getElementById("forgotPasswordError");
  const forgotPasswordSuccess = document.getElementById("forgotPasswordSuccess");
  const activateAccountError = document.getElementById("activateAccountError");
  const activateAccountSuccess = document.getElementById("activateAccountSuccess");

  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  const activateAccountLink = document.getElementById("activateAccountLink");
  const forgotPasswordModal = document.getElementById("forgotPasswordModal");
  const activateAccountModal = document.getElementById("activateAccountModal");
  const closeButtons = document.querySelectorAll(".close-btn");
  const backToLoginFromForgot = document.getElementById("backToLoginFromForgot");
  const backToLoginFromActivate = document.getElementById("backToLoginFromActivate");

  const API_BASE = "http://localhost:5000/api";

  // ---------------- MODAL FUNCTIONS ----------------
  function showModal(modal) {
    modal.style.display = "flex";
  }
  function hideModal(modal) {
    modal.style.display = "none";
  }

  if (forgotPasswordLink)
    forgotPasswordLink.addEventListener("click", () => showModal(forgotPasswordModal));
  if (activateAccountLink)
    activateAccountLink.addEventListener("click", () => showModal(activateAccountModal));

  closeButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      hideModal(forgotPasswordModal);
      hideModal(activateAccountModal);
    })
  );

  if (backToLoginFromForgot)
    backToLoginFromForgot.addEventListener("click", () => hideModal(forgotPasswordModal));
  if (backToLoginFromActivate)
    backToLoginFromActivate.addEventListener("click", () => hideModal(activateAccountModal));

  window.addEventListener("click", (e) => {
    if (e.target === forgotPasswordModal) hideModal(forgotPasswordModal);
    if (e.target === activateAccountModal) hideModal(activateAccountModal);
  });

  // ---------------- LOGIN ----------------
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const studentNumber = document.getElementById("studentNumber").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentNumber, password }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // ✅ Save token + user info for profile page
          localStorage.setItem("peerconnect_auth_token", data.token);
          localStorage.setItem("peerconnect_user", JSON.stringify(data.user));

          successMessage.textContent = data.message || "Login successful!";
          successMessage.style.display = "block";
          errorMessage.style.display = "none";

          // Redirect to profile after short delay
          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 1000);
        } else {
          errorMessage.textContent = data.message || "Invalid login credentials";
          errorMessage.style.display = "block";
          successMessage.style.display = "none";
        }
      } catch (err) {
        console.error("Login error:", err);
        errorMessage.textContent = "Server error. Please try again later.";
        errorMessage.style.display = "block";
        successMessage.style.display = "none";
      }
    });
  }

  // ---------------- FORGOT PASSWORD ----------------
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const studentEmail = document.getElementById("studentEmail").value;

      try {
        const res = await fetch(`${API_BASE}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: studentEmail }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          forgotPasswordSuccess.textContent = data.message || "Reset email sent!";
          forgotPasswordSuccess.style.display = "block";
          forgotPasswordError.style.display = "none";
        } else {
          forgotPasswordError.textContent = data.message || "Request failed";
          forgotPasswordError.style.display = "block";
          forgotPasswordSuccess.style.display = "none";
        }
      } catch (err) {
        forgotPasswordError.textContent = "Server error. Please try again later.";
        forgotPasswordError.style.display = "block";
        forgotPasswordSuccess.style.display = "none";
      }
    });
  }

  // ---------------- ACTIVATE ACCOUNT ----------------
  if (activateAccountForm) {
    activateAccountForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const student_number = document.getElementById("activateStudentNumber").value;
      const email = document.getElementById("activateEmail").value;
      const password = document.getElementById("activatePassword").value;

      try {
        const res = await fetch(`${API_BASE}/auth/activate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_number, email, password }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          activateAccountSuccess.textContent = data.message || "Account activated successfully!";
          activateAccountSuccess.style.display = "block";
          activateAccountError.style.display = "none";
        } else {
          activateAccountError.textContent = data.message || "Activation failed";
          activateAccountError.style.display = "block";
          activateAccountSuccess.style.display = "none";
        }
      } catch (err) {
        activateAccountError.textContent = "Server error. Please try again later.";
        activateAccountError.style.display = "block";
        activateAccountSuccess.style.display = "none";
      }
    });
  }

  // ---------------- TOKEN VALIDATION ----------------
  async function validateToken() {
    const token = localStorage.getItem("peerconnect_auth_token");
    if (!token) {
      window.location.href = "log-in.html"; // not logged in
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/validate`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        localStorage.removeItem("peerconnect_auth_token");
        localStorage.removeItem("peerconnect_user");
        window.location.href = "log-in.html"; // expired or invalid
      }
    } catch (err) {
      localStorage.removeItem("peerconnect_auth_token");
      localStorage.removeItem("peerconnect_user");
      window.location.href = "log-in.html";
    }
  }

  // If we’re on dashboard.html → check token
  if (window.location.pathname.endsWith("dashboard.html")) {
    validateToken();
  }

  // ---------------- CLEAR ERRORS ON INPUT ----------------
  const allInputs = document.querySelectorAll("input");
  allInputs.forEach((input) => {
    input.addEventListener("input", () => {
      if (errorMessage) errorMessage.style.display = "none";
      if (forgotPasswordError) forgotPasswordError.style.display = "none";
      if (activateAccountError) activateAccountError.style.display = "none";
    });
  });
});


