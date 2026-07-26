import { useState } from "react";
import StatusBadge from "./StatusBadge.jsx";
import { STATUS_CONFIG } from "../constants/status.js";

// ─── PHASE CARD ───────────────────────────────────────────────────────────────
// Carte interactive pour chaque phase de la roadmap.
// Supporte : expand/collapse, édition inline, ajout/suppression de livrables,
// changement de statut, suppression de la phase.

export default function PhaseCard({
  phase,
  onUpdate,
  onAddDeliverable,
  onRemoveDeliverable,
  onDelete,
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newDeliv, setNewDeliv] = useState("");
  const [draft, setDraft] = useState({ ...phase });

  const saveEdit = () => {
    onUpdate(phase.id, draft);
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft({ ...phase });
    setEditing(false);
  };

  const handleAddDeliv = () => {
    if (newDeliv.trim()) {
      onAddDeliverable(phase.id, newDeliv.trim());
      setNewDeliv("");
    }
  };

  return (
    <div
      style={{
        background: "#111827",
        border: `1px solid ${expanded ? phase.color + "60" : "#1E293B"}`,
        borderRadius: 12,
        marginBottom: 12,
        overflow: "hidden",
        transition: "border-color 0.2s",
        boxShadow: expanded ? `0 0 20px ${phase.color}15` : "none",
      }}
    >
      {/* ── Header ── */}
      <div
        onClick={() => !editing && setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 20px",
          cursor: editing ? "default" : "pointer",
        }}
      >
        {/* Numéro */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            flexShrink: 0,
            background: phase.color + "20",
            border: `1px solid ${phase.color}50`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: phase.color,
            fontFamily: "Orbitron, monospace",
          }}
        >
          {phase.id < 10 ? `0${phase.id}` : phase.id}
        </div>

        {/* Titre + phase */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "#8B9BBE",
                fontFamily: "Orbitron, monospace",
                letterSpacing: "0.1em",
              }}
            >
              {phase.phase}
            </span>
            {phase.version && (
              <span
                style={{
                  fontSize: 10,
                  padding: "1px 7px",
                  borderRadius: 4,
                  background: phase.color + "20",
                  color: phase.color,
                  fontFamily: "monospace",
                  fontWeight: 700,
                }}
              >
                {phase.version}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#E2E8F0",
              marginTop: 2,
              fontFamily: "Inter, sans-serif",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {phase.title}
          </div>
        </div>

        {/* Méta + badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "#8B9BBE",
              fontFamily: "Inter, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            ⏱ {phase.duration}
          </span>
          <StatusBadge status={phase.status} />
          <span
            style={{
              color: "#8B9BBE",
              fontSize: 16,
              transform: expanded ? "rotate(90deg)" : "none",
              transition: "transform 0.2s",
            }}
          >
            ›
          </span>
        </div>
      </div>

      {/* ── Contenu étendu ── */}
      {expanded && (
        <div
          style={{ padding: "0 20px 20px", borderTop: "1px solid #1E293B" }}
        >
          {!editing ? (
            // ── Mode lecture ──
            <>
              <p
                style={{
                  color: "#94A3B8",
                  fontSize: 13,
                  lineHeight: 1.6,
                  margin: "16px 0 20px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {phase.description}
              </p>

              {/* Livrables */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#8B9BBE",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Livrables
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {phase.deliverables.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: "#0F172A",
                        border: "1px solid #1E293B",
                        fontSize: 12,
                        color: "#CBD5E1",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      <span style={{ color: phase.color, fontSize: 10 }}>
                        ◆
                      </span>
                      {d}
                      <button
                        onClick={() => onRemoveDeliverable(phase.id, i)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#EF444460",
                          fontSize: 14,
                          padding: "0 0 0 2px",
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Ajouter un livrable */}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <input
                    value={newDeliv}
                    onChange={(e) => setNewDeliv(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddDeliv()}
                    placeholder="Ajouter un livrable…"
                    style={{
                      flex: 1,
                      padding: "7px 12px",
                      borderRadius: 6,
                      background: "#0F172A",
                      border: "1px solid #1E293B",
                      color: "#E2E8F0",
                      fontSize: 12,
                      fontFamily: "Inter, sans-serif",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={handleAddDeliv}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 6,
                      border: "none",
                      background: phase.color + "30",
                      color: phase.color,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    + Ajouter
                  </button>
                </div>
              </div>

              {/* Changement de statut */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {Object.keys(STATUS_CONFIG).map((s) => (
                  <button
                    key={s}
                    onClick={() => onUpdate(phase.id, { status: s })}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 6,
                      border: `1px solid ${
                        phase.status === s
                          ? STATUS_CONFIG[s].border
                          : "#1E293B"
                      }`,
                      background:
                        phase.status === s
                          ? STATUS_CONFIG[s].bg
                          : "transparent",
                      color:
                        phase.status === s
                          ? STATUS_CONFIG[s].border
                          : "#64748B",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "Inter, sans-serif",
                      textTransform: "uppercase",
                    }}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}

                {/* Actions droite */}
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <button
                    onClick={() => {
                      setDraft({ ...phase });
                      setEditing(true);
                    }}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 6,
                      border: "1px solid #3B82F640",
                      background: "#3B82F610",
                      color: "#3B82F6",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => onDelete(phase.id)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 6,
                      border: "1px solid #EF444440",
                      background: "#EF444410",
                      color: "#EF4444",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    🗑 Supprimer
                  </button>
                </div>
              </div>
            </>
          ) : (
            // ── Mode édition ──
            <div style={{ marginTop: 16 }}>
              {[
                ["Phase", "phase"],
                ["Titre", "title"],
                ["Version", "version"],
                ["Durée", "duration"],
                ["Couleur", "color"],
              ].map(([label, key]) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: "#8B9BBE",
                      marginBottom: 4,
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {label}
                  </label>
                  <input
                    type={key === "color" ? "color" : "text"}
                    value={draft[key] || ""}
                    onChange={(e) =>
                      setDraft({ ...draft, [key]: e.target.value })
                    }
                    style={{
                      width: key === "color" ? 60 : "100%",
                      padding: key === "color" ? "4px" : "8px 12px",
                      borderRadius: 6,
                      background: "#0F172A",
                      border: "1px solid #1E293B",
                      color: "#E2E8F0",
                      fontSize: 13,
                      fontFamily: "Inter, sans-serif",
                      outline: "none",
                      height: key === "color" ? 36 : "auto",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    color: "#8B9BBE",
                    marginBottom: 4,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Description
                </label>
                <textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: "#0F172A",
                    border: "1px solid #1E293B",
                    color: "#E2E8F0",
                    fontSize: 13,
                    fontFamily: "Inter, sans-serif",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={saveEdit}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 6,
                    border: "none",
                    background: "#00E5CC",
                    color: "#0A0B14",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  ✓ Sauvegarder
                </button>
                <button
                  onClick={cancelEdit}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 6,
                    border: "1px solid #1E293B",
                    background: "transparent",
                    color: "#8B9BBE",
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
