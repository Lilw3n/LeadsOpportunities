/**
 * Manifeste des articles blog — source pour generate-blog-articles, index et RSS.
 * section: animaux | vtc | sante | auto | habitat | prevoyance | pro | patrimoine | finance | actu | chasse | equitation
 * themes (optionnel): sujets additionnels — ex. ["canicule","seniors"] ; voir scripts/blog-themes.cjs
 */
module.exports = {
  "sections": [
    {
      "id": "actu",
      "title": "Actu, culture & tendances",
      "intro": "Presidentielles 2027, incendies Gironde, restrictions d'eau, Trump, Formule 1, GTA 6… Chaque sujet du moment, relie a assurance et pret immobilier."
    },
    {
      "id": "sante",
      "title": "Sante & mutuelle",
      "cta": {
        "href": "../landings/questionnaire.html?need=sante&journey=standard",
        "label": "Questionnaire mutuelle"
      }
    },
    {
      "id": "habitat",
      "title": "Habitation & emprunteur",
      "cta": {
        "href": "../landings/questionnaire.html?need=habitation&journey=standard",
        "label": "Questionnaire habitation"
      }
    },
    {
      "id": "auto",
      "title": "Auto & mobilite",
      "cta": {
        "href": "../landings/questionnaire.html?need=auto&journey=standard",
        "label": "Questionnaire auto"
      }
    },
    {
      "id": "prevoyance",
      "title": "Prevoyance & protection",
      "cta": {
        "href": "../landings/questionnaire.html?need=prevoyance&journey=standard",
        "label": "Questionnaire prevoyance"
      }
    },
    {
      "id": "pro",
      "title": "Professionnel & RC Pro",
      "cta": {
        "href": "../landings/questionnaire.html?need=rc-pro&journey=standard",
        "label": "Questionnaire RC Pro"
      }
    },
    {
      "id": "patrimoine",
      "title": "Patrimoine & epargne",
      "cta": {
        "href": "../landings/questionnaire.html?need=assurance-vie&journey=standard",
        "label": "Questionnaire patrimoine"
      }
    },
    {
      "id": "finance",
      "title": "Credit & immobilier",
      "cta": {
        "href": "../landings/questionnaire.html?need=credit-immo&journey=standard",
        "label": "Questionnaire credit immo"
      }
    },
    {
      "id": "animaux",
      "title": "Assurance animaux (chien & chat)",
      "cta": {
        "href": "../landings/questionnaire.html?need=animaux&journey=standard",
        "label": "Questionnaire animaux"
      }
    },
    {
      "id": "chasse",
      "title": "Assurance chasse & RC chasseur",
      "cta": {
        "href": "../landings/chasse.html",
        "label": "Devis chasse"
      }
    },
    {
      "id": "equitation",
      "title": "Assurance equitation & RC equestre",
      "cta": {
        "href": "../landings/equitation.html",
        "label": "Devis equitation"
      }
    },
    {
      "id": "vtc",
      "title": "Assurance VTC & chauffeurs",
      "cta": {
        "href": "../landings/questionnaire.html?need=vtc&journey=standard",
        "label": "Questionnaire VTC"
      }
    }
  ],
  "articles": [
    {
      "file": "elections-presidentielles-prevoyance-patrimoine.html",
      "section": "actu",
      "tag": "Presidentielles",
      "tagClass": "tag-actu",
      "title": "Elections presidentielles : prevoyance, patrimoine et credit immo",
      "description": "Presidentielles 2027 : incertitude economique, impots, immobilier — comment proteger revenus, epargne et pret sans paniquer.",
      "meta": "8 min · Mai 2026",
      "cardExcerpt": "Presidentielles : ce que votre assurance doit couvrir des maintenant.",
      "cta": {
        "href": "../landings/devis.html?need=prevoyance",
        "label": "Etudier ma prevoyance"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Chaque cycle electoral relance les memes questions : <strong>impots</strong>, <strong>pouvoir d'achat</strong>, <strong>immobilier</strong>. Pour un foyer, l'enjeu n'est pas de predire le vainqueur, mais de <strong>securiser ce qui ne depend pas des urnes</strong> : revenus, pret, logement, epargne."
        },
        {
          "type": "h2",
          "text": "1. Prevoyance : le filet quand l'economie vacille"
        },
        {
          "type": "p",
          "text": "Arret de travail, licenciement, baisse d'activite pour les independants : la prevoyance individuelle ou TNS compense ce que la Securite sociale ne couvre pas. Avant une periode d'incertitude, verifiez vos <strong>franchises</strong>, <strong>delais de carence</strong> et <strong>plafonds ITT</strong>."
        },
        {
          "type": "h2",
          "text": "2. Patrimoine et assurance-vie"
        },
        {
          "type": "p",
          "text": "Les debats sur la fiscalite de l'assurance-vie reviennent regulierement. Un contrat deja ouvert avec des fonds diversifies limite l'exposition a un seul scenario politique. Demandez un <strong>bilan patrimonial</strong> plutot que de tout deplacer en urgence."
        },
        {
          "type": "h2",
          "text": "3. Credit immobilier et assurance emprunteur"
        },
        {
          "type": "p",
          "text": "Les taux suivent les marches, pas seulement les sondages. Si vous avez souscrit votre assurance emprunteur il y a plus de deux ans, la <strong>loi Lemoine</strong> permet souvent de reduire le cout sans changer de banque."
        }
      ],
      "related": [
        {
          "href": "../assurance-prevoyance/",
          "label": "Assurance prevoyance"
        },
        {
          "href": "../assurance-emprunteur/",
          "label": "Assurance emprunteur"
        },
        {
          "href": "./prevoyance-independants-guide.html",
          "label": "Prevoyance independants"
        }
      ]
    },
    {
      "file": "assurance-streamer-gaming-setup-materiel.html",
      "audience": "international",
      "section": "actu",
      "tag": "Gaming & streaming",
      "tagClass": "tag-actu",
      "title": "Streamer, gaming : assurer son setup, sa RC pro et ses revenus",
      "description": "PC, peripheriques, voix, sponsors : quelles assurances pour createurs de contenu et joueurs pro ?",
      "meta": "7 min · Mai 2026",
      "cardExcerpt": "Materiel, cyber, RC pro : le pack reflexe des streamers.",
      "cta": {
        "href": "../landings/devis.html?need=rc-pro",
        "label": "RC Pro createur"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Un setup a plusieurs milliers d'euros, des revenus Twitch ou YouTube, parfois une structure auto-entrepreneur : le profil <strong>streamer / createur</strong> cumule risques materiel, cyber et responsabilite civile."
        },
        {
          "type": "h2",
          "text": "Materiel : habitation ou multirisque pro ?"
        },
        {
          "type": "p",
          "text": "En chambre chez les parents, l'assurance habitation familiale peut couvrir une partie du materiel. En local pro ou pour un parc lourd, orientez-vous vers une <strong>MRPro</strong> ou une garantie materiel informatique."
        },
        {
          "type": "h2",
          "text": "RC Pro : sponsors, formations, evenements"
        },
        {
          "type": "p",
          "text": "Un sponsor mecontent, un eleve blesse pendant un coaching en ligne, une soiree LAN : la <strong>RC professionnelle</strong> protege votre patrimoine personnel si l'activite est declaree."
        },
        {
          "type": "h2",
          "text": "Prevoyance : revenus irreguliers"
        },
        {
          "type": "p",
          "text": "Les plateformes ne versent pas d'indemnites en cas d'arret. Une prevoyance TNS avec maintien de revenus securise les mois sans dons ni abonnements."
        }
      ],
      "related": [
        {
          "href": "../landings/devis.html?need=rc-pro",
          "label": "Devis RC Pro"
        },
        {
          "href": "./rc-pro-freelance-artisan-guide.html",
          "label": "RC Pro freelance"
        }
      ]
    },
    {
      "file": "people-divorce-assurance-habitation-emprunteur.html",
      "section": "actu",
      "tag": "Actu people",
      "tagClass": "tag-actu",
      "title": "Separation et divorce : habitation, emprunteur et prevoyance a revoir",
      "description": "Comme en couverture people, un divorce touche le logement, le credit et les beneficiaires — checklist assurance.",
      "meta": "7 min · Mai 2026",
      "cardExcerpt": "Separation : les contrats oublies qui coutent cher.",
      "cta": {
        "href": "../landings/devis.html?need=emprunteur",
        "label": "Revoir assurance emprunteur"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Les medias suivent les separations de celebrites ; pour un couple lambda, les enjeux sont les memes : <strong>qui reste dans le logement</strong>, <strong>qui paie le pret</strong>, <strong>qui est beneficiaire</strong> de la prevoyance."
        },
        {
          "type": "h2",
          "text": "Assurance habitation"
        },
        {
          "type": "p",
          "text": "Le contrat doit correspondre au nouveau foyer. Pensez a la <strong>responsabilite civile vie privee</strong> et aux biens deplaces."
        },
        {
          "type": "h2",
          "text": "Assurance emprunteur"
        },
        {
          "type": "p",
          "text": "Sur un pret commun, chaque emprunteur est assure. Apres separation, une delegation individuelle ou un changement d'assureur (loi Lemoine) peut reduire la charge."
        },
        {
          "type": "h2",
          "text": "Beneficiaires prevoyance et assurance-vie"
        },
        {
          "type": "p",
          "text": "Mettez a jour les clauses beneficiaires apres divorce. C'est l'etape la plus critique — et la plus reportee."
        }
      ],
      "related": [
        {
          "href": "./assurance-emprunteur-loi-lemoine-2026.html",
          "label": "Loi Lemoine emprunteur"
        },
        {
          "href": "./assurance-habitation-locataire-proprietaire-2026.html",
          "label": "Habitation locataire / proprietaire"
        }
      ]
    },
    {
      "file": "inflation-mutuelle-hausse-2026.html",
      "section": "actu",
      "tag": "Inflation",
      "tagClass": "tag-actu",
      "title": "Inflation 2026 : pourquoi votre mutuelle augmente et comment reagir",
      "description": "Hausse des cotisations, reste a charge : comparer sans perdre en garanties hospitalisation.",
      "meta": "6 min · Mai 2026",
      "cardExcerpt": "Mutuelle qui augmente ? Ce qu'il faut comparer.",
      "cta": {
        "href": "../landings/questionnaire.html?need=sante&journey=standard",
        "label": "Comparer via questionnaire"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Votre mutuelle augmente en 2026 ? Vous n'êtes pas seul : hausse des soins, vieillissement des portefeuilles, postes optique/dentaire sous pression. Avant de résilier par réflexe, posez-vous la bonne question : <strong>payez-vous plus pour les mêmes garanties</strong>, ou payez-vous plus parce que vous étiez déjà sous-couvert ?"
        },
        {
          "type": "h2",
          "text": "Décortiquer l'avis d'échéance"
        },
        {
          "type": "ul",
          "items": [
            "Part employeur vs part salarié (salarié)",
            "Évolution du forfait optique / dentaire / hospitalisation",
            "Nouvelles exclusions ou franchises introduites silencieusement",
            "Changement de tranche d'âge ou de zone tarifaire"
          ]
        },
        {
          "type": "h2",
          "text": "Renégocier vs changer : la règle simple"
        },
        {
          "type": "p",
          "text": "Si les garanties hospitalisation et dentaire restent faibles, <strong>négocier 5 % de réduction</strong> ne règle pas le fond du problème. Comparez 3 offres à postes équivalents : parfois une autre mutuelle coûte pareil avec de meilleurs remboursements là où vous consommez vraiment."
        },
        {
          "type": "bridge"
        },
        {
          "type": "p",
          "text": "Le questionnaire santé Leads Opportunities reprend votre profil (famille, TNS, postes sensibles) pour orienter vers des formules comparables — utile quand l'inflation masque un mauvais rapport garanties/prix."
        }
      ],
      "related": [
        {
          "href": "../assurance-sante/",
          "label": "Mutuelle sante"
        },
        {
          "href": "./mutuelle-sante-5-criteres.html",
          "label": "5 criteres mutuelle"
        },
        {
          "href": "./mutuelle-sante-hospitalisation-2026.html",
          "label": "Hospitalisation 2026"
        }
      ]
    },
    {
      "file": "canicule-degats-eaux-assurance-habitation.html",
      "section": "actu",
      "tag": "Canicule France",
      "tagClass": "tag-actu",
      "title": "Canicule en France 2026 : habitation, sante et assurance",
      "description": "Vagues de chaleur en France : degats des eaux, secheresse, coup de chaleur — habitation et mutuelle a verifier avant l'ete.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "Canicule en France : logement, cave, personnes fragiles.",
      "cta": {
        "href": "../landings/devis.html?need=habitation",
        "label": "Devis habitation"
      },
      "heroImage": {
        "src": "./images/habitat/canicule-maison.jpg",
        "alt": "Maison sous forte chaleur estivale — canicule en France",
        "caption": "Canicule 2026 : secheresse des sols et orages violents multiplient les sinistres habitation."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Chaque ete, la <strong>canicule en France</strong> fait la une : records de temperature, alertes rouges, caves inondees apres les orages. Pour votre foyer, deux dossiers a croiser : <strong>assurance habitation</strong> (batiment, degats des eaux) et <strong>mutuelle sante</strong> (soins, prevention)."
        },
        {
          "type": "gallery",
          "label": "Canicule : les trois risques a couvrir (logement, eau, sante)",
          "items": [
            {
              "src": "./images/habitat/canicule-maison.jpg",
              "alt": "Maison exposee a la chaleur estivale",
              "caption": "Chaleur extreme — batiment et fondations sous tension"
            },
            {
              "src": "./images/canicule/inondation-degats-eaux.jpg",
              "alt": "Degats des eaux apres orage post-canicule",
              "caption": "Orages violents — caves inondees et degats des eaux"
            },
            {
              "src": "./images/canicule/senior-hydratation.jpg",
              "alt": "Personne agee — vigilance coup de chaleur",
              "caption": "Personnes fragiles — mutuelle et urgences"
            }
          ]
        },
        {
          "type": "h2",
          "text": "Habitation : secheresse, fissures, inondation de cave"
        },
        {
          "type": "figure",
          "src": "./images/canicule/secheresse-fissures.jpg",
          "alt": "Sol sec et fissures liees a la secheresse des fondations",
          "caption": "Secheresse : fissures et mouvement de terrain — role de la catastrophe naturelle."
        },
        {
          "type": "p",
          "text": "Les etes extremes multiplient les sinistres : <strong>degats des eaux</strong> apres les pluies violentes, fissures liees a la secheresse des sols. Verifiez les exclusions « catastrophe naturelle » et le plafond cave. Voir aussi <a href=\"./canicule-secheresse-fissures-catastrophe-naturelle-assurance.html\">secheresse et fissures</a> ou <a href=\"./canicule-orage-inondation-cave-assurance-locataire.html\">inondation de cave locataire</a>."
        },
        {
          "type": "h2",
          "text": "Sante : chaleur et reste a charge"
        },
        {
          "type": "figure",
          "src": "./images/canicule/urgences-chaleur.jpg",
          "alt": "Consultation medicale — coup de chaleur et deshydratation",
          "caption": "Urgences chaleur : teleconsultation, hospitalisation et mutuelle."
        },
        {
          "type": "p",
          "text": "Consultations, urgences, personnes agees : une mutuelle avec de bons postes <strong>hospitalisation</strong> et soins courants limite le reste a charge en periode de forte chaleur. Guide detaille : <a href=\"./canicule-mutuelle-coup-chaleur-seniors-2026.html\">mutuelle et coup de chaleur seniors</a>."
        },
        {
          "type": "h2",
          "text": "Reflexes sinistre habitation"
        },
        {
          "type": "figure",
          "src": "./images/habitat/sinistre-degats.jpg",
          "alt": "Intervention apres sinistre dans un logement",
          "caption": "Declaration sous 5 jours ouvrables : photos et coupure d'eau."
        },
        {
          "type": "p",
          "text": "Photos, coupure d'eau, declaration sous 5 jours ouvrables : la rapidite facilite l'indemnisation."
        }
      ],
      "related": [
        {
          "href": "./canicule-mutuelle-coup-chaleur-seniors-2026.html",
          "label": "Mutuelle coup de chaleur seniors"
        },
        {
          "href": "./canicule-panneaux-solaires-pret-aides-financer.html",
          "label": "Panneaux solaires et pret"
        },
        {
          "href": "./canicule-secheresse-fissures-catastrophe-naturelle-assurance.html",
          "label": "Secheresse et Cat Nat"
        },
        {
          "href": "../assurance-habitation/",
          "label": "Assurance habitation"
        },
        {
          "href": "../landings/sante.html",
          "label": "Mutuelle sante"
        }
      ]
    },
    {
      "file": "canicule-mutuelle-coup-chaleur-seniors-2026.html",
      "section": "sante",
      "tag": "Canicule France",
      "tagClass": "tag-actu",
      "title": "Canicule 2026 : mutuelle, coup de chaleur et seniors — ce qui est rembourse",
      "description": "Vague de chaleur en France : deshydratation, urgences, hospitalisation — postes mutuelle a verifier pour les personnes agees et fragiles.",
      "meta": "7 min · Juin 2026",
      "cardExcerpt": "Chaleur extreme : mutuelle, urgences et prevention seniors.",
      "cta": {
        "href": "../landings/sante.html",
        "label": "Comparer ma mutuelle"
      },
      "heroImage": {
        "src": "./images/canicule/senior-hydratation.jpg",
        "alt": "Personne agee en periode de forte chaleur — prevention et mutuelle",
        "caption": "Seniors et canicule : hydratation, teleconsultation et hospitalisation a anticiper."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Chaque <strong>canicule en France</strong>, les services d'urgence enregistrent une hausse des <strong>coups de chaleur</strong>, deshydratations et malaises chez les <strong>personnes agees</strong>. Votre <strong>mutuelle sante</strong> intervient sur les consultations, la teleconsultation, l'hospitalisation et parfois la prevention — a condition de connaitre vos garanties."
        },
        {
          "type": "bridge"
        },
        {
          "type": "gallery",
          "label": "Sante et chaleur : trois postes mutuelle a controler",
          "items": [
            {
              "src": "./images/canicule/senior-hydratation.jpg",
              "alt": "Senior — prevention coup de chaleur et hydratation",
              "caption": "Prevention — personnes fragiles et proches aidants"
            },
            {
              "src": "./images/canicule/urgences-chaleur.jpg",
              "alt": "Consultation medicale urgences chaleur",
              "caption": "Urgences — medecin traitant et SAMU"
            },
            {
              "src": "./images/sante/hospitalisation-chambre.jpg",
              "alt": "Chambre d'hospitalisation — prise en charge mutuelle",
              "caption": "Hospitalisation — chambre particuliere et forfait journalier"
            }
          ]
        },
        {
          "type": "h2",
          "text": "1. Consultations et teleconsultation"
        },
        {
          "type": "p",
          "text": "En periode de canicule, beaucoup de generalistes proposent la <strong>teleconsultation</strong> pour eviter les deplacements. Verifiez le remboursement mutuelle (souvent 100 % du ticket moderateur + depassement selon contrat). Les visites a domicile restent remboursees par l'Assurance maladie ; la mutuelle complete le reste a charge."
        },
        {
          "type": "h2",
          "text": "2. Urgences et hospitalisation"
        },
        {
          "type": "figure",
          "src": "./images/sante/hospital-care.jpg",
          "alt": "Prise en charge hospitaliere — mutuelle et Securite sociale",
          "caption": "Passage aux urgences puis hospitalisation : postes mutuelle hospitalisation decisifs."
        },
        {
          "type": "p",
          "text": "Un <strong>coup de chaleur severe</strong> peut necessiter une perfusion et une surveillance en service d'urgences ou en medecine interne. Comparez vos plafonds <strong>hospitalisation</strong> (chambre particuliere, forfait journalier, honoraires depassement). Les contrats « entree de gamme » laissent parfois plusieurs centaines d'euros de reste a charge."
        },
        {
          "type": "h2",
          "text": "3. Prevention : ce que la mutuelle peut financer"
        },
        {
          "type": "p",
          "text": "Certaines mutuelles proposent des forfaits <strong>prevention</strong> (bilan sante, ostheopathie legere, materiel de mesure). En ete, l'essentiel reste gratuit : hydratation, pieces fraiches, appels reguliers aux proches. Pour les EHPAD et structures medicales, la couverture depend du contrat collectif ou individuel."
        },
        {
          "type": "h2",
          "text": "Reflexes canicule pour les seniors"
        },
        {
          "type": "p",
          "text": "Boire sans attendre la soif, eviter les sorties aux heures chaudes, garder les numeros d'urgence visibles. En cas de malaise : appeler le 15, rafraichir, ne pas laisser seul. Cote assurance, gardez votre attestation mutuelle accessible (appli ou papier) pour l'hopital."
        }
      ],
      "related": [
        {
          "href": "./canicule-degats-eaux-assurance-habitation.html",
          "label": "Canicule habitation & sante"
        },
        {
          "href": "./mutuelle-sante-hospitalisation-2026.html",
          "label": "Hospitalisation mutuelle 2026"
        },
        {
          "href": "./canicule-enfants-famille-mutuelle.html",
          "label": "Canicule et mutuelle famille"
        },
        {
          "href": "./canicule-maladies-chroniques-mutuelle.html",
          "label": "Maladies chroniques et canicule"
        },
        {
          "href": "../assurance-sante/",
          "label": "Mutuelle sante"
        },
        {
          "href": "../landings/sante.html",
          "label": "Comparatif mutuelle"
        }
      ]
    },
    {
      "file": "insolation-canicule-que-faire-mutuelle-devis.html",
      "section": "sante",
      "tag": "Canicule France",
      "tagClass": "tag-actu",
      "themes": [
        "canicule"
      ],
      "title": "Insolation et coup de chaleur : que faire tout de suite (et role de la mutuelle)",
      "description": "Signes d'insolation, gestes d'urgence, numero 15, hospitalisation — et comment une mutuelle limite le reste a charge. Devis sante gratuit.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "Insolation : gestes d'urgence, 15/SAMU et mutuelle.",
      "cta": {
        "href": "../landings/sante.html",
        "label": "Devis mutuelle sante"
      },
      "heroImage": {
        "src": "./images/canicule/urgences-chaleur.jpg",
        "alt": "Urgence medicale canicule — insolation et coup de chaleur",
        "caption": "Insolation : agir en quelques minutes peut eviter l'hospitalisation."
      },
      "blocks": [
        {
          "type": "p",
          "text": "L'<strong>insolation</strong> (ou <strong>coup de chaleur</strong> lie au soleil) survient quand le corps ne parvient plus a se refroidir : temperature interne qui monte, deshydratation, parfois perte de connaissance. En <strong>canicule</strong>, les enfants, les sportifs, les travailleurs dehors et les <strong>personnes agees</strong> sont les plus exposes. Voici <strong>que faire tout de suite</strong>, quand appeler le <strong>15</strong>, et pourquoi verifier sa <strong>mutuelle sante</strong> avant l'ete. <a href=\"../landings/sante.html\"><strong>Demander un devis mutuelle</strong></a> · <a href=\"../landings/sante.html\">comparatif sante</a> · <a href=\"../landings/questionnaire.html?need=sante&journey=standard\">questionnaire mutuelle</a>."
        },
        {
          "type": "gallery",
          "label": "Insolation : reconnaitre, agir, se faire rembourser",
          "items": [
            {
              "src": "./images/canicule/chaleur-soleil-maison.jpg",
              "alt": "Fortes chaleurs et soleil — risque d'insolation",
              "caption": "Exposition prolongee au soleil sans protection"
            },
            {
              "src": "./images/canicule/urgences-chaleur.jpg",
              "alt": "Consultation medicale urgence chaleur",
              "caption": "Urgence — ne pas attendre que ca passe"
            },
            {
              "src": "./images/canicule/hydratation-prevention.jpg",
              "alt": "Hydratation et prevention canicule",
              "caption": "Prevention — eau, ombre, vetements legers"
            }
          ]
        },
        {
          "type": "h2",
          "text": "1. Reconnaitre une insolation (signes d'alerte)"
        },
        {
          "type": "p",
          "text": "Symptomes frequents : <strong>mal de tete intense</strong>, nausees ou vomissements, peau rouge et chaude (parfois seche), pouls rapide, confusion, vertiges, crampes, fatigue brutale. Chez l'enfant : somnolence, irritabilite, peu ou pas de larmes. Chez la personne agee : agitation ou au contraire apathie. Toute <strong>perte de connaissance</strong> ou difficulte a parler = urgence vitale."
        },
        {
          "type": "h2",
          "text": "2. Que faire tout de suite (gestes qui sauvent)"
        },
        {
          "type": "figure",
          "src": "./images/canicule/hydratation-prevention.jpg",
          "alt": "Boire de l'eau fraiche — premier reflexe insolation",
          "caption": "Premier reflexe : ombre, air, eau fraiche (pas glacee)."
        },
        {
          "type": "p",
          "text": "<strong>Mettre a l'ombre</strong> ou dans un endroit frais, deshabiller si possible, <strong>ventiler</strong> (ventilateur, courant d'air). Proposer de <strong>petites gorgees d'eau</strong> si la personne est consciente et peut avaler. Appliquer de l'<strong>eau tiede</strong> sur la peau (front, nuque, aisselles) — evitez l'eau glacee qui peut choquer. Surveillez jusqu'a amelioration ou arrivee des secours. Ne jamais laisser seul."
        },
        {
          "type": "h2",
          "text": "3. Quand appeler le 15, le 18 ou le 112"
        },
        {
          "type": "p",
          "text": "Appelez le <strong>15 (SAMU)</strong> si : temperature elevee (> 39 °C), vomissements repetés, confusion, convulsions, malaise avec perte de connaissance, douleur thoracique, ou si la personne ne s'ameliore pas apres 30 minutes de refroidissement. Le <strong>112</strong> fonctionne partout en Europe. En cas d'arret respiratoire : <strong>112</strong> ou <strong>18</strong> (pompiers) + massage cardiaque si vous etes forme."
        },
        {
          "type": "h2",
          "text": "4. A l'hopital : perfusion, surveillance, mutuelle"
        },
        {
          "type": "figure",
          "src": "./images/sante/hospital-care.jpg",
          "alt": "Hospitalisation urgence — prise en charge mutuelle",
          "caption": "Passage aux urgences : Securite sociale + mutuelle selon votre contrat."
        },
        {
          "type": "p",
          "text": "Une insolation severe peut necessiter <strong>perfusion</strong>, analyses sanguines et <strong>hospitalisation</strong> de quelques heures a plusieurs jours. L'Assurance maladie rembourse une partie ; le <strong>reste a charge</strong> depend de votre <strong>mutuelle</strong> (hospitalisation, depassements d'honoraires, forfait journalier). Sans bonne couverture, la facture peut depasser <strong>500 a 1 500 €</strong>. Anticiper avec un <a href=\"../landings/sante.html\">devis mutuelle sante</a> ou un <a href=\"../landings/sante-express.html\">devis express</a> evite les mauvaises surprises."
        },
        {
          "type": "h2",
          "text": "5. Prevention : eviter l'insolation cet ete"
        },
        {
          "type": "p",
          "text": "Boire regulierement (meme sans soif), porter chapeau et vetements legers, eviter l'alcool et les efforts entre 11 h et 18 h, ne jamais rester en voiture au soleil. Enfants et seniors : vigilance renforcee. Travailleurs dehors : pauses a l'ombre, eau a portee de main. Consultez aussi <a href=\"./canicule-seniors-astuces-moins-chaud-mutuelle.html\">astuces canicule seniors</a> et <a href=\"./canicule-mutuelle-coup-chaleur-seniors-2026.html\">mutuelle coup de chaleur</a>."
        },
        {
          "type": "h2",
          "text": "6. Verifier sa mutuelle avant la canicule"
        },
        {
          "type": "p",
          "text": "Postes a comparer : <strong>urgences</strong>, <strong>hospitalisation</strong> (chambre particuliere, forfait journalier), <strong>teleconsultation</strong>, medecine de ville. Un contrat adapte limite le stress financier quand il faut agir vite. <a href=\"../landings/sante.html\"><strong>Obtenir un devis mutuelle gratuit</strong></a> · <a href=\"../landings/questionnaire.html?need=sante&journey=standard\">questionnaire en 2 min</a> · <a href=\"../assurance-sante/\">mutuelle sante France</a>."
        }
      ],
      "related": [
        {
          "href": "./canicule-mutuelle-coup-chaleur-seniors-2026.html",
          "label": "Mutuelle coup de chaleur seniors"
        },
        {
          "href": "./canicule-enfants-famille-mutuelle.html",
          "label": "Canicule enfants et famille"
        },
        {
          "href": "./canicule-teleconsultation-medecin-mutuelle.html",
          "label": "Téléconsultation canicule"
        },
        {
          "href": "./mutuelle-sante-hospitalisation-2026.html",
          "label": "Hospitalisation mutuelle"
        },
        {
          "href": "../landings/sante.html",
          "label": "Devis mutuelle"
        }
      ]
    },
    {
      "file": "canicule-secheresse-fissures-catastrophe-naturelle-assurance.html",
      "section": "habitat",
      "tag": "Canicule France",
      "tagClass": "tag-actu",
      "title": "Secheresse et fissures maison : assurance habitation et catastrophe naturelle",
      "description": "Canicule et secheresse des sols : fissures, fondations, declaration sinistre — role de l'etat Cat Nat et de la multirisque habitation.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "Fissures apres secheresse : Cat Nat, MRH et indemnisation.",
      "cta": {
        "href": "../landings/devis.html?need=habitation",
        "label": "Devis habitation"
      },
      "heroImage": {
        "src": "./images/canicule/secheresse-fissures.jpg",
        "alt": "Sol sec et fissures sur facade — secheresse des fondations",
        "caption": "Secheresse des sols : fissures structurelles souvent liees a un arrete catastrophe naturelle."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Apres plusieurs mois de <strong>canicule</strong>, les sols argileux se retractent : <strong>fissures</strong> en facade, portes qui coincent, fissures en diagonal. L'<strong>assurance habitation</strong> standard couvre rarement la secheresse seule — l'indemnisation passe souvent par un <strong>arrete catastrophe naturelle (Cat Nat)</strong> secheresse."
        },
        {
          "type": "gallery",
          "label": "Secheresse : du constat a l'indemnisation",
          "items": [
            {
              "src": "./images/canicule/secheresse-fissures.jpg",
              "alt": "Fissures et sol desseche autour d'une maison",
              "caption": "Constat — photographier avant/apres chaque ete"
            },
            {
              "src": "./images/canicule/prevention-toiture.jpg",
              "alt": "Maison a entretenir — prevention avant l'ete",
              "caption": "Prevention — vegetation, gouttieres, joints"
            },
            {
              "src": "./images/habitat/sinistre-degats.jpg",
              "alt": "Expertise apres sinistre habitation",
              "caption": "Expertise — assureur et eventuel Cat Nat"
            }
          ]
        },
        {
          "type": "h2",
          "text": "Multirisque habitation vs catastrophe naturelle"
        },
        {
          "type": "p",
          "text": "La <strong>multirisque habitation (MRH)</strong> couvre incendie, degats des eaux, tempete, parfois seisme. Les <strong>desordres de secheresse</strong> sont en general exclus sauf si un arrete Cat Nat est publie pour votre commune. Consultez le site gouvernemental des catastrophes naturelles pour verifier les arretes en cours."
        },
        {
          "type": "h2",
          "text": "Comment declarer un sinistre secheresse"
        },
        {
          "type": "figure",
          "src": "./images/habitat/maison-famille.jpg",
          "alt": "Maison individuelle — proprietaire et assurance habitation",
          "caption": "Proprietaire ou locataire : delai de declaration 10 jours apres parution de l'arrete Cat Nat."
        },
        {
          "type": "p",
          "text": "Des l'apparition des fissures, <strong>photographiez</strong> et prevenez votre assureur. Si un arrete Cat Nat secheresse est publie, vous disposez en general de <strong>10 jours</strong> pour declarer le sinistre (delai allonge par rapport au sinistre classique). Un expert evaluera le lien de causalite entre secheresse et desordres."
        },
        {
          "type": "h2",
          "text": "Locataire ou proprietaire : qui declare ?"
        },
        {
          "type": "p",
          "text": "Le <strong>proprietaire</strong> declare les desordres structurels (murs porteurs, fondations). Le <strong>locataire</strong> declare les degats sur ses biens mobilier via son assurance locataire. En copropriete, le syndic centralise souvent la declaration pour les parties communes."
        },
        {
          "type": "h2",
          "text": "Prevention avant la prochaine canicule"
        },
        {
          "type": "p",
          "text": "Arrosage regulier des fondations (sans gaspillage), arbres a distance des murs, joints de facade entretenus. Mettez a jour la valeur du batiment dans votre contrat pour eviter une <strong>sous-assurance</strong> si des travaux de reparation sont necessaires."
        }
      ],
      "related": [
        {
          "href": "./canicule-degats-eaux-assurance-habitation.html",
          "label": "Guide canicule habitation"
        },
        {
          "href": "./assurance-habitation-locataire-proprietaire-2026.html",
          "label": "Locataire / proprietaire"
        },
        {
          "href": "../assurance-habitation/",
          "label": "Assurance habitation"
        }
      ]
    },
    {
      "file": "canicule-orage-inondation-cave-assurance-locataire.html",
      "section": "habitat",
      "tag": "Canicule France",
      "tagClass": "tag-actu",
      "title": "Orage apres canicule : inondation de cave et assurance locataire",
      "description": "Pluies violentes apres vague de chaleur — cave inondee, degats des eaux : garanties MRH locataire, proprietaire et declaration sinistre.",
      "meta": "7 min · Juin 2026",
      "cardExcerpt": "Cave inondee apres orage : locataire, bailleur, MRH.",
      "cta": {
        "href": "../landings/devis.html?need=habitation",
        "label": "Assurance locataire"
      },
      "heroImage": {
        "src": "./images/canicule/inondation-degats-eaux.jpg",
        "alt": "Degats des eaux apres orage violent — cave ou sous-sol inonde",
        "caption": "Orage post-canicule : eaux pluviales et refoulement d'egout — reactiver vite l'assurance."
      },
      "blocks": [
        {
          "type": "p",
          "text": "La <strong>canicule</strong> precede souvent des <strong>orages violents</strong> : sols durcis, eaux pluviales qui s'accumulent, <strong>caves inondees</strong>, lave-linge et chaudiere endommages. En <strong>location</strong>, locataire et proprietaire ont chacun un contrat — savoir qui declare quoi evite les delais."
        },
        {
          "type": "gallery",
          "label": "Inondation de cave : les etapes assurance",
          "items": [
            {
              "src": "./images/canicule/inondation-degats-eaux.jpg",
              "alt": "Piece humide apres inondation — degats des eaux",
              "caption": "Constat — couper l'eau et electricite si danger"
            },
            {
              "src": "./images/habitat/appartement-locataire.jpg",
              "alt": "Appartement locataire — multirisque habitation obligatoire",
              "caption": "Locataire — MRH obligatoire et RC vie privee"
            },
            {
              "src": "./images/habitat/sinistre-degats.jpg",
              "alt": "Intervention apres degat des eaux",
              "caption": "Secours — pompage, deshumidification, expertise"
            }
          ]
        },
        {
          "type": "h2",
          "text": "Locataire : degats des eaux et mobilier"
        },
        {
          "type": "p",
          "text": "L'<strong>assurance locataire</strong> (MRH) couvre vos biens mobilier, le contenu de cave (cartons, velo, electromenager) et votre <strong>responsabilite civile</strong> si vous avez laisse une fenetre ouverte causant un degat au voisin. Verifiez le plafond « cave » ou « dependances » — souvent limite a quelques milliers d'euros."
        },
        {
          "type": "h2",
          "text": "Proprietaire bailleur : batiment et PNO"
        },
        {
          "type": "figure",
          "src": "./images/habitat/bailleur-cles.jpg",
          "alt": "Clefs et logement en location — proprietaire bailleur",
          "caption": "Bailleur : assurance PNO pour le batiment, locataire pour le contenu."
        },
        {
          "type": "p",
          "text": "Le <strong>proprietaire</strong> assure murs, toiture, canalisations communes via sa MRH ou sa <strong>PNO</strong>. Si l'inondation vient d'une fuite de canalisation collective, le syndic ou le bailleur ouvre le sinistre batiment. Le locataire ouvre un sinistre contenu en parallele."
        },
        {
          "type": "h2",
          "text": "Delai et reflexes (5 jours ouvrables)"
        },
        {
          "type": "p",
          "text": "Declaration sous <strong>5 jours ouvrables</strong> en general (10 jours si Cat Nat). Photos horodatees, liste des biens endommages, factures si possible. Ne jetez rien avant passage de l'expert sauf si moisissure ou securite."
        },
        {
          "type": "h2",
          "text": "Prevention avant l'ete"
        },
        {
          "type": "figure",
          "src": "./images/canicule/prevention-toiture.jpg",
          "alt": "Entretien maison avant l'ete — gouttieres et evacuations",
          "caption": "Nettoyer gouttieres et regardes — limiter les refoulements."
        },
        {
          "type": "p",
          "text": "Sur elever les cartons en cave, installer des barres anti-refoulement, verifier l'etancheite des fenetres de sous-sol. Ces gestes reduisent le risque et facilitent l'indemnisation (pas de negligence)."
        }
      ],
      "related": [
        {
          "href": "./canicule-degats-eaux-assurance-habitation.html",
          "label": "Canicule habitation"
        },
        {
          "href": "./assurance-habitation-locataire-proprietaire-2026.html",
          "label": "Locataire vs proprietaire"
        },
        {
          "href": "./pno-bailleur-proprietaire-non-occupant.html",
          "label": "Assurance PNO bailleur"
        }
      ]
    },
    {
      "file": "canicule-seniors-astuces-moins-chaud-mutuelle.html",
      "section": "sante",
      "tag": "Canicule seniors",
      "tagClass": "tag-actu",
      "title": "Canicule et seniors : 12 astuces pour avoir moins chaud chez soi",
      "description": "Personnes agees et forte chaleur : hydratation, ventilation, pieces fraiches — et mutuelle a jour pour teleconsultation et urgences.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "Seniors : rester au frais sans sortir — reflexes + mutuelle.",
      "cta": {
        "href": "../landings/sante.html",
        "label": "Demander un devis mutuelle"
      },
      "heroImage": {
        "src": "./images/canicule/logement-frais-senior.jpg",
        "alt": "Logement ventile — senior protege de la chaleur estivale",
        "caption": "Rester au frais chez soi : astuces gratuites avant de penser climatisation."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Pour un <strong>senior</strong>, la <strong>canicule</strong> est le moment de privilegier le logement plutot que les deplacements. Ces <strong>astuces pour avoir moins chaud</strong> limitent le risque de <strong>coup de chaleur</strong>. Et si un malaise survient malgre tout, une <strong>mutuelle sante</strong> bien calibree (teleconsultation, hospitalisation) evite une facture lourde — <a href=\"../landings/sante.html\">demandez un devis mutuelle</a> pour comparer."
        },
        {
          "type": "gallery",
          "label": "Seniors et chaleur : prevention au quotidien",
          "items": [
            {
              "src": "./images/canicule/logement-frais-senior.jpg",
              "alt": "Piece fraiche et ventilee pour senior",
              "caption": "Piece la plus fraiche — y passer la journee"
            },
            {
              "src": "./images/canicule/hydratation-prevention.jpg",
              "alt": "Hydratation reguliere en periode de canicule",
              "caption": "Boire avant la soif — eau, tisanes fraiches"
            },
            {
              "src": "./images/canicule/senior-hydratation.jpg",
              "alt": "Personne agee vigilante en periode de chaleur",
              "caption": "Proches aidants — appels reguliers"
            }
          ]
        },
        {
          "type": "h2",
          "text": "1. Aerer sans surchauffer"
        },
        {
          "type": "p",
          "text": "Ouvrir fenêtres et volets <strong>tôt le matin</strong> et <strong>tard le soir</strong> ; les fermer et occulter en journée. Un brumisateur ou des serviettes humides devant un ventilateur suffisent souvent — moins couteux qu'une clim (et moins de risque de <strong>degats des eaux</strong> cote assurance habitation si mal installee — voir <a href=\"../landings/devis.html?need=habitation\">devis habitation</a>)."
        },
        {
          "type": "h2",
          "text": "2. S'habiller et s'hydrater"
        },
        {
          "type": "figure",
          "src": "./images/canicule/hydratation-prevention.jpg",
          "alt": "Hydratation — reflexe essentiel des seniors en canicule",
          "caption": "Eviter alcool et cafeine en exces ; privilegier l'eau."
        },
        {
          "type": "p",
          "text": "Vetements legeres, couleurs claires, chapeau si sortie breve. Garder une bouteille d'eau a portee de main. En cas de nausees ou confusion : teleconsultation (remboursee selon mutuelle) ou appel au 15."
        },
        {
          "type": "h2",
          "text": "3. Identifier la piece la plus fraiche"
        },
        {
          "type": "p",
          "text": "Souvent le rez-de-chaussée au nord. Y deplacer matelas ou fauteuil si la chambre sous les toits devient invivable. Les <strong>EHPAD</strong> appliquent des protocoles ; a domicile, c'est a la famille de reorganiser le logement."
        },
        {
          "type": "h2",
          "text": "4. Mutuelle : teleconsultation et soins sans se deplacer"
        },
        {
          "type": "figure",
          "src": "./images/sante/medecin-consultation.jpg",
          "alt": "Teleconsultation medicale — mutuelle senior canicule",
          "caption": "Eviter la chaleur dehors : la teleconsultation limite les deplacements."
        },
        {
          "type": "p",
          "text": "Beaucoup de mutuelles remboursent la <strong>teleconsultation</strong> comme une visite classique. Verifiez aussi les postes <strong>soins infirmiers a domicile</strong> si des perfusions sont necessaires. <a href=\"../landings/sante.html\"><strong>Demander un devis mutuelle senior</strong></a> pour comparer hospitalisation et depassements."
        },
        {
          "type": "h2",
          "text": "5. Quand appeler les secours"
        },
        {
          "type": "p",
          "text": "Temperature corporelle elevee, peau seche, confusion, malaise : <strong>15</strong> ou <strong>112</strong>. Votre mutuelle interviendra ensuite sur le reste a charge hospitalier — d'ou l'interet d'un contrat avec bon niveau <strong>hospitalisation</strong>."
        }
      ],
      "related": [
        {
          "href": "./canicule-mutuelle-coup-chaleur-seniors-2026.html",
          "label": "Mutuelle coup de chaleur"
        },
        {
          "href": "./canicule-plan-gouvernement-seniors-mutuelle.html",
          "label": "Plan canicule gouvernement"
        },
        {
          "href": "../landings/sante.html",
          "label": "Devis mutuelle"
        }
      ]
    },
    {
      "file": "canicule-futur-climatique-seniors-assurance-mutuelle.html",
      "section": "actu",
      "tag": "Canicule seniors",
      "tagClass": "tag-actu",
      "title": "Futur climatique et seniors : pourquoi revoir mutuelle et habitation des maintenant",
      "description": "Canicules plus longues et plus frequentes en France : impact sur personnes agees, assurance habitation et niveau de mutuelle a anticiper.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "Climat futur : seniors, mutuelle et logement a repenser.",
      "cta": {
        "href": "../landings/sante.html",
        "label": "Devis mutuelle adaptee canicule"
      },
      "heroImage": {
        "src": "./images/canicule/climat-chaleur-extreme.jpg",
        "alt": "Chaleur extreme estivale — futur climatique et canicules en France",
        "caption": "D'ici 2050, les canicules pourraient se multiplier — les seniors sont la premiere population exposee."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Les modeles climatiques convergent : <strong>vagues de chaleur plus longues, plus precoces et plus intenses</strong> en France metropolitaine. Pour les <strong>seniors</strong>, ce n'est pas qu'une question de confort — c'est un enjeu de <strong>sante</strong> (coups de chaleur, deshydratation) et de <strong>patrimoine</strong> (habitation, fissures, orages). Anticiper, c'est aussi <strong>comparer mutuelle et habitation</strong> avant la prochaine alerte rouge."
        },
        {
          "type": "gallery",
          "label": "Climat futur : trois impacts concrets pour les seniors",
          "items": [
            {
              "src": "./images/canicule/climat-chaleur-extreme.jpg",
              "alt": "Ciel estival et chaleur extreme",
              "caption": "Canicules plus frequentes — etes plus longs"
            },
            {
              "src": "./images/canicule/secheresse-fissures.jpg",
              "alt": "Secheresse et fissures maison",
              "caption": "Logement — secheresse et sinistres habitation"
            },
            {
              "src": "./images/canicule/seniors-couple-ete.jpg",
              "alt": "Couple de seniors — sante et chaleur",
              "caption": "Sante — hospitalisations en hausse chez les +65 ans"
            }
          ]
        },
        {
          "type": "h2",
          "text": "Mutuelle : un filet qui va prendre plus de valeur"
        },
        {
          "type": "p",
          "text": "Plus de jours au-dessus de 35 °C signifie plus de consultations, d'urgences et parfois d'hospitalisations chez les <strong>personnes agees</strong>. Une mutuelle avec de bons postes <strong>hospitalisation</strong>, teleconsultation et soins infirmiers limite le reste a charge quand le systeme public est sature. <a href=\"../landings/sante.html\"><strong>Demander un devis mutuelle</strong></a> permet de comparer sans attendre la prochaine canicule."
        },
        {
          "type": "h2",
          "text": "Habitation : secheresse, orages, climatisation"
        },
        {
          "type": "figure",
          "src": "./images/canicule/secheresse-fissures.jpg",
          "alt": "Fissures maison apres secheresse — assurance habitation",
          "caption": "Secheresse et orages post-canicule : verifier MRH et Cat Nat."
        },
        {
          "type": "p",
          "text": "Le <strong>futur climatique</strong> accentue les desordres de secheresse et les <strong>degats des eaux</strong> apres orages. Installer une clim ou renforcer l'isolation modifie aussi le profil de risque habitation. Un <a href=\"../landings/devis.html?need=habitation\">devis assurance habitation</a> verifie plafonds et exclusions avant les travaux."
        },
        {
          "type": "h2",
          "text": "Prevoyance : rester chez soi plus longtemps"
        },
        {
          "type": "figure",
          "src": "./images/sante/seniors-couple.jpg",
          "alt": "Seniors a domicile — autonomie et chaleur",
          "caption": "Vieillir chez soi en climat plus chaud : mutuelle + amenagements."
        },
        {
          "type": "p",
          "text": "Beaucoup de seniors souhaitent rester a domicile. Cela implique un logement adapte (stores, ventilation) et une <strong>mutuelle reactive</strong> en cas de malaise. La prevoyance dependance peut aussi entrer en jeu si la chaleur aggrave une fragilite existante."
        },
        {
          "type": "h2",
          "text": "Agir maintenant plutot qu'en alerte rouge"
        },
        {
          "type": "p",
          "text": "Les assureurs n'augmentent pas les garanties pendant un episode de canicule. Comparez <strong>mutuelle</strong> et <strong>habitation</strong> en periode calme : delais de carence, plafonds, teleconsultation. Un courtier vous oriente vers un contrat aligne avec un climat plus chaud."
        }
      ],
      "related": [
        {
          "href": "./canicule-seniors-astuces-moins-chaud-mutuelle.html",
          "label": "Astuces moins chaud seniors"
        },
        {
          "href": "./canicule-lacunes-pouvoirs-publics-mutuelle-seniors.html",
          "label": "Lacunes pouvoirs publics"
        },
        {
          "href": "../landings/sante.html",
          "label": "Devis mutuelle"
        }
      ]
    },
    {
      "file": "canicule-plan-gouvernement-seniors-mutuelle.html",
      "section": "actu",
      "tag": "Canicule seniors",
      "tagClass": "tag-actu",
      "title": "Plan canicule du gouvernement : ce qui existe pour les seniors (et le role de la mutuelle)",
      "description": "Dispositifs publics canicule en France : Plan National, centres d'accueil, appels a la vigilance — complement mutuelle pour les soins.",
      "meta": "7 min · Juin 2026",
      "cardExcerpt": "Plan canicule Etat : dispositifs + mutuelle complementaire.",
      "cta": {
        "href": "../landings/sante.html",
        "label": "Devis mutuelle senior"
      },
      "heroImage": {
        "src": "./images/canicule/politique-canicule-france.jpg",
        "alt": "Politique publique et canicule en France — dispositifs seniors",
        "caption": "Plan National Canicule : prevention publique, soins assures en partie par la mutuelle."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Chaque ete, l'Etat active le <strong>Plan National Canicule</strong> : niveaux d'alerte, consignes prefectorales, parfois ouverture de <strong>centres d'accueil fraicheur</strong>. Pour les <strong>seniors</strong>, ces dispositifs publics sont essentiels — mais ils ne remplacent ni le suivi medical ni le <strong>reste a charge</strong> en cas d'hospitalisation. D'ou le role d'une <strong>mutuelle sante</strong> bien choisie."
        },
        {
          "type": "gallery",
          "label": "Dispositifs publics canicule : ce que les seniors peuvent utiliser",
          "items": [
            {
              "src": "./images/canicule/politique-canicule-france.jpg",
              "alt": "Institutions et politique publique canicule France",
              "caption": "Plan National Canicule — alertes meteo et prefectures"
            },
            {
              "src": "./images/canicule/seniors-couple-ete.jpg",
              "alt": "Seniors beneficiaires des dispositifs canicule",
              "caption": "Centres fraicheur — accueil gratuity souvent"
            },
            {
              "src": "./images/canicule/urgences-chaleur.jpg",
              "alt": "Soins medicaux urgences chaleur",
              "caption": "Urgences — Securite sociale + mutuelle"
            }
          ]
        },
        {
          "type": "h2",
          "text": "1. Alertes meteo et consignes officielles"
        },
        {
          "type": "p",
          "text": "Meteo-France publie des vigilances <strong>orange</strong> et <strong>rouge</strong>. Les prefectures peuvent activer des cellules de crise et communiquer sur les lieux de rafraichissement. Inscrivez-vous aux alertes SMS de votre commune si disponible — surtout pour un senior isole."
        },
        {
          "type": "h2",
          "text": "2. Centres d'accueil et solidarite locale"
        },
        {
          "type": "figure",
          "src": "./images/canicule/logement-frais-senior.jpg",
          "alt": "Espace frais — centre accueil ou domicile senior",
          "caption": "Centres fraicheur ou mairie : verifier horaires en alerte rouge."
        },
        {
          "type": "p",
          "text": "Mairies, gymnases, bibliotheques climatisees : les <strong>centres d'accueil canicule</strong> varient selon les territoires. Utiles pour sortir de fournaise, ils ne couvrent pas les medicaments ni l'hospitalisation — domaine <strong>Assurance maladie + mutuelle</strong>."
        },
        {
          "type": "h2",
          "text": "3. EHPAD et medecine de ville"
        },
        {
          "type": "p",
          "text": "Les etablissements medico-sociaux suivent des protocoles renforces (hydratation, surveillance). En ville, les <strong>visites a domicile</strong> et la teleconsultation se developpent. Verifiez que votre mutuelle rembourse ces actes sans plafond trop bas."
        },
        {
          "type": "h2",
          "text": "4. Ou la mutuelle complete le public"
        },
        {
          "type": "figure",
          "src": "./images/sante/mutuelle-documents.jpg",
          "alt": "Contrat mutuelle — complement des dispositifs publics canicule",
          "caption": "Hospitalisation, depassements, teleconsultation : le private compte."
        },
        {
          "type": "p",
          "text": "Le gouvernement sensibilise et ouvre des lieux ; la <strong>mutuelle</strong> prend le relais sur le financier medical : forfait journalier, chambre particuliere, optique pour lunettes solaires medicalisees si besoin. <a href=\"../landings/sante.html\"><strong>Demandez un devis mutuelle senior</strong></a> pour un niveau hospitalisation confortable."
        }
      ],
      "related": [
        {
          "href": "./canicule-lacunes-pouvoirs-publics-mutuelle-seniors.html",
          "label": "Limites des dispositifs publics"
        },
        {
          "href": "./canicule-seniors-astuces-moins-chaud-mutuelle.html",
          "label": "Astuces moins chaud"
        },
        {
          "href": "../landings/sante.html",
          "label": "Devis mutuelle"
        }
      ]
    },
    {
      "file": "canicule-lacunes-pouvoirs-publics-mutuelle-seniors.html",
      "section": "sante",
      "tag": "Canicule seniors",
      "tagClass": "tag-actu",
      "title": "Canicule : les lacunes du gouvernement et pourquoi la mutuelle senior compte",
      "description": "Delais Cat Nat, deserts medicaux, logements mal isoles : limites des pouvoirs publics face a la chaleur — anticiper avec mutuelle et habitation.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "Public insuffisant ? Mutuelle et habitation pour les seniors.",
      "cta": {
        "href": "../landings/sante.html",
        "label": "Devis mutuelle — comparer maintenant"
      },
      "heroImage": {
        "src": "./images/canicule/urgences-chaleur.jpg",
        "alt": "Urgences medicales canicule — lacunes systeme public et mutuelle",
        "caption": "Quand le public atteint ses limites, une bonne mutuelle limite le reste a charge."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Les plans canicule existent, mais les <strong>indispositions</strong> ou <strong>retards</strong> des pouvoirs publics restent visibles : logements surchauffes, <strong>deserts medicaux</strong>, files aux urgences, arretes <strong>catastrophe naturelle</strong> tardifs. Pour un <strong>senior</strong>, compter uniquement sur l'Etat expose a des soins non optimaux et des factures elevees. Une <strong>mutuelle</strong> et une <strong>habitation</strong> bien calibrees comblent une partie du vide."
        },
        {
          "type": "gallery",
          "label": "Lacunes publiques vs leviers prives (mutuelle, habitation)",
          "items": [
            {
              "src": "./images/canicule/urgences-chaleur.jpg",
              "alt": "Urgences saturees en canicule",
              "caption": "Urgences saturees — mutuelle hospitalisation"
            },
            {
              "src": "./images/canicule/secheresse-fissures.jpg",
              "alt": "Fissures maison — lenteur arretes Cat Nat",
              "caption": "Cat Nat secheresse — delais d'indemnisation"
            },
            {
              "src": "./images/sante/mutuelle-documents.jpg",
              "alt": "Mutuelle senior — comparer les garanties",
              "caption": "Mutuelle — agir avant la prochaine canicule"
            }
          ]
        },
        {
          "type": "h2",
          "text": "1. Logements mal prepares"
        },
        {
          "type": "p",
          "text": "Parc prive ancien, passoires thermiques, peu de centres fraicheur en zone rurale : l'offre publique ne rafraichit pas votre salon. Travaux d'isolation ou climatisation : pensez <a href=\"../landings/devis.html?need=habitation\">devis habitation</a> pour couvrir le materiel et les sinistres lies aux installations."
        },
        {
          "type": "h2",
          "text": "2. Soins : lenteur et reste a charge"
        },
        {
          "type": "figure",
          "src": "./images/sante/hospital-care.jpg",
          "alt": "Hospitalisation senior — reste a charge mutuelle",
          "caption": "Files d'attente + reste a charge : double peine sans mutuelle solide."
        },
        {
          "type": "p",
          "text": "En canicule, les SAMU et urgences sont debordees. La teleconsultation aide, mais un <strong>coup de chaleur grave</strong> finit en hospitalisation. Les bas de gamme mutuelle laissent un reste a charge significatif (forfait journalier, depassements). <a href=\"../landings/sante.html\"><strong>Demander un devis mutuelle senior</strong></a> avant l'ete."
        },
        {
          "type": "h2",
          "text": "3. Cat Nat et sinistres : lenteur administrative"
        },
        {
          "type": "figure",
          "src": "./images/canicule/inondation-degats-eaux.jpg",
          "alt": "Degats des eaux — lenteur reconnaissance catastrophe naturelle",
          "caption": "Orages post-canicule : indemnisation parfois longue sans arrete."
        },
        {
          "type": "p",
          "text": "Secheresse et inondations post-orages dependent d'<strong>arretes interministeriels</strong> parfois publies des mois plus tard. En attendant, votre <strong>assurance habitation</strong> joue seule — d'ou l'interet de garanties degats des eaux bien plafonnees."
        },
        {
          "type": "h2",
          "text": "4. Ce que vous pouvez faire sans attendre l'Etat"
        },
        {
          "type": "p",
          "text": "Comparez mutuelle (hospitalisation, teleconsultation), habitation (cave, clim), prevoyance si fragilite. Un courtier ORIAS vous aide a <strong>faire les choses bien</strong> cote contrats pendant que les debats publics avancent lentement. <a href=\"../landings/sante.html\">Devis mutuelle</a> · <a href=\"../landings/devis.html?need=habitation\">Devis habitation</a>."
        }
      ],
      "related": [
        {
          "href": "./canicule-plan-gouvernement-seniors-mutuelle.html",
          "label": "Dispositifs gouvernement"
        },
        {
          "href": "./canicule-futur-climatique-seniors-assurance-mutuelle.html",
          "label": "Futur climatique"
        },
        {
          "href": "../landings/sante.html",
          "label": "Devis mutuelle"
        }
      ]
    },
    {
      "file": "canicule-panneaux-solaires-pret-aides-financer.html",
      "section": "finance",
      "tag": "Canicule France",
      "tagClass": "tag-actu",
      "title": "Canicule et panneaux solaires : aides de l'Etat, collectivites et pret pour financer",
      "description": "Vague de chaleur en France : photovoltaique, autoconsommation, prime, eco-PTZ et credit conso — comment financer ses panneaux solaires avec les aides publiques.",
      "meta": "9 min · Juin 2026",
      "cardExcerpt": "Canicule : panneaux solaires, aides publiques et pret pour financer.",
      "cta": {
        "href": "../landings/credit-immo.html",
        "label": "Etudier un financement travaux"
      },
      "heroImage": {
        "src": "./images/canicule/panneaux-solaires-toiture.jpg",
        "alt": "Panneaux solaires sur toiture — canicule et production d'electricite",
        "caption": "Canicule : l'autoconsommation solaire limite la facture et soutient la clim en journee."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Chaque <strong>canicule en France</strong> relance la meme question : comment <strong>rafraichir le logement</strong> sans exploser la facture d'electricite ? Les <strong>panneaux solaires photovoltaiques</strong> ne remplacent pas l'isolation, mais l'<strong>autoconsommation</strong> alimente ventilateurs, clim (si installee) et pompe a chaleur en plein soleil — precisement quand le reseau est tendu. Reste a combiner <strong>aides publiques</strong>, <strong>aides des collectivites</strong> et un <strong>pret adapte</strong> pour financer l'installation."
        },
        {
          "type": "gallery",
          "label": "Canicule, soleil et toiture : trois leviers concrets",
          "items": [
            {
              "src": "./images/canicule/panneaux-solaires-toiture.jpg",
              "alt": "Installation photovoltaique sur toiture",
              "caption": "Photovoltaique — production en heures de pointe chaleur"
            },
            {
              "src": "./images/canicule/chaleur-soleil-maison.jpg",
              "alt": "Maison sous forte chaleur estivale",
              "caption": "Canicule — consommation electrique en hausse"
            },
            {
              "src": "./images/canicule/maison-panneaux-solaires.jpg",
              "alt": "Maison avec equipement solaire",
              "caption": "Projet global : toiture, assurance, financement"
            }
          ]
        },
        {
          "type": "h2",
          "text": "1. Pourquoi le solaire parle en periode de canicule"
        },
        {
          "type": "p",
          "text": "En ete, la production <strong>PV</strong> est maximale en journée — quand la clim et la ventilation tournent. L'<strong>autoconsommation</strong> (consommer sur place ce que vous produisez) reduit la part achetee au fournisseur. Le surplus peut etre <strong>revendu</strong> (tarif reglemente de vente du surplus) selon contrat et puissance installee. Ce n'est pas une clim gratuite, mais un levier de <strong>pouvoir d'achat energie</strong> complementaire a l'isolation et aux stores."
        },
        {
          "type": "h2",
          "text": "2. Aides de l'Etat (primes, fiscalite, TVA)"
        },
        {
          "type": "figure",
          "src": "./images/canicule/maison-panneaux-solaires.jpg",
          "alt": "Maison avec panneaux solaires — aides publiques photovoltaique",
          "caption": "Primes et fiscalite : barèmes mis a jour regulierement — verifiez l'eligibilite avant devis."
        },
        {
          "type": "p",
          "text": "Les dispositifs evoluent ; a date, les foyers peuvent cumuler selon profil : <strong>prime a l'autoconsommation photovoltaique</strong> (forfait par kWc installe, conditions de raccordement et d'installateur RGE), <strong>vente du surplus</strong> d'electricite, parfois <strong>TVA reduite</strong> sur l'installation en habitation principale sous conditions. Cote impots : revenus de vente de surplus souvent exoneres dans certaines limites pour les particuliers. Demandez un chiffrage avec mention explicite des <strong>aides deduites</strong> — <a href=\"../landings/credit-immo.html\">etude financement travaux</a>."
        },
        {
          "type": "h2",
          "text": "3. Collectivites, region, CEE et programmes locaux"
        },
        {
          "type": "p",
          "text": "Au-dela de l'Etat, certaines <strong>metropoles, departements ou EPCI</strong> proposent des subventions « energie solaire », des operations groupees ou des conseils via l'ADIL / maisons de l'habitat. Les <strong>Certificats d'economies d'energie (CEE)</strong> peuvent financer une part de travaux de performance energetique (souvent couple isolation + equipements). Consultez le site de votre mairie ou region : les montants varient et les budgets s'epuisent vite en debut d'annee."
        },
        {
          "type": "h2",
          "text": "4. Quel pret pour financer les panneaux solaires ?"
        },
        {
          "type": "figure",
          "src": "./images/finance/signature-pret.jpg",
          "alt": "Signature de pret — financement panneaux solaires et travaux energie",
          "caption": "Eco-PTZ, credit travaux ou conso : comparer le cout total (TAEG, duree, assurance)."
        },
        {
          "type": "p",
          "text": "Plusieurs options selon votre situation : <strong>eco-PTZ</strong> (pret a taux zero) si le projet entre dans un bouquet de travaux d'economie d'energie eligibles et que vous respectez les plafonds de ressources ; <strong>credit travaux / credit consommation</strong> pour financer le reste a charge ; <strong>renegociation ou rachat de credit</strong> si vous voulez lisser la mensualite sans toucher a l'epargne de precaution. Si vous avez deja un <strong>pret immobilier</strong>, verifiez l'impact sur votre taux d'endettement avant d'emprunter. <a href=\"../landings/devis.html?need=conso\"><strong>Demander un devis credit conso</strong></a> · <a href=\"../landings/credit-immo.html\">credit immobilier / travaux</a>."
        },
        {
          "type": "h2",
          "text": "5. Assurance habitation : declarer l'installation"
        },
        {
          "type": "figure",
          "src": "./images/habitat/maison-famille.jpg",
          "alt": "Maison familiale — assurance habitation apres pose de panneaux solaires",
          "caption": "PV en toiture : mettre a jour la multirisque habitation (valeur du batiment)."
        },
        {
          "type": "p",
          "text": "Des <strong>panneaux solaires</strong> modifies la toiture et la valeur du bien. Prevenez votre assureur : garantie dommages (tempete, grele), responsabilite vis-a-vis du voisinage (chute d'objet, surchauffe), parfois extension « equipements exterieurs ». En cas de sinistre lie a la canicule (orage, grele), une installation non declaree peut compliquer l'indemnisation. <a href=\"../landings/devis.html?need=habitation\">Devis assurance habitation</a>."
        },
        {
          "type": "h2",
          "text": "6. Checklist avant de signer un devis solaire"
        },
        {
          "type": "p",
          "text": "Installateur <strong>RGE</strong>, etude de consommation, part d'autoconsommation estimee, devis avec primes deduites, mode de financement, delai de raccordement Enedis, mise a jour assurance habitation. En periode de canicule, les delais d'installation peuvent s'allonger — anticipez plutot qu'en alerte rouge."
        }
      ],
      "related": [
        {
          "href": "./canicule-degats-eaux-assurance-habitation.html",
          "label": "Canicule et habitation"
        },
        {
          "href": "./canicule-futur-climatique-seniors-assurance-mutuelle.html",
          "label": "Climat futur et logement"
        },
        {
          "href": "../landings/credit-immo.html",
          "label": "Credit immobilier & travaux"
        },
        {
          "href": "../landings/devis.html?need=habitation",
          "label": "Devis habitation"
        }
      ]
    },
    {
      "file": "ia-metiers-assurance-tarification-2026.html",
      "section": "actu",
      "tag": "Tech & IA",
      "tagClass": "tag-actu",
      "title": "Intelligence artificielle et assurance : ce qui change pour les particuliers en 2026",
      "description": "Tarification, chatbots, fraude : comment l'IA transforme l'assurance sans remplacer le conseil humain.",
      "meta": "5 min · Mai 2026",
      "cardExcerpt": "IA et assurance : mythes et realites.",
      "cta": {
        "href": "../assurances/",
        "label": "Voir toutes nos assurances"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Les assureurs utilisent l'<strong>IA</strong> pour analyser les risques, accelerer les devis et detecter la fraude. Pour vous, l'enjeu reste le meme : un contrat lisible et un interlocuteur en cas de sinistre."
        },
        {
          "type": "h2",
          "text": "Comparateurs vs courtier"
        },
        {
          "type": "p",
          "text": "Un algorithme propose un prix ; un courtier verifie les <strong>exclusions</strong> et la coherence avec votre situation (pret, activite pro, famille)."
        }
      ],
      "related": [
        {
          "href": "../assurances/",
          "label": "Catalogue assurances"
        }
      ]
    },
    {
      "file": "ligue-champions-assurance-voyage-deplacement.html",
      "audience": "international",
      "section": "actu",
      "tag": "Ligue des champions",
      "tagClass": "tag-actu",
      "title": "Ligue des champions : assurance voyage, sante et deplacements",
      "description": "Finale, deplacement Europe : annulation, soins a l'etranger, vol bagages — checklist avant le match.",
      "meta": "6 min · Mai 2026",
      "cardExcerpt": "Vous partez voir la C1 ? Assurances utiles.",
      "cta": {
        "href": "../landings/devis.html?need=autre",
        "label": "Parler assurance voyage"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Finale de <strong>Ligue des champions</strong>, demi-retour a l'etranger, week-end entre amis : le billet n'est pas le seul budget. Un imprévu (annulation, blessure, vol) peut couter bien plus cher qu'une place au stade."
        },
        {
          "type": "h2",
          "text": "Assurance annulation / voyage"
        },
        {
          "type": "p",
          "text": "Certaines cartes bancaires incluent une garantie <strong>annulation</strong> ou retard de transport. Sinon, une assurance voyage couvre billet, hotel et parfois la revente impossible."
        },
        {
          "type": "h2",
          "text": "Sante a l'etranger"
        },
        {
          "type": "p",
          "text": "Carte Europeenne d'assurance maladie (UE) + mutuelle avec bon poste <strong>etranger</strong> : indispensable hors zone euro. Frais medicaux et rapatriement peuvent exploser."
        },
        {
          "type": "h2",
          "text": "Auto, VTC et responsabilite"
        },
        {
          "type": "p",
          "text": "Covoiturage, location de voiture : verifiez les garanties conducteur et la RC. Organisateur d'un voyage de groupe ? La RC vie privee peut etre sollicitee en cas d'accident sur place."
        }
      ],
      "related": [
        {
          "href": "../assurance-sante/",
          "label": "Mutuelle sante"
        },
        {
          "href": "../assurance-auto/",
          "label": "Assurance auto"
        },
        {
          "href": "../assurance-vtc/",
          "label": "Assurance VTC"
        }
      ]
    },
    {
      "file": "coupe-monde-2026-assurance-voyage-sante.html",
      "audience": "international",
      "section": "actu",
      "tag": "Coupe du monde",
      "tagClass": "tag-actu",
      "title": "Coupe du monde 2026 : mutuelle, voyage et assurance a l'etranger",
      "description": "Mondial USA / Mexique / Canada : soins, rapatriement, location auto — preparer son assurance avant le depart.",
      "meta": "7 min · Mai 2026",
      "cardExcerpt": "Mondial 2026 : le pack assurance supporter.",
      "cta": {
        "href": "../landings/sante.html",
        "label": "Verifier ma mutuelle"
      },
      "blocks": [
        {
          "type": "p",
          "text": "La <strong>Coupe du monde 2026</strong> entraine des departs longue distance. Entre sante, transport et materiel (appareils photo, telephones), un sinistre a l'etranger sans couverture adaptee peut depasser plusieurs milliers d'euros."
        },
        {
          "type": "h2",
          "text": "Mutuelle et frais medicaux hors France"
        },
        {
          "type": "p",
          "text": "Aux USA notamment, les soins sont tres chers. Votre mutuelle doit preciser les plafonds <strong>etranger</strong> et le rapatriement. Completez si besoin avec une assurance voyage sante."
        },
        {
          "type": "h2",
          "text": "Assurance voyage : bagages, retard, annulation"
        },
        {
          "type": "p",
          "text": "Vol de maillot collection, retard de vol manque pour le match : les garanties voyage couvrent souvent bagages, retard et responsabilite civile a l'etranger."
        },
        {
          "type": "h2",
          "text": "Location de voiture"
        },
        {
          "type": "p",
          "text": "Refusez ou acceptez la franchise en connaissance de cause : parfois votre <strong>assurance auto</strong> ou la carte bancaire la prend en charge — verifiez avant de partir."
        }
      ],
      "related": [
        {
          "href": "../assurance-sante/",
          "label": "Mutuelle"
        },
        {
          "href": "../assurance-auto/",
          "label": "Assurance auto"
        },
        {
          "href": "../assurances/",
          "label": "Toutes nos assurances"
        }
      ]
    },
    {
      "file": "gta-6-sortie-assurance-gaming-materiel.html",
      "audience": "international",
      "section": "actu",
      "tag": "GTA 6",
      "tagClass": "tag-actu",
      "title": "GTA 6 : assurer sa console, son PC et ses achats gaming",
      "description": "Sortie GTA VI : console, edition collector, setup PC — habitation, vol et RC pour createurs.",
      "meta": "6 min · Mai 2026",
      "cardExcerpt": "Sortie GTA 6 : proteger son materiel gaming.",
      "cta": {
        "href": "../landings/devis.html?need=habitation",
        "label": "Revoir mon habitation"
      },
      "heroImage": {
        "src": "./images/streaming/twitch-live-stream-setup.png",
        "alt": "Setup streaming live Twitch — dual ecran, micro et eclairage pour le day-one GTA 6",
        "caption": "Live Twitch day-one : PC, ecrans, micro et cam representent souvent 3 000 a 8 000 € de materiel a couvrir."
      },
      "blocks": [
        {
          "type": "p",
          "text": "La sortie de <strong>GTA 6</strong> relance les achats : console next-gen, PC gamer, ecran 4K, edition collector. Des milliers d'euros dans le salon — rarement couverts correctement par defaut. Et si vous streamez sur <strong>Twitch</strong>, publiez des <strong>YouTube Shorts</strong> ou des lives <strong>TikTok</strong>, la valeur du setup explose encore."
        },
        {
          "type": "gallery",
          "label": "Twitch, YouTube Shorts, TikTok Live — formats du day-one GTA 6",
          "items": [
            {
              "src": "./images/streaming/twitch-live-stream-setup.png",
              "alt": "Bureau streamer avec eclairage violet, dual monitor et micro — style live Twitch",
              "caption": "Live Twitch — setup pro (ecrans, micro, webcam, LED)"
            },
            {
              "src": "./images/streaming/tiktok-youtube-shorts-live.png",
              "alt": "Smartphone en format vertical avec interface live gaming — YouTube Shorts ou TikTok",
              "caption": "YouTube Shorts / TikTok Live — format vertical mobile"
            },
            {
              "src": "./images/streaming/mobile-gaming-vertical.jpg",
              "alt": "Joueur mobile en session gaming verticale",
              "caption": "Gaming mobile et contenus courts — autre angle a assurer"
            }
          ]
        },
        {
          "type": "h2",
          "text": "Habitation : vol, incendie, degats des eaux"
        },
        {
          "type": "figure",
          "src": "./images/gta6/gta6-vice-city-02.jpg",
          "alt": "Grand Theft Auto VI — Vice City, jeu day-one sur console ou PC",
          "caption": "GTA VI day-one : console, PC ou edition collector — verifiez vos plafonds habitation."
        },
        {
          "type": "p",
          "text": "Verifiez les <strong>plafonds mobilier</strong> de votre multirisque habitation. Un cambriolage ou un degat des eaux sur un PC peut depasser le plafond « appareils » standard."
        },
        {
          "type": "h2",
          "text": "Streamer et YouTubeur"
        },
        {
          "type": "figure",
          "src": "./images/streaming/streaming-esports.jpg",
          "alt": "Setup esport et streaming — claviers mecaniques et ecrans gaming",
          "caption": "Streamer ou YouTubeur : le materiel pro (capture, voix, eclairage) s'ajoute au cout du jeu."
        },
        {
          "type": "p",
          "text": "Vous filmez le day one en <strong>live Twitch</strong>, montez des <strong>Shorts YouTube</strong> ou enchaînez les lives <strong>TikTok</strong> ? Materiel pro, voix, sponsors : voir notre guide <a href=\"./assurance-streamer-gaming-setup-materiel.html\">assurance streamer &amp; gaming</a> et la RC pro si vous etes monétise."
        },
        {
          "type": "h2",
          "text": "Achat en ligne et garanties"
        },
        {
          "type": "figure",
          "src": "./images/streaming/gaming-keyboard-rgb.jpg",
          "alt": "Clavier mecanique RGB et setup PC gamer haut de gamme",
          "caption": "Peripheriques premium : extension de garantie ou habitation bien calibree."
        },
        {
          "type": "p",
          "text": "Extension de garantie, assurance carte bancaire : comparez avant de payer. Certaines couvrent le vol a la livraison ou la casse les 90 premiers jours."
        }
      ],
      "related": [
        {
          "href": "./assurance-streamer-gaming-setup-materiel.html",
          "label": "Assurance streamer"
        },
        {
          "href": "../assurance-habitation/",
          "label": "Assurance habitation"
        },
        {
          "href": "../assurances/",
          "label": "Catalogue assurances"
        }
      ]
    },
    {
      "file": "gta-6-pret-immobilier-budget-gaming.html",
      "audience": "international",
      "section": "finance",
      "tag": "GTA 6 & credit",
      "tagClass": "tag-actu",
      "title": "GTA 6 et pret immobilier : financer son setup sans fragiliser son credit",
      "description": "Console, PC, edition collector : comment concilier achats gaming et mensualites de pret + assurance emprunteur.",
      "meta": "7 min · Juin 2026",
      "cardExcerpt": "GTA 6 : le bon budget sans mettre le pret en danger.",
      "cta": {
        "href": "../landings/credit-immo.html",
        "label": "Etudier mon pret immo"
      },
      "blocks": [
        {
          "type": "p",
          "text": "La hype autour de <strong>GTA 6</strong> pousse beaucoup de foyers a renouveler console ou PC. Probleme : un credit immobilier en cours impose une <strong>capacite d'endettement</strong> stable. Un achat impulsif a 2 000 € peut compliquer un projet d'achat ou un rachat de pret dans les mois qui suivent."
        },
        {
          "type": "h2",
          "text": "1. Ne pas melanger loisir et apport"
        },
        {
          "type": "p",
          "text": "Les banques regardent l'epargne residuelle et les decouverts. Avant un gros achat gaming, verifiez que votre <strong>reste a vivre</strong> reste confortable apres mensualite de pret et assurance emprunteur."
        },
        {
          "type": "h2",
          "text": "2. Assurance emprunteur : economiser pour financer autre chose"
        },
        {
          "type": "p",
          "text": "La <strong>loi Lemoine</strong> permet souvent de reduire le cout de l'assurance de pret sans changer de banque. Les economies (parfois 30 a 50 €/mois) peuvent financer un setup gaming sans toucher a l'epargne de precaution."
        },
        {
          "type": "h2",
          "text": "3. Habitation : couvrir le materiel neuf"
        },
        {
          "type": "p",
          "text": "Apres achat, mettez a jour les <strong>plafonds mobilier</strong> de votre multirisque habitation. Voir aussi notre guide <a href=\"./gta-6-sortie-assurance-gaming-materiel.html\">GTA 6 et assurance gaming</a>."
        },
        {
          "type": "bridge"
        }
      ],
      "related": [
        {
          "href": "./gta-6-precommande-ps5-pro-credit-conso-france.html",
          "label": "Credit conso PS5 Pro & GTA 6"
        },
        {
          "href": "./gta-6-sortie-assurance-gaming-materiel.html",
          "label": "Assurer son materiel GTA 6"
        },
        {
          "href": "./assurance-emprunteur-loi-lemoine-2026.html",
          "label": "Loi Lemoine"
        },
        {
          "href": "../landings/credit-immo.html",
          "label": "Credit immobilier"
        }
      ],
      "faq": [
        {
          "q": "Un pret consommation pour une console impacte-t-il mon pret immo ?",
          "a": "Oui si vous etes en phase de recherche de financement : chaque credit en cours entre dans le taux d'endettement. Attendez la signature si possible."
        },
        {
          "q": "L'assurance emprunteur peut-elle baisser ma charge mensuelle ?",
          "a": "Souvent oui via delegation ou changement d'assureur (loi Lemoine), ce qui libere du budget loisirs sans nouveau credit."
        }
      ]
    },
    {
      "file": "gta-6-precommande-ps5-pro-credit-conso-france.html",
      "audience": "france",
      "section": "finance",
      "tag": "GTA 6 & credit conso",
      "tagClass": "tag-actu",
      "title": "Precommandes GTA 6 et PS5 Pro : credit conso en France, ce que la loi autorise",
      "description": "GTA VI, PS5 Pro : pret personnel ou credit magasin — cadre legal (Code de la consommation), TAEG, endettement et alternatives.",
      "meta": "9 min · Juin 2026",
      "cardExcerpt": "PS5 Pro + GTA 6 : le credit conso est-il legal en France ? Oui, sous conditions.",
      "cta": {
        "href": "../landings/questionnaire.html?need=conso&journey=standard&utm_source=blog&utm_medium=finance&utm_campaign=gta6-ps5",
        "label": "Etude credit consommation"
      },
      "heroImage": {
        "src": "./images/gta6/gta6-vice-city-01.jpg",
        "alt": "Grand Theft Auto VI — panorama Vice City",
        "caption": "GTA VI — Vice City. Capture officielle Rockstar Games (rockstargames.com/VI/media/screenshots)."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Les <strong>precommandes de GTA 6</strong> et l'achat d'une <strong>PS5 Pro</strong> (console next-gen, manette, jeu day-one, parfois edition collector) representent souvent <strong>800 a 1 200 €</strong> d'un coup. Beaucoup se demandent s'il est possible — et legal — de financer ce budget avec un <strong>credit a la consommation</strong> en France. Reponse courte : <strong>oui, c'est autorise</strong>, a condition de respecter le cadre du <strong>Code de la consommation</strong> et votre capacite de remboursement."
        },
        {
          "type": "gallery",
          "label": "Captures officielles Grand Theft Auto VI",
          "items": [
            {
              "src": "./images/gta6/gta6-vice-city-02.jpg",
              "alt": "GTA VI — Vice City de nuit, gratte-ciels et ocean",
              "caption": "Vice City de nuit — GTA VI"
            },
            {
              "src": "./images/gta6/gta6-lucia-01.jpg",
              "alt": "GTA VI — Lucia Caminos, personnage jouable",
              "caption": "Lucia Caminos — GTA VI"
            }
          ]
        },
        {
          "type": "h2",
          "text": "1. Ce que dit la loi francaise (Code de la consommation)"
        },
        {
          "type": "p",
          "text": "Le <strong>credit a la consommation</strong> (articles L311-1 et suivants) couvre le financement de <strong>biens ou services</strong> a usage non professionnel, ou un <strong>pret de tresorerie</strong> pour des besoins personnels — hors credit immobilier. Une console, un jeu video, un ecran ou un casque entrent dans la categorie des <strong>biens de consommation courante</strong>. Rien n'interdit d'affecter un <strong>pret personnel</strong> (non lie a un magasin) a l'achat d'une PS5 Pro et de GTA 6 : l'organisme preteur verifie surtout votre <strong>capacite de remboursement</strong>, pas la « moralite » de la depense."
        },
        {
          "type": "ul",
          "items": [
            "<strong>Pret personnel</strong> : fonds verses sur votre compte, libre usage (dont gaming).",
            "<strong>Credit affecte</strong> : lie a l'achat chez un vendeur (Fnac, Darty, Micromania…) — legal si fiche precontractuelle et TAEG conformes.",
            "<strong>Interdit ou encadre</strong> : taux d'usure depasse, absence d'information precontractuelle, credit sans etude de solvabilite."
          ]
        },
        {
          "type": "h2",
          "text": "2. Precommande GTA 6 + PS5 Pro : quel budget prevoir ?"
        },
        {
          "type": "figure",
          "src": "./images/gta6/gta6-vice-city-01.jpg",
          "alt": "GTA VI — vue aerienne de Vice City, budget gaming PS5 Pro",
          "caption": "Le day-one GTA VI sur PS5 Pro : un budget souvent proche de 1 000 € (console + jeu + accessoires)."
        },
        {
          "type": "p",
          "text": "Avant d'envisager un credit, chiffrez le panier : <strong>PS5 Pro</strong> (souvent autour de 750 €), <strong>GTA 6</strong> (edition standard ou collector), manette supplementaire, abonnement PS Plus si vous jouez en ligne, eventuellement SSD ou ecran. Les precommandes peuvent inclure un <strong>acompte</strong> : le credit ne doit couvrir que le <strong>reste a payer</strong>, pas remplacer une epargne de precaution."
        },
        {
          "type": "h2",
          "text": "3. Credit magasin, « 3x sans frais » ou vrai pret conso ?"
        },
        {
          "type": "p",
          "text": "Toutes les solutions affichees en caisse ne sont pas equivalentes. Le <strong>paiement fractionne carte bancaire</strong> (3x ou 4x) peut etre un debit differe sans credit au sens legal. Un <strong>credit affecte</strong> ou un <strong>pret personnel</strong> declenche les obligations du Code de la consommation : <strong>TAEG</strong>, duree, cout total du credit, droit de <strong>retractation de 14 jours</strong> (souvent pour les contrats conclus a distance). Comparez le <strong>cout total</strong>, pas seulement la mensualite."
        },
        {
          "type": "h2",
          "text": "4. Obligations de l'organisme preteur (et de l'emprunteur)"
        },
        {
          "type": "ul",
          "items": [
            "Etude de votre situation (revenus, charges, fichages <strong>FICP/FCC</strong> le cas echeant).",
            "Respect du <strong>taux d'usure</strong> fixe par la Banque de France.",
            "Remise de la fiche d'information precontractuelle et du contrat clair.",
            "De votre cote : ne pas signer sous pression « day one » ; lire le <strong>TAEG</strong> et le montant total du."
          ]
        },
        {
          "type": "h2",
          "text": "5. Attention si vous avez (ou preparez) un pret immobilier"
        },
        {
          "type": "p",
          "text": "Un credit conso en cours entre dans votre <strong>taux d'endettement</strong> bancaire. Si vous achetez un logement dans les 6 a 12 mois, un pret de 1 000 € pour du gaming peut faire basculer un dossier. Voir notre guide <a href=\"./gta-6-pret-immobilier-budget-gaming.html\">GTA 6 et pret immobilier</a>. Parfois, reduire l'<strong>assurance emprunteur</strong> (loi Lemoine) libere le budget loisirs sans nouveau credit."
        },
        {
          "type": "h2",
          "text": "6. Alternatives au credit conso"
        },
        {
          "type": "ul",
          "items": [
            "Epargner l'acompte de precommande et payer le solde a la sortie.",
            "Achat d'occasion ou bundle console + jeu sans financement.",
            "Reporter l'achat materiel si votre reste a vivre est serre.",
            "Mettre a jour l'<strong>assurance habitation</strong> apres achat (vol, degat des eaux) — voir <a href=\"./gta-6-sortie-assurance-gaming-materiel.html\">assurer son setup GTA 6</a>."
          ]
        },
        {
          "type": "bridge"
        }
      ],
      "related": [
        {
          "href": "./gta-6-pret-immobilier-budget-gaming.html",
          "label": "GTA 6 et pret immo"
        },
        {
          "href": "./gta-6-ps5-pro-budget-1000-euros-pret-conso.html",
          "label": "Budget 1 000 € et mensualites"
        },
        {
          "href": "./pret-conso-gaming-ps5-pro-gta6-comparatif-2026.html",
          "label": "Comparer les offres de credit"
        },
        {
          "href": "./gta-6-sortie-assurance-gaming-materiel.html",
          "label": "Assurance materiel gaming"
        },
        {
          "href": "../landings/questionnaire.html?need=conso&journey=standard",
          "label": "Questionnaire credit conso"
        },
        {
          "href": "../nos-services.html",
          "label": "Credit consommation"
        }
      ],
      "faq": [
        {
          "q": "Est-il illegal en France de faire un credit conso pour une PS5 Pro et GTA 6 ?",
          "a": "Non. Console et jeu sont des biens de consommation. Le credit a la consommation peut financer cet achat (pret personnel ou credit affecte), sous reserve du respect du Code de la consommation et de votre solvabilite."
        },
        {
          "q": "Quelle difference entre pret personnel et credit affecte en magasin ?",
          "a": "Le pret personnel verse des fonds libres ; le credit affecte est lie a l'achat chez le vendeur. Les deux sont des credits a la consommation avec TAEG et information precontractuelle obligatoires."
        },
        {
          "q": "Le « 3x sans frais » est-il un credit conso ?",
          "a": "Pas toujours : selon l'operateur, il peut s'agir d'un debit differe carte. Si un TAEG et un contrat de credit sont signes, c'est bien un credit a la consommation reglemente."
        },
        {
          "q": "Puis-je me retracter apres avoir signe un pret conso en ligne ?",
          "a": "En general oui : delai legal de 14 jours calendaires pour les contrats de credit a la consommation conclus a distance (sauf exceptions prevues par la loi)."
        },
        {
          "q": "Un credit pour GTA 6 impacte-t-il mon futur pret immobilier ?",
          "a": "Oui : toute mensualite en cours est prise en compte dans le taux d'endettement. Evitez un nouveau credit conso avant une demande de pret immobilier."
        }
      ]
    },
    {
      "file": "gta-6-ps5-pro-budget-1000-euros-pret-conso.html",
      "audience": "france",
      "section": "finance",
      "tag": "GTA 6 & credit conso",
      "tagClass": "tag-actu",
      "title": "PS5 Pro + GTA 6 : budget 1 000 € et mensualites d'un pret conso",
      "description": "Panier PS5 Pro, GTA VI, manette : chiffrage a 1 000 €, simulations 12/24/36 mois (TAEG), reste a vivre et alternatives sans credit.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "Setup GTA 6 a 1 000 € : combien par mois avec un pret conso ?",
      "cta": {
        "href": "../landings/questionnaire.html?need=conso&journey=standard&utm_source=blog&utm_medium=finance&utm_campaign=gta6-budget-1000",
        "label": "Simuler mon pret conso"
      },
      "heroImage": {
        "src": "./images/gta6/gta6-lucia-01.jpg",
        "alt": "Grand Theft Auto VI — Lucia Caminos en action",
        "caption": "GTA VI — Lucia Caminos. Capture officielle Rockstar Games."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Pour jouer a <strong>GTA 6</strong> day one sur <strong>PS5 Pro</strong>, beaucoup de foyers visent un panier autour de <strong>1 000 €</strong> : console, jeu, manette et quelques accessoires. Si l'epargne ne suffit pas, un <strong>pret a la consommation</strong> peut etaler la depense — a condition de connaitre le <strong>cout total</strong> et votre <strong>reste a vivre</strong>. Voici un budget realiste et des simulations de mensualites (ordre de grandeur, TAEG indicatifs)."
        },
        {
          "type": "figure",
          "src": "./images/gta6/gta6-vice-city-02.jpg",
          "alt": "GTA VI — Vice City, environnement open world",
          "caption": "GTA VI se deroule a Vice City : le budget materiel (PS5 Pro + jeu) tourne souvent autour de 1 000 €."
        },
        {
          "type": "h2",
          "text": "1. Decouper un budget gaming a 1 000 €"
        },
        {
          "type": "ul",
          "items": [
            "<strong>PS5 Pro</strong> : environ 749 € (prix public conseille, hors promotions).",
            "<strong>GTA 6</strong> (edition standard) : 70 a 90 € selon distributeur.",
            "<strong>Manette DualSense</strong> supplementaire : 65 a 80 € (coop ou remplacement).",
            "<strong>Accessoires</strong> : cable HDMI 2.1, station de charge, coque — 30 a 80 €.",
            "<strong>Option en ligne</strong> : PS Plus Essential (1 mois) ~9 € si multijoueur."
          ]
        },
        {
          "type": "p",
          "text": "Total typique : <strong>915 a 1 010 €</strong>. Arrondir a <strong>1 000 €</strong> pour une simulation de pret conso est coherent. Si vous avez deja une PS5, retirez la console : un credit de <strong>150 a 250 €</strong> pour le seul jeu + accessoires change completement la donne (mensualite bien plus basse)."
        },
        {
          "type": "h2",
          "text": "2. Simulations : 1 000 € empruntes sur 12, 24 ou 36 mois"
        },
        {
          "type": "p",
          "text": "Exemples pour un <strong>pret personnel</strong> de 1 000 € (hors assurance emprunteur facultative). Les montants sont <strong>indicatifs</strong> : seul le <strong>TAEG</strong> figurant sur votre offre fait foi."
        },
        {
          "type": "ul",
          "items": [
            "<strong>12 mois, TAEG 5 %</strong> : environ <strong>86 €/mois</strong> — cout total du credit ~32 €.",
            "<strong>12 mois, TAEG 7 %</strong> : environ <strong>87 €/mois</strong> — cout total ~44 €.",
            "<strong>24 mois, TAEG 7 %</strong> : environ <strong>45 €/mois</strong> — cout total ~77 €.",
            "<strong>36 mois, TAEG 7 %</strong> : environ <strong>31 €/mois</strong> — cout total ~118 €.",
            "<strong>36 mois, TAEG 9 %</strong> : environ <strong>32 €/mois</strong> — cout total ~150 €."
          ]
        },
        {
          "type": "p",
          "text": "Plus la duree est longue, plus la mensualite baisse — mais le <strong>cout total du credit</strong> augmente. Pour 1 000 € de loisir, une duree de <strong>12 a 24 mois</strong> limite souvent les interets tout en gardant une charge acceptable."
        },
        {
          "type": "h2",
          "text": "3. Pret conso ou epargne : trois questions avant de signer"
        },
        {
          "type": "ul",
          "items": [
            "Votre <strong>reste a vivre</strong> apres loyer, credits et charges reste-t-il confortable avec +45 ou +87 €/mois ?",
            "Avez-vous un <strong>projet immobilier</strong> dans les 12 mois ? Un credit conso en cours alourdit le taux d'endettement.",
            "Existe-t-il une alternative : <strong>acompte de precommande</strong> + solde a la sortie, achat d'occasion, ou report de la PS5 Pro ?"
          ]
        },
        {
          "type": "h2",
          "text": "4. Apres l'achat : ne pas oublier l'assurance habitation"
        },
        {
          "type": "p",
          "text": "1 000 € de materiel dans le salon meritent des <strong>plafonds mobilier</strong> a jour (vol, degat des eaux). Voir <a href=\"./gta-6-sortie-assurance-gaming-materiel.html\">assurer son setup GTA 6</a>. Le cadre legal du credit conso en France est detaille dans notre guide <a href=\"./gta-6-precommande-ps5-pro-credit-conso-france.html\">PS5 Pro, GTA 6 et credit conso</a>."
        },
        {
          "type": "bridge"
        }
      ],
      "related": [
        {
          "href": "./gta-6-precommande-ps5-pro-credit-conso-france.html",
          "label": "Cadre legal credit conso"
        },
        {
          "href": "./pret-conso-gaming-ps5-pro-gta6-comparatif-2026.html",
          "label": "Comparer pret perso et credit magasin"
        },
        {
          "href": "./gta-6-pret-immobilier-budget-gaming.html",
          "label": "GTA 6 et pret immo"
        },
        {
          "href": "../landings/questionnaire.html?need=conso&journey=standard",
          "label": "Questionnaire credit conso"
        }
      ],
      "faq": [
        {
          "q": "1 000 € pour une PS5 Pro et GTA 6, c'est un budget realiste ?",
          "a": "Oui pour un pack console + jeu + manette. Une edition collector ou un ecran 4K en plus depasse vite 1 200 a 1 500 €."
        },
        {
          "q": "Quelle mensualite pour 1 000 € sur 24 mois ?",
          "a": "Comptez environ 44 a 46 €/mois pour un TAEG autour de 7 %, soit un cout total du credit proche de 75 a 80 €."
        },
        {
          "q": "Vaut-il mieux 12 ou 36 mois pour financer du gaming ?",
          "a": "En general, une duree courte (12-24 mois) limite les interets. Le 36 mois n'est interessant que si votre budget mensuel est tres serre et que le TAEG reste modere."
        }
      ]
    },
    {
      "file": "pret-conso-gaming-ps5-pro-gta6-comparatif-2026.html",
      "audience": "france",
      "section": "finance",
      "tag": "GTA 6 & credit conso",
      "tagClass": "tag-actu",
      "title": "Pret conso gaming : comparer pret personnel, credit magasin et 3x pour GTA 6",
      "description": "PS5 Pro et GTA 6 (~1 000 €) : pret personnel, credit affecte Fnac/Darty, paiement 3x/4x — differences, TAEG, retractation et pieges a eviter.",
      "meta": "7 min · Juin 2026",
      "cardExcerpt": "GTA 6 / PS5 Pro : quelle forme de credit choisir en magasin ou en ligne ?",
      "cta": {
        "href": "../landings/questionnaire.html?need=conso&journey=standard&utm_source=blog&utm_medium=finance&utm_campaign=gta6-comparatif-conso",
        "label": "Etude credit consommation"
      },
      "heroImage": {
        "src": "./images/gta6/gta6-vice-city-02.jpg",
        "alt": "Grand Theft Auto VI — Vice City la nuit",
        "caption": "GTA VI — Vice City. Capture officielle Rockstar Games."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Face a un panier <strong>PS5 Pro + GTA 6</strong> d'environ <strong>1 000 €</strong>, les enseignes proposent souvent plusieurs options : <strong>pret personnel</strong> en banque ou en ligne, <strong>credit affecte</strong> au moment du paiement, ou <strong>paiement en plusieurs fois</strong> carte bancaire. Toutes ne sont pas des <strong>credits a la consommation</strong> au sens du Code de la consommation — et le <strong>cout total</strong> peut varier du simple au triple."
        },
        {
          "type": "figure",
          "src": "./images/gta6/gta6-lucia-01.jpg",
          "alt": "GTA VI — gameplay avec Lucia Caminos",
          "caption": "Precommander GTA VI et une PS5 Pro : comparez le cout total du credit, pas seulement la mensualite."
        },
        {
          "type": "h2",
          "text": "1. Pret personnel : liberte d'achat"
        },
        {
          "type": "p",
          "text": "L'argent est verse sur votre compte : vous achetez la PS5 Pro et GTA 6 ou vous voulez (Amazon, Micromania, occasion). Avantages : <strong>comparaison des prix</strong>, pas de lien avec un vendeur. Inconvenients : etude de dossier, delai de versement, TAEG parfois plus eleve que le credit magasin promo. Verifiez le <strong>TAEG</strong> et le <strong>montant total du</strong> sur la fiche precontractuelle."
        },
        {
          "type": "h2",
          "text": "2. Credit affecte en magasin (Fnac, Darty, Boulanger…)"
        },
        {
          "type": "p",
          "text": "Le credit est lie a l'achat de la console et du jeu. Souvent des <strong>offres promotionnelles</strong> (TAEG reduit sur quelques mois). Attention : le bundle impose parfois des accessoires ou assurances. Comparez le <strong>prix du panier finance</strong> au meme panier paye comptant ailleurs + pret perso."
        },
        {
          "type": "h2",
          "text": "3. « 3x sans frais » ou 4x : credit ou simple debit differe ?"
        },
        {
          "type": "p",
          "text": "Selon l'operateur (banque, fintech, partenaire magasin), le <strong>3x/4x</strong> peut etre un debit differe sans interets (pas un credit reglemente) ou un vrai <strong>credit a la consommation</strong> avec TAEG. Si vous signez un contrat de credit avec TAEG affiche, vous beneficiez du <strong>droit de retractation de 14 jours</strong> (contrat a distance). Sans contrat de credit, les regles sont celles du paiement carte."
        },
        {
          "type": "h2",
          "text": "4. Check-list avant de financer 1 000 € de gaming"
        },
        {
          "type": "ul",
          "items": [
            "Comparer le <strong>cout total</strong> (pas seulement la mensualite affichee en gros).",
            "Lire le <strong>TAEG</strong> et les frais de dossier eventuels.",
            "Verifier l'impact sur un futur <strong>pret immobilier</strong> (mensualite en cours = endettement).",
            "Garder une <strong>epargne de precaution</strong> : ne pas financer 100 % du panier si vous n'avez plus de matelas.",
            "Refuser les assurances « perte d'emploi » couteuses si vous n'en avez pas besoin."
          ]
        },
        {
          "type": "h2",
          "text": "5. Budget 1 000 € : quelle option selon votre profil ?"
        },
        {
          "type": "ul",
          "items": [
            "<strong>Budget serre, pas de projet immo</strong> : credit magasin promo courte duree ou pret perso 24 mois — voir nos <a href=\"./gta-6-ps5-pro-budget-1000-euros-pret-conso.html\">simulations a 1 000 €</a>.",
            "<strong>Achat immobilier dans l'annee</strong> : eviter tout nouveau credit ; epargner ou reporter l'achat — voir <a href=\"./gta-6-pret-immobilier-budget-gaming.html\">GTA 6 et pret immo</a>.",
            "<strong>Deja une PS5</strong> : financer uniquement GTA 6 + accessoires (150-250 €), pas 1 000 €."
          ]
        },
        {
          "type": "bridge"
        }
      ],
      "related": [
        {
          "href": "./gta-6-ps5-pro-budget-1000-euros-pret-conso.html",
          "label": "Budget 1 000 € et mensualites"
        },
        {
          "href": "./gta-6-precommande-ps5-pro-credit-conso-france.html",
          "label": "Legalite credit conso France"
        },
        {
          "href": "../nos-services.html",
          "label": "Credit consommation"
        },
        {
          "href": "../landings/questionnaire.html?need=conso&journey=standard",
          "label": "Questionnaire conso"
        }
      ],
      "faq": [
        {
          "q": "Le credit magasin est-il moins cher qu'un pret personnel ?",
          "a": "Pas toujours : les promos « 0 % » existent mais sont limitees en duree ou montant. Comparez toujours le TAEG et le cout total du credit."
        },
        {
          "q": "Puis-je financer seulement GTA 6 si j'ai deja la console ?",
          "a": "Oui. Un pret de 150 a 250 € (jeu + manette) a des mensualites bien plus basses qu'un credit de 1 000 € pour tout le pack."
        },
        {
          "q": "Le 3x sans frais est-il sans risque ?",
          "a": "Il peut l'etre si c'est un debit differe sans TAEG. Sinon, c'est un credit reglemente : lisez le contrat et calculez le cout total."
        }
      ]
    },
    {
      "file": "gta-6-fuites-cyberleek-memecoin-arnaque-france.html",
      "audience": "france",
      "section": "finance",
      "tag": "GTA 6 & arnaques",
      "tagClass": "tag-actu",
      "themes": [
        "gaming",
        "emprunteur"
      ],
      "title": "Fuites GTA 6 et memecoin : comment eviter l'arnaque crypto en France",
      "description": "Aout 2026 : fuites GTA VI (Cyberleek), memecoin Solana et DMCA Rockstar. Ce que ca change pour votre epargne, votre banque et votre budget en France.",
      "meta": "8 min · Aout 2026",
      "cardExcerpt": "Fuites GTA 6 + memecoin : ne pas melanger hype et epargne.",
      "cta": {
        "href": "../landings/rappel.html?need=banque&utm_source=blog&utm_medium=actu_daily&utm_campaign=banque&utm_content=gta6-memecoin",
        "label": "Rappel banque & epargne"
      },
      "heroImage": {
        "src": "./images/gta6/gta6-vice-city-01.jpg",
        "alt": "Grand Theft Auto VI — ambiance Vice City",
        "caption": "GTA VI — fuites aout 2026. Capture officielle Rockstar Games (illustration)."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Depuis mi-aout 2026, des clips attribues a un groupe surnomme <strong>Cyberleek</strong> circulent en ligne : gameplay suppose de <strong>GTA 6</strong>, carte, cutscenes. Rockstar / Take-Two multiplient les <strong>retraits DMCA</strong>. En parallele, un <strong>memecoin</strong> (souvent sur Solana) surfe sur la buzz. Pour un joueur en <strong>France</strong>, le vrai risque n'est pas spoilers — c'est de <strong>perdre de l'argent</strong> sur une crypto liee a une campagne de fuites."
        },
        {
          "type": "figure",
          "src": "./images/gta6/gta6-lucia-01.jpg",
          "alt": "GTA VI — personnage Lucia",
          "caption": "Hype GTA 6 : les arnaques crypto profitent de l'attention, pas du jeu."
        },
        {
          "type": "h2",
          "text": "1. Ce que l'on sait (sans spoiler)"
        },
        {
          "type": "ul",
          "items": [
            "Des videos presentees comme des builds <strong>anciens</strong> (2023–2024) circulent ; Rockstar n'a pas authentifie publiquement chaque clip.",
            "Les <strong>DMCA</strong> de Take-Two suggerent un contenu protege — pas une preuve que le memecoin est « officiel ».",
            "Un <strong>Extended Look</strong> Netflix est annonce fin aout 2026 : la communication officielle reste le seul canal fiable.",
            "Aucun lien public solide entre Cyberleek et la fuite confirmee de 2022."
          ]
        },
        {
          "type": "h2",
          "text": "2. Memecoin + fuites = cocktail classique d'arnaque"
        },
        {
          "type": "p",
          "text": "Le schema est connu : contenu viral → token speuleux → volume de trading → revente des early buyers. En France, un memecoin n'est <strong>pas un placement garanti</strong>. Pas de fonds de garantie type depot bancaire, pas d'ORIAS sur le token, souvent pas de prospectus clair. Si on vous promet « x100 grace a GTA 6 », c'est deja un signal d'alerte."
        },
        {
          "type": "ul",
          "items": [
            "<strong>Ne jamais</strong> connecter votre seed phrase a un site « claim GTA leak ».",
            "Refuser les DMs Telegram / Discord qui « aident » a acheter le token.",
            "Separer <strong>compte bancaire</strong> et exchanges : seulement ce que vous etes pret a perdre a 100 %.",
            "Verifier les alertes <strong>AMF</strong> / listes noires avant tout achat crypto lie a l'actu."
          ]
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "3. Budget gaming : ne pas financer la hype a credit"
        },
        {
          "type": "p",
          "text": "La buzz des fuites relance aussi les <strong>precommandes</strong> PS5 Pro + GTA 6. Un <strong>credit conso</strong> pour du materiel, c'est du Code de la consommation (TAEG, retractation 14 jours). Un memecoin, non. Melanger les deux — emprunter pour speuler — est le pire scenario pour votre <strong>taux d'endettement</strong> et un futur <strong>pret immobilier</strong>."
        },
        {
          "type": "p",
          "text": "Si vous voulez vraiment le setup day-one : comparez d'abord un <a href=\"./pret-conso-gaming-ps5-pro-gta6-comparatif-2026.html\">pret conso gaming</a> transparent, pas un token anonyme. Et mettez a jour l'<a href=\"./gta-6-sortie-assurance-gaming-materiel.html\">assurance habitation</a> une fois la console livree."
        },
        {
          "type": "h2",
          "text": "4. Checklist France avant de cliquer"
        },
        {
          "type": "ul",
          "items": [
            "Source : Netflix / Rockstar / presse, pas un compte X au token.",
            "Argent : uniquement epargne de jeu, jamais l'apport immo ni le livret d'urgence.",
            "Banque : activer alertes fraude / double authentification apres tout achat crypto.",
            "Credit : si besoin de financer une console, passer par un <strong>questionnaire credit conso</strong> — pas par un exchange."
          ]
        }
      ],
      "related": [
        {
          "href": "./gta-6-precommande-ps5-pro-credit-conso-france.html",
          "label": "Credit conso GTA 6 France"
        },
        {
          "href": "./pret-conso-gaming-ps5-pro-gta6-comparatif-2026.html",
          "label": "Comparatif pret gaming"
        },
        {
          "href": "./gta-6-sortie-assurance-gaming-materiel.html",
          "label": "Assurer son setup"
        },
        {
          "href": "../banque/",
          "label": "Banque & epargne"
        }
      ],
      "faq": [
        {
          "q": "Les fuites GTA 6 de aout 2026 sont-elles officielles ?",
          "a": "Non. Rockstar n'a pas valide les clips Cyberleek. Les retraits DMCA indiquent un contenu protege, pas une authentification publique."
        },
        {
          "q": "Acheter un memecoin lie aux fuites est-il illegal en France ?",
          "a": "Pas forcement illegal en soi, mais tres risque : pas de protection type depot bancaire. Les arnaques (phishing, drainers) restent des infractions."
        },
        {
          "q": "Puis-je financer GTA 6 a credit sans toucher a la crypto ?",
          "a": "Oui : pret personnel ou credit magasin encadres. Comparez le TAEG et l'impact sur un futur pret immo."
        }
      ]
    },
    {
      "file": "gta-6-fuites-rockstar-cybersecurite-assurance.html",
      "audience": "france",
      "section": "actu",
      "tag": "GTA 6 & cyber",
      "tagClass": "tag-actu",
      "themes": [
        "gaming"
      ],
      "title": "Fuites GTA 6 chez Rockstar : cyberattaques, streamers et assurances en France",
      "description": "Fuites gameplay GTA VI, DMCA Take-Two : ce que ca enseigne sur la cybersécurité. Habitation, RC pro et materiel pour createurs en France.",
      "meta": "8 min · Aout 2026",
      "cardExcerpt": "Fuites Rockstar : et votre setup / activite, sont-ils couverts ?",
      "cta": {
        "href": "../landings/questionnaire.html?need=rc-pro&journey=standard&utm_source=blog&utm_medium=actu_daily&utm_campaign=rc-pro&utm_content=gta6-cyber",
        "label": "Questionnaire RC Pro createur"
      },
      "heroImage": {
        "src": "./images/streaming/twitch-live-stream-setup.png",
        "alt": "Setup streaming Twitch — ecrans et micro",
        "caption": "Streamer day-one : materiel + comptes + revenus — trois couches de risque."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Les fuites <strong>GTA 6</strong> d'aout 2026 rappellent une evidence : meme un studio comme <strong>Rockstar</strong> peut voir des builds ou des images circuler hors controle. Pour un createur, un freelance ou un commerce en <strong>France</strong>, la lecon n'est pas « comment spoiler » — c'est <strong>que vaut votre couverture</strong> si un PC est pirate, un compte Twitch vole, ou un disque dur rempli de projets disparait."
        },
        {
          "type": "gallery",
          "label": "Setup createur : trois angles a assurer",
          "items": [
            {
              "src": "./images/streaming/twitch-live-stream-setup.png",
              "alt": "Bureau streamer dual monitor",
              "caption": "Materiel — plafonds habitation / MRPro"
            },
            {
              "src": "./images/streaming/tiktok-youtube-shorts-live.png",
              "alt": "Live vertical smartphone",
              "caption": "Comptes &amp; monétisation — cyber + prevoyance"
            },
            {
              "src": "./images/gta6/gta6-vice-city-02.jpg",
              "alt": "GTA VI Vice City",
              "caption": "Contenu day-one — risque de spoiler vs valeur du setup"
            }
          ]
        },
        {
          "type": "h2",
          "text": "1. Fuite studio ≠ votre risque, mais le meme type de faille"
        },
        {
          "type": "p",
          "text": "Acces non autorise, build ancien, diffusion virale : cote joueur, le risque courant est plus humble — <strong>vol de compte</strong>, ransomware sur le PC gaming, phishing « precommande GTA ». Les DMCA de Take-Two montrent la valeur du contenu ; votre <strong>HDD de VODs</strong> et vos identifiants ont aussi une valeur, meme sans etre Rockstar."
        },
        {
          "type": "h2",
          "text": "2. Habitation : PC, console, disques — plafonds a jour"
        },
        {
          "type": "p",
          "text": "Avant le day-one, beaucoup achètent ecran, SSD, capture card. Verifiez les <strong>plafonds appareils</strong> de la multirisque habitation. Un degat des eaux ou un cambriolage sur 4 000 € de setup depasse souvent le forfait « informatique » de base. Guide : <a href=\"./gta-6-sortie-assurance-gaming-materiel.html\">assurer son materiel GTA 6</a>."
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "3. Streamer / YouTubeur : RC pro et cyber"
        },
        {
          "type": "p",
          "text": "Si vous etes monétise (Twitch, YouTube, TikTok Live), une <strong>RC professionnelle</strong> et parfois une garantie <strong>cyber</strong> (frais de notification, restauration de donnees) protegent mieux qu'une simple MRH. Voir aussi <a href=\"./assurance-streamer-gaming-setup-materiel.html\">assurance streamer &amp; gaming</a>."
        },
        {
          "type": "ul",
          "items": [
            "2FA partout (plateformes, store, banque).",
            "Backup hors PC (NAS ou cloud chiffre) des projets.",
            "Ne pas installer de « build leak » : malware + illegalite.",
            "Declarer l'activite si revenus reguliers (AE / societe)."
          ]
        },
        {
          "type": "h2",
          "text": "4. Lien avec le budget et le credit"
        },
        {
          "type": "p",
          "text": "Remplacer un setup vole sans assurance, c'est souvent un <strong>credit conso</strong> d'urgence — plus cher qu'une bonne MRH. Mieux vaut calibrer les plafonds maintenant que de financer a la hate apres sinistre. Si un pret immo est en vue, evitez tout nouvel endettement pour du materiel non assure : <a href=\"./gta-6-pret-immobilier-budget-gaming.html\">GTA 6 et pret immobilier</a>."
        }
      ],
      "related": [
        {
          "href": "./assurance-streamer-gaming-setup-materiel.html",
          "label": "Assurance streamer"
        },
        {
          "href": "./gta-6-sortie-assurance-gaming-materiel.html",
          "label": "Materiel GTA 6"
        },
        {
          "href": "./gta-6-fuites-cyberleek-memecoin-arnaque-france.html",
          "label": "Fuites &amp; memecoin"
        },
        {
          "href": "../assurance-habitation/",
          "label": "Habitation"
        }
      ],
      "faq": [
        {
          "q": "L'assurance habitation couvre-t-elle un ransomware ?",
          "a": "Rarement par defaut. Certaines options cyber ou contrats pro couvrent restauration et frais. Lisez les exclusions."
        },
        {
          "q": "Un streamer auto-entrepreneur a-t-il besoin d'une RC pro ?",
          "a": "Souvent oui des qu'il y a sponsors, formations ou evenements — la RC vie privee ne suffit pas toujours."
        },
        {
          "q": "Regarder une fuite GTA 6 expose-t-il mon PC ?",
          "a": "Une video YouTube legitime peu. En revanche, telecharger un « build » depuis un forum inconnu est un vecteur malware classique."
        }
      ]
    },
    {
      "file": "gta-6-leak-netflix-extended-look-precommande-budget.html",
      "audience": "france",
      "section": "finance",
      "tag": "GTA 6 & credit conso",
      "tagClass": "tag-actu",
      "themes": [
        "gaming",
        "emprunteur"
      ],
      "title": "Apres les fuites GTA 6 : Extended Look Netflix et budget precommande en France",
      "description": "Fuites aout 2026 puis Extended Look Netflix : gerer la hype sans credit toxique. TAEG, endettement et alternatives comptant en France.",
      "meta": "8 min · Aout 2026",
      "cardExcerpt": "Hype fuites + Netflix : precommander sans casser le budget.",
      "cta": {
        "href": "../landings/questionnaire.html?need=conso&journey=standard&utm_source=blog&utm_medium=actu_daily&utm_campaign=conso&utm_content=gta6-leak-preco",
        "label": "Simulation credit conso (3 min)"
      },
      "heroImage": {
        "src": "./images/gta6/gta6-vice-city-02.jpg",
        "alt": "GTA VI — Vice City la nuit",
        "caption": "GTA VI — Vice City. Capture officielle Rockstar Games."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Les fuites <strong>GTA 6</strong> d'aout 2026 (clips Cyberleek, carte, gameplay) tombent pile avant un <strong>Extended Look</strong> prevu sur Netflix. Resultat : la hype remonte, les paniers PS5 Pro + jeu aussi. En <strong>France</strong>, la question n'est pas « faut-il regarder les leaks » — c'est <strong>comment precommander sans detruire son reste a vivre</strong> ni un futur dossier de <strong>pret immobilier</strong>."
        },
        {
          "type": "figure",
          "src": "./images/gta6/gta6-lucia-01.jpg",
          "alt": "GTA VI — Lucia",
          "caption": "Precommande apres fuites : comparez le cout total, pas la hype."
        },
        {
          "type": "h2",
          "text": "1. Timeline : fuites → teaser officiel → sortie"
        },
        {
          "type": "ul",
          "items": [
            "<strong>Mi-aout 2026</strong> : videos / images non officielles, DMCA Rockstar–Take-Two.",
            "<strong>Fin aout 2026</strong> : Extended Look Netflix (communication officielle).",
            "<strong>Novembre 2026</strong> (annonce studio) : fenetre de sortie visee — sujet a confirmation.",
            "Entre les deux : precommandes digitales, bundles console, tentations de credit magasin."
          ]
        },
        {
          "type": "h2",
          "text": "2. Regle d'or : la hype n'est pas un TAEG"
        },
        {
          "type": "p",
          "text": "Un vendeur peut afficher « a partir de 30 €/mois ». Ce qui compte, c'est le <strong>TAEG</strong>, la duree et le <strong>montant total du</strong>. Cadre legal : Code de la consommation, fiche precontractuelle, retractation 14 jours a distance. Details : <a href=\"./gta-6-precommande-ps5-pro-credit-conso-france.html\">credit conso GTA 6 / PS5 Pro</a>."
        },
        {
          "type": "p",
          "text": "Pour un panier ~1 000 €, voyez nos <a href=\"./gta-6-ps5-pro-budget-1000-euros-pret-conso.html\">mensualites simulees</a> et le <a href=\"./pret-conso-gaming-ps5-pro-gta6-comparatif-2026.html\">comparatif pret perso / magasin / 3x</a>."
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "3. Trois profils apres les fuites"
        },
        {
          "type": "ul",
          "items": [
            "<strong>Deja une PS5</strong> : precommander seulement le jeu (+ manette eventuelle). Budget 80–200 € — souvent epargne, pas credit.",
            "<strong>Upgrade console</strong> : epargner jusqu'a l'Extended Look officiel pour confirmer les besoins techniques, puis comparer les offres.",
            "<strong>Projet immo dans l'annee</strong> : zero nouveau credit conso. La banque additionne les mensualites — voir <a href=\"./gta-6-pret-immobilier-budget-gaming.html\">GTA 6 et pret immo</a>."
          ]
        },
        {
          "type": "h2",
          "text": "4. Pieges lies aux fuites"
        },
        {
          "type": "ul",
          "items": [
            "Sites « preco early leak » = phishing classique.",
            "Memecoin « pour soutenir les leakers » = speulation, pas un jeu — <a href=\"./gta-6-fuites-cyberleek-memecoin-arnaque-france.html\">guide arnaque memecoin</a>.",
            "Credit magasin + assurance casse imposee : refusez si redondant avec l'habitation.",
            "Payer un build pirate : illegal + malware malware (voir <a href=\"./gta-6-fuites-rockstar-cybersecurite-assurance.html\">cyber &amp; assurance</a>)."
          ]
        },
        {
          "type": "h2",
          "text": "5. Apres achat : habitation"
        },
        {
          "type": "p",
          "text": "Console neuve = capital mobilier a declarer. Vol a la livraison, degat des eaux : verifiez plafonds et franchises. <a href=\"./gta-6-sortie-assurance-gaming-materiel.html\">Assurer son setup GTA 6</a>."
        }
      ],
      "related": [
        {
          "href": "./gta-6-fuites-cyberleek-memecoin-arnaque-france.html",
          "label": "Fuites &amp; memecoin"
        },
        {
          "href": "./gta-6-ps5-pro-budget-1000-euros-pret-conso.html",
          "label": "Budget 1 000 €"
        },
        {
          "href": "./pret-conso-gaming-ps5-pro-gta6-comparatif-2026.html",
          "label": "Comparatif credits"
        },
        {
          "href": "../nos-services.html",
          "label": "Credit consommation"
        }
      ],
      "faq": [
        {
          "q": "Faut-il precommander avant l'Extended Look Netflix ?",
          "a": "Pas obligatoire. Attendre le teaser officiel evite d'acheter un bundle inutile. Les stocks day-one restent souvent accessibles en digital."
        },
        {
          "q": "Un credit conso pour GTA 6 bloque-t-il un pret immo ?",
          "a": "Il augmente le taux d'endettement tant qu'il court. Si vous achetez dans les 6–12 mois, preferez epargner ou reporter."
        },
        {
          "q": "Les fuites changent-elles le prix du jeu ?",
          "a": "Non. Le prix de vente est fixe par l'editeur / le distributeur. La hype change surtout le comportement d'achat impulsif."
        }
      ]
    },
    {
      "file": "piratage-impots-dgfip-phishing-vigilance-banque.html",
      "audience": "france",
      "section": "actu",
      "tag": "Piratage impots",
      "tagClass": "tag-actu",
      "themes": [
        "emprunteur"
      ],
      "title": "Piratage des impots (DGFiP) : phishing, banques et gestes a faire en France",
      "description": "Aout 2026 : fuite de donnees fiscales DGFiP (~678 000 usagers). Comment savoir si vous etes concerne, eviter le phishing et securiser comptes bancaires.",
      "meta": "8 min · Aout 2026",
      "cardExcerpt": "Fisc pirate : vigilance phishing et banque, pas de panique.",
      "cta": {
        "href": "../landings/rappel.html?need=banque&utm_source=blog&utm_medium=actu_daily&utm_campaign=banque&utm_content=piratage-dgfip",
        "label": "Rappel banque & vigilance"
      },
      "heroImage": {
        "src": "./images/finance/budget-famille.jpg",
        "alt": "Budget famille et documents fiscaux",
        "caption": "Donnees fiscales volees : le risque principal pour vous, c'est l'usurpation et le phishing."
      },
      "blocks": [
        {
          "type": "p",
          "text": "En aout 2026, la <strong>Direction generale des Finances publiques (DGFiP)</strong> a confirme des acces illegitimes a son systeme d'information (juin–juillet), revendiques ensuite en ligne. Selon le communique officiel, environ <strong>678 000 particuliers et professionnels</strong> sont concernes : revenu fiscal de reference, quotient familial, taux de prelevement a la source, et pour les entreprises raison sociale / SIREN. Les espaces particuliers sur impots.gouv.fr et vos <strong>mots de passe usagers n'ont pas ete compromises</strong> selon Bercy — mais vos donnees peuvent servir a des <strong>arnaques ciblees</strong>."
        },
        {
          "type": "figure",
          "src": "./images/finance/signature-pret.jpg",
          "alt": "Signature de documents financiers",
          "caption": "Si la DGFiP vous contacte : verifiez l'expediteur. Les faux mails « fisc » explosent apres une fuite."
        },
        {
          "type": "h2",
          "text": "1. Ce qui a fuit (et ce qui n'a pas fuit)"
        },
        {
          "type": "ul",
          "items": [
            "<strong>Extrait</strong> : donnees fiscales (RFR, quotient, taux PAS), donnees pro (SIREN…), et consultation de donnees <strong>cadastrales</strong> (adresses, surfaces).",
            "<strong>Non compromis</strong> (selon DGFiP) : identifiants / mots de passe des usagers, espaces Finances publiques particuliers et pro.",
            "<strong>Mode operatoire</strong> : usurpation d'identifiants d'un agent / tiers habilite — pas un piratage de votre compte personnel.",
            "La DGFiP a saisi la <strong>CNIL</strong>, depose plainte, et contacte individuellement les personnes touchees (mail ou courrier)."
          ]
        },
        {
          "type": "h2",
          "text": "2. Comment savoir si vous etes concerne ?"
        },
        {
          "type": "p",
          "text": "Ne telechargez pas d'outil miracle « verifier fuite fisc ». Attendez le <strong>message officiel DGFiP</strong> (ou consultez uniquement impots.gouv.fr / les canaux annonces par Bercy). Tout SMS ou mail qui demande de « revalider votre compte » avec un lien suspect = <strong>phishing</strong>."
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "3. Gestes banque & epargne (priorite 48 h)"
        },
        {
          "type": "ul",
          "items": [
            "Activer les <strong>alertes SMS / app</strong> sur virements et nouveaux beneficiaires.",
            "Verifier l'historique : prelevements inconnus, ouverture de credit, changement d'adresse.",
            "Ne jamais communiquer un code OTP, meme si l'appel dit « impots » ou « banque ».",
            "En cas de doute : appeler le numero au dos de votre carte, pas celui du mail.",
            "Si fraude avérée : opposition, depot de plainte, et signalement a votre banque (delais de contestation)."
          ]
        },
        {
          "type": "h2",
          "text": "4. Lien avec pret immobilier et assurance"
        },
        {
          "type": "p",
          "text": "Un revenu fiscal ou un taux de PAS divulgué ne change pas votre contrat d'assurance. En revanche, une <strong>usurpation d'identite</strong> peut compliquer un dossier de <strong>pret immobilier</strong> (fausse demande de credit a votre nom). Surveillez vos fichiers et votre boite mail bancaire. Pour un projet en cours : <a href=\"../landings/credit-immo.html\">etude pret immo</a> avec pieces a jour."
        },
        {
          "type": "p",
          "text": "Deux autres fuites ont ete evoquees cote administration (fichiers cadastraux, portail successions) : voir aussi notre guide <a href=\"./piratage-fisc-cadastre-habitation-immobilier.html\">cadastre &amp; habitation</a> et, pour les independants, <a href=\"./piratage-dgfip-professionnels-rc-pro-cyber.html\">pro &amp; RC cyber</a>."
        }
      ],
      "related": [
        {
          "href": "./piratage-fisc-cadastre-habitation-immobilier.html",
          "label": "Cadastre &amp; habitation"
        },
        {
          "href": "./piratage-dgfip-professionnels-rc-pro-cyber.html",
          "label": "Pros &amp; cyber"
        },
        {
          "href": "../banque/",
          "label": "Banque"
        },
        {
          "href": "../landings/credit-immo.html",
          "label": "Credit immobilier"
        }
      ],
      "faq": [
        {
          "q": "Dois-je changer mon mot de passe impots.gouv.fr ?",
          "a": "Selon la DGFiP, les mots de passe usagers n'ont pas ete compromises. Renforcer le mot de passe et activer la double authentification reste une bonne hygiene."
        },
        {
          "q": "Un mail « DGFiP — vos donnees ont fuit » est-il forcement officiel ?",
          "a": "Non. Attendez le canal annonce par Bercy. Ne cliquez pas sur les liens : allez vous-meme sur le site officiel."
        },
        {
          "q": "La fuite impacte-t-elle mon assurance emprunteur ?",
          "a": "Pas directement. Le risque est plutot fraude / usurpation. Signalez toute demande de credit non sollicitee."
        }
      ]
    },
    {
      "file": "piratage-fisc-cadastre-habitation-immobilier.html",
      "audience": "france",
      "section": "actu",
      "tag": "Piratage & immo",
      "tagClass": "tag-actu",
      "themes": [
        "emprunteur"
      ],
      "title": "Piratage du fisc : donnees cadastrales, habitation et vigilance immobiliere",
      "description": "Fuite DGFiP aout 2026 : adresses et surfaces consultees. Ce que ca change pour proprietaires, locataires et dossiers de pret en France.",
      "meta": "8 min · Aout 2026",
      "cardExcerpt": "Cadastre expose : habitation, adresse et pret immo.",
      "cta": {
        "href": "../landings/questionnaire.html?need=habitation&journey=standard&utm_source=blog&utm_medium=actu_daily&utm_campaign=habitation&utm_content=piratage-cadastre",
        "label": "Questionnaire habitation (3 min)"
      },
      "heroImage": {
        "src": "./images/finance/credit-immo-cles.jpg",
        "alt": "Cles de maison et credit immobilier",
        "caption": "Adresses et surfaces : la fuite cadastrale renforce le besoin de vigilance anti-fraude."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Outre les donnees fiscales, les investigations autour du <strong>piratage DGFiP</strong> (aout 2026) ont confirme la consultation de <strong>donnees cadastrales</strong> : adresses et surfaces de biens. Une seconde vague a vise des fichiers cadastraux (centaines de milliers de particuliers selon la presse / Bercy). Pour un proprietaire ou un acheteur en <strong>France</strong>, l'enjeu n'est pas « le plan cadastral est secret » (beaucoup d'infos sont deja publiques) — c'est le <strong>couplage</strong> adresse + revenus + composition du foyer, ideal pour du phishing ou de la fraude documentaire."
        },
        {
          "type": "h2",
          "text": "1. Pourquoi le cadastre interesse les fraudeurs"
        },
        {
          "type": "ul",
          "items": [
            "Cibler des foyers avec patrimoine immobilier visible.",
            "Personnaliser un faux mail « taxe fonciere », « DPE obligatoire », « aide renovation ».",
            "Tenter une <strong>fraude a la fausse agence</strong> ou un faux notaire sur une vente.",
            "Usurper une identite pour une demande de pret ou une location."
          ]
        },
        {
          "type": "h2",
          "text": "2. Habitation : ce qu'il faut verifier maintenant"
        },
        {
          "type": "p",
          "text": "La fuite ne remplace pas un sinistre. En revanche, apres une vague d'arnaques, certains foyers se font voler (cambriolage « sur info ») ou paient un faux artisan. Verifiez : plafonds mobilier, garantie vol, franchise, et que votre <strong>adresse de correspondance</strong> assureur est a jour. <a href=\"../assurance-habitation/\">Guide habitation</a> · <a href=\"../landings/questionnaire.html?need=habitation&journey=standard\">questionnaire 3 min</a>."
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "3. Vente / achat en cours : redoubler de prudence"
        },
        {
          "type": "ul",
          "items": [
            "Ne versez jamais d'acompte hors sequestre notaire / compte sequestre officiel.",
            "Confirmez tout changement d'IBAN notaire par un appel au cabinet (numero connu).",
            "Refusez les « urgences fiscales » par SMS liees a votre adresse.",
            "Pour un financement : pieces d'identite et RIB verifies avec votre courtier — <a href=\"../landings/credit-immo.html\">credit immo</a>."
          ]
        },
        {
          "type": "h2",
          "text": "4. Successions : troisieme brèche evoquee"
        },
        {
          "type": "p",
          "text": "Bercy a egalement evoque un acces au portail des <strong>successions vacantes</strong>, presente comme moins sensible (annonces proches du public). Si vous gerez une succession ou un bien en indivision, restez vigilant sur les faux courriers « deblocage heritage ». Lien utile : articles succession / vente heritiers sur le blog, et rappel <a href=\"./piratage-impots-dgfip-phishing-vigilance-banque.html\">phishing &amp; banque</a>."
        },
        {
          "type": "h2",
          "text": "5. PNO et bailleurs"
        },
        {
          "type": "p",
          "text": "Si vous louez, l'adresse du bien + profil fiscal du bailleur peuvent alimenter des arnaques locatives (faux locataires, faux quittancements). Une <strong>PNO</strong> a jour ne bloque pas le phishing, mais couvre les vrais sinistres pendant que vous gerez la fraude. <a href=\"../landings/questionnaire.html?need=pno&journey=standard\">Questionnaire PNO</a>."
        }
      ],
      "related": [
        {
          "href": "./piratage-impots-dgfip-phishing-vigilance-banque.html",
          "label": "Piratage DGFiP &amp; banque"
        },
        {
          "href": "./pno-bailleur-proprietaire-non-occupant.html",
          "label": "PNO bailleur"
        },
        {
          "href": "../assurance-habitation/",
          "label": "Assurance habitation"
        },
        {
          "href": "../landings/credit-immo.html",
          "label": "Pret immobilier"
        }
      ],
      "faq": [
        {
          "q": "Le cadastre etait deja public — pourquoi s'inquieter ?",
          "a": "Parce que le couplage avec revenu fiscal et taux de PAS permet des arnaques beaucoup plus convaincantes."
        },
        {
          "q": "Dois-je changer d'assurance habitation apres la fuite ?",
          "a": "Pas automatiquement. Verifiez plafonds, vol, et mettez a jour vos coordonnees. Changez si le contrat est sous-dimensionne."
        },
        {
          "q": "Un acheteur peut-il se faire refuser un pret a cause de la fuite ?",
          "a": "Non du seul fait d'etre dans le perimetre. En revanche, une fraude a votre identite peut creer du bruit dans les fichiers — surveillez."
        }
      ]
    },
    {
      "file": "piratage-dgfip-professionnels-rc-pro-cyber.html",
      "audience": "france",
      "section": "actu",
      "tag": "Piratage & pro",
      "tagClass": "tag-actu",
      "themes": [],
      "title": "Piratage DGFiP : independants et TPE — RC pro, cyber et donnees clients",
      "description": "Professionnels dans la fuite fiscale 2026 (SIREN, raison sociale) : risques phishing, usurpation, et assurances RC pro / cyber en France.",
      "meta": "8 min · Aout 2026",
      "cardExcerpt": "TPE dans la fuite fisc : proteger activite et clients.",
      "cta": {
        "href": "../landings/questionnaire.html?need=rc-pro&journey=standard&utm_source=blog&utm_medium=actu_daily&utm_campaign=rc-pro&utm_content=piratage-dgfip-pro",
        "label": "Questionnaire RC Pro (3 min)"
      },
      "heroImage": {
        "src": "./images/finance/budget-famille.jpg",
        "alt": "Documents professionnels et budget",
        "caption": "SIREN et raison sociale exposes : anticipez le phishing « URSSAF / impot »."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Le piratage de la <strong>DGFiP</strong> (aout 2026) touche aussi des <strong>professionnels</strong> : raison sociale, SIREN, et donnees fiscales liees. Vos identifiants espace pro n'auraient pas ete voles selon l'administration — mais un fraudeur qui connait votre SIREN + votre CA approxime peut vous envoyer de faux avis de mise en demeure, de faux remboursements, ou usurper votre societe aupres de clients."
        },
        {
          "type": "h2",
          "text": "1. Risques concrets pour une TPE / un independant"
        },
        {
          "type": "ul",
          "items": [
            "Mails « DGFiP / URSSAF / expert-comptable » avec piece jointe malware.",
            "Fausse facture fournisseur apres usurpation d'identite de votre boite mail.",
            "Demande de RIB « pour remboursement d'impot ».",
            "Atteinte a la reputation si des clients recoivent des messages en votre nom."
          ]
        },
        {
          "type": "h2",
          "text": "2. RC pro : ce qu'elle couvre (et pas)"
        },
        {
          "type": "p",
          "text": "La <strong>RC professionnelle</strong> protege surtout les dommages causes a des tiers dans le cadre de votre activite. Elle ne remplace pas une garantie <strong>cyber</strong> (frais de notification CNIL, restauration de donnees, perte d'exploitation apres ransomware). Apres une vague nationale de phishing, c'est le moment de verifier les deux. <a href=\"../landings/questionnaire.html?need=rc-pro&journey=standard\">Questionnaire RC Pro</a>."
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "3. Checklist securite 24 h"
        },
        {
          "type": "ul",
          "items": [
            "2FA sur messagerie, espace impots pro, banque pro.",
            "Procedure de validation des changements d'IBAN fournisseurs (appel vocal).",
            "Sauvegardes hors poste (cloud / NAS) des factures et bilans.",
            "Former l'equipe : aucun lien « fisc » depuis un SMS.",
            "Si concerne : conserver le courrier DGFiP ; preparer une reponse type clients inquietets."
          ]
        },
        {
          "type": "h2",
          "text": "4. Lien banque, tresorerie, credit"
        },
        {
          "type": "p",
          "text": "Surveillez le compte pro : virements, prelevements SEPA, demandes de credit. Une fraude qui vide la tresorerie peut forcer un <strong>credit de tresorerie</strong> d'urgence — plus cher qu'une bonne hygiene + assurance adaptee. Rappel particulier : <a href=\"./piratage-impots-dgfip-phishing-vigilance-banque.html\">gestes banque apres la fuite</a>. Createurs / streamers : voir aussi l'angle <a href=\"./gta-6-fuites-rockstar-cybersecurite-assurance.html\">cyber &amp; setup</a>."
        },
        {
          "type": "h2",
          "text": "5. Prevoyance : si l'activite s'arrete apres incident"
        },
        {
          "type": "p",
          "text": "Un ransomware ou une fraude lourde peut stopper le chiffre d'affaires. La prevoyance TNS ne couvre pas le cyber, mais protege vos revenus en cas d'arret de travail lie au stress / burnout apres crise. Bilan utile en meme temps que la RC. <a href=\"../landings/devis.html?need=prevoyance\">Etudier la prevoyance</a>."
        }
      ],
      "related": [
        {
          "href": "./piratage-impots-dgfip-phishing-vigilance-banque.html",
          "label": "Particuliers &amp; phishing"
        },
        {
          "href": "./piratage-fisc-cadastre-habitation-immobilier.html",
          "label": "Cadastre &amp; immo"
        },
        {
          "href": "./rc-pro-freelance-artisan-guide.html",
          "label": "RC Pro freelance"
        },
        {
          "href": "../landings/questionnaire.html?need=rc-pro&journey=standard",
          "label": "Questionnaire RC Pro"
        }
      ],
      "faq": [
        {
          "q": "Mon SIREN etait deja public — suis-je vraiment expose ?",
          "a": "Le SIREN seul l'est. Le risque augmente quand il est croise avec des donnees fiscales et une campagne de phishing nationale."
        },
        {
          "q": "Une assurance cyber est-elle obligatoire ?",
          "a": "Non en general pour une TPE, mais elle devient pertinente des que vous stockez des donnees clients ou dependez du numerique au quotidien."
        },
        {
          "q": "Que repondre a un client inquiet ?",
          "a": "Expliquez que vos identifiants espace pro n'ont pas ete voles selon la DGFiP, precisez vos canaux officiels, et ne demandez jamais de paiement via un nouveau RIB sans confirmation."
        }
      ]
    },
    {
      "file": "robot-cuiseur-pret-conso-credit-cuisine.html",
      "section": "finance",
      "tag": "Cuisine & credit conso",
      "tagClass": "tag-immo",
      "themes": [
        "emprunteur"
      ],
      "title": "Robot cuiseur Thermomix ou Ninja : payer comptant ou pret conso en 2026 ?",
      "description": "Robot cuiseur a 1 200–1 600 € : comparatif pret personnel, 3x sans frais, mensualites — sans fragiliser votre pret immo.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "Robot cuiseur : pret conso ou epargne — le calcul.",
      "cta": {
        "href": "../landings/questionnaire.html?need=conso&journey=standard&utm_source=blog&utm_medium=finance&utm_campaign=robot-cuiseur",
        "label": "Etude credit conso cuisine"
      },
      "heroImage": {
        "src": "./images/cuisine/robot-cuiseur-cuisine.jpg",
        "alt": "Cuisine equipee d'un robot cuiseur et plan de travail",
        "caption": "Robot cuiseur premium : comparer le cout total du financement."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Un <strong>robot cuiseur</strong> (Thermomix, Ninja Foodi, Moulinex Cookeo Connect, Kenwood…) coute souvent <strong>1 200 a 1 600 €</strong> neuf. Faut-il payer comptant, passer au <strong>3x sans frais</strong> ou souscrire un <strong>pret consommation</strong> ? Voici le calcul, le cadre legal en France, et le lien avec votre <strong>assurance habitation</strong> une fois l'appareil livre. <a href=\"../landings/questionnaire.html?need=conso&journey=standard\"><strong>Questionnaire credit conso</strong></a> · <a href=\"../landings/devis.html?need=habitation\">devis habitation</a>."
        },
        {
          "type": "gallery",
          "label": "Robot cuiseur : recettes, budget, assurance",
          "items": [
            {
              "src": "./images/cuisine/robot-cuiseur-cuisine.jpg",
              "alt": "Robot cuiseur sur plan de travail cuisine moderne",
              "caption": "Appareil premium — capital mobilier a declarer en MRH"
            },
            {
              "src": "./images/cuisine/friteuse-cuisine.jpg",
              "alt": "Cuisine active — cuisson et prevention",
              "caption": "Recettes maison — risque surchauffe si appareil defectueux"
            },
            {
              "src": "./images/finance/budget-famille.jpg",
              "alt": "Budget famille et credit consommation",
              "caption": "Mensualite vs epargne de precaution"
            }
          ]
        },
        {
          "type": "h2",
          "text": "Recette express robot : veloute de courgettes (4 personnes)"
        },
        {
          "type": "p",
          "text": "600 g courgettes, 1 pomme de terre, 1 oignon, 50 cl bouillon, sel, poivre, 1 filet de creme (option). Mode <strong>soupe 15 min</strong> ou 100 °C / vitesse 1, puis mixer 1 min. Cout ingredients ~4 € — l'interet du robot est le <strong>gain de temps</strong>, pas l'economie sur la recette elle-meme."
        },
        {
          "type": "h2",
          "text": "Budget robot cuiseur : ce qui fait monter la facture"
        },
        {
          "type": "ul",
          "items": [
            "Modele haut de gamme neuf : 1 200–1 600 €",
            "Accessoires (panier vapeur, couteaux, bol supplementaire) : +80–200 €",
            "Reconditionne / occasion : 700–1 000 € (verifier garantie)",
            "Extension garantie magasin : +100–150 € (utile ? comparez MRH)"
          ]
        },
        {
          "type": "h2",
          "text": "Pret conso vs comptant : tableau mensualites (1 400 €)"
        },
        {
          "type": "figure",
          "src": "./images/finance/signature-pret.jpg",
          "alt": "Signature contrat pret consommation",
          "caption": "Lisez le TAEG et le montant total du avant de signer."
        },
        {
          "type": "ul",
          "items": [
            "<strong>Comptant</strong> : 0 € d'interets — gardez au moins 3 mois de charges en epargne apres achat",
            "<strong>12 mois</strong> a ~5,5 % TAEG : ~120 €/mois (total ~1 440 €)",
            "<strong>24 mois</strong> a ~6 % TAEG : ~62 €/mois (total ~1 490 €)",
            "<strong>3x sans frais</strong> (si vrai debit differe) : ~467 €/mois — sans interets si conforme"
          ]
        },
        {
          "type": "h2",
          "text": "Cadre legal : credit conso autorise pour l'electromenager"
        },
        {
          "type": "p",
          "text": "Comme pour une console ou un smartphone, un <strong>robot cuiseur</strong> est un bien de consommation courante finançable par <strong>pret personnel</strong> ou <strong>credit affecte</strong> (Code de la consommation). L'organisme doit respecter le taux d'usure, remettre une fiche precontractuelle et evaluer votre solvabilite. Retractation 14 jours pour les contrats a distance."
        },
        {
          "type": "h2",
          "text": "Pret immo en cours : attention endettement"
        },
        {
          "type": "p",
          "text": "Un credit de 1 400 € sur 24 mois (~62 €/mois) entre dans votre <strong>taux d'endettement</strong> si vous montez un dossier immobilier. Alternative : epargner 3–4 mois, acheter reconditionne, ou liberer du budget via une <strong>delegation assurance emprunteur</strong> (loi Lemoine). Voir <a href=\"./assurance-emprunteur-loi-lemoine-2026.html\">guide Lemoine</a>."
        },
        {
          "type": "h2",
          "text": "Assurance habitation : couvrir le robot apres achat"
        },
        {
          "type": "p",
          "text": "Vol, incendie (surchauffe rare), degats des eaux voisin : votre <strong>MRH</strong> indemnise le contenu selon plafonds « appareils electromenagers ». Mettez a jour le capital mobilier et conservez la facture. En cas de dommage electrique, la garantie legalite de conformite (2 ans) s'applique cote vendeur — pas l'assurance habitation."
        },
        {
          "type": "bridge"
        }
      ],
      "related": [
        {
          "href": "./renovation-cuisine-pret-travaux-assurance.html",
          "label": "Renovation cuisine complete"
        },
        {
          "href": "./gta-6-precommande-ps5-pro-credit-conso-france.html",
          "label": "Credit conso : cadre legal"
        },
        {
          "href": "../landings/questionnaire.html?need=conso&journey=standard",
          "label": "Questionnaire conso"
        }
      ],
      "faq": [
        {
          "q": "Le 3x sans frais est-il toujours sans interets ?",
          "a": "Pas forcement : verifiez s'il s'agit d'un debit differe ou d'un credit avec TAEG. Le cout total doit etre egal au prix comptant."
        },
        {
          "q": "Assurance habitation ou extension garantie magasin ?",
          "a": "L'extension couvre souvent la panne hors incendie/vol. La MRH couvre le vol et le sinistre. Comparez avant de payer une double assurance."
        }
      ]
    },
    {
      "file": "zelda-ocarina-time-collection-assurance-habitation.html",
      "audience": "international",
      "section": "actu",
      "tag": "Zelda & retro",
      "tagClass": "tag-actu",
      "title": "Zelda Ocarina of Time : collections retro, valeur et assurance habitation",
      "description": "Cartridges, consoles N64, merchandising : proteger une collection gaming vintage avec la bonne assurance.",
      "meta": "6 min · Juin 2026",
      "cardExcerpt": "Collection Zelda : estimez et assurez vos pieces.",
      "cta": {
        "href": "../landings/devis.html?need=habitation",
        "label": "Devis habitation"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Les reeditions, les mods et la nostalgie autour de <strong>The Legend of Zelda: Ocarina of Time</strong> font monter les prix des cartouches, manettes et consoles N64. Une collection peut valoir plusieurs milliers d'euros — souvent <strong>sous-assuree</strong> dans un contrat habitation standard."
        },
        {
          "type": "h2",
          "text": "Inventorier et photographier"
        },
        {
          "type": "p",
          "text": "Listez chaque piece (etat, numero de serie, facture eBay ou Leboncoin). En cas de sinistre, l'assureur indemnise plus vite avec des preuves d'achat et des photos datees."
        },
        {
          "type": "h2",
          "text": "Plafonds mobilier et objets de valeur"
        },
        {
          "type": "p",
          "text": "Au-dela de quelques centaines d'euros par objet, declarez une <strong>valeur agreee</strong> ou une extension « objets precieux ». Le vol simple ou le degat des eaux n'est pas toujours couvert a hauteur reelle sinon."
        },
        {
          "type": "h2",
          "text": "Pret immobilier et patrimoine « invisible »"
        },
        {
          "type": "p",
          "text": "Une collection n'entre pas dans le patrimoine bancaire, mais elle compte pour vous. Si vous achetez un logement, pensez assurance habitation des le jour de l'emménagement — pas apres un premier sinistre."
        }
      ],
      "related": [
        {
          "href": "./gta-6-sortie-assurance-gaming-materiel.html",
          "label": "Assurance gaming"
        },
        {
          "href": "../assurance-habitation/",
          "label": "Assurance habitation"
        },
        {
          "href": "./assurance-habitation-sous-assurance-sinistre.html",
          "label": "Sous-assurance sinistre"
        }
      ]
    },
    {
      "file": "trump-politique-us-taux-pret-assurance-emprunteur.html",
      "audience": "international",
      "section": "finance",
      "tag": "Trump & marches",
      "tagClass": "tag-actu",
      "title": "Trump, marches financiers et pret immobilier en France",
      "description": "Politique americaine, taux, inflation : impact sur votre credit immo et votre assurance emprunteur.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "Trump et les taux : ce que ca change pour votre pret.",
      "cta": {
        "href": "../landings/credit-immo.html",
        "label": "Comparer mon pret"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Chaque cycle autour de <strong>Donald Trump</strong> et de la politique americaine fait bouger les marches : dollar, obligations, parfois les taux europeens. Pour un emprunteur francais, l'effet est indirect mais reel sur le <strong>cout du credit</strong> et la <strong>negociation bancaire</strong>."
        },
        {
          "type": "h2",
          "text": "Taux et timing de signature"
        },
        {
          "type": "p",
          "text": "En periode volatile, les banques peuvent resserrer les conditions ou ajuster les offres de taux fixe. Si votre compromis approche, verrouillez une offre et comparez l'<strong>assurance emprunteur</strong> en parallele — ce n'est pas la banque qui decide du meilleur tarif sante du pret."
        },
        {
          "type": "h2",
          "text": "Assurance emprunteur : stabiliser sa charge"
        },
        {
          "type": "p",
          "text": "Quand les taux montent, chaque euro compte. La delegation d'assurance (loi Lemoine) reduit la mensualite globale sans toucher au capital emprunte."
        },
        {
          "type": "h2",
          "text": "Prevoyance : anticiper l'incertitude economique"
        },
        {
          "type": "p",
          "text": "Chocs macro = risque pour l'emploi et l'activite des independants. Une prevoyance solide protege le remboursement du pret en cas d'arret ou de baisse de revenus."
        },
        {
          "type": "bridge"
        }
      ],
      "related": [
        {
          "href": "./elections-presidentielles-prevoyance-patrimoine.html",
          "label": "Presidentielles & patrimoine"
        },
        {
          "href": "./taux-credit-immobilier-2026-frais-dossier.html",
          "label": "Taux credit 2026"
        },
        {
          "href": "./assurance-emprunteur-loi-lemoine-2026.html",
          "label": "Loi Lemoine"
        }
      ]
    },
    {
      "file": "presidentielle-2027-melenchon-saint-denis-habitation-pret.html",
      "section": "actu",
      "tag": "Presidentielle 2027",
      "tagClass": "tag-actu",
      "title": "Presidentielle 2027, Melenchon et Saint-Denis : habitation et pret immo",
      "description": "Seine-Saint-Denis, debats politiques, pouvoir d'achat : assurer son logement et financer son projet immobilier.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "2027 et Saint-Denis : assurance habitation & pret.",
      "cta": {
        "href": "../landings/questionnaire.html?need=credit-immo&journey=standard",
        "label": "Questionnaire credit immo"
      },
      "blocks": [
        {
          "type": "p",
          "text": "A l'approche de la <strong>presidentielle 2027</strong>, les meetings et la vie politique a <strong>Saint-Denis</strong> (Seine-Saint-Denis) relancent les debats sur le logement, le pouvoir d'achat et l'acces au credit. Pour les habitants et primo-accedants, les questions concretes restent : <strong>assurance habitation</strong>, <strong>assurance emprunteur</strong>, capacite a emprunter."
        },
        {
          "type": "h2",
          "text": "Habitation en Seine-Saint-Denis"
        },
        {
          "type": "p",
          "text": "Vol, degats des eaux, copropriete : verifiez les plafonds RC et le voisinage. En location, l'assurance locataire reste obligatoire ; le proprietaire doit aussi couvrir le batiment (PNO si non occupe)."
        },
        {
          "type": "h2",
          "text": "Pret immobilier et apport"
        },
        {
          "type": "p",
          "text": "Les banques regardent la stabilite des revenus plus que les slogans electoraux. Constituez un dossier solide : epargne, pas d'impayes, assurance emprunteur competitive des la simulation."
        },
        {
          "type": "h2",
          "text": "Prevoyance et incertitude electorale"
        },
        {
          "type": "p",
          "text": "Quel que soit le resultat des urnes, une <strong>prevoyance</strong> individuelle securise le foyer si l'activite professionnelle fluctue. C'est le filet sous le pret immobilier."
        }
      ],
      "related": [
        {
          "href": "./elections-presidentielles-prevoyance-patrimoine.html",
          "label": "Elections & prevoyance"
        },
        {
          "href": "../assurance-habitation/",
          "label": "Assurance habitation"
        },
        {
          "href": "./pret-immo-erreurs-a-eviter.html",
          "label": "Erreurs pret immo"
        }
      ],
      "faq": [
        {
          "q": "La presidentielle change-t-elle mon taux de pret ?",
          "a": "Pas directement. Les taux suivent surtout la politique monetaire europeenne et les marches. En revanche, la periode peut etre plus volatile pour negocier en banque."
        },
        {
          "q": "Suis-je oblige d'assurer mon logement a Saint-Denis ?",
          "a": "Locataire : oui (risques locatifs). Proprietaire occupant : fortement recommande, souvent exige par la banque si pret en cours."
        }
      ]
    },
    {
      "file": "formule-1-grands-prix-assurance-voyage-auto.html",
      "audience": "international",
      "section": "actu",
      "tag": "Formule 1",
      "tagClass": "tag-actu",
      "title": "Formule 1 : assurance voyage, auto et deplacements pour les Grands Prix",
      "description": "Monaco, Spa, departs Europe : annulation, sante, location auto — checklist F1.",
      "meta": "7 min · Juin 2026",
      "cardExcerpt": "Grands Prix F1 : le pack assurance fan.",
      "cta": {
        "href": "../landings/devis.html?need=auto",
        "label": "Assurance auto"
      },
      "blocks": [
        {
          "type": "p",
          "text": "La <strong>Formule 1</strong> entraine des deplacements couteux : billets, hotels, parfois location de voiture entre plusieurs Grands Prix. Un imprévu sanitaire ou un vol de bagages peut couter plus cher que la course elle-meme."
        },
        {
          "type": "h2",
          "text": "Assurance voyage et annulation"
        },
        {
          "type": "p",
          "text": "Verifiez si votre <strong>carte bancaire premium</strong> couvre annulation et retard. Sinon, une assurance voyage evenement couvre billet + hebergement."
        },
        {
          "type": "h2",
          "text": "Sante a l'etranger"
        },
        {
          "type": "p",
          "text": "Carte Europeenne d'assurance maladie (UE) + mutuelle avec bon poste <strong>etranger</strong>. Hors UE, une extension voyage sante est souvent necessaire."
        },
        {
          "type": "h2",
          "text": "Auto et location"
        },
        {
          "type": "p",
          "text": "Franchise de location, conducteur additionnel, pays traverse : lisez le contrat avant de signer au comptoir. Votre assurance auto francaise peut parfois etendre la protection — a verifier."
        },
        {
          "type": "h2",
          "text": "Pret immo : ne pas sacrifier l'epargne pour un week-end F1"
        },
        {
          "type": "p",
          "text": "Si vous etes en phase d'achat immobilier, evitez de vider l'epargne pour un trip F1 : les banques regardent le reste a vivre et l'apport."
        }
      ],
      "related": [
        {
          "href": "./ligue-champions-assurance-voyage-deplacement.html",
          "label": "Assurance voyage (C1)"
        },
        {
          "href": "../assurance-auto/",
          "label": "Assurance auto"
        },
        {
          "href": "../landings/credit-immo.html",
          "label": "Credit immobilier"
        }
      ]
    },
    {
      "file": "darmanin-securite-habitation-assurance-emprunteur.html",
      "section": "actu",
      "tag": "Securite & assurance",
      "tagClass": "tag-actu",
      "title": "Securite, politique publique et assurance habitation : ce qui compte en 2027",
      "description": "Debats sur la securite (Darmanin et sujets d'ordre public) : impact sur habitation, RC et tranquillite des emprunteurs.",
      "meta": "7 min · Juin 2026",
      "cardExcerpt": "Securite du quartier et assurance du logement.",
      "cta": {
        "href": "../landings/devis.html?need=habitation",
        "label": "Devis habitation"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Les discussions autour de la <strong>securite</strong> en France — souvent portees par des figures comme <strong>Gerald Darmanin</strong> dans le debat public — rappellent un point concret : la tranquillite d'un quartier influence la valeur du logement, le cout de l'<strong>assurance habitation</strong> et la serenite pour tenir un <strong>pret immobilier</strong> sur 20 ans."
        },
        {
          "type": "h2",
          "text": "Habitation : vol, vandalisme, RC"
        },
        {
          "type": "p",
          "text": "Une multirisque habitation couvre le vol, parfois le vandalisme et la responsabilite civile si un incident dans votre logement affecte un voisin. Verifiez les exclusions et les plafonds en zone urbaine dense."
        },
        {
          "type": "h2",
          "text": "Emprunteur : proteger le remboursement"
        },
        {
          "type": "p",
          "text": "L'assurance emprunteur n'est pas qu'une formalite banque : en cas d'invalidite ou deces, elle evite de laisser la dette au conjoint. Comparez les garanties ITT/IPT, pas seulement le prix."
        },
        {
          "type": "h2",
          "text": "Achat immobilier : lire le voisinage avant de signer"
        },
        {
          "type": "p",
          "text": "Visitez a differentes heures, renseignez-vous sur la copropriete et les sinistres passes. Un mauvais voisinage ne se corrige pas avec une police d'assurance."
        }
      ],
      "related": [
        {
          "href": "./presidentielle-2027-melenchon-saint-denis-habitation-pret.html",
          "label": "Presidentielle 2027 & logement"
        },
        {
          "href": "./assurance-emprunteur-loi-lemoine-2026.html",
          "label": "Assurance emprunteur"
        },
        {
          "href": "../assurance-habitation/",
          "label": "Assurance habitation"
        }
      ]
    },
    {
      "file": "assurance-habitation-locataire-proprietaire-2026.html",
      "section": "habitat",
      "tag": "Habitation",
      "tagClass": "tag-habitation",
      "title": "Assurance habitation 2026 : locataire, proprietaire, colocation",
      "description": "MRH, risques locatifs, PNO : le guide pour bien couvrir son logement en France.",
      "meta": "8 min · Mai 2026",
      "cardExcerpt": "Locataire ou proprio : les garanties obligatoires.",
      "cta": {
        "href": "../landings/questionnaire.html?need=habitation&journey=standard",
        "label": "Questionnaire habitation"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Locataire, propriétaire occupant ou bailleur : trois statuts, trois logiques d'<strong>assurance habitation</strong>. L'erreur la plus fréquente ? Souscrire un contrat générique sans vérifier les <strong>risques locatifs</strong>, les plafonds mobilier ou la compatibilité colocation."
        },
        {
          "type": "h2",
          "text": "Locataire : l'obligation quasi-systématique"
        },
        {
          "type": "p",
          "text": "Votre bail exige une assurance couvrant au minimum les <strong>risques locatifs</strong> (incendie, dégâts des eaux, explosion). Sans contrat valide, le propriétaire peut résilier le bail ou souscrire à vos frais. Vérifiez aussi la RC vie privée : elle couvre les dommages que vous causez à autrui."
        },
        {
          "type": "h2",
          "text": "Propriétaire occupant : au-delà du minimum"
        },
        {
          "type": "ul",
          "items": [
            "Bâtiment + contenu + RC vie privée",
            "Vol, bris de glace, catastrophes naturelles (selon zones)",
            "Plafonds mobilier : attention aux objets de valeur (bijoux, électronique)",
            "Option protection juridique si litige voisinage ou copropriété"
          ]
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "Colocation et sous-location : clarifier qui est assuré"
        },
        {
          "type": "p",
          "text": "Un contrat par colocataire ou un contrat global : les deux existent. En cas de sinistre, l'assureur veut savoir <strong>qui a causé le dommage</strong> et si chaque chambre est déclarée. Une colocation mal assurée = reste à charge entre colocataires."
        },
        {
          "type": "h2",
          "text": "Combien ça coûte vraiment ?"
        },
        {
          "type": "p",
          "text": "Comptez souvent <strong>120 à 350 € / an</strong> pour un T2/T3 en province, plus en zone à risques (vol, séisme, inondation). Le questionnaire habitation estime votre profil (surface, étage, cave, valeur mobilier) pour éviter le sous-assurance."
        }
      ],
      "related": [
        {
          "href": "../assurance-habitation/",
          "label": "Guide habitation"
        },
        {
          "href": "../assurance-habitation/villes/",
          "label": "Habitation par ville"
        },
        {
          "href": "./pno-bailleur-proprietaire-non-occupant.html",
          "label": "PNO bailleur"
        }
      ]
    },
    {
      "file": "assurance-emprunteur-loi-lemoine-2026.html",
      "section": "habitat",
      "tag": "Emprunteur",
      "tagClass": "tag-habitation",
      "title": "Assurance emprunteur 2026 : loi Lemoine, changer et economiser",
      "description": "Resiliation a tout moment, equivalence de garanties, dossier medical : le guide emprunteur.",
      "meta": "9 min · Mai 2026",
      "cardExcerpt": "Loi Lemoine : reduire le cout de votre pret.",
      "cta": {
        "href": "../landings/questionnaire.html?need=emprunteur&journey=standard",
        "label": "Questionnaire emprunteur"
      },
      "blocks": [
        {
          "type": "p",
          "text": "L'<strong>assurance emprunteur</strong> peut représenter <strong>20 à 35 % du coût total</strong> d'un crédit immobilier. Depuis la <strong>loi Lemoine</strong>, changer d'assureur est plus simple — mais la banque exige une <strong>équivalence de garanties</strong>. C'est là que beaucoup échouent en comparant uniquement le prix mensuel."
        },
        {
          "type": "h2",
          "text": "Ce que la Lemoine change concrètement"
        },
        {
          "type": "ul",
          "items": [
            "Résiliation à tout moment (plus besoin d'attendre l'échéance annuelle)",
            "Suppression du questionnaire médical sous conditions (âge, montant emprunté)",
            "Substitution de garanties si le contrat externe est équivalent",
            "Économie typique : <strong>3 000 à 15 000 €</strong> sur la durée du prêt"
          ]
        },
        {
          "type": "h2",
          "text": "Équivalence : le piège invisible"
        },
        {
          "type": "p",
          "text": "La banque compare décès, PTIA, ITT, IPT, IPP. Un contrat moins cher avec franchise ITT plus longue ou plafond IPT plus bas peut être <strong>refusé</strong>. Un courtier prépare le dossier d'équivalence pour éviter les allers-retours."
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "Méthode en 4 étapes"
        },
        {
          "type": "ul",
          "items": [
            "Récupérer le tableau de garanties exigé par la banque",
            "Chiffrer l'assurance groupe actuelle (TAEG assurance, pas seulement le taux crédit)",
            "Demander 2 à 3 devis délégation avec profil médical identique",
            "Envoyer la substitution avec attestation d'équivalence"
          ]
        }
      ],
      "related": [
        {
          "href": "../assurance-emprunteur/",
          "label": "Assurance emprunteur"
        },
        {
          "href": "../credit-immo/",
          "label": "Credit immobilier"
        },
        {
          "href": "./pret-immo-erreurs-a-eviter.html",
          "label": "Pret immo : erreurs"
        }
      ]
    },
    {
      "file": "pno-bailleur-proprietaire-non-occupant.html",
      "section": "habitat",
      "tag": "PNO",
      "tagClass": "tag-habitation",
      "title": "PNO : assurance proprietaire non occupant pour bailleurs",
      "description": "Louer son bien en toute serenite : garanties PNO, loyers impayes, responsabilite.",
      "meta": "6 min · Mai 2026",
      "cardExcerpt": "Bailleur : la PNO en questions.",
      "cta": {
        "href": "../landings/devis.html?need=pno",
        "label": "Devis PNO"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Vous louez un appartement ou une maison ? L'assurance du locataire ne couvre pas le batiment que vous possedez. La <strong>PNO</strong> comble ce trou."
        },
        {
          "type": "h2",
          "text": "Garanties utiles"
        },
        {
          "type": "ul",
          "items": [
            "Degats des eaux et incendie cote structure",
            "RC proprietaire",
            "Option loyers impayes (GLI)"
          ]
        }
      ],
      "related": [
        {
          "href": "../assurance-habitation/",
          "label": "Habitation & PNO"
        }
      ]
    },
    {
      "file": "feu-friteuse-cuisine-assurance-habitation.html",
      "section": "habitat",
      "tag": "Cuisine & habitation",
      "tagClass": "tag-habitation",
      "themes": [
        "habitat"
      ],
      "title": "Frites maison sans drama : recette, feu de cuisine et assurance habitation",
      "description": "Recette frites au four ou friteuse, prevention feu de graisse, declaration sinistre MRH — devis habitation gratuit.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "Friteuse et feu de cuisine : recette + assurance habitation.",
      "cta": {
        "href": "../landings/devis.html?need=habitation",
        "label": "Devis assurance habitation"
      },
      "heroImage": {
        "src": "./images/cuisine/friteuse-cuisine.jpg",
        "alt": "Cuisine — preparation frites et prevention incendie",
        "caption": "Feu de graisse : reflexes immediats + multirisque habitation a jour."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Les <strong>frites maison</strong> (four, air fryer ou friteuse) restent un classique — mais un <strong>feu de cuisine</strong> part vite quand l'huile surchauffe. Voici une <strong>recette simple</strong>, les reflexes anti-incendie, et ce que couvre votre <strong>assurance habitation</strong> en cas de degats. <a href=\"../landings/devis.html?need=habitation\"><strong>Devis habitation</strong></a> · <a href=\"../landings/questionnaire.html?need=habitation&journey=standard\">questionnaire MRH</a>."
        },
        {
          "type": "gallery",
          "label": "Cuisine : cuire, prevenir, assurer",
          "items": [
            {
              "src": "./images/cuisine/friteuse-cuisine.jpg",
              "alt": "Preparation en cuisine — friture et vigilance",
              "caption": "Friteuse ou poele : ne jamais quitter la cuisine"
            },
            {
              "src": "./images/habitat/sinistre-degats.jpg",
              "alt": "Degats apres sinistre cuisine incendie",
              "caption": "Sinistre — hotte, meubles, peinture : indemnisation MRH"
            },
            {
              "src": "./images/habitat/maison-famille.jpg",
              "alt": "Foyer et assurance habitation famille",
              "caption": "Locataire ou proprietaire : verifier plafonds mobilier"
            }
          ]
        },
        {
          "type": "h2",
          "text": "Recette : frites croustillantes au four (plus safe que la friteuse)"
        },
        {
          "type": "p",
          "text": "Pour 4 personnes : 1 kg de pommes de terre (Agata ou Bintje), 2 c. a soupe d'huile, sel. Eplucher, couper en batons, rincer, secher. Melanger avec l'huile. Four <strong>220 °C</strong> (chaleur tournante), 25–30 min en retournant a mi-cuisson. Variante air fryer : 180 °C, 15–18 min. <strong>Moins de graisse = moins de risque de feu</strong> qu'une friteuse remplie d'huile bouillante."
        },
        {
          "type": "h2",
          "text": "Friteuse classique : 5 regles anti-feux"
        },
        {
          "type": "ul",
          "items": [
            "Huile propre, sans eau (pommes de terre bien seches)",
            "Ne jamais remplir au-dela du maxi indique",
            "Eteindre et debrancher si vous quittez la piece",
            "Extincteur ou couvercle anti-feux a portee — pas d'eau sur un feu de graisse",
            "Hotte et filtres entretenus (depot de graisse = risque incendie)"
          ]
        },
        {
          "type": "h2",
          "text": "Feu de cuisine : que faire en 30 secondes"
        },
        {
          "type": "figure",
          "src": "./images/habitat/sinistre-degats.jpg",
          "alt": "Intervention apres sinistre incendie ou degat des eaux cuisine",
          "caption": "Apres extinction : photos, declaration sinistre, expertise MRH."
        },
        {
          "type": "p",
          "text": "Couper le gaz ou le courant, couvrir avec un <strong>couvercle metallique</strong> ou eteindre avec un <strong>extincteur poudre/CO2</strong> (pas d'eau). Evacuer si le feu se propage, appeler les <strong>pompiers (18 / 112)</strong>. Une fois maitrise : ventiler, ne pas jeter l'huile brulante a l'evier (fuite + degats des eaux)."
        },
        {
          "type": "h2",
          "text": "Assurance habitation : incendie, fumee, RC voisin"
        },
        {
          "type": "p",
          "text": "La <strong>multirisque habitation</strong> couvre en general : degats au logement (murs, hotte, meubles), <strong>contenu</strong> (electromenager), frais de relogement temporaire selon contrat, et la <strong>responsabilite civile</strong> si le feu touche un voisin (immeuble). Verifiez les <strong>plafonds mobilier</strong> et la franchise incendie. Locataire : vous etes responsable envers le proprietaire pour les <strong>risques locatifs</strong>. <a href=\"./assurance-habitation-locataire-proprietaire-2026.html\">Guide locataire / proprietaire</a>."
        },
        {
          "type": "h2",
          "text": "Declarer un sinistre cuisine (checklist)"
        },
        {
          "type": "p",
          "text": "Photos avant nettoyage · conserver factures friteuse/four · appeler l'assureur sous 5 jours ouvrés (delai contractuel) · ne pas jeter l'appareil avant expertise si demande · garder numero de contrat accessible. Sous-assurance = indemnisation plafonnee : voir <a href=\"./assurance-habitation-sous-assurance-sinistre.html\">sous-assurance sinistre</a>."
        }
      ],
      "related": [
        {
          "href": "./assurance-habitation-locataire-proprietaire-2026.html",
          "label": "Habitation locataire"
        },
        {
          "href": "./assurance-habitation-sous-assurance-sinistre.html",
          "label": "Sous-assurance"
        },
        {
          "href": "../landings/devis.html?need=habitation",
          "label": "Devis MRH"
        }
      ]
    },
    {
      "file": "renovation-cuisine-pret-travaux-assurance.html",
      "section": "habitat",
      "tag": "Cuisine & travaux",
      "tagClass": "tag-habitation",
      "themes": [
        "habitat",
        "emprunteur"
      ],
      "title": "Renovation cuisine 2026 : budget, pret travaux et assurance habitation",
      "description": "Cuisine neuve de 8 000 a 25 000 € : pret conso, eco-PTZ, MRH pendant le chantier — devis travaux et habitation.",
      "meta": "9 min · Juin 2026",
      "cardExcerpt": "Renover sa cuisine : financement + assurance chantier.",
      "cta": {
        "href": "../landings/devis.html?need=habitation",
        "label": "Devis habitation + travaux"
      },
      "heroImage": {
        "src": "./images/cuisine/renovation-cuisine-moderne.jpg",
        "alt": "Cuisine renovee moderne — electromenager et plan de travail neufs",
        "caption": "Chantier cuisine : proteger le logement et financer l'equipement."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Remplacer plan de travail, credence, four, lave-vaisselle et rangements : une <strong>renovation cuisine</strong> coute souvent <strong>8 000 a 25 000 €</strong> en France. Entre <strong>pret travaux</strong>, <strong>credit conso</strong> et mise a jour de l'<strong>assurance habitation</strong>, voici le plan complet. <a href=\"../landings/credit-immo.html\">Etude financement</a> · <a href=\"../landings/devis.html?need=habitation\">devis habitation</a> · <a href=\"../landings/questionnaire.html?need=conso&journey=standard\">questionnaire credit conso</a>."
        },
        {
          "type": "gallery",
          "label": "Renovation cuisine : budget et protection",
          "items": [
            {
              "src": "./images/cuisine/renovation-cuisine-moderne.jpg",
              "alt": "Cuisine renovee avec ilot central",
              "caption": "Cuisine complete — budget moyen 12 000–18 000 €"
            },
            {
              "src": "./images/finance/credit-immo-cles.jpg",
              "alt": "Clefs et documents pret travaux",
              "caption": "Financement — comparer TAEG et duree"
            },
            {
              "src": "./images/habitat/maison-famille.jpg",
              "alt": "Maison familiale — assurance habitation renforcee",
              "caption": "Apres travaux : reviser plafonds mobilier MRH"
            }
          ]
        },
        {
          "type": "h2",
          "text": "Budget type renovation cuisine (2026)"
        },
        {
          "type": "ul",
          "items": [
            "Refresh (plan de travail + credence + peinture) : 3 000–6 000 €",
            "Cuisine equipee milieu de gamme : 8 000–15 000 €",
            "Cuisine sur mesure + electromenager premium : 15 000–25 000 €",
            "Plomberie / electricite : +15 à 25 % du budget total"
          ]
        },
        {
          "type": "h2",
          "text": "Financer : pret conso, pret travaux ou eco-PTZ ?"
        },
        {
          "type": "figure",
          "src": "./images/finance/signature-pret.jpg",
          "alt": "Signature pret travaux ou credit consommation",
          "caption": "Comparez le cout total du credit, pas seulement la mensualite."
        },
        {
          "type": "p",
          "text": "<strong>Pret personnel / conso</strong> (12–84 mois) : flexible, sans justificatif de devis parfois — TAEG a comparer. <strong>Pret travaux</strong> banque : souvent lie au devis artisan. <strong>Eco-PTZ</strong> : si travaux eligibles (isolation, chauffage) parfois cumulables avec une cuisine plus efficiente (induction, hotte performante) dans un bouquet travaux energie. Si vous avez un <strong>pret immobilier</strong>, verifiez l'impact sur le taux d'endettement avant un nouveau credit."
        },
        {
          "type": "h2",
          "text": "Exemple mensualites (indicatif 12 000 €)"
        },
        {
          "type": "ul",
          "items": [
            "48 mois a ~6 % TAEG : environ 280 €/mois (cout total ~13 400 €)",
            "60 mois a ~6 % TAEG : environ 230 €/mois",
            "Epargne comptant : 0 € d'interets — ideal si vous gardez une reserve urgence"
          ]
        },
        {
          "type": "h2",
          "text": "Assurance habitation pendant et apres le chantier"
        },
        {
          "type": "p",
          "text": "Pendant les travaux : risque <strong>degats des eaux</strong> (plomberie), <strong>incendie</strong> (soudure, electrique), vol de materiel. Informez votre assureur si le logement est inhabitable ou si des artisans interviennent. Apres livraison : <strong>mettre a jour le capital mobilier</strong> (four, lave-vaisselle, plan de travail neufs) — sinon sous-assurance en cas de sinistre. Proprietaire bailleur : verifier PNO et clause travaux."
        },
        {
          "type": "h2",
          "text": "Recette bonus : meal prep dans une cuisine neuve"
        },
        {
          "type": "p",
          "text": "Pour tester vos nouveaux fourneaux : batch cooking de <strong>legumes rotis</strong> (courgettes, poivrons, 200 °C, 25 min) + <strong>bols quinoa</strong> pour la semaine. Moins de friture = moins de risques incendie — et une cuisine qui reste propre plus longtemps."
        }
      ],
      "related": [
        {
          "href": "./feu-friteuse-cuisine-assurance-habitation.html",
          "label": "Feu de cuisine & MRH"
        },
        {
          "href": "./robot-cuiseur-pret-conso-credit-cuisine.html",
          "label": "Robot cuiseur & pret conso"
        },
        {
          "href": "../landings/credit-immo.html",
          "label": "Credit travaux"
        }
      ]
    },
    {
      "file": "mutuelle-sante-hospitalisation-2026.html",
      "section": "sante",
      "tag": "Hospitalisation",
      "tagClass": "tag-sante",
      "title": "Mutuelle hospitalisation 2026 : chambre particuliere, forfait jour",
      "description": "Preparer une operation ou une maternite : les postes qui font la difference sur la facture.",
      "meta": "7 min · Mai 2026",
      "cardExcerpt": "Hospitalisation : les postes qui comptent.",
      "cta": {
        "href": "../landings/questionnaire.html?need=sante&journey=standard",
        "label": "Tester mon profil hospitalisation"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Une <strong>hospitalisation</strong> — même « simple » — peut générer plusieurs centaines à plusieurs milliers d'euros de <strong>reste à charge</strong> : dépassements d'honoraires, chambre particulière, forfait journalier, frais de confort. C'est le poste qui distingue une mutuelle d'entrée de gamme d'un contrat réellement protecteur."
        },
        {
          "type": "h2",
          "text": "Ce que la Sécu rembourse — et ce qu'elle laisse"
        },
        {
          "type": "p",
          "text": "La Sécurité sociale rembourse une base (BRSS). En secteur 2, le médecin facture au-delà : sans mutuelle solide, <strong>30 à 80 % du ticket</strong> peut rester à votre charge sur la chirurgie et l'anesthésie."
        },
        {
          "type": "h2",
          "text": "Les 4 lignes à vérifier sur votre tableau"
        },
        {
          "type": "ul",
          "items": [
            "<strong>Honoraires chirurgien / anesthésiste</strong> : % BRSS ou forfait en euros",
            "<strong>Chambre particulière</strong> : forfait / jour et plafond annuel",
            "<strong>Forfait journalier hospitalier</strong> : pris en charge ou non",
            "<strong>Plafond global hospitalisation</strong> : rare mais existant sur les petits contrats"
          ]
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "Cas concrets : maternité, appendicite, prothèse"
        },
        {
          "type": "p",
          "text": "Maternité : chambre, pédiatre, dépassements — budget fréquent <strong>800 à 2 500 €</strong> sans bon niveau. Appendicite en urgence : l'optique du contrat ne sert à rien si l'hospitalisation est faible. Avant une opération programmée, demandez une <strong>simulation de reste à charge</strong> à postes équivalents."
        }
      ],
      "related": [
        {
          "href": "../assurance-sante/",
          "label": "Mutuelle sante"
        },
        {
          "href": "./mutuelle-sante-5-criteres.html",
          "label": "5 criteres"
        }
      ]
    },
    {
      "file": "mutuelle-remboursement-optique-dentaire-2026.html",
      "section": "sante",
      "tag": "Optique & dentaire",
      "tagClass": "tag-sante",
      "title": "Remboursement mutuelle optique et dentaire en 2026 : lire le tableau",
      "description": "BRSS, forfaits lunettes, prothese dentaire : comprendre le remboursement mutuelle optique et dentaire avant de comparer.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "Optique et dentaire : decoder les % BRSS.",
      "cta": {
        "href": "../landings/questionnaire.html?need=sante&journey=standard",
        "label": "Questionnaire mutuelle optique/dentaire"
      },
      "blocks": [
        {
          "type": "p",
          "text": "L'<strong>optique</strong> et le <strong>dentaire</strong> concentrent souvent le plus gros reste à charge. Avant de changer de <strong>mutuelle santé</strong>, lisez le tableau de garanties poste par poste — pas seulement la cotisation mensuelle."
        },
        {
          "type": "h2",
          "text": "Optique : montures, verres, lentilles"
        },
        {
          "type": "p",
          "text": "Depuis la reforme 100 % santé, certains équipements sont pris en charge sans reste à charge dans le panier prévu. Hors panier, votre mutuelle intervient en % de la <strong>BRSS</strong> avec des forfaits par équipement."
        },
        {
          "type": "ul",
          "items": [
            "Monture : forfait tous les 2 ans (adulte)",
            "Verres : % BRSS selon correction simple / complexe",
            "Lentilles : forfait annuel si non remboursées par la Sécu",
            "Chirurgie réfractive : souvent exclue ou plafonnée"
          ]
        },
        {
          "type": "h2",
          "text": "Dentaire : soins, prothèses, orthodontie"
        },
        {
          "type": "p",
          "text": "Un implant ou une couronne peut laisser <strong>300 à 800 €</strong> à charge si le niveau BRSS est faible. C'est le poste le plus discriminant entre contrats « pas cher » et contrats réellement protecteurs."
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "Méthode comparatif en 3 étapes"
        },
        {
          "type": "ul",
          "items": [
            "Récupérer vos devis opticien / dentiste des 12 derniers mois",
            "Demander un tableau de garanties à postes équivalents",
            "Lancer le questionnaire mutuelle pour calibrer le bon niveau"
          ]
        }
      ],
      "related": [
        {
          "href": "../assurance-sante/comparatif/",
          "label": "Comparatif mutuelle sante"
        },
        {
          "href": "../assurance-sante/remboursement-optique/",
          "label": "Page remboursement optique"
        },
        {
          "href": "./mutuelle-sante-5-criteres.html",
          "label": "5 criteres mutuelle"
        },
        {
          "href": "./inflation-mutuelle-hausse-2026.html",
          "label": "Inflation mutuelle 2026"
        }
      ]
    },
    {
      "file": "mutuelle-sante-famille-petit-budget-2026.html",
      "section": "sante",
      "tag": "Famille",
      "tagClass": "tag-sante",
      "title": "Mutuelle sante famille petit budget 2026 : couvrir toute la famille",
      "description": "Assurance sante famille, mutuelle pas cher : equilibre entre prix et hospitalisation pour conjoint et enfants.",
      "meta": "7 min · Juin 2026",
      "cardExcerpt": "Famille : le bon niveau sans surpayer.",
      "cta": {
        "href": "../landings/sante.html",
        "label": "Devis mutuelle famille"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Une <strong>mutuelle sante famille</strong> doit proteger chaque membre sans exploser le budget. L'erreur classique : payer pour de l'optique haut de gamme alors que le besoin principal est l'<strong>hospitalisation</strong> ou la pediatrie."
        },
        {
          "type": "h2",
          "text": "Contrat unique ou surcomplémentaire ?"
        },
        {
          "type": "p",
          "text": "Si un parent a deja une mutuelle d'entreprise, une <strong>surcomplémentaire</strong> peut suffire pour le conjoint et les enfants. Sinon, un contrat collectif famille simplifie la gestion et le paiement."
        },
        {
          "type": "h2",
          "text": "Postes a ne pas sacrifier sur petit budget"
        },
        {
          "type": "ul",
          "items": [
            "Hospitalisation et chirurgie (honoraires depasses)",
            "Pediatrie et maternite si projet bebe",
            "Pharmacie et medecine douce selon usage",
            "Optique / dentaire : ajuster au reel, pas au maximum"
          ]
        },
        {
          "type": "h2",
          "text": "Aides et dispositifs a connaitre"
        },
        {
          "type": "p",
          "text": "CMU-C, ACS, CSS : selon les revenus, des dispositifs peuvent reduire le reste a charge avant meme de choisir une mutuelle complementaire. Verifiez votre eligibilite sur service-public.fr puis comparez les offres privees."
        }
      ],
      "related": [
        {
          "href": "../assurance-sante/",
          "label": "Assurance sante"
        },
        {
          "href": "../assurance-sante/petit-budget/",
          "label": "Mutuelle petit budget"
        },
        {
          "href": "./mutuelle-remboursement-optique-dentaire-2026.html",
          "label": "Optique et dentaire"
        }
      ]
    },
    {
      "file": "assurance-auto-jeune-conducteur-2026.html",
      "section": "auto",
      "tag": "Jeune conducteur",
      "tagClass": "tag-auto",
      "title": "Assurance auto jeune conducteur 2026 : permis, bonus, astuces",
      "description": "Permis accompagne, conduite supervisee, vehicule : payer moins sans rogner sur les garanties.",
      "meta": "7 min · Mai 2026",
      "cardExcerpt": "Premier vehicule : eviter la prime excessive.",
      "cta": {
        "href": "../landings/questionnaire.html?need=auto&journey=standard",
        "label": "Questionnaire auto jeune conducteur"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Premier véhicule, permis récent : la surprime <strong>jeune conducteur</strong> est mécanique (coefficient, expérience limitée). Pourtant, deux profils identiques peuvent payer <strong>40 à 60 % d'écart</strong> selon le véhicule, le kilométrage déclaré et le choix tiers / tiers plus / tous risques."
        },
        {
          "type": "h2",
          "text": "Les leviers qui fonctionnent vraiment"
        },
        {
          "type": "ul",
          "items": [
            "<strong>Véhicule</strong> : groupe SRA bas, faible puissance, pas de sportive",
            "<strong>Conduite accompagnée / supervisée</strong> : accélère parfois le bonus",
            "<strong>Conducteur secondaire</strong> : parent au bon CRM peut aider (selon assureur)",
            "<strong>Kilométrage réel</strong> : forfait bas si véhicule urbain peu utilisé",
            "<strong>Franchise</strong> : plus haute = prime plus basse si trésorerie disponible"
          ]
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "Tiers, tiers plus ou tous risques ?"
        },
        {
          "type": "p",
          "text": "Véhicule neuf ou crédit auto : tous risques souvent exigé par le financeur. Vieille citadine à 2 000 € : tiers peut suffire. Le questionnaire auto croise âge du permis, véhicule et usage pour orienter sans sur-assurer."
        }
      ],
      "related": [
        {
          "href": "../assurance-auto/",
          "label": "Assurance auto"
        },
        {
          "href": "./assurance-auto-bonus-malus.html",
          "label": "Bonus-malus"
        }
      ]
    },
    {
      "file": "assurance-deces-obseques-prevoyance.html",
      "section": "prevoyance",
      "tag": "Deces",
      "tagClass": "tag-prevoyance",
      "title": "Assurance deces et obseques : capital, prevoyance, transmission",
      "description": "Preparer les frais d'obseques et proteger sa famille sans laisser de dettes.",
      "meta": "6 min · Mai 2026",
      "cardExcerpt": "Capital deces : combien souscrire ?",
      "cta": {
        "href": "../landings/devis.html?need=deces",
        "label": "Devis deces / obseques"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Un contrat <strong>deces</strong> verse un capital aux beneficiaires. Il complete la prevoyance salarie et securise le remboursement d'un pret."
        }
      ],
      "related": [
        {
          "href": "../assurance-prevoyance/",
          "label": "Prevoyance"
        }
      ]
    },
    {
      "file": "rc-pro-freelance-artisan-guide.html",
      "section": "pro",
      "tag": "RC Pro",
      "tagClass": "tag-pro",
      "title": "RC Pro freelance et artisan : obligations et comparatif 2026",
      "description": "Consultant, artisan, coach : quand la RC pro est obligatoire et comment la choisir.",
      "meta": "8 min · Mai 2026",
      "cardExcerpt": "Freelance : RC Pro obligatoire ou pas ?",
      "cta": {
        "href": "../landings/questionnaire.html?need=rc-pro&journey=standard",
        "label": "Questionnaire RC Pro"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Freelance, artisan, consultant : la <strong>RC professionnelle</strong> protège votre patrimoine personnel si un client, un tiers ou un partenaire subit un préjudice lié à votre activité. Obligatoire pour certaines professions, fortement recommandée pour toutes les autres."
        },
        {
          "type": "h2",
          "text": "Obligatoire ou recommandée ?"
        },
        {
          "type": "ul",
          "items": [
            "<strong>Obligatoire</strong> : artisans BTP (souvent + décennale), agents immobiliers, experts-comptables, certaines activités réglementées",
            "<strong>Recommandée</strong> : coach, formateur, développeur, photographe, consultant — dès qu'un client peut réclamer un préjudice",
            "<strong>Plafonds</strong> : vérifiez ce qu'exigent vos clients (1 à 10 M€ selon secteur)"
          ]
        },
        {
          "type": "bridge"
        }
      ],
      "related": [
        {
          "href": "../landings/devis.html?need=decennale",
          "label": "Decennale batiment"
        }
      ]
    },
    {
      "file": "assurance-vie-epargne-retraite-patrimoine.html",
      "section": "patrimoine",
      "tag": "Assurance-vie",
      "tagClass": "tag-patrimoine",
      "title": "Assurance-vie, epargne et retraite : construire son patrimoine en 2026",
      "description": "Fonds euros, UC, PER : diversifier sans ignorer les frais et la fiscalite.",
      "meta": "8 min · Mai 2026",
      "cardExcerpt": "Epargne long terme : par ou commencer ?",
      "cta": {
        "href": "../landings/devis.html?need=assurance-vie",
        "label": "Etude patrimoine"
      },
      "blocks": [
        {
          "type": "p",
          "text": "L'<strong>assurance-vie</strong> reste un pilier d'epargne en France. Le PER complete la retraite obligatoire. L'essentiel : horizon, frais, diversification."
        }
      ],
      "related": [
        {
          "href": "../landings/devis.html?need=retraite",
          "label": "Retraite supplementaire"
        }
      ]
    },
    {
      "file": "canicule-animaux-eau-chien-chat-oiseaux-assurance.html",
      "section": "animaux",
      "tag": "Canicule & animaux",
      "tagClass": "tag-animaux",
      "title": "Canicule : chien, chat, oiseaux — comment les hydrater et les assurer",
      "description": "Fortes chaleurs en France : eau, ombre, promenade, oiseaux du jardin — reflexes canicule pour animaux et role de l'assurance chien et chat.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "Canicule et animaux : eau, urgence vet et assurance.",
      "cta": {
        "href": "../landings/animaux.html",
        "label": "Devis assurance animaux"
      },
      "heroImage": {
        "src": "./images/animaux/canicule-chien-eau.jpg",
        "alt": "Chien qui boit en periode de canicule — hydratation indispensable",
        "caption": "Chaleur extreme : l'eau fraiche doit etre accessible en permanence pour chiens et chats."
      },
      "blocks": [
        {
          "type": "p",
          "text": "La <strong>canicule en France</strong> touche aussi nos <strong>animaux</strong> : chiens, chats, <strong>oiseaux</strong> du jardin, parfois NAC (lapins, rongeurs). Contrairement aux humains, ils ne transpirent pas tous de la meme facon et supportent mal la chaleur. <strong>Hydrater, ombrer, adapter les sorties</strong> limite les urgences veterinaires — couteuses sans <strong>assurance animaux</strong>. <a href=\"../landings/animaux.html\">Demandez un devis assurance animaux</a> · <a href=\"../landings/devis.html?need=animaux\">devis en ligne</a>."
        },
        {
          "type": "gallery",
          "label": "Canicule : chiens, chats et oiseaux — trois profils a surveiller",
          "items": [
            {
              "src": "./images/animaux/canicule-chien-eau.jpg",
              "alt": "Chien qui boit de l'eau fraiche",
              "caption": "Chien — gamelle propre, renouvelee souvent"
            },
            {
              "src": "./images/animaux/chat-soin.jpg",
              "alt": "Chat a l'ombre en periode de chaleur",
              "caption": "Chat — pieces fraiches, litiere au frais"
            },
            {
              "src": "./images/animaux/canicule-oiseau-eau.jpg",
              "alt": "Oiseau pres d'un point d'eau",
              "caption": "Oiseaux — baignoire peu profonde au jardin"
            }
          ]
        },
        {
          "type": "h2",
          "text": "1. Chien : eau, sol brulant, promenade"
        },
        {
          "type": "figure",
          "src": "./images/animaux/chien-promenade.jpg",
          "alt": "Promenade chien — horaires adaptes en canicule",
          "caption": "Sortir tot le matin ou tard le soir ; tester le sol avec la main."
        },
        {
          "type": "p",
          "text": "Plusieurs gamelles d'<strong>eau fraiche</strong> (interieur + exterieur), jamais vide. Evitez les promenades entre 11 h et 19 h : le <strong>sol brule</strong> les coussinets. Signes d'alerte : halètement excessif, langue bleutee, vomissements, effondrement → veterinaire d'urgence. Une <strong>assurance chien</strong> avec bon plafond urgences limite la facture (perfusion, hospitalisation). <a href=\"../assurance-animaux/chien/\"><strong>Assurance chien</strong></a> · <a href=\"./assurance-chien-frais-veterinaires.html\">frais veterinaires</a>."
        },
        {
          "type": "h2",
          "text": "2. Chat : hydratation et pieces fraiches"
        },
        {
          "type": "figure",
          "src": "./images/animaux/chat-soin.jpg",
          "alt": "Chat — soins et vigilance canicule",
          "caption": "Fontaine a eau, pieces au nord, pas de balcon sans ombre."
        },
        {
          "type": "p",
          "text": "Le <strong>chat</strong> boit peu par nature : proposez une <strong>fontaine</strong>, nourriture humide, plusieurs points d'eau. Fermez les fenetres en plein soleil, laissez acces aux sols carreles. Un chat age ou a poil long deshydrate vite. L'<strong>assurance chat</strong> rembourse consultation et soins si coup de chaleur ou deshydratation. <a href=\"../assurance-animaux/chat/\"><strong>Assurance chat</strong></a> · <a href=\"./assurance-chat-guide-complet.html\">guide complet</a>."
        },
        {
          "type": "h2",
          "text": "3. Oiseaux : jardin, baignoire, pas de cage au soleil"
        },
        {
          "type": "figure",
          "src": "./images/animaux/canicule-oiseau-eau.jpg",
          "alt": "Oiseau et point d'eau en ete",
          "caption": "Oiseaux sauvages : eau peu profonde, renouvelee chaque jour."
        },
        {
          "type": "p",
          "text": "Pour les <strong>oiseaux</strong> (sauvages ou de compagnie) : <strong>baignoire peu profonde</strong> ou coupelle a l'ombre, eau changee quotidiennement. Cage ou voliere : jamais en plein soleil, brumisation legere possible. Les oiseaux domestiques peuvent parfois etre couverts par une assurance NAC selon assureur — renseignez-vous via <a href=\"../landings/animaux.html\">devis animaux</a>."
        },
        {
          "type": "h2",
          "text": "4. Lapins, NAC et animaux de ferme (rappels)"
        },
        {
          "type": "p",
          "text": "Lapins et rongeurs : bouteille ou bol toujours plein, cage a l'ombre, pas de courants d'air chaud. En canicule, la <strong>mortalite</strong> monte vite sans eau. Verifiez les garanties de votre contrat animaux (plafond, franchise, delai de carence)."
        },
        {
          "type": "h2",
          "text": "5. Quand consulter le veterinaire (et assurer avant l'ete)"
        },
        {
          "type": "figure",
          "src": "./images/animaux/chien-veterinaire.jpg",
          "alt": "Consultation veterinaire — urgence canicule animaux",
          "caption": "Urgence chaleur : agir vite, facture souvent elevee sans assurance."
        },
        {
          "type": "p",
          "text": "Refus de boire, prostration, convulsions, gencives pales : appelez le vet sans attendre. Un passage aux urgences + perfusion peut depasser <strong>300 a 800 €</strong>. Souscrire une <strong>assurance animaux</strong> avant l'ete (chien, chat, parfois NAC) evite de hesiter en cas d'urgence. Comparez plafonds et prevention : <a href=\"../landings/animaux.html\"><strong>Devis assurance animaux</strong></a> · <a href=\"../landings/animaux-express.html\">devis express 30 s</a> · <a href=\"./assurance-animaux-comment-choisir.html\">comment choisir</a>."
        },
        {
          "type": "h2",
          "text": "6. Checklist canicule proprietaire d'animaux"
        },
        {
          "type": "p",
          "text": "Eau renouvelee · ombre garantie · promenades aux heures fraiches · sol teste · jamais animal en voiture · numero vet affiche · contrat animaux a jour · antiparasitaires (puces/tiques) car l'ete cumule risques."
        }
      ],
      "related": [
        {
          "href": "./canicule-degats-eaux-assurance-habitation.html",
          "label": "Canicule habitation"
        },
        {
          "href": "../assurance-animaux/chien/",
          "label": "Assurance chien"
        },
        {
          "href": "../assurance-animaux/chat/",
          "label": "Assurance chat"
        },
        {
          "href": "../landings/animaux.html",
          "label": "Devis animaux"
        }
      ]
    },
    {
      "file": "chat-puces-tiques-assurance-remboursement.html",
      "section": "animaux",
      "tag": "Santé chat",
      "tagClass": "tag-animaux",
      "title": "Puces et tiques chez le chat : soins, prévention et assurance",
      "description": "Puces, tiques, vermifuge : coûts véto, traitements et remboursement via assurance chat. Avez-vous pensé à assurer votre chat ?",
      "meta": "7 min · Juin 2026",
      "cardExcerpt": "Puces sur chat : soins, budget et assurance.",
      "cta": {
        "href": "../landings/animaux.html",
        "label": "Devis assurance chat"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Votre <strong>chat se gratte</strong>, vous trouvez des petites taches noires sur le pelage ou au sol : ce sont souvent des <strong>puces</strong>. En été, les <strong>tiques</strong> s'ajoutent au tableau. Sans traitement rapide, l'inconfort dure et les complications (allergie, anémie chez le jeune chat) peuvent coûter cher."
        },
        {
          "type": "h2",
          "text": "Combien coûte un traitement anti-puces chez le chat ?"
        },
        {
          "type": "p",
          "text": "Comptez en général <strong>40 à 120 €</strong> pour une consultation + pipettes ou comprimés antiparasitaires. S'il faut traiter toute la maison (spray, aspirateur, répétition), la facture grimpe. Un chat très allergique aux puces peut nécessiter des soins complémentaires (antibiotiques, shampooing médicalisé)."
        },
        {
          "type": "h2",
          "text": "Puces vs tiques : ne pas confondre"
        },
        {
          "type": "ul",
          "items": [
            "<strong>Puces</strong> : démangeaisons intenses, grains noirs (crottes de puce), reproduction rapide dans le logement",
            "<strong>Tiques</strong> : fixées sur la peau, risque de maladie (ehrlichiose, babésiose selon région) — arrachage propre indispensable",
            "<strong>Vermifuge</strong> : à jour en parallèle ; ne remplace pas l'antipuce externe"
          ]
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "Prévention : le bon réflexe chaque mois"
        },
        {
          "type": "p",
          "text": "Pipette, collier ou comprimé : suivez le protocole indiqué par votre vétérinaire (poids du chat, âge, intérieur / extérieur). Un chat qui sort ou vit avec un chien non traité reste exposé en permanence."
        },
        {
          "type": "h2",
          "text": "L'assurance chat rembourse-t-elle les puces ?"
        },
        {
          "type": "p",
          "text": "La plupart des contrats couvrent les <strong>consultations et traitements curatifs</strong> prescrits, parfois une part de <strong>prévention</strong> (vaccins, antiparasitaires) selon la formule. Lisez le plafond annuel, la franchise et les délais de carence — surtout si vous adhérez après un premier épisode."
        }
      ],
      "related": [
        {
          "href": "../assurance-animaux/chat/",
          "label": "Assurance chat"
        },
        {
          "href": "../assurance-animaux/chat/pas-cher/",
          "label": "Assurance chat pas cher"
        },
        {
          "href": "./assurance-chat-guide-complet.html",
          "label": "Guide assurance chat"
        },
        {
          "href": "../landings/animaux-express.html",
          "label": "Devis express animaux"
        }
      ]
    },
    {
      "file": "assurance-animaux-comment-choisir.html",
      "section": "animaux",
      "tag": "Animaux",
      "tagClass": "tag-animaux",
      "title": "Assurance animaux : comment choisir en 2026",
      "description": "Plafond, franchise, carence, prevention : comparer assurance chien et chat sans mauvaise surprise.",
      "meta": "9 min · Mai 2026",
      "cardExcerpt": "Plafond, franchise, carence : la methode.",
      "cta": {
        "href": "../landings/questionnaire.html?need=animaux&journey=standard",
        "label": "Questionnaire animaux"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Chien, chat ou NAC : l'<strong>assurance animaux</strong> se compare sur 4 chiffres — plafond annuel, taux de remboursement, franchise, délai de carence — pas sur le prix affiché en première page."
        },
        {
          "type": "h2",
          "text": "Simulation rapide : chat vs chien"
        },
        {
          "type": "ul",
          "items": [
            "<strong>Chat intérieur</strong> : 15–35 €/mois, plafond 1 500–2 500 €/an souvent suffisant",
            "<strong>Chien grande race</strong> : 30–70 €/mois, viser 3 000–4 000 € de plafond",
            "<strong>Chiot/chaton</strong> : souscrire tôt limite les exclusions pathologies futures",
            "<strong>Sénior</strong> : carences plus longues — comparer avant les premiers signes"
          ]
        },
        {
          "type": "h2",
          "text": "Ce que les contrats excluent souvent"
        },
        {
          "type": "p",
          "text": "Maladies antérieures, sterilisation non urgente, certains vaccins, alimentation thérapeutique, comportement. Lisez les <strong>garanties prévention</strong> (antiparasitaires, vaccins) : c'est souvent là que Santévet, Bulle Bleue et Kozoo se différencient."
        },
        {
          "type": "bridge"
        }
      ],
      "related": [
        {
          "href": "../assurance-animaux/",
          "label": "Guide assurance animaux"
        },
        {
          "href": "../assurance-animaux/chien/",
          "label": "Assurance chien"
        },
        {
          "href": "../assurance-animaux/chat/",
          "label": "Assurance chat"
        }
      ]
    },
    {
      "file": "assurance-chien-frais-veterinaires.html",
      "section": "animaux",
      "tag": "Chien",
      "tagClass": "tag-animaux",
      "title": "Assurance chien : frais veterinaires et remboursements 2026",
      "description": "Consultation, radio, chirurgie : combien coute un chien et comment l'assurance animaux rembourse.",
      "meta": "7 min · Mai 2026",
      "cardExcerpt": "Frais vet chien : ordres de grandeur.",
      "cta": {
        "href": "../landings/animaux.html",
        "label": "Devis assurance chien"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Consultation, vaccination, sterilisation, urgence : les <strong>frais veterinaires chien</strong> progressent. L'<strong>assurance chien</strong> couvre une partie selon plafond et franchise."
        },
        {
          "type": "h2",
          "text": "Ordres de grandeur 2026"
        },
        {
          "type": "ul",
          "items": [
            "Consultation : 40 a 70 EUR",
            "Radio / echographie : 80 a 200 EUR",
            "Chirurgie : 500 a 2 500 EUR+"
          ]
        }
      ],
      "related": [
        {
          "href": "../assurance-chien/villes/",
          "label": "Assurance chien par ville"
        }
      ]
    },
    {
      "file": "assurance-chat-guide-complet.html",
      "section": "animaux",
      "tag": "Chat",
      "tagClass": "tag-animaux",
      "title": "Assurance chat : guide complet 2026",
      "description": "Chaton, chat senior, interieur / exterieur : garanties et tarifs assurance chat.",
      "meta": "8 min · Mai 2026",
      "cardExcerpt": "Guide assurance chat complet.",
      "cta": {
        "href": "../landings/animaux.html",
        "label": "Devis assurance chat"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Le <strong>chat</strong> coute en general moins cher a assurer que le chien, sauf races ou antecedents. Ce guide couvre <strong>assurance chaton</strong>, senior et exclusions."
        }
      ],
      "related": [
        {
          "href": "../assurance-chat/villes/",
          "label": "Assurance chat par ville"
        }
      ]
    },
    {
      "file": "assurance-chiot-chaton-quand-assurer.html",
      "section": "animaux",
      "tag": "Chiot",
      "tagClass": "tag-animaux",
      "title": "Chiot et chaton : quand souscrire une assurance animaux ?",
      "description": "Age d'adhesion, delai de carence, prevention : le bon timing pour assurer.",
      "meta": "6 min · Mai 2026",
      "cardExcerpt": "Chiot / chaton : le bon moment.",
      "cta": {
        "href": "../landings/animaux.html",
        "label": "Assurer mon chiot"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Assurer tot un <strong>chiot</strong> ou <strong>chaton</strong> limite souvent les exclusions sur maladies futures. Attention au <strong>delai de carence</strong>."
        }
      ],
      "related": [
        {
          "href": "../assurance-animaux/chiot-chaton/",
          "label": "Page chiot chaton"
        }
      ]
    },
    {
      "file": "comparatif-santevet-bulle-bleue-kozoo.html",
      "section": "animaux",
      "tag": "Comparatif",
      "tagClass": "tag-animaux",
      "title": "Comparatif Santévet, Bulle Bleue, Kozoo : assurance animaux",
      "description": "Marques connues : ce qu'il faut comparer au-dela du nom (plafond, prevention, reseau).",
      "meta": "7 min · Mai 2026",
      "cardExcerpt": "Santévet, Bulle Bleue, Kozoo : comparer.",
      "cta": {
        "href": "../landings/animaux.html",
        "label": "Comparatif animaux"
      },
      "blocks": [
        {
          "type": "p",
          "text": "<strong>Santévet</strong>, <strong>Bulle Bleue</strong>, <strong>Kozoo</strong> : comparez plafonds, franchises et prevention a garanties equivalentes, pas seulement le prix affiche."
        }
      ],
      "related": [
        {
          "href": "../assurance-animaux/comparatif/",
          "label": "Comparatif assurance animaux"
        }
      ]
    },
    {
      "file": "assurance-vtc-moins-cher-2026.html",
      "section": "vtc",
      "tag": "VTC",
      "tagClass": "tag-vtc",
      "title": "Assurance VTC moins cher en 2026 : 7 leviers",
      "description": "Reduire sa prime VTC : franchise, comparatif, plateformes Uber Bolt Heetch.",
      "meta": "8 min · Mai 2026",
      "cardExcerpt": "7 leviers pour payer moins cher.",
      "cta": {
        "href": "../landings/questionnaire.html?need=vtc&journey=standard",
        "label": "Questionnaire VTC (3 min)"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Payer moins cher son <strong>assurance VTC</strong> sans rogner sur la <strong>RC pro</strong>, c'est possible — si vous comparez à garanties strictement équivalentes (Uber, Bolt, Heetch, dommages passagers, véhicule). Baissez le prix au mauvais endroit et c'est votre activité qui s'arrête après un sinistre."
        },
        {
          "type": "h2",
          "text": "7 leviers concrets (testés en 2026)"
        },
        {
          "type": "ul",
          "items": [
            "Franchise véhicule : plus haute si trésorerie sinistre disponible",
            "Kilométrage annuel déclaré : aligné sur la réalité plateforme",
            "Véhicule : catégorie, puissance, valeur — impact majeur sur la prime",
            "Sinistralité : anticiper le surcoût après un sinistre responsable",
            "Comparatif multi-assureurs VTC (Zéphir, Solly Azar, Allianz, AXA…)",
            "Regrouper RC pro + auto si l'assureur le permet avec une seule franchise sinistre",
            "Renégocier à l'échéance avec relevé d'information propre"
          ]
        },
        {
          "type": "bridge"
        },
        {
          "type": "p",
          "text": "Notre questionnaire VTC reprend plateforme utilisée, véhicule, ancienneté permis pro et sinistres : vous obtenez une orientation vers les contrats compatibles — avant d'activer Uber ou Bolt."
        }
      ],
      "related": [
        {
          "href": "../assurance-vtc/",
          "label": "Assurance VTC"
        }
      ]
    },
    {
      "file": "assurance-vtc-rc-pro-garanties.html",
      "section": "vtc",
      "tag": "RC Pro",
      "tagClass": "tag-vtc",
      "title": "RC Pro VTC : garanties essentielles avant de signer",
      "description": "Responsabilite civile professionnelle VTC : minimum legal et utile.",
      "meta": "7 min · Mai 2026",
      "cardExcerpt": "RC Pro VTC : le minimum.",
      "cta": {
        "href": "../landings/vtc.html",
        "label": "Devis VTC"
      },
      "blocks": [
        {
          "type": "p",
          "text": "La <strong>RC pro VTC</strong> protege les passagers et les tiers. Verifiez plafonds, exclusions plateformes et dommages corporels."
        }
      ],
      "related": [
        {
          "href": "../assurance-vtc/rc-pro/",
          "label": "Page RC Pro VTC"
        }
      ]
    },
    {
      "file": "assurance-vtc-creation-chauffeur.html",
      "section": "vtc",
      "tag": "Creation",
      "tagClass": "tag-vtc",
      "title": "Nouveau chauffeur VTC : assurer son activite des le depart",
      "description": "Creation VTC, immatriculation, premiere assurance : ordre des demarches.",
      "meta": "7 min · Mai 2026",
      "cardExcerpt": "Nouveau chauffeur : par ou commencer.",
      "cta": {
        "href": "../landings/questionnaire.html?need=vtc&journey=standard",
        "label": "Questionnaire nouveau VTC"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Nouveau <strong>chauffeur VTC</strong> : l'ordre compte. Carte pro, visite médicale, immatriculation, puis <strong>assurance RC pro + véhicule</strong> avant la première course. Activer Uber sans attestation valide = risque pénal et sinistre non indemnisé."
        },
        {
          "type": "h2",
          "text": "Ordre des démarches"
        },
        {
          "type": "ul",
          "items": [
            "Formation + examen VTC",
            "Carte professionnelle + inscription registre",
            "Véhicule conforme (âge, places, état)",
            "Assurance VTC (RC pro transport personnes + garanties véhicule)",
            "Inscription plateforme avec upload attestation"
          ]
        },
        {
          "type": "bridge"
        }
      ],
      "related": [
        {
          "href": "../assurance-vtc/creation-activite/",
          "label": "Creation activite VTC"
        }
      ]
    },
    {
      "file": "assurance-vtc-uber-bolt-heetch.html",
      "section": "vtc",
      "tag": "Plateformes",
      "tagClass": "tag-vtc",
      "title": "VTC Uber, Bolt, Heetch : contrat compatible plateformes",
      "description": "Exigences assurance des plateformes VTC en France.",
      "meta": "7 min · Mai 2026",
      "cardExcerpt": "Uber Bolt Heetch : contrat adapte.",
      "cta": {
        "href": "../landings/questionnaire.html?need=vtc&journey=standard",
        "label": "Vérifier mon contrat plateforme"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Uber, Bolt, Heetch exigent une <strong>assurance VTC</strong> avec transport de personnes à titre onéreux, RC pro adaptée et parfois des plafonds minimums. Un contrat auto classique + VTC « oubliée » = compte désactivé et sinistre non couvert."
        },
        {
          "type": "h2",
          "text": "Checklist avant activation du compte"
        },
        {
          "type": "ul",
          "items": [
            "Attestation RC pro VTC avec mention transport de personnes",
            "Véhicule déclaré (immatriculation, usage pro)",
            "Plafonds dommages corporels passagers conformes",
            "Pas d'exclusion « activité VTC / plateforme » dans les conditions",
            "Carte VTC valide + visite médicale à jour"
          ]
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "Multi-plateforme : un contrat suffit ?"
        },
        {
          "type": "p",
          "text": "En général oui, si le contrat couvre le transport de personnes via plateforme sans restriction nominative. Vérifiez toutefois les clauses « usage professionnel » et les franchises en cas de sinistre pendant une course."
        }
      ],
      "related": [
        {
          "href": "../assurance-vtc/uber-bolt/",
          "label": "Uber Bolt Heetch"
        }
      ]
    },
    {
      "file": "assurance-vtc-renouvellement-resiliation.html",
      "section": "vtc",
      "tag": "Resiliation",
      "tagClass": "tag-vtc",
      "title": "Assurance VTC : renouvellement, resiliation et loi Hamon",
      "description": "Changer d'assurance VTC a l'echeance ou en cours d'annee.",
      "meta": "7 min · Mai 2026",
      "cardExcerpt": "Renouveler ou changer de VTC.",
      "cta": {
        "href": "../landings/vtc.html",
        "label": "Comparer VTC"
      },
      "blocks": [
        {
          "type": "p",
          "text": "<strong>Resiliation assurance VTC</strong> : loi Hamon, preavis, equivalence de garanties pour eviter toute interruption."
        }
      ],
      "related": [
        {
          "href": "../assurance-vtc/resiliation/",
          "label": "Resiliation VTC"
        }
      ]
    },
    {
      "file": "comparatif-vtc-zephir-solly-azar.html",
      "section": "vtc",
      "tag": "Comparatif",
      "tagClass": "tag-vtc",
      "title": "Comparatif VTC Zéphir, Solly Azar, Allianz : que regarder ?",
      "description": "Assureurs VTC : comparer RC pro, franchises et service sinistre.",
      "meta": "7 min · Mai 2026",
      "cardExcerpt": "Zéphir, Solly Azar, Allianz VTC.",
      "cta": {
        "href": "../landings/vtc.html",
        "label": "Comparatif VTC"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Comparer <strong>Zéphir</strong>, <strong>Solly Azar</strong>, <strong>Allianz</strong> sur les memes garanties VTC, pas seulement le prix mensuel."
        }
      ],
      "related": [
        {
          "href": "../assurance-vtc/comparatif-assureurs/",
          "label": "Comparatif assureurs VTC"
        }
      ]
    },
    {
      "file": "assurance-vtc-franchise-garanties-2026.html",
      "section": "vtc",
      "tag": "Franchise",
      "tagClass": "tag-vtc",
      "title": "Franchise assurance VTC : comment ca marche en 2026",
      "description": "Garanties assurance VTC, franchise tous risques et RC pro : ce qui reste a votre charge apres sinistre.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "Franchise VTC : le vrai cout apres sinistre.",
      "cta": {
        "href": "../landings/vtc.html",
        "label": "Devis assurance VTC"
      },
      "blocks": [
        {
          "type": "p",
          "text": "La <strong>franchise assurance VTC</strong> est la part que vous payez avant indemnisation. Elle s'applique selon le type de sinistre (collision, vol, bris de glace) et le niveau de garantie souscrit."
        },
        {
          "type": "h2",
          "text": "Franchise tous risques vs tiers"
        },
        {
          "type": "p",
          "text": "En <strong>tiers</strong>, seuls les dommages causes aux autres sont couverts. En <strong>tous risques</strong>, votre vehicule est protege avec une franchise fixe ou proportionnelle. Plus la franchise est haute, plus la cotisation baisse — mais le risque en cas de sinistre augmente."
        },
        {
          "type": "h2",
          "text": "RC pro VTC : franchise distincte"
        },
        {
          "type": "p",
          "text": "La <strong>RC professionnelle VTC</strong> couvre les passagers et les tiers. Sa franchise et ses plafonds sont independants de l'assurance auto du vehicule. Verifiez les exclusions liees aux plateformes (Uber, Bolt, Heetch)."
        },
        {
          "type": "h2",
          "text": "Choisir le bon niveau"
        },
        {
          "type": "ul",
          "items": [
            "Chauffeur a faible sinistralite : franchise plus elevee acceptable",
            "Vehicule recent ou credit : privilegier franchise moderee",
            "Activite intensive : anticiper le budget sinistre annuel",
            "Comparer 3 devis a franchises identiques"
          ]
        }
      ],
      "related": [
        {
          "href": "../assurance-vtc/franchise-comment-ca-marche/",
          "label": "Page franchise VTC"
        },
        {
          "href": "../assurance-vtc/garanties-obligatoires/",
          "label": "Garanties obligatoires VTC"
        },
        {
          "href": "./assurance-vtc-rc-pro-garanties.html",
          "label": "RC Pro VTC"
        },
        {
          "href": "./assurance-vtc-moins-cher-2026.html",
          "label": "VTC moins cher"
        }
      ]
    },
    {
      "file": "mutuelle-sante-5-criteres.html",
      "section": "sante",
      "tag": "Sante",
      "tagClass": "tag-sante",
      "title": "Mutuelle sante : 5 criteres pour bien choisir en 2026",
      "description": "BRSS, optique, dentaire, hospitalisation : comparer intelligemment.",
      "meta": "7 min · Mai 2026",
      "cardExcerpt": "5 critères concrets + questionnaire pour cibler le bon niveau.",
      "cta": {
        "href": "../landings/questionnaire.html?need=sante&journey=standard",
        "label": "Questionnaire mutuelle (3 min)"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Comparer une <strong>mutuelle santé</strong> en regardant uniquement le prix mensuel, c'est comme choisir un appartement sur la photo : vous découvrez les mauvaises surprises au pire moment — une couronne, une hospitalisation, des lunettes pour toute la famille. La bonne méthode : partir de <strong>vos dépenses réelles</strong>, puis tester 3 à 5 offres à garanties équivalentes."
        },
        {
          "type": "h2",
          "text": "Étape 1 — Inventorier vos vrais besoins (12 derniers mois)"
        },
        {
          "type": "ul",
          "items": [
            "Consultations généraliste / spécialiste (dépassements d'honoraires ?)",
            "Optique : nombre de paires, verres progressifs, lentilles",
            "Dentaire : soins courants, prothèse, implant, orthodontie enfant",
            "Hospitalisation : chirurgie prévue, maternité, personne fragile au foyer",
            "Médecines douces : ostéo, psy, diététique (souvent plafonnées)"
          ]
        },
        {
          "type": "h2",
          "text": "Étape 2 — Lire le tableau BRSS, pas la brochure marketing"
        },
        {
          "type": "p",
          "text": "Chaque poste indique un <strong>% de la BRSS</strong> (base Sécurité sociale) ou un forfait en euros. Deux contrats « 300 % BRSS chirurgie » peuvent différer si l'un plafonne la chambre particulière ou exclut certains actes. Demandez le <strong>tableau de garanties complet</strong>, pas la fiche résumé."
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "Étape 3 — Les 5 critères qui font vraiment la différence"
        },
        {
          "type": "ul",
          "items": [
            "<strong>Hospitalisation</strong> : honoraires chirurgien/anesthésiste, chambre, forfait journalier",
            "<strong>Optique / dentaire</strong> : postes où le reste à charge explose",
            "<strong>Carences et exclusions</strong> : délais sur certains actes, exclusions pathologies antérieures",
            "<strong>Tiers payant et réseau</strong> : accès direct ou avance de frais",
            "<strong>Coût total</strong> : part employeur + part salarié, ou 100 % à votre charge si indépendant"
          ]
        },
        {
          "type": "h2",
          "text": "Étape 4 — Quand changer (et quand ne pas changer)"
        },
        {
          "type": "p",
          "text": "Changez si votre contrat actuel ne couvre plus vos postes critiques ou si la cotisation a grimpé sans gain de garanties. <strong>Ne changez pas</strong> en plein parcours de soins lourd sans vérifier les carences du nouveau contrat. Un courtier ORIAS aligne April, Harmonie, Allianz, AXA et les mutuelles spécialisées sur votre profil réel."
        },
        {
          "type": "p",
          "text": "Notre <strong>questionnaire mutuelle</strong> reprend ces 5 critères : vous indiquez votre situation (solo, couple, famille, TNS), vos postes sensibles, et vous recevez une orientation vers les formules cohérentes — sans engagement."
        }
      ],
      "related": [
        {
          "href": "../assurance-sante/",
          "label": "Mutuelle sante"
        }
      ]
    },
    {
      "file": "site-immobilier-peu-de-trafic-leads-conversion.html",
      "audience": "france",
      "section": "finance",
      "tag": "Acquisition",
      "tagClass": "tag-immo",
      "themes": [
        "emprunteur"
      ],
      "title": "Site immobilier avec peu de trafic : convertir puis attirer",
      "description": "Peu de visiteurs sur un site immo / courtier ? Travaillez en parallele conversion (simulateur, rappel, lead magnet) et trafic qualifie (SEO local, longue traine, Ads, Shorts).",
      "meta": "10 min · Aout 2026",
      "cardExcerpt": "Peu de trafic : d'abord convertir, puis attirer du qualified.",
      "cta": {
        "href": "../landings/questionnaire.html?need=credit-immo&journey=standard&utm_source=blog&utm_medium=actu_daily&utm_campaign=credit-immo&utm_content=trafic-conversion",
        "label": "Simulation pret (3 min)"
      },
      "heroImage": {
        "src": "./images/finance/budget-famille.jpg",
        "alt": "Budget famille et projet immobilier",
        "caption": "Chaque visiteur compte : un simulateur et un rappel bien places valent souvent plus qu'un clic Ads."
      },
      "blocks": [
        {
          "type": "p",
          "text": "<strong>Site immobilier avec peu de trafic</strong> : probleme classique. Deux leviers a travailler <em>en parallele</em> — pas l'un apres l'autre : <strong>attirer</strong> du trafic qualifie, et <strong>convertir</strong> ce qui vient deja. Chez Leads Opportunities (negociateur + courtier ORIAS), on applique cette logique au credit immo et a la vente."
        },
        {
          "type": "h2",
          "text": "1. Convertir le trafic existant (rapide, souvent gratuit)"
        },
        {
          "type": "p",
          "text": "Avant de courir apres plus de visiteurs, verifiez que vous captez ceux qui sont deja la. Un site a 50 visites/jour bien converties bat un site a 500 visites sans formulaire."
        },
        {
          "type": "figure",
          "src": "./images/finance/credit-immo-cles.jpg",
          "alt": "Simulation credit immobilier",
          "caption": "Le simulateur de pret reste l'aimant a leads n°1 en immobilier."
        },
        {
          "type": "h3",
          "text": "Simulateur de pret interactif"
        },
        {
          "type": "p",
          "text": "Mensualites, capacite d'emprunt, cout reel du logement : les gens acceptent de laisser un contact pour voir le detail. C'est l'outil le plus efficace du secteur. Chez nous : <a href=\"../landings/credit-immo.html\">landing credit immo</a>, <a href=\"../landings/projection-achat.html\">projection achat</a> (taxe fonciere, charges, reste a vivre) et <a href=\"../landings/questionnaire.html?need=credit-immo&journey=standard\">questionnaire 3 min</a>."
        },
        {
          "type": "h3",
          "text": "Lead magnet (guide PDF / checklist)"
        },
        {
          "type": "p",
          "text": "Exemple qui convertit : « Les 7 erreurs a eviter pour son premier pret immo » contre un e-mail. Le contenu doit etre utile et immediatement telechargeable — pas une promesse vague. Relie ensuite a un rappel courtier."
        },
        {
          "type": "h3",
          "text": "Formulaire de rappel visible"
        },
        {
          "type": "p",
          "text": "Sur chaque page importante : « Un conseiller vous rappelle sous 24 h ». Pas cache en bas de footer. Voir aussi <a href=\"../landings/rappel.html?need=credit-immo\">demande de rappel credit</a>."
        },
        {
          "type": "h3",
          "text": "Chat / message temps reel"
        },
        {
          "type": "p",
          "text": "Meme un widget simple (ou WhatsApp pro) capte les questions pendant que l'intention est chaude. L'objectif n'est pas de « chatter pour chatter » : c'est de transformer une hesitation en prise de contact."
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "2. Generer plus de trafic qualifie"
        },
        {
          "type": "h3",
          "text": "SEO local"
        },
        {
          "type": "p",
          "text": "Fiche Google Business Profile a jour, avis, photos, categories. Mots-cles du type « courtier pret immobilier Nancy », « pret immobilier Meurthe-et-Moselle ». Le credit immo se cherche beaucoup en local — d'ou nos pages geo <a href=\"../pret-immobilier/\">pret immobilier par ville</a>."
        },
        {
          "type": "h3",
          "text": "Contenu de longue traine"
        },
        {
          "type": "p",
          "text": "Visez des questions precises plutot que des mots generiques trop concurrentiels : « taux pret immobilier 2026 », « simulation rachat de credit », « pret refuse que faire », « visites sans financement ». Le blog sert a ca — ex. <a href=\"./pret-immobilier-refuse-que-faire-2026.html\">pret refuse</a>, <a href=\"./taux-pret-immobilier-aout-2026-rentree.html\">taux aout 2026</a>."
        },
        {
          "type": "h3",
          "text": "Comparatif / barometre de taux"
        },
        {
          "type": "p",
          "text": "Contenu tres recherche et partage : positionne le site comme reference. Mettez a jour regulierement et CTA vers simulation personnalisee (le taux affiche n'est jamais le dossier final)."
        },
        {
          "type": "h3",
          "text": "Partenariats"
        },
        {
          "type": "p",
          "text": "Agences immobilieres, negociateurs, notaires, apporteurs : echange de leads qualifies (vendeur ↔ acheteur finance). C'est souvent plus rentable qu'un CPC froid. Notre angle : <strong>vente + pret</strong> pour que les dossiers tiennent jusqu'au notaire."
        },
        {
          "type": "h3",
          "text": "Google Ads a forte intention"
        },
        {
          "type": "p",
          "text": "Requetes du type « simulation pret immobilier gratuit », « courtier credit immo ». Le cout par clic est eleve, mais le taux de conversion aussi — a condition d'arriver sur une landing avec simulateur + rappel, pas une homepage generique. Budget : seulement apres validation pixel / preuves organiques (voir notre logique d'acquisition blog → Lead)."
        },
        {
          "type": "figure",
          "src": "./images/finance/signature-pret.jpg",
          "alt": "Dossier de pret signe",
          "caption": "Trafic qualifie = intention d'emprunter ou de vendre, pas seulement de « regarder des annonces »."
        },
        {
          "type": "h2",
          "text": "3. Levier souvent neglige : videos courtes"
        },
        {
          "type": "p",
          "text": "Shorts / Reels / TikTok : « Calculer sa capacite d'emprunt en 2 min », « 3 raisons pour lesquelles votre bien ne se vend pas », « Banque seule vs courtier ». Cout bas, confiance avant le premier appel, trafic vers simulateur ou rappel. Une video = une idee = un CTA clair."
        },
        {
          "type": "h2",
          "text": "4. Checklist action (cette semaine)"
        },
        {
          "type": "ul",
          "items": [
            "Verifier qu'un CTA rappel ou questionnaire est visible above the fold sur les landings credit / acheteur / vendeur",
            "Tester le parcours simulateur → contact sur mobile",
            "Publier 1 article longue traine lie a une question client reelle",
            "Mettre a jour Google Business (horaires, zone, photos)",
            "Filmer 1 Short capacite d'emprunt → lien bio vers projection / credit-immo",
            "Ne lancer Ads que sur une URL deja mesuree (Lead / formulaire)"
          ]
        },
        {
          "type": "p",
          "text": "Vous etes particulier (achat / vente) ? Passez directement a l'<a href=\"../landings/credit-immo.html\">etude de pret</a> ou au <a href=\"../landings/acheteur-immo.html\">parcours acheteur / vendeur</a>. Vous etes pro et voulez structurer l'acquisition : cette page est votre feuille de route — on l'applique deja sur leadsopportunities.fr."
        },
        {
          "type": "h2",
          "text": "Pour aller plus loin"
        },
        {
          "type": "p",
          "text": "Lire aussi : <a href=\"./pourquoi-mon-bien-ne-se-vend-pas.html\">bien qui ne se vend pas</a>, <a href=\"./visites-sans-financement-vente-negociateur-courtier.html\">visites sans pret</a>, <a href=\"./taux-pret-immobilier-aout-2026-rentree.html\">taux pret aout 2026</a>."
        }
      ],
      "related": [
        {
          "href": "../landings/credit-immo.html",
          "label": "Credit immo"
        },
        {
          "href": "../landings/projection-achat.html",
          "label": "Projection achat"
        },
        {
          "href": "../pret-immobilier/",
          "label": "Pret par ville"
        },
        {
          "href": "./pret-immo-erreurs-a-eviter.html",
          "label": "Erreurs pret immo"
        },
        {
          "href": "./visites-sans-financement-vente-negociateur-courtier.html",
          "label": "Visites sans financement"
        },
        {
          "href": "./pourquoi-mon-bien-ne-se-vend-pas.html",
          "label": "Bien qui ne se vend pas"
        }
      ],
      "faq": [
        {
          "q": "Faut-il d'abord plus de trafic ou mieux convertir ?",
          "a": "Les deux, mais la conversion du trafic existant rapporte plus vite et ne coute presque rien. Ensuite seulement, scale SEO / Ads."
        },
        {
          "q": "Pourquoi le simulateur convertit-il si bien ?",
          "a": "Parce qu'il repond a une question urgente (mensualite / capacite) et justifie un echange de contact pour le detail."
        },
        {
          "q": "Google Ads est-il rentable en credit immo ?",
          "a": "Oui sur des requetes a forte intention, si la landing convertit. Le CPC est eleve : mesurez le cout par Lead, pas le trafic."
        }
      ]
    },
    {
      "file": "visites-sans-financement-vente-negociateur-courtier.html",
      "audience": "france",
      "section": "finance",
      "tag": "Vente & credit",
      "tagClass": "tag-immo",
      "themes": [
        "emprunteur"
      ],
      "title": "Visites sans financement : pourquoi le bien ne se vend pas",
      "description": "Beaucoup de visites, aucune offre solide : sans projet de pret credible, un bien stagne. Negociateur immo + courtier ORIAS : on vend et on finance l'acquereur.",
      "meta": "8 min · Aout 2026",
      "cardExcerpt": "Visites sans pret = bien qui ne part pas. On couple vente et financement.",
      "cta": {
        "href": "../landings/questionnaire.html?need=credit-immo&journey=standard&utm_source=blog&utm_medium=actu_daily&utm_campaign=credit-immo&utm_content=visites-financement",
        "label": "Etude pret + vente (3 min)"
      },
      "heroImage": {
        "src": "./images/finance/credit-immo-cles.jpg",
        "alt": "Cles de maison et dossier de credit immobilier",
        "caption": "Une visite sans enveloppe de pret validee reste une curiosite — pas une vente."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Vous avez un bien en vente. L'annonce tourne, le telephone sonne, les <strong>visites s'enchainent</strong>… et pourtant rien ne se signe. Dans la majorite des cas, le probleme n'est ni la deco ni le quartier : c'est que les visiteurs n'ont <strong>pas de projet de financement solide</strong>. Sans pret credible, pas d'offre serieuse. Sans offre serieuse, le bien ne se vend pas — il s'use sur le marche."
        },
        {
          "type": "figure",
          "src": "./images/habitat/maison-famille.jpg",
          "alt": "Maison familiale a vendre",
          "caption": "Multiplier les visites sans filtrer le financement allonge la vente et fait baisser le prix."
        },
        {
          "type": "h2",
          "text": "1. Visite ≠ acheteur"
        },
        {
          "type": "p",
          "text": "Scroller Leboncoin ou SeLoger, demander une visite, c'est facile. Obtenir un <strong>accord de principe</strong> ou une simulation multi-banques, c'est autre chose. Beaucoup de « acheteurs » decourvrent au moment de l'offre que leur banque refuse, que l'apport manque, ou que le taux d'endettement depasse 35 %. Resultat pour le vendeur : calendrier pourri, espoirs casses, puis baisse de prix « pour deblocker »."
        },
        {
          "type": "ul",
          "items": [
            "Visiteur sans simulation recente → risque elevé de refus apres compromis",
            "Offre sous condition suspensive de pret mal preparee → delai 45–60 jours perdus",
            "Bien « brule » apres plusieurs echecs → acheteurs suivants negocient plus bas"
          ]
        },
        {
          "type": "h2",
          "text": "2. Pourquoi le financement decide de la vente"
        },
        {
          "type": "p",
          "text": "Un notaire et un vendeur ont besoin d'un <strong>acquereur solvable</strong>. Le prix affiche ne compte que si quelqu'un peut l'emprunter. C'est pour cela qu'en tant que <strong>negociateur immobilier et courtier</strong> (ORIAS), nous ne separons pas les deux metiers : on prepare le bien <strong>et</strong> on monte le dossier de pret de l'acquereur."
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "3. Notre double role : vendre + obtenir le pret"
        },
        {
          "type": "ul",
          "items": [
            "<strong>Cote vendeur</strong> : estimation, annonce, qualifications des visiteurs, negociation, suivi jusqu'a l'acte",
            "<strong>Cote acquereur</strong> : capacite d'emprunt, apport, assurance emprunteur, comparatif banques, pieces, delai de reponse",
            "<strong>Ensemble</strong> : on ne fait pas visiter « pour remplir le carnet » — on priorise les profils finançables"
          ]
        },
        {
          "type": "p",
          "text": "Concretement : avant ou juste apres la visite, on verifie si le projet tient (revenus, charges, apport, duree). Si besoin, on lance une <a href=\"../landings/credit-immo.html\">etude credit immo</a> pendant que le bien est encore sur le marche — pas le jour du compromis."
        },
        {
          "type": "figure",
          "src": "./images/finance/signature-pret.jpg",
          "alt": "Signature de dossier de pret immobilier",
          "caption": "Pret calé = offre credible = signature chez le notaire."
        },
        {
          "type": "h2",
          "text": "4. Ce que ca change pour le vendeur"
        },
        {
          "type": "ul",
          "items": [
            "Moins de visites « tourisme », plus de rendez-vous utiles",
            "Offres avec financement deja cadre (ou clairement cadré)",
            "Delais de condition suspensive mieux maitrises",
            "Prix mieux defendu : un bien qui trainait moins se negocie moins"
          ]
        },
        {
          "type": "p",
          "text": "Vous vendez ? Parlez-nous du bien et du calendrier : <a href=\"../landings/acheteur-immo.html?role=vendeur\">parcours vendeur</a>. Vous achetez ? Securisez d'abord l'enveloppe : <a href=\"../landings/acheteur-immo.html\">parcours acheteur</a> + pret."
        },
        {
          "type": "h2",
          "text": "5. Ce que ca change pour l'acquereur"
        },
        {
          "type": "p",
          "text": "Arriver en visite avec une <strong>enveloppe de pret</strong> (meme indicative) change le regard du vendeur et de l'agence. Vous etes pris au serieux. Et si le bien plait, on enchaine negociation + montage multi-banques sans perdre trois semaines a « voir avec ma banque seule » — le piege classique."
        },
        {
          "type": "p",
          "text": "Projection budget reel (taxe foncière, charges, mensualite) : <a href=\"../landings/projection-achat.html\">projection achat</a>. Si un pret a deja ete refuse : <a href=\"./pret-immobilier-refuse-que-faire-2026.html\">que faire apres un refus</a>."
        },
        {
          "type": "h2",
          "text": "6. En resume"
        },
        {
          "type": "p",
          "text": "<strong>Un bien qui n'attire que des visites sans projet de financement solide ne se vend pas — ou se vend trop tard et trop bas.</strong> C'est exactement pour cela que Leads Opportunities couple <strong>negociation immobiliere</strong> et <strong>courtage en pret</strong> : on s'occupe de la vente <em>et</em> de l'obtention du pret pour l'acquereur, pour que la signature tienne jusqu'au notaire."
        },
        {
          "type": "h2",
          "text": "Pour aller plus loin"
        },
        {
          "type": "p",
          "text": "Lire aussi : <a href=\"./pourquoi-mon-bien-ne-se-vend-pas.html\">pourquoi mon bien ne se vend pas</a>, <a href=\"./site-immobilier-peu-de-trafic-leads-conversion.html\">attirer et convertir du trafic immo</a>, <a href=\"../landings/projection-achat.html\">projection cout reel</a>."
        }
      ],
      "related": [
        {
          "href": "../landings/acheteur-immo.html?role=vendeur",
          "label": "Je vends mon bien"
        },
        {
          "href": "../landings/credit-immo.html",
          "label": "Credit immobilier"
        },
        {
          "href": "../landings/acheteur-immo.html",
          "label": "Je cherche un bien"
        },
        {
          "href": "./pret-immobilier-refuse-que-faire-2026.html",
          "label": "Pret refuse"
        },
        {
          "href": "./pourquoi-mon-bien-ne-se-vend-pas.html",
          "label": "Pourquoi mon bien ne se vend pas"
        },
        {
          "href": "./site-immobilier-peu-de-trafic-leads-conversion.html",
          "label": "Trafic & conversion immo"
        }
      ],
      "faq": [
        {
          "q": "Pourquoi filtrer les visiteurs sur le financement ?",
          "a": "Parce qu'une visite sans capacite d'emprunt credible consomme du temps, use le bien sur le marche et retarde une vraie offre."
        },
        {
          "q": "Dois-je avoir un accord de pret avant de visiter ?",
          "a": "Un accord ferme n'est pas obligatoire, mais une simulation recente et un dossier pret a demarrer changent tout pour le vendeur."
        },
        {
          "q": "En quoi un negociateur-courtier change la donne ?",
          "a": "Il aligne prix, calendrier de vente et montage bancaire : moins d'echecs apres compromis, plus d'offres qui aboutissent chez le notaire."
        }
      ]
    },
    {
      "file": "pourquoi-mon-bien-ne-se-vend-pas.html",
      "audience": "france",
      "section": "finance",
      "tag": "Vente",
      "tagClass": "tag-immo",
      "themes": [
        "emprunteur"
      ],
      "title": "Pourquoi mon bien ne se vend pas alors que je pensais que ca irait ?",
      "description": "Vous etiez sur que ca partirait vite : et pourtant rien. Prix, photos, financement des acheteurs, concurrence — les vraies raisons, et comment debloquer avec negociateur + courtier.",
      "meta": "9 min · Aout 2026",
      "cardExcerpt": "« Je pensais que ca se vendrait » : pourquoi ca bloque, et quoi faire.",
      "cta": {
        "href": "../landings/acheteur-immo.html?role=vendeur&utm_source=blog&utm_medium=actu_daily&utm_campaign=vendeur&utm_content=bien-ne-vend-pas",
        "label": "Diagnostic de ma vente"
      },
      "heroImage": {
        "src": "./images/habitat/maison-famille.jpg",
        "alt": "Maison familiale en vente",
        "caption": "Un bien « trop beau pour ne pas partir » peut rester des mois si le prix ou le financement ne collent pas."
      },
      "blocks": [
        {
          "type": "p",
          "text": "Vous aviez tout calcule : travaux faits, annonce en ligne, voisins qui disent que « ca partira en quinze jours ». Et la… les semaines passent. <strong>Pourquoi mon bien ne se vend pas alors que je pensais que ca se ferait ?</strong> Ce n'est presque jamais « le marche est mort ». C'est presque toujours un ecart entre <em>ce que vous croyez</em> et <em>ce que les acheteurs (et les banques) peuvent vraiment faire</em>."
        },
        {
          "type": "figure",
          "src": "./images/finance/credit-immo-cles.jpg",
          "alt": "Cles et credit immobilier",
          "caption": "Vendre, c'est trouver quelqu'un qui peut emprunter — pas seulement quelqu'un qui aime le salon."
        },
        {
          "type": "h2",
          "text": "1. « Je pensais que ca irait » : d'ou vient cette certitude ?"
        },
        {
          "type": "ul",
          "items": [
            "Un voisin a vendu l'annee derniere a un prix dont on se souvient mal",
            "Des sites d'estimation en ligne trop optimistes",
            "L'attachement au bien : on ajoute la valeur emotionnelle au prix",
            "Beaucoup de clics / messages = illusion de demande"
          ]
        },
        {
          "type": "p",
          "text": "Le marche 2026 n'est plus celui de 2021. Les taux, l'apport exige et le reste a vivre freinent des profils qui, hier, auraient signe. Votre bien peut etre tres bien — et quand meme trop cher <strong>pour les dossiers qui passent en banque aujourd'hui</strong>."
        },
        {
          "type": "h2",
          "text": "2. Les 7 freins les plus frequents"
        },
        {
          "type": "ul",
          "items": [
            "<strong>Prix au-dessus du marche</strong> : 5 a 10 % de trop = silence radio ou visites sans offre",
            "<strong>Visites sans financement</strong> : curiosite, pas d'acheteurs — voir <a href=\"./visites-sans-financement-vente-negociateur-courtier.html\">visites sans pret</a>",
            "<strong>Photos / annonce faibles</strong> : le bien n'est pas vu par les bons profils",
            "<strong>Concurrence locale</strong> : deux biens similaires moins chers a 800 m",
            "<strong>Travaux / DPE</strong> : les banques et acheteurs decotent fort le G ou le « a retaper »",
            "<strong>Disponibilite</strong> : difficile a visiter = moins d'acheteurs serieux",
            "<strong>Histoire du dossier</strong> : bien deja « brule » apres plusieurs echecs de pret"
          ]
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "3. Le piege : baisser trop tard (ou trop peu)"
        },
        {
          "type": "p",
          "text": "Beaucoup de vendeurs attendent trois mois, puis baissent de 2 000 €. Trop peu, trop tard : le bien est deja marque « qui ne part pas ». Mieux vaut un <strong>diagnostic de prix + de financement</strong> des les premieres semaines, plutot qu'une guerre d'usure avec le marche."
        },
        {
          "type": "figure",
          "src": "./images/finance/signature-pret.jpg",
          "alt": "Signature chez le notaire",
          "caption": "Objectif : une offre qui tient jusqu'a l'acte — pas une visite de plus."
        },
        {
          "type": "h2",
          "text": "4. Ce que change un negociateur + courtier"
        },
        {
          "type": "p",
          "text": "Chez Leads Opportunities, on ne se contente pas de « mettre l'annonce ». On couple <strong>negociation immobiliere</strong> et <strong>courtage en pret</strong> (ORIAS) :"
        },
        {
          "type": "ul",
          "items": [
            "Recaler le prix sur ce que les acheteurs locaux peuvent emprunter",
            "Filtrer les visites : priorite aux projets finançables",
            "Monter le pret de l'acquereur pendant la negociation — pas apres le refus",
            "Eviter les compromis qui explosent a 45 jours pour condition suspensive"
          ]
        },
        {
          "type": "p",
          "text": "En clair : on s'occupe de <strong>vendre votre bien</strong> et d'<strong>obtenir le pret pour l'acquereur</strong>. C'est souvent la seule facon de transformer « je pensais que ca se ferait » en signature chez le notaire."
        },
        {
          "type": "h2",
          "text": "5. Checklist express si ca ne part pas"
        },
        {
          "type": "ul",
          "items": [
            "Comparer 3 ventes recentes dans un rayon serre (pas des annonces concurrentes)",
            "Refaire photos + texte (luminosite, plan, charges, taxe fonciere)",
            "Demander a chaque visiteur s'il a une simulation de pret de moins de 30 jours",
            "Tester une baisse ciblee plutot qu'une interminable attente",
            "Faire relire le dossier par un courtier : quel budget acheteur « passe » vraiment ?"
          ]
        },
        {
          "type": "p",
          "text": "Pret a un diagnostic sans engagement : <a href=\"../landings/acheteur-immo.html?role=vendeur\">parcours vendeur</a>. Coté acheteur / pret : <a href=\"../landings/credit-immo.html\">etude credit immo</a>. Situations sensibles (divorce, succession…) : <a href=\"./vente-immobiliere-3d-divorce-deces-demenagement.html\">ventes complexes</a>."
        },
        {
          "type": "h2",
          "text": "Pour aller plus loin"
        },
        {
          "type": "p",
          "text": "Lire aussi : <a href=\"./visites-sans-financement-vente-negociateur-courtier.html\">visites sans financement</a>, <a href=\"./vente-immobiliere-3d-divorce-deces-demenagement.html\">ventes complexes (3D)</a>, <a href=\"./site-immobilier-peu-de-trafic-leads-conversion.html\">strategie trafic &amp; leads</a>."
        }
      ],
      "related": [
        {
          "href": "./visites-sans-financement-vente-negociateur-courtier.html",
          "label": "Visites sans financement"
        },
        {
          "href": "../landings/acheteur-immo.html?role=vendeur",
          "label": "Je vends"
        },
        {
          "href": "../landings/credit-immo.html",
          "label": "Credit immo"
        },
        {
          "href": "./vente-immobiliere-3d-divorce-deces-demenagement.html",
          "label": "Ventes complexes"
        },
        {
          "href": "./site-immobilier-peu-de-trafic-leads-conversion.html",
          "label": "Trafic & conversion immo"
        }
      ],
      "faq": [
        {
          "q": "Mon bien est beau : pourquoi personne n'achete ?",
          "a": "La beaute ne paie pas la mensualite. Si le prix depasse ce que les banques acceptent pour les profils locaux, les visites restent sans offre."
        },
        {
          "q": "Faut-il baisser le prix tout de suite ?",
          "a": "Pas forcement. D'abord verifier estimation, photos et financement des visiteurs. Une baisse mal dosee ou trop tardive peut aussi bruler le bien."
        },
        {
          "q": "En quoi un courtier aide le vendeur ?",
          "a": "Il qualifie la solvabilite des acquereurs et monte le pret : moins d'echecs apres compromis, vente plus rapide et plus sure."
        }
      ]
    },
    {
      "file": "pret-immo-erreurs-a-eviter.html",
      "section": "finance",
      "tag": "Immo",
      "tagClass": "tag-immo",
      "title": "Pret immobilier : 7 erreurs a eviter en 2026",
      "description": "Credit immo, apport, assurance emprunteur, taux : pieges frequents.",
      "meta": "8 min · Mai 2026",
      "cardExcerpt": "Pret immo : erreurs courantes.",
      "cta": {
        "href": "../landings/questionnaire.html?need=credit-immo&journey=standard",
        "label": "Questionnaire crédit immo"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Un <strong>prêt immobilier</strong> se joue sur des détails : apport, durée, taux, assurance emprunteur, frais de notaire. Voici les <strong>7 erreurs</strong> qui coûtent le plus cher en 2026 — et comment les éviter avant signature chez le notaire."
        },
        {
          "type": "h2",
          "text": "Erreur 1 — Négliger l'assurance emprunteur"
        },
        {
          "type": "p",
          "text": "La banque propose « son » assurance groupe. Sans comparer une délégation (loi Lemoine), vous laissez souvent <strong>5 000 à 12 000 €</strong> sur la table sur 20 ans."
        },
        {
          "type": "h2",
          "text": "Erreur 2 — Maximiser la durée pour « respirer »"
        },
        {
          "type": "p",
          "text": "25 ans au lieu de 20 ans : mensualité plus basse, mais intérêts totaux bien plus élevés. Simulez 3 durées avec le même apport."
        },
        {
          "type": "h2",
          "text": "Erreurs 3 à 7 (checklist)"
        },
        {
          "type": "ul",
          "items": [
            "Apport trop faible → taux plus haut + assurance plus chère",
            "Oublier les frais de garantie (hypothèque / caution)",
            "Signer sans clause de renégociation ou de remboursement anticipé claire",
            "Sous-estimer le reste à vivre (banque + votre budget réel)",
            "Ne pas faire jouer la concurrence entre banques avec un dossier prêt"
          ]
        },
        {
          "type": "bridge"
        }
      ],
      "related": [
        {
          "href": "../credit-immo/",
          "label": "Credit immobilier"
        },
        {
          "href": "./site-immobilier-peu-de-trafic-leads-conversion.html",
          "label": "Trafic & conversion"
        },
        {
          "href": "./visites-sans-financement-vente-negociateur-courtier.html",
          "label": "Visites sans financement"
        }
      ]
    },
    {
      "file": "vente-immobiliere-3d-divorce-deces-demenagement.html",
      "section": "finance",
      "tag": "Vente",
      "tagClass": "tag-immo",
      "title": "Vendre son bien : divorce, deces, demenagement et situations complexes",
      "description": "Divorce, deces, demenagement, heritage conflictuel, viager, SCI, locaux pro : vendre dans une etape difficile. Notaire, avocat — accompagnement humain.",
      "meta": "12 min · Aout 2026",
      "cardExcerpt": "3D, heritage, viager, SCI, locaux pro : vous n'etes pas seul.",
      "cta": {
        "href": "../landings/acheteur-immo.html?role=vendeur",
        "label": "Parler de ma vente"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Vendre un <strong>bien immobilier</strong>, ce n'est pas toujours un choix « classique ». Dans le metier, on evoque les <strong>3D</strong> : <strong>divorce</strong>, <strong>deces</strong>, <strong>demenagement</strong>. Derriere, il y a souvent plus : <strong>heritiers qui ne s'accordent pas</strong>, <strong>ex-conjoints en desaccord</strong>, <strong>viager</strong>, <strong>SCI familiale</strong>, <strong>locaux professionnels</strong>… Des moments ou la vente devient sensible — et ou vous meritez d'etre entendu, pas presses."
        },
        {
          "type": "h2",
          "text": "Les 3D, ce que ca veut dire concretement"
        },
        {
          "type": "ul",
          "items": [
            "Divorce ou separation : partage du bien, credit en cours, calendrier avec l'autre partie",
            "Deces : succession, indivision entre heritiers, delais et mandats",
            "Demenagement : vente en chaine, depart en retraite, mutation professionnelle"
          ]
        },
        {
          "type": "h2",
          "text": "Divorce et separation : vendre sans aggraver la situation"
        },
        {
          "type": "p",
          "text": "La vente du <strong>bien commun</strong> intervient souvent dans un contexte de divorce ou de separation. Points sensibles : qui habite encore le logement, qui paie le credit, a quel prix vendre, dans quel delai — surtout quand les deux parties <strong>ne sont pas d'accord</strong>. Un <strong>avocat</strong> traite le volet juridique ; le <strong>notaire</strong> securise l'acte ; notre role est de <strong>coordonner la mise en vente</strong> et la recherche d'acquereur sans precipiter une decision que vous regretteriez, ni forcer un prix « pour calmer le conflit »."
        },
        {
          "type": "p",
          "text": "Si un <strong>credit immobilier</strong> est en cours, la banque et le co-emprunteur entrent en ligne de compte. Mieux vaut anticiper le solde du pret, les indemnites eventuelles et la repartition des fonds avant de fixer un prix « pour aller vite »."
        },
        {
          "type": "h2",
          "text": "Deces : vendre dans le respect du rythme familial"
        },
        {
          "type": "p",
          "text": "Apres un <strong>deces</strong>, la vente peut etre necessaire pour partager la succession ou liberer un bien devenu inoccupe. Avec <strong>de nombreux beneficiaires</strong>, les desaccords sur le prix, le calendrier ou l'agent a mandater sont frequents. Le <strong>notaire</strong> est central ; nous pouvons proposer une <strong>estimation argumentee</strong>, organiser les visites et recroiser avec des acquereurs — en respectant les delais legaux et la charge emotionnelle de chacun, sans imposer un accord artificiel."
        },
        {
          "type": "h2",
          "text": "Heritage : quand les heritiers ne tombent pas d'accord"
        },
        {
          "type": "p",
          "text": "Indivision, parts inegales, l'un veut vendre vite, l'autre garder le bien : ce n'est pas rare. Avant de baisser le prix « pour en finir », clarifiez qui peut signer, quel est le prix de marche reel et quelles alternatives existent (location, rachat de parts par un heritier). Notre approche : <strong>ecouter chaque partie</strong>, documenter l'estimation, et avancer au rythme du cadre juridique — pas au rythme de la colere."
        },
        {
          "type": "h2",
          "text": "Vente en viager : un montage a part entiere"
        },
        {
          "type": "p",
          "text": "Le <strong>viager</strong> (occupe ou libre) peut convenir a un vendeur qui cherche un revenu complementaire ou a un acquereur avec un budget limite. Mais bouquet, rente, esperance de vie, occupation du logement : tout doit etre chiffre avec le <strong>notaire</strong>. Ce n'est pas une vente classique — on vous aide a comprendre si c'est pertinent pour votre situation, sans vous orienter vers un montage inadapte."
        },
        {
          "type": "h2",
          "text": "SCI familiale et transmission"
        },
        {
          "type": "p",
          "text": "Une <strong>SCI</strong> est souvent montee pour faciliter la <strong>succession</strong> ou mutualiser un patrimoine familial. Vendre le bien de la SCI, ou ceder des parts, implique plusieurs associes et parfois des statuts contraignants. Chaque structure merite une lecture attentive : qui decide, a quelle majorite, quel impact fiscal. On recoupe avec le notaire et, si besoin, l'expert-comptable."
        },
        {
          "type": "h2",
          "text": "Locaux professionnels, entreprise et fonds de commerce"
        },
        {
          "type": "p",
          "text": "Boutique, bureau, entrepot, local commercial avec <strong>bail</strong>, parfois <strong>fonds de commerce</strong> : la logique n'est pas celle de l'habitation. Estimation, duree du bail, travaux, clientele — tout entre en ligne de compte. Si vous vendez dans un contexte de <strong>cessation d'activite</strong> ou de transmission d'entreprise, on avance avec vos conseils (avocat, expert-comptable) pour ne pas melanger les enjeux."
        },
        {
          "type": "h2",
          "text": "Demenagement : vendre pour rebondir ailleurs"
        },
        {
          "type": "p",
          "text": "Parfois la vente est liee a un <strong>demenagement</strong> : mutation, rapprochement familial, maison trop grande, besoin de monter ou descendre en surface. La vente en chaine (vendre puis racheter) demande une vraie coordination : date de sortie, <strong>pret relais</strong>, delai de refus bancaire sur le prochain achat. C'est la que notre travail de <strong>chasseur de bien</strong> et de courtier prend tout son sens : aligner vendeur et acquereur, sans vous laisser seul entre deux notaires."
        },
        {
          "type": "h2",
          "text": "Notaire, avocat, courtier : qui fait quoi ?"
        },
        {
          "type": "ul",
          "items": [
            "Notaire : acte authentique, securite juridique, calcul des droits",
            "Avocat : divorce, partage, contentieux entre heritiers si besoin",
            "Courtier / accompagnant immo : estimation, acquereurs, credit, assurance emprunteur, calendrier global"
          ]
        },
        {
          "type": "h2",
          "text": "Notre promesse : vous concernent, vous accompagner"
        },
        {
          "type": "p",
          "text": "Si vous traversez l'une de ces etapes, <strong>vous etes concerne</strong> — et vous n'etes pas oblige de tout porter seul. Nous ne promettons pas un mandat ni un delai miracle ; nous promettons d'<strong>ecouter la situation</strong>, d'en parler franchement (y compris quand un autre bien ou un autre calendrier serait plus sain), et de vous aider a atteindre votre objectif sans vous mettre en danger financierement."
        }
      ],
      "related": [
        {
          "href": "../landings/acheteur-immo.html?role=vendeur",
          "label": "Deposer un bien a vendre"
        },
        {
          "href": "../landings/chasseur-bien.html",
          "label": "Chasseur de bien"
        },
        {
          "href": "../landings/credit-immo.html",
          "label": "Credit et pret relais"
        },
        {
          "href": "./pret-refuse-co-emprunteur-caution-solutions.html",
          "label": "Co-emprunteur et caution"
        },
        {
          "href": "./pourquoi-mon-bien-ne-se-vend-pas.html",
          "label": "Pourquoi mon bien ne se vend pas"
        },
        {
          "href": "./visites-sans-financement-vente-negociateur-courtier.html",
          "label": "Visites sans financement"
        }
      ],
      "faq": [
        {
          "q": "Plusieurs heritiers ne s'accordent pas sur le prix : que faire ?",
          "a": "Ne bradez pas par epuisement. Faites estimer le bien de facon argumentee, clarifiez qui peut signer avec le notaire, et explorez les options (vente, rachat de parts, location). Un accompagnement neutre aide a depasser le blocage."
        },
        {
          "q": "Ex-conjoints en desaccord sur la vente : pouvez-vous intervenir ?",
          "a": "Oui, dans le respect du cadre juridique fixe par l'avocat et le notaire. On coordonne estimation et mise en relation acquereur — sans prendre le parti d'une partie ni forcer un prix."
        },
        {
          "q": "Vente en viager ou SCI : est-ce dans votre champ ?",
          "a": "Oui. Viager, SCI familiale, locaux pro : ce sont des montages specifiques. On clarifie les etapes avec le notaire et vos autres conseils avant toute decision."
        },
        {
          "q": "Dois-je vendre vite apres un divorce ?",
          "a": "Pas necessairement. Le calendrier depend du jugement, du credit et de votre situation personnelle. Precipiter la vente peut faire baisser le prix ou aggraver les tensions."
        },
        {
          "q": "Qui signe la vente apres un deces ?",
          "a": "Les heritiers ou le notaire selon la succession. Chaque cas est unique : ne vendez pas sans cadre juridique clair."
        },
        {
          "q": "Puis-je vendre et racheter en meme temps ?",
          "a": "Oui (vente en chaine, pret relais). Il faut anticiper banque, dates et reste a vivre — c'est un montage a preparer, pas une urgence subie."
        }
      ]
    },
    {
      "file": "taux-credit-immobilier-2026-frais-dossier.html",
      "section": "finance",
      "tag": "Taux & frais",
      "tagClass": "tag-immo",
      "title": "Taux credit immobilier 2026 : frais de dossier et assurance emprunteur",
      "description": "Taux credit immobilier 2026, frais dossier banque, courtage : preparer un pret immo realiste.",
      "meta": "9 min · Juin 2026",
      "cardExcerpt": "Taux 2026 + frais caches du pret.",
      "cta": {
        "href": "../landings/credit-immo.html",
        "label": "Simulation credit immo"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Le <strong>taux credit immobilier 2026</strong> depend de votre profil, de la duree et de la banque. Mais le cout total inclut aussi les <strong>frais de dossier</strong>, le courtage, le notaire et l'<strong>assurance emprunteur</strong> — souvent sous-estimes."
        },
        {
          "type": "h2",
          "text": "Comprendre le taux affiche"
        },
        {
          "type": "p",
          "text": "Distinguez taux fixe, variable et mixte. Le TAEG integre une partie des frais ; comparez toujours TAEG + assurance + frais one-shot sur la duree totale du pret."
        },
        {
          "type": "h2",
          "text": "Frais de dossier et frais de garantie"
        },
        {
          "type": "ul",
          "items": [
            "Frais de dossier banque : souvent negociables (0 a 1 % du montant)",
            "Frais de garantie (hypotheque, caution) : impact majeur",
            "Frais de courtier : transparent si mandat signe",
            "Frais de notaire : barème legal selon prix et neuf / ancien"
          ]
        },
        {
          "type": "h2",
          "text": "Assurance emprunteur : le levier Lemoine"
        },
        {
          "type": "p",
          "text": "L'<strong>assurance emprunteur</strong> peut representer 20 à 30 % du cout total du credit. La loi Lemoine permet de changer d'assureur a tout moment (sous conditions). Faites chiffrer banque vs delegation externe sur la meme base medicale."
        }
      ],
      "related": [
        {
          "href": "../credit-immo/simulation/",
          "label": "Simulation credit immo"
        },
        {
          "href": "../credit-immo/taux-pret/",
          "label": "Taux pret immobilier"
        },
        {
          "href": "./assurance-emprunteur-loi-lemoine-2026.html",
          "label": "Loi Lemoine 2026"
        },
        {
          "href": "./pret-immo-erreurs-a-eviter.html",
          "label": "Erreurs pret immo"
        }
      ]
    },
    {
      "file": "rachat-credit-immobilier-guide-2026.html",
      "section": "finance",
      "tag": "Rachat",
      "tagClass": "tag-immo",
      "title": "Rachat credit immobilier 2026 : quand ca vaut le coup",
      "description": "Regroupement de credits, baisse de mensualites, rachat credit immobilier : etude de faisabilite.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "Rachat credit : baisser la mensualite.",
      "cta": {
        "href": "../landings/credit-immo.html",
        "label": "Etude rachat credit"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Le <strong>rachat credit immobilier</strong> (ou regroupement) fusionne plusieurs credits en un seul pret, souvent sur une duree plus longue. Objectif : <strong>baisser la mensualite</strong> — au prix d'un cout total parfois plus eleve."
        },
        {
          "type": "h2",
          "text": "Quels credits peuvent etre rachetes ?"
        },
        {
          "type": "ul",
          "items": [
            "Pret immobilier residuel",
            "Credits consommation",
            "Credits auto",
            "Decouverts et dettes certaines (selon banque racheteuse)"
          ]
        },
        {
          "type": "h2",
          "text": "Conditions de faisabilite"
        },
        {
          "type": "p",
          "text": "Taux d'endettement apres operation (souvent plafonne), reste a vivre, age en fin de pret, valeur du bien si garantie hypothecaire. Un <strong>courtier pret immobilier</strong> simule plusieurs scenarii avant depot dossier."
        },
        {
          "type": "h2",
          "text": "Frais a integrer"
        },
        {
          "type": "p",
          "text": "IRA (indemnites de remboursement anticipé) sur les credits soldes, frais de dossier du rachat, nouvelle assurance emprunteur. Comparez economie mensuelle vs cout total sur toute la duree."
        }
      ],
      "related": [
        {
          "href": "../credit-immo/rachat-credit/",
          "label": "Page rachat credit"
        },
        {
          "href": "./taux-credit-immobilier-2026-frais-dossier.html",
          "label": "Taux et frais 2026"
        },
        {
          "href": "../landings/credit-immo.html",
          "label": "Landing credit immo"
        }
      ]
    },
    {
      "file": "assurance-auto-bonus-malus.html",
      "section": "auto",
      "tag": "Auto",
      "tagClass": "tag-auto",
      "title": "Assurance auto : bonus, malus et coefficient 2026",
      "description": "Comprendre le CRM, reduire son malus, assurer un jeune conducteur.",
      "meta": "7 min · Mai 2026",
      "cardExcerpt": "Bonus-malus explique.",
      "cta": {
        "href": "../landings/questionnaire.html?need=auto&journey=standard",
        "label": "Questionnaire auto (3 min)"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Le <strong>bonus-malus</strong> (coefficient CRM) modifie votre prime chaque année : −5 % sans sinistre responsable, +25 % (ou plus) après sinistre. Comprendre le CRM évite deux erreurs : changer d'assureur au mauvais moment, ou croire qu'un comparateur « efface » le malus."
        },
        {
          "type": "h2",
          "text": "Comment le CRM évolue"
        },
        {
          "type": "ul",
          "items": [
            "CRM 1,00 = neutre ; 0,50 = bonus 50 % ; 1,25 = malus 25 %",
            "Plafond bonus : 0,50 (50 % de réduction max)",
            "Plafond malus : 1,50 (jusqu'à +50 %), voire plus selon historique",
            "Sinistre non responsable : pas de malus (sauf exceptions contractuelles)"
          ]
        },
        {
          "type": "h2",
          "text": "Changer d'assureur sans perdre son bonus"
        },
        {
          "type": "p",
          "text": "Le CRM est <strong>portable</strong> : le nouvel assureur reprend votre coefficient (relevé d'information). Comparez à garanties identiques : parfois un malus 1,20 chez un assureur compétitif coûte moins qu'un 1,00 ailleurs."
        },
        {
          "type": "bridge"
        }
      ],
      "related": [
        {
          "href": "../assurance-auto/",
          "label": "Assurance auto"
        }
      ]
    },
    {
      "file": "prevoyance-independants-guide.html",
      "section": "prevoyance",
      "tag": "Prevoyance",
      "tagClass": "tag-prevoyance",
      "title": "Prevoyance independants et TNS : guide complet 2026",
      "description": "Arret de travail, invalidite, deces : proteger ses revenus quand on est independant.",
      "meta": "8 min · Mai 2026",
      "cardExcerpt": "Prevoyance TNS : l'essentiel.",
      "cta": {
        "href": "../landings/devis.html?need=prevoyance",
        "label": "Devis prevoyance"
      },
      "blocks": [
        {
          "type": "p",
          "text": "En <strong>independant</strong> ou <strong>TNS</strong>, la Securite sociale ne suffit pas. La <strong>prevoyance</strong> comble l'ecart en cas d'arret, d'invalidite ou de deces."
        }
      ],
      "related": [
        {
          "href": "../assurance-prevoyance/",
          "label": "Assurance prevoyance"
        }
      ]
    },
    {
      "file": "questionnaire-mutuelle-quel-niveau-choisir.html",
      "section": "sante",
      "tag": "Guide pratique",
      "tagClass": "tag-sante",
      "title": "Quel niveau de mutuelle choisir ? Le questionnaire qui tranche en 3 minutes",
      "description": "Entrée de gamme, confort ou premium : comment choisir sa mutuelle sans surpayer. Questionnaire gratuit selon votre profil.",
      "meta": "6 min · Juin 2026",
      "cardExcerpt": "Entrée, confort ou premium : le bon niveau en 3 min.",
      "cta": {
        "href": "../landings/questionnaire.html?need=sante&journey=standard",
        "label": "Lancer le questionnaire mutuelle"
      },
      "blocks": [
        {
          "type": "p",
          "text": "« Entry », « confort », « premium » : les labels marketing ne veulent rien dire sans contexte. Un célibataire sans lunettes n'a pas les mêmes besoins qu'un couple avec deux enfants en orthodontie. Plutôt que deviner, partez d'une <strong>matrice simple</strong> : qui est couvert, quels postes de soins consommez-vous, quel budget mensuel maximum ?"
        },
        {
          "type": "h2",
          "text": "Profil A — Solo, peu de soins"
        },
        {
          "type": "p",
          "text": "Priorité : hospitalisation correcte + médecine courante. Optique/dentaire bas si pas de besoin annuel. Budget cible : <strong>30 à 55 €/mois</strong>."
        },
        {
          "type": "h2",
          "text": "Profil B — Famille, optique et dentaire actifs"
        },
        {
          "type": "p",
          "text": "Priorité : dentaire (prothèses), optique (verres progressifs), pédiatrie. Ne sacrifiez pas l'hospitalisation pour maximiser l'optique. Budget cible : <strong>80 à 160 €/mois</strong> selon enfants."
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "Profil C — TNS / indépendant"
        },
        {
          "type": "p",
          "text": "Pas de part employeur : vous payez 100 %. Visez un bon niveau hospitalisation + prévoyance si revenus variables. Le questionnaire croise statut TNS et postes sensibles."
        },
        {
          "type": "p",
          "text": "Notre <strong>questionnaire mutuelle</strong> (3 minutes, gratuit) reprend ces profils et oriente vers des formules comparables chez les principaux assureurs — sans engagement."
        }
      ],
      "related": [
        {
          "href": "./mutuelle-sante-5-criteres.html",
          "label": "5 critères mutuelle"
        },
        {
          "href": "../assurance-sante/comparatif/",
          "label": "Comparatif mutuelle"
        },
        {
          "href": "../landings/sante.html",
          "label": "Parcours mutuelle complet"
        }
      ]
    },
    {
      "file": "assurance-habitation-sous-assurance-sinistre.html",
      "section": "habitat",
      "tag": "Habitation",
      "tagClass": "tag-habitation",
      "title": "Sous-assurance habitation : le piège qui ruine un sinistre",
      "description": "Plafonds mobilier, valeur à neuf, exclusions : éviter le mauvais surprise le jour du sinistre. Questionnaire habitation gratuit.",
      "meta": "7 min · Juin 2026",
      "cardExcerpt": "Sinistre refusé ou mal indemnisé : causes fréquentes.",
      "cta": {
        "href": "../landings/questionnaire.html?need=habitation&journey=standard",
        "label": "Questionnaire habitation"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Vous pensez être couvert — puis l'assureur indemnise <strong>30 % de vos biens</strong> ou refuse le sinistre pour « sous-évaluation du capital mobilier ». La sous-assurance habitation est l'une des causes les plus fréquentes de litige."
        },
        {
          "type": "h2",
          "text": "Capital mobilier : la règle du inventaire"
        },
        {
          "type": "p",
          "text": "Listez chambre par chambre : électroménager, électronique, vêtements, mobilier. Un T3 peut facilement dépasser <strong>25 000 à 45 000 €</strong> de contenu. Déclarez ce total au contrat — pas une estimation « au pif »."
        },
        {
          "type": "h2",
          "text": "Exclusions qui surprennent"
        },
        {
          "type": "ul",
          "items": [
            "Objets de valeur non déclarés (bijoux, art) — extension nécessaire",
            "Location Airbnb sans option tourisme",
            "Travaux non déclarés modifiant le risque",
            "Absence de déclaration cave / garage / dépendance"
          ]
        },
        {
          "type": "bridge"
        },
        {
          "type": "p",
          "text": "Le questionnaire habitation estime surface, type de logement et valeur mobilier pour calibrer une couverture cohérente — avant le prochain dégât des eaux."
        }
      ],
      "related": [
        {
          "href": "./assurance-habitation-locataire-proprietaire-2026.html",
          "label": "Guide locataire / proprio"
        },
        {
          "href": "../assurance-habitation/",
          "label": "Assurance habitation"
        }
      ]
    },
    {
      "file": "vtc-premiere-course-checklist-assurance.html",
      "section": "vtc",
      "tag": "Checklist VTC",
      "tagClass": "tag-vtc",
      "title": "Avant votre première course VTC : checklist assurance (Uber, Bolt, Heetch)",
      "description": "RC pro, attestation, franchise, plateforme : la checklist assurance avant d'accepter la première course.",
      "meta": "5 min · Juin 2026",
      "cardExcerpt": "Checklist assurance avant la 1re course.",
      "cta": {
        "href": "../landings/questionnaire.html?need=vtc&journey=standard",
        "label": "Questionnaire VTC express"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Vous avez votre carte VTC, le véhicule est prêt, l'appli Uber ou Bolt installée. Dernière étape critique : <strong>vérifier l'assurance</strong>. Une course sans couverture valide peut coûter votre activité — et votre patrimoine personnel."
        },
        {
          "type": "h2",
          "text": "5 points à valider ce soir"
        },
        {
          "type": "ul",
          "items": [
            "Attestation RC pro VTC en cours de validité (PDF prêt pour la plateforme)",
            "Véhicule et immatriculation conformes au contrat",
            "Aucune exclusion « transport rémunéré de personnes »",
            "Franchise sinistre connue et provisionnée",
            "Numéro assistance 24h/24 enregistré dans le téléphone"
          ]
        },
        {
          "type": "bridge"
        },
        {
          "type": "p",
          "text": "Pas sûr que votre contrat actuel passe ? Le <strong>questionnaire VTC</strong> vérifie plateforme, véhicule et ancienneté — réponse orientée en quelques minutes."
        }
      ],
      "related": [
        {
          "href": "./assurance-vtc-creation-chauffeur.html",
          "label": "Création activité VTC"
        },
        {
          "href": "./assurance-vtc-uber-bolt-heetch.html",
          "label": "Contrat compatible plateformes"
        },
        {
          "href": "../landings/vtc.html",
          "label": "Devis VTC complet"
        }
      ]
    },
    {
      "file": "assurance-emprunteur-combien-economiser-lemoine.html",
      "section": "habitat",
      "tag": "Économies",
      "tagClass": "tag-habitation",
      "title": "Assurance emprunteur : combien pouvez-vous économiser avec la Lemoine ?",
      "description": "Simulation économie assurance emprunteur, loi Lemoine, délégation externe : calculez le gain sur 15 ou 20 ans.",
      "meta": "7 min · Juin 2026",
      "cardExcerpt": "Lemoine : combien sur 20 ans de prêt ?",
      "cta": {
        "href": "../landings/questionnaire.html?need=emprunteur&journey=standard",
        "label": "Questionnaire emprunteur"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Sur un prêt de <strong>250 000 € sur 20 ans</strong>, l'assurance groupe bancaire peut coûter <strong>80 à 150 €/mois</strong>. Une délégation externe équivalente descend souvent à <strong>45 à 90 €/mois</strong>. Sur la durée : <strong>8 000 à 18 000 €</strong> d'écart possible — à condition de respecter l'équivalence de garanties."
        },
        {
          "type": "h2",
          "text": "Mini-simulation (ordre de grandeur)"
        },
        {
          "type": "ul",
          "items": [
            "Prêt 180 000 € / 20 ans : économie fréquente 4 000–10 000 €",
            "Prêt 350 000 € / 25 ans : économie fréquente 10 000–22 000 €",
            "Couple 40 ans non-fumeurs : profil souvent favorable en délégation",
            "Profil médical chargé : comparer quand même — tous les assureurs ne tarifient pas pareil"
          ]
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "Prochaine étape"
        },
        {
          "type": "p",
          "text": "Récupérez votre tableau de garanties bancaire, puis lancez le <strong>questionnaire emprunteur</strong> : montant restant dû, âge, fumeur/non-fumeur, quotité — vous serez orienté vers une étude de substitution Lemoine."
        }
      ],
      "related": [
        {
          "href": "./assurance-emprunteur-loi-lemoine-2026.html",
          "label": "Guide loi Lemoine 2026"
        },
        {
          "href": "../assurance-emprunteur/",
          "label": "Assurance emprunteur"
        },
        {
          "href": "../landings/credit-immo.html",
          "label": "Étude crédit immo"
        }
      ]
    },
    {
      "file": "emprunteur-non-residents-investissement-immobilier-2026.html",
      "section": "finance",
      "tag": "Emprunteur",
      "tagClass": "tag-actu",
      "title": "Investir en France sans y resider : assurance emprunteur et pret immo",
      "description": "Utwin, Mutlog et le marche emprunteur pour acquereurs non-residents : garanties, delegation, Lemoine — questionnaire gratuit.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "Non-resident qui achete en France : l'assurance emprunteur est le vrai sujet.",
      "cta": {
        "href": "../landings/questionnaire.html?need=emprunteur&journey=standard&utm_source=blog&utm_medium=actu_daily&utm_campaign=emprunteur&utm_content=non-residents-2026",
        "label": "Questionnaire emprunteur (3 min)"
      },
      "blocks": [
        {
          "type": "p",
          "text": "L'actualite <strong>assurance emprunteur pour acquereurs non-residents</strong> (Utwin, Mutlog) confirme une tendance : investir dans l'immobilier francais sans y vivre devient courant, mais <strong>la banque exige une couverture solide</strong> — souvent plus couteuse qu'en resident principal."
        },
        {
          "type": "h2",
          "text": "Pourquoi la banque durcit le cahier des charges"
        },
        {
          "type": "p",
          "text": "Hors resident fiscal francais, le risque d'impaye ou de vacance locative est percus differemment. L'<strong>assurance emprunteur</strong> couvre le remboursement du pret en cas de deces, invalidite ou parfois perte d'emploi. Un dossier non-resident sans garanties claires peut etre <strong>refuse ou surcharge</strong>."
        },
        {
          "type": "h2",
          "text": "Les 4 points a verifier avant de signer"
        },
        {
          "type": "ul",
          "items": [
            "<strong>Quotite assuree</strong> : 100 % sur chaque emprunteur ou repartition banque",
            "<strong>ITT / IPT</strong> : le pret continue-t-il d'etre couvert si vous travaillez a l'etranger ?",
            "<strong>Delegation vs contrat groupe</strong> : la loi Lemoine permet souvent de resilier et comparer",
            "<strong>Coordination avec PNO</strong> si le bien est loue : assurance proprietaire non-occupant"
          ]
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "Lemoine : l'arme souvent oubliee des investisseurs"
        },
        {
          "type": "p",
          "text": "Meme non-resident, si vous empruntez aupres d'une banque francaise, vous pouvez en general <strong>changer d'assurance emprunteur</strong> a equivalence de garanties. L'economie depasse parfois <strong>30 a 40 %</strong> de la prime annuelle — reinvestissable en provision charges ou travaux."
        },
        {
          "type": "p",
          "text": "Notre <strong>questionnaire emprunteur</strong> (3 minutes) qualifie votre profil : resident ou non, montant du pret, age, fumeur, objectif investissement locatif. Vous recevez une orientation avant echange avec un courtier ORIAS."
        }
      ],
      "related": [
        {
          "href": "./assurance-emprunteur-loi-lemoine-2026.html",
          "label": "Loi Lemoine 2026"
        },
        {
          "href": "./pno-bailleur-proprietaire-non-occupant.html",
          "label": "PNO bailleur"
        },
        {
          "href": "../assurance-emprunteur/",
          "label": "Assurance emprunteur"
        }
      ]
    },
    {
      "file": "mutuelle-obesite-medicaments-rembourses-juin-2026.html",
      "section": "sante",
      "tag": "Mutuelle",
      "tagClass": "tag-sante",
      "title": "Obesite : medicaments rembourses — ce que votre mutuelle doit couvrir",
      "description": "Prise en charge de traitements contre l'obesite : Secu, mutuelle, reste a charge. Verifiez optique, suivi et hospitalisation.",
      "meta": "7 min · Juin 2026",
      "cardExcerpt": "Nouveau remboursement : votre mutuelle est-elle au bon niveau ?",
      "cta": {
        "href": "../landings/questionnaire.html?need=sante&journey=standard&utm_source=blog&utm_medium=actu_daily&utm_campaign=sante&utm_content=obesite-juin-2026",
        "label": "Questionnaire mutuelle (3 min)"
      },
      "blocks": [
        {
          "type": "p",
          "text": "A partir du <strong>15 juin 2026</strong>, deux medicaments contre l'<strong>obesite</strong> entrent en prise en charge. Bonne nouvelle pour les patients — mais attention au <strong>reste a charge</strong> : la Securite sociale ne rembourse qu'une partie, et votre <strong>mutuelle</strong> fait la difference sur le ticket final."
        },
        {
          "type": "h2",
          "text": "Secu + mutuelle : qui paie quoi ?"
        },
        {
          "type": "p",
          "text": "Un medicament rembourse passe par la <strong>base Securite sociale</strong>, puis par les <strong>garanties pharmacie</strong> de votre contrat. Si votre mutuelle est minimaliste (forfait pharma bas), vous pouvez payer plusieurs dizaines d'euros par mois de votre poche malgre le remboursement public."
        },
        {
          "type": "h2",
          "text": "Au-dela du medicament : le parcours complet"
        },
        {
          "type": "ul",
          "items": [
            "Consultations nutrition / endocrino : depassements d'honoraires",
            "Analyses et bilans : plafonds labo",
            "Suivi psychologique si besoin : souvent plafonne",
            "Eventuelle chirurgie bariatrique : poste hospitalisation lourd"
          ]
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "Quand reevaluer sa mutuelle"
        },
        {
          "type": "p",
          "text": "Si votre situation de sante evolue (traitement long, IMC, diabete associe), un contrat souscrit il y a 5 ans est probablement <strong>sous-dimensionne</strong>. Comparez a <strong>garanties equivalentes</strong> : hospitalisation, pharma, medecine courante."
        },
        {
          "type": "p",
          "text": "Le <strong>questionnaire mutuelle</strong> Leads Opportunities identifie votre profil (solo, famille, TNS) et les postes sensibles — reponse en 3 minutes, sans engagement."
        }
      ],
      "related": [
        {
          "href": "./mutuelle-sante-5-criteres.html",
          "label": "5 criteres mutuelle"
        },
        {
          "href": "./mutuelle-sante-hospitalisation-2026.html",
          "label": "Hospitalisation 2026"
        },
        {
          "href": "../landings/sante.html",
          "label": "Parcours mutuelle"
        }
      ]
    },
    {
      "file": "cadmium-depistage-rembourse-mutuelle-2026.html",
      "section": "sante",
      "tag": "Prevention",
      "tagClass": "tag-sante",
      "title": "Cadmium : depistage rembourse — prevention et mutuelle complementaire",
      "description": "Nouveau depistage cadmium rembourse : qui est concerne, reste a charge, role de la mutuelle et prevention sante.",
      "meta": "6 min · Juin 2026",
      "cardExcerpt": "Depistage rembourse : verifiez vos garanties prevention.",
      "cta": {
        "href": "../landings/questionnaire.html?need=sante&journey=standard&utm_source=blog&utm_medium=actu_daily&utm_campaign=sante&utm_content=cadmium-2026",
        "label": "Questionnaire mutuelle (3 min)"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Le <strong>depistage du cadmium</strong> entre dans le dispositif de prevention rembourse. Sujet de sante publique : l'exposition chronique touche certaines professions et regions. Pour les assures, la question pratique est <strong>qui paie les bilans et le suivi</strong> apres le depistage."
        },
        {
          "type": "h2",
          "text": "Prevention Secu vs mutuelle"
        },
        {
          "type": "p",
          "text": "Les actes de <strong>prevention</strong> suivent des regles specifiques (100 % Secu dans certains cas). Mais analyses complementaires, specialistes, ou suivi long peuvent generer un <strong>reste a charge</strong> selon votre mutuelle."
        },
        {
          "type": "h2",
          "text": "Profils a risque : vigilance renforcee"
        },
        {
          "type": "ul",
          "items": [
            "Exposition professionnelle (industrie, agriculture, batteries)",
            "Fumeurs et anciens fumeurs (synergies toxiques)",
            "Habitants de zones industrielles historiques",
            "Personnes avec pathologies renales ou osseuses"
          ]
        },
        {
          "type": "bridge"
        },
        {
          "type": "p",
          "text": "Une mutuelle avec bon niveau <strong>medecine courante + analyses + hospitalisation</strong> securise le parcours si le depistage revele une anomalie. Testez votre niveau de couverture via notre questionnaire — 3 minutes, gratuit."
        }
      ],
      "related": [
        {
          "href": "./mutuelle-remboursement-optique-dentaire-2026.html",
          "label": "Remboursements 2026"
        },
        {
          "href": "./questionnaire-mutuelle-quel-niveau-choisir.html",
          "label": "Quel niveau choisir"
        }
      ]
    },
    {
      "file": "g7-evian-prevoyance-patrimoine-credit-2026.html",
      "section": "actu",
      "tag": "G7 & économie",
      "tagClass": "tag-actu",
      "title": "Sommet du G7 a Evian : prevoyance, patrimoine et credit immobilier",
      "description": "G7 2026 a Evian : incertitude economique, taux, immobilier. Comment proteger revenus, pret et epargne — questionnaire gratuit.",
      "meta": "8 min · Juin 2026",
      "cardExcerpt": "Sommet du G7 : securiser pret, epargne et revenus des maintenant.",
      "cta": {
        "href": "../landings/questionnaire.html?need=prevoyance&journey=standard&utm_source=blog&utm_medium=actu_daily&utm_campaign=prevoyance&utm_content=g7-evian-2026",
        "label": "Questionnaire prevoyance (3 min)"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Le <strong>sommet du G7 a Evian</strong> replace l'<strong>economie mondiale</strong> sous les projecteurs : commerce, dettes, energie, geopolitique. Pour un foyer francais, la question n'est pas de prevoir le communique final, mais de <strong>proteger ce qui ne depend pas des chefs d'Etat</strong> : revenus, credit immobilier, epargne et contrats d'assurance."
        },
        {
          "type": "h2",
          "text": "1. Prevoyance : le filet quand l'activite ralentit"
        },
        {
          "type": "p",
          "text": "Periode d'incertitude = risque de <strong>baisse d'activite</strong> pour les independants et tensions sur l'emploi salarie. La prevoyance individuelle ou TNS comble ce que la Securite sociale ne couvre pas : <strong>franchises, delais de carence, plafonds ITT</strong>. Verifiez votre contrat avant une degradation de conjoncture."
        },
        {
          "type": "h2",
          "text": "2. Patrimoine et assurance-vie"
        },
        {
          "type": "p",
          "text": "Les debats internationaux sur la fiscalite et l'inflation relancent l'interet pour l'<strong>assurance-vie</strong> et la diversification. Un contrat deja ouvert, avec fonds repartis, limite l'exposition a un seul scenario politique. Evitez les arbitrages paniques ; preferez un <strong>bilan patrimonial</strong>."
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "3. Credit immobilier et assurance emprunteur"
        },
        {
          "type": "p",
          "text": "Les marches anticipent parfois des mouvements de <strong>taux</strong> apres les grands sommets. Si votre assurance emprunteur date de plus de deux ans, la <strong>loi Lemoine</strong> permet souvent de comparer et reduire le cout sans changer de banque — budget liberé pour renforcer la prevoyance."
        },
        {
          "type": "h2",
          "text": "Checklist foyer (10 minutes)"
        },
        {
          "type": "ul",
          "items": [
            "Prevoyance : plafonds invalidite / deces a jour avec vos charges fixes",
            "Emprunteur : derniere offre Lemoine comparee a votre banque",
            "Habitation : capital mobilier et valeur reconstruction alignes",
            "Mutuelle : poste hospitalisation suffisant si file d'attente allongee",
            "Epargne de precaution : 3 a 6 mois de charges sur compte disponible"
          ]
        },
        {
          "type": "p",
          "text": "Notre <strong>questionnaire prevoyance</strong> (3 minutes) qualifie votre profil salarie, TNS ou dirigeant et oriente vers les garanties coherentes — gratuit, sans engagement."
        }
      ],
      "related": [
        {
          "href": "./elections-presidentielles-prevoyance-patrimoine.html",
          "label": "Elections & patrimoine"
        },
        {
          "href": "./assurance-emprunteur-loi-lemoine-2026.html",
          "label": "Loi Lemoine"
        },
        {
          "href": "../assurance-prevoyance/",
          "label": "Assurance prevoyance"
        }
      ]
    },
    {
      "file": "coupe-monde-voyage-assurance-sante-etranger-2026.html",
      "section": "actu",
      "tag": "Coupe du monde",
      "tagClass": "tag-actu",
      "title": "Coupe du monde 2026 : voyager au Canada, USA ou Mexique — assurance sante",
      "description": "France au Mondial, deplacements Amérique du Nord : frais medicaux a l'etranger, rapatriement, responsabilite — checklist avant le depart.",
      "meta": "7 min · Juin 2026",
      "cardExcerpt": "Supporter en CDM : la mutuelle francaise ne suffit pas toujours a l'etranger.",
      "cta": {
        "href": "../landings/questionnaire.html?need=sante&journey=standard&utm_source=blog&utm_medium=actu_daily&utm_campaign=sante&utm_content=coupe-monde-voyage-2026",
        "label": "Questionnaire mutuelle / voyage (3 min)"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Entre le match <strong>France–Senegal</strong>, les deplacements de supporters et l'actualite FIFA autour de la <strong>Coupe du monde 2026</strong> en Amerique du Nord, des milliers de Francais prepareront un voyage longue distance. Le vrai sujet assurance : <strong>frais medicaux aux USA/Canada</strong>, ou une consultation peut coutet plusieurs centaines de dollars sans couverture adaptee."
        },
        {
          "type": "h2",
          "text": "Ce que couvre (ou pas) votre carte bancaire"
        },
        {
          "type": "p",
          "text": "Certaines cartes premium incluent une <strong>assistance voyage</strong> : rapatriement, avance de frais. Mais les plafonds, exclusions sportives ou franchises sont souvent mal connus. Lisez les <strong>conditions generales</strong> avant d'acheter le billet d'avion."
        },
        {
          "type": "h2",
          "text": "Mutuelle francaise a l'etranger"
        },
        {
          "type": "ul",
          "items": [
            "Securite sociale : remboursements limites hors UE selon les pays",
            "Mutuelle : forfait assistance rapatriement parfois insuffisant pour l'Amerique du Nord",
            "Responsabilite civile : dommages causes a des tiers (location, accident)",
            "Annulation / interruption : billet, hotel si blessure ou visa refuse"
          ]
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "Avant de reserver : 4 reflexes"
        },
        {
          "type": "p",
          "text": "1) Verifier <strong>assistance 24h/24</strong> et numero d'appel international. 2) Souscrire si besoin une <strong>assurance voyage</strong> specifique USA/Canada. 3) Declarer pathologies existantes (sinon exclusion). 4) Garder preuve de couverture pour le visa ou l'immigration."
        },
        {
          "type": "p",
          "text": "Le <strong>questionnaire mutuelle / sante</strong> Leads Opportunities verifie votre niveau d'assistance et les postes critiques — utile aussi si vous partez en expatriation temporaire pour le Mondial."
        }
      ],
      "related": [
        {
          "href": "./coupe-monde-2026-assurance-voyage-sante.html",
          "label": "Guide CDM 2026"
        },
        {
          "href": "./ligue-champions-assurance-voyage-deplacement.html",
          "label": "Voyage & deplacement"
        },
        {
          "href": "../landings/sante.html",
          "label": "Parcours mutuelle"
        }
      ]
    },
    {
      "file": "lieu-de-r-xe9-sidence-intoxication-chronique-analyse-d-urine-cinq-questi.html",
      "section": "sante",
      "tag": "Santé & mutuelle",
      "tagClass": "tag-sante",
      "title": "Lieu de r&#xE9;sidence, intoxication chronique, analyse d'urine... Cinq questions sur l… : mutuelle et remboursements — que faire ?",
      "description": "Lieu de r&#xE9;sidence, intoxication chronique, analyse d'urine... Cinq questions sur les tests de d&#xE9;pistage du cadmium d&#xE9;sormais rembours&#xE9;s — conseils assurance et questionnaire gratuit Leads Opportunities.",
      "meta": "7 min · Juin 2026",
      "cardExcerpt": "Lieu de r&#xE9;sidence, intoxication chronique, analyse d'urine... Cinq questions sur les tests de d&#xE9;pist — impact sur votre assurance.",
      "cta": {
        "href": "../landings/questionnaire.html?need=sante&journey=standard&utm_source=blog&utm_medium=actu_daily&utm_campaign=sante&utm_content=lieu-de-r-xe9-sidence-intoxication-chr",
        "label": "Questionnaire mutuelle (3 min)"
      },
      "blocks": [
        {
          "type": "p",
          "text": "Selon l'information relayee ce jour (<strong>Lieu de r&#xE9;sidence, intoxication chronique, analyse d'urine... Cinq questions sur l…</strong>), l'actualite rappelle un enjeu concret pour les foyers francais. Le reste a charge sante peut exploser si votre mutuelle n'est pas calibree sur vos vrais besoins."
        },
        {
          "type": "h2",
          "text": "Lien avec votre contrat d'assurance"
        },
        {
          "type": "p",
          "text": "Avant de react agir sous le coup de l'emotion mediatique, verifiez <strong>ce que couvre deja votre contrat</strong> : plafonds, franchises, exclusions, delais. Un comparatif a garanties equivalentes evite de surpayer ou de rester sous-assure."
        },
        {
          "type": "h2",
          "text": "Checklist pratique (5 minutes)"
        },
        {
          "type": "ul",
          "items": [
            "Hospitalisation et chirurgie : plafonds honoraires",
            "Pharmacie et medicaments nouvellement rembourses",
            "Optique / dentaire si consommation annuelle",
            "Delais de carence avant changement de contrat",
            "Tiers payant et teletransmission"
          ]
        },
        {
          "type": "bridge"
        },
        {
          "type": "h2",
          "text": "Prochaine etape : qualifier votre besoin"
        },
        {
          "type": "p",
          "text": "Le questionnaire mutuelle (3 min) identifie le bon niveau — sans engagement, reponse orientee par un courtier ORIAS."
        },
        {
          "type": "p",
          "text": "Leads Opportunities — courtier ORIAS. Nous comparons April, AXA, Allianz, Generali, Zephir et le marche selon votre profil. <strong>100 % gratuit</strong>, sans engagement."
        }
      ],
      "related": [
        {
          "href": "./mutuelle-sante-5-criteres.html",
          "label": "5 criteres mutuelle"
        },
        {
          "href": "../assurance-sante/comparatif/",
          "label": "Comparatif mutuelle"
        }
      ]
    }
  ]
};

const { applyUpgrades } = require("./blog-articles-upgrades.cjs");
applyUpgrades(module.exports.articles);

const caniculeMutuelle = require("./blog-canicule-mutuelle-articles.cjs");
caniculeMutuelle.forEach(function (a) {
  module.exports.articles.push(a);
});

const nichesActu = require("./blog-niches-actu-articles.cjs");
nichesActu.forEach(function (a) {
  module.exports.articles.push(a);
});

const pretRefuse = require("./blog-pret-refuse-articles.cjs");
pretRefuse.forEach(function (a) {
  module.exports.articles.push(a);
});

const leadIntent = require("./blog-lead-intent-articles.cjs");
leadIntent.forEach(function (a) {
  module.exports.articles.push(a);
});

const { loadActuArticles } = require("./blog-actu-pending.cjs");
var pendingActu = loadActuArticles();
var existingFiles = {};
module.exports.articles.forEach(function (a) {
  existingFiles[a.file] = true;
});
pendingActu.forEach(function (a) {
  if (existingFiles[a.file]) return;
  existingFiles[a.file] = true;
  module.exports.articles.push(a);
});
