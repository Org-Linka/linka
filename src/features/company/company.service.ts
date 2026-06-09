import { getSupabaseClient } from "@/shared/lib/supabase";

import type { CompanyFeedProject } from "./company.types";

type ProjectRow = {
  id: string;
  title: string;
  summary: string | null;
  course_name: string | null;
  university: string | null;
  status: string;
  category_id: string | null;
  owner_id: string;
  created_at: string;
};

type ProjectCategoryRow = {
  id: string;
  name: string;
};

type ProjectAuthorRow = {
  id: string;
  full_name: string | null;
  email: string;
};

type ProjectSkillRow = {
  project_id: string;
  skill: {
    id: string;
    name: string;
  } | null;
};

const stageLabels: Record<string, string> = {
  approved: "Aprovado",
};

export async function listApprovedCompanyFeedProjects() {
  const supabase = getSupabaseClient();

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select(
      "id, title, summary, course_name, university, status, category_id, owner_id, created_at",
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (projectsError) {
    throw projectsError;
  }

  const projectRows = (projects ?? []) as ProjectRow[];

  if (!projectRows.length) {
    return [];
  }

  const categoryIds = Array.from(
    new Set(
      projectRows
        .map((project) => project.category_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const ownerIds = Array.from(
    new Set(projectRows.map((project) => project.owner_id)),
  );

  const projectIds = projectRows.map((project) => project.id);

  const [categories, authors, skillsByProject] = await Promise.all([
    listCategoriesById(categoryIds),
    listAuthorsById(ownerIds),
    listSkillsByProjectId(projectIds),
  ]);

  return projectRows.map(
    (project): CompanyFeedProject => ({
      id: project.id,
      title: project.title,
      summary: project.summary,
      categoryName: project.category_id
        ? (categories.get(project.category_id)?.name ?? null)
        : null,
      courseName: project.course_name,
      university: project.university,
      authorName:
        authors.get(project.owner_id)?.full_name ??
        authors.get(project.owner_id)?.email ??
        null,
      technologies: skillsByProject.get(project.id) ?? [],
      stage: stageLabels[project.status] ?? project.status,
    }),
  );
}

async function listCategoriesById(categoryIds: string[]) {
  if (!categoryIds.length) {
    return new Map<string, ProjectCategoryRow>();
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("project_categories")
    .select("id, name")
    .in("id", categoryIds);

  if (error) {
    throw error;
  }

  return new Map(
    ((data ?? []) as ProjectCategoryRow[]).map((category) => [
      category.id,
      category,
    ]),
  );
}

async function listAuthorsById(ownerIds: string[]) {
  if (!ownerIds.length) {
    return new Map<string, ProjectAuthorRow>();
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", ownerIds);

  if (error) {
    throw error;
  }

  return new Map(
    ((data ?? []) as ProjectAuthorRow[]).map((author) => [author.id, author]),
  );
}

async function listSkillsByProjectId(projectIds: string[]) {
  if (!projectIds.length) {
    return new Map<string, string[]>();
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("project_skills")
    .select(
      `
        project_id,
        skill:skills (
          id,
          name
        )
      `,
    )
    .in("project_id", projectIds);

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as ProjectSkillRow[]).reduce(
    (skillsByProject, item) => {
      if (!item.skill) {
        return skillsByProject;
      }

      const skills = skillsByProject.get(item.project_id) ?? [];
      skills.push(item.skill.name);
      skillsByProject.set(item.project_id, skills);

      return skillsByProject;
    },
    new Map<string, string[]>(),
  );
}
