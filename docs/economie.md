# Économie du jeu

> Document de conception (issue #13). Rien n'est codé ici : une fois ce document
> validé, chaque élément retenu devient une issue d'implémentation (voir la
> dernière section).

## 1. Principe directeur

**Le joueur gratuit peut tout collectionner ; le joueur qui paie va plus
vite et se distingue.**

- Tout le contenu de jeu (cartes, albums, lingots, boosters) reste gagnable
  gratuitement, à un rythme qui donne envie de revenir chaque jour.
- On vend trois choses : le **pass VIP** (plus de boosters et de missions
  chaque jour), des **lingots** en boutique (qui s'échangent contre des
  boosters, comme aujourd'hui), et des **cosmétiques**.
- Les cartes n'ont **aucune valeur monétaire** : ni revente, ni échange contre
  de l'argent. C'est ce qui garde le jeu hors des jeux d'argent en France
  (section 4).

## 2. Ce que gagne un joueur gratuit aujourd'hui

Chiffres tirés des constantes du domaine (après #34 : 1 booster gratuit toutes
les 4 heures, réserve de 3).

| Source                                   | Par jour        | Par semaine                        |
| ---------------------------------------- | --------------- | ---------------------------------- |
| Boosters gratuits (2 visites par jour¹)  | ~4              | ~28                                |
| Boosters gratuits (maximum théorique)    | 6               | 42                                 |
| Missions (3 par jour, 30 à 50 lingots)   | ~120 lingots    | ~840 lingots                       |
| Série de connexion (10 × n, 100 au plus) | 10 à 70 lingots | 280 lingots + 1 boost              |
| Lingots convertis (100 le booster)       |                 | ~11 boosters                       |
| **Total, joueur régulier**               |                 | **~40 boosters, soit ~200 cartes** |

¹ Hypothèse : deux visites à 4 heures d'écart, la réserve vidée à chacune
(3 boosters, puis 1 regagné). Deux visites à 12 heures d'écart en donnent 6.
Le chiffre réel viendra du tableau de bord (section 7).

Conséquences :

- **Durée d'une collection** : 371 clubs, ~2 400 cartes en moyenne pour tous
  les avoir une fois (problème du collectionneur), soit **~12 semaines** pour
  un joueur régulier. Les quatre raretés de chaque club demandent beaucoup
  plus : la légendaire sort 1 fois sur 100.
- **Les lingots gagnés pèsent peu** face aux boosters gratuits (~11 contre
  ~28 par semaine). Un joueur qui veut aller plus vite les achète
  (section 3.2).
- **Récompenses d'album** : 5 lingots par club (20 au moins), plus 1 booster
  dès 10 clubs. Elles restent un objectif de moyen terme.

À ne pas toucher en V1 : ces rythmes. On mesure d'abord la rétention réelle
(tableau de bord de l'admin) avant de rééquilibrer.

## 3. Ce qu'on vend

| Offre                   | Quand     | Rôle                                                              |
| ----------------------- | --------- | ----------------------------------------------------------------- |
| **Pass VIP**            | D'abord   | Revenu récurrent : plus de boosters et de missions par jour       |
| **Lingots en boutique** | D'abord   | Achat ponctuel, pour aller plus vite                              |
| **Cosmétiques**         | Ensuite   | Se distinguer, sans effet sur le jeu                              |
| Passe de saison         | Plus tard | Engagement sur 8 semaines, une fois les premiers chiffres en main |
| Publicité récompensée   | Pas en V1 | Revenu faible à notre échelle, consentement aux traceurs          |

### 3.1 Pass VIP

| Avantage                                          | Gratuit          | VIP                   |
| ------------------------------------------------- | ---------------- | --------------------- |
| Réserve de boosters gratuits                      | 3                | **5**                 |
| Recharge                                          | 1 toutes les 4 h | 1 toutes les 4 h      |
| **Booster VIP** sans commune, une épique au moins | —                | **1 toutes les 48 h** |
| **Missions du jour**                              | 2                | **4, dont 2 VIP**     |
| Badge VIP au classement et sur le profil          | —                | ✅                    |

- **Booster VIP** : un toutes les 48 heures, ouvert sur l'écran Boosters.
  Aucune carte commune ; la première est épique (95 %) ou légendaire (5 %),
  les quatre autres rares (75 %), épiques (20 %) ou légendaires (5 %).
  Probabilités publiées sur `/probabilites`.
- **Missions VIP** : deux missions de plus chaque jour, tirées du même
  `MISSION_POOL`, différentes des deux missions communes, avec les mêmes
  récompenses en lingots (30 à 50).
- **Prix proposé : 5,99 € par mois, ou 49,99 € par an** (−30 %).
- Sans engagement : à l'arrêt, les avantages cessent à la fin de la période
  payée. Les cartes obtenues restent.

### 3.2 Lingots en boutique

Un booster coûte 100 lingots (`BOOSTER_OFFERS`, inchangé). Les gros paquets
font baisser le prix du booster :

| Paquet  | Lingots | Prix    | Soit le booster |
| ------- | ------- | ------- | --------------- |
| Poignée | 200     | 1,99 €  | 1,00 €          |
| Sac     | 700     | 5,99 €  | 0,86 €          |
| Coffre  | 1 500   | 11,99 € | 0,80 €          |
| Malle   | 3 600   | 24,99 € | 0,69 €          |

- La boutique n'affiche que les lingots et leur prix en euros, sans
  conversion en boosters : mélanger lingots et euros dans un même calcul
  brouille la lecture. Le prix du booster ci-dessus sert à l'équilibrage.
- Bonus affiché sur chaque paquet, vrai et vérifiable : lingots en plus par
  rapport au tarif de la Poignée, arrondis vers le bas (+16 %, +24 %, +43 %).
  Badge « Meilleure offre » sur la Malle.
- **Promotions** programmées dans l'admin : une vraie baisse (1 à 50 %) sur
  tous les achats en euros, pendant des jours entiers. Le prix normal est
  barré : la loi (art. L112-1-1) veut que ce soit le plus bas des 30 jours
  précédents, d'où 30 jours sans promotion avant et après chacune. **Jamais
  de fausse réduction** (pratique commerciale trompeuse, art. L121-2).
- Les lingots achetés et gagnés se confondent dans le même solde.
- **Effet sur le classement** : un joueur qui achète des lingots ouvre plus de
  boosters, donc grimpe plus vite. C'est assumé : le classement récompense la
  collection. Le badge VIP rend visible qui paie.

### 3.2 bis Offre de bienvenue

- **2,99 €, une seule fois par compte** : 500 lingots et 7 jours de pass VIP.
- Le premier achat est le plus dur à obtenir ; un joueur qui a payé une fois
  rachète beaucoup plus facilement. Pas de promotion en plus.
- Proposée sur l'accueil et en tête de la boutique, tant qu'elle n'est pas
  prise.

### 3.3 Cosmétiques

- **Dos de carte** (révélation des boosters) : 150 à 250 lingots.
- **Cadres de carte** (bordure, sans toucher à la couleur de rareté) : 250 lingots.
- **Thèmes d'album** (fond, typographie de l'en-tête) : 250 lingots.
- **En lingots seulement**, jamais en euros : on achète des lingots, puis on
  les dépense. Certains se gagnent aussi (album terminé, série de 30 jours).
  Un clic sur un cosmétique l'ouvre en grand avant l'achat.

Règle : un cosmétique n'imite jamais un logo de club ou de la FFR (même règle
que les blasons).

