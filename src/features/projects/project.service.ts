import { getSupabaseClient } from "@/shared/lib/supabase";

import type {
  AcademicCourse,
  CreateProjectForm,
  ProjectAuthor,
  ProjectCategory,
  ProjectDetails,
  ProjectMember,
  ProjectSkill,
  ProjectSummary,
} from "./project.types";

type CreatedCategoryRpcResult = {
  category_id: string;
  category_name: string;
  category_slug: string;
};

type CreatedSkillRpcResult = {
  skill_id: string;
  skill_name: string;
  skill_slug: string;
};

type ProjectSkillRow = {
  skill: ProjectSkill | null;
};

type ProjectMemberRow = {
  role: string;
  profile: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
};

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

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

async function ensureAuthenticated() {
  const supabase = getSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("Você precisa estar logado para cadastrar um projeto.");
  }

  return user;
}

function normalizeAuthor(author: {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
} | null): ProjectAuthor | null {
  if (!author) {
    return null;
  }

  return {
    id: author.id,
    fullName: author.full_name ?? "Autor sem nome",
    email: author.email,
    avatarUrl: author.avatar_url,
  };
}

function normalizeMember(member: ProjectMemberRow): ProjectMember | null {
  if (!member.profile) {
    return null;
  }

  return {
    id: member.profile.id,
    fullName: member.profile.full_name ?? "Integrante sem nome",
    email: member.profile.email,
    role: member.role,
  };
}

export async function listProjectCategories(search = "") {
  const supabase = getSupabaseClient();
  const query = search.trim();
  const slug = createSlug(query);

  let request = supabase
    .from("project_categories")
    .select("id, name, slug")
    .order("name", { ascending: true })
    .limit(20);

  if (query) {
    request = request.or(`name.ilike.%${query}%,slug.ilike.%${slug}%`);
  }

  const { data, error } = await request;

  if (error) {
    throw error;
  }

  return (data ?? []) as ProjectCategory[];
}

export async function listAcademicCourses(search = "") {
  const supabase = getSupabaseClient();
  const query = search.trim();
  const slug = createSlug(query);

  let request = supabase
    .from("academic_courses")
    .select("id, name, slug")
    .eq("status", "approved")
    .order("name", { ascending: true })
    .limit(20);

  if (query) {
    request = request.or(`name.ilike.%${query}%,slug.ilike.%${slug}%`);
  }

  const { data, error } = await request;

  if (error) {
    throw error;
  }

  return (data ?? []) as AcademicCourse[];
}

export async function listProjectSkills(search = "") {
  const supabase = getSupabaseClient();
  const query = search.trim();
  const slug = createSlug(query);

  let request = supabase
    .from("skills")
    .select("id, name, slug")
    .order("name", { ascending: true })
    .limit(20);

  if (query) {
    request = request.or(`name.ilike.%${query}%,slug.ilike.%${slug}%`);
  }

  const { data, error } = await request;

  if (error) {
    throw error;
  }

  return (data ?? []) as ProjectSkill[];
}

export async function getOrCreateProjectCategory(name: string) {
  const supabase = getSupabaseClient();
  const trimmedName = name.trim();
  const slug = createSlug(trimmedName);

  if (!trimmedName || !slug) {
    throw new Error("Informe uma categoria válida.");
  }

  const { data: existingCategory, error: selectError } = await supabase
    .from("project_categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existingCategory) {
    return existingCategory as ProjectCategory;
  }

  const { data, error } = await supabase.rpc(
    "create_project_category_if_not_exists",
    {
      p_name: trimmedName,
      p_slug: slug,
    },
  );

  if (error) {
    throw error;
  }

  const createdCategory = (data?.[0] ?? null) as CreatedCategoryRpcResult | null;

  if (!createdCategory) {
    throw new Error("Não foi possível criar a categoria.");
  }

  return {
    id: createdCategory.category_id,
    name: createdCategory.category_name,
    slug: createdCategory.category_slug,
  } as ProjectCategory;
}

