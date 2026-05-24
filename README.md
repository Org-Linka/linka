# Passo a passo de desenvolvimento do Linka

Este projeto usa uma organização simples por funcionalidades. Siga este fluxo sempre que for implementar, modificar ou corrigir algo no sistema.

## Documentação do projeto

Todas as documentações, com exceção deste README, ficam na pasta `docs`.

- [Arquitetura do projeto](docs/ARCHITECTURE.md)
- [Como contribuir](docs/CONTRIBUTING.md)
- [Regras de commit](docs/RULES_COMMIT.md)
- [Changelog](docs/CHANGELOG.md)
- [Licença](docs/LICENSE)

## 1. Entenda onde a mudança deve ficar

1. Identifique qual funcionalidade será alterada: autenticação, projetos, cursos, eventos, oportunidades, perfil ou outra área do produto.
2. Procure a pasta correspondente em `src/features`.
3. Se a funcionalidade ainda não existir, crie uma nova pasta dentro de `src/features`.
4. Use `src/features/projects` como modelo de organização.

## 2. Crie ou mantenha a estrutura da feature

Toda feature deve seguir este formato básico:

```txt
src/features/nome-da-feature/
├── components/
├── screens/
├── nome-da-feature.service.ts
├── nome-da-feature.schema.ts
└── nome-da-feature.types.ts
```

Use cada pasta ou arquivo assim:

1. `components`: componentes usados só por essa feature.
2. `screens`: telas principais dessa feature.
3. `*.service.ts`: chamadas ao Supabase ou outras integrações externas.
4. `*.schema.ts`: validações de formulários, payloads e regras de entrada.
5. `*.types.ts`: tipos, contratos de dados, enums e constantes de domínio.

## 3. Implemente uma funcionalidade nova

1. Crie a pasta da feature em `src/features`.
2. Crie os arquivos `components`, `screens`, `*.service.ts`, `*.schema.ts` e `*.types.ts` conforme a necessidade.
3. Coloque regras e tipos da funcionalidade dentro da própria feature.
4. Coloque chamadas ao Supabase apenas em arquivos `*.service.ts`.
5. Coloque validações apenas em arquivos `*.schema.ts`.
6. Importe a feature nas rotas de `src/app` somente quando ela precisar aparecer na navegação.
7. Rode `npm run typecheck` antes de abrir o Pull Request.

## 4. Modifique uma funcionalidade existente

1. Abra a rota em `src/app` para descobrir qual screen ela exporta.
2. Encontre a feature em `src/features`.
3. Altere primeiro os tipos em `*.types.ts`, se o formato dos dados mudar.
4. Atualize validações em `*.schema.ts`, se entradas ou formulários mudarem.
5. Atualize chamadas externas em `*.service.ts`, se a origem dos dados mudar.
6. Atualize componentes ou telas por último.
7. Evite criar arquivos soltos fora da feature.
8. Corrija todos os imports quebrados depois da alteração.

## 5. Corrija bugs

1. Descubra em qual feature o bug acontece.
2. Faça a menor alteração possível dentro dessa feature.
3. Se o bug estiver em componente reutilizável, corrija em `src/shared/components`.
4. Se o bug estiver em função reutilizável, corrija em `src/shared/utils`.
5. Se o bug estiver em configuração global, corrija em `src/config`.
6. Depois da correção, rode `npm run typecheck` e `npm run lint`.

## 6. Reutilize código do jeito certo

1. Componentes usados por mais de uma feature ficam em `src/shared/components`.
2. Hooks reutilizáveis ficam em `src/shared/hooks`.
3. Funções auxiliares reutilizáveis ficam em `src/shared/utils`.
4. Tipos compartilhados ficam em `src/shared/types`.
5. Configurações gerais ficam em `src/config`.
6. A configuração do Supabase deve ficar centralizada em `src/shared/lib/supabase.ts`.

## 7. Cuide dos imports

1. Prefira imports com alias `@/`.
2. Use `@/features/...` para acessar features.
3. Use `@/shared/...` para acessar código reutilizável.
4. Use `@/config/...` para configurações globais.
5. Use `@/assets/...` para imagens, fontes e arquivos estáticos.
6. Evite imports relativos longos como `../../../`.

## 8. Antes de abrir Pull Request

1. Confirme que a mudança está dentro da pasta correta.
2. Confirme que não existem arquivos soltos sem relação clara com feature, shared ou config.
3. Rode `npm run typecheck`.
4. Rode `npm run lint`, se a alteração tocar telas, componentes ou imports.
5. Descreva no PR quais pastas foram criadas ou movidas.
6. Informe qual feature foi usada ou alterada.
7. Referencie a issue relacionada no corpo do PR.

## 9. Checklist rápido

- [ ] A mudança está em `src/features`, `src/shared`, `src/config` ou `src/app`.
- [ ] Componentes reutilizáveis estão em `src/shared/components`.
- [ ] Chamadas ao Supabase estão em `*.service.ts`.
- [ ] Validações estão em `*.schema.ts`.
- [ ] Tipos e contratos estão em `*.types.ts`.
- [ ] Imports foram atualizados.
- [ ] O projeto passa em `npm run typecheck`.
