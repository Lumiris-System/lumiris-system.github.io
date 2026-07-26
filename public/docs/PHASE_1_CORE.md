# Lumiris-System — Phase 1 : Core (v0.1)

> **Statut :** Terminé  
> **Durée estimée :** 1–2 mois  
> **Objectif :** Implémenter le cœur du framework. Léger, rapide, indispensable. Aucune fonctionnalité métier — uniquement l'infrastructure sur laquelle tous les modules s'appuient.

---

## Table des matières

1. [Structure des fichiers](#1-structure-des-fichiers)
2. [Ordre de chargement](#2-ordre-de-chargement)
3. [Systèmes implémentés](#3-systèmes-implémentés)
   - 3.1 [Config](#31-config)
   - 3.2 [Logger](#32-logger)
   - 3.3 [Database & ORM](#33-database--orm)
   - 3.4 [Cache](#34-cache)
   - 3.5 [Events](#35-events)
   - 3.6 [Callbacks](#36-callbacks)
   - 3.7 [Locales](#37-locales)
   - 3.8 [Versioning](#38-versioning)
   - 3.9 [Permissions](#39-permissions)
   - 3.10 [Players & Sessions](#310-players--sessions)
   - 3.11 [Accounts](#311-accounts)
   - 3.12 [Vehicle API](#312-vehicle-api)
   - 3.13 [Inventory API](#313-inventory-api)
4. [Schéma base de données](#4-schéma-base-de-données)
5. [API publique complète](#5-api-publique-complète)
6. [Événements Core](#6-événements-core)
7. [Commandes console](#7-commandes-console)

---

## 1. Structure des fichiers

```
Lumiris-System/
│
├── fxmanifest.lua                          ← Déclaration FiveM (scripts, version, dépendances)
│
└── Core/
    ├── Config/
    │   └── config.lua                      ← Configuration centralisée de tout le framework
    │
    ├── Logger/
    │   └── logger.lua                      ← Logs centralisés (4 niveaux, console + BDD)
    │
    ├── Database/
    │   └── database.lua                    ← ORM léger + système de migrations
    │
    ├── Cache/
    │   └── cache.lua                       ← Cache mémoire avec TTL et nettoyage automatique
    │
    ├── Events/
    │   ├── events.lua                      ← Système d'événements serveur
    │   └── events_client.lua               ← Système d'événements client
    │
    ├── Callbacks/
    │   ├── callbacks.lua                   ← Enregistrement de callbacks côté serveur
    │   └── callbacks_client.lua            ← Déclenchement de callbacks côté client
    │
    ├── Locales/
    │   ├── data/
    │   │   ├── fr.lua                      ← Chaînes françaises du Core
    │   │   └── en.lua                      ← Chaînes anglaises du Core (fallback global)
    │   ├── locales.lua                     ← Chargement i18n, fonction Locale(), sync client
    │   └── locales_client.lua              ← Réception et utilisation des locales côté client
    │
    ├── Versioning/
    │   └── versioning.lua                  ← SemVer, registre des modules, vérification compatibilité
    │
    ├── Permissions/
    │   └── permissions.lua                 ← Grades hiérarchiques + permissions granulaires
    │
    ├── Players/
    │   ├── player_class.lua                ← Classe Player (toute l'API publique player)
    │   ├── players.lua                     ← Registre des joueurs connectés, chargement, ban
    │   ├── sessions.lua                    ← Durée de session, auto-save périodique
    │   └── players_client.lua              ← Signal "clientReady", données personnage local
    │
    ├── Accounts/
    │   └── accounts.lua                    ← Transferts atomiques, helpers inter-personnages
    │
    ├── Vehicle_API/
    │   ├── vehicle_api.lua                 ← Données véhicules BDD (propriété, plaque, fausse plaque, metadata)
    │   └── vehicle_api_client.lua          ← Spawn physique, suppression, NPC, Blips
    │
    ├── Inventory_API/
    │   └── inventory_api.lua               ← Pont contractuel (provider pattern, file d'attente)
    │
    ├── Shared/
    │   └── types.lua                       ← Types, classes et constantes partagés (client + serveur)
    │   └── utils.lua                       ← Utilitaires partagés (JSON, deep copy, validation…)
    │
    └── main.lua                            ← Migrations SQL, signal lumiris:core:ready
```

---

## 2. Ordre de chargement

L'ordre dans `fxmanifest.lua` est **critique**. Chaque système peut dépendre des précédents.

### Serveur

```
1.  Core/Shared/types.lua                   ← Constantes globales (LUMIRIS.NotifyType, PermGrade…)
2.  Core/Shared/utils.lua                   ← Utilitaires (Utils.ToJSON, Utils.Now…)
3.  Core/Config/config.lua                  ← Framework.Config.*
4.  Core/Logger/logger.lua                  ← Framework.Logger (Logger.Info / Warn / Error / Debug)
5.  Core/Database/database.lua              ← Framework.Database (Query / Insert / Update / Transaction)
6.  Core/Cache/cache.lua                    ← Framework.Cache (Get / Set / Delete)
7.  Core/Events/events.lua                  ← Framework.Events (Emit / On / OnNet…)
8.  Core/Callbacks/callbacks.lua            ← Framework.Callbacks (RegisterCallback)
9.  Core/Locales/locales.lua                ← Framework.Locales + fonction globale Locale()
10. Core/Versioning/versioning.lua          ← Framework.Versioning (RegisterModule, IsCompatible…)
11. Core/Permissions/permissions.lua        ← Framework.Permissions (HasGrade, SetGrade…)
12. Core/Players/player_class.lua           ← CreatePlayer() — constructeur de l'objet Player
13. Core/Players/players.lua                ← Framework.GetPlayer / GetPlayers / GetPlayerByCharId
14. Core/Players/sessions.lua               ← Framework.Sessions + auto-save
15. Core/Accounts/accounts.lua              ← Framework.Accounts (Transfer, GetBalance…)
16. Core/Vehicle_API/vehicle_api.lua        ← Framework.VehicleAPI (GetVehicleData, SetVehicleOwner…)
17. Core/Inventory_API/inventory_api.lua    ← Framework.InventoryAPI (pont, provider pattern)
18. Core/main.lua                           ← Migrations SQL + TriggerEvent("lumiris:core:ready")
```

### Client

```
1. Core/Shared/types.lua
2. Core/Shared/utils.lua
3. Core/Callbacks/callbacks_client.lua      ← Framework.TriggerCallback
4. Core/Events/events_client.lua            ← Framework.EmitServer / OnClientEvent
5. Core/Locales/locales_client.lua          ← Framework.Locales + Locale() côté client
6. Core/Players/players_client.lua          ← Signal clientReady, Framework.GetLocalCharacter
7. Core/Vehicle_API/vehicle_api_client.lua  ← Framework.SpawnVehicle / DeleteVehicle / CreateNPC…
```

---

## 3. Systèmes implémentés

### 3.1 Config

**Fichier :** `Core/Config/config.lua`

Configuration centralisée accessible via `Framework.Config.*`. Toutes les valeurs sont regroupées par domaine. Aucun autre fichier ne contient de valeur de configuration en dur.

| Domaine | Clés principales |
|---|---|
| `Config.Framework` | `version`, `debug`, `locale` |
| `Config.Database` | `slowQueryThreshold`, `maxConnections`, `cacheTTL` |
| `Config.Players` | `maxCharactersPerAccount`, `allowMultipleLogins`, `autoSaveInterval` |
| `Config.Accounts` | `startingCash`, `startingBank`, `allowNegativeBalance`, `defaultAccounts` |
| `Config.Cache` | `defaultTTL`, `cleanupInterval`, `maxEntries` |
| `Config.Logger` | `minLevel`, `consoleOutput`, `databaseOutput`, `retentionDays` |
| `Config.Permissions` | `defaultGrade`, `superAdmins` |

---

### 3.2 Logger

**Fichier :** `Core/Logger/logger.lua`

Tous les modules logguent **uniquement** via le Logger. Jamais de `print()` direct dans le code de production.

**4 niveaux :**

| Niveau | Usage |
|---|---|
| `debug` | Traces de développement — ignoré si `Config.Framework.debug = false` |
| `info` | Actions normales (connexion, achat, transfert…) |
| `warn` | Situations anormales non bloquantes (clé locale manquante, doublon…) |
| `error` | Erreurs critiques nécessitant attention |

**Sorties :** console FiveM (avec codes couleur) + table `lumiris_logs` en BDD (async, non bloquant).

```lua
Logger.Info("module", "action:done", { player = source, data = "..." })
Logger.Warn("module", "action:suspicious", { ... })
Logger.Error("module", "action:failed", { error = err })
Logger.Debug("module", "trace", { ... })
```

---

### 3.3 Database & ORM

**Fichier :** `Core/Database/database.lua`  
**Dépendance :** oxmysql

Wrapper autour d'oxmysql exposant une API synchrone (via coroutines FiveM). Toutes les requêtes SQL du framework passent par ces helpers — jamais par oxmysql directement.

**Détection des requêtes lentes** : toute requête dépassant `Config.Database.slowQueryThreshold` ms est loggée en `warn`.

**Système de migrations** : `Database.RunMigrations(moduleName, migrations)` applique les fichiers SQL une seule fois et trace chaque application dans `lumiris_migrations`. Idempotent — sûr à appeler à chaque démarrage.

```lua
-- SELECT
local rows = Database.Query("SELECT * FROM lumiris_players WHERE license = ?", { lic })

-- INSERT
local id = Database.Insert("INSERT INTO lumiris_logs ...", { ... })

-- UPDATE / DELETE
local count = Database.Update("UPDATE lumiris_accounts SET amount = ? WHERE id = ?", { 500, 1 })

-- Transaction atomique
Database.Transaction(function(tx)
    tx.Update("UPDATE lumiris_accounts SET amount = amount - ? WHERE id = ?", { 100, fromId })
    tx.Update("UPDATE lumiris_accounts SET amount = amount + ? WHERE id = ?", { 100, toId })
end)

-- Migrations
Database.RunMigrations("core", {
    { filename = "001_initial.sql", version = "0.1.0", sql = "CREATE TABLE ..." }
})
```

---

### 3.4 Cache

**Fichier :** `Core/Cache/cache.lua`

Cache mémoire serveur avec TTL par entrée. Utilisé pour éviter les requêtes SQL répétées sur des données stables (permissions, données véhicules…).

- Nettoyage automatique toutes les `Config.Cache.cleanupInterval` secondes
- Limite configurable du nombre d'entrées (`Config.Cache.maxEntries`)
- Suppression par préfixe pour invalider des groupes entiers

```lua
Cache.Set("perm:42", data, 600)       -- TTL 600s
local data = Cache.Get("perm:42")     -- nil si expiré ou absent
Cache.Delete("perm:42")
Cache.DeleteByPrefix("perm:")         -- invalide tout le groupe
Cache.Has("perm:42")                  -- boolean
Cache.Size()                          -- nombre d'entrées actives
Cache.Flush()                         -- vide entièrement le cache
```

---

### 3.5 Events

**Fichiers :** `Core/Events/events.lua` + `Core/Events/events_client.lua`

Wrapper autour des events FiveM natifs. Ajoute la validation automatique de la source sur les events réseau et le logging en mode debug.

**Serveur :**
```lua
Framework.EmitEvent("lumiris:module:action", data)               -- serveur → serveur
Framework.EmitClient(source, "lumiris:module:action", data)      -- serveur → client
Framework.EmitAllClients("lumiris:module:action", data)          -- serveur → tous clients
Framework.EmitClients(sources, "lumiris:module:action", data)    -- serveur → liste clients
Framework.OnEvent("lumiris:module:action", handler)              -- écoute serveur
Framework.OnNetEvent("lumiris:module:action", handler)           -- écoute réseau (source validée auto)
```

**Client :**
```lua
Framework.EmitServer("lumiris:module:action", data)              -- client → serveur
Framework.OnClientEvent("lumiris:module:action", handler)        -- écoute locale client
Framework.OnNetEvent("lumiris:module:action", handler)           -- écoute réseau client
```

---

### 3.6 Callbacks

**Fichiers :** `Core/Callbacks/callbacks.lua` + `Core/Callbacks/callbacks_client.lua`

Système request/response client ↔ serveur. Chaque requête reçoit un identifiant unique. Côté client, un timeout de **15 secondes** libère automatiquement le callback si le serveur ne répond pas (protection contre les fuites mémoire).

**Serveur — enregistrement :**
```lua
Framework.RegisterCallback("lumiris:getPlayerData", function(source, cb, data)
    if not source or source <= 0 then return cb(nil) end
    local player = Framework.GetPlayer(source)
    if not player then return cb(nil) end
    cb(player:GetCharacter())
end)
```

**Client — appel :**
```lua
Framework.TriggerCallback("lumiris:getPlayerData", function(result)
    if not result then return end
    print(result.firstname)
end, { someParam = true })
```

---

### 3.7 Locales

**Fichiers :** `Core/Locales/locales.lua` + `Core/Locales/locales_client.lua`

Système i18n complet. La fonction globale `Locale("clé")` est disponible **côté serveur et côté client** avec la même signature.

**Règles :**
- Aucune chaîne de texte affichée à un joueur ne peut être hardcodée dans le code
- Toutes les chaînes passent par `Locale("clé")` ou `Locale("clé", arg1, arg2)`
- Fallback automatique vers `en` si la clé est absente dans la langue active
- Fallback final vers la clé brute (visible uniquement en mode debug)

**Serveur :**
```lua
-- Utilisation
Player:Notify(Locale("accounts.insufficient_funds"))
Player:Notify(Locale("accounts.add_success", 500))  -- "Vous avez reçu 500€."

-- Un module ajoute ses propres chaînes au démarrage
Framework.Locales.LoadModule("lumiris-inventory")

-- Changer la langue globale
Framework.Locales.SetLocale("en")
```

**Fichier de locale d'un module (`Core/Locales/data/fr.lua`) :**
```lua
return {
    ["bank.insufficient_funds"] = "Vous n'avez pas assez d'argent.",
    ["bank.deposit_success"] = "Vous avez déposé %s€.",
}
```

**Synchronisation client :** les chaînes sont envoyées au client via `lumiris:locales:sync` à chaque connexion d'un joueur. `Locale("clé")` fonctionne ensuite côté client pour les NUI et notifications.

---

### 3.8 Versioning

**Fichier :** `Core/Versioning/versioning.lua`

Tous les modules s'enregistrent auprès du système de versioning au démarrage. Le Core vérifie la compatibilité avant d'autoriser le chargement.

**Règle SemVer appliquée :**
- `MAJOR` différent → incompatible (breaking change)
- `MINOR` ou `PATCH` trop anciens → refus de chargement
- En mode `debug = true` → avertissement seulement, le chargement est autorisé

```lua
-- Dans le main.lua d'un module
Framework.RegisterModule({
    name = "lumiris-inventory",
    label = "Inventaire lumiris",
    version = "1.0.0",
    author = "Lumiris Team",
    min_core_version = "0.1.0",
})

-- Vérifier si un module optionnel est présent
if Framework.IsModuleLoaded("lumiris-phone") then
    -- activer les fonctionnalités liées au téléphone
end

-- Récupérer la version d'un module chargé
local v = Framework.GetModuleVersion("lumiris-inventory")  -- "1.0.0"

-- Comparer deux versions
local cmp = Framework.Versioning.Compare("1.2.0", "1.1.0")  -- 1
```

---

### 3.9 Permissions

**Fichier :** `Core/Permissions/permissions.lua`

Deux niveaux de contrôle d'accès :

**Grades hiérarchiques** (du plus bas au plus haut) :

| Grade | Poids | Description |
|---|---|---|
| `user` | 1 | Joueur standard |
| `staff` | 2 | Modérateur / admin |
| `developer` | 3 | Développeur (accès total aux permissions granulaires) |
| `console` | 4 | Console serveur (bypass total) |

**Permissions granulaires** : tableau de strings personnalisables (ex: `"ban.players"`, `"kick.players"`) stocké en BDD par joueur. Les grades `developer` et `console` les possèdent toutes implicitement.

Les permissions sont **mises en cache 600 secondes** et invalidées à chaque modification.

```lua
-- Sur l'objet Player
player:GetGrade()                    -- "user" | "staff" | "developer" | "console"
player:HasGrade("staff")             -- boolean (vérifie la hiérarchie)
player:HasPermission("ban.players")  -- boolean

-- API directe
Framework.Permissions.SetGrade(playerId, "staff", adminLicense)
Framework.Permissions.AddPermission(playerId, "kick.players")
Framework.Permissions.RemovePermission(playerId, "kick.players")
Framework.Permissions.IsSuperAdmin(license)  -- boolean (liste dans Config)
```

---

### 3.10 Players & Sessions

**Fichiers :** `Core/Players/player_class.lua`, `Core/Players/players.lua`, `Core/Players/sessions.lua`, `Core/Players/players_client.lua`

**Cycle de vie d'un joueur :**

```
Client connecte
    │
    ▼
lumiris:player:connecting — (vérifications, deferrals)
    │
    ▼
Client envoie "lumiris:player:clientReady" (côté client, onClientGameTypeStart)
    │
    ▼
Serveur : getOrCreatePlayerRow() — BDD lumiris_players
    │
    ▼
Vérification ban → kick si banni
    │
    ▼
Vérification double login → kick si Config.allowMultipleLogins = false
    │
    ▼
Chargement personnage actif (slot 1 par défaut)
    │
    ▼
Création des comptes par défaut si nouveau personnage
    │
    ▼
Chargement des permissions (cache ou BDD)
    │
    ▼
CreatePlayer() → objet Player enregistré dans le registre
    │
    ▼
TriggerEvent("lumiris:player:loaded", source, player)
TriggerEvent("lumiris:character:loaded", source, player, character)
    │
    ▼
Module Spawn (Phase 2+) prend le relais
```

**Sessions :** la durée de jeu est calculée à la déconnexion (`Utils.Now() - startTime`) et ajoutée à `lumiris_players.playtime`. L'auto-save sauvegarde tous les joueurs toutes les `Config.Players.autoSaveInterval` secondes.

**Registre :**
```lua
local player = Framework.GetPlayer(source)          -- par source FiveM
local players = Framework.GetPlayers()              -- tous les joueurs
local player = Framework.GetPlayerByCharId(charId)  -- par ID personnage
Framework.Players.GetByLicense(license)
Framework.Players.Count()
```

**Objet Player — méthodes complètes :**

```lua
-- Identité
player:GetSource()          -- number (source FiveM)
player:GetLicense()         -- string (ex: "license:abc123")
player:GetName()            -- string (nom Steam/FiveM)
player:GetPlayerId()        -- number (ID BDD lumiris_players)
player:GetCharacter()       -- CharacterData | nil

-- Métadonnées joueur (persistées en BDD)
player:GetMetadata("cid")
player:SetMetadata("cid", 12345)

-- Métadonnées personnage (persistées en BDD)
player:GetCharacterMetadata("injured")
player:SetCharacterMetadata("injured", true)

-- Argent
player:GetMoney("cash")           -- number
player:AddMoney("cash", 500)      -- boolean
player:RemoveMoney("bank", 200)   -- boolean (vérifie le solde)
player:SetMoney("dirty", 0)       -- boolean

-- Inventaire (délégué à l'Inventory API → module Inventaire Phase 3)
player:AddItem("water", 2, {})    -- boolean
player:RemoveItem("water", 1)     -- boolean
player:GetItem("water")           -- { name, qty, metadata } | nil
player:HasItem("water", 1)        -- boolean

-- Job
player:GetJob()                   -- { name, label, grade, gradeLabel }
player:SetJob("police", "inspector")

-- Notifications
player:Notify("Message", "success", 4000)
-- type : "success" | "error" | "info" | "warning"

-- Permissions
player:GetGrade()                 -- string
player:HasGrade("staff")          -- boolean
player:HasPermission("ban.all")   -- boolean

-- Sauvegarde
player:Save()                     -- sauvegarde complète (position + playtime + metadata)
player:SavePosition()             -- sauvegarde uniquement la position
```

---

### 3.11 Accounts

**Fichier :** `Core/Accounts/accounts.lua`

Les opérations de base (AddMoney, RemoveMoney…) sont accessibles via l'objet Player. Ce module expose les opérations **avancées** nécessitant d'accéder à des personnages sans objet Player chargé.

Les transferts sont exécutés en **transaction atomique** : si l'une des deux mises à jour échoue, les deux sont annulées.

```lua
-- Transfert atomique entre deux personnages
local success, reason = Framework.Accounts.Transfer(fromCharId, toCharId, "bank", 500)
-- reason : nil | "insufficient_funds" | "account_not_found" | "transaction_failed"

-- Solde sans objet Player
local balance = Framework.Accounts.GetBalance(charId, "cash")

-- Création à la demande d'un compte pour un personnage
Framework.Accounts.EnsureAccount(charId, "dirty", "Argent sale", 0)
```

**Types de comptes par défaut :**

| Type | Description |
|---|---|
| `cash` | Argent liquide sur le personnage |
| `bank` | Compte bancaire |
| `dirty` | Argent illégal non blanchi |

---

### 3.12 Vehicle API

**Fichiers :** `Core/Vehicle_API/vehicle_api.lua` (serveur) + `Core/Vehicle_API/vehicle_api_client.lua` (client)

Le Core gère uniquement les **données** des véhicules immatriculés. La logique métier (garages, achats…) appartient aux modules de Phase 3.

**Serveur — données BDD :**
```lua
-- Récupérer les données d'un véhicule (avec cache 300s)
local data = Framework.GetVehicleData("ABC123")
-- { plate, model, char_id, metadata, stored, created_at }

-- Transférer la propriété
Framework.SetVehicleOwner("ABC123", charId, source)

-- CRUD
Framework.VehicleAPI.RegisterVehicle("ABC123", "adder", charId, {})
Framework.VehicleAPI.DeleteVehicle("ABC123", source)
Framework.VehicleAPI.SetVehicleMetadata("ABC123", { mileage = 1500 })
Framework.VehicleAPI.SetStored("ABC123", true)  -- rangé en garage

-- Véhicules d'un personnage
local vehicles = Framework.VehicleAPI.GetCharacterVehicles(charId)

-- Génération de plaque unique (3 lettres + 3 chiffres)
local plate = Framework.VehicleAPI.GeneratePlate()
```

**Fausses plaques :**

Une fausse plaque remplace **temporairement** la plaque du véhicule : `lumiris_vehicles.plate` porte la fausse plaque le temps de la pose et la vraie plaque est conservée dans la table dédiée `lumiris_vehicle_fake_plates`. La présence d'une ligne dans cette table = « une fausse plaque est posée ». Une seule fausse plaque active par véhicule.

- Pose et retrait sont **atomiques** (`Database.Transaction` : insert/delete + update de la plaque)
- La fausse plaque doit être libre dans `lumiris_vehicles` **et** dans `lumiris_vehicle_fake_plates`
- `expires_at` permet une pose temporaire ; une boucle serveur (30s) restaure automatiquement les plaques expirées
- `GetVehicleData()` accepte la vraie comme la fausse plaque et retourne en plus `real_plate` et `has_fake_plate`

```lua
-- Poser une fausse plaque (nil = plaque générée, 1800 = durée en secondes, nil = permanent)
local fake = Framework.ApplyFakePlate("ABC123", nil, charId, 1800, source)

-- Retirer la fausse plaque et restaurer la vraie (accepte les deux plaques)
Framework.RemoveFakePlate(fake, source)  -- retourne "ABC123"

-- Lecture
Framework.GetRealPlate("XYZ789")                        -- "ABC123" si XYZ789 est une fausse plaque
Framework.VehicleAPI.GetDisplayedPlate("ABC123")        -- "XYZ789" (plaque posée actuellement)
Framework.VehicleAPI.HasFakePlate("ABC123")             -- true
Framework.VehicleAPI.IsFakePlate("XYZ789")              -- true
Framework.VehicleAPI.GetFakePlateData("ABC123")         -- { real_plate, fake_plate, char_id, applied_at, expires_at }
Framework.VehicleAPI.GenerateFakePlate()                -- plaque libre
Framework.VehicleAPI.CleanupExpiredFakePlates()         -- number (restaurées)
```

**Client — spawn physique :**
```lua
-- Spawn (asynchrone, avec chargement du modèle et timeout)
Framework.SpawnVehicle("adder", { x=0, y=0, z=30 }, 0.0, function(entity)
    if entity then
        -- véhicule créé
    end
end)

-- Suppression propre
Framework.DeleteVehicle(entity)

-- PNJ
local ped = Framework.CreateNPC("s_m_y_cop_01", coords, 90.0, true)
Framework.DeleteNPC(ped)

-- Blips
local blipId = Framework.CreateBlip({
    label = "Garage", coords = { x=0, y=0, z=30 },
    sprite = 357, color = 3, scale = 0.8, short_range = true
})
Framework.RemoveBlip(blipId)
```

---

### 3.13 Inventory API

**Fichier :** `Core/Inventory_API/inventory_api.lua`

Le Core **ne gère pas l'inventaire**. Il expose un pont contractuel que le module Inventaire (Phase 3) implémente via le pattern Provider. Les modules qui appellent l'API avant que le provider soit enregistré sont mis en **file d'attente automatiquement** et exécutés dès que le provider arrive.

```lua
-- Le module Inventaire (Phase 3) s'enregistre au démarrage :
Framework.SetInventoryProvider({
    AddItem      = function(ownerId, ownerType, item, qty, metadata, cb) ... end,
    RemoveItem   = function(ownerId, ownerType, item, qty, cb) ... end,
    GetItem      = function(ownerId, ownerType, item, cb) ... end,
    HasItem      = function(ownerId, ownerType, item, qty, cb) ... end,
    GetInventory = function(ownerId, ownerType, cb) ... end,
    ClearInventory = function(ownerId, ownerType, cb) ... end,
    RegisterUseable = function(itemName, handler) ... end,
})

-- N'importe quel autre module peut appeler l'API dès maintenant
-- (mis en attente automatiquement si le provider n'est pas encore prêt)
Framework.InventoryAPI.AddItem(charId, "character", "water", 2, {}, function(success)
    if success then player:Notify(Locale("inventory.add_success", "Eau", 2)) end
end)

Framework.InventoryAPI.HasItem(charId, "character", "weapon_pistol", 1, function(has)
    if has then ... end
end)

-- Rendre un item utilisable (appelé par les modules métier)
Framework.InventoryAPI.RegisterUseable("sandwich", function(source, metadata)
    local player = Framework.GetPlayer(source)
    -- effet de l'item
end)
```

---

## 4. Schéma base de données

Toutes les tables sont créées automatiquement via le système de migrations au premier démarrage.

### Tables créées par le Core

#### `lumiris_players`
```sql
CREATE TABLE IF NOT EXISTS `lumiris_players` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `license` VARCHAR(60) NOT NULL, -- Identifiant principal FiveM
    `name` VARCHAR(100) NOT NULL,
    `metadata` LONGTEXT DEFAULT '{}', -- Données libres (JSON)
    `last_seen` BIGINT NOT NULL, -- Unix ms
    `first_joined` BIGINT NOT NULL, -- Unix ms
    `playtime` INT UNSIGNED DEFAULT 0, -- Cumulé en secondes
    `is_banned` TINYINT(1) DEFAULT 0,
    `ban_reason` TEXT DEFAULT NULL,
    `ban_expires` BIGINT DEFAULT NULL, -- Unix ms, NULL = permanent
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_license` (`license`),
    INDEX `idx_last_seen` (`last_seen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `lumiris_characters`
```sql
CREATE TABLE IF NOT EXISTS `lumiris_characters` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `slot` TINYINT NOT NULL DEFAULT 1, -- Slot multi-character (1-3)
    `firstname` VARCHAR(50) NOT NULL,
    `lastname` VARCHAR(50) NOT NULL,
    `dob` DATE NOT NULL,
    `gender` TINYINT(1) NOT NULL, -- 0=H, 1=F
    `nationality` VARCHAR(50) DEFAULT NULL,
    `appearance` LONGTEXT DEFAULT '{}', -- Customisation ped (JSON)
    `metadata` LONGTEXT DEFAULT '{}', -- Données libres (JSON)
    `last_position` LONGTEXT DEFAULT '{}', -- { x, y, z, heading }
    `is_dead` TINYINT(1) DEFAULT 0,
    `created_at` BIGINT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_slot` (`player_id`, `slot`),
    CONSTRAINT `fk_char_player`
        FOREIGN KEY (`player_id`) REFERENCES `lumiris_players`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `lumiris_accounts`
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
    CONSTRAINT `fk_acc_char`
        FOREIGN KEY (`character_id`) REFERENCES `lumiris_characters`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `lumiris_permissions`
```sql
CREATE TABLE IF NOT EXISTS `lumiris_permissions` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `player_id` INT UNSIGNED NOT NULL,
    `grade` VARCHAR(30) NOT NULL DEFAULT 'user',  -- user | staff | developer | console
    `custom_perms` LONGTEXT DEFAULT '[]', -- Permissions granulaires (JSON)
    `granted_by` VARCHAR(60) DEFAULT NULL,
    `granted_at` BIGINT DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_player_perm` (`player_id`),
    CONSTRAINT `fk_perm_player`
        FOREIGN KEY (`player_id`) REFERENCES `lumiris_players`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `lumiris_logs`
```sql
CREATE TABLE IF NOT EXISTS `lumiris_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `level` ENUM('info','warn','error','debug') NOT NULL DEFAULT 'info',
    `source` VARCHAR(60) NOT NULL, -- Nom du module source
    `action` VARCHAR(100) NOT NULL, -- Identifiant de l'action
    `player_id` INT UNSIGNED DEFAULT NULL,
    `details` LONGTEXT DEFAULT NULL, -- Contexte JSON
    `created_at` BIGINT NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_source` (`source`),
    INDEX `idx_player` (`player_id`),
    INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `lumiris_migrations`
```sql
CREATE TABLE IF NOT EXISTS `lumiris_migrations` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `module` VARCHAR(60) NOT NULL,
    `version` VARCHAR(20) NOT NULL,
    `filename` VARCHAR(120) NOT NULL,
    `applied_at` BIGINT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_migration` (`module`, `filename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `lumiris_vehicles`
```sql
CREATE TABLE IF NOT EXISTS `lumiris_vehicles` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `plate` VARCHAR(8) NOT NULL, -- Normalisée en majuscules
    `model` VARCHAR(60) NOT NULL,
    `char_id` INT UNSIGNED NOT NULL,
    `metadata` LONGTEXT DEFAULT '{}', -- Données libres (kilométrage, couleur…)
    `stored` TINYINT(1) DEFAULT 1, -- 1 = rangé en garage
    `created_at` BIGINT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_plate` (`plate`),
    INDEX `idx_char` (`char_id`),
    CONSTRAINT `fk_veh_char`
        FOREIGN KEY (`char_id`) REFERENCES `lumiris_characters`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `lumiris_vehicle_fake_plates`
```sql
CREATE TABLE IF NOT EXISTS `lumiris_vehicle_fake_plates` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `real_plate` VARCHAR(8) NOT NULL, -- Vraie plaque conservée pendant la pose
    `fake_plate` VARCHAR(8) NOT NULL, -- Plaque posée sur le véhicule
    `char_id` INT UNSIGNED DEFAULT NULL, -- Personnage ayant posé la plaque
    `applied_at` BIGINT NOT NULL,
    `expires_at` BIGINT DEFAULT NULL, -- NULL = permanent
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_real_plate` (`real_plate`), -- Une seule fausse plaque par véhicule
    UNIQUE KEY `uq_fake_plate` (`fake_plate`),
    INDEX `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 5. API publique complète

Surface contractuelle stable. Aucun breaking change entre deux versions mineures.

### Joueurs

```lua
Framework.GetPlayer(source)                 -- Player | nil
Framework.GetPlayers()                      -- Player[]
Framework.GetPlayerByCharId(charId)         -- Player | nil
Framework.Players.GetByLicense(license)     -- Player | nil
Framework.Players.Count()                   -- number
```

### Objet Player

```lua
-- Identité
player:GetSource()                          -- number
player:GetLicense()                         -- string
player:GetName()                            -- string
player:GetPlayerId()                        -- number
player:GetCharacter()                       -- CharacterData | nil

-- Métadonnées
player:GetMetadata(key)                     -- any
player:SetMetadata(key, value)
player:GetCharacterMetadata(key)            -- any
player:SetCharacterMetadata(key, value)

-- Argent
player:GetMoney(account)                    -- number
player:AddMoney(account, amount)            -- boolean
player:RemoveMoney(account, amount)         -- boolean
player:SetMoney(account, amount)            -- boolean

-- Inventaire
player:AddItem(item, qty, metadata)         -- boolean
player:RemoveItem(item, qty)                -- boolean
player:GetItem(item)                        -- { name, qty, metadata } | nil
player:HasItem(item, qty)                   -- boolean

-- Job
player:GetJob()                             -- JobData | nil
player:SetJob(job, grade)

-- Notifications
player:Notify(message, type, duration)
-- type : "success" | "error" | "info" | "warning"

-- Permissions
player:GetGrade()                           -- string
player:HasGrade(grade)                      -- boolean
player:HasPermission(perm)                  -- boolean

-- Sauvegarde
player:Save()
player:SavePosition()
```

### Base de données

```lua
Database.Query(sql, params)                 -- table (rows)
Database.Insert(sql, params)                -- number (insertId)
Database.Update(sql, params)                -- number (affectedRows)
Database.Delete(sql, params)                -- number (affectedRows)
Database.Transaction(callback)              -- boolean
Database.RunMigrations(moduleName, list)
```

### Cache

```lua
Cache.Set(key, value, ttl)
Cache.Get(key)                              -- any | nil
Cache.Delete(key)
Cache.DeleteByPrefix(prefix)
Cache.Has(key)                              -- boolean
Cache.Size()                                -- number
Cache.Flush()
```

### Events

```lua
-- Serveur
Framework.EmitEvent(eventName, ...)
Framework.EmitClient(source, eventName, ...)
Framework.EmitAllClients(eventName, ...)
Framework.EmitClients(sources, eventName, ...)
Framework.OnEvent(eventName, handler)
Framework.OnNetEvent(eventName, handler)    -- source validée automatiquement

-- Client
Framework.EmitServer(eventName, ...)
Framework.OnClientEvent(eventName, handler)
Framework.OnNetEvent(eventName, handler)
```

### Callbacks

```lua
-- Serveur
Framework.RegisterCallback(name, function(source, cb, data) ... end)

-- Client
Framework.TriggerCallback(name, function(result) ... end, data)
-- Timeout automatique 15s, callback appelé avec nil
```

### Locales

```lua
-- Partout (serveur et client)
Locale("clé")                               -- string
Locale("clé", arg1, arg2)                   -- string formatée

-- Serveur uniquement
Framework.Locales.LoadModule(moduleName)
Framework.Locales.SetLocale(lang)
Framework.Locales.GetLocale()               -- string
Framework.Locales.Register(lang, entries)
```

### Logger

```lua
Logger.Info(source, action, details, playerId)
Logger.Warn(source, action, details, playerId)
Logger.Error(source, action, details, playerId)
Logger.Debug(source, action, details)        -- Ignoré si debug = false
```

### Permissions

```lua
Framework.Permissions.Load(playerId)
Framework.Permissions.SetGrade(playerId, grade, grantedBy)
Framework.Permissions.HasGrade(playerId, grade)         -- boolean
Framework.Permissions.HasPermission(playerId, perm)     -- boolean
Framework.Permissions.AddPermission(playerId, perm)
Framework.Permissions.RemovePermission(playerId, perm)
Framework.Permissions.IsSuperAdmin(license)             -- boolean
Framework.Permissions.Invalidate(playerId)
```

### Versioning

```lua
Framework.RegisterModule(manifest)                      -- boolean
Framework.IsModuleLoaded(moduleName)                    -- boolean
Framework.GetModuleVersion(moduleName)                  -- string | nil
Framework.Versioning.Compare(a, b)                      -- -1 | 0 | 1
Framework.Versioning.IsCompatible(version, minVersion)  -- boolean, reason
Framework.Versioning.GetAllModules()                    -- table[]
Framework.Versioning.PrintStatus()
```

### Accounts

```lua
Framework.Accounts.Transfer(fromCharId, toCharId, account, amount)
-- → boolean, reason | nil

Framework.Accounts.GetBalance(charId, account)          -- number
Framework.Accounts.EnsureAccount(charId, type, label, startAmount)
```

### Vehicle API

```lua
-- Serveur
Framework.GetVehicleData(plate)                         -- table | nil
Framework.SetVehicleOwner(plate, charId, source)        -- boolean
Framework.VehicleAPI.RegisterVehicle(plate, model, charId, metadata)
Framework.VehicleAPI.DeleteVehicle(plate, source)       -- boolean
Framework.VehicleAPI.SetVehicleMetadata(plate, metadata) -- boolean
Framework.VehicleAPI.SetStored(plate, stored)           -- boolean
Framework.VehicleAPI.GetCharacterVehicles(charId)       -- table[]
Framework.VehicleAPI.GeneratePlate()                    -- string

-- Fausses plaques
Framework.ApplyFakePlate(plate, fakePlate, charId, duration, source) -- string | nil
Framework.RemoveFakePlate(plate, source)                -- string | nil
Framework.GetRealPlate(plate)                           -- string | nil
Framework.VehicleAPI.GetDisplayedPlate(plate)           -- string | nil
Framework.VehicleAPI.GetFakePlateData(plate)            -- table | nil
Framework.VehicleAPI.HasFakePlate(plate)                -- boolean
Framework.VehicleAPI.IsFakePlate(plate)                 -- boolean
Framework.VehicleAPI.GenerateFakePlate()                -- string | nil
Framework.VehicleAPI.CleanupExpiredFakePlates()         -- number

-- Client
Framework.SpawnVehicle(model, coords, heading, cb)
Framework.DeleteVehicle(entity)
Framework.CreateNPC(model, coords, heading, freeze)     -- entity | nil
Framework.DeleteNPC(entity)
Framework.CreateBlip(data)                              -- blipId
Framework.RemoveBlip(blipId)
```

### Inventory API

```lua
Framework.SetInventoryProvider(impl)                    -- boolean
Framework.InventoryAPI.HasProvider()                    -- boolean
Framework.InventoryAPI.AddItem(ownerId, ownerType, item, qty, metadata, cb)
Framework.InventoryAPI.RemoveItem(ownerId, ownerType, item, qty, cb)
Framework.InventoryAPI.GetItem(ownerId, ownerType, item, cb)
Framework.InventoryAPI.HasItem(ownerId, ownerType, item, qty, cb)
Framework.InventoryAPI.GetInventory(ownerId, ownerType, cb)
Framework.InventoryAPI.ClearInventory(ownerId, ownerType, cb)
Framework.InventoryAPI.RegisterUseable(itemName, handler)
```

---

## 6. Événements Core

Ces événements sont émis par le Core. Les modules s'y abonnent via `Framework.OnEvent()`.

| Événement | Côté | Paramètres | Description |
|---|---|---|---|
| `lumiris:core:ready` | Serveur | — | Framework entièrement initialisé, modules peuvent se charger |
| `lumiris:player:connecting` | Serveur | source, name, setKick, deferrals | Joueur en cours de connexion (avant chargement) |
| `lumiris:player:loaded` | Serveur | source, Player | Joueur chargé depuis la BDD |
| `lumiris:player:logout` | Serveur | source, Player | Joueur sur le point de se déconnecter |
| `lumiris:character:loaded` | Serveur | source, Player, CharData | Personnage actif chargé |
| `lumiris:character:logout` | Serveur | source, Player, CharData | Personnage déchargé |
| `lumiris:character:ready` | Client | CharData | Personnage local reçu et prêt |
| `lumiris:character:unloaded` | Client | — | Personnage local déchargé |
| `lumiris:accounts:changed` | Serveur | source, account, newBalance | Solde modifié |
| `lumiris:accounts:transfer` | Serveur | fromCharId, toCharId, account, amount | Transfert effectué |
| `lumiris:job:changed` | Serveur | source, job, grade | Job modifié sur un personnage |
| `lumiris:vehicle:registered` | Serveur | plate, model, charId | Véhicule immatriculé |
| `lumiris:vehicle:deleted` | Serveur | plate | Véhicule supprimé de la BDD |
| `lumiris:vehicle:ownerChanged` | Serveur | plate, charId | Propriétaire transféré |
| `lumiris:vehicle:storedChanged` | Serveur | plate, stored | Statut garage modifié |
| `lumiris:vehicle:fakePlateApplied` | Serveur | realPlate, fakePlate, charId | Fausse plaque posée |
| `lumiris:vehicle:fakePlateRemoved` | Serveur | realPlate, fakePlate | Fausse plaque retirée |
| `lumiris:inventory:providerReady` | Serveur | — | Module Inventaire enregistré et prêt |
| `lumiris:module:registered` | Serveur | moduleName, moduleData | Module enregistré dans le Versioning |
| `lumiris:locales:sync` | Client | lang, strings | Chaînes de locale envoyées au client |

---

## 7. Commandes console

Accessible uniquement depuis la console serveur (`source == 0`).

```
lumiris status        → Version, joueurs connectés, taille du cache
lumiris flush-cache   → Vide entièrement le cache mémoire
lumiris save-all      → Force la sauvegarde de tous les joueurs connectés
lumiris-modules       → Liste tous les modules enregistrés avec leur version
```

---

## Checklist Phase 1 — Livrables

- [x] `fxmanifest.lua` — déclaration complète avec ordre de chargement documenté
- [x] `Core/Shared/types.lua` — types, constantes et classes partagées
- [x] `Core/Shared/utils.lua` — utilitaires (JSON, deep copy, validation, timestamp)
- [x] `Core/Config/config.lua` — configuration centralisée par domaine
- [x] `Core/Logger/logger.lua` — 4 niveaux, console + BDD async
- [x] `Core/Database/database.lua` — ORM + migrations + détection requêtes lentes
- [x] `Core/Cache/cache.lua` — cache TTL + nettoyage automatique
- [x] `Core/Events/events.lua` + `events_client.lua` — wrapper events FiveM
- [x] `Core/Callbacks/callbacks.lua` + `callbacks_client.lua` — système req/resp + timeout
- [x] `Core/Locales/locales.lua` + `locales_client.lua` — i18n complet, sync client
- [x] `Core/Locales/data/fr.lua` + `Core/Locales/data/en.lua` — chaînes Core (joueurs, comptes, véhicules, inventaire)
- [x] `Core/Versioning/versioning.lua` — SemVer, registre, vérification compatibilité
- [x] `Core/Permissions/permissions.lua` — grades + permissions granulaires + cache
- [x] `Core/Players/player_class.lua` — classe Player avec API publique complète
- [x] `Core/Players/players.lua` — registre, connexion, ban, double login
- [x] `Core/Players/sessions.lua` — durée de session, playtime, auto-save
- [x] `Core/Players/players_client.lua` — signal clientReady, données locales
- [x] `Core/Accounts/accounts.lua` — transferts atomiques, helpers inter-personnages
- [x] `Core/Vehicle_API/vehicle_api.lua` — données BDD véhicules, propriété, plaque, fausses plaques
- [x] `Core/Vehicle_API/vehicle_api_client.lua` — spawn, suppression, NPC, blips
- [x] `Core/Inventory_API/inventory_api.lua` — pont contractuel + provider pattern
- [x] `Core/main.lua` — migrations SQL + signal Core:ready + commandes console
- [x] 7 tables SQL créées automatiquement au premier démarrage
- [x] Compatibilité dépendance : FXServer ≥ 7290, OneSync activé, oxmysql

---

*Document Lumiris-System — Phase 1 /*  
*Prochaine étape : Phase 2 — UI Système (v0.2)*