import type { ComponentProps, ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";

export type IoniconsName = ComponentProps<typeof Ionicons>["name"];

export type ProfileUser = {
  name: string;
  course: string;
  email: string;
  phone: string;
  registration: string;
  university: string;
  semester: string;
  avatarUrl: string;
};

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
