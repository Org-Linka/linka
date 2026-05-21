export type UserType = "aluno" | "empresa";

export type LoginForm = {
  email: string;
  senha: string;
  cnpj: string;
  idEmpresa: string;
};

export type RegisterForm = {
  nome: string;
  email: string;
  senha: string;
};

export type ResetPasswordForm = {
  email: string;
  novaSenha: string;
  confirmarSenha: string;
};
