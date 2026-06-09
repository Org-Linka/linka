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
