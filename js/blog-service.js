/**
 * Blog dynamique — inspire blogService.ts multisite
 */
window.BlogService = {
  STORAGE: "lo_blog_posts",

  defaultPosts: function () {
    return [
      {
        id: "post_1",
        slug: "bonus-malus-vtc-2026",
        title: "Bonus-malus VTC : ce qui change en 2026",
        excerpt: "Anticipez votre renouvellement et évitez les mauvaises surprises.",
        category: "assurance",
        icon: "🚡",
        date: "2026-05-10",
        author: "Wendy BUCHET",
        body:
          "<p>Le bonus-malus VTC suit souvent une courbe plus sensible que l'auto classique. Anticipez votre renouvellement <strong>45 jours</strong> avant l'échéance pour comparer Zéphir, Solly Azar et 2M2A.</p>" +
          "<p>Pensez à mettre à jour votre relevé d'information et votre carte VTC à jour — les assureurs vérifient systématiquement l'antécédent 12 mois.</p>",
      },
      {
        id: "post_2",
        slug: "rc-pro-freelance",
        title: "RC Pro : 5 erreurs des freelances",
        excerpt: "Les garanties oubliées qui coûtent cher en cas de litige.",
        category: "assurance",
        icon: "💼",
        date: "2026-05-05",
        author: "Wendy BUCHET",
        body:
          "<p>La RC professionnelle couvre les dommages causés à des tiers dans le cadre de votre activité. Les freelances oublient souvent : la <strong>RC après livraison</strong>, la défense pénale, ou une franchise trop élevée.</p>" +
          "<p>Adaptez le plafond à votre CA et à vos contrats clients — un courtier peut structurer le questionnaire pour éviter les exclusions.</p>",
      },
      {
        id: "post_3",
        slug: "mutuelle-tns",
        title: "Mutuelle TNS : optimiser ses remboursements",
        excerpt: "Hospitalisation, dentaire, optique — le bon niveau de garanties.",
        category: "sante",
        icon: "❤️",
        date: "2026-04-28",
        author: "Wendy BUCHET",
        body:
          "<p>Les travailleurs non salariés bénéficient souvent du <strong>Madelin</strong> sur la partie santé. Priorisez hospitalisation et optique si votre famille est jeune ; renforcez dentaire si des soins sont prévus.</p>" +
          "<p>La téléconsultation et le tiers payant généralisé sont des critères de confort au quotidien.</p>",
      },
    ];
  },

  load: function () {
    try {
      var s = localStorage.getItem(this.STORAGE);
      return s ? JSON.parse(s) : this.defaultPosts();
    } catch (e) {
      return this.defaultPosts();
    }
  },

  getCategories: function () {
    return [
      { id: "assurance", label: "Assurance", icon: "🛡️" },
      { id: "sante", label: "Santé", icon: "❤️" },
      { id: "vtc", label: "VTC", icon: "🚡" },
    ];
  },

  filter: function (category) {
    var posts = this.load();
    if (!category) return posts;
    return posts.filter(function (p) {
      return p.category === category;
    });
  },

  getBySlug: function (slug) {
    var posts = this.load();
    return posts.find(function (p) {
      return p.slug === slug;
    }) || null;
  },

  renderArticle: function (mount, slug) {
    var p = this.getBySlug(slug);
    if (!p) {
      mount.innerHTML = "<p>Article introuvable.</p>";
      return;
    }
    if (window.SeoOptimizer) {
      window.SeoOptimizer.apply({
        title: p.title + " | Blog Leads Opportunities",
        description: p.excerpt,
      });
    }
    mount.innerHTML =
      '<article><p><a href="index.html">← Blog</a></p>' +
      "<p><span style='font-size:2rem'>" +
      p.icon +
      "</span></p>" +
      "<h1>" +
      p.title +
      "</h1>" +
      "<p style='color:#64748b'>" +
      p.author +
      " · " +
      new Date(p.date).toLocaleDateString("fr-FR") +
      "</p>" +
      "<div class='article-body'>" +
      (p.body || "<p>" + p.excerpt + "</p>") +
      "</div></article>";
    if (window.SeoOptimizer && window.SeoOptimizer.jsonLd) {
      window.SeoOptimizer.jsonLd({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: p.title,
        datePublished: p.date,
        description: p.excerpt || "",
        author: { "@type": "Person", name: p.author },
      });
    }
  },

  renderList: function (mount, category) {
    var posts = this.filter(category);
    var html =
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">' +
      '<button type="button" data-cat="" class="blog-cat' +
      (!category ? " active" : "") +
      '">Tous</button>';
    this.getCategories().forEach(function (c) {
      html +=
        '<button type="button" data-cat="' +
        c.id +
        '" class="blog-cat' +
        (category === c.id ? " active" : "") +
        '">' +
        c.icon +
        " " +
        c.label +
        "</button>";
    });
    html += "</div>";
    posts.forEach(function (p) {
      html +=
        '<article style="border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:16px">' +
        "<span style='font-size:1.5rem'>" +
        p.icon +
        "</span> " +
        "<h2 style='margin:8px 0'><a href='article.html?slug=" +
        encodeURIComponent(p.slug) +
        "' style='color:inherit;text-decoration:none'>" +
        p.title +
        "</a></h2>" +
        "<p style='color:#64748b'>" +
        p.excerpt +
        "</p>" +
        "<small style='color:#94a3b8'>" +
        p.author +
        " · " +
        new Date(p.date).toLocaleDateString("fr-FR") +
        "</small></article>";
    });
    mount.innerHTML = html;
    mount.querySelectorAll(".blog-cat").forEach(function (btn) {
      btn.onclick = function () {
        window.BlogService.renderList(mount, btn.getAttribute("data-cat") || null);
      };
    });
  },
};
