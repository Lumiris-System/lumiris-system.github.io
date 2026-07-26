import { useState, useEffect, useRef } from "react";
import DOCS from "../data/docs.js";
import { parseMarkdown, extractHeadings } from "../utils/markdownParser.js";
import { STATUS_CONFIG } from "../constants/status.js";

// ─── DOCS VIEW ────────────────────────────────────────────────────────────────
// Visualiseur de documents Markdown.
// - Sélecteur de document à gauche
// - Table des matières cliquable
// - Rendu HTML du Markdown avec coloration syntaxique
// - Bouton de copie sur les blocs de code

export default function DocsView() {
  const [activeDocId, setActiveDocId] = useState(DOCS[0]?.id ?? null);
  const [markdown, setMarkdown] = useState("");
  const [headings, setHeadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeHeading, setActiveHeading] = useState(null);
  const contentRef = useRef(null);

  const activeDoc = DOCS.find((d) => d.id === activeDocId);

  // ── Chargement du fichier Markdown ──────────────────────────────────────────
  useEffect(() => {
    if (!activeDoc) return;
    setLoading(true);
    setError(null);

    fetch(activeDoc.file)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        setMarkdown(text);
        setHeadings(extractHeadings(text));
        setActiveHeading(null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [activeDocId]);

  // ── Injection des boutons Copier après rendu ─────────────────────────────────
  // ── Injection des boutons Copier et intercepteur de liens ──
  useEffect(() => {
    if (!contentRef.current || !markdown) return;

    // ... [Garde ton code existant pour les boutons copier (pres.forEach)] ...

    // NOUVEAU : Intercepter les clics sur les liens internes (#)
    const links = contentRef.current.querySelectorAll("a[href^='#']");
    
    links.forEach((link) => {
      // Sécurité pour éviter la double injection
      if (link.dataset.scrollBound) return;
      link.dataset.scrollBound = "true";

      link.onclick = (e) => {
        e.preventDefault(); // Empêche le comportement natif du navigateur
        const targetId = link.getAttribute("href").substring(1); // Retire le "#"
        scrollTo(targetId); // Utilise ta fonction scrollTo existante
      };
    });
    
  }, [markdown, loading]);

  // ── Scroll spy pour la TOC ───────────────────────────────────────────────────
  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-10% 0px -80% 0px", threshold: 0 }
    );

    const headingEls = contentRef.current.querySelectorAll("h1,h2,h3,h4,h5,h6");
    headingEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [markdown, loading]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const htmlContent = markdown ? parseMarkdown(markdown) : "";

  return (
    <div style={{ display: "flex", gap: 0, minHeight: "60vh" }}>

      {/* ── Panneau gauche : sélecteur de docs ─────────────────────────────── */}
      <div
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid #1E293B",
          paddingRight: 0,
          marginRight: 0,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#475569",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontFamily: "Inter, sans-serif",
            marginBottom: 12,
            paddingBottom: 10,
            borderBottom: "1px solid #1E293B",
          }}
        >
          Documents
        </div>

        {DOCS.map((doc) => {
          const cfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.planned;
          const isActive = doc.id === activeDocId;
          return (
            <button
              key={doc.id}
              onClick={() => setActiveDocId(doc.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                marginBottom: 4,
                borderRadius: 8,
                border: `1px solid ${isActive ? doc.color + "50" : "transparent"}`,
                background: isActive ? doc.color + "12" : "transparent",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: isActive ? doc.color : "#475569",
                  fontFamily: "Orbitron, monospace",
                  letterSpacing: "0.08em",
                  marginBottom: 3,
                }}
              >
                {doc.phase}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: isActive ? "#E2E8F0" : "#8B9BBE",
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1.4,
                  marginBottom: 6,
                }}
              >
                {doc.label.replace(/^Phase \d+ — /, "")}
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 7px",
                  borderRadius: 10,
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  fontSize: 9,
                  fontWeight: 700,
                  color: cfg.border,
                  fontFamily: "Inter, sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: cfg.dot,
                    display: "inline-block",
                  }}
                />
                {cfg.label}
              </span>
            </button>
          );
        })}

        {DOCS.length === 0 && (
          <div style={{ color: "#475569", fontSize: 12, fontFamily: "Inter, sans-serif", padding: "8px 0" }}>
            Aucun document disponible.
          </div>
        )}

        {/* Info ajout de doc */}
        <div
          style={{
            marginTop: 20,
            padding: "10px 12px",
            borderRadius: 8,
            background: "#0F172A",
            border: "1px solid #1E293B",
          }}
        >
          <div style={{ fontSize: 10, color: "#475569", fontFamily: "Inter, sans-serif", lineHeight: 1.6 }}>
            <span style={{ color: "#334155", fontWeight: 600 }}>Ajouter un doc :</span>
            <br />
            1. Déposez le <code style={{ color: "#00E5CC", fontSize: 9 }}>.md</code> dans{" "}
            <code style={{ color: "#00E5CC", fontSize: 9 }}>public/docs/</code>
            <br />
            2. Ajoutez une entrée dans{" "}
            <code style={{ color: "#00E5CC", fontSize: 9 }}>src/data/docs.js</code>
          </div>
        </div>
      </div>

      {/* ── Zone centrale : contenu Markdown ────────────────────────────────── */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          minWidth: 0,
          padding: "0 40px",
          overflowY: "auto",
        }}
      >
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#475569", fontFamily: "Inter, sans-serif", padding: "40px 0" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #1E293B", borderTopColor: "#00E5CC", animation: "spin 0.8s linear infinite" }} />
            Chargement du document…
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div style={{ padding: "20px", background: "#EF444410", border: "1px solid #EF444430", borderRadius: 8, color: "#FCA5A5", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
            ⚠️ Impossible de charger le document : {error}
            <br />
            <span style={{ fontSize: 11, color: "#EF444490", marginTop: 4, display: "block" }}>
              Vérifiez que le fichier existe dans <code>public/docs/</code>
            </span>
          </div>
        )}

        {!loading && !error && markdown && (
          <div
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            style={{ maxWidth: 760 }}
          />
        )}
      </div>

      {/* ── Panneau droit : table des matières ──────────────────────────────── */}
      {headings.length > 0 && !loading && (
        <div
          style={{
            width: 200,
            flexShrink: 0,
            borderLeft: "1px solid #1E293B",
            paddingLeft: 20,
            position: "sticky",
            top: 0,
            alignSelf: "flex-start",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#475569",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "Inter, sans-serif",
              marginBottom: 12,
              paddingBottom: 10,
              borderBottom: "1px solid #1E293B",
            }}
          >
            Sur cette page
          </div>

          {headings.map((h) => (
            <button
              key={h.id}
              onClick={() => scrollTo(h.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: `3px 0 3px ${(h.level - 1) * 10}px`,
                fontSize: h.level <= 2 ? 12 : 11,
                fontWeight: activeHeading === h.id ? 600 : 400,
                color: activeHeading === h.id ? "#00E5CC" : h.level <= 2 ? "#64748B" : "#475569",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.5,
                transition: "color 0.15s",
                borderLeft: activeHeading === h.id ? "2px solid #00E5CC" : "2px solid transparent",
                paddingLeft: `${(h.level - 1) * 10 + 8}px`,
                marginBottom: 2,
              }}
            >
              {h.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}