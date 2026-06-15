export type EventDetailCompany = {
  id: string;
  name: string;
  logoUrl: string | null;
};

export type EventDetailCategory = {
  id: string;
  name: string;
  description: string | null;
};

export type EventDetailTrack = {
  id: string;
  name: string;
};

export type EventParticipantStatus = "registered" | "cancelled" | "attended" | string;

export type EventParticipantState = {
  isRegistered: boolean;
  status: EventParticipantStatus | null;
};

export type EventDetail = {
  id: string;
  title: string;
  description: string;
  coverUrl: string | null;
  modality: string;
  location: string | null;
  price: number;
  priceLabel: string;
  isFree: boolean;
  startsAt: string;
  endsAt: string | null;
  startsAtLabel: string;
  endsAtLabel: string | null;
  company: EventDetailCompany | null;
  category: EventDetailCategory | null;
  careerTracks: EventDetailTrack[];
  participant: EventParticipantState;
};
