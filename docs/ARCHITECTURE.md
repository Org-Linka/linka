# Arquitetura do projeto

O Linka usa uma organização simples por funcionalidades. A intenção é manter o código previsível, fácil de procurar e seguro para integrantes iniciantes contribuírem sem espalhar telas, regras e integrações pela raiz do projeto.

## Pastas principais

```txt
src/
├── app/
├── features/
├── shared/
└── config/
```

- `src/app`: rotas do Expo Router. Os arquivos daqui devem ser finos e apontar para telas em `features`.
- `src/features`: funcionalidades do sistema organizadas por domínio.
- `src/shared`: componentes, hooks, libs, tipos e utilitários reutilizáveis.
- `src/config`: configurações gerais do projeto.

## Como criar uma nova feature

Toda nova funcionalidade deve ser criada dentro de `src/features`. Use este formato como base:

```txt
src/features/projects/
├── components/
├── screens/
├── project.service.ts
├── project.schema.ts
└── project.types.ts
```

A feature `src/features/projects` é o modelo inicial do projeto.

## Regras principais

1. Telas ficam em `src/features/<feature>/screens`.
2. Componentes usados por uma única feature ficam em `src/features/<feature>/components`.
3. Componentes usados por mais de uma feature ficam em `src/shared/components`.
4. Chamadas ao Supabase ou a integrações externas ficam em arquivos `*.service.ts`.
5. Validações de formulário e payload ficam em arquivos `*.schema.ts`.
6. Tipos, enums e contratos de dados ficam em arquivos `*.types.ts`.
7. Configuração central do Supabase fica em `src/shared/lib/supabase.ts`.
8. Configurações globais ficam em `src/config`.
9. Rotas em `src/app` não devem concentrar regra de negócio nem layout grande.

## Como modificar uma tela existente

1. Abra a rota em `src/app` para descobrir qual screen ela exporta.
2. Faça a alteração dentro da feature correspondente.
3. Se a mudança for visual e específica da tela, altere `screens` ou `components` da própria feature.
4. Se a mudança puder ser reaproveitada por outras telas, mova para `src/shared/components`.
5. Atualize imports usando o alias `@/`.
6. Rode `npm run typecheck` e `npm run lint`.

## Como corrigir bugs

1. Identifique a feature onde o bug acontece.
2. Corrija dentro da feature sempre que o problema for específico daquele domínio.
3. Corrija em `src/shared` apenas quando o problema estiver em código reutilizado.
4. Corrija em `src/config` apenas quando for configuração global.
5. Evite criar arquivos soltos na raiz ou dentro de `src/app`.

## Imports

Prefira imports com alias:

```ts
import { AppTopBar } from "@/shared/components/layout/AppTopBar";
import ProjectCard from "@/features/projects/components/ProjectCard";
import { TAB_BAR_HEIGHT } from "@/config/layout";
```

Evite imports longos com muitos `../`, porque eles quebram com mais facilidade quando arquivos são movidos.

## Checklist antes do PR

- [ ] A mudança está dentro de `src/features`, `src/shared`, `src/config` ou `src/app`.
- [ ] A rota em `src/app` está fina.
- [ ] Componentes reutilizáveis foram para `src/shared/components`.
- [ ] Services usam sufixo `.service.ts`.
- [ ] Schemas usam sufixo `.schema.ts`.
- [ ] Tipos usam sufixo `.types.ts`.
- [ ] Imports antigos foram corrigidos.
- [ ] `npm run typecheck` passou.
- [ ] `npm run lint` passou ou só manteve warnings já conhecidos.
