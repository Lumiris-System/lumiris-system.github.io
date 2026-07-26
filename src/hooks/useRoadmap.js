import { useState } from "react";
import DEFAULT_ROADMAP from "../data/roadmap.js";

// ─── HOOK useRoadmap ──────────────────────────────────────────────────────────
// Gère l'état de la roadmap avec persistance automatique en localStorage.
// Toutes les modifications passent par ce hook.

export function useRoadmap() {
  const [roadmap, setRoadmap] = useState(() => {
    try {
      const saved = localStorage.getItem("aurora_roadmap");
      return saved ? JSON.parse(saved) : DEFAULT_ROADMAP;
    } catch {
      return DEFAULT_ROADMAP;
    }
  });

  // Sauvegarde l'état en mémoire + localStorage
  const save = (data) => {
    setRoadmap(data);
    localStorage.setItem("aurora_roadmap", JSON.stringify(data));
  };

  // Met à jour les champs d'une phase par son id
  const updatePhase = (id, updates) => {
    save(roadmap.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  // Ajoute un livrable à une phase
  const addDeliverable = (id, text) => {
    save(
      roadmap.map((p) =>
        p.id === id ? { ...p, deliverables: [...p.deliverables, text] } : p
      )
    );
  };

  // Supprime un livrable par son index
  const removeDeliverable = (id, idx) => {
    save(
      roadmap.map((p) =>
        p.id === id
          ? { ...p, deliverables: p.deliverables.filter((_, i) => i !== idx) }
          : p
      )
    );
  };

  // Ajoute une nouvelle phase vide
  const addPhase = () => {
    const newPhase = {
      id: Date.now(),
      phase: `Phase ${roadmap.length}`,
      title: "Nouveau module",
      version: null,
      duration: "À définir",
      status: "planned",
      color: "#7B5CF0",
      description: "Description de la nouvelle phase.",
      deliverables: ["Livrable 1"],
    };
    save([...roadmap, newPhase]);
  };

  // Supprime une phase par son id
  const deletePhase = (id) => {
    save(roadmap.filter((p) => p.id !== id));
  };

  // Réinitialise vers les données par défaut du fichier roadmap.js
  const reset = () => save(DEFAULT_ROADMAP);

  return {
    roadmap,
    updatePhase,
    addDeliverable,
    removeDeliverable,
    addPhase,
    deletePhase,
    reset,
  };
}
