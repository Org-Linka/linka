import type { CreateProjectForm, ProjectPayload } from "./project.types";

export function isValidProjectPayload(
  payload: Partial<ProjectPayload>,
): payload is ProjectPayload {
  return Boolean(payload.title?.trim() && payload.subtitle?.trim());
}

export function isValidCreateProjectForm(form: CreateProjectForm) {
  return Boolean(
    form.title.trim() &&
      form.summary.trim() &&
      form.description.trim() &&
      form.category.trim() &&
      form.courseName.trim() &&
      form.technologies.trim(),
  );
}