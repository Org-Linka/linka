# 📌 Regras de Commit - Linka

Este documento define as boas práticas de commits para manter o histórico organizado, legível e profissional.

---

## Padrão de Commit

Seguimos o padrão **Conventional Commits**:

- tipo: descrição curta

---

## Tipos de Commit

### feat
Nova funcionalidade

- feat: adicionar tela de login

---

### fix
Correção de bug

- fix: corrigir erro na autenticação JWT

---

### refactor
Refatoração (sem alterar comportamento)

- refactor: melhorar estrutura do controller de usuários

---

### style
Alterações visuais ou formatação (sem lógica)

- style: ajustar espaçamento do header

---

### perf
Melhoria de performance

- perf: otimizar consulta no banco

---

### test
Testes

- test: adicionar testes para rota de login

---

### docs
Documentação

- docs: atualizar README com instruções de instalação

---

### chore
Tarefas gerais (config, deps, etc)

- chore: atualizar dependências

---

## Boas Práticas

### Sempre faça:
- Commits pequenos e objetivos
- Mensagens claras
- Um commit por alteração lógica
- Use inglês (padrão do mercado)

---

### Evite:
- commit: mudanças
- update
- ajustes
- commits gigantes com várias mudanças

---

## Exemplo de fluxo correto

1. feat: criar estrutura inicial do backend  
2. feat: implementar autenticação JWT  
3. fix: corrigir erro de token expirado  
4. refactor: reorganizar pastas do projeto  

---

## Branches

### Padrão de nomes

- `feature/nome-da-feature`
- `fix/nome-do-bug`
- `refactor/nome-da-refatoracao`

---

## Pull Requests

Antes de abrir um PR:

- Código funcionando
- Sem erros
- Testado
- Seguindo padrão de commits

---

## Dica importante

> Um bom commit explica **o porquê**, não só o que foi feito.

---

## Objetivo

Manter o projeto:
- Organizado
- Escalável
- Profissional
- Fácil de manter