### 3.4 Passe de saison (plus tard)

Une saison de 8 semaines, 30 paliers. On avance en ouvrant des boosters et en
finissant des missions. La voie gratuite donne des lingots et des boosters, la
voie payante (5,99 €) ajoute des cosmétiques. Toutes les récompenses sont
affichées dès le départ.

### 3.5 Rythme d'un joueur VIP

| Source                         | Par semaine, en plus du gratuit                   |
| ------------------------------ | ------------------------------------------------- |
| Booster VIP (toutes les 48 h)  | +3 à 4 boosters premium                           |
| Missions VIP (2 × ~40 lingots) | +560 lingots, soit ~5 boosters                    |
| Réserve de 5                   | moins de boosters perdus                          |
| **Total**                      | **~+9 boosters (+20 %), dont 3 à 4 sans commune** |

Un VIP régulier ouvre ~52 boosters par semaine, contre ~40 pour un gratuit.
L'écart se voit sans écraser le joueur gratuit.

## 4. Cadre légal (France)

> ⚠️ À faire relire par un juriste ou un comptable avant d'ouvrir la vente.

- **Jeux d'argent** : un jeu en relève s'il réunit une offre au public, un
  sacrifice financier, du hasard et une espérance de gain. Des cartes **sans
  valeur monétaire**, ni revendables ni échangeables contre de l'argent, n'en
  font pas un jeu d'argent. Il ne faut donc pas ouvrir de revente des cartes
  contre de l'argent.
