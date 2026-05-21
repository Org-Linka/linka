type BorderRadiusKey = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full";

const borderRadiusStyles: Record<BorderRadiusKey, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export { borderRadiusStyles };
export type { BorderRadiusKey };
