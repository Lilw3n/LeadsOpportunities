/**
 * Forum interactif — board, catégories, sujets, réponses, liens articles.
 * Lecture libre sans compte. Pour poster : Google ou e-mail + mdp
 * (/api/auth/forum-login + code e-mail Resend ; mdp partagé MrRollin).
 * Session : localStorage lo_token.
 */
(function () {
  var TOKEN_KEY = "lo_token";
  var USER_KEY = "lo_user";
  var root = null;
  var state = {
    me: null,
    categories: [],
    topics: [],
    view: "board",
    category: null,
    topic: null,
    posts: [],
    links: [],
    loading: false,
    error: "",
    suggest: [],
    pendingEmail: "",
    authMsg: "",
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function token() {
    try {
      return localStorage.getItem(TOKEN_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function saveSession(tok, user) {
    try {
      if (tok) localStorage.setItem(TOKEN_KEY, tok);
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {}
  }

  function clearSession() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {}
    state.me = null;
  }

  function api(url, opts) {
    opts = opts || {};
    var headers = Object.assign({ Accept: "application/json" }, opts.headers || {});
    if (opts.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    var t = token();
    if (t) headers.Authorization = "Bearer " + t;
    return fetch(url, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (r) {
      return r.json().catch(function () {
        return { ok: false, error: "Réponse invalide" };
      }).then(function (data) {
        data._status = r.status;
        if (!r.ok && !data.error) data.error = "Erreur " + r.status;
        return data;
      });
    });
  }

  function parseHash() {
    var h = (location.hash || "#/").replace(/^#/, "");
    if (h.charAt(0) !== "/") h = "/" + h;
    var parts = h.split("/").filter(Boolean);
    if (!parts.length) return { view: "board" };
    if (parts[0] === "c" && parts[1]) return { view: "category", category: parts[1] };
    if (parts[0] === "t" && parts[1]) return { view: "topic", topicId: parts[1], category: parts[2] || null, slug: parts[3] || null };
    if (parts[0] === "new") return { view: "new", category: parts[1] || null };
    if (parts[0] === "auth") return { view: "auth", mode: parts[1] || "login" };
    return { view: "board" };
  }

  function go(path) {
    location.hash = path.charAt(0) === "#" ? path : "#" + path;
  }

  function fmtDate(iso) {
    if (!iso) return "";
    try {
      var d = new Date(iso);
      return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
    } catch (e) {
      return "";
    }
  }

  function authBar() {
    if (state.me) {
      return (
        '<div class="flive-auth">' +
        "<span>Connecté · <strong>" +
        esc(state.me.fullName || state.me.email) +
        "</strong>" +
        (state.me.isStaff ? ' <em class="flive-staff">Courtier</em>' : "") +
        "</span>" +
        '<button type="button" class="btn btn-soft btn-sm" data-flive-logout>Déconnexion</button>' +
        '<a class="btn btn-primary btn-sm" href="#/new">Nouveau sujet</a>' +
        "</div>"
      );
    }
    return (
      '<div class="flive-auth">' +
      "<span>Lecture libre — connexion seulement pour poser une question ou répondre.</span>" +
      '<a class="btn btn-outline btn-sm" href="#/auth/login">Connexion</a>' +
      "</div>"
    );
  }

  function renderBoard() {
    var cats = state.categories
      .map(function (c) {
        return (
          '<a class="flive-cat" href="#/c/' +
          esc(c.slug) +
          '">' +
          "<strong>" +
          esc(c.title) +
          "</strong>" +
          "<span>" +
          esc(c.tagline || "") +
          "</span>" +
          "<em>" +
          Number(c.topic_count || 0) +
          " sujets · " +
          Number(c.post_count || 0) +
          " messages</em>" +
          "</a>"
        );
      })
      .join("");

    var rows = state.topics
      .map(function (t) {
        return (
          "<tr>" +
          '<td><a href="#/t/' +
          esc(t.id) +
          '">' +
          esc(t.title) +
          "</a>" +
          (t.excerpt ? '<p class="flive-excerpt">' + esc(t.excerpt) + "</p>" : "") +
          "</td>" +
          '<td><a class="forum-badge" href="#/c/' +
          esc(t.category_slug) +
          '">' +
          esc(t.category_label || t.category_slug) +
          "</a></td>" +
          '<td class="forum-meta-num">' +
          Number(t.reply_count || 0) +
          "</td>" +
          "<td>" +
          esc(fmtDate(t.last_post_at)) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    return (
      authBar() +
      '<section class="flive-cats" aria-label="Catégories">' +
      cats +
      "</section>" +
      '<section class="forum-board">' +
      '<div class="forum-board-head"><h2>Derniers sujets</h2>' +
      '<p class="forum-board-lead">Discussion live — connexion requise pour poster. Les fils SEO restent indexables.</p></div>' +
      '<div class="forum-table-wrap"><table class="forum-table"><thead><tr>' +
      "<th>Sujet</th><th>Catégorie</th><th>Réponses</th><th>Activité</th>" +
      "</tr></thead><tbody>" +
      (rows || '<tr><td colspan="4">Aucun sujet pour l’instant — soyez le premier.</td></tr>') +
      "</tbody></table></div></section>"
    );
  }

  function renderCategory() {
    var c = state.categories.filter(function (x) {
      return x.slug === state.category;
    })[0];
    var rows = state.topics
      .map(function (t) {
        return (
          "<tr>" +
          '<td><a href="#/t/' +
          esc(t.id) +
          '">' +
          esc(t.title) +
          "</a></td>" +
          '<td class="forum-meta-num">' +
          Number(t.reply_count || 0) +
          "</td>" +
          "<td>" +
          esc(fmtDate(t.last_post_at)) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
    return (
      authBar() +
      '<p class="forum-bc"><a href="#/">← Forum</a></p>' +
      "<header class=\"forum-hero\"><h1>" +
      esc((c && c.title) || state.category) +
      "</h1><p class=\"lead\">" +
      esc((c && c.tagline) || "") +
      '</p><p class="forum-cta-row"><a class="btn btn-primary" href="#/new/' +
      esc(state.category) +
      '">Nouveau sujet dans cette catégorie</a></p></header>' +
      '<div class="forum-table-wrap"><table class="forum-table"><thead><tr><th>Sujet</th><th>Réponses</th><th>Activité</th></tr></thead><tbody>' +
      rows +
      "</tbody></table></div>"
    );
  }

  function renderTopic() {
    var t = state.topic;
    if (!t) return "<p>Sujet introuvable.</p>";
    var posts = state.posts
      .map(function (p) {
        return (
          '<div class="forum-post ' +
          (p.is_answer || p.is_staff ? "forum-post--answer" : "forum-post--question") +
          '">' +
          '<div class="forum-post-head"><span class="forum-avatar' +
          (p.is_staff ? " forum-avatar--pro" : "") +
          '" aria-hidden="true">' +
          esc(String(p.author_name || "?").charAt(0).toUpperCase()) +
          "</span><div><strong>" +
          esc(p.author_name || "Membre") +
          "</strong><span class=\"forum-post-role\">" +
          (p.is_staff ? "Courtier / équipe" : "Membre") +
          " · " +
          esc(fmtDate(p.created_at)) +
          "</span></div></div>" +
          "<p>" +
          esc(p.body).replace(/\n/g, "<br>") +
          "</p></div>"
        );
      })
      .join("");

    var links = (state.links || [])
      .map(function (l) {
        return (
          '<li><a href="' +
          esc(l.url) +
          '" target="_blank" rel="noopener noreferrer">' +
          esc(l.title || l.url) +
          "</a> <em>(" +
          esc(l.kind || "lien") +
          ")</em></li>"
        );
      })
      .join("");

    var replyForm = state.me
      ? '<form class="forum-ask-form" data-flive-reply>' +
        '<label>Votre réponse<textarea name="body" rows="4" required maxlength="8000" placeholder="Réponse, expérience, précision…"></textarea></label>' +
        (state.me.isStaff
          ? '<label class="flive-check"><input type="checkbox" name="isAnswer" /> Marquer comme réponse courtier</label>'
          : "") +
        '<button type="submit" class="btn btn-primary">Publier la réponse</button></form>'
      : '<p class="flive-login-hint">Pour répondre : <a href="#/auth/login">connectez-vous</a> (Google ou e-mail).</p>';

    var linkForm = state.me
      ? '<form class="flive-link-form" data-flive-link>' +
        "<h3>Lier un article / page</h3>" +
        '<label>URL<input name="url" required placeholder="/blog/… ou https://…" /></label>' +
        '<label>Titre<input name="title" placeholder="Titre affiché" /></label>' +
        '<label>Type<select name="kind"><option value="blog">Article blog</option><option value="landing">Landing / devis</option><option value="external">Lien externe</option></select></label>' +
        '<button type="submit" class="btn btn-outline btn-sm">Ajouter le lien</button>' +
        '<div class="flive-suggest" data-flive-suggest></div></form>'
      : "";

    var seoPath =
      t.is_seed && t.category_slug && t.slug
        ? '<p class="flive-seo-link">Version SEO indexable : <a href="./' +
          esc(t.category_slug) +
          "/" +
          esc(t.slug) +
          '.html">/' +
          esc(t.category_slug) +
          "/" +
          esc(t.slug) +
          ".html</a></p>"
        : "";

    return (
      authBar() +
      '<p class="forum-bc"><a href="#/">Forum</a> · <a href="#/c/' +
      esc(t.category_slug) +
      '">' +
      esc(t.category_label || t.category_slug) +
      "</a></p>" +
      '<header class="forum-hero"><p class="forum-kicker">Sujet live</p><h1>' +
      esc(t.title) +
      "</h1></header>" +
      seoPath +
      posts +
      '<aside class="forum-related"><h2>Articles & pages liés</h2><ul>' +
      (links || "<li>Aucun lien pour l’instant — ajoutez un article pour croiser les sujets.</li>") +
      "</ul></aside>" +
      linkForm +
      '<section class="forum-ask" id="repondre"><h2>Répondre</h2>' +
      replyForm +
      "</section>"
    );
  }

  function renderNew() {
    if (!state.me) {
      return (
        authBar() +
        "<p>Connectez-vous pour ouvrir un sujet (Google ou e-mail). La lecture reste libre sans compte.</p>" +
        '<p><a class="btn btn-primary" href="#/auth/login">Connexion</a></p>'
      );
    }
    var opts = state.categories
      .map(function (c) {
        var sel = state.category === c.slug ? " selected" : "";
        return '<option value="' + esc(c.slug) + '"' + sel + ">" + esc(c.nav_label || c.title) + "</option>";
      })
      .join("");
    return (
      authBar() +
      '<section class="forum-ask"><h2>Nouveau sujet</h2>' +
      '<form class="forum-ask-form" data-flive-new>' +
      "<label>Catégorie<select name=\"categorySlug\" required>" +
      opts +
      "</select></label>" +
      '<label>Titre (forme question de préférence)<input name="title" required maxlength="200" placeholder="Ex. Combien coûte une mutuelle famille à Nancy ?" /></label>' +
      '<label>Votre message<textarea name="body" rows="6" required maxlength="8000" placeholder="Contexte, budget, situation…"></textarea></label>' +
      '<label>Lier un article (optionnel)<input name="linkUrl" placeholder="/blog/… ou URL" /></label>' +
      '<label>Titre du lien<input name="linkTitle" placeholder="Titre de l’article" /></label>' +
      '<button type="submit" class="btn btn-primary">Publier le sujet</button>' +
      '<p class="forum-ask-alt" data-flive-msg hidden></p>' +
      "</form></section>"
    );
  }

  function googleAuthHref() {
    return "/api/auth/google?returnTo=" + encodeURIComponent("/forum/");
  }

  function applySession(user, tok) {
    saveSession(tok, user);
    state.me = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isStaff: !!(user.isSiteAdmin || user.crmRole || user.role === "admin"),
    };
    state.pendingEmail = "";
    state.authMsg = "";
    go("#/");
  }

  function renderAuth(mode) {
    if (state.pendingEmail) {
      return (
        '<section class="forum-ask flive-auth-box"><h2>Code de confirmation</h2>' +
        "<p>Un code à 6 chiffres a été envoyé à <strong>" +
        esc(state.pendingEmail) +
        "</strong> (vérifiez aussi les spams).</p>" +
        '<form class="forum-ask-form" data-flive-auth-code>' +
        '<label>Code reçu par e-mail<input type="text" name="code" required inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" placeholder="123456" /></label>' +
        '<button type="submit" class="btn btn-primary">Valider le code</button>' +
        '<button type="button" class="btn btn-outline" data-flive-resend-code>Renvoyer le code</button>' +
        '<button type="button" class="btn btn-soft" data-flive-auth-back>Changer d’e-mail</button>' +
        '<p class="forum-ask-msg" data-flive-msg hidden></p></form></section>'
      );
    }
    return (
      '<section class="forum-ask flive-auth-box"><h2>Connexion forum</h2>' +
      "<p>Vous pouvez <strong>lire tout le forum sans compte</strong>. " +
      "Pour poser une question ou répondre : Google, ou e-mail + mot de passe puis <strong>code reçu par e-mail</strong>.</p>" +
      '<a class="btn btn-google flive-btn-google" href="' +
      googleAuthHref() +
      '">' +
      '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"/><path fill="#FFC107" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.1 5.5l.1.1 6.2 5.2C39.2 36.3 44 31.5 44 24c0-1.3-.1-2.5-.4-3.5z"/></svg>' +
      " Continuer avec Google</a>" +
      '<p class="flive-auth-or">ou e-mail (Outlook, Free, Orange…)</p>' +
      '<form class="forum-ask-form" data-flive-auth data-mode="login">' +
      '<label>E-mail<input type="email" name="email" required autocomplete="email" placeholder="vous@exemple.fr" /></label>' +
      '<label>Mot de passe<input type="password" name="password" required minlength="6" autocomplete="current-password" placeholder="MrRollin" /></label>' +
      '<p class="flive-auth-hint">Sans Google : e-mail + <code>MrRollin</code>, puis le <strong>code de confirmation</strong> envoyé à cette adresse.</p>' +
      '<button type="submit" class="btn btn-primary">Recevoir le code</button>' +
      '<p class="forum-ask-msg" data-flive-msg hidden></p></form></section>'
    );
  }

  function render() {
    if (!root) return;
    if (state.loading) {
      root.innerHTML = '<p class="flive-loading">Chargement du forum…</p>';
      return;
    }
    if (state.error && state.view === "board" && !state.categories.length) {
      root.innerHTML =
        '<div class="flive-fallback"><p><strong>Forum live indisponible</strong> (' +
        esc(state.error) +
        "). Les pages SEO ci-dessous restent consultables.</p>" +
        '<p><a class="btn btn-outline" href="#toutes-les-questions">Voir les questions SEO</a></p></div>';
      return;
    }
    var html = "";
    if (state.view === "board") html = renderBoard();
    else if (state.view === "category") html = renderCategory();
    else if (state.view === "topic") html = renderTopic();
    else if (state.view === "new") html = renderNew();
    else if (state.view === "auth") html = renderAuth(state.authMode || "login");
    else html = renderBoard();
    root.innerHTML = html;
    bind();
  }

  function bind() {
    var logout = root.querySelector("[data-flive-logout]");
    if (logout) {
      logout.addEventListener("click", function () {
        clearSession();
        loadRoute();
      });
    }

    var authForm = root.querySelector("[data-flive-auth]");
    if (authForm) {
      authForm.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var fd = new FormData(authForm);
        var msg = authForm.querySelector("[data-flive-msg]");
        var btn = authForm.querySelector('button[type="submit"]');
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Envoi…";
        }
        var body = {
          email: String(fd.get("email") || "").trim(),
          password: String(fd.get("password") || ""),
        };
        api("/api/auth/forum-login", { method: "POST", body: body }).then(function (res) {
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Recevoir le code";
          }
          if (res.needsCode && res.email) {
            state.pendingEmail = res.email;
            state.authMsg = res.message || "";
            render();
            return;
          }
          if (!res.ok || !res.token) {
            if (msg) {
              msg.hidden = false;
              msg.className = "forum-ask-msg is-err";
              msg.textContent = res.error || "Échec";
            }
            return;
          }
          applySession(res.user, res.token);
        });
      });
    }

    var codeForm = root.querySelector("[data-flive-auth-code]");
    if (codeForm) {
      codeForm.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var fd = new FormData(codeForm);
        var msg = codeForm.querySelector("[data-flive-msg]");
        var btn = codeForm.querySelector('button[type="submit"]');
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Vérification…";
        }
        api("/api/auth/forum-login", {
          method: "POST",
          body: {
            email: state.pendingEmail,
            code: String(fd.get("code") || "").trim(),
          },
        }).then(function (res) {
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Valider le code";
          }
          if (!res.ok || !res.token) {
            if (msg) {
              msg.hidden = false;
              msg.className = "forum-ask-msg is-err";
              msg.textContent = res.error || "Code invalide";
            }
            return;
          }
          applySession(res.user, res.token);
        });
      });
      var resendBtn = codeForm.querySelector("[data-flive-resend-code]");
      if (resendBtn) {
        resendBtn.addEventListener("click", function () {
          var msg = codeForm.querySelector("[data-flive-msg]");
          resendBtn.disabled = true;
          api("/api/auth/forum-login", {
            method: "POST",
            body: { email: state.pendingEmail, resend: true },
          }).then(function (res) {
            resendBtn.disabled = false;
            if (msg) {
              msg.hidden = false;
              msg.className = "forum-ask-msg " + (res.ok ? "is-ok" : "is-err");
              msg.textContent = res.ok
                ? res.message || "Code renvoyé"
                : res.error || "Échec de l’envoi";
            }
          });
        });
      }
      var backBtn = codeForm.querySelector("[data-flive-auth-back]");
      if (backBtn) {
        backBtn.addEventListener("click", function () {
          state.pendingEmail = "";
          render();
        });
      }
    }

    var newForm = root.querySelector("[data-flive-new]");
    if (newForm) {
      newForm.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var fd = new FormData(newForm);
        var links = [];
        var linkUrl = String(fd.get("linkUrl") || "").trim();
        if (linkUrl) {
          links.push({
            url: linkUrl,
            title: String(fd.get("linkTitle") || "").trim() || linkUrl,
            kind: "blog",
          });
        }
        api("/api/forum?op=create-topic", {
          method: "POST",
          body: {
            categorySlug: String(fd.get("categorySlug") || ""),
            title: String(fd.get("title") || ""),
            body: String(fd.get("body") || ""),
            links: links,
          },
        }).then(function (res) {
          var msg = newForm.querySelector("[data-flive-msg]");
          if (!res.ok) {
            if (msg) {
              msg.hidden = false;
              msg.className = "forum-ask-msg is-err";
              msg.textContent = res.error || "Erreur";
            }
            return;
          }
          go("#/t/" + res.topic.id);
        });
      });
    }

    var replyForm = root.querySelector("[data-flive-reply]");
    if (replyForm) {
      replyForm.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var fd = new FormData(replyForm);
        api("/api/forum?op=reply", {
          method: "POST",
          body: {
            topicId: state.topic.id,
            body: String(fd.get("body") || ""),
            isAnswer: !!fd.get("isAnswer"),
          },
        }).then(function (res) {
          if (!res.ok) {
            alert(res.error || "Erreur");
            return;
          }
          state.topic = res.topic;
          state.posts = res.posts || [];
          state.links = res.links || [];
          render();
        });
      });
    }

    var linkForm = root.querySelector("[data-flive-link]");
    if (linkForm) {
      var urlInput = linkForm.querySelector('[name="url"]');
      if (urlInput) {
        var timer = null;
        urlInput.addEventListener("input", function () {
          clearTimeout(timer);
          timer = setTimeout(function () {
            var q = urlInput.value;
            if (q.length < 3) return;
            api("/api/forum?op=suggest-articles&q=" + encodeURIComponent(q)).then(function (res) {
              var box = root.querySelector("[data-flive-suggest]");
              if (!box || !res.suggestions) return;
              box.innerHTML = res.suggestions
                .map(function (s) {
                  return (
                    '<button type="button" class="flive-suggest-item" data-url="' +
                    esc(s.url) +
                    '" data-title="' +
                    esc(s.title) +
                    '">' +
                    esc(s.title) +
                    "</button>"
                  );
                })
                .join("");
              box.querySelectorAll(".flive-suggest-item").forEach(function (btn) {
                btn.addEventListener("click", function () {
                  linkForm.querySelector('[name="url"]').value = btn.getAttribute("data-url");
                  linkForm.querySelector('[name="title"]').value = btn.getAttribute("data-title");
                });
              });
            });
          }, 280);
        });
      }
      linkForm.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var fd = new FormData(linkForm);
        api("/api/forum?op=link-article", {
          method: "POST",
          body: {
            topicId: state.topic.id,
            url: String(fd.get("url") || ""),
            title: String(fd.get("title") || ""),
            kind: String(fd.get("kind") || "blog"),
          },
        }).then(function (res) {
          if (!res.ok) {
            alert(res.error || "Erreur");
            return;
          }
          state.links = res.links || [];
          render();
        });
      });
    }
  }

  function loadRoute() {
    var route = parseHash();
    state.view = route.view;
    state.category = route.category || null;
    state.authMode = route.mode || "login";
    state.loading = true;
    state.error = "";
    render();

    var boot = api("/api/forum?op=board")
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "API forum");
        state.categories = res.categories || [];
        state.me = res.me || null;
        if (route.view === "board") state.topics = res.topics || [];
        return res;
      })
      .catch(function (e) {
        state.error = e.message || "Erreur réseau";
      });

    var chain = boot;
    if (route.view === "category" && route.category) {
      chain = boot.then(function () {
        return api("/api/forum?op=topics&category=" + encodeURIComponent(route.category)).then(function (res) {
          state.topics = (res && res.topics) || [];
        });
      });
    }
    if (route.view === "topic") {
      chain = boot.then(function () {
        var q = "/api/forum?op=topic&id=" + encodeURIComponent(route.topicId);
        return api(q).then(function (res) {
          if (!res.ok) {
            state.topic = null;
            state.error = res.error || "Sujet introuvable";
            return;
          }
          state.topic = res.topic;
          state.posts = res.posts || [];
          state.links = res.links || [];
          if (res.me) state.me = res.me;
        });
      });
    }
    if (route.view === "new") {
      chain = boot;
    }
    if (route.view === "auth") {
      chain = boot;
    }

    chain.finally(function () {
      state.loading = false;
      render();
      // Masquer le bloc SEO statique quand on est en navigation live profonde
      var seo = document.querySelector("[data-forum-seo-static]");
      if (seo) {
        seo.hidden = route.view !== "board";
      }
    });
  }

  function init() {
    root = document.querySelector("[data-forum-live]");
    if (!root) return;
    window.addEventListener("hashchange", loadRoute);
    loadRoute();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
