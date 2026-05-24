import type { ComponentProps } from "react";
import type { ImageSourcePropType } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export type FontAwesomeName = ComponentProps<typeof FontAwesome>["name"];

export type Member = {
  id: number;
  nome: string;
  descricao: string;
  descricaoCompleta: string;
  foto: ImageSourcePropType;
  linkedin: string;
  github: string;
  portfolio: string;
};

export type ProjectFeature = {
  icon: FontAwesomeName;
  title: string;
  desc: string;
};
