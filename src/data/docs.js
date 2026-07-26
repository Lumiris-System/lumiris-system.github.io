// ─── DOCS REGISTRY ────────────────────────────────────────────────────────────
// Ajoutez ici chaque document Markdown disponible dans public/docs/.
// Le visualiseur les chargera automatiquement.

const DOCS = [
  {
    id: "phase-0",
    label: "Phase 0 — Recherche & Architecture",
    file: "/docs/PHASE_0_RECHERCHE.md",
    phase: "Phase 0",
    version: null,
    status: "done",           // done | in-progress | planned
    color: "#00E5CC",
  },
  {
    id: "phase-1",
    label: "Phase 1 — Core",
    file: "/docs/PHASE_1_CORE.md",
    phase: "Phase 1",
    version: 0.1,
    status: "done",           // done | in-progress | planned
    color: "#00E5CC",
  },
  // Ajoutez les prochains documents ici, exemple :
  // {
  //   id: "phase-1",
  //   label: "Phase 1 — Core",
  //   file: "/docs/PHASE_1_CORE.md",
  //   phase: "Phase 1",
  //   version: "v0.1",
  //   status: "in-progress",
  //   color: "#7B5CF0",
  // },
];

export default DOCS;