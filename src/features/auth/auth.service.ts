import { supabase } from "@/shared/lib/supabase";

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

export async function signUpWithEmail(form: RegisterForm) {
  const { data, error } = await supabase.auth.signUp({
    email: form.email,
    password: form.senha,
    options: {
      data: {
        full_name: form.nome,
        user_type: "student",
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithEmail(form: LoginForm) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.senha,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function sendResetPasswordEmail(form: Pick<ResetPasswordForm, "email">) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(form.email);

  if (error) {
    throw error;
  }

  return data;
}

export async function updatePassword(form: ResetPasswordForm) {
  if (form.novaSenha !== form.confirmarSenha) {
    throw new Error("As senhas não conferem.");
  }

  const { data, error } = await supabase.auth.updateUser({
    password: form.novaSenha,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}