import type { ProjectPayload } from "./project.types";

export function isValidProjectPayload(
  payload: Partial<ProjectPayload>,
): payload is ProjectPayload {
  return Boolean(payload.title?.trim() && payload.subtitle?.trim());
}
