import type { Member, ProjectFeature } from "./about.types";

export const members: Member[] = [
  {
    id: 1,
    nome: "Yago Menezes",
    descricao: "Desenvolvimento FullStack",
    descricaoCompleta:
      "Atua no desenvolvimento fullstack da aplicação, sendo responsável pela implementação de funcionalidades, integração com APIs e construção da experiência do usuário. Tem foco em performance, organização de código e evolução contínua do produto.",
    foto: require("@/assets/images/members/membro2.jpeg"),
    linkedin: "https://linkedin.com/in/ten-menezes",
    github: "https://github.com/tenmenezes",
    portfolio: "https://tenmenezes.github.io",
  },
  {
    id: 2,
    nome: "Arthur Nery",
    descricao: "Desenvolvimento & Planejamento",
    descricaoCompleta:
      "Contribui tanto na parte técnica quanto no planejamento estratégico do projeto. Atua na definição de funcionalidades, estrutura do sistema e organização do desenvolvimento, garantindo alinhamento entre ideia, execução e propósito da aplicação.",
    foto: require("@/assets/images/members/membro1.png"),
    linkedin: "https://www.linkedin.com/in/luiz-arthur-nery-leite",
    github: "https://github.com/tutunery",
    portfolio: "https://example.com/",
  },
  {
    id: 3,
    nome: "Yasmim Mantovani",
    descricao: "Designer UX/UI & Interface",
    descricaoCompleta:
      "Responsável pelo design UX/UI e identidade visual do aplicativo. Trabalha na criação de interfaces intuitivas, organização da experiência do usuário e alinhamento visual da plataforma, buscando sempre clareza, estética e usabilidade.",
    foto: require("@/assets/images/members/membro3.png"),
    linkedin: "https://www.linkedin.com/in/yasmim-mantovani",
    github: "https://www.github.com/yasmimmantovani",
    portfolio: "https://example.com/",
  },
  {
    id: 4,
    nome: "Maria Clara Bastos",
    descricao: "Desenvolvimento FullStack",
    descricaoCompleta:
      "Atua no desenvolvimento fullstack e na construção da interface do aplicativo. Participa da estruturação visual e funcional do sistema, contribuindo para transformar ideias em soluções digitais bem organizadas e eficientes.",
    foto: require("@/assets/images/members/membro4.png"),
    linkedin: "https://www.linkedin.com/in/mclara-bastos/",
    github: "https://github.com/mclarabastos",
    portfolio: "https://example.com/",
  },
];

export const projectFeatures: ProjectFeature[] = [
  {
    icon: "users",
    title: "Conexão",
    desc: "Aproxima alunos, mentores, empresas e investidores.",
  },
  {
    icon: "rocket",
    title: "Visibilidade",
    desc: "Dá espaço para divulgar ideias, projetos e iniciativas.",
  },
  {
    icon: "lightbulb-o",
    title: "Oportunidades",
    desc: "Incentiva participação em eventos, desafios e hackathons.",
  },
];
