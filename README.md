# Linka

> Um ecossistema mobile que conecta estudantes, empresas, projetos acadêmicos, oportunidades e inovação.

---

## Sobre o Projeto

O **Linka** é uma plataforma mobile desenvolvida para conectar estudantes universitários e empresas através de projetos acadêmicos, oportunidades profissionais, eventos, cursos e iniciativas de inovação.

A proposta é criar um ambiente onde estudantes possam divulgar seus projetos, construir um perfil profissional e serem encontrados por empresas interessadas em talentos, ideias e soluções acadêmicas.

O Linka não é apenas um repositório de projetos. É um ecossistema de conexão entre estudantes, empresas, universidades e oportunidades reais.

---

## Objetivo

Criar uma ponte entre:

- Estudantes
- Empresas
- Projetos acadêmicos
- Oportunidades de emprego
- Eventos
- Cursos
- Investimentos e parcerias

O objetivo do app é facilitar que estudantes mostrem seu potencial e que empresas encontrem talentos e projetos com valor real.

---

## Status do Projeto

> 🚧 Em desenvolvimento

O projeto ainda está em fase inicial de desenvolvimento, com foco na criação da base visual, estrutura de navegação, autenticação, perfis, projetos e oportunidades.

---

## Funcionalidades Planejadas

### Estudantes

- Criar conta e fazer login
- Criar perfil de estudante
- Publicar projetos acadêmicos
- Exibir habilidades, curso, universidade e links externos
- Receber contatos de empresas
- Receber propostas de investimento ou parceria
- Participar de eventos, cursos e oportunidades

### Empresas

- Criar perfil de empresa
- Buscar estudantes e projetos
- Favoritar projetos
- Entrar em contato com estudantes
- Publicar vagas
- Publicar eventos, cursos e oportunidades
- Enviar propostas de investimento ou parceria

### Plataforma

- Sistema de autenticação
- Perfil de usuário
- Perfil de empresa
- Aba de projetos
- Aba de oportunidades
- Aba de vagas
- Aba de eventos
- Sistema de notificações
- Integração futura com Supabase
- Integração futura com pagamentos
- Integração futura com analytics

---

## Tecnologias Utilizadas

### Mobile / Frontend

- React Native
- Expo
- Expo Router
- TypeScript
- NativeWind
- Tailwind CSS
- React Navigation

### Backend / Banco / Autenticação

- Supabase
- Supabase Auth
- Supabase Database
- Supabase Storage
- Supabase Realtime
- Supabase Edge Functions

### Build e Distribuição

- EAS Build
- Expo Updates
- Google Play Console futuramente

### Qualidade e Padronização

- ESLint
- TypeScript strict
- Conventional Commits
- GitHub Issues
- GitHub Pull Requests
- GitHub Projects

---

## Pré-requisitos

Antes de rodar o projeto, tenha instalado:

- Node.js
- npm
- Git
- Expo Go no celular, caso queira testar via dispositivo físico
- Conta no Expo, caso vá usar EAS Build futuramente
- Conta no Supabase, caso vá configurar backend/autenticação

---

## Como Rodar o Projeto Localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/tenmenezes/linka.git
```

### 2. Entrar na pasta do projeto

```bash
cd linka
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Criar o arquivo de variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no arquivo `.env.example`.

```bash
cp .env.example .env
```

Depois, preencha as variáveis necessárias.

### 5. Rodar o projeto

```bash
npm start
```

ou:

```bash
npx expo start
```

---

## Scripts Disponíveis

```bash
npm start
```

Inicia o projeto com Expo.

```bash
npm run android
```

Executa o projeto no Android.

```bash
npm run ios
```

Executa o projeto no iOS.

```bash
npm run web
```

Executa o projeto no navegador.

```bash
npm run lint
```

Executa a validação de lint do projeto.

```bash
npm run typecheck
```

Executa a validação TypeScript com `tsc --noEmit`.

```bash
npm run reset-project
```

Executa o script de reset do projeto.

---

## Variáveis de Ambiente

O projeto utiliza variáveis públicas do Expo com prefixo `EXPO_PUBLIC_`.

