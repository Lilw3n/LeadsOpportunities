# Cursor — accès multi-dépôts (local + Cloud)

## Diagnostic (Cloud)

Un agent Cloud ne voit **que les repos de son environnement**, même si GitHub App a d’autres repos.

Exemple :
- Environnement LO : `https://cursor.com/dashboard/cloud-agents/environments/e/385a45b2-9f9e-11f1-a7d1-d6b4613131ce` → souvent **seulement** `LeadsOpportunities`
- Environnement DiddyImmo : `https://cursor.com/dashboard/cloud-agents/environments/e/42073fa4-b35c-11f1-bb68-864e54d14197` → `DiddyImmo`

Tant qu’un agent est lancé sur l’env LO seule, il **ne peut pas** push sur DiddyImmo.

## Correctif Cloud (recommandé)

### Option A — Un seul environnement multi-repos (idéal)

1. Ouvre l’environnement où tu veux travailler (idéalement un **nouveau** « Lilwen multi »).
2. À la création / édition, **sélectionne plusieurs repos** :
   - `Lilw3n/LeadsOpportunities`
   - `Lilw3n/DiddyImmo`
   - (+ ShopIA, NewIA, etc.)
3. Save → **Trigger New Build** → attends Success.
4. Lance un **nouvel agent** depuis cet environnement multi-repos.

Cursor clone alors chaque repo dans la VM. Doc : [Cloud agent setup — Multi-repo](https://cursor.com/docs/cloud-agent/setup).

### Option B — Agent démarré sur DiddyImmo

Sur la page env DiddyImmo → **Verify with Agent** / nouvel agent, avec le prompt de portage immo.

### GitHub App

https://github.com/settings/installations → **Cursor** → **All repositories** (ou Selected incluant tous tes projets) → **Save**.

## Correctif Local (le plus simple pour copier entre projets)

1. Clone tous les repos dans un dossier parent, ex. `~/dev/lilwen/` :
   - `LeadsOpportunities`
   - `DiddyImmo`
   - `ShopIA`
   - …
2. Dans Cursor : `Fichier → Ouvrir un dossier…` → ouvre `~/dev/lilwen/`  
   **ou** ouvre le fichier `workspaces/lilwen-all.code-workspace` (chemins relatifs à ajuster).
3. `Fichier → Enregistrer l'espace de travail sous…`
4. Dis à l’agent : « copie le pack immo de LeadsOpportunities vers DiddyImmo ».

Astuce forum : si l’écriture ne marche que sur le **premier** dossier du workspace, mets **DiddyImmo en premier** quand tu veux y écrire.

## Fichier repo

`.cursor/environment.json` déclare `repositoryDependencies` (URLs `github.com/Lilw3n/…`) pour élargir le scope du token Cloud et permettre un `git clone` des repos frères depuis un script d’install / agent.
