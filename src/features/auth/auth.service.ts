import { getSupabaseClient } from "@/shared/lib/supabase";

import type { LoginForm, RegisterForm, ResetPasswordForm, UserType } from "./auth.types";

export function buildLoginPayload(form: LoginForm, userType: UserType) {
  if (userType === "student") {
    return { tipo: userType, email: form.email, senha: form.senha };
  }

  return {
    tipo: userType,
    cnpj: form.cnpj,
    senha: form.senha,
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

  if (!data.user) {
    throw new Error("Usuário não foi criado.");
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    full_name: form.nome,
    email: form.email,
    user_type: form.userType,
  });

  if (profileError) {
    throw profileError;
  }

  if (form.userType === "company") {
    const { error: companyError } = await supabase.from("companies").insert({
      name: form.nome,
      cnpj: form.cnpj,
      contact_email: form.email,
      owner_id: data.user.id,
    });

    if (companyError) {
      throw companyError;
    }
  }

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

export async function signInCompanyWithCnpj(
  form: Pick<LoginForm, "cnpj" | "senha">,
) {
  const supabase = getSupabaseClient();

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("contact_email")
    .eq("cnpj", form.cnpj)
    .maybeSingle();

  if (companyError) {
    throw companyError;
  }

  if (!company?.contact_email) {
    throw new Error("Empresa não encontrada para o CNPJ informado.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: company.contact_email,
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