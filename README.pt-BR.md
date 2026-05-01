<div align="center">

[![Vercel](https://img.shields.io/badge/Vercel-Serverless-black?logo=vercel)](https://vercel.com/)
[![Saída](https://img.shields.io/badge/sa%C3%ADda-SVG%20card-a87770)](https://developer.mozilla.org/en-US/docs/Web/SVG)
[![Fonte de dados](https://img.shields.io/badge/dados-GitHub%20API-181717?logo=github)](https://docs.github.com/en/rest)
[![README Ready](https://img.shields.io/badge/integra%C3%A7%C3%A3o-GitHub%20README-24292f?logo=github)](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme)
[![Licença](https://img.shields.io/badge/licen%C3%A7a-ISC-2d7ff9)](./package.json)

</div>

# Language Count

Um card premium de linguagens do GitHub, orientado a README e implementado como uma única serverless function na Vercel.

O Language Count foi pensado para quem quer uma alternativa mais refinada aos widgets genéricos de perfil: um endpoint, um resultado focado, parâmetros previsíveis, geometria SVG controlada e estados de fallback que continuam renderizando como imagem.

[English](./README.md)

## Visão Geral

O Language Count gera um card SVG dinâmico que resume a distribuição de linguagens de um perfil no GitHub, agregando os bytes de linguagem retornados pela GitHub API.

O escopo é intencionalmente enxuto:

- um endpoint público
- um card visual
- um modelo de dados baseado em bytes de linguagem
- um formato de saída otimizado para README e portfólio

O projeto se inspira visualmente no antigo card de linguagens do `github-readme-stats`, mas segue uma direção mais opinativa em apresentação, consistência de layout e qualidade dos estados de erro.

## Demonstração

**Endpoint em produção**

`https://language-count.joaopdias.dev.br/`

**Exemplo real**

`https://language-count.joaopdias.dev.br/?username=Joaopdiasventura`

![Demonstração do Language Count](https://language-count.joaopdias.dev.br/?username=Joaopdiasventura&langs_count=6&card_width=420)

## Proposta do Projeto

Muitos cards de linguagem resolvem apenas a parte dos dados. O Language Count trata o próprio SVG como superfície de produto.

Objetivos centrais:

- entregar um card visualmente sofisticado, e não um bloco que pareça gerado automaticamente
- funcionar bem dentro das restrições de renderização do GitHub README
- preservar legibilidade em larguras menores
- evitar overflow, clipping e desalinhamento
- manter uma interface pública pequena o suficiente para continuar estável

## Diferenciais Principais

| Área | Language Count |
| --- | --- |
| Tratamento visual | Estilo dark premium com hierarquia forte e acentos discretos |
| Estratégia de layout | Espaçamento guiado por largura e clipping estrito para manter tudo dentro da viewport |
| Tratamento de erro | Estados vazios, inválidos e indisponíveis continuam retornando um card SVG legível |
| Alvo de integração | Otimizado para embeds em GitHub README e portfólio |
| Filtros | Lista padrão de linguagens ocultas + `hide` customizado e case-insensitive |
| Runtime | Uma única serverless function Vercel, sem JavaScript no cliente |

## Recursos Suportados

- Geração dinâmica de SVG
- Agregação de linguagens de perfis GitHub
- Filtro case-insensitive por linguagem
- Controle da quantidade de linguagens exibidas
- Controle da largura do card
- Flag para desabilitar animações
- Estados de erro seguros para embed de imagem
- Cache compatível com Vercel
- Comportamento amigável para README

## Início Rápido

O uso mínimo precisa apenas do nome de usuário do GitHub.

```md
![Most Used Languages](https://language-count.joaopdias.dev.br/?username=Joaopdiasventura)
```

Para um card um pouco mais largo em README ou portfólio:

```md
![Most Used Languages](https://language-count.joaopdias.dev.br/?username=Joaopdiasventura&card_width=420)
```

## Parâmetros de Query

| Parâmetro | Tipo | Padrão | Faixa / Formato | Descrição |
| --- | --- | --- | --- | --- |
| `username` | string | nenhum | username do GitHub | Perfil analisado. Obrigatório. |
| `hide` | string separada por vírgula | nenhum | `html,css,shell` | Linguagens adicionais a ocultar. O match é case-insensitive. |
| `langs_count` | inteiro | `6` | `1-20` | Quantidade máxima de linguagens renderizadas. |
| `card_width` | inteiro | `360` | `280-560` | Largura do card em pixels SVG. A altura é calculada automaticamente. |
| `disable_animations` | boolean | `false` | `true`, `false`, `1`, `0` | Desabilita a animação de entrada das linhas e barras. |

## Nota de Migração

Se você vem do `github-readme-stats` ou de widgets parecidos, o mapeamento conceitual mais próximo é:

| Conceito | Language Count | Observação |
| --- | --- | --- |
| Username | `username` | Mesmo papel. |
| Limite de linguagens | `langs_count` | Equivalente atual ao conceito de “limit”. |
| Ocultar linguagens | `hide` | Suportado hoje. |
| Largura | `card_width` | Suportado hoje. |
| Tema | Não disponível | A API pública atual não inclui troca de tema. |
| Desligar animação | `disable_animations` | Suportado hoje. |

## Exemplos de Uso

### Card base

```text
https://language-count.joaopdias.dev.br/?username=Joaopdiasventura
```

### Limitar a quantidade de linguagens visíveis

Neste projeto, o controle de limite é feito por `langs_count`.

```text
https://language-count.joaopdias.dev.br/?username=Joaopdiasventura&langs_count=4
```

### Ocultar linguagens específicas

```text
https://language-count.joaopdias.dev.br/?username=Joaopdiasventura&hide=html,css
```

### Filtros sem depender de casing

```text
https://language-count.joaopdias.dev.br/?username=Joaopdiasventura&hide=Html,CSS
```

### Card mais largo para README ou portfólio

```text
https://language-count.joaopdias.dev.br/?username=Joaopdiasventura&card_width=480
```

### Renderização estática para ambientes sem movimento

```text
https://language-count.joaopdias.dev.br/?username=Joaopdiasventura&disable_animations=true
```

### Exemplo combinado

```text
https://language-count.joaopdias.dev.br/?username=Joaopdiasventura&langs_count=8&hide=html,css&card_width=420&disable_animations=true
```

## Integração com GitHub README

### Imagem em Markdown

```md
![Most Used Languages](https://language-count.joaopdias.dev.br/?username=Joaopdiasventura)
```

### Imagem com link

```md
[![Most Used Languages](https://language-count.joaopdias.dev.br/?username=Joaopdiasventura)](https://github.com/Joaopdiasventura)
```

### HTML com largura explícita

```html
<img
  src="https://language-count.joaopdias.dev.br/?username=Joaopdiasventura&card_width=420"
  alt="Most used languages for Joaopdiasventura"
  width="420"
/>
```

### Exemplo em Markdown com filtros

```md
![Most Used Languages](https://language-count.joaopdias.dev.br/?username=Joaopdiasventura&hide=html,css&langs_count=5)
```

## Funcionamento Interno

O pipeline do Language Count é simples, mas intencional.

1. Faz o parse e a normalização dos parâmetros.
2. Monta o conjunto de linguagens ocultas.
3. Busca os repositórios do usuário na GitHub REST API.
4. Ignora forks.
5. Busca o `languages_url` de cada repositório restante em paralelo.
6. Agrega os bytes por linguagem.
7. Remove linguagens ocultas.
8. Calcula percentuais a partir do volume total de bytes.
9. Ordena as linguagens de forma decrescente.
10. Renderiza um SVG responsivo à largura e à quantidade de linhas.

## Arquitetura da Serverless Function

O projeto foi mantido propositalmente compacto:

```text
.
├─ api/
│  └─ index.mjs
├─ fonts/
│  └─ Azonix.otf
├─ package.json
├─ vercel.json
├─ README.md
└─ README.pt-BR.md
```

### Modelo de runtime

- Toda a superfície pública é atendida por `api/index.mjs`.
- O `vercel.json` redireciona todas as rotas para a mesma function.
- A function está configurada com `maxDuration: 10`.
- Não existe camada de persistência.
- O SVG não depende de build step no cliente.
- A fonte do SVG é embutida a partir de `fonts/Azonix.otf` em runtime.

## Pipeline de Coleta via GitHub API

A implementação atual usa:

- `GET /users/{username}/repos?per_page=100&type=owner`
- o `languages_url` de cada repositório

Comportamento importante:

- apenas repositórios do tipo owner entram no cálculo
- forks são ignorados
- hoje só a primeira página é considerada
- o modelo é baseado nos bytes de linguagem retornados pelo GitHub

Na prática, o card deve ser interpretado como **distribuição de bytes em repositórios públicos**, não como métrica de senioridade, domínio técnico ou relevância de projeto.

## Sistema de Filtros

O filtro combina duas camadas.

### Linguagens ocultas por padrão

Por padrão, o projeto já esconde linguagens mais ligadas a marcação, estilo ou infraestrutura, como:

- HTML
- CSS
- SCSS
- Less
- Blade
- Dockerfile
- Shell
- Batchfile
- PowerShell
- Makefile

### Lista customizada via `hide`

O parâmetro `hide` estende esse conjunto.

Exemplo:

```text
?username=Joaopdiasventura&hide=markdown,json
```

O match é case-insensitive.

## Modelo de Renderização SVG

O card não é um template estático. O renderer calcula a geometria com base na largura e na quantidade de linguagens.

Elementos renderizados:

- shell do card e sistema de bordas
- bloco de header
- linha divisória
- grade de linhas
- dots de linguagem
- labels alinhadas
- percentuais em coluna fixa
- barras com limite máximo do layout
- painel de estado vazio ou erro

O conteúdo decorativo também é clipado ao shape do card para evitar qualquer vazamento visual além do container arredondado.

## Sistema de Animações

O projeto usa animações SMIL discretas para manter o SVG autocontido.

Comportamento atual:

- as linhas entram com fade e pequeno stagger
- as barras crescem a partir de largura zero
- a animação roda uma vez
- não há loops infinitos
- `disable_animations=true` gera o estado final estático

## Compatibilidade

| Alvo | Status | Observação |
| --- | --- | --- |
| Embeds remotos em GitHub README | Suportado | Alvo principal. |
| README de perfil no GitHub | Suportado | Funciona com imagem Markdown padrão. |
| Portfólio pessoal | Suportado | Pode ser usado com Markdown ou `<img>`. |
| Ambientes que preferem imagem estática | Suportado | Use `disable_animations=true`. |
| Troca de tema por query param | Não suportado | A API pública foi mantida fixa. |
| Fonte customizada embutida | Suportado | O SVG incorpora `Azonix.otf` diretamente. |

## Estratégia de Cache

O endpoint responde com:

```text
Cache-Control: s-maxage=3600, stale-while-revalidate=86400
```

Na prática:

- a Vercel pode reutilizar o resultado por até 1 hora
- conteúdo stale pode continuar sendo servido enquanto a versão nova é regenerada
- requisições repetidas ficam mais baratas do que recalcular o card a cada acesso

## Performance

O projeto é pequeno, mas há decisões explícitas de performance:

- as buscas dos `languages_url` são executadas com `Promise.all`
- o SVG é montado como string, sem runtime de navegador
- largura e altura são calculadas com helpers matemáticos leves
- a resposta é cacheável
- um token opcional do GitHub ajuda a aliviar rate limits

## Tratamento de Erros

A function tenta sempre retornar um corpo SVG válido, mesmo quando a requisição ao GitHub falha.

| Cenário | Status HTTP | Comportamento do card |
| --- | --- | --- |
| `username` ausente | `400` | Retorna um card SVG pedindo o parâmetro |
| Usuário inexistente | `404` | Retorna um card SVG de perfil indisponível |
| Rate limit / falha upstream | status do upstream | Retorna um card SVG de indisponibilidade |
| Erro interno inesperado | `500` | Retorna um card SVG de erro de geração |

Para embeds de imagem, isso é importante: um fallback legível é melhor do que uma imagem quebrada.

## Limitações

- Hoje o projeto considera apenas os primeiros 100 repositórios owner.
- Repositórios de organização não entram, a menos que sejam diretamente do owner consultado.
- Forks são ignorados de propósito.
- O card não suporta temas customizados.
- O visual atual é dark-only.
- O card é baseado em bytes de linguagem do GitHub, não em linhas de código ou prioridade de projeto.
- Mesmo com `GITHUB_TOKEN`, a enumeração de repositórios continua usando o endpoint público `/users/{username}/repos`.
- O repositório não possui suíte automatizada de testes.

## Deploy na Vercel

### Opção 1: Importar o repositório

1. Crie um novo projeto na Vercel a partir do repositório.
2. Adicione `GITHUB_TOKEN` se quiser maior resiliência contra rate limits.
3. Faça o deploy.

### Opção 2: Vercel CLI

```bash
npm install
npx vercel
npx vercel --prod
```

O `vercel.json` já mapeia todas as rotas para `api/index.mjs`.

## Desenvolvimento Local

### Pré-requisitos

- Node.js 18 ou superior
- Vercel CLI para emular a function localmente
- `fonts/Azonix.otf` disponível no repositório

### Executando localmente

```bash
npm install
npx vercel dev
```

Depois acesse:

```text
http://localhost:3000/?username=Joaopdiasventura
```

### Ideias de validação local

- testar `langs_count=1`, `6`, `8` e `20`
- testar larguras menores, como `280` e `320`
- testar `hide=Html,CSS`
- testar `disable_animations=true`
- testar ausência de `username`
- testar usuário inválido

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `GITHUB_TOKEN` | Não | Token opcional do GitHub para autenticar as requisições e reduzir problemas de rate limit. |

## Licença

Hoje o projeto está declarado como **ISC** em [`package.json`](./package.json).
