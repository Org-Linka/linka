import type { UserType } from "@/features/auth/auth.types";

import type { ProfileUser } from "./profile.types";

export function getCurrentProfile(userType: UserType, email?: string, name?: string): ProfileUser {
  if (userType === "company") {
    return {
      userType: "company",
      name: name || "Empresa Exemplo",
      companyName: "Empresa Exemplo LTDA",
      bio: "Empresa parceira interessada em conectar talentos iniciantes a oportunidades reais de desenvolvimento profissional.",
      email: email || "empresa@example.com",
      phone: "(11) 4002-8922",
      cnpj: "00.000.000/0001-00",
      segment: "Tecnologia e Impacto Social",
      city: "São Paulo",
      state: "SP",
      avatarUrl: "",
      openPositions: [
        { id: "1", title: "Estágio em Front-end", subtitle: "Remoto / Híbrido" },
        { id: "2", title: "React Native Júnior", subtitle: "Banco de talentos" },
      ],
      links: {
        linkedin: "",
        instagram: "",
        portfolio: "",
      },
    };
  }

  return {
    userType: "student",
    name: name || "Nome de usuário",
    course: "Análise e Desenv. de Sistemas",
    bio: "Estudante de Análise e Desenvolvimento de Sistemas, com interesse em desenvolvimento full stack, tecnologia social e criação de soluções acessíveis. Busco oportunidades para aplicar meus conhecimentos em projetos reais e continuar evoluindo profissionalmente.",
    email: email || "aluno@example.com",
    phone: "(11) 98765-4321",
    registration: "2021123456",
    university: "Universidade exemplo",
    semester: "4° semestre",
    avatarUrl: "https://github.com/mizuno-p.png",
    field: "Desenvolvimento Full Stack",
    tools: "Git/Github, JavaScript, React, Next.js",
    languages: "Inglês, Espanhol",
    skills: "Boa comunicação, trabalho em equipe, metodologias ágeis",
    projects: [
      { id: "1", title: "App para Idosos", subtitle: "Projeto Acadêmico" },
      { id: "2", title: "Plataforma de Pais Atípicos", subtitle: "Projeto Acadêmico" },
    ],
    links: {
      linkedin: "",
      github: "https://github.com/mizuno-p",
      instagram: "",
      portfolio: "",
    },
  };
}
