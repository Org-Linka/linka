import { File as ExpoFile } from "expo-file-system";
import { Platform } from "react-native";

import { getSupabaseClient } from "@/shared/lib/supabase";

import type { UserType } from "@/features/auth/auth.types";
import type {
  AcademicAreaOption,
  AcademicCourseOption,
  CareerTrackOption,
  CompanyProfileUser,
  InvestorProfileUser,
  ProfileProject,
  ProfileUser,
  StudentProfileUser,
} from "./profile.types";

const AVATARS_BUCKET =
  process.env.EXPO_PUBLIC_SUPABASE_AVATARS_BUCKET?.trim() || "avatars";

const SUPPORTED_AVATAR_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

const MIME_BY_EXTENSION: Record<(typeof SUPPORTED_AVATAR_EXTENSIONS)[number], string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const EXTENSION_BY_MIME: Record<string, (typeof SUPPORTED_AVATAR_EXTENSIONS)[number]> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type AvatarUploadPayload = {
  uri: string;
  base64?: string | null;
  mimeType?: string | null;
  fileName?: string | null;
};

function normalizeExtension(value: string | null | undefined) {
  if (!value) return null;

  const normalized = value.toLowerCase().trim();
  if (
    (
      SUPPORTED_AVATAR_EXTENSIONS as readonly string[]
    ).includes(normalized)
  ) {
    return normalized as (typeof SUPPORTED_AVATAR_EXTENSIONS)[number];
  }

  return null;
}

function extractExtensionFromPath(path: string | null | undefined) {
  if (!path) return null;

  const sanitized = path.split("?")[0];
  const extension = sanitized.split(".").pop();

  return normalizeExtension(extension);
}

function normalizeMimeType(mimeType: string | null | undefined) {
  if (!mimeType) return null;

  const normalized = mimeType.toLowerCase().split(";")[0].trim();
  return normalized.startsWith("image/") ? normalized : null;
}

function resolveAvatarMetadata(image: AvatarUploadPayload) {
  const extensionFromName = extractExtensionFromPath(image.fileName);
  const extensionFromUri = extractExtensionFromPath(image.uri);
  const mimeType = normalizeMimeType(image.mimeType);
  const extensionFromMime = mimeType ? EXTENSION_BY_MIME[mimeType] ?? null : null;
  const isKnownMime = Boolean(mimeType && EXTENSION_BY_MIME[mimeType]);

  const fileExtension =
    extensionFromName ??
    extensionFromUri ??
    extensionFromMime ??
    "jpg";

  const contentType = isKnownMime
    ? (mimeType as string)
    : image.base64
      ? "image/jpeg"
      : MIME_BY_EXTENSION[fileExtension];

  return {
    fileExtension,
    contentType,
  };
}

function normalizeBase64Payload(base64: string) {
  const normalized = base64.replace(/\s/g, "");
  const dataUriSeparatorIndex = normalized.indexOf(",");

  return dataUriSeparatorIndex >= 0
    ? normalized.slice(dataUriSeparatorIndex + 1)
    : normalized;
}

function decodeBase64ToArrayBuffer(base64: string) {
  if (typeof globalThis.atob !== "function") {
    return null;
  }

  const binary = globalThis.atob(normalizeBase64Payload(base64));
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return buffer;
}

async function convertAvatarToArrayBuffer(
  image: AvatarUploadPayload,
  contentType: string,
) {
  if (image.base64) {
    try {
      const arrayBuffer = decodeBase64ToArrayBuffer(image.base64);

      if (arrayBuffer) {
        return arrayBuffer;
      }
    } catch {
      // Continua para os fallbacks por URI abaixo.
    }
  }

  if (Platform.OS !== "web") {
    try {
      const file = new ExpoFile(image.uri);
      return await file.arrayBuffer();
    } catch {
      // fallback abaixo para manter compatibilidade em casos específicos de URI
    }
  }

  if (image.base64) {
    try {
      const base64Response = await fetch(
        `data:${contentType};base64,${normalizeBase64Payload(image.base64)}`,
      );

      if (base64Response.ok) {
        return base64Response.arrayBuffer();
      }
    } catch {
      // O URI ainda pode estar disponível mesmo quando data URLs falham.
    }
  }

  const response = await fetch(image.uri);

  if (!response.ok) {
    throw new Error("Não foi possível ler a imagem selecionada.");
  }

  return response.arrayBuffer();
}

type DbProfile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  user_type: UserType;
  bio: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
};

