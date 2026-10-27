# Économie du jeu

> Document de conception (issue #13). Rien n'est codé ici : une fois ce document
> validé, chaque élément retenu devient une issue d'implémentation (voir la
> dernière section).

## 1. Principe directeur

**Le joueur gratuit doit pouvoir tout collectionner. On vend du confort et du
style, jamais du hasard.**

- Tout le contenu de jeu (cartes, albums, lingots, boosters) reste gagnable
  gratuitement, à un rythme qui donne envie de revenir chaque jour.
- **Aucun contenu aléatoire n'est vendu contre de l'argent réel**, ni
  directement (booster payant), ni indirectement (lingots achetables qui
  servent à acheter des boosters). C'est le mécanisme le plus exposé du droit
  à venir (section 4) et le plus mal vu des joueurs et des parents.
- Ce qui se vend est **déterministe** : le joueur sait exactement ce qu'il
  achète (un dos de carte, un abonnement aux avantages listés, un passe dont
  les récompenses sont affichées).
- Les cartes n'ont **aucune valeur monétaire** : ni revente, ni échange contre
  de l'argent. C'est ce qui tient le jeu hors du champ des jeux d'argent.

## 2. Ce que gagne un joueur gratuit aujourd'hui

Chiffres tirés des constantes du domaine (après #34 : 1 booster gratuit toutes
les 4 heures, réserve de 3).

| Source                                      | Par jour        | Par semaine                        |
| ------------------------------------------- | --------------- | ---------------------------------- |
| Boosters gratuits (joueur qui vient 2 fois) | ~4              | ~28                                |
| Boosters gratuits (maximum théorique)       | 6               | 42                                 |
| Missions (3 par jour, 30 à 50 lingots)      | ~120 lingots    | ~840 lingots                       |
| Série de connexion (10 × n, 100 au plus)    | 10 à 70 lingots | 280 lingots + 1 boost              |
| Lingots convertis (100 le booster)          |                 | ~11 boosters                       |
| **Total, joueur régulier**                  |                 | **~40 boosters, soit ~200 cartes** |

Conséquences :

- **Durée d'une collection** : 371 clubs, ~2 400 cartes en moyenne pour tous
  les avoir une fois (problème du collectionneur), soit **~12 semaines** pour
  un joueur régulier. Les quatre raretés de chaque club demandent beaucoup
  plus : la légendaire sort 1 fois sur 100.
- **Les lingots pèsent peu** face aux boosters gratuits (~11 contre ~28 par
  semaine). Ce n'est pas un problème tant que les lingots ne se vendent pas.
  Ils redeviendront un levier si on leur donne d'autres usages gratuits
  (doublons, cosmétiques gagnables).
- **Récompenses d'album** : 5 lingots par club (20 au moins), plus 1 booster
  dès 10 clubs. Elles restent un objectif de moyen terme.

