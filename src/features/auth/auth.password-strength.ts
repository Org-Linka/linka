export type PasswordStrengthLevel =
  | "very-weak"
  | "fair"
  | "good"
  | "excellent";

export type PasswordStrength = {
  level: PasswordStrengthLevel;
  label: string;
  percentage: number;
  color: string;
};

const PASSWORD_STRENGTH_CONFIG: Record<
  PasswordStrengthLevel,
  Pick<PasswordStrength, "label" | "percentage" | "color">
> = {
  "very-weak": {
    label: "Senha ruim",
    percentage: 25,
    color: "#7f1d1d",
  },
  fair: {
    label: "Senha razoável",
    percentage: 50,
    color: "#9a3412",
  },
  good: {
    label: "Senha boa",
    percentage: 75,
    color: "#14532d",
  },
  excellent: {
    label: "Senha excelente",
    percentage: 100,
    color: "#065f46",
  },
};

export function getPasswordStrength(password: string): PasswordStrength | null {
  const value = password.trim();

  if (!value) {
    return null;
  }

  let score = 0;

  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^a-zA-Z0-9]/.test(value)) score += 1;

  let level: PasswordStrengthLevel = "very-weak";

  if (score >= 5) {
    level = "excellent";
  } else if (score >= 3) {
    level = "good";
  } else if (score >= 2) {
    level = "fair";
  }

  const config = PASSWORD_STRENGTH_CONFIG[level];

  return {
    level,
    label: config.label,
    percentage: config.percentage,
    color: config.color,
  };
}
