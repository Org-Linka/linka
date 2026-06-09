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