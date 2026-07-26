// ─── AURORA BEAM ─────────────────────────────────────────────────────────────
// Effet de lumière animé affiché dans le header de chaque page.

export default function AuroraBeam() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* Halo gauche — bleu/cyan */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "10%",
          width: "80%",
          height: "60%",
          background:
            "radial-gradient(ellipse, #7B5CF015 0%, #00E5CC08 40%, transparent 70%)",
          filter: "blur(40px)",
          animation: "aurora-pulse 8s ease-in-out infinite",
        }}
      />
      {/* Halo droit — cyan */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "-10%",
          width: "60%",
          height: "40%",
          background:
            "radial-gradient(ellipse, #00E5CC10 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "aurora-pulse 12s ease-in-out infinite reverse",
        }}
      />
    </div>
  );
}
