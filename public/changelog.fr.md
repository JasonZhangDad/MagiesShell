# Journal des versions

## [0.5.1] - 2026-07-18

### Version
- Installateurs et métadonnées de mise à jour auto de la ligne 0.5.x (MgTerminal-releases)

## [0.5.0] - 2026-07-17

### Fonctionnalités
- **Panneau de diagnostic Hex/Raw du terminal** : I/O de session octet par octet (optionnel)
- **Source d’hôtes JSON** : inventaire depuis JSON local ou HTTP(S) ; métadonnées seules ; en-têtes d’auth HTTP
- **Partage et import d’inventaire** : export métadonnées (YAML Ansible inclus) ; import presse-papiers
- **Modèles d’espace de travail nommés** : liaisons d’hôtes, splits, cwd/commande de démarrage optionnels
- **Signets de journal de connexion** : positions + notes + recherche
- **Vue canaux de transfert de ports en direct** : source, cible, octets par connexion
- **Actions onOutput de scripts** : notification, son, marquer l’onglet, démarrer l’enregistrement
- **Collage sûr et diffusion précise** : délai / attente d’invite / confirmation de commande dangereuse
- **Canal OpenSSH système** : GSSAPI/Kerberos et post-quantique (PQ)

### Windows ARM64
- **win-arm64 avec mosh / ET** : binaires natifs MoshMagies 0.1.9 et EternalTerminal 6.2.10
- **Canal de mise à jour auto dédié** : `latest-arm64.yml`

## [0.4.10] - 2026-07-17

### Fonctionnalités
- **Centre de diagnostic SSH** : « Tester la connexion » + « Diagnostiquer » — DNS / TCP / jump / clé d’hôte / auth / SFTP
- **Auth SSH Agent de premier plan** : choix Agent, empreintes, identité préférée
- **Instantané de santé multi-hôtes** : latence, auth, charge/mémoire/disque
- **Fiabilité SFTP phase 1** : reprise, nouvel essai auto, file persistante, SHA-256 optionnel
- **Onboarding produit** : guide Vault vide, palette de commandes, états vides

### Correctifs
- Vaults existants sans onboarding initial ; fermeture correcte du jump en échec d’auth health

## [0.4.9] - 2026-07-17

### Améliorations
- **Sources de release / MAJ auto vers un dépôt releases dédié** : MgTerminal-releases ; UX site et in-app inchangée

## [0.4.8] - 2026-07-16

### Fonctionnalités
- **Quick Connect EternalTerminal** : entrée ET (port SSH + port service ET, 2022 par défaut)
- **Auto-contrôle des identifiants** : Réglages → Système → Protection des identifiants
- **Installateur Windows ARM64** : win-arm64 (mosh/et et canal dédié en 0.5.0)
- **Expiration de restauration de session** : layouts > 14 jours purgés au démarrage

### Correctifs
- **UI russe** : 203 chaînes manquantes ; zh-CN +3 ; tests d’alignement
- Chemin mosh-server personnalisé Quick Connect appliqué

### Améliorations
- Règles de visibilité SFTP unifiées
- README macOS aligné sur la distribution non signée

## [0.4.7] - 2026-07-15

### Fonctionnalités
- **Langues d’interface étendues à 10** : aligné sur le site — ajout de japonais / coréen / allemand / français / espagnol / portugais (en / ru / zh-CN / zh-TW conservés)
- Réglages → Apparence → Langue liste toutes les langues prises en charge ; les chaînes non traduites basculent en anglais

## [0.4.6] - 2026-07-15

### Sécurité
- **La désactivation de la vérification des clés d’hôte SSH n’est plus silencieuse** : si `verifyHostKeys` est off (sessions terminal et connexions stats Mosh), un avertissement indique clairement que toute clé d’hôte est acceptée sans demande
- **Avertissement permanent dans les réglages** : désactiver « Vérifier les clés d’hôte SSH » affiche un risque MITM sous le basculeur (en / zh-CN / zh-TW). Activé par défaut

## [0.4.5] - 2026-07-15

