import type { LoginForm, RegisterForm, ResetPasswordForm, UserType } from "./auth.types";

export function isValidLoginPayload(form: LoginForm, userType: UserType) {
  if (!form.senha.trim()) return false;
  return userType === "company" ? Boolean(form.cnpj.trim()) : Boolean(form.email.trim());
}

export function isValidRegisterPayload(form: RegisterForm) {
  return Boolean(form.nome.trim() && form.email.trim() && form.senha.trim());
}

export function isValidResetPasswordPayload(form: ResetPasswordForm) {
  return Boolean(form.email.trim() && form.novaSenha.trim() && form.confirmarSenha.trim());
}