type DbStudentProfile = {
  university: string | null;
  course_name: string | null;
  semester: string | null;
  academic_registration: string | null;
  headline: string | null;
  availability: string | null;
  academic_course_id: string | null;
  academic_courses: {
    id: string;
    area_id: string;
    name: string;
  } | null;
  focus_area?: string | null;
  tools?: string | null;
  languages?: string | null;
  skills_summary?: string | null;
};

type DbCompanyProfile = {
  id: string;
  name: string;
  legal_name: string | null;
  cnpj: string | null;
  description: string | null;
  industry: string | null;
  website_url: string | null;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  city: string | null;
  state: string | null;
};

type DbInvestorProfile = {
  company_name: string | null;
  investment_focus: string | null;
  min_ticket: number | string | null;
  max_ticket: number | string | null;
  website_url: string | null;
};

type DbProject = {
  id: string;
  title: string;
  summary: string | null;
  course_name: string | null;
  university: string | null;
  status: string;
};

function getProfileFallbackName(profile: DbProfile) {
  return profile.full_name?.trim() || profile.email;
}

function mapProjects(projects: DbProject[] | null): ProfileProject[] {
  return (projects ?? []).map((project) => ({
    id: project.id,
    title: project.title,
    subtitle:
      project.summary ??
      project.course_name ??
      project.university ??
      "Projeto publicado",
  }));
}

