export type CompanyFeedProject = {
  id: string;
  title: string;
  summary: string | null;
  categoryName: string | null;
  courseName: string | null;
  university: string | null;
  authorName: string | null;
  technologies: string[];
  stage: string | null;
};

export type CompanyConnectionType = "interest" | "contact";

export type CompanyConnectionHistoryItem = {
  id: string;
  type: CompanyConnectionType;
  projectId: string;
  projectTitle: string;
  projectSummary: string | null;
  projectStatus: string | null;
  studentId: string | null;
  studentName: string | null;
  studentEmail: string | null;
  message: string | null;
  createdAt: string | null;
};
export type CompanyStudentProject = {
  id: string;
  title: string;
  summary: string | null;
  status: string | null;
};

export type CompanyStudentDetails = {
  id: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  university: string | null;
  courseName: string | null;
  semester: string | null;
  headline: string | null;
  availability: string | null;
  focusArea: string | null;
  tools: string | null;
  languages: string | null;
  skillsSummary: string | null;
  skills: string[];
  projects: CompanyStudentProject[];
};