- **Probabilités** : celles des raretés sont fixes et dans le code. On les
  affiche dans le jeu (page « Probabilités »), dès qu'on vend des lingots qui
  servent à ouvrir des boosters.
- **Droit de rétractation (14 jours)** : il ne s'applique pas à un contenu
  numérique fourni tout de suite (article L221-28, 13° du Code de la
  consommation), si le joueur **consent expressément** à l'exécution immédiate,
  **reconnaît perdre** son droit, et reçoit une **confirmation** par e-mail.
  Il faut une case dédiée au paiement : l'acceptation des CGV ne suffit pas.
- **Abonnement** : résiliation en ligne en quelques clics (obligation légale),
  rappel avant le renouvellement de l'offre annuelle.
- **Mineurs** : un mineur ne peut pas s'engager seul dans un achat important,
  et une carte bancaire ne prouve pas l'âge. Le parcours d'achat demande une
  déclaration d'âge et, pour un mineur, l'accord d'un parent (ou réserve les
  achats aux majeurs : à trancher avec le juriste). Une limite de dépense
  mensuelle est réglable dans le compte.
- **Documents obligatoires** : CGV, mentions légales complètes (#16),
  politique de confidentialité mise à jour (paiements chez Stripe),
  **médiateur de la consommation** désigné.
- **Structure** : une entité qui facture (micro-entreprise au départ). TVA et
  seuils : à valider avec le comptable.

## 5. Paiement

| Prestataire                                     | Coût indicatif                       | Pour                                         | Contre                                                |
| ----------------------------------------------- | ------------------------------------ | -------------------------------------------- | ----------------------------------------------------- |
| **Stripe** (Checkout + Billing)                 | ~1,5 % + 0,25 € par carte européenne | Moins cher, abonnements, portail client prêt | TVA et factures à notre charge (Stripe Tax en option) |
| Lemon Squeezy / Paddle (« merchant of record ») | ~5 % + 0,50 $, plus des suppléments  | Gèrent TVA, factures et litiges              | 3 à 4 fois plus cher sur des petits montants          |

**Recommandation : Stripe.** Les montants sont petits (1,49 € à 24,99 €), donc
une commission fixe élevée y pèse lourd. On utilise Stripe Checkout (page de paiement
hébergée par Stripe : aucune donnée de carte chez nous, et une CSP inchangée
côté jeu) et le portail client de Stripe pour résilier.

**TVA** : on vend d'abord **en France seulement** (pays de facturation
vérifié au paiement) : TVA française, une seule règle. Ouvrir d'autres pays
demandera Stripe Tax (taux du pays du client) : à décider plus tard.

Architecture :

- Un **webhook** Stripe (route serveur signée) est la seule source de vérité
  d'un achat. Le navigateur ne déclare jamais un paiement.
