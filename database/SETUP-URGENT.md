-- SETUP URGENT — Leads Opportunities (Wendy)
-- Exécuter dans l'éditeur SQL Neon dans cet ordre, une seule fois.
-- Puis vérifier DATABASE_URL sur Vercel → Settings → Environment Variables → Redeploy.

-- 1) Table des formulaires remplis (indispensable)
\i site_leads.sql

-- Si \i ne fonctionne pas dans l'UI Neon, copiez-collez le contenu de :
--   database/site_leads.sql
--   database/crm-acquisition-bootstrap.sql
--   database/crm.sql

-- Ordre minimal recommandé :
--   1. database/users.sql (si comptes pas encore créés)
--   2. database/site_leads.sql
--   3. database/crm-acquisition-bootstrap.sql
--   4. database/crm.sql

-- Vérification rapide après migration :
--   SELECT COUNT(*) FROM site_leads;
--   SELECT COUNT(*) FROM crm_contacts;