async function getProfileRow(profileId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      email,
      avatar_url,
      user_type,
      bio,
      phone,
      city,
      state,
      linkedin_url,
      github_url,
      portfolio_url
    `,
    )
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Perfil não encontrado para o usuário autenticado.");
  }

  return data as DbProfile;
}

async function getStudentProfileRow(profileId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("student_profiles")
    .select(
      `
      university,
      course_name,
      semester,
      academic_registration,
      headline,
      availability,
      academic_course_id,
      academic_courses (
        id,
        area_id,
        name
      ),
      focus_area,
      tools,
      languages,
      skills_summary
    `,
    )
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as DbStudentProfile | null;
}

async function getCompanyProfileRow(profileId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("companies")
    .select(
      "id, name, legal_name, cnpj, description, industry, website_url, logo_url, contact_email, contact_phone, city, state",
    )
    .eq("owner_id", profileId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as DbCompanyProfile | null;
}

async function getInvestorProfileRow(profileId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("investor_profiles")
    .select("company_name, investment_focus, min_ticket, max_ticket, website_url")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as DbInvestorProfile | null;
}

async function getOwnedProjects(profileId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("projects")
    .select("id, title, summary, course_name, university, status")
    .eq("owner_id", profileId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return mapProjects(data as DbProject[] | null);
}

export async function getCurrentProfile(profileId: string): Promise<ProfileUser> {
  const profile = await getProfileRow(profileId);
  const projects = await getOwnedProjects(profile.id);
  const name = getProfileFallbackName(profile);

  if (profile.user_type === "company") {
    const companyProfile = await getCompanyProfileRow(profile.id);

    return {
      id: profile.id,
      userType: "company",
      name: companyProfile?.name ?? name,
      companyName: companyProfile?.legal_name ?? companyProfile?.name ?? name,
      bio: companyProfile?.description ?? profile.bio ?? "",
      email: companyProfile?.contact_email ?? profile.email,
      phone: companyProfile?.contact_phone ?? profile.phone ?? "",
      cnpj: companyProfile?.cnpj ?? "",
      segment: companyProfile?.industry ?? "",
      city: companyProfile?.city ?? profile.city ?? "",
      state: companyProfile?.state ?? profile.state ?? "",
      avatarUrl: companyProfile?.logo_url ?? profile.avatar_url ?? "",
      openPositions: projects,
      links: {
        linkedin: profile.linkedin_url ?? "",
        portfolio: companyProfile?.website_url ?? profile.portfolio_url ?? "",
      },
    };
  }

  if (profile.user_type === "investor") {
    const investorProfile = await getInvestorProfileRow(profile.id);

    return {
      id: profile.id,
      userType: "investor",
      name,
      companyName: investorProfile?.company_name ?? "",
      bio: profile.bio ?? "",
      email: profile.email,
      phone: profile.phone ?? "",
      avatarUrl: profile.avatar_url ?? "",
      investmentFocus: investorProfile?.investment_focus ?? "",
      minTicket: formatTicketValue(investorProfile?.min_ticket),
      maxTicket: formatTicketValue(investorProfile?.max_ticket),
      links: {
        linkedin: profile.linkedin_url ?? "",
        portfolio: investorProfile?.website_url ?? profile.portfolio_url ?? "",
      },
    };
  }

  const studentProfile = await getStudentProfileRow(profile.id);

  return {
    id: profile.id,
    userType: "student",
    name,
    course: studentProfile?.academic_courses?.name ?? studentProfile?.course_name ?? "",
    academicCourseId: studentProfile?.academic_course_id ?? "",
    academicAreaId: studentProfile?.academic_courses?.area_id ?? "",
    bio: profile.bio ?? "",
    email: profile.email,
    phone: profile.phone ?? "",
    registration: studentProfile?.academic_registration ?? "",
    university: studentProfile?.university ?? "",
    semester: studentProfile?.semester ?? "",
    avatarUrl: profile.avatar_url ?? "",
    field: studentProfile?.focus_area ?? studentProfile?.headline ?? "",
    tools: studentProfile?.tools ?? "",
    languages: studentProfile?.languages ?? "",
    skills: studentProfile?.skills_summary ?? studentProfile?.availability ?? "",
    projects,
    links: {
      linkedin: profile.linkedin_url ?? "",
      github: profile.github_url ?? "",
      portfolio: profile.portfolio_url ?? "",
    },
  };
}

export async function saveProfile(profile: ProfileUser) {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: profile.name,
      email: profile.email,
      avatar_url: profile.avatarUrl || null,
      bio: profile.bio || null,
      phone: profile.phone || null,
      city: profile.userType === "company" ? profile.city || null : undefined,
      state: profile.userType === "company" ? profile.state || null : undefined,
      linkedin_url: profile.links.linkedin || null,
      github_url: profile.userType === "student" ? profile.links.github || null : undefined,
      portfolio_url: profile.links.portfolio || null,
      updated_at: now,
    })
    .eq("id", profile.id);

  if (profileError) {
    throw profileError;
  }

  if (profile.userType === "student") {
    const studentProfile = profile as StudentProfileUser;

    const { error: studentProfileError } = await supabase
      .from("student_profiles")
      .upsert(
        {
          profile_id: studentProfile.id,
          university: studentProfile.university || null,
          course_name: studentProfile.course || null,
          academic_course_id: studentProfile.academicCourseId || null,
          semester: studentProfile.semester || null,
          academic_registration: studentProfile.registration || null,
          focus_area: studentProfile.field || null,
          tools: studentProfile.tools || null,
          languages: studentProfile.languages || null,
          skills_summary: studentProfile.skills || null,
          updated_at: now,
        },
        { onConflict: "profile_id" },
      );

    if (studentProfileError) {
      throw studentProfileError;
    }
  }

  if (profile.userType === "company") {
    await saveCompanyProfile(profile as CompanyProfileUser, now);
  }

  if (profile.userType === "investor") {
    await saveInvestorProfile(profile as InvestorProfileUser, now);
  }

  return profile;
}

async function saveCompanyProfile(profile: CompanyProfileUser, now: string) {
  const supabase = getSupabaseClient();
  const companyProfile = await getCompanyProfileRow(profile.id);
  const payload = {
    name: profile.name,
    legal_name: profile.companyName || null,
    cnpj: profile.cnpj || null,
    description: profile.bio || null,
    industry: profile.segment || null,
    website_url: profile.links.portfolio || null,
    logo_url: profile.avatarUrl || null,
    contact_email: profile.email || null,
    contact_phone: profile.phone || null,
    city: profile.city || null,
    state: profile.state || null,
    owner_id: profile.id,
    updated_at: now,
  };

  if (companyProfile?.id) {
    const { error } = await supabase
      .from("companies")
      .update(payload)
      .eq("id", companyProfile.id);

    if (error) {
      throw error;
    }

    await ensureCompanyOwnerMembership(companyProfile.id, profile.id);
    return;
  }

  const { data, error } = await supabase
    .from("companies")
    .insert({ ...payload, created_at: now })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  await ensureCompanyOwnerMembership(String(data.id), profile.id);
}

async function saveInvestorProfile(profile: InvestorProfileUser, now: string) {
  const { error } = await getSupabaseClient()
    .from("investor_profiles")
    .upsert(
      {
        profile_id: profile.id,
        company_name: profile.companyName || null,
        investment_focus: profile.investmentFocus || null,
        min_ticket: parseTicketValue(profile.minTicket),
        max_ticket: parseTicketValue(profile.maxTicket),
        website_url: profile.links.portfolio || null,
        updated_at: now,
      },
      { onConflict: "profile_id" },
    );

  if (error) {
    throw error;
  }
}

async function ensureCompanyOwnerMembership(companyId: string, profileId: string) {
  const { error } = await getSupabaseClient()
    .from("company_members")
    .upsert(
      {
        company_id: companyId,
        profile_id: profileId,
        role: "owner",
      },
      { onConflict: "company_id,profile_id" },
    );

  if (error) {
    console.warn("Não foi possível vincular owner da empresa.", error.message);
  }
}

function formatTicketValue(value: DbInvestorProfile["min_ticket"] | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function parseTicketValue(value: string) {
  const normalizedValue = value.replace(/\./g, "").replace(",", ".").trim();

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export async function getAcademicAreaOptions(): Promise<AcademicAreaOption[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("academic_areas")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((area) => ({
    id: String(area.id),
    name: String(area.name),
  }));
}

export async function getAcademicCourseOptions(): Promise<AcademicCourseOption[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("academic_courses")
    .select("id, area_id, name")
    .eq("status", "approved")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((course) => ({
    id: String(course.id),
    areaId: String(course.area_id),
    name: String(course.name),
  }));
}

export async function getCareerTrackOptions(): Promise<CareerTrackOption[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("career_tracks")
    .select("id, area_id, name")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((track) => ({
    id: String(track.id),
    areaId: String(track.area_id),
    name: String(track.name),
  }));
}

export async function uploadProfileAvatar(
  profileId: string,
  image: AvatarUploadPayload,
) {
  const supabase = getSupabaseClient();

  const now = Date.now();
  const { fileExtension, contentType } = resolveAvatarMetadata(image);
  const arrayBuffer = await convertAvatarToArrayBuffer(image, contentType);

  const filePath = `${profileId}/avatar-${now}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(
      `Falha ao enviar imagem para o bucket '${AVATARS_BUCKET}' (status ${uploadError.statusCode ?? "n/a"}): ${uploadError.message}`,
    );
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(AVATARS_BUCKET)
    .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    throw new Error(
      `Imagem enviada, mas não foi possível gerar URL de acesso: ${signedUrlError?.message ?? "resposta inválida do storage"}`,
    );
  }

  const cacheKey = Date.now();
  const separator = signedUrlData.signedUrl.includes("?") ? "&" : "?";
  const persistedAvatarUrl = `${signedUrlData.signedUrl}${separator}updatedAt=${cacheKey}`;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      avatar_url: persistedAvatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (profileError) {
    throw profileError;
  }

  return persistedAvatarUrl;
}

