# Déploiement refonte CRM — commit, push, Vercel prod, vérif URLs
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "=== git status ===" -ForegroundColor Cyan
git status --short

Write-Host "`n=== Stage refonte CRM ===" -ForegroundColor Cyan
git add -u
if (Test-Path "api\_lib\crm-alerts-build.js") { git add "api\_lib\crm-alerts-build.js" }
git add api/_lib/routes/crm-alerts.js api/_lib/routes/crm-intelligent-alerts.js api/_lib/routes/crm-statistics.js 2>$null
git add crm-ui.css js/crm-alerts-panel.js crm.js crm-intelligent-alerts.html crm-intelligent-alerts.js 2>$null
git add crm-eligibility-rules.html crm-eligibility-test.html crm-periods.html crm-periods.js 2>$null
git add crm-contracts.html crm-contract-new.html crm-quote-new.html crm-quote-wizard.html 2>$null
git add crm-insurance-requests.html crm-pending-documents.html crm-bank-details.html crm-partner-zephir.html crm-leads-analysis.html 2>$null
git add crm-financial.html crm-financial-payments.html crm-financial-receivables.html crm-financial-debits.html crm-pro-accounting.html 2>$null
git add crm-settings.html crm-settings-sites.html crm-help.html crm-export.html crm-export.js 2>$null
git add crm-external-hub.html crm-external-profile.html crm-simulate.html 2>$null
git add crm-projects.html crm-projects-templates.html crm-modules-beta.html crm-interlocutors-modules.html 2>$null

$staged = @(git diff --cached --name-only)
if ($staged.Count -eq 0) {
  Write-Host "Rien à committer." -ForegroundColor Yellow
} else {
  Write-Host "Fichiers indexés:" $staged.Count
  git commit -m @"
Refonte CRM complète : alertes, assurance, finance, admin

- Design system alertes (CrmAlertsPanel, crm-ui.css)
- Fusion API alertes + fix stats byType
- Migration shell premium vagues 1-4
"@
}

Write-Host "`n=== git push ===" -ForegroundColor Cyan
git push origin HEAD

Write-Host "`n=== vercel --prod ===" -ForegroundColor Cyan
npx vercel --prod --yes

Write-Host "`n=== Vérif prod ===" -ForegroundColor Cyan
$urls = @(
  "https://www.leadsopportunities.fr/crm-intelligent-alerts.html",
  "https://www.leadsopportunities.fr/crm-export.html",
  "https://www.leadsopportunities.fr/crm-projects.html"
)
foreach ($u in $urls) {
  $r = Invoke-WebRequest -Uri $u -UseBasicParsing -Method Head
  Write-Host "$($r.StatusCode) $u"
}
$html = (Invoke-WebRequest -Uri $urls[0] -UseBasicParsing).Content
if ($html -match "inspire") { Write-Host "ERREUR: page alertes contient encore 'inspire'" -ForegroundColor Red }
elseif ($html -match "Alertes à traiter") { Write-Host "OK: hero refonte déployé" -ForegroundColor Green }
else { Write-Host "ATTENTION: contenu inattendu sur alertes" -ForegroundColor Yellow }
