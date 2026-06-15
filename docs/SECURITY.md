# Security Policy

## Supported Versions

Atualmente, apenas a branch principal do projeto é considerada suportada para correções de segurança.

| Versão / Branch     | Suportada |
| ------------------- | --------- |
| `main`              | Sim       |
| Branches de feature | Não       |
| Forks não oficiais  | Não       |

Correções de segurança devem ser aplicadas primeiro na `main` ou em uma branch criada especificamente para correção, seguindo o fluxo de Pull Request do projeto.

---

## Reporting a Vulnerability

Se você encontrou uma vulnerabilidade no projeto **Linka**, não abra uma issue pública com detalhes técnicos exploráveis.

Prefira reportar a falha por um canal privado para os mantenedores do projeto.

Caso o GitHub Security Advisories esteja habilitado no repositório, utilize a opção:

`Security > Report a vulnerability`

Se esse recurso não estiver disponível, entre em contato diretamente com os responsáveis pelo projeto por um canal privado.

Ao reportar, inclua o máximo possível das seguintes informações:

* Descrição clara da vulnerabilidade;
* Passos para reproduzir o problema;
* Impacto esperado ou comprovado;
* Arquivos, rotas, telas, tabelas ou políticas afetadas;
* Evidências, como prints, logs ou payloads de teste;
* Sugestão de correção, se houver;
* Nível estimado de severidade: baixa, média, alta ou crítica.

---

## Security Scope

Estão dentro do escopo de segurança:

* Código fonte deste repositório;
* Fluxos de autenticação e autorização;
* Regras de acesso a dados;
* Políticas de Row Level Security, caso aplicável;
* Integrações com Supabase;
* Funções, queries, migrations e scripts relacionados ao banco;
* Vazamento de credenciais ou tokens;
* Configurações inseguras de ambiente;
* Falhas que permitam leitura, alteração ou exclusão indevida de dados;
* Falhas que permitam acesso administrativo indevido;
* Dependências vulneráveis utilizadas pelo projeto.

---

## Out of Scope

Normalmente, não serão considerados vulnerabilidades válidas:

* Relatórios gerados apenas por scanners automáticos, sem prova de impacto real;
* Ataques de negação de serviço sem autorização prévia;
* Engenharia social contra membros do projeto;
* Ataques físicos contra dispositivos ou contas pessoais;
* Falhas em serviços de terceiros sem impacto direto no Linka;
* Problemas puramente visuais sem impacto em segurança;
* Clickjacking sem impacto sensível comprovado;
* Enumeração sem exposição de dados sensíveis;
* Reports duplicados ou sem instruções mínimas de reprodução.

---

## Sensitive Data and Secrets

Nunca devem ser commitados no repositório:

* Chaves privadas;
* Tokens de acesso;
* Senhas;
* Arquivos `.env`;
* Supabase `service_role key`;
* Credenciais de banco de dados;
* Chaves privadas de APIs externas;
* Certificados;
* Credenciais de deploy;
* Tokens de CI/CD.

A chave pública `anon` do Supabase pode aparecer no frontend quando necessário, mas a segurança dos dados deve depender de políticas corretas de acesso, principalmente Row Level Security, e não da tentativa de esconder essa chave.

---

## Responsible Disclosure

Ao testar uma vulnerabilidade, siga estas regras:

* Não acesse dados de outros usuários além do necessário para comprovar a falha;
* Não modifique, exclua ou extraia dados reais;
* Não interrompa o funcionamento da aplicação;
* Não explore a falha além do necessário para validação;
* Não publique detalhes antes da correção ser disponibilizada;
* Não compartilhe credenciais, tokens ou dados sensíveis encontrados.

---

## Vulnerability Handling Process

Após o recebimento de um report de segurança, os mantenedores devem:

1. Confirmar o recebimento do report;
2. Reproduzir e validar a vulnerabilidade;
3. Classificar a severidade;
4. Criar uma correção em branch separada;
5. Revisar a correção via Pull Request;
6. Adicionar testes ou validações quando aplicável;
7. Realizar o merge com segurança na `main`;
8. Rotacionar credenciais caso tenha ocorrido exposição;
9. Documentar a correção, quando necessário.

---

## Severity Guidelines

| Severidade | Exemplos                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| Crítica    | Acesso administrativo indevido, vazamento massivo de dados, exposição de `service_role key`, execução remota de código |
| Alta       | Bypass de autenticação, acesso a dados de outros usuários, alteração indevida de registros sensíveis                   |
| Média      | Falha de autorização limitada, exposição parcial de informações, validação insuficiente com impacto real               |
| Baixa      | Erros de configuração com baixo impacto, mensagens excessivamente detalhadas, pequenas exposições sem dados sensíveis  |

---

## Pull Request Security Checklist

Antes de aprovar ou realizar merge de um Pull Request, verifique:

* O PR não expõe tokens, senhas ou arquivos `.env`;
* O PR não remove validações importantes;
* O PR não enfraquece regras de autenticação ou autorização;
* O PR não quebra políticas de acesso a dados;
* O PR não adiciona dependências suspeitas ou desnecessárias;
* O PR não cria queries inseguras;
* O PR não permite acesso indevido a dados de outros usuários;
* O PR está compatível com a issue relacionada;
* O PR não apresenta conflito com a branch `main`.

---

## Dependency Security

Dependências devem ser mantidas atualizadas sempre que possível.

Ao atualizar bibliotecas, verifique:

* Se a versão possui vulnerabilidades conhecidas;
* Se a atualização quebra compatibilidade;
* Se há mudanças em permissões, autenticação ou build;
* Se o projeto continua funcionando após a atualização.

Pull Requests automatizados de dependências devem ser revisados antes do merge.

---

## Database and Supabase Security

Alterações relacionadas ao Supabase devem ser revisadas com atenção especial.

Verifique principalmente:

* Se tabelas sensíveis possuem Row Level Security habilitado;
* Se policies impedem acesso indevido entre usuários;
* Se funções não usam privilégios elevados sem necessidade;
* Se migrations não removem constraints importantes;
* Se dados sensíveis não ficam públicos;
* Se buckets de storage possuem regras adequadas;
* Se a `service_role key` nunca é usada no frontend.

---

## Security Updates

Correções de segurança devem ter prioridade sobre melhorias comuns do projeto.

Quando uma vulnerabilidade for corrigida, os mantenedores podem publicar uma nota resumida informando:

* Tipo geral da falha;
* Impacto corrigido;
* Versão, commit ou PR da correção;
* Ação recomendada aos usuários ou desenvolvedores.

Detalhes técnicos exploráveis só devem ser divulgados após a correção estar aplicada.

---

## Contact

Canal de contato privado para segurança:

`TODO: yago.ten.menezes@outlook.com`

Enquanto este canal não estiver definido, vulnerabilidades devem ser reportadas diretamente aos mantenedores do projeto por meio de comunicação privada.
