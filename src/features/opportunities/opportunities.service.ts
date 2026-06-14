import { getSupabaseClient } from "@/shared/lib/supabase";

import type {
  CatalogData,
  CatalogFilters,
  CatalogItem,
  CourseLevel,
  CourseModality,
  EventModality,
} from "./opportunities.types";
import { DEFAULT_CATALOG_FILTERS } from "./opportunities.types";

type DbCompany = {
  id: string;
  name: string;
  logo_url: string | null;
};

type DbCourse = {
  id: string;
  company_id: string | null;
  title: string;
  description: string;
  thumbnail_url: string | null;
  level: CourseLevel;
  modality: CourseModality;
  workload_minutes: number;
  price: number | string | null;
  status: "published";
  published_at: string | null;
  created_at: string;
};

type DbEvent = {
  id: string;
  company_id: string | null;
  title: string;
  description: string;
  cover_url: string | null;
  location: string | null;
  modality: EventModality;
  price: number | string;
  status: "published";
  starts_at: string;
  ends_at: string | null;
  created_at: string;
};

type DbCareerTrack = {
  id: string;
  name: string;
};

type DbCourseCareerTrack = {
  course_id: string;
  career_track_id: string;
};

type DbEventCareerTrack = {
  event_id: string;
  career_track_id: string;
};

type ModalityInfo = {
  label: string | null;
  key: CatalogItem["modalityKey"];
};

export async function listStudentCatalog(
  filters: Partial<CatalogFilters> = {},
): Promise<CatalogData> {
  const supabase = getSupabaseClient();
  const normalizedFilters = normalizeFilters(filters);

  const [coursesResult, eventsResult, careerTracksResult] = await Promise.all([
    supabase
      .from("courses")
      .select(
        "id, company_id, title, description, thumbnail_url, level, modality, workload_minutes, price, status, published_at, created_at",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false }),
    supabase
      .from("events")
      .select(
        "id, company_id, title, description, cover_url, location, modality, price, status, starts_at, ends_at, created_at",
      )
      .eq("status", "published")
      .order("starts_at", { ascending: true }),
    supabase.from("career_tracks").select("id, name").order("name"),
  ]);

  if (coursesResult.error) {
    throw new Error(coursesResult.error.message);
  }

  if (eventsResult.error) {
    throw new Error(eventsResult.error.message);
  }

  if (careerTracksResult.error) {
    throw new Error(careerTracksResult.error.message);
  }

  const courses = (coursesResult.data ?? []) as DbCourse[];
  const events = (eventsResult.data ?? []) as DbEvent[];
  const careerTracks = (careerTracksResult.data ?? []) as DbCareerTrack[];

  const companyIds = uniqueStrings([
    ...courses.map((course) => course.company_id),
    ...events.map((event) => event.company_id),
  ]);

  const [companiesById, courseTrackIdsByCourseId, eventTrackIdsByEventId] =
    await Promise.all([
      fetchCompaniesById(companyIds),
      fetchCourseTrackIdsByCourseId(courses.map((course) => course.id)),
      fetchEventTrackIdsByEventId(events.map((event) => event.id)),
    ]);

  const courseItems = courses.map((course) =>
    mapCourseToCatalogItem(
      course,
      companiesById.get(course.company_id ?? "") ?? null,
      courseTrackIdsByCourseId.get(course.id) ?? [],
    ),
  );

  const eventItems = events.map((event) =>
    mapEventToCatalogItem(
      event,
      companiesById.get(event.company_id ?? "") ?? null,
      eventTrackIdsByEventId.get(event.id) ?? [],
    ),
  );

  const items = applyCatalogFilters(
    [...courseItems, ...eventItems],
    normalizedFilters,
  );

  return {
    items,
    careerTracks: careerTracks.map((track) => ({
      id: track.id,
      name: track.name,
    })),
  };
}

function normalizeFilters(filters: Partial<CatalogFilters>): CatalogFilters {
  return {
    ...DEFAULT_CATALOG_FILTERS,
    ...filters,
    search: filters.search?.trim() ?? DEFAULT_CATALOG_FILTERS.search,
  };
}

async function fetchCompaniesById(ids: string[]) {
  const companiesById = new Map<string, DbCompany>();

  if (ids.length === 0) {
    return companiesById;
  }

  const { data, error } = await getSupabaseClient()
    .from("companies")
    .select("id, name, logo_url")
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  ((data ?? []) as DbCompany[]).forEach((company) => {
    companiesById.set(company.id, company);
  });

  return companiesById;
}

