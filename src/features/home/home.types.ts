import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

export type IoniconsName = ComponentProps<typeof Ionicons>["name"];

export type HomeCategory = {
  id: string;
  nome: string;
  icone: IoniconsName;
};

export type HomeHighlight = {
  id: string;
  titulo: string;
  local: string;
  data: string;
};
