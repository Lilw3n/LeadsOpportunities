/**
 * Pages SEO hub — bassin Nice / Côte d'Azur (animaux, VTC, chasse, puis le reste).
 */
var Img = require("./seo-images-lib.cjs");
var bassin = require("./nice-cote-azur-lib.cjs");
var LT = require("./seo-long-term-related.cjs");

var LANDING_ANIMAUX = "/landings/animaux.html";
var LANDING_VTC = "/landings/vtc.html";
var LANDING_CHASSE = "/landings/chasse.html";
var LANDING_EQUITATION = "/landings/equitation.html";

function namesList() {
  return bassin.COMMUNES.map(function (c) {
    return c.name;
  }).join(", ");
}

function buildNiceCoteAzurPages(page) {
  var pages = [];
  var gridAnimaux = bassin.hubCityGrid("assurance-animaux");
  var gridVtc = bassin.hubCityGrid("assurance-vtc");
  var gridChasse = bassin.hubCityGrid("assurance-chasse");
  var gridEquitation = bassin.hubCityGrid("assurance-equitation");
  var gridHab = bassin.hubCityGrid("assurance-habitation");
  var gridSante = bassin.hubCityGrid("assurance-sante");

  pages.push(
    page({
      file: "nice-cote-azur/index.html",
      theme: "animaux",
      badge: "Nice · Côte d'Azur · 06",
      title: "Assurance Nice Côte d'Azur | Animaux, VTC, chasse — Alpes-Maritimes",
      description:
        "Courtier ORIAS pour Nice et la Côte d'Azur : assurance chien et chat, VTC aéroport Nice, RC chasseur 06, puis habitation, mutuelle, équitation. Devis gratuit.",
      keywords:
        "assurance animaux nice, assurance chien nice, assurance vtc nice, assurance chasse alpes maritimes, courtier nice cote d azur",
      h1: "Nice Côte d'Azur : les assurances qui convertissent déjà (animaux, VTC, chasse)",
      intro:
        "Sur le bassin niçois, les leads arrivent surtout sur l'assurance animaux (chien, chat), le VTC (aéroport NCE, Promenade, Cannes) et la chasse (Moyen Pays, Mercantour). Nous poussons ces silos en local, puis le reste des piliers (habitation, mutuelle, équitation) sur les mêmes communes.",
      cta: { href: LANDING_ANIMAUX, label: "Devis animaux Côte d'Azur" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Nice Côte d'Azur", url: "/nice-cote-azur/" },
      ],
      benefits: [
        { title: "Animaux", text: "Chien et chat : comparatif Santévet, Bulle Bleue, Kozoo — déjà source de leads." },
        { title: "VTC", text: "Aéroport Nice-Côte d'Azur, Cannes, Antibes, Sophia — RC Pro chauffeur." },
        { title: "Chasse", text: "RC chasseur 06, chien courant, hinterland Vésubie / Mercantour." },
      ],
      sections: [
        {
          h2: "Priorité 1 — Assurance animaux (chien, chat)",
          paragraphs: [
            "C'est le marché qui ramène déjà des demandes : urgence véto, chaleur côtière, tiques, chiots et chats d'appartement. Pages locales Nice, Cagnes, Saint-Laurent-du-Var, Antibes, Cannes et le reste du 06.",
          ],
          list: [
            "Hub animaux Côte d'Azur",
            "Assurance chien par commune",
            "Assurance chat par commune",
            "Landing devis animaux",
          ],
        },
        {
          h2: "Priorité 2 — Assurance VTC Côte d'Azur",
          paragraphs: [
            "Même logique que le silo Île-de-France, autre géographie : NCE, Promenade, Festival de Cannes, Sophia Antipolis. Un usage Côte d'Azur, pas un contrat auto perso.",
          ],
        },
        {
          h2: "Priorité 3 — Assurance chasse Alpes-Maritimes",
          paragraphs: [
            "Le littoral n'est pas le territoire : les chasseurs habitent Nice ou Cannes et sortent au Moyen Pays, Vésubie, Sospel, Estérel. RC + chien de chasse depuis n'importe quelle fiche commune.",
          ],
        },
        {
          h2: "Ensuite — le reste des piliers",
          paragraphs: [
            "Équitation, habitation, mutuelle, auto, emprunteur, prévoyance : mêmes communes du bassin, même devis en ligne. Le crédit immobilier du cabinet reste ancré sur Nancy métropole (54).",
          ],
        },
        {
          h2: "Communes du bassin",
          paragraphs: ["Pages locales générées pour : " + namesList() + "."],
        },
      ],
      hubCityGrid: gridAnimaux,
      related: LT.mergeUnique(
        [
          { href: "/assurance-animaux/nice-cote-azur/", label: "Animaux Côte d'Azur" },
          { href: "/assurance-vtc/cote-d-azur/", label: "VTC Côte d'Azur" },
          { href: "/assurance-vtc/aeroport-nice/", label: "Aéroport Nice NCE" },
          { href: "/assurance-chasse/cote-d-azur/", label: "Chasse 06" },
          { href: "/assurance-equitation/cote-d-azur/", label: "Équitation Côte d'Azur" },
          { href: "/nancy-54/", label: "Courtier Nancy (54) — prêt" },
        ],
        LT.NICHES_ANIMAUX,
        LT.VTC_COTE_AZUR || [],
        LT.NICHES_CHASSE
      ),
      faq: [
        {
          q: "Pourquoi Nice et pas seulement Paris ?",
          a: "Parce que les leads animaux, VTC et chasse arrivent déjà sur ce bassin. On densifie le SEO local là où ça convertit, puis on étend aux autres piliers.",
        },
        {
          q: "Le prêt immobilier se fait-il à Nice ?",
          a: "Le pôle crédit du cabinet est ancré sur Nancy métropole (54). Les pages Nice Côte d'Azur visent d'abord les assurances qui génèrent des leads ici.",
        },
      ],
    })
  );

  pages.push(
    page({
      file: "assurance-animaux/nice-cote-azur/index.html",
      theme: "animaux",
      badge: "Nice Côte d'Azur · animaux",
      title: "Assurance animaux Nice Côte d'Azur | Chien & chat — Alpes-Maritimes",
      description:
        "Assurance chien et chat à Nice, Cagnes, Antibes, Cannes, Menton et le 06. Comparatif Santévet, Bulle Bleue, Kozoo. Courtier ORIAS, devis gratuit.",
      keywords:
        "assurance animaux nice, assurance chien nice, assurance chat cannes, mutuelle animaux alpes maritimes",
      h1: "Assurance animaux — bassin Nice Côte d'Azur (chien, chat)",
      intro:
        "Les factures véto explosent aussi sur la Côte : chaleur, tiques, urgences de nuit, chiens d'appartement à Nice et chats à Cannes. Nous comparons les formules pour tout le 06, avec un conseiller ORIAS.",
      cta: { href: LANDING_ANIMAUX, label: "Comparer l'assurance animaux" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance animaux", url: "/assurance-animaux/" },
        { name: "Nice Côte d'Azur", url: "/assurance-animaux/nice-cote-azur/" },
      ],
      sections: [
        {
          h2: "Pourquoi un silo local animaux sur le 06",
          paragraphs: [
            "C'est déjà un canal de leads : « assurance chien pas cher », « mutuelle chat », « frais vétérinaires ». Les pages ville génériques ne suffisent pas — il faut Nice, Cagnes, Saint-Laurent-du-Var, Antibes, Cannes, Menton et le Moyen Pays.",
            "Même assureurs qu'en national (Santévet, Bulle Bleue, Kozoo), discours local : chaleur Promenade, pinèdes, copropriétés Croisette, chiens de chasse vers Grasse.",
          ],
          list: [
            "Chien : chiot, pas cher, senior, grandes races",
            "Chat : chaton, intérieur, senior",
            "NAC selon contrats",
            "Rappel express 30 secondes",
          ],
        },
        {
          h2: "Communes couvertes",
          paragraphs: [namesList() + "."],
        },
      ],
      hubCityGrid: gridAnimaux.concat([
        { href: "/assurance-chien/nice/", label: "Chien Nice" },
        { href: "/assurance-chat/nice/", label: "Chat Nice" },
      ]),
      related: LT.mergeUnique(
        [
          { href: "/assurance-animaux/nice/", label: "Animaux Nice" },
          { href: "/assurance-chien/nice/", label: "Chien Nice" },
          { href: "/assurance-chat/nice/", label: "Chat Nice" },
          { href: "/assurance-animaux/chien/pas-cher/", label: "Chien pas cher" },
          { href: "/assurance-animaux/comparatif/", label: "Comparatif" },
          { href: "/nice-cote-azur/", label: "Hub Nice Côte d'Azur" },
          { href: LANDING_ANIMAUX, label: "Devis animaux" },
        ],
        LT.NICHES_ANIMAUX
      ),
      faq: [
        {
          q: "Assurance chien à Nice : à partir de quel âge ?",
          a: "Souvent dès 2–3 mois pour un chiot, avec une limite d'adhésion pour les seniors. Nous testons votre profil.",
        },
        {
          q: "Couvrez-vous Cagnes, Antibes, Cannes ?",
          a: "Oui — une page par commune du bassin et le même questionnaire.",
        },
      ],
    })
  );

  pages.push(
    page({
      file: "assurance-vtc/cote-d-azur/index.html",
      theme: "vtc",
      badge: "VTC Côte d'Azur",
      title: "Assurance VTC Côte d'Azur | Nice, Cannes, aéroport NCE",
      description:
        "Assurance VTC Nice, Cannes, Antibes, Saint-Laurent-du-Var, aéroport Nice-Côte d'Azur. RC Pro Uber Bolt, courtier ORIAS.",
      keywords:
        "assurance VTC nice, assurance VTC cannes, assurance VTC aeroport nice, Uber nice, VTC cote d azur",
      h1: "Assurance VTC en Côte d'Azur : Nice, Cannes, aéroport NCE",
      intro:
        "Même métier que le hub Île-de-France, autre carte : aéroport Nice-Côte d'Azur, Promenade, Festival de Cannes, Sophia Antipolis, port de Villefranche. Nous comparons RC Pro et véhicule pour les chauffeurs du 06.",
      cta: { href: LANDING_VTC, label: "Devis VTC Côte d'Azur" },
      heroImage: Img.VTC_ASSETS.aeroport,
      gallery: [Img.VTC_ASSETS.chauffeur, Img.VTC_ASSETS.voiture, Img.VTC_ASSETS.aeroport],
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance VTC", url: "/assurance-vtc/" },
        { name: "Côte d'Azur", url: "/assurance-vtc/cote-d-azur/" },
      ],
      sections: [
        {
          h2: "Zones qui pèsent sur le risque",
          paragraphs: [
            "NCE (Saint-Laurent-du-Var), A8, Promenade des Anglais, Croisette, Cap 3000, Sophia Antipolis : déclarez un usage régional Côte d'Azur, pas seulement « Nice centre ».",
          ],
          list: [
            "Aéroport Nice-Côte d'Azur (page dédiée)",
            "Nice, Cagnes, Saint-Laurent-du-Var",
            "Cannes, Le Cannet, Mandelieu, Antibes",
            "Valbonne / Sophia, Menton, Villefranche",
          ],
        },
        {
          h2: "Plateformes",
          paragraphs: [
            "Uber, Bolt, Heetch : le contrat doit autoriser le transport de personnes à titre onéreux. Une auto perso ne suffit pas.",
          ],
        },
      ],
      hubCityGrid: gridVtc.concat([
        { href: "/assurance-vtc/aeroport-nice/", label: "Aéroport Nice NCE" },
        { href: "/assurance-vtc/ile-de-france/", label: "Hub Île-de-France" },
      ]),
      related: LT.mergeUnique(
        [
          { href: "/assurance-vtc/aeroport-nice/", label: "Aéroport Nice" },
          { href: "/assurance-vtc/nice/", label: "VTC Nice" },
          { href: "/assurance-vtc/cannes/", label: "VTC Cannes" },
          { href: "/assurance-vtc/ile-de-france/", label: "VTC Île-de-France" },
          { href: "/assurance-vtc/rc-pro/", label: "RC Pro" },
          { href: LANDING_VTC, label: "Devis VTC" },
        ],
        LT.VTC_IDF.slice(0, 4)
      ),
      faq: [
        {
          q: "Faut-il un contrat différent de Paris ?",
          a: "Oui sur la zone d'exercice (06 vs IDF). Les garanties RC Pro / véhicule se comparent de la même façon.",
        },
        {
          q: "L'aéroport Nice est-il couvert ?",
          a: "Si vous le déclarez. Voir la page aéroport Nice-Côte d'Azur et Saint-Laurent-du-Var.",
        },
      ],
    })
  );

  pages.push(
    page({
      file: "assurance-vtc/aeroport-nice/index.html",
      theme: "vtc",
      badge: "Aéroport Nice NCE",
      title: "Assurance VTC aéroport Nice-Côte d'Azur (NCE) | Devis chauffeur",
      description:
        "Assurance VTC pour les courses aéroport Nice-Côte d'Azur : Saint-Laurent-du-Var, terminaux, A8, Promenade. RC Pro, courtier ORIAS.",
      keywords:
        "assurance VTC aeroport nice, VTC NCE, assurance chauffeur nice cote d azur, Uber aeroport nice",
      h1: "Assurance VTC aéroport Nice-Côte d'Azur (NCE)",
      intro:
        "L'aéroport Nice-Côte d'Azur est le 2e de France : files terminaux, hôtels aéroport, Cap 3000, A8 vers Cannes et Monaco côté FR. Un chauffeur qui fait NCE doit le déclarer — nous calibrons RC Pro, véhicule et franchises.",
      cta: { href: LANDING_VTC, label: "Devis VTC aéroport Nice" },
      heroImage: Img.VTC_ASSETS.aeroport,
      gallery: [Img.VTC_ASSETS.aeroport, Img.VTC_ASSETS.chauffeur, Img.VTC_ASSETS.voiture],
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance VTC", url: "/assurance-vtc/" },
        { name: "Côte d'Azur", url: "/assurance-vtc/cote-d-azur/" },
        { name: "Aéroport Nice", url: "/assurance-vtc/aeroport-nice/" },
      ],
      sections: [
        {
          h2: "Pourquoi une page aéroport Nice",
          paragraphs: [
            "Comme CDG et Orly en Île-de-France : le risque aéroport (stationnement, files, kilométrage A8) n'est pas celui d'un chauffeur centre-ville uniquement.",
            "Saint-Laurent-du-Var accueille les terminaux ; Nice, Cagnes et Villeneuve-Loubet alimentent les prises en charge hôtels et domiciles.",
          ],
          list: [
            "Terminaux 1 et 2 — Nice-Côte d'Azur",
            "Cap 3000 et hôtels aéroport",
            "A8 vers Cannes, Antibes, Sophia",
            "Promenade et port de Nice",
          ],
        },
        {
          h2: "Communes liées",
          paragraphs: [
            "Saint-Laurent-du-Var, Nice, Cagnes-sur-Mer, Villeneuve-Loubet, Antibes. Hub Côte d'Azur pour toutes les villes VTC du 06.",
          ],
        },
      ],
      related: [
        { href: "/assurance-vtc/cote-d-azur/", label: "Hub VTC Côte d'Azur" },
        { href: "/assurance-vtc/saint-laurent-du-var/", label: "VTC Saint-Laurent-du-Var" },
        { href: "/assurance-vtc/nice/", label: "VTC Nice" },
        { href: "/assurance-vtc/aeroport-cdg/", label: "Aéroport CDG" },
        { href: "/assurance-vtc/aeroport-orly/", label: "Aéroport Orly" },
        { href: LANDING_VTC, label: "Devis VTC" },
      ],
      faq: [
        {
          q: "NCE est-il à Nice ou à Saint-Laurent-du-Var ?",
          a: "Les pistes et terminaux sont sur Saint-Laurent-du-Var / Nice ouest. Les deux fiches ville + cette page aéroport se maillent.",
        },
        {
          q: "Puis-je aussi faire Cannes le même jour ?",
          a: "Oui, usage Côte d'Azur. Déclarez aéroport + littoral pour éviter une mauvaise surprise en sinistre.",
        },
      ],
    })
  );

  pages.push(
    page({
      file: "assurance-chasse/cote-d-azur/index.html",
      theme: "niche",
      badge: "Chasse · Alpes-Maritimes",
      title: "Assurance chasse Alpes-Maritimes | RC chasseur 06, Mercantour",
      description:
        "Assurance chasse dans le 06 : RC chasseur, chien courant, Moyen Pays, Vésubie, Mercantour, Estérel. Devis gratuit, courtier ORIAS.",
      keywords:
        "assurance chasse alpes maritimes, rc chasseur 06, assurance chasse nice, chien de chasse mercantour",
      h1: "Assurance chasse dans les Alpes-Maritimes (06)",
        intro:
        "On ne chasse pas sur la Promenade : les demandes viennent de chasseurs niçois, cannois ou grassois qui sortent au Moyen Pays, en Vésubie, à Sospel ou vers l'Estérel. RC chasseur et options chien de chasse, devis en ligne.",
      cta: { href: LANDING_CHASSE, label: "Devis RC chasseur 06" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance chasse", url: "/assurance-chasse/" },
        { name: "Côte d'Azur", url: "/assurance-chasse/cote-d-azur/" },
      ],
      sections: [
        {
          h2: "Territoires, pas seulement la ville de résidence",
          paragraphs: [
            "Habiter Nice, Cannes ou Antibes n'empêche pas d'avoir besoin d'une RC chasse pour le 06 (et parfois 83 / 04). Nous partons de la pratique (battue, tir, chien courant) plus que du code postal.",
          ],
          list: [
            "Moyen Pays : Vence, Grasse, Coursegoules",
            "Vésubie / Mercantour : Saint-Martin-Vésubie",
            "Bévéra : Sospel",
            "Estérel côté Mandelieu / 83",
          ],
        },
        {
          h2: "Chien de chasse",
          paragraphs: [
            "Blessures, responsabilité, option sur la police chasse ou contrat chien classique en complément. Voir aussi le silo assurance animaux.",
          ],
        },
      ],
      hubCityGrid: gridChasse,
      related: LT.mergeUnique(
        [
          { href: "/assurance-chasse/rc-chasseur/", label: "RC chasseur" },
          { href: "/assurance-chasse/chien-chasse/", label: "Chien de chasse" },
          { href: "/assurance-chasse/nice/", label: "Chasse Nice" },
          { href: "/assurance-chasse/grasse/", label: "Chasse Grasse" },
          { href: "/assurance-chasse/vence/", label: "Chasse Vence" },
          { href: "/assurance-chasse/saint-martin-vesubie/", label: "Chasse Vésubie" },
          { href: "/nice-cote-azur/", label: "Hub Nice Côte d'Azur" },
        ],
        LT.NICHES_CHASSE
      ),
      faq: [
        {
          q: "J'habite Nice, je chasse dans le Mercantour : ça marche ?",
          a: "Oui. La RC suit le chasseur, pas uniquement la commune de résidence. Nous cadrons territoires et exclusions.",
        },
        {
          q: "Le chien de chasse est-il inclus ?",
          a: "Parfois en option. Sinon nous regardons une assurance chien (silo animaux) en complément.",
        },
      ],
    })
  );

  pages.push(
    page({
      file: "assurance-equitation/cote-d-azur/index.html",
      theme: "niche",
      badge: "Équitation · 06",
      title: "Assurance équitation Côte d'Azur | Cheval & RC équestre 06",
      description:
        "Assurance équitation Nice, Cannes, Grasse, Vence : RC équestre, cheval, centres. Courtier ORIAS, devis gratuit.",
      keywords: "assurance equitation nice, rc equestre alpes maritimes, assurance cheval cannes",
      h1: "Assurance équitation — Côte d'Azur et Moyen Pays",
      intro:
        "Centres équestres du littoral et du hinterland grassois / venceois : RC équestre, mortalité cheval, matériel. Après animaux, VTC et chasse, on densifie aussi l'équitation sur les mêmes communes.",
      cta: { href: LANDING_EQUITATION, label: "Devis équitation Côte d'Azur" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance équitation", url: "/assurance-equitation/" },
        { name: "Côte d'Azur", url: "/assurance-equitation/cote-d-azur/" },
      ],
      sections: [
        {
          h2: "Où sont les chevaux",
          paragraphs: [
            "Moins sur la Croisette que vers Grasse, Mougins, Vence, Carros et le Moyen Pays. Une fiche par commune + ce hub pour les requêtes « assurance cheval Nice » / « RC équestre 06 ».",
          ],
        },
      ],
      hubCityGrid: gridEquitation,
      related: LT.mergeUnique(
        [
          { href: "/assurance-equitation/rc-equestre/", label: "RC équestre" },
          { href: "/assurance-equitation/nice/", label: "Équitation Nice" },
          { href: "/nice-cote-azur/", label: "Hub Nice Côte d'Azur" },
        ],
        LT.NICHES_EQUITATION
      ),
      faq: [
        {
          q: "Cavalier de loisir à Nice, centre dans le Moyen Pays ?",
          a: "Oui, nous montons RC équestre et options cheval selon le lieu de pratique, pas seulement la résidence.",
        },
      ],
    })
  );

  pages.push(
    page({
      file: "assurance-habitation/cote-d-azur/index.html",
      theme: "habitation",
      badge: "Habitation · 06",
      title: "Assurance habitation Côte d'Azur | Nice, Cannes, Antibes",
      description:
        "Assurance habitation Nice Côte d'Azur : appartements Promenade, villas collines, résidences Cannes. Courtier ORIAS, devis gratuit.",
      h1: "Assurance habitation — bassin Nice Côte d'Azur",
      intro:
        "Après les niches qui convertissent (animaux, VTC, chasse), les mêmes communes ont une page habitation : copropriétés littoral, villas colline, risques climat (orages, grêle, feux d'arrière-pays).",
      cta: { href: "/landings/devis.html?need=habitation", label: "Devis habitation 06" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance habitation", url: "/assurance-habitation/" },
        { name: "Côte d'Azur", url: "/assurance-habitation/cote-d-azur/" },
      ],
      sections: [
        {
          h2: "Appartement littoral vs villa hinterland",
          paragraphs: [
            "Nice, Cannes, Menton : copropriétés, dégâts des eaux, vol. Vence, Grasse, Vésubie : plus d'incendie de forêt et de grêle. Nous cadrons les garanties selon le bien.",
          ],
        },
      ],
      hubCityGrid: gridHab,
      related: LT.mergeUnique(
        [
          { href: "/assurance-habitation/nice/", label: "Habitation Nice" },
          { href: "/nice-cote-azur/", label: "Hub Nice Côte d'Azur" },
        ],
        LT.ACTU_CLIMAT_HABITATION.slice(0, 3)
      ),
      faq: [],
    })
  );

  pages.push(
    page({
      file: "assurance-sante/cote-d-azur/index.html",
      theme: "sante",
      badge: "Mutuelle · 06",
      title: "Mutuelle santé Côte d'Azur | Nice, Cannes, Antibes",
      description:
        "Mutuelle santé à Nice et sur la Côte d'Azur : optique, dentaire, hospitalisation. Courtier ORIAS, devis gratuit.",
      h1: "Mutuelle santé — Nice et Côte d'Azur",
      intro:
        "Seniors, familles, indépendants du 06 : comparatif optique / dentaire / hospitalisation. Complément du silo animaux / VTC / chasse sur les mêmes villes.",
      cta: { href: "/landings/sante.html", label: "Devis mutuelle Côte d'Azur" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Mutuelle santé", url: "/assurance-sante/" },
        { name: "Côte d'Azur", url: "/assurance-sante/cote-d-azur/" },
      ],
      hubCityGrid: gridSante,
      related: LT.mergeUnique(
        [
          { href: "/assurance-sante/nice/", label: "Mutuelle Nice" },
          { href: "/nice-cote-azur/", label: "Hub Nice Côte d'Azur" },
        ],
        LT.CANICULE_MUTUELLE.slice(0, 3)
      ),
      faq: [],
    })
  );

  return pages;
}

function getNiceCoteAzurSitemapEntries(base) {
  var today = new Date().toISOString().slice(0, 10);
  var paths = [
    "/nice-cote-azur/",
    "/assurance-animaux/nice-cote-azur/",
    "/assurance-vtc/cote-d-azur/",
    "/assurance-vtc/aeroport-nice/",
    "/assurance-chasse/cote-d-azur/",
    "/assurance-equitation/cote-d-azur/",
    "/assurance-habitation/cote-d-azur/",
    "/assurance-sante/cote-d-azur/",
  ];
  return paths.map(function (p) {
    var prio = p === "/nice-cote-azur/" || p.indexOf("animaux") >= 0 ? "0.93" : "0.9";
    if (p.indexOf("aeroport-nice") >= 0) prio = "0.91";
    return { loc: base + p, lastmod: today, changefreq: "weekly", priority: prio };
  });
}

module.exports = {
  buildNiceCoteAzurPages: buildNiceCoteAzurPages,
  getNiceCoteAzurSitemapEntries: getNiceCoteAzurSitemapEntries,
};
