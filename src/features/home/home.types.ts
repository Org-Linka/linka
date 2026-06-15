import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type HomeCategoryTarget = "courses" | "events" | "projects" | "payments";

export type HomeCategory = {
  id: string;
  nome: string;
  icone: ComponentProps<typeof Ionicons>["name"];
  target: HomeCategoryTarget;
};

export type HomeHighlight = {
  id: string;
  titulo: string;
  local: string;
  data: string;
};

export type HomeCourse = {
  id: string;
  title: string;
  description: string | null;
  companyName: string;
  imageUrl: string | null;
  modality: string;
  level: string;
  workloadLabel: string | null;
  hasCertificate: boolean;
};

export type HomeEvent = {
  id: string;
  title: string;
  description: string | null;
  companyName: string;
  imageUrl: string | null;
  modality: string;
  location: string | null;
  priceLabel: string;
  startsAtLabel: string | null;
};

export type StudentHomeData = {
  courses: HomeCourse[];
  events: HomeEvent[];
};