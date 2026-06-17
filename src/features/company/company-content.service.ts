import { File as ExpoFile } from "expo-file-system";
import { Platform } from "react-native";

import { getSupabaseClient } from "@/shared/lib/supabase";

export type CourseModality = "online" | "onsite" | "hybrid";
export type EventModality = "remote" | "onsite" | "hybrid";
export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type CreateCompanyCourseInput = {
  title: string;
  description: string;
  modality: CourseModality;
  level: CourseLevel;
  workloadMinutes: number;
  hasCertificate: boolean;
  price: number;
  thumbnailUrl: string | null;
  thumbnailBase64?: string | null;
  thumbnailMimeType: string | null;
};

export type CreateCompanyEventInput = {
  title: string;
  description: string;
  location: string;
  modality: EventModality;
  startsAt: string;
  endsAt: string;
  price: number;
  coverUrl: string | null;
  coverBase64?: string | null;
  coverMimeType: string | null;
};

type CompanyContext = {
  profileId: string;
  companyId: string;
};


const COMPANY_CONTENT_MEDIA_BUCKET =
  process.env.EXPO_PUBLIC_SUPABASE_COMPANY_CONTENT_BUCKET?.trim() ||
  "company-content-media";

function getImageFileExtension(mimeType: string | null) {
  if (mimeType?.includes("png")) return "png";
  if (mimeType?.includes("gif")) return "gif";
  if (mimeType?.includes("webp")) return "webp";

  return "jpg";
}

function getImageContentType(mimeType: string | null) {
  if (mimeType?.startsWith("image/")) {
    return mimeType;
  }

  return "image/jpeg";
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

async function convertImageToArrayBuffer(params: {
  imageUri: string;
  base64?: string | null;
  contentType: string;
}) {
  if (params.base64) {
    try {
      const arrayBuffer = decodeBase64ToArrayBuffer(params.base64);

      if (arrayBuffer) {
        return arrayBuffer;
      }
    } catch {
      // Continua para os fallbacks por URI abaixo.
    }
  }

  if (Platform.OS !== "web") {
    try {
      const file = new ExpoFile(params.imageUri);
      return await file.arrayBuffer();
    } catch {
      // fallback abaixo para manter compatibilidade em casos específicos de URI
    }
  }

  if (params.base64) {
    try {
      const base64Response = await fetch(
        `data:${params.contentType};base64,${normalizeBase64Payload(params.base64)}`,
      );

      if (base64Response.ok) {
        return base64Response.arrayBuffer();
      }
    } catch {
      // O URI ainda pode estar disponível mesmo quando data URLs falham.
    }
  }

  const response = await fetch(params.imageUri);

  if (!response.ok) {
    throw new Error("Não foi possível ler a imagem selecionada.");
  }

  return response.arrayBuffer();
}

async function uploadCompanyContentImage(params: {
  ownerId: string;
  imageUri: string | null;
  base64?: string | null;
  mimeType: string | null;
  folder: "courses" | "events";
}) {
  const imageUri = params.imageUri?.trim();

  if (!imageUri) {
    return null;
  }

  if (imageUri.startsWith("http://") || imageUri.startsWith("https://")) {
    return imageUri;
  }

  const supabase = getSupabaseClient();
  const extension = getImageFileExtension(params.mimeType);
  const contentType = getImageContentType(params.mimeType);
  const filePath = `${params.ownerId}/${params.folder}/${Date.now()}.${extension}`;
  const fileBuffer = await convertImageToArrayBuffer({
    imageUri,
    base64: params.base64,
    contentType,
  });

  const { error } = await supabase.storage
    .from(COMPANY_CONTENT_MEDIA_BUCKET)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return filePath;
}

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
    .select("id, user_type, full_name, email")
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

  if (company?.id) {
    return {
      profileId: user.id,
      companyId: String(company.id),
    };
  }

  const now = new Date().toISOString();
  const companyName =
    profile.full_name?.trim() || profile.email || user.email || "Empresa";

  const { data: createdCompany, error: createCompanyError } = await supabase
    .from("companies")
    .insert({
      owner_id: user.id,
      name: companyName,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (createCompanyError) {
    throw createCompanyError;
  }

  return {
    profileId: user.id,
    companyId: String(createdCompany.id),
  };
}

export async function createCompanyCourse(input: CreateCompanyCourseInput) {
  const supabase = getSupabaseClient();
  const { profileId, companyId } = await getAuthenticatedCompanyContext();
  const now = new Date().toISOString();
  const thumbnailUrl = await uploadCompanyContentImage({
    ownerId: profileId,
    imageUri: input.thumbnailUrl,
    base64: input.thumbnailBase64,
    mimeType: input.thumbnailMimeType,
    folder: "courses",
  });

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
      thumbnail_url: thumbnailUrl,
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
  };
}

export async function createCompanyEvent(input: CreateCompanyEventInput) {
  const supabase = getSupabaseClient();
  const { profileId, companyId } = await getAuthenticatedCompanyContext();
  const now = new Date().toISOString();
  const coverUrl = await uploadCompanyContentImage({
    ownerId: profileId,
    imageUri: input.coverUrl,
    base64: input.coverBase64,
    mimeType: input.coverMimeType,
    folder: "events",
  });

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
      cover_url: coverUrl,
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
  };
}
