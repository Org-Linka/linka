import { getSupabaseClient } from "@/shared/lib/supabase";

import type { UserType } from "@/features/auth/auth.types";
import type {
  CompanyProfileUser,
  ProfileProject,
  ProfileUser,
  StudentProfileUser,
} from "./profile.types";

type DbProfile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  user_type: UserType;
  bio: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
};

type DbStudentProfile = {
  university: string | null;
  course_name: string | null;
  semester: string | null;
  academic_registration: string | null;
  headline: string | null;
  availability: string | null;
  focus_area?: string | null;
  tools?: string | null;
  languages?: string | null;
  skills_summary?: string | null;
};

type DbProject = {
  id: string;
  title: string;
  summary: string | null;
  course_name: string | null;
  university: string | null;
  status: string;
};

function getProfileFallbackName(profile: DbProfile) {
  return profile.full_name?.trim() || profile.email;
}

function mapProjects(projects: DbProject[] | null): ProfileProject[] {
  return (projects ?? []).map((project) => ({
    id: project.id,
    title: project.title,
    subtitle:
      project.summary ??
      project.course_name ??
      project.university ??
      "Projeto publicado",
  }));
}

async function getProfileRow(profileId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      email,
      avatar_url,
      user_type,
      bio,
      phone,
      city,
      state,
      linkedin_url,
      github_url,
      portfolio_url
    `,
    )
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Perfil não encontrado para o usuário autenticado.");
  }

  return data as DbProfile;
}

async function getStudentProfileRow(profileId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("student_profiles")
    .select(
      `
      university,
      course_name,
      semester,
      academic_registration,
      headline,
      availability,
      focus_area,
      tools,
      languages,
      skills_summary
    `,
    )
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as DbStudentProfile | null;
}

async function getOwnedProjects(profileId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("projects")
    .select("id, title, summary, course_name, university, status")
    .eq("owner_id", profileId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return mapProjects(data as DbProject[] | null);
}

export async function getCurrentProfile(profileId: string): Promise<ProfileUser> {
  const profile = await getProfileRow(profileId);
  const projects = await getOwnedProjects(profile.id);
  const name = getProfileFallbackName(profile);

  if (profile.user_type === "company") {
    return {
      id: profile.id,
      userType: "company",
      name,
      companyName: name,
      bio: profile.bio ?? "",
      email: profile.email,
      phone: profile.phone ?? "",
      cnpj: "",
      segment: "",
      city: profile.city ?? "",
      state: profile.state ?? "",
      avatarUrl: profile.avatar_url ?? "",
      openPositions: projects,
      links: {
        linkedin: profile.linkedin_url ?? "",
        portfolio: profile.portfolio_url ?? "",
      },
    };
  }

  const studentProfile = await getStudentProfileRow(profile.id);

  return {
    id: profile.id,
    userType: "student",
    name,
    course: studentProfile?.course_name ?? "",
    bio: profile.bio ?? "",
    email: profile.email,
    phone: profile.phone ?? "",
    registration: studentProfile?.academic_registration ?? "",
    university: studentProfile?.university ?? "",
    semester: studentProfile?.semester ?? "",
    avatarUrl: profile.avatar_url ?? "",
    field: studentProfile?.focus_area ?? studentProfile?.headline ?? "",
    tools: studentProfile?.tools ?? "",
    languages: studentProfile?.languages ?? "",
    skills: studentProfile?.skills_summary ?? studentProfile?.availability ?? "",
    projects,
    links: {
      linkedin: profile.linkedin_url ?? "",
      github: profile.github_url ?? "",
      portfolio: profile.portfolio_url ?? "",
    },
  };
}

export async function saveProfile(profile: ProfileUser) {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: profile.name,
      email: profile.email,
      avatar_url: profile.avatarUrl || null,
      bio: profile.bio || null,
      phone: profile.phone || null,
      city: profile.userType === "company" ? profile.city || null : undefined,
      state: profile.userType === "company" ? profile.state || null : undefined,
      linkedin_url: profile.links.linkedin || null,
      github_url: profile.userType === "student" ? profile.links.github || null : undefined,
      portfolio_url: profile.links.portfolio || null,
      updated_at: now,
    })
    .eq("id", profile.id);

  if (profileError) {
    throw profileError;
  }

  if (profile.userType === "student") {
    const studentProfile = profile as StudentProfileUser;

    const { error: studentProfileError } = await supabase
      .from("student_profiles")
      .upsert(
        {
          profile_id: studentProfile.id,
          university: studentProfile.university || null,
          course_name: studentProfile.course || null,
          semester: studentProfile.semester || null,
          academic_registration: studentProfile.registration || null,
          focus_area: studentProfile.field || null,
          tools: studentProfile.tools || null,
          languages: studentProfile.languages || null,
          skills_summary: studentProfile.skills || null,
          updated_at: now,
        },
        { onConflict: "profile_id" },
      );

    if (studentProfileError) {
      throw studentProfileError;
    }
  }

  return profile;
}

export async function uploadProfileAvatar(profileId: string, imageUri: string) {
  const supabase = getSupabaseClient();

  const extensionFromUri = imageUri
    .split("?")[0]
    .split(".")
    .pop()
    ?.toLowerCase();

  const fileExtension = extensionFromUri && extensionFromUri.length <= 5
    ? extensionFromUri
    : "jpg";

  const contentType =
    fileExtension === "png"
      ? "image/png"
      : fileExtension === "webp"
        ? "image/webp"
        : "image/jpeg";

  const filePath = `${profileId}/avatar.${fileExtension}`;
  const response = await fetch(imageUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
  const publicUrl = `${data.publicUrl}?updatedAt=${Date.now()}`;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (profileError) {
    throw profileError;
  }

  return publicUrl;
}

export async function createDefaultProfileForAuthUser(params: {
  id: string;
  email: string;
  fullName: string;
  userType: UserType;
}) {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: params.id,
      full_name: params.fullName,
      email: params.email,
      user_type: params.userType,
      status: "active",
      created_at: now,
      updated_at: now,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw profileError;
  }

  if (params.userType === "student") {
    const { error: studentProfileError } = await supabase
      .from("student_profiles")
      .upsert(
        {
          profile_id: params.id,
          created_at: now,
          updated_at: now,
        },
        { onConflict: "profile_id" },
      );

    if (studentProfileError) {
      throw studentProfileError;
    }
  }
}

export type AuthProfile = {
  id: string;
  email: string;
  userType: UserType;
  name: string;
};

export async function getAuthProfile(profileId: string): Promise<AuthProfile> {
  const profile = await getProfileRow(profileId);

  return {
    id: profile.id,
    email: profile.email,
    userType: profile.user_type,
    name: getProfileFallbackName(profile),
  };
}
