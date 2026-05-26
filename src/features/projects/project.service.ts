import { getSupabaseClient } from "@/shared/lib/supabase";

import type {
  CreateProjectForm,
  CreateProjectPayload,
  ProjectCategory,
  ProjectSkill,
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

function splitCommaSeparatedValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildCreateProjectPayload(
  form: CreateProjectForm,
  ownerId: string,
  categoryId: string | null,
): CreateProjectPayload {
  return {
    owner_id: ownerId,
    category_id: categoryId,
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

async function getOrCreateProjectCategory(name: string) {
  const trimmedName = name.trim();
  const supabase = getSupabaseClient();

  const { data: existingCategory, error: selectError } = await supabase
    .from("project_categories")
    .select("id, name")
    .ilike("name", trimmedName)
    .maybeSingle<ProjectCategory>();

  if (selectError) {
    throw selectError;
  }

  if (existingCategory) {
    return existingCategory;
  }

  const { data: createdCategory, error: insertError } = await supabase
    .from("project_categories")
    .insert({
      name: trimmedName,
    })
    .select("id, name")
    .single<ProjectCategory>();

  if (insertError) {
    throw insertError;
  }

  return createdCategory;
}

async function getOrCreateSkill(name: string) {
  const trimmedName = name.trim();
  const supabase = getSupabaseClient();

  const { data: existingSkill, error: selectError } = await supabase
    .from("skills")
    .select("id, name")
    .ilike("name", trimmedName)
    .maybeSingle<ProjectSkill>();

  if (selectError) {
    throw selectError;
  }

  if (existingSkill) {
    return existingSkill;
  }

  const { data: createdSkill, error: insertError } = await supabase
    .from("skills")
    .insert({
      name: trimmedName,
    })
    .select("id, name")
    .single<ProjectSkill>();

  if (insertError) {
    throw insertError;
  }

  return createdSkill;
}

async function attachProjectSkills(projectId: string, technologyNames: string[]) {
  const uniqueTechnologyNames = Array.from(new Set(technologyNames));

  if (!uniqueTechnologyNames.length) {
    return;
  }

  const skills = await Promise.all(
    uniqueTechnologyNames.map((technologyName) => getOrCreateSkill(technologyName)),
  );

  const supabase = getSupabaseClient();

  const { error } = await supabase.from("project_skills").insert(
    skills.map((skill) => ({
      project_id: projectId,
      skill_id: skill.id,
    })),
  );

  if (error) {
    throw error;
  }
}

async function attachProjectOwner(projectId: string, profileId: string) {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from("project_members").insert({
    project_id: projectId,
    profile_id: profileId,
    role: "owner",
  });

  if (error) {
    throw error;
  }
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

  const category = await getOrCreateProjectCategory(form.category);
  const payload = buildCreateProjectPayload(form, profile.id, category.id);

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert(payload)
    .select("id")
    .single();

  if (projectError) {
    throw projectError;
  }

  const technologyNames = splitCommaSeparatedValues(form.technologies);

  await attachProjectOwner(project.id, profile.id);
  await attachProjectSkills(project.id, technologyNames);

  return project;
}