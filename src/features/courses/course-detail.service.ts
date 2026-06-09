import { getSupabaseClient } from "@/shared/lib/supabase";

import type {
  CourseDetail,
  CourseDetailLesson,
  CourseDetailModule,
  CourseDetailSkill,
  CourseDetailTrack,
} from "./course-detail.types";

type DbCourse = {
  id: string;
  company_id: string | null;
  title: string;
  description: string;
  thumbnail_url: string | null;
  level: string;
  modality: string;
  workload_minutes: number;
  has_certificate: boolean;
  status: string;
};

type DbCompany = {
  id: string;
  name: string;
  logo_url: string | null;
};

type DbCourseEnrollment = {
  status: string;
  progress: number | string;
};

type DbCourseSkill = {
  skills: {
    id: string;
    name: string;
  } | null;
};

type DbCourseTrack = {
  career_tracks: {
    id: string;
    name: string;
  } | null;
};

type DbCourseModule = {
  id: string;
  title: string;
  description: string | null;
  position: number;
};

type DbLesson = {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  type: string;
  duration_minutes: number;
  position: number;
};

function normalizeModality(value: string) {
  const labels: Record<string, string> = {
    online: "Online",
    onsite: "Presencial",
    hybrid: "Híbrido",
  };

  return labels[value] ?? value;
}

function normalizeLevel(value: string) {
  const labels: Record<string, string> = {
    beginner: "Iniciante",
    intermediate: "Intermediário",
    advanced: "Avançado",
  };

  return labels[value] ?? value;
}

function formatWorkloadMinutes(value: number) {
  if (value <= 0) {
    return "Carga horária não informada";
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h${minutes}min`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}min`;
}

function mapLessonsByModuleId(lessons: DbLesson[]) {
  const lessonsByModuleId = new Map<string, CourseDetailLesson[]>();

  lessons.forEach((lesson) => {
    const currentLessons = lessonsByModuleId.get(lesson.module_id) ?? [];

    lessonsByModuleId.set(lesson.module_id, [
      ...currentLessons,
      {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        type: lesson.type,
        durationMinutes: lesson.duration_minutes,
        position: lesson.position,
      },
    ]);
  });

  return lessonsByModuleId;
}

async function getAuthenticatedProfileId() {
  const supabase = getSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user?.id) {
    throw new Error("Você precisa estar logado para continuar.");
  }

  return user.id;
}

async function getCourseCompany(companyId: string | null) {
  if (!companyId) {
    return null;
  }

  const { data, error } = await getSupabaseClient()
    .from("companies")
    .select("id, name, logo_url")
    .eq("id", companyId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as DbCompany | null;
}

async function getCourseSkills(courseId: string) {
  const { data, error } = await getSupabaseClient()
    .from("course_skills")
    .select(
      `
        skills (
          id,
          name
        )
      `,
    )
    .eq("course_id", courseId);

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as DbCourseSkill[])
    .map((item) => item.skills)
    .filter((skill): skill is CourseDetailSkill => Boolean(skill));
}

async function getCourseCareerTracks(courseId: string) {
  const { data, error } = await getSupabaseClient()
    .from("course_career_tracks")
    .select(
      `
        career_tracks (
          id,
          name
        )
      `,
    )
    .eq("course_id", courseId);

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as DbCourseTrack[])
    .map((item) => item.career_tracks)
    .filter((track): track is CourseDetailTrack => Boolean(track));
}

async function getCourseModules(courseId: string) {
  const { data: modulesData, error: modulesError } = await getSupabaseClient()
    .from("course_modules")
    .select("id, title, description, position")
    .eq("course_id", courseId)
    .order("position", { ascending: true });

  if (modulesError) {
    throw modulesError;
  }

  const modules = (modulesData ?? []) as DbCourseModule[];
  const moduleIds = modules.map((module) => module.id);

  if (moduleIds.length === 0) {
    return [];
  }

  const { data: lessonsData, error: lessonsError } = await getSupabaseClient()
    .from("lessons")
    .select("id, module_id, title, description, type, duration_minutes, position")
    .in("module_id", moduleIds)
    .order("position", { ascending: true });

  if (lessonsError) {
    throw lessonsError;
  }

  const lessonsByModuleId = mapLessonsByModuleId((lessonsData ?? []) as DbLesson[]);

  return modules.map<CourseDetailModule>((module) => ({
    id: module.id,
    title: module.title,
    description: module.description,
    position: module.position,
    lessons: lessonsByModuleId.get(module.id) ?? [],
  }));
}

async function getCourseEnrollment(courseId: string, profileId: string) {
  const { data, error } = await getSupabaseClient()
    .from("course_enrollments")
    .select("status, progress")
    .eq("course_id", courseId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const enrollment = data as DbCourseEnrollment | null;

  return {
    isEnrolled: Boolean(enrollment),
    status: enrollment?.status ?? null,
    progress: Number(enrollment?.progress ?? 0),
  };
}

export async function getCourseDetail(courseId: string): Promise<CourseDetail | null> {
  const profileId = await getAuthenticatedProfileId();
  const supabase = getSupabaseClient();

  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .select(
      "id, company_id, title, description, thumbnail_url, level, modality, workload_minutes, has_certificate, status",
    )
    .eq("id", courseId)
    .eq("status", "published")
    .maybeSingle();

  if (courseError) {
    throw courseError;
  }

  if (!courseData) {
    return null;
  }

  const course = courseData as DbCourse;
  const [company, skills, careerTracks, modules, enrollment] = await Promise.all([
    getCourseCompany(course.company_id),
    getCourseSkills(course.id),
    getCourseCareerTracks(course.id),
    getCourseModules(course.id),
    getCourseEnrollment(course.id, profileId),
  ]);

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    thumbnailUrl: course.thumbnail_url,
    modality: normalizeModality(course.modality),
    level: normalizeLevel(course.level),
    workloadLabel: formatWorkloadMinutes(course.workload_minutes),
    hasCertificate: course.has_certificate,
    priceLabel: "Gratuito",
    isFree: true,
    company: company
      ? {
          id: company.id,
          name: company.name,
          logoUrl: company.logo_url,
        }
      : null,
    skills,
    careerTracks,
    modules,
    enrollment,
  };
}

export async function enrollInCourse(courseId: string) {
  const profileId = await getAuthenticatedProfileId();
  const enrollment = await getCourseEnrollment(courseId, profileId);

  if (enrollment.isEnrolled) {
    return enrollment;
  }

  const { error } = await getSupabaseClient().from("course_enrollments").insert({
    course_id: courseId,
    profile_id: profileId,
  });

  if (error) {
    throw error;
  }

  return {
    isEnrolled: true,
    status: "in_progress",
    progress: 0,
  };
}

export async function unenrollFromCourse(courseId: string) {
  const supabase = getSupabaseClient();

  const profileId = await getAuthenticatedProfileId();

  if (!profileId) {
    throw new Error("Perfil do usuário não encontrado.");
  }

  const { error } = await supabase
    .from("course_enrollments")
    .delete()
    .eq("course_id", courseId)
    .eq("profile_id", profileId);

  if (error) {
    throw error;
  }
}