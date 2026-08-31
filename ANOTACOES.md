# Anotacoes — Tarefa 27, Micro Frontends

## Estrutura

| App | Papel | Porta |
| --- | --- | --- |
| container | Importa os dois micros | 3000 |
| cardapio | Lista de pratos com botao de adicionar | 3001 |
| pedido | Mostra os itens escolhidos | 3002 |

Monorepo com um unico repositorio Git na raiz. O `.git` criado pelo `create-next-app`
dentro de cada app e removido para nao virar repositorio aninhado.

## Decisoes

**Next.js em vez de React puro com Webpack.** O enunciado exige React, Webpack Module
Federation e JavaScript. A parte pratica da aula usa Next.js e o proprio enunciado
recomenda Next 12 a 15 com Pages Router, entao seguimos por ai.

**Versoes.** Next 15.5.7, React e React DOM 19.1.2, Pages Router, sem Turbopack, sem
TypeScript, sem ESLint, sem Tailwind, com pasta `src` e alias `@/*`.

**Turbopack desligado.** O Module Federation e um plugin de Webpack. Com Turbopack o
plugin nao roda.

**CVE-2025-66478.** O `create-next-app` instalou o Next 15.5.3, com essa falha critica.
Ela atinge apenas App Router com Server Components, entao o projeto nunca esteve
exposto, mas atualizamos para 15.5.7 assim mesmo.

**Tres avisos altos no `npm audit`, deixados de proposito.** O `npm audit fix` levaria o
Next para a versao 16, incompativel com Module Federation. Os avisos sao de App Router,
Server Actions, Middleware, Image Optimizer, postcss e sharp, recursos que este projeto
nao usa.

**Divergencias da aula, porque o enunciado tem preferencia.**

| Ponto | Aula | Nossa decisao |
| --- | --- | --- |
| Nomes dos micros | catalogo, carrinho | cardapio, pedido |
| Dados dos pratos | array de strings | objetos com nome e descricao |
| Componentes | JSX solto dentro do `map` | componente com props |
| Import no container | `next/dynamic` | `React.lazy` e `Suspense` num wrapper |
| `cross-env` | usa | nao usar, o enunciado pede evitar dependencias |

**React.lazy.** O enunciado sugere `React.lazy` com `Suspense`, a aula usa
`next/dynamic`. A saida e um wrapper por micro em `container/src/components`, que faz o
`React.lazy` e o `Suspense` internamente. A pagina do container importa esse wrapper com
`next/dynamic` e `ssr: false`, porque o modulo remoto so existe no navegador.

**Bug herdado da aula, a corrigir no micro Pedido.** O `useEffect` que registra o
listener precisa retornar o `removeEventListener`. Sem isso, com `reactStrictMode: true`,
o React monta o efeito duas vezes em desenvolvimento e cada clique duplica o item.

**Script de dev no Windows.** O plugin exige `NEXT_PRIVATE_LOCAL_WEBPACK=true` e webpack
instalado localmente. O script usa `set VAR=true && next dev`, que so funciona no cmd do
Windows. A variante com `export` fica documentada no README, em vez de instalar
`cross-env`.

## Testes feitos

**Micro Cardapio isolado, porta 3001.** Os cinco pratos aparecem com nome, descricao e
botao. O evento global foi testado no console com
`window.addEventListener("adicionarAoPedido", (e) => console.log(e.detail));` e os cinco
cliques logaram o objeto completo do prato.

## Ambiente

Projeto dentro do OneDrive. Com tres pastas `node_modules` sincronizando pode aparecer
erro de arquivo bloqueado no `npm install`. Se acontecer, pausar a sincronizacao.

Terminal em uso: PowerShell.

### Micro Pedido isolado, porta 3002

O componente `Pedido` escuta o evento global `adicionarAoPedido` e acumula os pratos
recebidos em `e.detail`. O `ItemPedido` só recebe o prato por props e exibe nome e
descrição, sem estado próprio.

Com a lista vazia aparece a mensagem "Nenhum item adicionado ainda.".

O evento foi disparado à mão no console do DevTools:

`window.dispatchEvent(new CustomEvent("adicionarAoPedido", { detail: { id: 1, nome: "Prego no Pão", descricao: "teste" } }));`

Dois disparos resultaram em dois itens na lista, confirmando que o `removeEventListener`
no retorno do `useEffect` evita o listener duplicado do `reactStrictMode` em
desenvolvimento. Sem essa limpeza, cada clique adicionaria o item duas vezes.

O `padding` e a fonte definidos na página de teste não aparecem no navegador, porque o
`globals.css` do Next entra depois na ordem de estilos. É só aparência da página de teste
isolado, não afeta o componente que vai para o container.

Versões alinhadas com o cardápio: Next 15.5.7, React e React DOM 19.1.2. O
`create-next-app` havia instalado React 19.1.0, atualizado para os dois micros
compartilharem a mesma versão quando o container carregar os remotes.