async function fetchCourseTrackIdsByCourseId(ids: string[]) {
  const trackIdsByCourseId = new Map<string, string[]>();

  if (ids.length === 0) {
    return trackIdsByCourseId;
  }

  const { data, error } = await getSupabaseClient()
    .from("course_career_tracks")
    .select("course_id, career_track_id")
    .in("course_id", ids);

  if (error) {
    throw new Error(error.message);
  }

  ((data ?? []) as DbCourseCareerTrack[]).forEach((link) => {
    const currentTrackIds = trackIdsByCourseId.get(link.course_id) ?? [];
    trackIdsByCourseId.set(link.course_id, [
      ...currentTrackIds,
      link.career_track_id,
    ]);
  });

  return trackIdsByCourseId;
}

async function fetchEventTrackIdsByEventId(ids: string[]) {
  const trackIdsByEventId = new Map<string, string[]>();

  if (ids.length === 0) {
    return trackIdsByEventId;
  }

  const { data, error } = await getSupabaseClient()
    .from("event_career_tracks")
    .select("event_id, career_track_id")
    .in("event_id", ids);

  if (error) {
    throw new Error(error.message);
  }

  ((data ?? []) as DbEventCareerTrack[]).forEach((link) => {
    const currentTrackIds = trackIdsByEventId.get(link.event_id) ?? [];
    trackIdsByEventId.set(link.event_id, [
      ...currentTrackIds,
      link.career_track_id,
    ]);
  });

  return trackIdsByEventId;
}

function mapCourseToCatalogItem(
  course: DbCourse,
  company: DbCompany | null,
  careerTrackIds: string[],
): CatalogItem {
  const modality = normalizeModality(course.modality);
  const price = normalizeNumber(course.price);
  const isFree = price <= 0;

  return {
    id: course.id,
    type: "course",
    title: course.title,
    description: course.description,
    companyName: company?.name ?? "Empresa não informada",
    companyLogoUrl: company?.logo_url ?? null,
    imageUrl: course.thumbnail_url,
    modality: modality.label,
    modalityKey: modality.key,
    isFree,
    price,
    priceLabel: isFree ? "Gratuito" : formatCurrency(price),
    dateLabel: null,
    workloadLabel: formatWorkloadMinutes(course.workload_minutes),
    level: normalizeCourseLevel(course.level),
    careerTrackIds,
    publishedAt: course.published_at ?? course.created_at,
  };
}

function mapEventToCatalogItem(
  event: DbEvent,
  company: DbCompany | null,
  careerTrackIds: string[],
): CatalogItem {
  const modality = normalizeModality(event.modality);
  const price = normalizeNumber(event.price);
  const isFree = price <= 0;

  return {
    id: event.id,
    type: "event",
    title: event.title,
    description: event.description,
    companyName: company?.name ?? "Empresa não informada",
    companyLogoUrl: company?.logo_url ?? null,
    imageUrl: event.cover_url,
    modality: modality.label,
    modalityKey: modality.key,
    isFree,
    price,
    priceLabel: isFree ? "Gratuito" : formatCurrency(price),
    dateLabel: formatDateLabel(event.starts_at),
    workloadLabel: null,
    level: null,
    careerTrackIds,
    publishedAt: event.created_at,
  };
}

function applyCatalogFilters(
  items: CatalogItem[],
  filters: CatalogFilters,
): CatalogItem[] {
  const search = normalizeSearchTerm(filters.search);

  return items.filter((item) => {
    if (filters.type !== "all" && item.type !== filters.type) {
      return false;
    }

    if (filters.modality !== "all" && item.modalityKey !== filters.modality) {
      return false;
    }

    if (filters.price === "free" && !item.isFree) {
      return false;
    }

    if (filters.price === "paid" && item.isFree) {
      return false;
    }

    if (
      filters.careerTrackId !== "all" &&
      !item.careerTrackIds.includes(filters.careerTrackId)
    ) {
      return false;
    }

    if (!search) {
      return true;
    }

    return normalizeSearchTerm(
      `${item.title} ${item.description ?? ""} ${item.companyName}`,
    ).includes(search);
  });
}

function normalizeModality(value: CourseModality | EventModality): ModalityInfo {
  const modalities: Record<string, ModalityInfo> = {
    online: { label: "Online", key: "online" },
    remote: { label: "Online", key: "online" },
    onsite: { label: "Presencial", key: "onsite" },
    hybrid: { label: "Híbrido", key: "hybrid" },
  };

  return modalities[value] ?? { label: value, key: null };
}

function normalizeCourseLevel(value: CourseLevel) {
  const levels: Record<CourseLevel, string> = {
    beginner: "Iniciante",
    intermediate: "Intermediário",
    advanced: "Avançado",
  };

  return levels[value];
}

function formatWorkloadMinutes(value: number) {
  if (value <= 0) {
    return null;
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h${minutes}min`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}min`;
}

function formatDateLabel(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}

function normalizeNumber(value: number | string | null) {
  if (value === null) {
    return 0;
  }

  const numberValue = typeof value === "number" ? value : Number(value);

  return Number.isNaN(numberValue) ? 0 : numberValue;
}

function normalizeSearchTerm(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function uniqueStrings(values: (string | null | undefined)[]) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value))),
  );
}