- Il écrit les droits dans Postgres (abonnement actif jusqu'à telle date,
  lingots crédités, cosmétiques possédés), avec RLS activée et sans règle,
  comme les autres tables. Un achat de lingots crédite le solde par une
  action tracée, comme les corrections de l'admin.
- **Le droit va au bon joueur.** La session Checkout est créée côté serveur
  pour le joueur connecté (identité vérifiée par `requireAuthUser()`), qui y
  est rattaché (référence client). Le webhook retrouve le joueur par cette
  référence, jamais par un identifiant envoyé par le navigateur. Avant
  d'écrire, il vérifie le produit, le montant, la devise et le mode (test ou
  production).
- **Un événement ne compte qu'une fois.** Stripe peut livrer un même
  événement plusieurs fois, et dans le désordre. L'identifiant de chaque
  événement traité est enregistré, et un doublon est ignoré. L'écriture des
  droits et cet enregistrement se font dans la même transaction.
- **Chaque événement a sa transition de droits** : paiement (droit accordé),
  renouvellement (date de fin repoussée), annulation (droit gardé jusqu'à la
  fin de la période payée), remboursement et litige (droit retiré). L'état de
  l'abonnement se relit chez Stripe plutôt que de déduire l'ordre des
  événements.
- `maxFreeBoosters` (déjà prévu dans `createPlayerRepository`) vaut 5 pour un
  VIP actif ; le booster VIP du jour et les missions VIP ne sont proposés
  qu'à un VIP actif, vérifié côté serveur à chaque action.

## 6. Coûts et seuil de rentabilité

Le jeu vendant quelque chose, **l'offre gratuite de Vercel n'est plus
permise** : elle interdit l'usage commercial (voir CLAUDE.md).

