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

export type CreateProjectForm = {
  title: string;
  summary: string;
  description: string;
  courseName: string;
  university: string;
  technologies: string;
  repositoryUrl: string;
  demoUrl: string;
};

export type CreateProjectPayload = {
  owner_id: string;
  title: string;
  summary: string;
  description: string;
  course_name: string | null;
  university: string | null;
  repository_url: string | null;
  demo_url: string | null;
  status: Extract<ProjectStatus, "pending_review">;
};