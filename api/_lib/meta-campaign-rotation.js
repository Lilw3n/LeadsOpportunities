const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(process.cwd(), "config/meta-campaign-rotation.json");
const FORMS_PATH = path.join(process.cwd(), "config/meta-lead-forms.json");
const RANKING_PATH = path.join(process.cwd(), "data/meta-blog-form-ranking.json");
const VSP_PATH = path.join(process.cwd(), "config/meta-campaign-vsp-discret.json");
const ACTIVE_PATH = path.join(process.cwd(), "data/meta-campaign-rotation-active.json");

function readJson(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function parseDateOnly(iso) {
  return new Date(String(iso).slice(0, 10) + "T12:00:00Z");
}

function daysBetween(a, b) {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}

function findFormByTemplate(metaForms, templateKey) {
  if (!metaForms) return null;
  var tpl = metaForms.form_templates && metaForms.form_templates[templateKey];
  var formId = null;
  Object.keys(metaForms.forms || {}).some(function (id) {
    if (metaForms.forms[id].template === templateKey) {
      formId = id;
      return true;
    }
  });
  if (templateKey === "vsp_express") {
    var vspCfg = readJson(VSP_PATH);
    if (vspCfg && vspCfg.campaign && vspCfg.campaign.form_id) {
      formId = String(vspCfg.campaign.form_id);
    }
  }
  return { template: tpl, formId: formId, tplKey: templateKey };
}

function findBlogArticle(ranking, slug, templateKey) {
  if (!slug || !ranking || !ranking.byTemplate) return null;
  var hit = null;
  ranking.byTemplate.some(function (block) {
    if (block.templateKey !== templateKey) return false;
    return (block.articles || []).some(function (a) {
      if (a.slug === slug) {
        hit = a;
        return true;
      }
    });
  });
  if (hit) return hit;
  if (ranking.topArticles) {
    ranking.topArticles.some(function (a) {
      if (a.slug === slug) {
        hit = a;
        return true;
      }
    });
  }
  return hit;
}

function buildUtmUrl(basePath, slot, source) {
  var origin = "https://www.leadsopportunities.fr";
  var url = basePath.indexOf("http") === 0 ? new URL(basePath) : new URL(basePath, origin);
  url.searchParams.set("utm_source", source || "meta");
  url.searchParams.set("utm_medium", "paid_social");
  url.searchParams.set("utm_campaign", slot.utm_campaign || slot.id);
  url.searchParams.set("utm_content", "focus-semaine-" + (slot.week || slot.id));
  return url.pathname + url.search;
}

function getWeekIndex(config, at) {
  var epoch = parseDateOnly(config.epoch_start);
  var now = at || new Date();
  var days = daysBetween(epoch, now);
  if (days < 0) return 0;
  var weekNum = Math.floor(days / (config.week_length_days || 7));
  var len = (config.rotation || []).length || 1;
  return ((weekNum % len) + len) % len;
}

function getRotationWeekNumber(config, at) {
  var epoch = parseDateOnly(config.epoch_start);
  var now = at || new Date();
  var days = daysBetween(epoch, now);
  if (days < 0) return 1;
  return Math.floor(days / (config.week_length_days || 7)) + 1;
}

function getWeekBounds(config, weekIndex, at) {
  var epoch = parseDateOnly(config.epoch_start);
  var cycleWeek = getRotationWeekNumber(config, at) - 1;
  var absoluteWeekStart = new Date(epoch.getTime() + cycleWeek * (config.week_length_days || 7) * 86400000);
  var absoluteWeekEnd = new Date(absoluteWeekStart.getTime() + (config.week_length_days || 7) * 86400000 - 1);
  var slot = (config.rotation || [])[weekIndex] || null;
  return {
    weekIndex: weekIndex,
    calendarWeek: getRotationWeekNumber(config, at),
    slotWeek: slot && slot.week,
    startsAt: absoluteWeekStart.toISOString(),
    endsAt: absoluteWeekEnd.toISOString(),
  };
}

function enrichSlot(slot, config, metaForms, ranking) {
  var formInfo = findFormByTemplate(metaForms, slot.form_template);
  var tpl = formInfo.template || {};
  var site = slot.site_focus || {};
  var landing = site.landing || tpl.landing || config.fallback.site_focus.landing;
  var article = findBlogArticle(ranking, slot.blog_slug, slot.form_template);

  return Object.assign({}, slot, {
    form_id: formInfo.formId,
    form_name: tpl.name || slot.form_template,
    campaign_internal: tpl.campaign || slot.utm_campaign,
    landing_path: landing,
    landing_url: buildUtmUrl(landing, slot, "site"),
    meta_landing_url: buildUtmUrl(landing, slot, "meta"),
    blog: article
      ? {
          slug: article.slug,
          title: article.title,
          score: article.score,
          url: "/blog/" + article.slug + ".html",
        }
      : slot.blog_slug
        ? { slug: slot.blog_slug, url: "/blog/" + slot.blog_slug + ".html" }
        : null,
    site_focus: Object.assign({}, site, {
      landing: landing,
      landing_url: buildUtmUrl(landing, slot, "site"),
    }),
  });
}

async function queryWeeklyStats(sql, vertical, utmCampaign, sinceIso) {
  if (!sql) return { leads: 0, spend_estimate_eur: 0, cpl_eur: null };
  try {
    var rows = await sql`
      SELECT COUNT(*)::int AS leads
      FROM site_leads
      WHERE created_at >= ${sinceIso}
        AND (
          LOWER(COALESCE(vertical, '')) = ${String(vertical || "").toLowerCase()}
          OR LOWER(COALESCE(utm_campaign, '')) = ${String(utmCampaign || "").toLowerCase()}
          OR LOWER(COALESCE(utm_campaign, '')) LIKE ${"%" + String(utmCampaign || "").toLowerCase() + "%"}
        )
        AND (
          LOWER(COALESCE(utm_source, '')) IN ('meta', 'facebook', 'instagram', 'fb')
          OR fbclid IS NOT NULL
          OR LOWER(COALESCE(platform, '')) IN ('facebook', 'instagram', 'meta')
        )
    `;
    var leads = rows[0] && rows[0].leads ? Number(rows[0].leads) : 0;
    return { leads: leads, spend_estimate_eur: null, cpl_eur: null };
  } catch (e) {
    console.warn("[meta-rotation] DB stats:", e.message);
    return { leads: 0, spend_estimate_eur: null, cpl_eur: null, error: e.message };
  }
}

function evaluateSlotPerformance(stats, rules, budgetPerDay) {
  var spend = (rules.days_per_week || 7) * (budgetPerDay || 1);
  var cpl = stats.leads > 0 ? Math.round((spend / stats.leads) * 100) / 100 : null;
  var verdict = "pending";
  var message = "Semaine en cours — pas assez de données.";

  if (stats.leads >= (rules.min_leads_to_evaluate || 1)) {
    if (cpl != null && cpl <= rules.max_cpl_eur) {
      verdict = "good";
      message = "CPL " + cpl + " € — vertical rentable, peut rester en rotation.";
    } else if (cpl != null && cpl > rules.max_cpl_eur) {
      verdict = "cut";
      message = "CPL " + cpl + " € > plafond " + rules.max_cpl_eur + " € — passer au suivant.";
    }
  } else if (spend >= rules.max_cpl_eur * (rules.min_clicks_before_cut || 5) * 0.5) {
    verdict = "weak";
    message = "Peu ou pas de leads malgré ~" + spend + " € — envisager rotation anticipée.";
  }

  return { spend_estimate_eur: spend, cpl_eur: cpl, verdict: verdict, message: message };
}

function buildScheduleOverview(config, metaForms, ranking, at) {
  var idx = getWeekIndex(config, at);
  return (config.rotation || []).map(function (slot, i) {
    var enriched = enrichSlot(slot, config, metaForms, ranking);
    return {
      week: slot.week,
      id: slot.id,
      vertical: slot.vertical,
      discrete: !!slot.discrete,
      is_current: i === idx,
      form_id: enriched.form_id,
      headline: slot.ad_copy && slot.ad_copy.headline,
      site_label: enriched.site_focus && enriched.site_focus.label,
    };
  });
}

async function buildRotationState(options) {
  options = options || {};
  var at = options.at ? new Date(options.at) : new Date();
  var config = options.config || readJson(CONFIG_PATH);
  if (!config) throw new Error("config/meta-campaign-rotation.json manquant");

  var metaForms = readJson(FORMS_PATH);
  var ranking = readJson(RANKING_PATH);
  var rules = config.cpl_rules || {};
  var budget = (config.ads_policy && config.ads_policy.max_daily_budget_eur) || 1;
  var weekIndex = getWeekIndex(config, at);
  var bounds = getWeekBounds(config, weekIndex, at);
  var slot = enrichSlot(config.rotation[weekIndex], config, metaForms, ranking);
  var sql = options.sql || null;

  var prevIndex = (weekIndex - 1 + config.rotation.length) % config.rotation.length;
  var prevSlot = config.rotation[prevIndex];
  var prevBounds = getWeekBounds(config, prevIndex, new Date(at.getTime() - (config.week_length_days || 7) * 86400000));
  var prevStats = await queryWeeklyStats(sql, prevSlot.vertical, prevSlot.utm_campaign, prevBounds.startsAt);
  var prevEval = evaluateSlotPerformance(
    Object.assign({}, prevStats, { spend_estimate_eur: (config.week_length_days || 7) * budget }),
    rules,
    budget
  );

  var currentStats = await queryWeeklyStats(sql, slot.vertical, slot.utm_campaign, bounds.startsAt);
  var currentEval = evaluateSlotPerformance(
    Object.assign({}, currentStats, { spend_estimate_eur: Math.max(1, daysBetween(parseDateOnly(bounds.startsAt.slice(0, 10)), at) + 1) * budget }),
    rules,
    budget
  );

  var recommendation = {
    action: "activate",
    reason: slot.why || "Rotation planifiée semaine " + slot.week,
  };

  if (prevEval.verdict === "cut") {
    recommendation = {
      action: "rotate_early",
      reason: "Semaine précédente (" + prevSlot.id + ") : " + prevEval.message,
    };
  } else if (prevEval.verdict === "good") {
    recommendation = {
      action: "keep_vertical_if_manual",
      reason: "Semaine précédente performante — vous pouvez prolonger manuellement ou suivre le plan.",
    };
  }

  var cheapest = config.intelligence && config.intelligence.default_cheapest_vertical;

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    policy: config.ads_policy,
    calendar_week: bounds.calendarWeek,
    cycle_index: weekIndex,
    week_bounds: bounds,
    active_slot: slot,
    current_stats: Object.assign({}, currentStats, currentEval),
    previous_week: {
      slot: prevSlot,
      stats: Object.assign({}, prevStats, prevEval),
    },
    recommendation: recommendation,
    intelligence: {
      cheapest_historical_vertical: cheapest,
      retargeting_note: config.intelligence && config.intelligence.notes,
      fallback: config.fallback,
    },
    schedule: buildScheduleOverview(config, metaForms, ranking, at),
    rotation_length_weeks: (config.rotation || []).length,
  };
}

