import { STATUS_CONFIG } from "../constants/status.js";

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
// Badge coloré affichant le statut d'une phase (Terminé, En cours, etc.)

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.planned;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        fontSize: 11,
        fontWeight: 600,
        color: cfg.border,
        fontFamily: "Inter, sans-serif",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: cfg.dot,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}