Exemplo:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_ENV=development
```

> Atenção: variáveis com `EXPO_PUBLIC_` ficam disponíveis no app. Não coloque senhas, tokens privados, service role keys ou credenciais administrativas nesse arquivo.

---

## Estrutura Geral do Projeto

```bash
├── app/
│   ├── (auth)/
│   ├── (tabs)/
│   ├── _layout.tsx
│   └── index.tsx
├── assets/
├── components/
├── constants/
├── scripts/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── .env.example
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── RULES_COMMIT.md
├── app.json
├── eas.json
├── package.json
├── tsconfig.json
├── eslint.config.js
└── assets.d.ts
```

---

## Fluxo de Desenvolvimento

O fluxo recomendado é:

```txt
Issue -> Branch -> Commit -> Pull Request -> Review -> Merge na main
```

### Exemplo

```bash
git checkout main
git pull origin main
git checkout -b feature/22-create-student-profile
```

Depois das alterações:

```bash
git add .
git commit -m "feat(profile): create student profile screen"
git push -u origin feature/22-create-student-profile
```

Em seguida, abra um Pull Request para a branch `main`.

---

## Padrão de Branches

Use branches com nomes objetivos e relacionados à issue ou tarefa.

Exemplos:

```txt
feature/22-create-student-profile
feature/23-create-company-profile
fix/27-auth-session-persistence
docs/39-update-readme-setup
refactor/profile-components
chore/update-dependencies
```

Evite branches genéricas como:

```txt
ajustes
teste
nova-tela
branch-carlos
```

---

## Padrão de Commits

O projeto segue o padrão de Conventional Commits.

Exemplos:

```txt
feat(auth): add login screen
fix(profile): prevent empty name submit
docs(readme): update setup instructions
refactor(ui): extract profile card component
chore(deps): update dependencies
```

Para mais detalhes, consulte:

```txt
RULES_COMMIT.md
```

---

## Como Contribuir

Antes de contribuir:

1. Escolha ou crie uma issue
2. Crie uma branch a partir da `main`
3. Faça commits pequenos e claros
4. Abra um Pull Request
5. Preencha o template do PR
6. Aguarde o CI do GitHub Actions passar (`lint` e `typecheck`)
7. Aguarde revisão ou valide a alteração
8. Faça merge somente quando estiver tudo correto

Consulte também:

```txt
CONTRIBUTING.md
```

---

## Documentação do Projeto

Arquivos importantes:

- `README.md` — visão geral e setup do projeto
- `CONTRIBUTING.md` — guia de contribuição
- `CHANGELOG.md` — histórico de versões e mudanças
- `RULES_COMMIT.md` — regras de commits e branches
- `.env.example` — exemplo de variáveis de ambiente

---

## Build com EAS

O projeto possui configuração de build com EAS.

Perfis configurados:

```txt
development
preview
production
```

Comandos comuns:

```bash
eas build --profile development --platform android
```

```bash
eas build --profile preview --platform android
```

```bash
eas build --profile production --platform android
```

> O APK pode ser usado para testes internos. Para publicação futura na Google Play, o ideal é gerar build de produção no formato aceito pela loja.

---

## Equipe

### Desenvolvedores / Contribuidores

|                                                                                                                                                                               |                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <div align="center"><img src="https://github.com/tenmenezes.png" width="150px"/><br/><br/><a href="https://github.com/tenmenezes"><strong>Ten Menezes</strong></a></div>      | <div align="center"><img src="https://github.com/mclarabastos.png" width="150px"/><br/><br/><a href="https://github.com/mclarabastos"><strong>Maria Clara</strong></a></div> |
| <div align="center"><img src="https://github.com/YasmimMantovani.png" width="150px"/><br/><br/><a href="https://github.com/YasmimMantovani"><strong>Yasmim</strong></a></div> | <div align="center"><img src="https://github.com/tutunery.png" width="150px"/><br/><br/><a href="https://github.com/tutunery"><strong>Arthur</strong></a></div>              |

---

## Licença

Este projeto está sob a licença definida no arquivo `LICENSE`.

---

## Visão Futura

- Publicação na Google Play
- Sistema completo de autenticação
- Perfis de estudante e empresa
- Publicação de projetos acadêmicos
- Publicação de vagas e oportunidades
- Sistema de eventos e cursos
- Sistema de notificações
- Integração com pagamentos
- Integração com analyticsk
- Integração com universidades e empresas parceiras

> Não é só sobre código.  
> É sobre criar oportunidades reais.
