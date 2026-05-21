export type ProjectSummary = {
  id: string;
  title: string;
  subtitle: string;
};

export type ProjectPayload = Omit<ProjectSummary, "id">;
