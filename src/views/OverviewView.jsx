// ─── OVERVIEW VIEW ────────────────────────────────────────────────────────────
// Page d'accueil : statistiques globales, liste des modules et perf targets.

const MODULES = [
  {
    cat: "Base",
    items: [
      "Notifications", "Menus", "Target", "TextUI",
      "ProgressBar", "Animation", "HUD", "Spawn", "Character Creator",
    ],
    color: "#00E5CC",
  },
  {
    cat: "Gameplay",
    items: [
      "Inventaire", "Coffres", "Shops", "Banque",
      "ATM", "Téléphone", "Radio", "GPS", "Dispatch",
    ],
    color: "#7B5CF0",
  },
  {
    cat: "Emplois",
    items: [
      "Police", "EMS", "Mécano", "Taxi",
      "Concessionnaire", "Immobilier", "Gouvernement", "Journaliste",
    ],
    color: "#3B82F6",
  },
  {
    cat: "Illegal",
    items: [
      "Drogues", "Armes", "Blanchiment", "Braquages",
      "Cambriolages", "Chop Shop", "Cartels", "Gangs",
    ],
    color: "#EF4444",
  },
  {
    cat: "Civil",
    items: [
      "Maisons", "Garages", "Appartements",
      "Banque", "Assurance", "Permis", "Cartes d'identité",
    ],
    color: "#F59E0B",
  },
  {
    cat: "Économie",
    items: ["Entreprises", "TVA", "Facturation", "Comptabilité", "Salaire", "Contrats"],
    color: "#10B981",
  },
];

const STATS = [
  { v: "11", l: "Phases", c: "#00E5CC" },
  { v: "40+", l: "Modules", c: "#7B5CF0" },
  { v: "6", l: "Catégories", c: "#F59E0B" },
  { v: "v1.0", l: "Objectif", c: "#10B981" },
];

const PERF = [
  ["Core", "0.00 – 0.02 ms"],
  ["Petit module", "0.00 ms"],
  ["Module moyen", "0.01 ms"],
  ["Gros module", "≤ 0.03 ms"],
];

export default function OverviewView() {
  return (
    <div>
      {/* Statistiques */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {STATS.map(({ v, l, c }) => (
          <div
            key={l}
            style={{
              background: "#111827",
              border: `1px solid ${c}30`,
              borderRadius: 12,
              padding: "20px 16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: c,
                fontFamily: "Orbitron, monospace",
              }}
            >
              {v}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#8B9BBE",
                marginTop: 4,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {l}
            </div>
          </div>
        ))}
      </div>

      {/* Modules */}
      <h2
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#8B9BBE",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 16,
          fontFamily: "Inter, sans-serif",
        }}
      >
        Modules prévus
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {MODULES.map(({ cat, items, color }) => (
          <div
            key={cat}
            style={{
              background: "#111827",
              border: `1px solid ${color}25`,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: color,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color,
                  fontFamily: "Orbitron, monospace",
                  letterSpacing: "0.08em",
                }}
              >
                {cat}
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {items.map((item) => (
                <span
                  key={item}
                  style={{
                    padding: "3px 9px",
                    borderRadius: 5,
                    background: color + "12",
                    border: `1px solid ${color}25`,
                    fontSize: 11,
                    color: "#94A3B8",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Performance */}
      <h2
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#8B9BBE",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 16,
          fontFamily: "Inter, sans-serif",
        }}
      >
        Objectifs de performance
      </h2>
      <div
        style={{
          background: "#111827",
          border: "1px solid #1E293B",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {PERF.map(([k, v], i) => (
          <div
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 20px",
              borderBottom: i < PERF.length - 1 ? "1px solid #1E293B" : "none",
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "#CBD5E1",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {k}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#00E5CC",
                fontFamily: "Orbitron, monospace",
              }}
            >
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
