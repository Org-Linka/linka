export type CourseDetailCompany = {
  id: string;
  name: string;
  logoUrl: string | null;
};

export type CourseDetailSkill = {
  id: string;
  name: string;
};

export type CourseDetailTrack = {
  id: string;
  name: string;
};

export type CourseDetailLesson = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  durationMinutes: number;
  position: number;
};

export type CourseDetailModule = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  lessons: CourseDetailLesson[];
};

export type CourseEnrollmentStatus = "in_progress" | "completed" | string;

export type CourseEnrollmentState = {
  isEnrolled: boolean;
  status: CourseEnrollmentStatus | null;
  progress: number;
};

export type CourseDetail = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  modality: string;
  level: string;
  workloadLabel: string;
  hasCertificate: boolean;
  priceLabel: string;
  isFree: boolean;
  company: CourseDetailCompany | null;
  skills: CourseDetailSkill[];
  careerTracks: CourseDetailTrack[];
  modules: CourseDetailModule[];
  enrollment: CourseEnrollmentState;
};