export async function createDefaultProfileForAuthUser(params: {
  id: string;
  email: string;
  fullName: string;
  userType: UserType;
  cnpj?: string;
}) {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: params.id,
      full_name: params.fullName,
      email: params.email,
      user_type: params.userType,
      status: "active",
      created_at: now,
      updated_at: now,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw profileError;
  }

  if (params.userType === "student") {
    const { error: studentProfileError } = await supabase
      .from("student_profiles")
      .upsert(
        {
          profile_id: params.id,
          created_at: now,
          updated_at: now,
        },
        { onConflict: "profile_id" },
      );

    if (studentProfileError) {
      throw studentProfileError;
    }
  }

  if (params.userType === "company") {
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: params.fullName,
        legal_name: params.fullName,
        cnpj: params.cnpj || null,
        contact_email: params.email,
        owner_id: params.id,
        created_at: now,
        updated_at: now,
      })
      .select("id")
      .single();

    if (companyError) {
      throw companyError;
    }

    await ensureCompanyOwnerMembership(String(companyData.id), params.id);
  }

  if (params.userType === "investor") {
    const { error: investorProfileError } = await supabase
      .from("investor_profiles")
      .upsert(
        {
          profile_id: params.id,
          created_at: now,
          updated_at: now,
        },
        { onConflict: "profile_id" },
      );

    if (investorProfileError) {
      throw investorProfileError;
    }
  }
}

export type AuthProfile = {
  id: string;
  email: string;
  userType: UserType;
  name: string;
};

export async function getAuthProfile(profileId: string): Promise<AuthProfile> {
  const profile = await getProfileRow(profileId);

  return {
    id: profile.id,
    email: profile.email,
    userType: profile.user_type,
    name: getProfileFallbackName(profile),
  };
}
