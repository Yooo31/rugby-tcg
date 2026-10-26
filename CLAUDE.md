# CLAUDE.md — Rugby TCG

> Source de vérité du projet. Cahier des charges : `docs/spec.md`. Design : `docs/design-system.md`.
> Les règles de Next.js propres à cette version sont dans `AGENTS.md` (géré par `next dev`).

@AGENTS.md

## Le produit en une phrase

Jeu de cartes à collectionner (PWA mobile d'abord) sur les clubs de rugby français, du Top 14 à la Fédérale 3 : on ouvre des boosters, on collectionne des clubs, on complète des albums, et les missions du jour rapportent des lingots à échanger contre d'autres boosters.

## Règles non négociables

- **Rareté ≠ puissance.** La rareté est tirée au sort et fixée sur la carte ; la puissance vient du club (division + forme) et évolue. Aucun code ne doit déduire l'une de l'autre.
- **Le domaine est pur.** `src/domain` ne dépend ni de React, ni de Next, ni des données. Tout aléa (`Rng`) et toute date y sont injectés. ESLint le vérifie.
- **L'UI ne connaît que les interfaces de dépôt** (`src/data/repositories.ts`). Jamais d'import de `@/data/mock/*` hors de `src/data`. ESLint le vérifie.
- **Une feature n'importe une autre que par son `index.ts`.** ESLint le vérifie.
- **TypeScript strict, zéro `any`**, pas de `@ts-ignore` sans commentaire qui le justifie.
- **Toute couleur, typo, rayon ou durée vient d'un token** de `src/app/globals.css`. Seule exception : les dégradés décoratifs des CSS Modules de carte et de sachet.
- **Pas de logo officiel de club** tant que les droits ne sont pas acquis : on utilise `ClubCrest` (blason généré, dessin décrit dans `features/cards/lib/crest.ts` : forme, motif, sigle, étoiles selon la division). Les logos sont des marques et des œuvres protégées : ni Wikipédia ni une demande de joueur ne lèvent cette règle.
- **Toute logique livrée a ses tests**, co-localisés (`foo.ts` → `foo.test.ts`). Seuil de couverture bloquant sur `domain`, `data`, `lib`.
- **Ne jamais committer de secret.** Commits conventionnels (`feat:`, `fix:`, `chore:`…), vérifiés par commitlint.
- **Lire `node_modules/next/dist/docs/`** avant d'utiliser une API Next.js : cette version diffère de ce que l'on croit savoir.

## Stack

- Next.js 16.4.1 (App Router, Cache Components, Turbopack), React 19, TypeScript strict, pnpm, Node 22.
- Tailwind CSS v4 en CSS-first (pas de `tailwind.config`), CSS Modules pour les objets très visuels (carte, sachet).
- Zod pour les schémas de domaine ; les types en sont inférés (`z.infer`), jamais redéclarés.
- Motion (`motion/react`) pour les animations ; lucide-react pour les icônes.
- Vitest + Testing Library. ESLint + Prettier. Husky + lint-staged + commitlint.
- Données : Postgres (Supabase) et Prisma 7 ; l'état du joueur est arbitré par le serveur (actions serveur).

## Commandes

| Commande                      | Rôle                                                          |
| ----------------------------- | ------------------------------------------------------------- |
| `pnpm dev`                    | serveur de développement                                      |
| `pnpm check`                  | typecheck + lint + fallow + tests + build : avant de conclure |
| `pnpm fallow`                 | code mort, duplication, santé (régression = échec)            |
| `pnpm test` / `pnpm test:cov` | tests, avec ou sans couverture                                |
| `pnpm test:db`                | tests d'intégration contre un Postgres jetable (Docker)       |
| `pnpm e2e`                    | tests de bout en bout (Playwright, Supabase local)            |
| `pnpm typecheck`              | régénère les types de routes puis `tsc`                       |
| `pnpm icons`                  | régénère les icônes PWA                                       |
| `pnpm clubs:import`           | réimporte les clubs de la saison (Wikipédia, Wikidata)        |
| `pnpm db:deploy` / `db:seed`  | applique les migrations / charge le catalogue en base         |

## Architecture

```
src/
  app/            routes : fines, elles ne font que rendre un écran de feature
    (auth)/       connexion, inscription, mot de passe oublié
    (game)/       toutes les pages du jeu et le compte, sous GameProvider + AppShell
    auth/confirm  retour des liens reçus par e-mail
  components/
    ui/           primitives sans métier (Button, AsyncButton, Chip, ProgressBar, RewardLabel…)
    layout/       coquille (AppShell, ScreenHeader)
  domain/         règles du jeu, pures : club, geo, card, booster, collection, album, power,
                  mission, reward, wallet, album-reward, player
  data/
    repositories.ts   contrats d'accès aux données
    catalog/          clubs et albums du jeu : import Wikipédia + régionales indicatives
    player/           règles appliquées à l'état d'un joueur, communes au mock et au serveur
    server/           état du joueur dans Postgres (Prisma), réservé au serveur
    mock/             implémentation en mémoire, pour les tests
    index.ts          catalogue (createCatalogRepositories) et dépôts de test
  features/
    auth/         connexion, inscription, mot de passe, session côté serveur
    game/         état du jeu partagé (GameProvider, GameGate, GameShell) et actions serveur du joueur
    cards/        ClubCard, ClubCrest, CardDialog, inclinaison 3D
    boosters/     sachet, ouverture, révélation, résumé
    collection/   grille, filtres, tri
    albums/       liste, détail, progression, récompense d'album
    missions/     missions du jour
    leaderboard/  classement des collectionneurs (/classement)
    admin/        administration (/admin), entièrement côté serveur
    referral/     parrainage (panneau du compte)
    notifications/ abonnement Web Push, tâche planifiée d'envoi
    legal/        confidentialité et mentions légales (pages publiques)
    home/         accueil (cadeaux du moment, accès au classement)
  lib/            utilitaires transverses purs (rng, dates, duration, cn)
  test/           setup et fabriques de test
```

Sens des dépendances : `app → features → (domain, data, components, lib)` ; `data → domain` ; `domain → lib`. Jamais l'inverse.

### Conventions

- Une feature : `components/`, éventuellement `hooks/` et `lib/`, et un `index.ts` qui liste ses seuls exports publics. Une feature entièrement serveur (admin, referral) n'a que `server/index.ts`. N'exporter que ce qui est importé ailleurs : fallow signale tout export inutilisé.
- Un écran s'appelle `XxxScreen`, est un composant client et s'enveloppe dans `<GameGate>` (chargement et erreur y sont gérés une fois).
- Composants en PascalCase, hooks en `useXxx`, schémas Zod en `xxxSchema`, constantes en `SCREAMING_SNAKE_CASE`.
- Pas de nombre magique : une constante nommée et commentée.
- Commentaires en français, pour dire le pourquoi. Textes d'interface en français, vouvoiement, vocabulaire du rugby sans excès.
- Albums = règles (`AlbumRule`), jamais des listes de clubs : c'est ce qui permet à une carte d'appartenir à plusieurs albums.
- La région d'un club se déduit de son département ; elle n'est jamais stockée.
- Tout l'état du joueur passe par `PlayerRepository` : chaque action (ouvrir, acheter, récupérer) renvoie un `PlayerSnapshot` complet, que `GameProvider` publie tel quel. L'interface ne recalcule jamais un solde ou un avancement.
- Une récompense a trois états (`RewardStatus`) : `locked`, `claimable`, `claimed`. Elle se récupère par un geste du joueur, jamais automatiquement.
- Les styles des CSS Modules vivent dans `@layer components` pour que les utilitaires Tailwind de l'appelant restent prioritaires.

## Données

- **Catalogue des clubs** (`src/data/catalog`) : source unique du mock et de la base.
  - Du Top 14 à la Fédérale 3 : import de la saison depuis Wikipédia (composition des divisions, couleurs) et Wikidata (commune, département), par leurs API officielles. `pnpm clubs:import` régénère `clubs.wikipedia.json` ; changer `SEASON` dans `scripts/import-clubs/sources.ts` chaque été.
  - Divisions régionales : `clubs.regional.ts`, saisi à la main et **indicatif**, faute de source ouverte. **Masquées pour l'instant** (`HIDDEN_DIVISIONS`, `domain/club.ts`) : `CLUB_CATALOG` ne garde que les divisions jouables (tirage, albums, filtres, classement, seed) ; `FULL_CLUB_CATALOG` les contient toutes. Une carte régionale déjà possédée reste en base mais n'est plus affichée ni comptée.
  - Détails, limites et mentions à respecter : `docs/data-sources.md`.
- **Ne pas aspirer les sites de la FFR** (`monclubhouse.ffr.fr` et son API) : leurs `robots.txt` l'interdisent. Les données officielles passent par un accord avec la FFR ou les ligues.
- **Base** : Postgres chez Supabase, pilotée par Prisma (`prisma/schema.prisma`, migrations dans `prisma/migrations`). Le client généré (`src/generated`) n'est pas versionné.
  - `DATABASE_URL` sert à l'application (pooler en production), `DIRECT_URL` aux migrations. Modèle dans `.env.example`.
  - `pnpm db:deploy` applique les migrations, `pnpm db:seed` charge le catalogue (rejouable), `pnpm db:migrate` en crée une nouvelle.
  - La sécurité au niveau des lignes est activée sur toutes les tables **sans aucune règle** : la clé publique ne lit rien. Prisma la contourne ; toute action serveur doit donc identifier le joueur par sa session et ne jamais accepter un identifiant venu du navigateur.
  - Les migrations s'écrivent à la main quand Prisma ne peut pas les générer : `migrate dev` et `migrate diff` refusent la clé étrangère vers `auth.users`. `pnpm test:db` les applique sur une base vierge et vérifie qu'elles collent au client.
  - Toute nouvelle table reçoit `ENABLE ROW LEVEL SECURITY` et `REVOKE ALL … FROM anon, authenticated` dans sa migration, puis un contrôle des alertes de sécurité Supabase.
- **Le serveur arbitre tout l'état du joueur** : tirage (hasard cryptographique), réserve de boosters (heure du serveur), missions, récompenses et achats.
  - Chemin d'une action : `GameProvider` → `features/game/lib/server-repositories.ts` → actions serveur (`features/game/server/actions.ts` : session, validation Zod) → `createServerPlayerRepository(userId)` (`@/data/server`) → règles de `data/player/repository.ts` → Postgres.
  - Chaque action tourne dans une transaction qui verrouille la ligne du joueur (`SELECT … FOR UPDATE`) : deux clics simultanés ne dépensent jamais deux fois le même booster.
  - Les refus prévus (plus de booster, pas assez de lingots, récompense indisponible) reviennent sous forme de code (`ActionResult`), car Next masque le message des erreurs en production ; le navigateur les retransforme en erreurs du domaine.
  - Les règles (`createPlayerRepository`) sont les mêmes pour le mock et pour Postgres : seul le stockage (`PlayerStore`) change.
  - Clubs et albums viennent du catalogue versionné, côté navigateur comme côté serveur. La table `clubs` en est la copie (`pnpm db:seed`) : relancer le seed après chaque `pnpm clubs:import`, sinon une carte tirée peut viser un club absent de la base.
  - L'état du joueur arrive avec la page : `<InitialPlayer>` (`@/features/game/server`, sous `<Suspense>` dans le layout du jeu) le lit côté serveur et le remet au `GameProvider` (`seeded`). Sans lui (session absente, base injoignable), le navigateur le redemande par l'action serveur.
  - Débit limité à 30 actions par joueur toutes les 10 secondes, compté dans Postgres (`rate_limits`, `data/server/rate-limit.ts`) : la même limite pour toutes les instances du serveur. La version en mémoire (`lib/rate-limit.ts`) ne sert qu'aux tests.
  - Les ouvertures de boosters sont consignées dans `booster_openings` (statistiques) ; le domaine signale ces faits par des `PlayerEvent`, que seul le stockage Postgres enregistre.
  - Les tests d'écran injectent `createInMemoryRepositories()` ; les actions serveur sont remplacées par des doublures dans `src/test/setup.ts`.
- Le jour de jeu (missions) se calcule à l'heure de Paris (`toDayKey`), quel que soit le fuseau du serveur.

## Comptes

- Authentification par e-mail et mot de passe avec **Supabase Auth** et `@supabase/ssr` (cookies). Clients dans `src/lib/supabase`, feature dans `src/features/auth`.
- `src/proxy.ts` (le « middleware » de Next 16) rafraîchit la session à chaque requête et aiguille : sans session, tout mène à `/connexion` ; avec, les pages d'authentification renvoient au jeu. Les chemins sont nommés dans `src/lib/supabase/routes.ts`.
- `createSupabaseServerClient()` commence par `await connection()` : le client lit l'heure (expiration de la session), ce que Cache Components n'autorise qu'au moment de la requête. Tout composant serveur qui lit la session doit être sous `<Suspense>`, **dans sa propre page** : le `<Suspense>` d'un layout ne couvre pas la navigation d'une page à l'autre (voir les pages de `/admin`).
- Dans une transaction Prisma, les requêtes s'enchaînent (`await` l'une après l'autre), jamais en `Promise.all` : elles partagent une seule connexion.
- **Le proxy ne protège aucune donnée.** Côté serveur, l'identité vient uniquement de `getAuthUser()` / `requireAuthUser()` (`@/features/auth/server`), qui vérifient le jeton avec `getClaims()`. Ne jamais utiliser `getSession()` pour autoriser, ni un identifiant venu du navigateur.
- **Écrans gardés en mémoire** : avec Cache Components, Next.js cache (React `<Activity>`) jusqu'à trois écrans quittés, avec leur état, au lieu de les démonter. Toute sortie d'un compte (déconnexion, suppression) se fait donc par un rechargement complet (`window.location.replace`), sinon le compte suivant retrouve l'état du précédent. De même, l'état du joueur envoyé par le serveur avec une page remplace toujours celui gardé en mémoire (`PlayerSeed`).
- La ligne `players` est créée par `ensurePlayer()` à la connexion, à l'inscription et au retour d'un lien d'e-mail (`INSERT … ON CONFLICT DO NOTHING`, atomique).
- **Pseudo** obligatoire (`usernameSchema` : 3 à 20 caractères, lettres, chiffres, `.`, `-`, `_`), unique sans tenir compte de la casse (index sur `lower(username)`). Choisi à l'inscription, il attend dans les métadonnées du compte Supabase jusqu'à la création du joueur. Un joueur sans pseudo le choisit avant de jouer (`GameGate` affiche `UsernamePrompt`) ; il se change dans Compte. Seul le pseudo est public, jamais l'adresse e-mail.

## Classement et administration

- **Classement** : clubs différents possédés, toutes raretés confondues ; général ou par région des clubs. Calculé en SQL (`rank()`, ex æquo au même rang), même règle que `rankScores` du domaine. Seuls les joueurs avec pseudo et au moins un club sont classés ; on renvoie le top 50 et la ligne du joueur.
- **Administration** (`/admin`) : réservée aux adresses de `ADMIN_EMAILS` (variable d'environnement serveur, séparées par des virgules). Pour les autres, la page est introuvable (404).
  - `requireAdmin()` est appelé par **chaque** page et **chaque** action d'admin ; le garde du layout ne suffit pas.
  - Tableau de bord (joueurs, ouvertures, raretés tirées comparées aux probabilités, écart catalogue/base), recherche et fiche joueur, correction des soldes (motivée, tracée dans `admin_adjustments`, jamais sous zéro), cadeaux.
- **Cadeaux** (giveaways) : un titre, des lingots et/ou boosters, des jours entiers à l'heure de Paris. Pendant la période, chaque joueur le récupère une fois depuis l'accueil, par un geste. « Arrêter » met fin à un cadeau en cours (ceux qui l'ont pris le gardent) ; « Annuler » supprime un cadeau à venir.
- Formulaires : actions serveur + `useActionState`, validation Zod côté serveur (`lib/schemas.ts`), messages en français par code d'erreur (`lib/messages.ts`). Les réponses ne révèlent jamais si une adresse a un compte.
- `/auth/confirm` reçoit les liens des e-mails (confirmation, mot de passe oublié). Toute destination passée dans l'URL passe par `safeNextPath` (chemins internes uniquement).
- Le code réservé au serveur d'une feature s'importe par `@/features/<feature>/server` ; son `index.ts` n'expose que ce qui peut aller au navigateur.
- Réglages à faire dans Supabase (Authentication) : ajouter l'adresse du site et `…/**` aux « Redirect URLs » ; la confirmation d'e-mail peut être coupée en phase de test.

## Accessibilité et mobile

- Mobile d'abord, cibles tactiles ≥ 44 px, pas de défilement horizontal de page, encoches respectées (`pb-safe-nav`).
- Tout effet animé respecte `prefers-reduced-motion`.
- Chaque carte porte un nom accessible complet (club, division, puissance, rareté).

## Économie

- **Lingots** : gagnés par les missions et les albums terminés, dépensés en boosters bonus (`BOOSTER_OFFERS` : 1 booster pour 100 lingots, 10 pour 900).
- **Boosters** : une réserve de 3 gratuits au plus (`MAX_FREE_BOOSTERS`), qui regagne 1 booster toutes les 8 heures (`BOOSTER_REFILL_MS`) à partir de la première ouverture, soit 3 par jour au plus. Le premium (hors V1) portera la réserve à 5 (`PREMIUM_MAX_FREE_BOOSTERS`, paramètre `maxFreeBoosters` du dépôt). Les gratuits sont dépensés en premier ; les boosters bonus (achetés ou gagnés) s'y ajoutent sans plafond. L'état stocké est `{ count, since }` : ce qui a été regagné se calcule à partir de l'heure, sans minuteur.
- **Missions** : 3 par jour, les mêmes pour tous, tirées de `MISSION_POOL` à partir de la date, jamais deux du même type. Elles n'avancent qu'à l'ouverture d'un booster.
- **Albums** : récompense proportionnelle à la taille (`albumReward`), plus un booster à partir de 10 clubs.
- **Série de connexion** (`domain/streak.ts`) : le jour n rapporte 10 × n lingots (100 au plus), plus 1 booster tous les 7 jours. Un jour manqué (heure de Paris) remet la série à 1. À récupérer d'un geste sur l'accueil.
- **Parrainage** (`domain/referral.ts`) : code de 6 caractères, lien `/inscription?parrain=CODE`. Le filleul reçoit 1 booster à la création de son joueur ; le parrain en reçoit 2 quand le filleul a ouvert des boosters 3 jours différents, 10 filleuls récompensés au plus. Vérifié après chaque ouverture (`settleReferral`, verrou sur le parrain : un seul paiement par filleul).
- Tous les montants sont des constantes nommées du domaine : c'est là qu'on règle l'équilibrage.

## Exploitation et sécurité

- **En-têtes** (`next.config.ts`) : `upgrade-insecure-requests` seulement si `NEXT_PUBLIC_SITE_URL` est en `https://` (sinon un serveur de test en HTTP casse). CSP sans nonce (un nonce rendrait chaque page dynamique), `frame-ancestors 'none'`, `nosniff`, HSTS… Le navigateur ne parle qu'au site : toute nouvelle ressource externe (police, image, API) doit être ajoutée à la CSP, sinon elle est bloquée sans bruit.
- **RGPD** : suppression du compte (Compte, mot de passe redemandé ; `DELETE FROM auth.users`, tout part en cascade), export JSON (`/compte/donnees`), pages `/confidentialite` et `/mentions-legales` (publiques ; les « À compléter » sont à remplir par l'éditeur). Le service worker ne met plus les pages en cache : elles contiennent l'état du joueur.
- **Pseudos** : liste de mots interdits (`domain/moderation.ts`, accents et chiffres déguisés normalisés ; mots courts bloqués seulement s'ils sont entiers). L'admin peut réinitialiser un pseudo.
- **Notifications** (Web Push) : clés `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`. Règles dans `domain/notification.ts` : réserve pleine (une fois par remplissage), rappel de série dès 19 h, jamais de 22 h à 8 h. L'envoi se fait par `GET /api/cron/notifications` avec `Authorization: Bearer $CRON_SECRET`, **à appeler toutes les 15 minutes** par une tâche planifiée (à mettre en place avec l'hébergement). Sur iPhone, il faut d'abord installer le jeu sur l'écran d'accueil.
- **Sentry** (offre gratuite) : erreurs seulement, ni traces ni enregistrement de session (`src/lib/sentry/options.ts`). Aucune donnée personnelle : `sendDefaultPii: false` et `scrubEvent` retire e-mail, IP, cookies, en-têtes et contenu des requêtes. Éteint sans `NEXT_PUBLIC_SENTRY_DSN` (donc en local et en CI). Le navigateur envoie par la route relais `/monitoring` (CSP inchangée, exclue du proxy). Source maps envoyées au build seulement si `SENTRY_AUTH_TOKEN` est défini. Bouton « Envoyer une erreur de test » dans `/admin`. Côté Sentry, l'organisation `yoan-2h` a « Prevent Storing of IP Addresses » activé, et une règle _Advanced Data Scrubbing_ `[Mask] [Anything] from [$user.geo.**]` : sans elles, Sentry déduit à la réception l'IP et la ville des erreurs du navigateur, quoi que dise le code. À refaire si l'organisation change. Sur Cloudflare Workers (si l'on y passe un jour), le point d'entrée devrait être enveloppé par `withSentry` : voir le commentaire de l'issue #10.
- **Partage en story** : `/partage/carte?club=…&rarete=…` génère une image 1080 × 1920 (`next/og`) avec le code de parrainage, seulement pour une carte possédée. Ses couleurs copient les tokens (le moteur d'image ne lit pas le CSS).

- **Garder Next.js à jour des correctifs de sécurité.** Versions exactes dans `package.json` (`next` et `eslint-config-next` toujours à la même version). `pnpm audit --prod` doit rester sans faille sur `next`.
  - 2026-10-22 : passage de 16.4.0 à 16.4.1, qui corrige deux exécutions de code à distance (optimisation d'images SVG, fonctions `use cache` renvoyant des tableaux typés) et un déni de service sur les actions serveur.
  - `next build` refuse de se lancer sur une version vulnérable connue (« SecurityFatalError ») : c'est le signal pour monter de version.
- **Base Supabase en pause.** Un projet gratuit est mis en pause après une semaine sans activité : son nom de domaine ne répond plus (`NXDOMAIN`), l'application et la connexion tombent. Remède : bouton **Restore** dans le tableau de bord Supabase. Si le projet a été supprimé : en créer un, mettre à jour `.env.local`, puis `pnpm db:deploy` et `pnpm db:seed`.
- **Catalogue et base doivent rester alignés** : relancer `pnpm db:seed` après chaque `pnpm clubs:import` (voir « Données »).
- **Hébergement : Vercel, offre gratuite (Hobby)**, relié au dépôt GitHub : `main` → production, `develop` et PR → préproduction (`vercel.json` : fonctions en région Paris `cdg1`, à côté de Supabase `eu-west-3` ; branches Dependabot jamais déployées). Variables d'environnement dans le tableau de bord Vercel (modèle : `.env.example`), `NEXT_PUBLIC_SITE_URL` en `https://`. ⚠️ Hobby interdit l'usage commercial : passer sur Cloudflare Workers payant (5 $/mois) ou Vercel Pro avant de monétiser. Cloudflare gratuit est hors de portée (Worker de 8 Mo compressés pour 3 Mo autorisés) ; ce qu'il faudrait refaire pour y passer est noté dans l'issue #10.

## Feuille de route V1

Fait : socle, cartes et raretés, boosters gratuits, collection, albums par division, région et département, missions quotidiennes, lingots, récompenses d'album, PWA.

Fait aussi : schéma de base et migrations, import de 371 clubs réels (Top 14 à Fédérale 3), comptes joueurs, arbitrage serveur (état du joueur en base).

Fait aussi : classement des collectionneurs (général et par région), pseudo, administration (statistiques, rétention, joueurs, corrections, cadeaux), tests d'intégration Postgres, limite de débit partagée, en-têtes de sécurité, RGPD, modération des pseudos, série de connexion, parrainage, notifications, partage en story, blason enrichi.

À faire : divisions régionales, bloquées tant qu'il n'y a pas d'accord avec la FFR ou les ligues pour une source officielle. Avant la mise en ligne : relancer la base, premier commit, déploiement.

Hors périmètre V1 : paiement réel, marché d'échange, usage des doublons, collections saisonnières et événementielles, féminines et jeunes (le champ `category` les prévoit).

## Git, CI et versions

- Dépôt public `github.com/Yooo31/rugby-tcg`. **`main` = production, `develop` = développement.** On travaille sur `develop` (ou une branche qui y fusionne) ; `main` ne reçoit que des fusions depuis `develop`.
- **CI** (`.github/workflows/ci.yml`), sur chaque push et PR vers `main` et `develop` : Qualité (types, lint, formatage, fallow, tests et couverture), Base de données (`pnpm test:db`), Build, Bout en bout (`pnpm e2e`), Commits (commitlint sur la PR). Ces cinq noms sont les vérifications obligatoires des deux branches.
- **Bout en bout** (`e2e/`, `playwright.config.ts`) : l'application construite, branchée sur une pile Supabase locale (`supabase/config.toml` : Postgres, authentification et API seulement), en mobile (Pixel 7) et en bureau. Parcours joueur, accès à l'administration, accessibilité (axe, WCAG AA, violations graves) et console sans erreur sur toutes les pages. En local : `pnpm e2e:supabase` puis `pnpm e2e:prepare` une fois, puis `pnpm e2e` (port 3200). Les pseudos de test passent par la modération : pas de « admin » dedans.
- **Versions** : semantic-release (`.releaserc.json`, `release.yml`) après une CI verte sur `main`. Le numéro vient des commits conventionnels (`feat` → mineure, `fix` → corrective, `BREAKING CHANGE` → majeure) ; il est porté par le tag git et la release GitHub, dont les notes font office de changelog. Rien n'est commité sur les branches : `package.json` garde `0.0.0-development`. Avant la V1, les versions restent en 0.x (tag de départ `v0.1.0`).
- **Dépendances** : Dependabot (`.github/dependabot.yml`) propose chaque lundi ses mises à jour sur `develop`. Mineures et correctives sont fusionnées seules si la CI passe (`dependabot-auto-merge.yml`) ; les majeures attendent une relecture.
- **Revue** : CodeRabbit (`.coderabbit.yaml`, gratuit en dépôt public) relit chaque PR vers `develop` et `main`, en français, avec les règles de ce fichier.
- **Suivi** : un chantier = une issue GitHub (libellé, jalon « Mise en ligne », « MEP V1 » ou « Après V1 »). Sa branche part de `develop` et porte son numéro : `<type>/<n>-<sujet>` (`feat/7-masquer-regionales`), créée par `gh issue develop <n> --base develop --name <branche> --checkout`. La PR vers `develop` contient `Closes #<n>` ; elle est fusionnée en squash (le message reprend la description), et l'issue se ferme quand `develop` arrive sur `main`.
- Coût : zéro. GitHub Actions est illimité pour un dépôt public ; ne pas ajouter de service payant.

## Méthode de travail

1. Lire ce fichier, puis `docs/spec.md` pour toute question produit.
2. Pour une tâche non triviale, proposer un plan avant de coder.
3. Vérifier dans un vrai navigateur, en largeur mobile, tout changement visible.
4. Finir par `pnpm check`. Mettre ce fichier à jour si une convention change.

Skills du projet (`.claude/skills/`) : `new-feature`, `card-rarity`, `mock-data`, `quality-gate`, plus `supabase` et `supabase-postgres-best-practices` (installés depuis `supabase/agent-skills`).