À ne pas toucher en V1 : ces rythmes. On mesure d'abord la rétention réelle
(tableau de bord de l'admin) avant de rééquilibrer.

## 3. Sources de revenu envisagées

| Source                         | Retenue ?       | Pourquoi                                                                                                |
| ------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------- |
| **Abonnement « Supporter »**   | ✅ Oui, d'abord | Revenu récurrent, simple à expliquer, déjà prévu (réserve de 5).                                        |
| **Cosmétiques**                | ✅ Oui          | Déterministes, sans effet sur le jeu, très adaptés à une collection.                                    |
| **Passe de saison**            | 🕓 Plus tard    | Fort levier d'engagement, mais demande du contenu à chaque saison. À faire après les premiers chiffres. |
| Achat de lingots               | ❌ Non          | Les lingots achètent des boosters : ce serait vendre du hasard (loot box indirecte).                    |
| Boosters payants               | ❌ Non          | Loot box directe : risque juridique (section 4) et image.                                               |
| Boosters événementiels payants | ❌ Non          | Même raison. Les événements se gagnent (cadeaux, missions spéciales).                                   |
| Publicité récompensée          | ❌ Pas en V1    | Revenu faible à notre échelle, consentement RGPD aux traceurs, CSP à ouvrir, image du jeu.              |

### 3.1 Abonnement « Supporter »

| Avantage                                    | Effet sur le jeu                                     |
| ------------------------------------------- | ---------------------------------------------------- |
| Réserve de 5 boosters gratuits au lieu de 3 | Moins de boosters perdus si l'on vient peu souvent   |
| Badge « Supporter » au classement           | Cosmétique                                           |
| Un dos de carte exclusif par mois           | Cosmétique, gardé même après l'arrêt de l'abonnement |
| Accès anticipé aux nouveautés (albums…)     | Aucun avantage durable                               |

Le rythme de recharge ne change pas : un abonné qui vient 2 fois par jour
reçoit autant de boosters qu'un gratuit. La réserve plus grande ne sert qu'à
celui qui vient rarement. L'écart reste donc faible, ce qui garde un classement
juste.

**Prix proposé : 2,99 € par mois, ou 24,99 € par an** (−30 %).

### 3.2 Cosmétiques

- **Dos de carte** (révélation des boosters) : 0,99 € à 1,99 €.
- **Cadres de carte** (bordure, sans toucher à la couleur de rareté) : 1,99 €.
- **Thèmes d'album** (fond, typographie de l'en-tête) : 1,99 €.
- **Packs saisonniers** (Tournoi des Six Nations, finale du Top 14) : 2,99 €,
  prix affiché, contenu listé, aucun tirage.

Règle : un cosmétique ne doit jamais imiter un logo de club ou de la FFR
(même règle que les blasons). Certains cosmétiques se gagnent aussi (album
terminé, série de 30 jours) : l'achat n'est pas le seul chemin.

### 3.3 Passe de saison (plus tard)

Une saison de 8 semaines, 30 paliers. On avance en ouvrant des boosters et en
finissant des missions. La voie gratuite donne des lingots et des boosters. La
voie payante (4,99 €) ajoute des cosmétiques. Toutes les récompenses sont
affichées dès le départ.

## 4. Cadre légal (France et UE)

> ⚠️ À faire relire par un juriste avant de vendre quoi que ce soit. Ce qui
> suit est un état des lieux pour décider, pas un avis juridique.

### 4.1 Jeux d'argent

En France, un jeu est un jeu d'argent s'il réunit une offre au public, un
sacrifice financier, une part de hasard et une espérance de gain. Le gain se
juge sur sa valeur : **des cartes sans valeur monétaire, ni revendables ni
échangeables contre de l'argent, ne font pas du jeu un jeu d'argent.** C'est
une raison de plus pour ne pas ouvrir de marché d'échange payant. Le régime
expérimental des « JONUM » (jeux à objets numériques monétisables, loi SREN de 2024) ne nous concerne pas tant que les cartes ne sont pas monétisables.

### 4.2 Loot boxes : le risque qui monte

- **Belgique** : sa Commission des jeux de hasard considère depuis 2018 les
  loot boxes payantes comme des jeux de hasard. Le jeu étant accessible
  depuis la Belgique, vendre des boosters aléatoires y serait illégal.
- **UE** : le futur **Digital Fairness Act** (proposition attendue au
  4e trimestre 2026) doit examiner les mécanismes proches du jeu d'argent,
  dont les loot boxes. Des associations de consommateurs demandent leur
  interdiction.
- **Notre position** : ne rien vendre d'aléatoire. Le modèle reste ainsi
  valable quel que soit le texte adopté.
- Les **probabilités des raretés** sont déjà fixes et publiques dans le code.
  On les affichera quand même dans le jeu (page « Probabilités »), par
  transparence, même sans vente.

### 4.3 Monnaies virtuelles et protection du consommateur

