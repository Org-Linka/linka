import { getSupabaseClient } from "@/shared/lib/supabase";

import type { HomeCategory, HomeCourse, HomeEvent, StudentHomeData } from "./home.types";

type CourseLevel = "beginner" | "intermediate" | "advanced";
type CourseModality = "online" | "onsite" | "hybrid";
type EventModality = "remote" | "onsite" | "hybrid";

type DbCompany = {
  id: string;
  name: string;
};

type DbCourse = {
  id: string;
  company_id: string | null;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  level: CourseLevel;
  modality: CourseModality;
  workload_minutes: number;
  has_certificate: boolean;
  published_at: string | null;
  created_at: string;
};

type DbEvent = {
  id: string;
  company_id: string | null;
  title: string;
  description: string | null;
  cover_url: string | null;
  location: string | null;
  modality: EventModality;
  price: number | string;
  starts_at: string | null;
  created_at: string;
};

export function listHomeCategories(): HomeCategory[] {
  return [
    { id: "courses", nome: "Cursos", icone: "school-outline", target: "courses" },
    { id: "events", nome: "Eventos", icone: "calendar-outline", target: "events" },
    { id: "projects", nome: "Projetos", icone: "bulb-outline", target: "projects" },
    { id: "payments", nome: "Planos", icone: "wallet-outline", target: "payments" },
  ];
}

export async function getStudentHomeData(): Promise<StudentHomeData> {
  const supabase = getSupabaseClient();

  const [coursesResult, eventsResult] = await Promise.all([
    supabase
      .from("courses")
      .select(
        "id, company_id, title, description, thumbnail_url, level, modality, workload_minutes, has_certificate, published_at, created_at",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("events")
      .select(
        "id, company_id, title, description, cover_url, location, modality, price, starts_at, created_at",
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (coursesResult.error) {
    throw new Error(coursesResult.error.message);
  }

  if (eventsResult.error) {
    throw new Error(eventsResult.error.message);
  }

  const courses = (coursesResult.data ?? []) as DbCourse[];
  const events = (eventsResult.data ?? []) as DbEvent[];
  const companiesById = await fetchCompaniesById([
    ...courses.map((course) => course.company_id),
    ...events.map((event) => event.company_id),
  ]);

  return {
    courses: courses.map((course) =>
      mapCourseToHomeCourse(course, companiesById.get(course.company_id ?? "") ?? null),
    ),
    events: events.map((event) =>
      mapEventToHomeEvent(event, companiesById.get(event.company_id ?? "") ?? null),
    ),
  };
}

async function fetchCompaniesById(ids: (string | null)[]) {
  const companyIds = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  const companiesById = new Map<string, DbCompany>();

  if (!companyIds.length) {
    return companiesById;
  }

  const { data, error } = await getSupabaseClient()
    .from("companies")
    .select("id, name")
    .in("id", companyIds);

  if (error) {
    throw new Error(error.message);
  }

  ((data ?? []) as DbCompany[]).forEach((company) => {
    companiesById.set(company.id, company);
  });

  return companiesById;
}

function mapCourseToHomeCourse(course: DbCourse, company: DbCompany | null): HomeCourse {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    companyName: company?.name ?? "Empresa não informada",
    imageUrl: course.thumbnail_url,
    modality: normalizeModality(course.modality),
    level: normalizeCourseLevel(course.level),
    workloadLabel: formatWorkloadMinutes(course.workload_minutes),
    hasCertificate: course.has_certificate,
  };
}

function mapEventToHomeEvent(event: DbEvent, company: DbCompany | null): HomeEvent {
  const price = Number(event.price ?? 0);

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    companyName: company?.name ?? "Empresa não informada",
    imageUrl: event.cover_url,
    modality: normalizeModality(event.modality),
    location: event.location,
    priceLabel: price <= 0 ? "Gratuito" : formatCurrency(price),
    startsAtLabel: formatDateLabel(event.starts_at),
  };
}

function normalizeModality(value: CourseModality | EventModality) {
  const modalities: Record<string, string> = {
    online: "Online",
    remote: "Online",
    onsite: "Presencial",
    hybrid: "Híbrido",
  };

  return modalities[value] ?? value;
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
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