### Correctifs
- **Chiffrements imbriqués provoquant 401 / flux vides** : des enregistrements répétés sans trousseau imbriquaient le chiffrement (`enc:v2(enc:v1(...))`) ; la boucle de déchiffrement déplie correctement les blobs dans le budget
- **Un mauvais identifiant ne casse plus tout le vault** : échec de déchiffrement d’un champ conserve la valeur stockée (fail-soft)
- **Clé API de recherche web** : focus/blur seuls ne suppriment plus une clé stockée après échec de déchiffrement ; messages plus clairs
- **Détection du chiffré DPAPI Windows** : le garde anti-rechiffrement manquait les clés DPAPI (en-tête `AQAAAN`) — corrigé
- **Cursor Agent** : un échec de déchiffrement n’injecte plus le chiffré comme clé API dans le processus enfant
- Réglages Provider / recherche web / Cursor : invites de ressaisie unifiées ; le changement de langue n’écrase plus les clés non enregistrées

## [0.4.4] - 2026-07-14

### Correctifs
- **IA 401 / flux vides** : si la déchiffrement de clé échoue ou n’est pas synchronisé au processus principal, plus de requête avec le placeholder `__IPC_SECURED__` ; échec immédiat et invite de réenregistrement
- Attendre la sync des providers vers le processus principal avant l’envoi
- Erreurs d’auth claires si la clé locale est indisponible

## [0.4.3] - 2026-07-14

### Correctifs
- **Déchiffrement de clé API** : le processus principal déchiffre correctement les clés vault locales `enc:v2` ; pas d’envoi de chiffré au fournisseur en cas d’échec
- **Placeholders d’identifiants** : les gardes de connexion / sync cloud reconnaissent `enc:v2`
- Erreurs actionnables pour flux modèles vides (`NoOutputGeneratedError`) et 401
- Sonde d’installation Cursor SDK via `require.resolve` pour moins de faux positifs

## [0.4.2] - 2026-07-14

### Correctifs
- **Échec de chiffrement de clé API résolu** : si le trousseau OS (`safeStorage`) est indisponible, bascule automatique vers un vault chiffré local (`enc:v2`)
- macOS préfère le trousseau système puis bascule discrètement ; Réglages → Système affiche le backend actif

## [0.4.1] - 2026-07-14

### Améliorations
- Sélecteur de thème : aperçus en cartes, portées Core / Tout, recherche et états vides
- Contraste Snow / Midnight par défaut amélioré ; palettes terminal `ui-snow` / `ui-midnight` synchronisées
- Hiérarchie de sélection unifiée sur Vault, SFTP, navigation des réglages, barre latérale IA, chrome terminal
- Listes de thèmes terminal avec recherche et pastilles plus claires
- Statut de sync, toasts, badges de mise à jour et surbrillances de dépôt sur des tokens de thème

## [0.4.0] - 2026-07-13

### Fonctionnalités
- Entrée « Contact » qui copie l’e-mail de support
- Reconnexion SSH en backoff exponentiel (dès 5 s, plafond 60 s) ; arrêt après 10 échecs avec invite manuelle
- Transferts de ports locaux/dynamiques réutilisent la session SSH terminal déjà authentifiée (pas de 2e mot de passe/2FA)
- Import de clés FIDO2 (`sk-*`) qui oriente vers l’auth ssh-agent

### Modifications

## [0.3.0] - 2026-07-13

### Correctifs
- Les échecs de chiffrement de clé API à l’enregistrement d’un fournisseur IA ne sont plus avalés ; erreur localisée sous le champ

## [0.2.9] - 2026-07-13

### Fonctionnalités
- Mise à jour auto macOS : installation par remplacement de bundle après téléchargement (contourne les limites Squirrel des apps non signées ; depuis 0.2.9 toutes les plateformes peuvent s’auto-mettre à jour)

### Correctifs
- L’icône conserve la plaque arrondie officielle en clair/sombre

## [0.2.8] - 2026-07-13

### Correctifs
- Paquets Windows qui quittaient silencieusement au lancement : ré-incorporation des hashs d’intégrité après réécriture asar, contrôles CI
- Progression et erreurs d’installation de mise à jour visibles sur toutes les plateformes

## [0.2.7] - 2026-07-13

### Correctifs
- Architecture de release Windows : empaquetage installateur x64 sûr

## [0.2.6] - 2026-07-12

