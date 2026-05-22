import type { LoginForm, RegisterForm, ResetPasswordForm, UserType } from "./auth.types";

export function isValidLoginPayload(form: LoginForm, userType: UserType) {
  if (!form.senha.trim()) return false;

  return userType === "company"
    ? Boolean(form.cnpj.trim())
    : Boolean(form.email.trim());
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
