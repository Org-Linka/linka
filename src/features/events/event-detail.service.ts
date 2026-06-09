import { getSupabaseClient } from "@/shared/lib/supabase";

import type {
  EventDetail,
  EventDetailCategory,
  EventDetailTrack,
} from "./event-detail.types";

type DbEvent = {
  id: string;
  company_id: string | null;
  category_id: string | null;
  title: string;
  description: string;
  cover_url: string | null;
  location: string | null;
  modality: string;
  price: number | string;
  status: string;
  starts_at: string;
  ends_at: string | null;
};

type DbCompany = {
  id: string;
  name: string;
  logo_url: string | null;
};

type DbEventParticipant = {
  status: string;
};

type DbEventTrack = {
  career_tracks: {
    id: string;
    name: string;
  } | null;
};

function normalizeModality(value: string) {
  const labels: Record<string, string> = {
    remote: "Online",
    onsite: "Presencial",
    hybrid: "Híbrido",
  };

  return labels[value] ?? value;
}

function formatCurrency(value: number) {
  if (value <= 0) {
    return "Gratuito";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function getAuthenticatedProfileId() {
  const supabase = getSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user?.id) {
    throw new Error("Você precisa estar logado para continuar.");
  }

  return user.id;
}

async function getEventCompany(companyId: string | null) {
  if (!companyId) {
    return null;
  }

  const { data, error } = await getSupabaseClient()
    .from("companies")
    .select("id, name, logo_url")
    .eq("id", companyId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as DbCompany | null;
}

async function getEventCategory(categoryId: string | null) {
  if (!categoryId) {
    return null;
  }

  const { data, error } = await getSupabaseClient()
    .from("event_categories")
    .select("id, name, description")
    .eq("id", categoryId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as EventDetailCategory | null;
}

async function getEventCareerTracks(eventId: string) {
  const { data, error } = await getSupabaseClient()
    .from("event_career_tracks")
    .select(
      `
        career_tracks (
          id,
          name
        )
      `,
    )
    .eq("event_id", eventId);

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as DbEventTrack[])
    .map((item) => item.career_tracks)
    .filter((track): track is EventDetailTrack => Boolean(track));
}

async function getEventParticipant(eventId: string, profileId: string) {
  const { data, error } = await getSupabaseClient()
    .from("event_participants")
    .select("status")
    .eq("event_id", eventId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const participant = data as DbEventParticipant | null;

  return {
    isRegistered: Boolean(participant),
    status: participant?.status ?? null,
  };
}

export async function getEventDetail(eventId: string): Promise<EventDetail | null> {
  const profileId = await getAuthenticatedProfileId();
  const supabase = getSupabaseClient();

  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select(
      "id, company_id, category_id, title, description, cover_url, location, modality, price, status, starts_at, ends_at",
    )
    .eq("id", eventId)
    .eq("status", "published")
    .maybeSingle();

  if (eventError) {
    throw eventError;
  }

  if (!eventData) {
    return null;
  }

  const event = eventData as DbEvent;
  const price = Number(event.price ?? 0);

  const [company, category, careerTracks, participant] = await Promise.all([
    getEventCompany(event.company_id),
    getEventCategory(event.category_id),
    getEventCareerTracks(event.id),
    getEventParticipant(event.id, profileId),
  ]);

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    coverUrl: event.cover_url,
    modality: normalizeModality(event.modality),
    location: event.location,
    price,
    priceLabel: formatCurrency(price),
    isFree: price <= 0,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    startsAtLabel: formatDateTime(event.starts_at) ?? "Data não informada",
    endsAtLabel: formatDateTime(event.ends_at),
    company: company
      ? {
          id: company.id,
          name: company.name,
          logoUrl: company.logo_url,
        }
      : null,
    category,
    careerTracks,
    participant,
  };
}

export async function registerInEvent(eventId: string) {
  const profileId = await getAuthenticatedProfileId();
  const participant = await getEventParticipant(eventId, profileId);

  if (participant.isRegistered) {
    return participant;
  }

  const { data: eventData, error: eventError } = await getSupabaseClient()
    .from("events")
    .select("price")
    .eq("id", eventId)
    .eq("status", "published")
    .maybeSingle();

  if (eventError) {
    throw eventError;
  }

  const eventPrice = Number(eventData?.price ?? 0);

  if (eventPrice > 0) {
    throw new Error(
      "Este evento é pago. O fluxo de pagamento será implementado em uma issue separada.",
    );
  }

  const { error } = await getSupabaseClient().from("event_participants").insert({
    event_id: eventId,
    profile_id: profileId,
  });

  if (error) {
    throw error;
  }

  return {
    isRegistered: true,
    status: "registered",
  };
}

export async function unregisterFromEvent(eventId: string) {
  const supabase = getSupabaseClient();

  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    throw new Error("Perfil do usuário não encontrado.");
  }

  const { error } = await supabase
    .from("event_participants")
    .delete()
    .eq("event_id", eventId)
    .eq("profile_id", profileId);

  if (error) {
    throw error;
  }
}