Le réseau européen des autorités de protection des consommateurs (CPC) a
publié en mars 2025 sept principes sur les monnaies de jeu. Ils
s'appliqueraient si l'on vendait des lingots. En ne les vendant pas, on évite
le sujet, et l'on retient quand même l'esprit de ces principes :

1. **Prix affichés en euros**, toujours.
2. Aucun coût caché, aucune monnaie intermédiaire.
3. **Aucune incitation à dépenser plus que prévu** : pas de compte à rebours
   d'achat, pas d'offre « dernière chance ».
4. Information claire avant l'achat.
5. Droit de rétractation expliqué (voir 4.4).
6. Conditions claires et équitables (CGV).
7. **Protection des mineurs** : le jeu parle de rugby amateur, beaucoup de
   joueurs auront moins de 18 ans. Les achats passent par une carte bancaire
   (Stripe), donc par un adulte. On ajoute une mention et une limite de
   dépense mensuelle réglable, sans relances ni notifications commerciales.

### 4.4 Vente en ligne

- **Droit de rétractation (14 jours)** : pour un contenu numérique fourni tout
  de suite, il ne s'applique pas (article L221-28, 13° du Code de la
  consommation), à trois conditions : le joueur **consent expressément** à
  l'exécution immédiate, **reconnaît perdre** son droit de rétractation, et
  reçoit une **confirmation** (e-mail). Il faut une case dédiée au moment de
  payer : l'acceptation des CGV ne suffit pas.
- **Abonnement** : résiliation en ligne en quelques clics (obligation légale),
  sans reconduction cachée. Rappel avant le renouvellement de l'offre annuelle.
