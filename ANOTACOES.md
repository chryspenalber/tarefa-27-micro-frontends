# Anotações — Tarefa 27, Micro Frontends

## Estrutura

| App       | Papel                                  | Porta |
| --------- | -------------------------------------- | ----- |
| container | Importa os dois micros                 | 3000  |
| cardapio  | Lista de pratos com botão de adicionar | 3001  |
| pedido    | Mostra os itens escolhidos             | 3002  |

Monorepo com um único repositório Git na raiz. O `.git` criado pelo `create-next-app`
dentro de cada app é removido para não virar repositório aninhado.

## Decisões

**Next.js em vez de React puro com Webpack.** O enunciado exige React, Webpack Module
Federation e JavaScript. A parte prática da aula usa Next.js e o próprio enunciado
recomenda Next 12 a 15 com Pages Router, então seguimos por aí.

**Versões.** Next 15.5.7, React e React DOM 19.1.2, Pages Router, sem Turbopack, sem
TypeScript, sem ESLint, sem Tailwind, com pasta `src` e alias `@/*`.

**Turbopack desligado.** O Module Federation é um plugin de Webpack. Com Turbopack o
plugin não roda.

**CVE-2025-66478.** O `create-next-app` instalou o Next 15.5.3, com essa falha crítica.
Ela atinge apenas App Router com Server Components, então o projeto nunca esteve
exposto, mas atualizamos para 15.5.7 assim mesmo.

**Três avisos altos no `npm audit`, deixados de propósito.** O `npm audit fix` levaria o
Next para a versão 16, incompatível com Module Federation. Os avisos são de App Router,
Server Actions, Middleware, Image Optimizer, postcss e sharp, recursos que este projeto
não usa.

**Divergências da aula, porque o enunciado tem preferência.**

| Ponto               | Aula                      | Nossa decisão                                  |
| ------------------- | ------------------------- | ---------------------------------------------- |
| Nomes dos micros    | catalogo, carrinho        | cardapio, pedido                               |
| Dados dos pratos    | array de strings          | objetos com nome e descrição                   |
| Componentes         | JSX solto dentro do `map` | componente com props                           |
| Import no container | `next/dynamic`            | `React.lazy` e `Suspense` num wrapper          |
| `cross-env`         | usa                       | não usar, o enunciado pede evitar dependências |

**React.lazy.** O enunciado sugere `React.lazy` com `Suspense`, a aula usa
`next/dynamic`. A saída é um wrapper por micro em `container/src/components`, que faz o
`React.lazy` e o `Suspense` internamente. A página do container importa esse wrapper com
`next/dynamic` e `ssr: false`, porque o módulo remoto só existe no navegador.

**Bug herdado da aula, corrigido no micro Pedido.** O `useEffect` que registra o listener
retorna o `removeEventListener`. Sem essa limpeza, com `reactStrictMode: true`, o React
monta o efeito duas vezes em desenvolvimento e cada clique duplica o item.

**Script de dev no Windows.** O plugin exige `NEXT_PRIVATE_LOCAL_WEBPACK=true` e webpack
instalado localmente. O script usa `set VAR=true && next dev`, que só funciona no cmd do
Windows. A variante com `export` fica documentada no README, em vez de instalar
`cross-env`.

## Testes feitos

**Micro Cardápio isolado, porta 3001.** Os cinco pratos aparecem com nome, descrição e
botão. O evento global foi testado no console com
`window.addEventListener("adicionarAoPedido", (e) => console.log(e.detail));` e os cinco
cliques logaram o objeto completo do prato.

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

O `map` da lista usa o índice como `key`, e não o `id` do prato. No pedido o mesmo prato
pode ser adicionado mais de uma vez, então o `id` deixa de ser único ali. A lista só
cresce no fim, nunca reordena nem remove itens, o que torna o índice estável nesse caso.

Versões alinhadas com o cardápio: Next 15.5.7, React e React DOM 19.1.2. O
`create-next-app` havia instalado React 19.1.0, atualizado para os dois micros
compartilharem a mesma versão quando o container carregar os remotes.

## Ambiente

Projeto dentro do OneDrive. Com três pastas `node_modules` sincronizando pode aparecer
erro de arquivo bloqueado no `npm install`. Se acontecer, pausar a sincronização.

Terminal em uso: PowerShell.

