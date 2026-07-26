// ─── NAV ITEM ─────────────────────────────────────────────────────────────────
// Bouton de navigation de la sidebar.

export default function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 16px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        background: active ? "#7B5CF018" : "transparent",
        color: active ? "#00E5CC" : "#8B9BBE",
        fontSize: 13,
        fontFamily: "Inter, sans-serif",
        fontWeight: active ? 600 : 400,
        textAlign: "left",
        transition: "all 0.15s",
        borderLeft: active ? "2px solid #00E5CC" : "2px solid transparent",
      }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      {label}
    </button>
  );
}