export async function getOrCreateProjectSkill(name: string) {
  const supabase = getSupabaseClient();
  const trimmedName = name.trim();
  const slug = createSlug(trimmedName);

  if (!trimmedName || !slug) {
    throw new Error("Informe uma tecnologia válida.");
  }

  const { data: existingSkill, error: selectError } = await supabase
    .from("skills")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existingSkill) {
    return existingSkill as ProjectSkill;
  }

  const { data, error } = await supabase.rpc("create_skill_if_not_exists", {
    p_name: trimmedName,
    p_slug: slug,
  });

  if (error) {
    throw error;
  }

  const createdSkill = (data?.[0] ?? null) as CreatedSkillRpcResult | null;

  if (!createdSkill) {
    throw new Error("Não foi possível criar a tecnologia.");
  }

  return {
    id: createdSkill.skill_id,
    name: createdSkill.skill_name,
    slug: createdSkill.skill_slug,
  } as ProjectSkill;
}

export async function createProject(form: CreateProjectForm) {
  await ensureAuthenticated();

  const supabase = getSupabaseClient();

  const category = await getOrCreateProjectCategory(form.category);
  const skillNames = splitCommaSeparatedValues(form.technologies);

  const skills = await Promise.all(
    skillNames.map((skillName) => getOrCreateProjectSkill(skillName)),
  );

  const { data, error } = await supabase.rpc("create_project", {
    p_title: form.title.trim(),
    p_description: form.description.trim(),
    p_summary: form.summary.trim(),
    p_category_id: category.id,
    p_course_name: form.courseName.trim(),
    p_university: toNullableText(form.university),
    p_repository_url: toNullableText(form.repositoryUrl),
    p_demo_url: toNullableText(form.demoUrl),
    p_cover_url: null,
    p_status: "pending_review",
    p_skill_ids: skills.map((skill) => skill.id),
    p_links: [],
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function getProjectDetails(projectId: string) {
  const supabase = getSupabaseClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError) {
    throw projectError;
  }

  if (!project) {
    return null;
  }

  const { data: category, error: categoryError } = await supabase
    .from("project_categories")
    .select("id, name, slug")
    .eq("id", project.category_id)
    .maybeSingle();

  if (categoryError) {
    throw categoryError;
  }

  const { data: author, error: authorError } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .eq("id", project.owner_id)
    .maybeSingle();

  if (authorError) {
    throw authorError;
  }

  const { data: projectSkills, error: skillsError } = await supabase
    .from("project_skills")
    .select(
      `
        skill:skills (
          id,
          name,
          slug
        )
      `,
    )
    .eq("project_id", projectId);

  if (skillsError) {
    throw skillsError;
  }

  const { data: projectMembers, error: membersError } = await supabase
    .from("project_members")
    .select(
      `
        role,
        profile:profiles (
          id,
          full_name,
          email
        )
      `,
    )
    .eq("project_id", projectId);

  if (membersError) {
    throw membersError;
  }

  const skills = ((projectSkills ?? []) as unknown as ProjectSkillRow[])
    .map((item) => item.skill)
    .filter((skill): skill is ProjectSkill => Boolean(skill));

  const members = ((projectMembers ?? []) as unknown as ProjectMemberRow[])
    .map(normalizeMember)
    .filter((member): member is ProjectMember => Boolean(member));

  return {
    id: project.id,
    title: project.title,
    summary: project.summary,
    description: project.description,
    courseName: project.course_name,
    university: project.university,
    repositoryUrl: project.repository_url,
    demoUrl: project.demo_url,
    coverUrl: project.cover_url,
    status: project.status,
    category: category ?? null,
    author: normalizeAuthor(author),
    skills,
    members,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
  } satisfies ProjectDetails;
}
export async function registerProjectInterest(projectId: string) {
  const supabase = getSupabaseClient();

  const { error } = await supabase.rpc("register_project_interest", {
    p_project_id: projectId,
  });

  if (error) {
    throw error;
  }
}

export async function sendProjectContactMessage(
  projectId: string,
  message: string,
) {
  const supabase = getSupabaseClient();

  const { error } = await supabase.rpc("send_project_contact_message", {
    p_project_id: projectId,
    p_message: message.trim(),
  });

  if (error) {
    throw error;
  }
}