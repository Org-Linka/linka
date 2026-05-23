import type { LoginForm, RegisterForm, ResetPasswordForm } from "./auth.types";

export function isValidLoginPayload(form: LoginForm) {
  return Boolean(form.email.trim() && form.senha.trim());
}

export function isValidRegisterPayload(form: RegisterForm) {
  const hasBaseFields = Boolean(
    form.nome.trim() && form.email.trim() && form.senha.trim(),
  );

  if (!hasBaseFields) {
    return false;
  }

  if (form.userType === "company") {
    return Boolean(form.cnpj.trim());
  }

  return true;
}

export function isValidResetPasswordPayload(form: ResetPasswordForm) {
  return Boolean(form.email.trim() && form.novaSenha.trim() && form.confirmarSenha.trim());
}