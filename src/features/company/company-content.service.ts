import { getSupabaseClient } from "@/shared/lib/supabase";

export type CourseModality = "online" | "onsite" | "hybrid";
export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type CreateCompanyCourseInput = {
  title: string;
  description: string;
  modality: CourseModality;
  level: CourseLevel;
  workloadMinutes: number;
  hasCertificate: boolean;
  price: number;
};

export type CreateCompanyEventInput = {
  title: string;
  description: string;
  location: string;
  modality: CourseModality;
  startsAt: string;
  endsAt: string;
  price: number;
};

type CompanyContext = {
  profileId: string;
  companyId: string;
};

function normalizePrice(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Number(value.toFixed(2));
}

function normalizeWorkloadMinutes(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.round(value);
}

function parseDateTimeToIso(value: string, fieldLabel: string) {
  const normalizedValue = value.trim().replace(" ", "T");
  const parsedDate = new Date(normalizedValue);

  if (!normalizedValue || Number.isNaN(parsedDate.getTime())) {
    throw new Error(`Informe uma data válida para ${fieldLabel}.`);
  }

  return parsedDate.toISOString();
}

async function getAuthenticatedCompanyContext(): Promise<CompanyContext> {
  const supabase = getSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user?.id) {
    throw new Error("Você precisa estar logado como empresa para continuar.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, user_type")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile || profile.user_type !== "company") {
    throw new Error("Apenas usuários empresa podem criar cursos e eventos.");
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (companyError) {
    throw companyError;
  }

  if (!company?.id) {
    throw new Error(
      "Nenhum cadastro de empresa foi encontrado para este usuário.",
    );
  }

  return {
    profileId: user.id,
    companyId: String(company.id),
  };
}

export async function createCompanyCourse(input: CreateCompanyCourseInput) {
  const supabase = getSupabaseClient();
  const { companyId } = await getAuthenticatedCompanyContext();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("courses")
    .insert({
      company_id: companyId,
      title: input.title.trim(),
      description: input.description.trim(),
      modality: input.modality,
      level: input.level,
      workload_minutes: normalizeWorkloadMinutes(input.workloadMinutes),
      has_certificate: input.hasCertificate,
      price: normalizePrice(input.price),
      status: "published",
      published_at: now,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: String(data.id),
    isPaid: normalizePrice(input.price) > 0,
  };
}

export async function createCompanyEvent(input: CreateCompanyEventInput) {
  const supabase = getSupabaseClient();
  const { companyId } = await getAuthenticatedCompanyContext();
  const now = new Date().toISOString();

  const startsAt = parseDateTimeToIso(input.startsAt, "início do evento");
  const endsAt = parseDateTimeToIso(input.endsAt, "fim do evento");

  if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
    throw new Error("A data de fim precisa ser posterior à data de início.");
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      company_id: companyId,
      title: input.title.trim(),
      description: input.description.trim(),
      location: input.location.trim() || null,
      modality: input.modality,
      price: normalizePrice(input.price),
      status: "published",
      starts_at: startsAt,
      ends_at: endsAt,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: String(data.id),
    isPaid: normalizePrice(input.price) > 0,
  };
}

export type CompanyProfileSummary = {
  profileId: string;
  companyId: string | null;
  name: string;
  companyName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  linkedinUrl: string | null;
  verified: boolean;
};

export async function getCompanyProfileSummary(): Promise<CompanyProfileSummary> {
  const supabase = getSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user?.id) {
    throw new Error("Você precisa estar logado para visualizar o perfil.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, bio, phone, avatar_url, city, state, linkedin_url, portfolio_url, user_type",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile || profile.user_type !== "company") {
    throw new Error("Perfil de empresa não encontrado.");
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, logo_url, website_url, verified, city, state, country")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (companyError) {
    throw companyError;
  }

  return {
    profileId: String(profile.id),
    companyId: company?.id ? String(company.id) : null,
    name: String(company?.name ?? profile.full_name ?? profile.email),
    companyName: String(profile.full_name ?? company?.name ?? profile.email),
    email: String(profile.email),
    phone: profile.phone ? String(profile.phone) : null,
    bio: profile.bio ? String(profile.bio) : null,
    avatarUrl: profile.avatar_url ? String(profile.avatar_url) : null,
    logoUrl: company?.logo_url ? String(company.logo_url) : null,
    websiteUrl: company?.website_url
      ? String(company.website_url)
      : profile.portfolio_url
        ? String(profile.portfolio_url)
        : null,
    city: company?.city ? String(company.city) : profile.city ? String(profile.city) : null,
    state: company?.state ? String(company.state) : profile.state ? String(profile.state) : null,
    country: company?.country ? String(company.country) : null,
    linkedinUrl: profile.linkedin_url ? String(profile.linkedin_url) : null,
    verified: Boolean(company?.verified),
  };
}
