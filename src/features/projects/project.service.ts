import { getSupabaseClient } from "@/shared/lib/supabase";

import type { CreateProjectForm, ProjectSummary } from "./project.types";

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

function toNullableText(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue ? trimmedValue : null;
}

function splitCommaSeparatedValues(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export async function createProject(form: CreateProjectForm) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc("create_project_with_relations", {
    p_title: form.title.trim(),
    p_summary: form.summary.trim(),
    p_description: form.description.trim(),
    p_category: form.category.trim(),
    p_course_name: form.courseName.trim(),
    p_university: toNullableText(form.university),
    p_technologies: splitCommaSeparatedValues(form.technologies),
    p_repository_url: toNullableText(form.repositoryUrl),
    p_demo_url: toNullableText(form.demoUrl),
  });

  if (error) {
    throw error;
  }

  return data;
}