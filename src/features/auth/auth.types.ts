export type UserType = "student" | "company" | "admin";

export type LoginForm = {
  email: string;
  senha: string;
  cnpj: string;
  idEmpresa: string;
};

export type RegisterForm = {
  userType: UserType;
  nome: string;
  email: string;
  senha: string;
  cnpj: string;
};

export type ResetPasswordForm = {
  email: string;
  novaSenha: string;
  confirmarSenha: string;
};