import PhaseCard from "../components/PhaseCard.jsx";

// ─── ROADMAP VIEW ─────────────────────────────────────────────────────────────
// Vue principale de la roadmap interactive.
// Affiche la progression globale et la liste des phases éditables.

export default function RoadmapView({
  roadmap,
  updatePhase,
  addDeliverable,
  removeDeliverable,
  addPhase,
  deletePhase,
  reset,
}) {
  const done = roadmap.filter((p) => p.status === "done").length;
  const inProgress = roadmap.filter((p) => p.status === "in-progress").length;
  const pct = Math.round((done / roadmap.length) * 100);

  return (
    <div>
      {/* Barre de progression globale */}
      <div
        style={{
          background: "#111827",
          border: "1px solid #1E293B",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "#8B9BBE",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Progression globale
          </span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#00E5CC",
              fontFamily: "Orbitron, monospace",
            }}
          >
            {pct}%
          </span>
        </div>

        {/* Barre */}
        <div
          style={{ height: 6, borderRadius: 3, background: "#1E293B" }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 3,
              width: `${pct}%`,
              background: "linear-gradient(90deg, #00E5CC, #7B5CF0)",
              transition: "width 0.4s",
            }}
          />
        </div>

        {/* Légende */}
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          {[
            { label: "Terminés", count: done, color: "#00E5CC" },
            { label: "En cours", count: inProgress, color: "#7B5CF0" },
            {
              label: "Planifiés",
              count: roadmap.length - done - inProgress,
              color: "#ffffff30",
            },
          ].map(({ label, count, color }) => (
            <span
              key={label}
              style={{
                fontSize: 12,
                color: "#8B9BBE",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <span style={{ color, fontWeight: 700 }}>{count}</span> {label}
            </span>
          ))}
        </div>
      </div>

      {/* Contrôles */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          onClick={addPhase}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #00E5CC40",
            background: "#00E5CC10",
            color: "#00E5CC",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "Inter, sans-serif",
          }}
        >
          + Nouvelle phase
        </button>
        <button
          onClick={reset}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #1E293B",
            background: "transparent",
            color: "#8B9BBE",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
          }}
        >
          ↺ Réinitialiser
        </button>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "#475569",
            fontFamily: "Inter, sans-serif",
          }}
        >
          💾 Sauvegarde automatique activée
        </span>
      </div>

      {/* Liste des phases */}
      {roadmap.map((phase) => (
        <PhaseCard
          key={phase.id}
          phase={phase}
          onUpdate={updatePhase}
          onAddDeliverable={addDeliverable}
          onRemoveDeliverable={removeDeliverable}
          onDelete={deletePhase}
        />
      ))}
    </div>
  );
}
