import { useState } from "react";
import { useRoadmap } from "./hooks/useRoadmap.js";
import AuroraBeam from "./components/AuroraBeam.jsx";
import NavItem from "./components/NavItem.jsx";
import OverviewView from "./views/OverviewView.jsx";
import RoadmapView from "./views/RoadmapView.jsx";
import ArchitectureView from "./views/ArchitectureView.jsx";
import PhilosophyView from "./views/PhilosophyView.jsx";
import DocsView from "./views/DocsView.jsx";

// ─── APP ──────────────────────────────────────────────────────────────────────
// Point d'entrée principal. Gère la navigation et le layout global.

const NAV = [
  { id: "overview", icon: "◈", label: "Vue d'ensemble" },
  { id: "roadmap", icon: "⟡", label: "Roadmap" },
  { id: "architecture", icon: "⬡", label: "Architecture" },
  { id: "philosophy", icon: "◎", label: "Philosophie & v2.0" },
  { id: "docs", icon: "◻", label: "Documents" },
];

const TITLES = {
  overview: "Vue d'ensemble",
  roadmap: "Roadmap interactive",
  architecture: "Architecture & API",
  philosophy: "Philosophie & Vision",
  docs: "Documents",
};

export default function App() {
  const [view, setView] = useState("overview");
  const roadmapApi = useRoadmap();

  return (
    <>
      {/* ── Styles globaux ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0B14; color: #E2E8F0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0A0B14; }
        ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 2px; }
        @keyframes aurora-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1;   transform: scale(1.05); }
        }
        input:focus, textarea:focus { border-color: #7B5CF0 !important; }
        input::placeholder, textarea::placeholder { color: #334155; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#0A0B14" }}>

        {/* ── Sidebar ── */}
        <aside
          style={{
            width: 220,
            flexShrink: 0,
            background: "#0D0F1A",
            borderRight: "1px solid #1E293B",
            display: "flex",
            flexDirection: "column",
            position: "sticky",
            top: 0,
            height: "100vh",
          }}
        >
          {/* Logo */}
          <div style={{ padding: "24px 20px 20px" }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 900,
                fontFamily: "Orbitron, monospace",
                letterSpacing: "0.15em",
                color: "#00E5CC",
              }}
            >
              LUMIRIS
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#475569",
                letterSpacing: "0.2em",
                fontFamily: "Inter, sans-serif",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              System — Dev Portal
            </div>
          </div>

          <div
            style={{
              width: "calc(100% - 40px)",
              margin: "0 20px 20px",
              height: 1,
              background: "#1E293B",
            }}
          />

          {/* Navigation */}
          <nav style={{ flex: 1, padding: "0 12px" }}>
            {NAV.map((item) => (
              <NavItem
                key={item.id}
                {...item}
                active={view === item.id}
                onClick={() => setView(item.id)}
              />
            ))}
          </nav>

          {/* Public cible */}
          <div style={{ padding: "20px", borderTop: "1px solid #1E293B" }}>
            <div
              style={{
                fontSize: 10,
                color: "#334155",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.6,
              }}
            >
              <div
                style={{
                  color: "#475569",
                  fontWeight: 600,
                  marginBottom: 4,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Public cible
              </div>
              Semi-RP · WL · Serious RP
              <br />
              Hébergeurs · Développeurs
            </div>
          </div>
        </aside>

        {/* ── Contenu principal ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {/* Header / Hero */}
          <header
            style={{
              position: "relative",
              padding: "48px 40px 36px",
              overflow: "hidden",
            }}
          >
            <AuroraBeam />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#475569",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontFamily: "Inter, sans-serif",
                  marginBottom: 10,
                }}
              >
                Cahier des charges — {TITLES[view]}
              </div>

              {view === "overview" && (
                <>
                  <h1
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      fontFamily: "Orbitron, monospace",
                      color: "#E2E8F0",
                      letterSpacing: "0.05em",
                      lineHeight: 1.1,
                      marginBottom: 12,
                    }}
                  >
                    LUMIRIS<span style={{ color: "#00E5CC" }}>-</span>System
                  </h1>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#64748B",
                      maxWidth: 520,
                      lineHeight: 1.7,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Framework FiveM modulaire de nouvelle génération. Core
                    ultra-léger, modules indépendants, API stable, performances
                    extrêmes.
                  </p>
                </>
              )}

              {view === "roadmap" && (
                <>
                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      fontFamily: "Orbitron, monospace",
                      color: "#E2E8F0",
                      letterSpacing: "0.05em",
                      marginBottom: 8,
                    }}
                  >
                    Roadmap <span style={{ color: "#7B5CF0" }}>Interactive</span>
                  </h1>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#64748B",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Modifiez le statut, les livrables et les détails de chaque
                    phase. Les changements sont sauvegardés automatiquement.
                  </p>
                </>
              )}

              {view === "architecture" && (
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    fontFamily: "Orbitron, monospace",
                    color: "#E2E8F0",
                    letterSpacing: "0.05em",
                  }}
                >
                  Architecture <span style={{ color: "#00E5CC" }}>&</span> API
                </h1>
              )}

              {view === "philosophy" && (
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    fontFamily: "Orbitron, monospace",
                    color: "#E2E8F0",
                    letterSpacing: "0.05em",
                  }}
                >
                  Philosophie <span style={{ color: "#F59E0B" }}>& Vision</span>
                </h1>
              )}

              {view === "docs" && (
                <>
                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      fontFamily: "Orbitron, monospace",
                      color: "#E2E8F0",
                      letterSpacing: "0.05em",
                      marginBottom: 8,
                    }}
                  >
                    Documents <span style={{ color: "#00E5CC" }}>& Specs</span>
                  </h1>
                  <p style={{ fontSize: 13, color: "#64748B", fontFamily: "Inter, sans-serif" }}>
                    Documents de spécification par phase. Déposez un <code style={{ color: "#00E5CC", fontSize: 11 }}>.md</code> dans{" "}
                    <code style={{ color: "#00E5CC", fontSize: 11 }}>public/docs/</code> et enregistrez-le dans{" "}
                    <code style={{ color: "#00E5CC", fontSize: 11 }}>src/data/docs.js</code>.
                  </p>
                </>
              )}
            </div>

            {/* Séparateur dégradé */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, #00E5CC30, #7B5CF030, transparent)",
              }}
            />
          </header>

          {/* Contenu de la vue */}
          <main
            style={{
              flex: 1,
              padding: view === "docs" ? "32px 40px 60px 40px" : "32px 40px 60px",
              maxWidth: view === "docs" ? "100%" : 1000,
            }}
          >
            {view === "overview" && <OverviewView />}
            {view === "roadmap" && <RoadmapView {...roadmapApi} />}
            {view === "architecture" && <ArchitectureView />}
            {view === "philosophy" && <PhilosophyView />}
            {view === "docs" && <DocsView />}
          </main>
        </div>
      </div>
    </>
  );
}