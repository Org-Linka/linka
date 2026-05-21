import type { ProjectSummary } from "./project.types";

const highlightedProjects: ProjectSummary[] = [
  {
    id: "elderly-app",
    title: "Aplicativo para Idosos",
    subtitle: "Play Store / Apple Store",
  },
  {
    id: "special-children-app",
    title: "Aplicativo para Crianças Especiais",
    subtitle: "Play Store / Apple Store",
  },
  {
    id: "law-office",
    title: "Consultório de Advocacia",
    subtitle: "Centro - RJ",
  },
  {
    id: "psychology-office",
    title: "Consultório de Psicologia",
    subtitle: "Santa Cruz - RJ",
  },
];

export function listHighlightedProjects() {
  return highlightedProjects;
}