function toPublicFocus(state) {
  var slot = state.active_slot || {};
  var focus = slot.site_focus || {};
  return {
    ok: true,
    vertical: slot.vertical,
    discrete: !!slot.discrete,
    week: state.calendar_week,
    cycle_week: slot.week,
    label: focus.label || slot.vertical,
    short_label: focus.shortLabel || focus.label,
    hero_title: focus.heroTitle,
    hero_subtitle: focus.heroSubtitle,
    cta: focus.cta || "Devis gratuit",
    landing_path: focus.landing || slot.landing_path,
    landing_url: focus.landing_url || slot.landing_url,
    blog_url: slot.blog && slot.blog.url,
    blog_title: slot.blog && slot.blog.title,
    badge: "Focus semaine " + (slot.week || state.calendar_week),
    meta_headline: slot.ad_copy && slot.ad_copy.headline,
    utm_campaign: slot.utm_campaign,
    schedule: (state.schedule || []).map(function (s) {
      return {
        week: s.week,
        vertical: s.vertical,
        label: s.site_label,
        is_current: s.is_current,
      };
    }),
  };
}

function toCrmPayload(state) {
  return state;
}

async function buildAndPersist(options) {
  var state = await buildRotationState(options);
  writeJson(ACTIVE_PATH, state);
  return state;
}

module.exports = {
  CONFIG_PATH,
  ACTIVE_PATH,
  readJson,
  buildRotationState,
  buildAndPersist,
  toPublicFocus,
  toCrmPayload,
  getWeekIndex,
  enrichSlot,
};
