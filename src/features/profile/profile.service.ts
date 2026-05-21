import type { ProfileUser } from "./profile.types";

export function getCurrentProfile(): ProfileUser {
  return {
    name: "Nome de usuário",
    course: "Análise e Desenv. de Sistemas",
    email: "aluno@example.com",
    phone: "(11) 98765-4321",
    registration: "2021123456",
    university: "Universidade exemplo",
    semester: "4° semestre",
    avatarUrl: "https://github.com/mizuno-p.png",
  };
}
