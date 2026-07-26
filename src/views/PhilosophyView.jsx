// ─── PHILOSOPHY VIEW ─────────────────────────────────────────────────────────
// Les 4 principes fondamentaux du framework et la vision long terme v2.0.

const PRINCIPLES = [
  {
    n: "01",
    t: "Le Core est minimal",
    d: "Le Core ne contient que les fonctionnalités indispensables. Rien de superflu. Chaque ligne de code dans le Core doit justifier son existence.",
    c: "#00E5CC",
  },
  {
    n: "02",
    t: "Tout le reste est un module",
    d: "Chaque fonctionnalité, aussi importante soit-elle, est encapsulée dans un module indépendant. Inventaire, jobs, housing — tout.",
    c: "#7B5CF0",
  },
  {
    n: "03",
    t: "Le Framework ne dépend jamais d'un module",
    d: "Le Core peut fonctionner sans aucun module. Cette règle garantit la stabilité et permet de charger uniquement ce dont on a besoin.",
    c: "#F59E0B",
  },
  {
    n: "04",
    t: "Les modules dépendent du Framework",
    d: "Un module utilise l'API du Core. Jamais le contraire. Cette hiérarchie claire évite les dépendances circulaires et les bugs de chargement.",
    c: "#10B981",
  },
];

const V2_FEATURES = [
  ["🖱️", "Éditeur de configuration visuel", "Dashboard sans modifier de fichiers Lua"],
  ["🏗️", "Créateur de jobs sans code", "Glisser-déposer, formulaires, aucune ligne de code"],
  ["📦", "Gestionnaire de dépendances", "Résolution automatique des conflits entre modules"],
  ["🏪", "Marketplace communautaire", "Modules tiers publiés, vendus ou distribués gratuitement"],
  ["🎨", "Système de thèmes", "HUD, menus, notifications — installables en un clic"],
  ["⌨️", "Aurora CLI", "Créer, tester, publier et documenter depuis le terminal"],
  ["📘", "SDK TypeScript/Lua", "Autocomplétion et génération de documentation"],
  ["🌐", "Portail développeur", "Clés API, analytics, changelog, suivi des erreurs"],
  ["📡", "Télémetrie optionnelle", "Désactivable — détecte les problèmes après mise à jour"],
  ["🔒", "Compatibilité ascendante", "Semantic Versioning — zéro breaking change surprise"],
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

export default function PhilosophyView() {
  return (
    <div>
      {/* Principes fondamentaux */}
      {sectionTitle("Principes fondamentaux")}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 36,
        }}
      >
        {PRINCIPLES.map(({ n, t, d, c }) => (
          <div
            key={n}
            style={{
              background: "#111827",
              border: `1px solid ${c}30`,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: c + "40",
                fontFamily: "Orbitron, monospace",
                marginBottom: 8,
              }}
            >
              {n}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#E2E8F0",
                marginBottom: 8,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {t}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#64748B",
                lineHeight: 1.7,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {d}
            </div>
          </div>
        ))}
      </div>

      {/* Vision v2.0 */}
      {sectionTitle("Vision v2.0")}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 10,
        }}
      >
        {V2_FEATURES.map(([icon, title, desc]) => (
          <div
            key={title}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              background: "#111827",
              border: "1px solid #1E293B",
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
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
                {title}
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
        ))}
      </div>
    </div>
  );
}
