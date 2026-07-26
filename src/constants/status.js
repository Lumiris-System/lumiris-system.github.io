// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
// Définit les couleurs, labels et styles de chaque statut de phase.

export const STATUS_CONFIG = {
  done: {
    label: "Terminé",
    bg: "#00E5CC22",
    border: "#00E5CC",
    dot: "#00E5CC",
  },
  "in-progress": {
    label: "En cours",
    bg: "#7B5CF022",
    border: "#7B5CF0",
    dot: "#7B5CF0",
  },
  planned: {
    label: "Planifié",
    bg: "#ffffff08",
    border: "#ffffff20",
    dot: "#ffffff40",
  },
  blocked: {
    label: "Bloqué",
    bg: "#EF444422",
    border: "#EF4444",
    dot: "#EF4444",
  },
};
