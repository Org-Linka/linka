import { getSupabaseClient } from "@/shared/lib/supabase";

import type {
  CompanyConnectionHistoryItem,
  CompanyFeedProject,
  CompanyStudentDetails,
  CompanyStudentProject,
} from "./company.types";

type ProjectRow = {
  id: string;
  title: string;
  summary: string | null;
  cover_url: string | null;
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

async function resolveProjectCoverUrl(coverUrl: string | null) {
  if (!coverUrl) {
    return null;
  }

  if (coverUrl.startsWith("http://") || coverUrl.startsWith("https://")) {
    return coverUrl;
  }

  const supabase = getSupabaseClient();
  const normalizedPath = coverUrl.replace(/^project-covers\//, "");

  const { data, error } = await supabase.storage
    .from("project-covers")
    .createSignedUrl(normalizedPath, 60 * 60);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

export async function listApprovedCompanyFeedProjects() {
  const supabase = getSupabaseClient();

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select(
      "id, title, summary, cover_url, course_name, university, status, category_id, owner_id, created_at",
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

  return Promise.all(
    projectRows.map(async (project): Promise<CompanyFeedProject> => ({
      id: project.id,
      title: project.title,
      summary: project.summary,
      coverUrl: await resolveProjectCoverUrl(project.cover_url),
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
    })),
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

type CompanyConnectionHistoryRpcRow = {
  connection_id: string;
  connection_type: "interest" | "contact";
  project_id: string;
  project_title: string;
  project_summary: string | null;
  project_status: string | null;
  student_id: string | null;
  student_name: string | null;
  student_email: string | null;
  message: string | null;
  created_at: string | null;
};

export async function listCompanyConnectionsHistory() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc(
    "list_company_connections_history",
  );

  if (error) {
    throw error;
  }

  return ((data ?? []) as CompanyConnectionHistoryRpcRow[]).map(
    (connection): CompanyConnectionHistoryItem => ({
      id: connection.connection_id,
      type: connection.connection_type,
      projectId: connection.project_id,
      projectTitle: connection.project_title,
      projectSummary: connection.project_summary,
      projectStatus: connection.project_status,
      studentId: connection.student_id,
      studentName: connection.student_name,
      studentEmail: connection.student_email,
      message: connection.message,
      createdAt: connection.created_at,
    }),
  );
}

type CompanyStudentDetailsRpcRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  university: string | null;
  course_name: string | null;
  semester: string | null;
  headline: string | null;
  availability: string | null;
  focus_area: string | null;
  tools: string | null;
  languages: string | null;
  skills_summary: string | null;
  skills: string[] | null;
  projects: CompanyStudentProject[] | null;
};

export async function getCompanyStudentDetails(studentId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc("get_company_student_details", {
    p_student_id: studentId,
  });

  if (error) {
    throw error;
  }

  const student = Array.isArray(data)
    ? ((data[0] ?? null) as CompanyStudentDetailsRpcRow | null)
    : null;

  if (!student) {
    return null;
  }

  return {
    id: student.id,
    fullName: student.full_name,
    email: student.email,
    avatarUrl: student.avatar_url,
    bio: student.bio,
    city: student.city,
    state: student.state,
    linkedinUrl: student.linkedin_url,
    githubUrl: student.github_url,
    portfolioUrl: student.portfolio_url,
    university: student.university,
    courseName: student.course_name,
    semester: student.semester,
    headline: student.headline,
    availability: student.availability,
    focusArea: student.focus_area,
    tools: student.tools,
    languages: student.languages,
    skillsSummary: student.skills_summary,
    skills: student.skills ?? [],
    projects: student.projects ?? [],
  } satisfies CompanyStudentDetails;
}