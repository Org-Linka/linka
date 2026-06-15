/**
 * admin.service.ts
 * -----------------------------------------------------------------------------
 * Camada de acesso a dados do módulo ADMIN.
 *
 * IMPORTANTE: somente MOCKS locais. Nenhuma chamada de rede, banco ou auth.
 * Cada função simula uma pequena latência e devolve dados estáticos,
 * mantendo o formato final esperado para facilitar a integração futura.
 *
 * Para conectar o backend real depois, basta substituir o corpo de cada
 * função (mantendo as assinaturas) por uma chamada à API.
 */

import {
    AdminCompany,
    AdminOpportunity,
    AdminProject,
    AdminStats,
    AdminUser,
} from './admin.types';

/* -------------------------------------------------------------------------- */
/* Util                                                                        */
/* -------------------------------------------------------------------------- */

/** Simula a latência de uma requisição de rede. */
function delay<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/* -------------------------------------------------------------------------- */
/* Mocks                                                                       */
/* -------------------------------------------------------------------------- */

const MOCK_STATS: AdminStats = {
  users: 1284,
  projects: 96,
  companies: 42,
  opportunities: 173,
};

const MOCK_USERS: AdminUser[] = [
  { id: 'u1', name: 'Ana Beatriz Moraes', subtitle: 'Estudante · Eng. de Software', initials: 'AM' },
  { id: 'u2', name: 'Carlos Eduardo Lima', subtitle: 'Mentor · Ciência de Dados', initials: 'CL' },
  { id: 'u3', name: 'Júlia Santana', subtitle: 'Estudante · Design', initials: 'JS' },
  { id: 'u4', name: 'Rafael Nogueira', subtitle: 'Coordenador · Inovação', initials: 'RN' },
  { id: 'u5', name: 'Marina Cunha', subtitle: 'Estudante · Administração', initials: 'MC' },
  { id: 'u6', name: 'Pedro Henrique Alves', subtitle: 'Pesquisador · IA', initials: 'PA' },
  { id: 'u7', name: 'Larissa Ferreira', subtitle: 'Estudante · Marketing', initials: 'LF' },
  { id: 'u8', name: 'Bruno Tavares', subtitle: 'Mentor · Produto', initials: 'BT' },
];

const MOCK_PROJECTS: AdminProject[] = [
  { id: 'p1', title: 'Plataforma de Mentoria', owner: 'Ana Beatriz Moraes', status: 'active', tags: ['EdTech', 'Mobile'] },
  { id: 'p2', title: 'Sensor IoT para Campus', owner: 'Pedro Henrique Alves', status: 'review', tags: ['IoT', 'Hardware'] },
  { id: 'p3', title: 'Marketplace Universitário', owner: 'Marina Cunha', status: 'active', tags: ['E-commerce'] },
  { id: 'p4', title: 'App de Carona Solidária', owner: 'Bruno Tavares', status: 'paused', tags: ['Mobilidade', 'Social'] },
  { id: 'p5', title: 'Dashboard de Pesquisa', owner: 'Carlos Eduardo Lima', status: 'done', tags: ['Data', 'Analytics'] },
  { id: 'p6', title: 'Assistente de Estudos IA', owner: 'Larissa Ferreira', status: 'review', tags: ['IA', 'EdTech'] },
];

const MOCK_COMPANIES: AdminCompany[] = [
  { id: 'c1', name: 'Nuvem Tecnologia', segment: 'Cloud & Infra', initials: 'NT', openRoles: 8 },
  { id: 'c2', name: 'Orbital Labs', segment: 'Pesquisa & IA', initials: 'OL', openRoles: 5 },
  { id: 'c3', name: 'Vértice Financeira', segment: 'Fintech', initials: 'VF', openRoles: 12 },
  { id: 'c4', name: 'Campo Verde Agro', segment: 'AgroTech', initials: 'CV', openRoles: 3 },
  { id: 'c5', name: 'Lumen Saúde', segment: 'HealthTech', initials: 'LS', openRoles: 6 },
  { id: 'c6', name: 'Práxis Design', segment: 'Produto & UX', initials: 'PD', openRoles: 4 },
];

const MOCK_OPPORTUNITIES: AdminOpportunity[] = [
  { id: 'o1', title: 'Estágio em Front-end', company: 'Nuvem Tecnologia', category: 'Estágio', location: 'Remoto' },
  { id: 'o2', title: 'Cientista de Dados Jr.', company: 'Orbital Labs', category: 'CLT', location: 'Híbrido' },
  { id: 'o3', title: 'Trainee de Produto', company: 'Vértice Financeira', category: 'Trainee', location: 'Presencial' },
  { id: 'o4', title: 'Pesquisador em IA', company: 'Orbital Labs', category: 'Pesquisa', location: 'Remoto' },
  { id: 'o5', title: 'Estágio em UX Design', company: 'Práxis Design', category: 'Estágio', location: 'Híbrido' },
  { id: 'o6', title: 'Analista AgroTech', company: 'Campo Verde Agro', category: 'CLT', location: 'Presencial' },
  { id: 'o7', title: 'Estágio em Dados', company: 'Lumen Saúde', category: 'Estágio', location: 'Remoto' },
];

/* -------------------------------------------------------------------------- */
/* API pública do service                                                      */
/* -------------------------------------------------------------------------- */

export const adminService = {
  getStats(): Promise<AdminStats> {
    return delay(MOCK_STATS);
  },

  getUsers(): Promise<AdminUser[]> {
    return delay(MOCK_USERS);
  },

  getProjects(): Promise<AdminProject[]> {
    return delay(MOCK_PROJECTS);
  },

  getCompanies(): Promise<AdminCompany[]> {
    return delay(MOCK_COMPANIES);
  },

  getOpportunities(): Promise<AdminOpportunity[]> {
    return delay(MOCK_OPPORTUNITIES);
  },
};

export default adminService;
