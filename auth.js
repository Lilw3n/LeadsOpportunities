(function () {
  var USERS_KEY = "assuranceleads_users_v1";
  var SESSION_KEY = "assuranceleads_session_v1";

  function readUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function writeUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function writeSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function ensureAdminSeed() {
    var users = readUsers();
    var adminEmail = "courtier972@gmail.com";
    var exists = users.some(function (u) {
      return normalizeEmail(u.email) === adminEmail;
    });

    if (!exists) {
      users.push({
        email: adminEmail,
        password: "Leads1!!!",
        role: "admin",
        provider: "password",
      });
      writeUsers(users);
    }
  }

  function findUserByEmail(email) {
    var normalized = normalizeEmail(email);
    return readUsers().find(function (u) {
      return normalizeEmail(u.email) === normalized;
    });
  }

  function saveMessage(text, ok) {
    var el = document.getElementById("authMessage");
    if (!el) return;
    el.hidden = false;
    el.textContent = text;
    el.style.color = ok ? "#0f766e" : "#b91c1c";
  }

  function updateSessionState() {
    var session = readSession();
    var el = document.getElementById("sessionState");
    if (!el) return;
    if (!session) {
      el.textContent = "Aucune session active.";
      return;
    }
    el.textContent =
      "Connecte en tant que " +
      session.email +
      " (" +
      session.role +
      ", " +
      session.provider +
      ").";
  }

  function bindSignup() {
    var form = document.getElementById("signupForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = normalizeEmail(document.getElementById("signupEmail").value);
      var password = document.getElementById("signupPassword").value;
      if (password.length < 8) {
        saveMessage("Mot de passe trop court (min 8 caracteres).", false);
        return;
      }
      if (findUserByEmail(email)) {
        saveMessage("Ce compte existe deja.", false);
        return;
      }
      var users = readUsers();
      users.push({ email: email, password: password, role: "user", provider: "password" });
      writeUsers(users);
      saveMessage("Inscription reussie. Tu peux te connecter.", true);
      form.reset();
    });
  }

  function bindLogin() {
    var form = document.getElementById("loginForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = normalizeEmail(document.getElementById("loginEmail").value);
      var password = document.getElementById("loginPassword").value;
      var user = findUserByEmail(email);
      if (!user || user.password !== password) {
        saveMessage("Identifiants invalides.", false);
        return;
      }
      writeSession({ email: user.email, role: user.role, provider: "password" });
      saveMessage("Connexion reussie.", true);
      updateSessionState();
    });
  }

  function bindGoogleLogin() {
    var btn = document.getElementById("googleBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var email = normalizeEmail(prompt("Email Google:"));
      if (!email || email.indexOf("@") === -1) {
        saveMessage("Email Google invalide.", false);
        return;
      }

      var users = readUsers();
      var existing = users.find(function (u) {
        return normalizeEmail(u.email) === email;
      });
      if (!existing) {
        users.push({
          email: email,
          password: "",
          role: email === "courtier972@gmail.com" ? "admin" : "user",
          provider: "google",
        });
        writeUsers(users);
      }

      var role = email === "courtier972@gmail.com" ? "admin" : "user";
      writeSession({ email: email, role: role, provider: "google" });
      saveMessage("Connexion Google reussie (mode demo local).", true);
      updateSessionState();
    });
  }

  function bindPasswordChange() {
    var form = document.getElementById("passwordForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var session = readSession();
      if (!session) {
        saveMessage("Connecte-toi d'abord.", false);
        return;
      }
      var oldPassword = document.getElementById("oldPassword").value;
      var newPassword = document.getElementById("newPassword").value;
      if (newPassword.length < 8) {
        saveMessage("Nouveau mot de passe trop court.", false);
        return;
      }
      var users = readUsers();
      var idx = users.findIndex(function (u) {
        return normalizeEmail(u.email) === normalizeEmail(session.email);
      });
      if (idx < 0) {
        saveMessage("Compte introuvable.", false);
        return;
      }
      if (users[idx].provider === "google") {
        saveMessage("Compte Google: changement via fournisseur Google.", false);
        return;
      }
      if (users[idx].password !== oldPassword) {
        saveMessage("Ancien mot de passe incorrect.", false);
        return;
      }
      users[idx].password = newPassword;
      writeUsers(users);
      saveMessage("Mot de passe mis a jour.", true);
      form.reset();
    });
  }

  function bindLogout() {
    var btn = document.getElementById("logoutBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      localStorage.removeItem(SESSION_KEY);
      saveMessage("Deconnexion effectuee.", true);
      updateSessionState();
    });
  }

  function protectAdminPage() {
    if (!window.location.pathname.endsWith("/admin.html")) return;
    var session = readSession();
    var state = document.getElementById("adminState");
    if (!session || session.role !== "admin") {
      if (state) state.textContent = "Acces refuse. Connecte-toi avec un compte admin.";
      return;
    }
    if (state) state.textContent = "Bienvenue admin " + session.email + ".";
  }

  document.addEventListener("DOMContentLoaded", function () {
    ensureAdminSeed();
    bindSignup();
    bindLogin();
    bindGoogleLogin();
    bindPasswordChange();
    bindLogout();
    updateSessionState();
    protectAdminPage();
  });
})();
