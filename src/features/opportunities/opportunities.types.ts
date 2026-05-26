export type CatalogItemType = "course" | "event";

export type CourseModality = "online" | "onsite" | "hybrid";

export type EventModality = "remote" | "onsite" | "hybrid";

export type CatalogModalityFilter = "all" | "online" | "onsite" | "hybrid";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type CatalogTypeFilter = "all" | CatalogItemType;

export type CatalogPriceFilter = "all" | "free" | "paid";

export type CatalogFilters = {
  type: CatalogTypeFilter;
  modality: CatalogModalityFilter;
  price: CatalogPriceFilter;
  careerTrackId: "all" | string;
  search: string;
};

export type CareerTrackOption = {
  id: string;
  name: string;
};

export type CatalogItem = {
  id: string;
  type: CatalogItemType;
  title: string;
  description: string | null;
  companyName: string;
  companyLogoUrl: string | null;
  imageUrl: string | null;
  modality: string | null;
  modalityKey: Exclude<CatalogModalityFilter, "all"> | null;
  isFree: boolean;
  price: number | null;
  priceLabel: string;
  dateLabel: string | null;
  workloadLabel: string | null;
  level: string | null;
  careerTrackIds: string[];
  publishedAt: string | null;
};

export type CatalogData = {
  items: CatalogItem[];
  careerTracks: CareerTrackOption[];
};

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  type: "all",
  modality: "all",
  price: "all",
  careerTrackId: "all",
  search: "",
};