### Sécurité
- Fenêtres tray empaquetées ignorent `VITE_DEV_SERVER_URL` et bloquent navigation / nouvelles fenêtres
- Preload ne fait plus confiance au serveur de dev comme origine dans `app.asar`
- DOMPurify 3.3.2, undici 6.23.0 contre XSS / DoS zip-bomb
- afterPack répare les hashs d’intégrité ASAR et Info.plist pour éviter le crash immédiat macOS

### Correctifs
- Tests d’intégration Telnet auto-login attendent l’invite avant d’asserter la fin

## [0.2.5] - 2026-07-12

### Correctifs
- « Redémarrer maintenant » sans effet : la sortie d’installation de mise à jour n’est plus annulée par les contrôles before-quit
- Erreurs claires si « Redémarrer et mettre à jour » échoue ; plateformes sans auto-install ouvrent Releases

## [0.2.4] - 2026-07-12

### Sécurité
- Arrêt de l’enregistrement si le chiffrement des identifiants est indisponible — pas de repli en clair
- Deep links SSH désactivés par défaut ; rejet des URL avec mot de passe ; confirmation avant connexion
- Presse-papiers OSC52 désactivé par défaut
- CSP Electron renforcé ; intégrité ASAR et fuses de sécurité activés
- Suppression de l’entitlement macOS disable-library-validation

## [0.2.3] - 2026-07-11

### Correctifs
- Noms d’hôte `app://` empaquetés mis en minuscules par Chromium ne cassent plus l’injection preload (terminal, SFTP, réglages, sélecteurs de fichiers, transferts de ports)
- Alignement des fenêtres principale/réglages et des permissions sur `app://magiesterminal`

## [0.2.2] - 2026-07-11

### Correctifs
- « Select Color Theme » imbriqué dans un ScrollArea bloquait les clics ; un seul défilement + pointerdown
- Dialogues de clés SSH/locales parentés correctement pour macOS
- Fenêtre des réglages s’ouvre sous le protocole `app://`
- Icônes barre latérale et paquet avec le nouvel ensemble d’assets

## [0.2.1] - 2026-07-11

### CI/CD
- Réactivation des builds auto macOS et Windows (non signés) pour plus de paquets prêts à l’emploi

## [0.2.0] - 2026-07-11

### Fonctionnalités
- IPC de mise à jour auto diffusé à toutes les fenêtres (principale + réglages)
- Machine d’état unifiée pour contrôle manuel et mise à jour auto
- « Vérifier les mises à jour » affiche la progression en direct
- Contrôle auto via electron-updater ~5 s après le lancement
- Téléchargement auto si nouvelle version (`autoDownload=true`)
- Toast persistant à la fin (« Redémarrer maintenant »)
- Toast d’erreur en cas d’échec avec repli Releases
- Barre de progression Réglages → Système pilotée par `useUpdateCheck`

### Notes de conception
- `broadcastToAllWindows` remplace l’IPC mono-émetteur
- `manualCheckStatus` suit l’UI de contrôle manuel ; priorité avec `autoDownloadStatus`
- `SettingsSystemTab` est un pur consommateur de `useUpdateCheck`
- Écouteurs IPC globaux enregistrés une fois dans `autoUpdateBridge.init()`
- `autoInstallOnAppQuit=false` — l’utilisateur déclenche le redémarrage

### Interface SettingsSystemTabProps
- Supprimé : `autoDownloadStatus`, `downloadPercent`
- Ajouté : `updateState`, `checkNow`, `installUpdate`, `openReleasePage`

### Notes
- S’applique aux apps empaquetées (Windows NSIS, macOS dmg/zip, Linux AppImage) ; en dev : `forceDevUpdateConfig=true` + `dev-app-update.yml`
- Toast `hasUpdate` historique supprimé pendant le téléchargement auto

### CI / build
- Privilégier les paquets Linux gratuits si la signature manque
- Linux x64 (AlmaLinux 8) : Clang en priorité, repli gcc-toolset-13
- Linux arm64 (Debian Bullseye) : `clang-14 + lld-14`
- Le job Release peut publier uniquement depuis les artefacts Linux
- Assouplir les contrôles deb en warnings si une plateforme est ignorée
