import type { ComponentProps, ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";

export type IoniconsName = ComponentProps<typeof Ionicons>["name"];

export type ProfileLinkKey = "linkedin" | "github" | "portfolio";

export type ProfileLinks = Record<ProfileLinkKey, string>;

export type AcademicAreaOption = {
  id: string;
  name: string;
};

export type AcademicCourseOption = {
  id: string;
  areaId: string;
  name: string;
};

export type CareerTrackOption = {
  id: string;
  areaId: string;
  name: string;
};

export type ProfileProject = {
  id: string;
  title: string;
  subtitle: string;
};

export type StudentProfileUser = {
  id: string;
  userType: "student";
  name: string;
  course: string;
  academicCourseId: string;
  academicAreaId: string;
  bio: string;
  email: string;
  phone: string;
  registration: string;
  university: string;
  semester: string;
  avatarUrl: string;
  field: string;
  tools: string;
  languages: string;
  skills: string;
  projects: ProfileProject[];
  links: ProfileLinks;
};

export type CompanyProfileUser = {
  id: string;
  userType: "company";
  name: string;
  companyName: string;
  bio: string;
  email: string;
  phone: string;
  cnpj: string;
  segment: string;
  city: string;
  state: string;
  avatarUrl: string;
  openPositions: ProfileProject[];
  links: Omit<ProfileLinks, "github">;
};

export type ProfileUser = StudentProfileUser | CompanyProfileUser;

export type InfoCardProps = {
  title: string;
  icon: IoniconsName;
  children: ReactNode;
  onEdit?: () => void;
};

export type InfoRowProps = {
  label: string;
  value: string;
  isLast?: boolean;
  isAction?: boolean;
  statusColor?: string;
};

export type LinkRowProps = {
  label: string;
  icon: IoniconsName;
  url: string;
  isLast?: boolean;
};

export type ProjectSectionProps = {
  projects: ProfileProject[];
  title?: string;
  icon?: IoniconsName;
  emptyMessage?: string;
};

export type StudentPersonalForm = {
  name: string;
  bio: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
};

export type StudentAcademicForm = {
  university: string;
  academicAreaId: string;
  academicCourseId: string;
  course: string;
  semester: string;
};

export type StudentSkillsForm = {
  field: string;
  tools: string;
  languages: string;
  skills: string;
};

export type CompanyForm = {
  name: string;
  companyName: string;
  bio: string;
  email: string;
  phone: string;
  cnpj: string;
  segment: string;
  city: string;
  state: string;
  linkedin: string;
  portfolio: string;
};