| Poste                                                         | Coût mensuel indicatif  |
| ------------------------------------------------------------- | ----------------------- |
| Hébergement : Vercel Pro (ou Cloudflare Workers payant à 5 $) | ~20 $ (ou 5 $)          |
| Base : Supabase gratuit, puis Pro au besoin                   | 0 €, puis ~25 $         |
| E-mails (#14), nom de domaine                                 | ~0 à 2 €                |
| **Total**                                                     | **~20 à 50 € par mois** |

Un pass VIP à 5,99 € rapporte environ 4,99 € hors TVA, et ~4,65 € après la
commission Stripe. **Il faut donc 5 à 11 VIP pour couvrir les coûts**, sans
compter les lingots. Avec une conversion de 2 à 5 % (fourchette courante en
jeu gratuit), cela représente 200 à 550 joueurs actifs par mois.

## 6 bis. Prévisions

> Ordres de grandeur pour décider, pas des promesses. Les taux viennent des
> fourchettes courantes des jeux gratuits sur mobile ; les vrais chiffres
> viendront du tableau de bord (section 7). Les taux d'achat sont gardés
> identiques malgré la hausse des prix : à surveiller dès le lancement.

### Ce que rapporte chaque joueur, par mois

| Joueur                        | Rapporte (net de TVA et de Stripe) | Coûte (serveurs) |
| ----------------------------- | ---------------------------------- | ---------------- |
| Gratuit                       | 0 €                                | ~0,01 à 0,03 €   |
| VIP mensuel (5,99 €)          | **~4,65 €**                        | ~0,03 €          |
| VIP annuel (49,99 €)          | ~3,40 € par mois                   | ~0,03 €          |
| Acheteur de lingots (moyenne) | ~5 à 10 €, les mois où il achète   | ~0,03 €          |

- Le joueur gratuit ne coûte presque rien : les serveurs sont un forfait, pas
  un coût par joueur. Il fait vivre le classement, parraine, et sera peut-être
  VIP demain.
- **Le plus petit paquet (1,99 €) rapporte ~1,38 € net** : la commission fixe
  de Stripe (0,25 €) en prend encore une part sensible. Les paquets à 5,99 € et
  plus sont ceux qui comptent.
- Un VIP reste en moyenne 4 à 6 mois : **il rapporte ~19 à 28 € sur sa durée
  de vie**.

### Hypothèses

| Scénario  | Joueurs VIP | Acheteurs de lingots | Dépense moyenne en lingots |
| --------- | ----------- | -------------------- | -------------------------- |
| Prudent   | 1 %         | 0,5 %                | ~4,80 € net par mois       |
| Médian    | 2,5 %       | 1,5 %                | ~7,20 € net par mois       |
| Favorable | 4 %         | 3 %                  | ~9,60 € net par mois       |

En pourcentage des joueurs actifs du mois. Soit un revenu net de **~0,07 €,
~0,22 € ou ~0,47 € par joueur actif et par mois**.

### Résultat mensuel, selon le nombre de joueurs actifs

Revenu net de TVA et de Stripe, moins les cotisations de micro-entreprise
(~22 % du chiffre d'affaires, à confirmer avec le comptable) et les coûts
(hébergement, base, médiateur, domaine).

| Joueurs actifs par mois | Coûts  | Prudent    | Médian       | Favorable    |
| ----------------------- | ------ | ---------- | ------------ | ------------ |
| 500                     | ~30 €  | **−3 €**   | **+57 €**    | **+155 €**   |
| 2 000                   | ~55 €  | **+55 €**  | **+295 €**   | **+685 €**   |
| 10 000                  | ~100 € | **+450 €** | **+1 650 €** | **+3 600 €** |

- **Seuil de rentabilité** : ~200 joueurs actifs dans le scénario médian,
  ~550 dans le prudent.
- Au-delà de ~2 000 joueurs actifs, il faut Supabase Pro (~25 $ par mois) :
  c'est inclus dans les coûts ci-dessus.

### Trajectoire possible (scénario médian)

Le rugby compte ~300 000 licenciés en France, plus les supporters. Le jeu
vise d'abord leurs clubs.

| Moment         | Joueurs actifs | Résultat mensuel |
| -------------- | -------------- | ---------------- |
| Lancement (M1) | 200 à 500      | 0 à +55 €        |
| M6             | 1 000 à 3 000  | +130 à +460 €    |
| M12            | 3 000 à 8 000  | +460 à +1 300 €  |

**Ce qui fera la différence n'est pas le prix mais l'audience** : faire
connaître le jeu dans les clubs (parrainage, partage en story, accords avec
des clubs ou des ligues). À 2 000 joueurs actifs, le jeu se finance ; à
10 000, il devient un vrai complément de revenu.

## 7. Indicateurs à suivre (admin)

À ajouter au tableau de bord, calculés côté serveur sur des données
agrégées :

- **Conversion** : part des joueurs actifs du mois qui ont payé.
- **Revenu** : par joueur actif (ARPU), par payeur (ARPPU), récurrent mensuel
  (MRR).
- **VIP** : nouveaux, résiliés, taux de résiliation mensuel.
- **Lingots** : paquets vendus (par taille), lingots achetés contre lingots
  gagnés.
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
4. **Pass VIP** : réserve de 5, booster VIP du jour, missions VIP, badge.
5. **Boutique de lingots** : quatre paquets, crédit tracé du solde.
6. **Cosmétiques** : dos de carte, cadres, thèmes d'album.
7. **Indicateurs de l'admin** (section 7).
8. **Passe de saison**, une fois les premiers chiffres en main.

## Sources

- [Contenu numérique et rétractation (L221-28, 13°)](https://donneespersonnelles.fr/contenu-numerique-acces-immediat)
- [Frais Stripe en France (comparatif 2026)](https://hayot-expertise.fr/blog/frais-stripe-paypal-mollie-klarna-comparatif-optimisation-ecommerce-2026), [frais de Lemon Squeezy](https://dodopayments.com/blogs/lemonsqueezy-review)
- [Vercel : offre Hobby réservée à l'usage non commercial](https://vercel.com/docs/plans/hobby-plan), [tarifs](https://vercel.com/pricing)

Les tarifs viennent en partie de comparatifs tiers : à vérifier sur les pages
officielles au moment de choisir.
