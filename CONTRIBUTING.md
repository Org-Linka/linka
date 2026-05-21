# Guia de Contribuição - Linka

Este documento define o fluxo de contribuição do projeto **Linka**.

O objetivo é manter o desenvolvimento organizado, rastreável e fácil de revisar.

---

## Fluxo Padrão de Desenvolvimento

O fluxo recomendado é:

```txt
Issue -> Branch -> Commit -> Pull Request -> Review -> Merge
```

Antes de iniciar qualquer alteração, verifique se já existe uma issue relacionada.

---

## 1. Escolher ou Criar uma Issue

Toda alteração deve estar relacionada a uma issue.

Tipos comuns de issue:

- `Epic` — agrupador grande de funcionalidades
- `Feature` — nova funcionalidade
- `Task` — tarefa específica
- `Bug` — erro ou comportamento incorreto
- `Documentation` — alteração em documentação

Exemplos:

```txt
Feature: Criar perfil de estudante
Task: Criar formulário de edição de perfil
Bug: Corrigir erro no redirecionamento de login
Docs: Atualizar README com setup real
```

---

## 2. Criar uma Branch

Antes de criar uma branch, atualize a `main`.

```bash
git checkout main
git pull origin main
```

Depois, crie uma branch seguindo o padrão do projeto.

```bash
git checkout -b tipo/numero-descricao
```

Exemplos:

```bash
git checkout -b feature/22-create-student-profile
git checkout -b fix/27-auth-session-persistence
git checkout -b docs/39-update-readme-setup
git checkout -b refactor/profile-components
```

---

## 3. Padrão de Branches

Use nomes objetivos e em inglês.

### Tipos recomendados

- `feature` — nova funcionalidade
- `fix` — correção de erro
- `bugfix` — correção de bug em desenvolvimento ou QA
- `hotfix` — correção urgente em produção
- `docs` — documentação
- `refactor` — refatoração sem alterar comportamento
- `style` — ajuste visual ou formatação
- `test` — testes
- `chore` — manutenção geral
- `ci` — pipeline ou automação

### Exemplos corretos

```txt
feature/22-create-student-profile
fix/27-auth-session-persistence
docs/39-update-readme-setup
style/home-card-spacing
chore/update-dependencies
ci/add-quality-workflow
```

### Evite

```txt
teste
ajustes
nova-branch
branch-yago
coisas
final
```

---

## 4. Fazer Commits

O projeto segue o padrão **Conventional Commits**.

Formato:

```txt
tipo(escopo): descrição curta
```

Exemplos:

```txt
feat(auth): add login screen
fix(profile): prevent empty name submit
docs(readme): update setup instructions
refactor(ui): extract profile card component
chore(deps): update dependencies
```

### Tipos comuns

- `feat` — nova funcionalidade
- `fix` — correção de bug
- `docs` — documentação
- `style` — formatação ou ajuste visual
- `refactor` — refatoração
- `perf` — performance
- `test` — testes
- `build` — build ou dependências
- `ci` — CI/CD
- `chore` — manutenção geral
- `revert` — desfazer alteração

---

## 5. Commits Pequenos e Objetivos

Prefira commits pequenos e organizados.

Exemplo ruim:

```txt
feat: várias coisas
```

Exemplo bom:

```txt
feat(profile): create student profile screen
feat(profile): add skills section
fix(profile): adjust avatar spacing
```

Cada commit deve representar uma alteração lógica.

---

## 6. Rodar o Projeto Antes do PR

Antes de abrir um Pull Request, rode o projeto localmente.

```bash
npm install
npm start
```

Também rode as validações de qualidade:

```bash
npm run lint
npm run typecheck
```

---

## 7. Abrir Pull Request

Ao abrir um PR:

1. Use um título claro
2. Preencha o template de Pull Request
3. Relacione a issue usando `Closes #numero`
4. Marque o tipo da alteração
5. Explique como testar
6. Adicione prints ou vídeos se for alteração visual

Exemplo de título:

```txt
feat(profile): create student profile screen
```

Exemplo de vínculo com issue:

```txt
Closes #22
```

---

## 8. Checklist Antes de Pedir Review

Antes de finalizar o PR, confira:

- [ ] A branch segue o padrão do projeto
- [ ] Os commits seguem Conventional Commits
- [ ] O app roda localmente
- [ ] O lint foi executado
- [ ] O typecheck foi executado
- [ ] O CI passou antes do merge
- [ ] A alteração foi testada
- [ ] O PR fecha ou referencia uma issue
- [ ] Não foram adicionadas credenciais ou arquivos sensíveis
- [ ] A documentação foi atualizada, se necessário

---

## 9. Merge

O merge deve ser feito apenas quando:

- O CI do GitHub Actions estiver passando (`lint` e `typecheck`)
- O PR estiver revisado
- O escopo estiver claro
- O app estiver funcionando
- Não houver arquivos sensíveis
- A alteração estiver relacionada a uma issue

Preferência de merge:

```txt
Squash and merge
```

Mensagem recomendada:

```txt
tipo(escopo): descrição do PR
```

Exemplo:

```txt
docs(project): update setup and contribution docs
```

---

## 10. Boas Práticas Gerais

- Não fazer alterações grandes demais em um único PR
- Não misturar feature, bugfix e documentação sem necessidade
- Não fazer push direto na `main`
- Não subir `.env`
- Não subir credenciais
- Não usar commits genéricos como `update`, `fix things` ou `ajustes`
- Manter issues e PRs bem descritos
- Usar prints ou vídeos em mudanças visuais
- Atualizar o README quando o setup mudar

---

## 11. Arquivos Importantes

- `README.md` — visão geral e instruções do projeto
- `RULES_COMMIT.md` — regras de commits e branches
- `CHANGELOG.md` — histórico de versões
- `.env.example` — exemplo de variáveis de ambiente
- `.github/ISSUE_TEMPLATE/` — templates de issue
- `.github/pull_request_template.md` — template de Pull Request

---

## 12. Segurança

Nunca suba para o GitHub:

- `.env`
- Senhas
- Tokens privados
- Service role keys do Supabase
- Credenciais administrativas
- Chaves privadas
- Arquivos com dados sensíveis

Use `.env.example` apenas para documentar quais variáveis existem.

---

## Resumo

Fluxo ideal:

```txt
1. Pegar uma issue
2. Criar branch a partir da main
3. Fazer commits pequenos
4. Rodar e testar o projeto
5. Abrir Pull Request
6. Preencher o template
7. Revisar
8. Fazer merge
```
