// ─── ARCHITECTURE VIEW ────────────────────────────────────────────────────────
// Présente les composants du Core, l'API publique Lua et les mesures de sécurité.

const CORE_ITEMS = [
  { icon: "👤", name: "Gestion Joueurs", desc: "Connexion, déconnexion, sessions, personnages" },
  { icon: "💰", name: "Comptes", desc: "Cash, banque, argent sale, comptes personnalisés" },
  { icon: "🎒", name: "Inventaire API", desc: "AddItem, RemoveItem, GetItem — sans le système" },
  { icon: "🚗", name: "Véhicules API", desc: "Création, suppression, stockage, récupération" },
  { icon: "⚡", name: "Events & Callbacks", desc: "Système d'événements client ↔ serveur" },
  { icon: "🗄️", name: "Base de données", desc: "ORM, migrations, cache" },
  { icon: "🛡️", name: "Permissions", desc: "Utilisateur, staff, développeur, console" },
  { icon: "📋", name: "Logger", desc: "Tous les modules passent par lui" },
  { icon: "⚙️", name: "Config", desc: "Configuration centralisée" },
  { icon: "🌍", name: "Localisation", desc: "Support multilingue" },
];

const API_GROUPS = [
  {
    cat: "Joueurs",
    color: "#00E5CC",
    methods: [
      "Framework.GetPlayer()",
      "Player:AddMoney()",
      "Player:SetJob()",
      "Player:SetMetadata()",
      "Player:AddItem()",
      "Player:Notify()",
    ],
  },
  {
    cat: "Monde",
    color: "#7B5CF0",
    methods: [
      "Framework.SpawnVehicle()",
      "Framework.DeleteVehicle()",
      "Framework.CreateNPC()",
      "Framework.CreateBlip()",
    ],
  },
  {
    cat: "UI",
    color: "#F59E0B",
    methods: ["Notify()", "Menu()", "Context()", "ProgressBar()", "TextUI()", "Input()", "Dialog()"],
  },
  {
    cat: "Database",
    color: "#10B981",
    methods: [
      "Database.Query()",
      "Database.Insert()",
      "Database.Update()",
      "Database.Delete()",
    ],
  },
];

const SECURITY = [
  "Validation serveur",
  "Anti exploit",
  "Permissions",
  "Rate Limit",
  "Logs",
  "Anti injection",
  "Anti duplication",
  "Anti Trigger",
];

const sectionTitle = (text) => (
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
    {text}
  </h2>
);

export default function ArchitectureView() {
  return (
    <div>
      {/* Core */}
      {sectionTitle("Core — Composants")}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {CORE_ITEMS.map(({ icon, name, desc }) => (
          <div
            key={name}
            style={{
              background: "#111827",
              border: "1px solid #1E293B",
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#E2E8F0",
                    marginBottom: 3,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748B",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {desc}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* API publique */}
      {sectionTitle("API Publique")}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {API_GROUPS.map(({ cat, color, methods }) => (
          <div
            key={cat}
            style={{
              background: "#111827",
              border: `1px solid ${color}25`,
              borderRadius: 10,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color,
                fontFamily: "Orbitron, monospace",
                letterSpacing: "0.08em",
                marginBottom: 12,
              }}
            >
              {cat}
            </div>
            {methods.map((m) => (
              <div
                key={m}
                style={{
                  padding: "5px 10px",
                  borderRadius: 5,
                  background: "#0F172A",
                  fontSize: 11,
                  color: "#94A3B8",
                  fontFamily: "monospace",
                  marginBottom: 5,
                }}
              >
                {m}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Sécurité */}
      {sectionTitle("Sécurité")}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {SECURITY.map((s) => (
          <span
            key={s}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              background: "#EF444412",
              border: "1px solid #EF444430",
              fontSize: 12,
              color: "#FCA5A5",
              fontFamily: "Inter, sans-serif",
            }}
          >
            🔒 {s}
          </span>
        ))}
      </div>
    </div>
  );
}
