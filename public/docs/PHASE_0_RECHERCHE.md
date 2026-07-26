# Lumiris-System — Phase 0 : Recherche & Architecture

> **Statut :** Terminé  
> **Durée estimée :** 2 semaines  
> **Objectif :** Définir toute l'architecture du projet avant d'écrire la moindre ligne de code fonctionnel.

---

## Table des matières

1. [Architecture globale](#1-architecture-globale)
2. [Schéma base de données](#2-schéma-base-de-données)
3. [Définition de l'API publique](#3-définition-de-lapi-publique)
4. [Structure des modules](#4-structure-des-modules)
5. [Normes de code](#5-normes-de-code)

---

## 1. Architecture globale

### Vue d'ensemble

Lumiris-System repose sur un modèle **Core + Modules** strictement hiérarchisé.

```
Lumiris-System
│
├── Core                    ← Framework principal (ultra-léger)
│   ├── Players             ← Gestion joueurs & sessions
│   ├── Accounts            ← Comptes financiers
│   ├── Inventory API       ← API inventaire (pas le système)
│   ├── Vehicle API         ← API véhicules
│   ├── Events              ← Système d'événements global
│   ├── Callbacks           ← Client ↔ Serveur
│   ├── Database            ← ORM + migrations + cache
│   ├── Permissions         ← Niveaux d'accès
│   ├── Logger              ← Logs centralisés
│   ├── Config              ← Configuration centralisée
│   ├── Locales             ← Internationalisation
│   └── Versioning          ← Gestion des versions
│
├── Modules                 ← Fonctionnalités optionnelles
│   ├── [module-name]/
│   │   ├── client/
│   │   ├── server/
│   │   ├── shared/
│   │   ├── config/
│   │   ├── locales/
│   │   ├── sql/
│   │   ├── ui/
│   │   ├── tests/
│   │   └── manifest.lua
│   └── ...
│
├── API Publique            ← Interface stable pour développeurs
├── Dashboard Web           ← Interface d'administration
├── Documentation           ← Docs publiques
├── Marketplace             ← Distribution de modules
├── Launcher                ← Installateur / updater
└── SDK Développeur         ← Outils tiers
```

### Règles fondamentales d'architecture

| Règle | Description |
|---|---|
| **Le Core est minimal** | Aucune fonctionnalité métier dans le Core. Seulement l'infrastructure. |
| **Les modules sont indépendants** | Un module ne doit jamais appeler directement un autre module. Il passe par l'API du Core. |
| **Le Framework ne dépend pas des modules** | Le Core fonctionne sans aucun module chargé. |
| **Les modules dépendent du Framework** | Toute interaction passe par les exports officiels du Core. |
| **API stable** | L'API publique ne subit jamais de breaking change entre deux versions mineures. |

### Flux de démarrage du serveur

```
FXServer démarre
    │
    ▼
Core charge (Players, DB, Events, Permissions, Logger, Config)
    │
    ▼
Core expose son API publique
    │
    ▼
Modules activés chargent dans l'ordre de leurs dépendances
    │
    ▼
Serveur prêt — joueurs peuvent se connecter
```

### Flux de connexion d'un joueur

```
Joueur connecte
    │
    ▼
Core.Players — vérification licence / whitelist
    │
    ▼
Core.DB — chargement du profil
    │
    ▼
Core.Permissions — assignation des droits
    │
    ▼
Core.Events — event "playerLoaded" émis
    │
    ▼
Modules abonnés reçoivent l'event et initialisent leurs données
    │
    ▼
Module Spawn — sélection du spawn / multi-character
```

---

## 2. Schéma base de données

### Conventions générales

- Toutes les tables sont préfixées par `lumiris_`
- Les identifiants utilisent `VARCHAR(60)` (format licence FiveM)
- Les timestamps utilisent `BIGINT` (Unix ms) pour la cohérence cross-timezone
- Les données JSON complexes sont stockées en `LONGTEXT` avec validation applicative
- Les clés étrangères sont explicites et indexées

### Tables Core

#### `aurora_players`
```sql
CREATE TABLE IF NOT EXISTS `lumiris_players` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `license` VARCHAR(60) NOT NULL, -- Identifiant principal
    `name` VARCHAR(100) NOT NULL,
    `metadata` LONGTEXT DEFAULT '{}', -- Données libres (JSON)
    `last_seen` BIGINT NOT NULL,
    `first_joined` BIGINT NOT NULL,
    `playtime` INT UNSIGNED DEFAULT 0, -- En secondes
    `is_banned` TINYINT(1) DEFAULT 0,
    `ban_reason` TEXT DEFAULT NULL,
    `ban_expires` BIGINT DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_license` (`license`),
    INDEX `idx_last_seen` (`last_seen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `aurora_characters`
```sql
CREATE TABLE IF NOT EXISTS `lumiris_characters` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `slot` TINYINT NOT NULL DEFAULT 1, -- Multi-character
    `firstname` VARCHAR(50) NOT NULL,
    `lastname` VARCHAR(50) NOT NULL,
    `dob` DATE NOT NULL,
    `gender` TINYINT(1) NOT NULL, -- 0=H, 1=F
    `nationality` VARCHAR(50) DEFAULT NULL,
    `appearance` LONGTEXT DEFAULT '{}', -- Customisation ped
    `metadata` LONGTEXT DEFAULT '{}',
    `last_position` LONGTEXT DEFAULT '{}', -- {x, y, z, heading}
    `is_dead` TINYINT(1) DEFAULT 0,
    `created_at` BIGINT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_slot` (`player_id`, `slot`),
    CONSTRAINT `fk_char_player` FOREIGN KEY (`player_id`) REFERENCES `aurora_players`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `aurora_accounts`
```sql
CREATE TABLE IF NOT EXISTS `lumiris_accounts` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `character_id` INT UNSIGNED NOT NULL,
    `account_type` VARCHAR(30) NOT NULL DEFAULT 'cash', -- cash | bank | dirty | custom
    `label` VARCHAR(60) DEFAULT NULL,
    `amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    `created_at` BIGINT NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_character` (`character_id`),
    CONSTRAINT `fk_acc_char` FOREIGN KEY (`character_id`) REFERENCES `aurora_characters`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `aurora_permissions`
```sql
CREATE TABLE IF NOT EXISTS `lumiris_permissions` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `grade` VARCHAR(30) NOT NULL DEFAULT 'user', -- user | staff | developer | console
    `custom_perms` LONGTEXT DEFAULT '[]', -- Permissions granulaires (JSON)
    `granted_by` VARCHAR(60) DEFAULT NULL,
    `granted_at` BIGINT DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_player_perm` (`player_id`),
    CONSTRAINT `fk_perm_player` FOREIGN KEY (`player_id`) REFERENCES `aurora_players`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `aurora_logs`
```sql
CREATE TABLE IF NOT EXISTS `lumiris_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `level` ENUM('info','warn','error','debug') NOT NULL DEFAULT 'info',
    `source` VARCHAR(60) NOT NULL, -- Nom du module source
    `action` VARCHAR(100) NOT NULL,
    `player_id` INT UNSIGNED DEFAULT NULL,
    `details` LONGTEXT DEFAULT NULL, -- JSON
    `created_at` BIGINT NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_source` (`source`),
    INDEX `idx_player` (`player_id`),
    INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `aurora_migrations`
```sql
CREATE TABLE IF NOT EXISTS `aurora_migrations` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `module` VARCHAR(60) NOT NULL,
    `version` VARCHAR(20) NOT NULL,
    `filename` VARCHAR(120) NOT NULL,
    `applied_at` BIGINT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_migration` (`module`, `filename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Tables des modules (exemples)

Ces tables sont gérées par leurs modules respectifs et ne font pas partie du Core.

#### `aurora_items` *(module Inventaire)*
```sql
CREATE TABLE IF NOT EXISTS `lumiris_items` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(60) NOT NULL, -- Identifiant unique de l'item
    `label` VARCHAR(100) NOT NULL,
    `weight` FLOAT NOT NULL DEFAULT 0,
    `stackable` TINYINT(1) DEFAULT 1,
    `useable` TINYINT(1) DEFAULT 0,
    `metadata` LONGTEXT DEFAULT '{}',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `aurora_inventory` *(module Inventaire)*
```sql
CREATE TABLE IF NOT EXISTS `lumiris_inventory` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `owner_type` ENUM('character','vehicle','stash','shop') NOT NULL,
    `owner_id` VARCHAR(60) NOT NULL,
    `item_name` VARCHAR(60) NOT NULL,
    `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
    `slot` SMALLINT NOT NULL,
    `metadata` LONGTEXT DEFAULT '{}',
    PRIMARY KEY (`id`),
    INDEX `idx_owner` (`owner_type`, `owner_id`),
    CONSTRAINT `fk_inv_item` FOREIGN KEY (`item_name`) REFERENCES `aurora_items`(`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 3. Définition de l'API publique

L'API publique est la surface contractuelle du Framework. Elle ne change jamais entre deux versions mineures.

### API Joueurs

```lua
-- Récupère un objet Player depuis son source FiveM
-- @param source number | string
-- @return Player | nil
Framework.GetPlayer(source)

-- Récupère tous les joueurs connectés
-- @return Player[]
Framework.GetPlayers()

-- Récupère un joueur par l'id de son personnage
-- @param charId number
-- @return Player | nil
Framework.GetPlayerByCharId(charId)


-- ── Objet Player ──────────────────────────────────────────────────────────────

-- Argent
Player:AddMoney(account, amount) -- Ajoute de l'argent
Player:RemoveMoney(account, amount) -- Retire de l'argent
Player:GetMoney(account) -- Retourne le solde
Player:SetMoney(account, amount) -- Définit le solde

-- Job / grade
Player:SetJob(job, grade) -- Assigne un métier
Player:GetJob() -- Retourne { name, label, grade, gradeLabel }

-- Inventaire
Player:AddItem(item, qty, metadata) -- Ajoute un item
Player:RemoveItem(item, qty) -- Retire un item
Player:GetItem(item) -- Retourne { name, qty, metadata } | nil
Player:HasItem(item, qty) -- Retourne boolean

-- Métadonnées
Player:GetMetadata(key) -- Lire une valeur
Player:SetMetadata(key, value) -- Écrire une valeur

-- Personnage
Player:GetCharacter() -- Retourne les données du personnage actif
Player:GetLicense() -- Retourne la licence FiveM
Player:GetSource() -- Retourne le source FiveM

-- Notifications
Player:Notify(message, type, duration) -- Envoie une notification
                                       -- type : 'success' | 'error' | 'info' | 'warning'

-- Permissions
Player:HasPermission(perm) -- Retourne boolean
Player:GetGrade() -- Retourne 'user' | 'staff' | 'developer' | 'console'
```

### API Monde

```lua
-- Véhicules
Framework.SpawnVehicle(model, coords, heading, cb) -- Crée un véhicule
Framework.DeleteVehicle(entity) -- Supprime un véhicule
Framework.GetVehicleData(plate) -- Données d'un véhicule immatriculé
Framework.SetVehicleOwner(plate, charId) -- Transfert de propriété

-- PNJ
Framework.CreateNPC(model, coords, heading, freeze) -- Crée un PNJ
Framework.DeleteNPC(entity) -- Supprime un PNJ

-- Blips
Framework.CreateBlip(data)
-- data = { label, coords, sprite, color, scale, short_range }
Framework.RemoveBlip(blipId)
```

### API UI (client-side)

```lua
-- Notification
Notify(message, type, duration)

-- Menu radial / NUI
Menu({
    title = "Titre",
    options = {
        { label = "Option 1", icon = "fa-car", action = function() end },
    }
})

-- Context menu
Context({
    id = "unique_id",
    title = "Titre",
    options = { ... }
})

-- Barre de progression
ProgressBar({
    duration = 3000,
    label = "Chargement...",
    canCancel = true,
    onFinish = function() end,
    onCancel = function() end,
})

-- TextUI (texte flottant)
TextUI("Appuyez sur [E]", "info")
HideTextUI()

-- Input
local result = Input({
    title = "Titre",
    fields = {
        { label = "Prénom", type = "text", name = "firstname", required = true },
        { label = "Âge", type = "number", name = "age" },
    }
})

-- Dialog (confirmation)
Dialog({
    title = "Confirmer ?",
    content = "Êtes-vous sûr ?",
    onAccept = function() end,
    onCancel = function() end,
})
```

### API Base de données

```lua
-- Toutes les fonctions sont asynchrones (résolveur de promesse Lua ou callback)

-- SELECT — retourne un tableau de rows
local rows = Database.Query("SELECT * FROM aurora_players WHERE license = ?", { license })

-- INSERT — retourne l'insertId
local id = Database.Insert("INSERT INTO aurora_logs (source, action) VALUES (?, ?)", { "core", "test" })

-- UPDATE / DELETE — retourne le nombre de rows affectées
local affected = Database.Update("UPDATE aurora_accounts SET amount = ? WHERE id = ?", { 1000, accountId })
local affected = Database.Delete("DELETE FROM aurora_logs WHERE id = ?", { logId })

-- Transaction
Database.Transaction(function(tx)
    tx.Update("UPDATE aurora_accounts SET amount = amount - ? WHERE id = ?", { 500, fromId })
    tx.Update("UPDATE aurora_accounts SET amount = amount + ? WHERE id = ?", { 500, toId })
end)
```

### API Events

```lua
-- Émettre un événement côté serveur
Framework.EmitEvent(eventName, ...)

-- Émettre vers un client spécifique
Framework.EmitClient(source, eventName, ...)

-- Émettre vers tous les clients
Framework.EmitAllClients(eventName, ...)

-- S'abonner à un événement (serveur)
Framework.OnEvent(eventName, handler)

-- S'abonner à un événement (client)
Framework.OnClientEvent(eventName, handler)
```

### API Callbacks

```lua
-- ── Côté serveur ──────────────────────────────────────────────────────────────

-- Enregistrer un callback
Framework.RegisterCallback("aurora:getPlayerData", function(source, cb, data)
    local player = Framework.GetPlayer(source)
    cb(player:GetCharacter())
end)

-- ── Côté client ───────────────────────────────────────────────────────────────

-- Appeler un callback
Framework.TriggerCallback("aurora:getPlayerData", function(result)
    print(result.firstname)
end, { someParam = true })
```

### API Logger

```lua
-- Tous les modules logguent via le Core
Logger.Info(source, action, details)
Logger.Warn(source, action, details)
Logger.Error(source, action, details)
Logger.Debug(source, action, details)

-- Exemple
Logger.Info("inventory", "item:add", { player = source, item = "water", qty = 1 })
```

---

## 4. Structure des modules

### Structure standard d'un module

Chaque module respecte cette arborescence sans exception.

```
modules/
└── [module-name]/
    │
    ├── manifest.lua                    ← Déclaration du module (obligatoire)
    │
    ├── client/
    │   ├── main.lua                    ← Point d'entrée client
    │   ├── events.lua                  ← Listeners d'events client
    │   ├── callbacks.lua               ← TriggerCallbacks
    │   └── functions.lua               ← Fonctions utilitaires client
    │
    ├── server/
    │   ├── main.lua                    ← Point d'entrée serveur
    │   ├── events.lua                  ← Listeners d'events serveur
    │   ├── callbacks.lua               ← RegisterCallbacks
    │   └── functions.lua               ← Fonctions utilitaires serveur
    │
    ├── shared/
    │   └── functions.lua               ← Code partagé client/serveur
    │
    ├── config/
    │   └── config.lua                  ← Configuration du module
    │
    ├── locales/
    │   ├── fr.lua                      ← Traductions françaises
    │   └── en.lua                      ← Traductions anglaises
    │
    ├── sql/
    │   ├── 001_initial.sql             ← Migration initiale
    │   └── 002_update.sql              ← Migrations suivantes (numérotées)
    │
    ├── ui/                             ← Interface NUI (HTML/CSS/JS ou React)
    │   ├── index.html
    │   ├── app.js
    │   └── style.css
    │
    └── tests/
        ├── client.test.lua
        └── server.test.lua
```

### Fichier `manifest.lua`

```lua
return {
    name = "inventory", -- Identifiant unique (snake_case)
    label = "Inventaire Aurora", -- Nom lisible
    version = "1.0.0", -- Semantic versioning
    author = "Aurora Team",
    description = "Système d'inventaire complet",

    -- Dépendances requises (doivent être chargées avant ce module)
    dependencies = {
        "core",
    },

    -- Dépendances optionnelles
    optional_dependencies = {
        "phone",
    },

    -- Compatibilité
    min_core_version = "0.1.0",

    -- Fichiers à charger dans l'ordre
    client_scripts = {
        "shared/functions.lua",
        "client/functions.lua",
        "client/events.lua",
        "client/callbacks.lua",
        "client/main.lua",
    },

    server_scripts = {
        "shared/functions.lua",
        "server/functions.lua",
        "server/events.lua",
        "server/callbacks.lua",
        "server/main.lua",
    },

    -- Migrations SQL à appliquer au démarrage
    sql_migrations = {
        "sql/001_initial.sql",
    },
}
```

### Exports d'un module

Un module peut exposer des fonctions aux autres modules via les exports FiveM, mais uniquement via l'API stable documentée dans son `manifest.lua`.

```lua
-- server/main.lua
exports("AddItem", function(charId, item, qty, metadata)
    -- ...
end)

exports("RemoveItem", function(charId, item, qty)
    -- ...
end)
```

---

## 5. Normes de code

### Langage et conventions générales

| Élément | Convention |
|---|---|
| Langage principal | Lua 5.4 (FiveM natif) |
| UI | HTML + CSS + JS vanilla ou React |
| Nommage variables | `camelCase` |
| Nommage fonctions | `camelCase` |
| Nommage tables Lua | `PascalCase` |
| Nommage fichiers | `snake_case.lua` |
| Nommage events | `aurora:module:action` (ex: `aurora:inventory:addItem`) |
| Nommage exports | `PascalCase` (ex: `AddItem`, `RemoveItem`) |
| Nommage SQL | `snake_case`, préfixe `aurora_` |
| Indentation | 4 espaces (pas de tabulations) |
| Longueur max ligne | 120 caractères |

### Nommage des événements

```lua
-- Format : aurora:{module}:{action}
-- Exemples :

"aurora:inventory:addItem"
"aurora:inventory:removeItem"
"aurora:player:loaded"
"aurora:player:logout"
"aurora:bank:deposit"
"aurora:bank:withdraw"
"aurora:police:cuffPlayer"
```

### Structure d'un fichier Lua

```lua
-- ─── MODULE : Inventory / Server / Callbacks ─────────────────────────────────
-- Description courte du fichier.
-- Auteur : Aurora Team
-- Version : 1.0.0

local Config = require("config.config")
local Locale = Framework.Locale

-- ── Variables locales ─────────────────────────────────────────────────────────

local inventoryCache = {}

-- ── Fonctions privées ─────────────────────────────────────────────────────────

local function validateItem(itemName)
    -- ...
end

-- ── Callbacks ─────────────────────────────────────────────────────────────────

Framework.RegisterCallback("aurora:inventory:getItems", function(source, cb, data)
    -- Toujours valider côté serveur
    if not source or source <= 0 then return cb(nil) end

    local player = Framework.GetPlayer(source)
    if not player then return cb(nil) end

    -- Logique
    local items = getPlayerInventory(player:GetCharacter().id)
    cb(items)
end)
```

### Validation côté serveur — règles absolues

```lua
-- ✅ TOUJOURS valider la source
if not source or source <= 0 then return end

-- ✅ TOUJOURS vérifier que le joueur existe
local player = Framework.GetPlayer(source)
if not player then return end

-- ✅ TOUJOURS valider les types des arguments reçus
if type(amount) ~= "number" or amount <= 0 then return end
if type(item) ~= "string" or item == "" then return end

-- ✅ TOUJOURS loguer les actions sensibles
Logger.Info("inventory", "item:add", {
    player = source,
    item = itemName,
    qty = quantity,
})

-- ❌ JAMAIS faire confiance aux données client
-- ❌ JAMAIS exposer des données d'un autre joueur sans vérification
-- ❌ JAMAIS effectuer une opération financière sans vérifier le solde avant
```

### Anti-patterns interdits

```lua
-- ❌ Interdit : appel direct d'un module depuis un autre module
local inv = exports["aurora-inventory"]:GetInventory(charId) -- NON

-- ✅ Correct : passer par l'API du joueur
local items = player:GetItem("water")


-- ❌ Interdit : stocker des données sensibles côté client
LocalPlayer.state.bankAmount = 50000  -- NON

-- ✅ Correct : demander au serveur via callback
Framework.TriggerCallback("aurora:bank:getBalance", function(balance)
    -- afficher balance
end)


-- ❌ Interdit : requête SQL dans le thread principal (bloquant)
local result = MySQL.query.await("SELECT * FROM aurora_inventory")  -- avec await dans un event sync = NON

-- ✅ Correct : utiliser les helpers async du Core
local rows = Database.Query("SELECT * FROM aurora_inventory WHERE owner_id = ?", { charId })
```

### Gestion des erreurs

```lua
-- Toujours wrapper les opérations critiques
local ok, err = pcall(function()
    Database.Transaction(function(tx)
        tx.Update("UPDATE aurora_accounts SET amount = amount - ? WHERE id = ?", { amount, fromId })
        tx.Update("UPDATE aurora_accounts SET amount = amount + ? WHERE id = ?", { amount, toId })
    end)
end)

if not ok then
    Logger.Error("bank", "transfer:failed", { error = err, from = fromId, to = toId })
    Player:Notify("Une erreur est survenue.", "error")
    return
end
```

### Localisation

```lua
-- ❌ Interdit : strings hardcodées dans le code
Player:Notify("Vous n'avez pas assez d'argent.") -- NON

-- ✅ Correct : passer par le système de locale
Player:Notify(Locale("bank.insufficient_funds"))

-- locales/fr.lua
return {
    ["bank.insufficient_funds"] = "Vous n'avez pas assez d'argent.",
    ["bank.deposit_success"] = "Vous avez déposé %s€.",
}
```

### Performances — objectifs et règles

| Contexte | Objectif ms |
|---|---|
| Core complet | 0.00 – 0.02 ms |
| Petit module | 0.00 ms |
| Module moyen | 0.01 ms |
| Gros module | ≤ 0.03 ms |

**Règles de performance :**

- Ne jamais utiliser de boucle `while true do ... Citizen.Wait(0)` sans raison justifiée.
- Préférer les `Citizen.Wait(500)` ou plus dans les threads de polling.
- Ne jamais faire de requête SQL dans un thread `Wait(0)`.
- Utiliser le cache mémoire du Core pour les données fréquemment lues (personnage, inventaire chargé).
- Décharger les entités et les threads lorsqu'un joueur se déconnecte.

### Versioning des modules

Tous les modules suivent le **Semantic Versioning** (`MAJOR.MINOR.PATCH`) :

| Type | Signification |
|---|---|
| `PATCH` (0.0.x) | Correctif de bug sans changement d'API |
| `MINOR` (0.x.0) | Nouvelle fonctionnalité rétro-compatible |
| `MAJOR` (x.0.0) | Changement d'API avec breaking change |

La version du Core définit la version minimale requise par chaque module via `min_core_version` dans le `manifest.lua`.

---

## Checklist Phase 0 — Livrables

- [x] Architecture globale définie
- [x] Règles fondamentales formalisées
- [x] Schéma base de données Core (6 tables)
- [x] Exemples de tables modules (inventaire)
- [x] API publique définie (Players, Monde, UI, DB, Events, Callbacks, Logger)
- [x] Structure standard des modules
- [x] Format du `manifest.lua`
- [x] Normes de code (nommage, structure, anti-patterns)
- [x] Règles de validation serveur
- [x] Règles de performance
- [x] Politique de versioning

---

*Document Lumiris-System — Phase 0 /*  
*Prochaine étape : Phase 1 — Core (v0.1)*
