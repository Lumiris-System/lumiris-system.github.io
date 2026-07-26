# Lumiris-System — Dev Portal

Portail développeur du framework FiveM **Lumiris-System**.

## Structure du projet

```
src/
├── data/
│   └── roadmap.js          ← Données par défaut de la roadmap (source de vérité)
├── hooks/
│   └── useRoadmap.js       ← Hook React : état + persistance localStorage
├── constants/
│   └── status.js           ← Couleurs et labels des statuts de phase
├── components/
│   ├── AuroraBeam.jsx      ← Effet de lumière animé du header
│   ├── NavItem.jsx         ← Bouton de navigation sidebar
│   ├── StatusBadge.jsx     ← Badge coloré de statut
│   └── PhaseCard.jsx       ← Carte interactive d'une phase (édition, livrables...)
├── views/
│   ├── OverviewView.jsx    ← Vue d'ensemble : stats, modules, performance
│   ├── RoadmapView.jsx     ← Roadmap interactive avec progression globale
│   ├── ArchitectureView.jsx ← Core, API publique Lua, sécurité
│   └── PhilosophyView.jsx  ← Principes fondamentaux et vision v2.0
├── App.jsx                 ← Layout principal : sidebar + routing entre vues
└── main.jsx                ← Point d'entrée React
```

## Installation

```bash
npm install
npm run dev
```

## Modifier la roadmap

Les modifications faites via l'interface sont **sauvegardées automatiquement**
en `localStorage`. Elles persistent entre les sessions.

Pour modifier les **données par défaut** (celles affichées à la première visite
ou après un reset), éditez directement `src/data/roadmap.js`.

Le bouton **↺ Réinitialiser** dans la vue Roadmap recharge ces données par défaut.
