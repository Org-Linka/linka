import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type HomeCategory = {
  id: string;
  nome: string;
  icone: ComponentProps<typeof Ionicons>["name"];
};

export type HomeHighlight = {
  id: string;
  titulo: string;
  local: string;
  data: string;
  imagem: any;
};