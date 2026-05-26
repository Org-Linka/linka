import { getSupabaseClient } from "@/shared/lib/supabase";

import type {
  CreateProjectForm,
  CreateProjectPayload,
  ProjectSummary,
} from "./project.types";

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

function buildCreateProjectPayload(
  form: CreateProjectForm,
  ownerId: string,
): CreateProjectPayload {
  return {
    owner_id: ownerId,
    title: form.title.trim(),
    summary: form.summary.trim(),
    description: form.description.trim(),
    course_name: toNullableText(form.courseName),
    university: toNullableText(form.university),
    repository_url: toNullableText(form.repositoryUrl),
    demo_url: toNullableText(form.demoUrl),
    status: "pending_review",
  };
}

export async function createProject(form: CreateProjectForm) {
  const supabase = getSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Você precisa estar logado para cadastrar um projeto.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    throw new Error(
      "Seu perfil ainda não foi configurado. Complete seu perfil antes de cadastrar um projeto.",
    );
  }

  const payload = buildCreateProjectPayload(form, profile.id);

  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}