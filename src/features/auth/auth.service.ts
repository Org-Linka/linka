import { getSupabaseClient } from "@/shared/lib/supabase";
import { createDefaultProfileForAuthUser } from "@/features/profile/profile.service";

import type { LoginForm, RegisterForm, ResetPasswordForm, UserType } from "./auth.types";

export function buildLoginPayload(form: LoginForm, userType: UserType) {
  if (userType !== "company") {
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
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email: form.email,
    password: form.senha,
    options: {
      data: {
        full_name: form.nome,
        user_type: form.userType,
        cnpj: form.userType === "company" ? form.cnpj : undefined,
      },
    },
  });

  if (error) {
    throw error;
  }

  const authUser = data.user;

  if (!authUser) {
    throw new Error("Usuário não retornado pelo Supabase.");
  }

  await createDefaultProfileForAuthUser({
    id: authUser.id,
    email: authUser.email ?? form.email,
    fullName: form.nome,
    userType: form.userType,
    cnpj: form.userType === "company" ? form.cnpj : undefined,
  });

  return data;
}

export async function signInWithEmail(form: LoginForm) {
  const supabase = getSupabaseClient();

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
  const supabase = getSupabaseClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function sendResetPasswordEmail(
  form: Pick<ResetPasswordForm, "email">,
) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(form.email);

  if (error) {
    throw error;
  }

  return data;
}

export async function sendPasswordResetOtp(
  form: Pick<ResetPasswordForm, "email">,
) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithOtp({
    email: form.email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function verifyPasswordResetOtp(
  form: Pick<ResetPasswordForm, "email"> & { token: string },
) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email: form.email,
    token: form.token,
    type: "email",
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function updatePassword(form: ResetPasswordForm) {
  if (form.novaSenha !== form.confirmarSenha) {
    throw new Error("As senhas não conferem.");
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.updateUser({
    password: form.novaSenha,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function getCurrentSession() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getCurrentUser() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}
