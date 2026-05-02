<div align="center">

[![Vercel](https://img.shields.io/badge/Vercel-Go%20Function-black?logo=vercel)](https://vercel.com/)
[![Saída](https://img.shields.io/badge/sa%C3%ADda-SVG%20card-a87770)](https://developer.mozilla.org/en-US/docs/Web/SVG)
[![Fonte de dados](https://img.shields.io/badge/dados-GitHub%20API-181717?logo=github)](https://docs.github.com/en/rest)
[![Runtime](https://img.shields.io/badge/runtime-Go%20only-1f7a5c)](./api/)
[![Licença](https://img.shields.io/badge/licen%C3%A7a-ISC-2d7ff9)](./LICENSE)

</div>

# Language Count

Language Count é um card de linguagens do GitHub implementado em Go, com saída SVG determinística e um único endpoint HTTP. O deploy de produção é Go-only na Vercel.

[English](./README.md)

## O Que O Projeto Faz

O endpoint agrega os bytes de linguagem dos repositórios públicos de um perfil no GitHub e renderiza um card SVG pronto para README.

Comportamentos preservados da versão anterior:

- um endpoint público
- um único formato de saída SVG
- mesmo contrato de parâmetros
- mesmos estados de erro e fallback
- mesma semântica de coleta na GitHub API
- mesma política de cache
- mesmo sistema de temas e animações

## Uso

Endpoint base:

```text
https://language-count.joaopdias.dev.br/
```

Exemplo real:

```text
https://language-count.joaopdias.dev.br/?username=Joaopdiasventura
```

Embed para README:

```md
![Most Used Languages](https://language-count.joaopdias.dev.br/?username=Joaopdiasventura)
```

## Parâmetros de Query

| Parâmetro | Tipo | Padrão | Faixa / Formato | Observações |
| --- | --- | --- | --- | --- |
| `username` | string | nenhum | username do GitHub | Obrigatório. |
| `hide` | string separada por vírgula | nenhum | `html,css,shell` | Case-insensitive. Estende a lista interna de linguagens ocultas. |
| `langs_count` | inteiro | `6` | `1-20` | Máximo de linguagens renderizadas. |
| `limit` | inteiro | nenhum | `1-20` | Alias legado. Tem precedência sobre `langs_count` quando não está vazio. |
| `card_width` | inteiro | `360` | `280-560` | Largura do SVG em pixels. A altura é calculada pelo layout. |
| `theme` | string | `red` | `red`, `blue`, `yellow`, `purple`, `green`, `white` | Case-insensitive. Valores inválidos caem para `red`. |
| `disable_animations` | boolean | `false` | `true`, `false`, `1`, `0` | Só `true` e `1` desabilitam animação. |

Parâmetros repetidos mantêm o primeiro valor, exatamente como na implementação legada.

## Arquitetura de Produção

```text
.
├─ api/
│  └─ index.go
├─ cmd/
│  └─ langcount/
│     └─ main.go
├─ internal/
│  ├─ githubapi/
│  ├─ httpapi/
│  ├─ model/
│  ├─ pipeline/
│  ├─ svg/
│  ├─ theme/
│  └─ util/
├─ go.mod
└─ vercel.json
```

### Fluxo de requisição

1. Faz o parse dos parâmetros com as mesmas regras de normalização e clamp da versão JS.
2. Busca `GET /users/{username}/repos?per_page=100&type=owner`.
3. Ignora forks.
4. Busca cada `languages_url` em paralelo, compartilhando o mesmo `context.Context`.
5. Ignora respostas não-2xx por repositório sem derrubar a requisição inteira.
6. Aborta a requisição em falhas de transporte ou decode, preservando a semântica de erro antiga.
7. Agrega os bytes com desempate determinístico por ordem de repositório.
8. Renderiza um SVG autocontido com a fonte Azonix embutida e gradientes por tema.

### Responsabilidade dos pacotes

- `internal/httpapi`: parse de query, seleção de estado, headers e tratamento de erro no topo.
- `internal/githubapi`: cliente HTTP do GitHub, headers de upstream e decode ordenado de JSON.
- `internal/pipeline`: filtros, coleta concorrente e agregação determinística.
- `internal/svg`: matemática de layout, embed da fonte e montagem do SVG.
- `internal/theme`: paletas e cores por linguagem.
- `internal/util`: helpers compatíveis com o comportamento do JS em texto, matemática e cores.

## Garantias de Compatibilidade

A migração foi tratada como troca de runtime, não como redesign de produto.

Comportamentos preservados:

- status codes
- `Content-Type` e `Cache-Control` apenas em sucesso
- estrutura do SVG e textos dos estados de fallback
- semântica dos parâmetros, incluindo quirks de parsing
- lista padrão de linguagens ocultas
- seleção de tema e toggle de animação
- leitura apenas da primeira página de repositórios
- exclusão de forks
- skip silencioso de `languages_url` com resposta não-2xx

Melhoria determinística aplicada de forma consciente:

- empates de bytes iguais agora são resolvidos pela ordem dos repositórios, e não pela ordem de conclusão das requests

Esse foi o único ajuste de política aprovado no planejamento, para remover nondeterminismo sem alterar a semântica dos dados.

## Desenvolvimento

Servidor local em Go:

```bash
go run ./cmd/langcount
```

URL local padrão:

```text
http://localhost:3000/?username=Joaopdiasventura
```

Variável de ambiente opcional:

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `GITHUB_TOKEN` | Não | Token opcional para autenticar chamadas na GitHub API. |

## Validação e Testes

Suíte principal:

```bash
go test ./...
```

Suíte de regressão comportamental:

```bash
go test ./internal/httpapi -run TestAppScenarios -v
```

Checksums congelados de saídas representativas:

```bash
go test ./internal/httpapi -run TestRepresentativeGoldenChecksums -v
```

Benchmarks:

```bash
go test -run ^$ -bench . ./internal/pipeline ./internal/svg
```

Amostra de benchmark desta migração em `windows/amd64`:

```text
BenchmarkAggregateRepositoryLanguages-12    57764    21279 ns/op    5356 B/op    110 allocs/op
BenchmarkCreateSVG-12                        6302   199596 ns/op  177367 B/op   1038 allocs/op
```

Race detector:

```bash
go test -race ./...
```

No ambiente local atual em Windows, esse comando não pôde rodar porque `gcc` não estava instalado.

## Deploy

`vercel.json` roteia todas as paths para o handler Go e preserva o limite original de `maxDuration: 10`.

Deploy com dashboard ou CLI:

```bash
vercel
vercel --prod
```

## Observações

- O SVG continua autocontido e seguro para embed mesmo em estados de erro.
- A fonte é embutida em startup com Go embed, sem leitura de disco por requisição.
- O repositório agora é totalmente Go-only; o scaffolding legado da migração foi removido após o congelamento das saídas em testes.
