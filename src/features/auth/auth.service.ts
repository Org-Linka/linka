import type { LoginForm, RegisterForm, ResetPasswordForm, UserType } from "./auth.types";

export function buildLoginPayload(form: LoginForm, userType: UserType) {
  if (userType === "aluno") {
    return { tipo: userType, email: form.email, senha: form.senha };
  }

  return {
    tipo: userType,
    email: form.email,
    senha: form.senha,
    cnpj: form.cnpj,
    id: form.idEmpresa,
  };
}

export function buildRegisterPayload(form: RegisterForm) {
  return form;
}

export function buildResetPasswordPayload(form: ResetPasswordForm) {
  return form;
}