- **Documents obligatoires** : CGV, mentions légales complètes (#16),
  politique de confidentialité mise à jour (données de paiement chez Stripe),
  **médiateur de la consommation** désigné (obligatoire pour vendre à des
  particuliers).
- **Structure** : il faut une entité qui facture (micro-entreprise au départ).
  TVA et seuils : à valider avec un comptable.

## 5. Paiement

| Prestataire                                     | Coût indicatif                       | Pour                                         | Contre                                                |
| ----------------------------------------------- | ------------------------------------ | -------------------------------------------- | ----------------------------------------------------- |
| **Stripe** (Checkout + Billing)                 | ~1,5 % + 0,25 € par carte européenne | Moins cher, abonnements, portail client prêt | TVA et factures à notre charge (Stripe Tax en option) |
| Lemon Squeezy / Paddle (« merchant of record ») | ~5 % + 0,50 $, plus des suppléments  | Gèrent TVA, factures et litiges              | 3 à 4 fois plus cher sur des petits montants          |

**Recommandation : Stripe.** Les montants sont petits (0,99 € à 2,99 €), donc
une commission fixe élevée y pèse lourd. Les clients sont surtout en France,
ce qui garde la TVA simple. On utilise Stripe Checkout (page de paiement
hébergée par Stripe : aucune donnée de carte chez nous, et une CSP inchangée
côté jeu) et le portail client de Stripe pour résilier.

Architecture :

- Un **webhook** Stripe (route serveur signée) est la seule source de vérité
  d'un achat. Le navigateur ne déclare jamais un paiement.
- Il écrit les droits dans Postgres (abonnement actif jusqu'à telle date,
  cosmétiques possédés), avec RLS activée et sans règle, comme les autres
  tables.
- `maxFreeBoosters` (déjà prévu dans `createPlayerRepository`) vaut 5 pour un
  abonné actif.

## 6. Coûts et seuil de rentabilité

Le jeu vendant quelque chose, **l'offre gratuite de Vercel n'est plus
permise** : elle interdit l'usage commercial (voir CLAUDE.md).

| Poste                                                         | Coût mensuel indicatif  |
| ------------------------------------------------------------- | ----------------------- |
| Hébergement : Vercel Pro (ou Cloudflare Workers payant à 5 $) | ~20 $ (ou 5 $)          |
| Base : Supabase gratuit, puis Pro au besoin                   | 0 €, puis ~25 $         |
| E-mails (#14), nom de domaine                                 | ~0 à 2 €                |
| **Total**                                                     | **~20 à 50 € par mois** |

Un abonnement à 2,99 € rapporte environ 2,49 € hors TVA, et ~2,20 € après la
commission Stripe. **Il faut donc 10 à 25 abonnés pour couvrir les coûts.**
Avec une conversion de 2 à 5 % (fourchette courante en jeu gratuit), cela
représente 500 à 1 000 joueurs actifs par mois.

## 7. Indicateurs à suivre (admin)

À ajouter au tableau de bord, calculés côté serveur sur des données
agrégées :

- **Conversion** : part des joueurs actifs du mois qui ont payé.
- **Revenu** : par joueur actif (ARPU), par payeur (ARPPU), récurrent mensuel
  (MRR).
- **Abonnés** : nouveaux, résiliés, taux de résiliation mensuel.
- **Rétention** à J1, J7 et J30, payeurs contre gratuits (la rétention existe
  déjà, il reste à la découper).
- **Remboursements et litiges**, en nombre et en montant.
- **Rythme des gratuits** : boosters ouverts par joueur et par semaine, pour
  vérifier que le jeu gratuit reste généreux (section 2).

## 8. Découpage proposé en issues (après validation)

Dans l'ordre :

1. **Hébergement commercial** : passer sur Vercel Pro ou Cloudflare Workers
   payant (#10 a noté ce qu'il faut refaire pour Cloudflare).
2. **Cadre légal de la vente** : CGV, médiateur, mentions légales complètes
   (lié à #16), confidentialité à jour, page « Probabilités ».
3. **Paiement Stripe** : Checkout, webhook signé, table des droits, portail
   client, e-mail de confirmation (lié à #14).
4. **Abonnement Supporter** : réserve de 5, badge, dos de carte du mois.
5. **Cosmétiques** : dos de carte, cadres, puis boutique.
6. **Indicateurs de l'admin** (section 7).
7. **Passe de saison**, une fois les premiers chiffres en main.

## Sources

- [CPC : Key principles on in-game virtual currencies (mars 2025)](https://esportslegal.news/wp-content/uploads/2025/03/Key-principles-on-in-game-virtual-currencies.pdf), et leur [résumé par Reed Smith](https://www.reedsmith.com/articles/qas-on-the-eu-consumer-protection-authorities-joint-guidance-paper/)
- [Digital Fairness Act : guide pour les studios (Freshfields)](https://technologyquotient.freshfields.com/post/102ltio/the-eus-proposed-digital-fairness-act-a-game-developers-guide-to-potential-imp), et [son calendrier (Heuking)](https://www.heuking.de/en/news-events/newsletter-articles/detail/digital-fairness-act-implementation-obligations-companies-need-to-prepare-for.html)
- [Belgique : les loot boxes considérées comme des jeux de hasard (Clubic)](https://www.clubic.com/mag/jeux-video/actualite-839236-lootboxes-belgique-considere-jeux-hasard.html)
- [Régime expérimental des JONUM](https://www.soloazar.com/en/category/legislation/france-approves-three-year-trial-decree-for-monetisable-digital-object-games)
- [Contenu numérique et rétractation (L221-28, 13°)](https://donneespersonnelles.fr/contenu-numerique-acces-immediat)
- [Frais Stripe en France (comparatif 2026)](https://hayot-expertise.fr/blog/frais-stripe-paypal-mollie-klarna-comparatif-optimisation-ecommerce-2026), [frais de Lemon Squeezy](https://dodopayments.com/blogs/lemonsqueezy-review)
- [Vercel : offre Hobby réservée à l'usage non commercial](https://vercel.com/docs/plans/hobby-plan), [tarifs](https://vercel.com/pricing)

Les tarifs viennent en partie de comparatifs tiers : à vérifier sur les pages
officielles au moment de choisir.
