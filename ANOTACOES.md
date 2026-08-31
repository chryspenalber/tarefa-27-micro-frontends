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

**Module Federation, versões que funcionam juntas.** Foram necessárias três descobertas
até o micro Cardápio subir com o plugin ativo.

O Next 15.5.7 tem um plugin interno que trata `resolveContext.stack` como um `Set` e
chama `.delete()` nele. A partir da versão 5.21.0 do `enhanced-resolve`, usado pelo
webpack, esse `stack` deixou de ser um `Set`, o que provoca
`stack?.delete is not a function`. O erro só aparece com
`NEXT_PRIVATE_LOCAL_WEBPACK=true`, porque aí o Next passa a usar o webpack da pasta em
vez da cópia interna dele. Escolher outra versão do webpack não resolve, já que toda a
linha 5.x aceita `^5.17.x`, faixa que inclui as versões quebradas. A saída foi fixar o
`enhanced-resolve` em 5.20.1 pelo campo `overrides` do npm, que força a versão de uma
dependência indireta.

A versão 8.8.74 do plugin, a mais recente, falha na build com um `import` de
`node:module` que o webpack não empacota para o navegador.

Na versão 8.8.27 o compartilhamento de React está comentado no código do próprio plugin,
em `DEFAULT_SHARE_SCOPE`. Sem isso o app e o runtime do plugin carregam duas cópias de
React, e a página fica branca com `Invalid hook call` e
`Cannot read properties of null (reading 'useLayoutEffect')`. Declarar `shared` à mão não
corrige, testado com e sem `singleton`, com `eager` e aplicando o plugin só no cliente.
Com React 18 o erro é o mesmo, então não é questão de versão do React.

A 8.8.54 tem o React compartilhado e não tem o `node:module`. Conjunto validado em modo
dev e em build de produção: Next 15.5.7, React e React DOM 19.1.2, plugin 8.8.54, webpack
5.101.0 como dependência de desenvolvimento e `enhanced-resolve` 5.20.1 no `overrides`.

**Sem bloco `shared` no `next.config.mjs`.** O plugin já compartilha React internamente.
Declarar `shared` à mão faz a build falhar na geração das páginas de erro, com
`Cannot read properties of null (reading 'useContext')`.

**Aumento dos avisos do `npm audit`.** Os avisos passaram de 3 para 14 depois do plugin,
por causa da árvore de dependências que ele traz. Fica registrado como limitação
assumida, já que o `npm audit fix` desfaz as versões fixas de que o projeto depende.

**Next 15.5.7 está deprecado.** Todas as versões de 15.5.0 a 15.5.8 estão marcadas como
deprecadas no npm por falha de segurança, corrigida a partir da 15.5.9. O projeto
permanece na 15.5.7 por decisão de escopo, para não reabrir a validação do conjunto de
versões. Fica registrado como limitação conhecida.

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

### Module Federation nos dois micros

Cada micro expõe apenas o seu componente principal, não a página. As páginas `index`
continuam existindo só para o teste isolado.

| Micro | `name` | Exposto | `remoteEntry.js` |
| --- | --- | --- | --- |
| cardapio | cardapio | `./Cardapio` | `localhost:3001/_next/static/chunks/remoteEntry.js` |
| pedido | pedido | `./Pedido` | `localhost:3002/_next/static/chunks/remoteEntry.js` |

Nos dois, o `remoteEntry.js` foi aberto no navegador e responde com o JavaScript do
runtime do Module Federation, incluindo o `attachShareScopeMap`, que é o mecanismo de
compartilhamento de React.

O console do DevTools ficou limpo nos dois, sem o `Invalid hook call` que aparecia com a
versão anterior do plugin. O evento global foi disparado à mão no 3002 com o plugin ativo
e o item apareceu uma vez só, confirmando que a federação não interferiu na comunicação.

## Ambiente

Projeto dentro do OneDrive. Com três pastas `node_modules` sincronizando pode aparecer
erro de arquivo bloqueado no `npm install`. Se acontecer, pausar a sincronização.

Terminal em uso: PowerShell.

