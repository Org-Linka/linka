export type ProjectStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "archived";

export type ProjectSummary = {
  id: string;
  title: string;
  subtitle: string;
};

export type ProjectPayload = Omit<ProjectSummary, "id">;

export type ProjectMediaType = "image" ;

export type CreateProjectForm = {
  title: string;
  summary: string;
  description: string;
  category: string;
  courseName: string;
  university: string;
  technologies: string;
  repositoryUrl: string;
  demoUrl: string;
  coverUrl: string;
  coverMediaType: ProjectMediaType | null;
  coverMimeType: string | null;
};

export type CreateProjectPayload = {
  owner_id: string;
  category_id: string | null;
  title: string;
  summary: string;
  description: string;
  course_name: string | null;
  university: string | null;
  repository_url: string | null;
  demo_url: string | null;
  status: Extract<ProjectStatus, "pending_review">;
};

export type ProjectCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ProjectSkill = {
  id: string;
  name: string;
  slug: string;
};

export type AcademicCourse = {
  id: string;
  name: string;
  slug: string;
};

export type ProjectAuthor = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
};

export type ProjectMember = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

export type ProjectDetails = {
  id: string;
  title: string;
  summary: string | null;
  description: string;
  courseName: string | null;
  university: string | null;
  repositoryUrl: string | null;
  demoUrl: string | null;
  coverUrl: string | null;
  status: ProjectStatus;
  category: ProjectCategory | null;
  author: ProjectAuthor | null;
  skills: ProjectSkill[];
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
};