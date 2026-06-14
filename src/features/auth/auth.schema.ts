import { z } from "zod";

import type { LoginForm, RegisterForm, ResetPasswordForm } from "./auth.types";

const requiredString = z.string().trim().min(1);

export const loginSchema = z.object({
  email: requiredString.email("Informe um e-mail válido."),
  senha: requiredString,
});

export const registerSchema = z
  .object({
    nome: requiredString,
    email: requiredString.email("Informe um e-mail válido."),
    senha: requiredString,
    userType: z.enum(["student", "company", "investor"]),
    cnpj: z.string().trim().optional(),
  })
  .superRefine((form, ctx) => {
    if (form.userType === "company" && !form.cnpj?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["cnpj"],
        message: "Informe o CNPJ da empresa.",
      });
    }
  });

export const resetPasswordSchema = z
  .object({
    email: requiredString.email("Informe um e-mail válido."),
    novaSenha: z
      .string()
      .trim()
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
      .max(32, "A senha deve ter no máximo 32 caracteres.")
      .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
      .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
      .regex(/[0-9]/, "A senha deve conter pelo menos um número.")
      .regex(
        /[^A-Za-z0-9]/,
        "A senha deve conter pelo menos um caractere especial.",
      ),
    confirmarSenha: z.string().trim().min(1, "Confirme sua nova senha."),
  })
  .superRefine((form, ctx) => {
    if (form.novaSenha !== form.confirmarSenha) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmarSenha"],
        message: "As senhas não coincidem.",
      });
    }
  });

export function getResetPasswordValidationError(form: ResetPasswordForm) {
  const result = resetPasswordSchema.safeParse(form);

  if (result.success) {
    return null;
  }

  return result.error.issues[0]?.message ?? "Verifique os campos informados.";
}

export function isValidLoginPayload(form: LoginForm) {
  return loginSchema.safeParse(form).success;
}

export function isValidRegisterPayload(form: RegisterForm) {
  return registerSchema.safeParse(form).success;
}

export function isValidResetPasswordPayload(form: ResetPasswordForm) {
  return resetPasswordSchema.safeParse(form).success;
}