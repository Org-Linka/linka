/**
 * admin.types.ts
 * -----------------------------------------------------------------------------
 * Contratos de dados do módulo ADMIN (somente visualização).
 * Estes tipos descrevem o formato dos dados consumidos pelas telas.
 * Quando o backend real for integrado, basta manter este formato.
 */

/* -------------------------------------------------------------------------- */
/* Estados de requisição                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Estado de uma operação assíncrona de leitura.
 * Usado pelas telas para alternar entre loading / empty / error / success.
 */
export type AdminStatus = 'idle' | 'loading' | 'empty' | 'error' | 'success';

/**
 * Wrapper genérico de estado para qualquer recurso carregado pelo service.
 */
export interface AdminAsyncState<T> {
  status: AdminStatus;
  data: T;
  error?: string;
}

/* -------------------------------------------------------------------------- */
/* Entidades                                                                   */
/* -------------------------------------------------------------------------- */

/** Métricas agregadas exibidas no Dashboard. */
export interface AdminStats {
  users: number;
  projects: number;
  companies: number;
  opportunities: number;
}

/** Usuário da plataforma. */
export interface AdminUser {
  id: string;
  name: string;
  /** Subtítulo: papel, curso ou e-mail. */
  subtitle: string;
  /** Iniciais usadas no avatar placeholder. */
  initials: string;
}

/** Status visual possível de um projeto. */
export type AdminProjectStatus = 'active' | 'review' | 'paused' | 'done';

/** Projeto cadastrado na plataforma. */
export interface AdminProject {
  id: string;
  title: string;
  /** Autor / responsável. */
  owner: string;
  status: AdminProjectStatus;
  /** Etiquetas temáticas. */
  tags: string[];
}

/** Empresa parceira. */
export interface AdminCompany {
  id: string;
  name: string;
  /** Segmento / área de atuação. */
  segment: string;
  /** Iniciais usadas no logo placeholder. */
  initials: string;
  /** Quantidade de vagas abertas. */
  openRoles: number;
}

/** Vaga / oportunidade. */
export interface AdminOpportunity {
  id: string;
  title: string;
  company: string;
  /** Categoria da vaga (ex.: Estágio, Trainee, CLT, Pesquisa). */
  category: string;
  /** Local ou modelo (ex.: Remoto, Híbrido, Presencial). */
  location: string;
}
