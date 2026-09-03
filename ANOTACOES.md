# Anotações — Tarefa 27, Micro Frontends

Onde eu registro as decisões que tomei, os erros que apareceram e os testes que fiz. A explicação da estrutura, da comunicação e de como executar está no `README.md`.

---

## Decisões

**Next.js em vez de React puro com Webpack.** O enunciado exige React, Webpack Module Federation e JavaScript, e recomenda Next entre as versões 12 e 15 com Pages Router.

**Versões.** Next 15.5.7, React e React DOM 19.1.2, Pages Router, sem Turbopack, sem TypeScript, sem ESLint, sem Tailwind, com pasta `src` e alias `@/*`.

**Turbopack desligado.** O Module Federation é um plugin de Webpack. Com Turbopack o plugin não roda.

**Um único repositório Git na raiz.** O `.git` criado pelo create-next-app` dentro de cada app foi removido, para não virar repositório aninhado.

**Wrappers com `React.lazy` no container.** O enunciado sugere `React.lazy` com `Suspense`. Cada micro tem um wrapper em `container/src/components` que faz o `React.lazy` e o `Suspense` internamente, e a página importa esse wrapper com `next/dynamic` e `ssr: false`, porque o módulo remoto só existe no navegador. Assim o padrão pedido pelo enunciado fica visível no código e o SSR não quebra.

**Limpeza do listener no micro Pedido.** O `useEffect` que registra o listener retorna o `removeEventListener`. Sem essa limpeza, com `reactStrictMode: true`, o React monta o efeito duas vezes em desenvolvimento e cada clique duplica o item.

**`key` pelo índice na lista do pedido.** No pedido o mesmo prato pode ser adicionado mais de uma vez, então o `id` deixa de ser único ali. A lista só cresce no fim, nunca reordena nem remove itens, o que torna o índice estável nesse caso.

**Script de dev com `cross-env`.** O plugin exige `NEXT_PRIVATE_LOCAL_WEBPACK=true` e webpack instalado localmente. O `set VAR=true && next dev` só define a variável no cmd do Windows. No bash, `set` faz outra coisa, define parâmetros posicionais, e devolve sucesso, então o `next dev` roda sem a variável e sem erro visível. Nesse caso o Next usa a cópia interna de webpack e o Module Federation não funciona. O `cross-env` traduz a definição da variável para o sistema em uso. É dependência de desenvolvimento, não entra no bundle, então não conflita com a dica do enunciado sobre evitar dependências externas.
Confirmei abrindo o `remoteEntry.js` do cardápio no navegador, que responde com o runtime do plugin.

**Pasta do `remoteEntry` conforme o lado compilado.** O plugin publica o arquivo em `static/chunks` para o navegador e em `static/ssr` para o servidor. Por isso o `next.config.mjs` do container monta o endereço com `options.isServer ? "ssr" : "chunks"`. Sem essa troca, um dos lados busca um endereço que não existe.

**Sem bloco `shared` no `next.config.mjs`.** O plugin já compartilha React internamente.
Declarar `shared` à mão faz a build falhar na geração das páginas de erro, com
`Cannot read properties of null (reading 'useContext')`.

---

## Module Federation, versões que funcionam juntas

Precisei de três descobertas até o micro Cardápio subir com o plugin ativo.

**`enhanced-resolve` fixado em 5.20.1.** O Next 15.5.7 tem um plugin interno que trata `resolveContext.stack` como um `Set` e chama `.delete()` nele. A partir da versão 5.21.0 do `enhanced-resolve`, usado pelo webpack, esse `stack` deixou de ser um `Set`, o que provoca `stack?.delete is not a function`. O erro só aparece com
`NEXT_PRIVATE_LOCAL_WEBPACK=true`, porque aí o Next passa a usar o webpack da pasta em vez da cópia interna dele. Tentei trocar a versão do webpack e não resolveu, porque toda a linha 5.x aceita `^5.17.x`, faixa que inclui as versões quebradas. Acabei fixando o `enhanced-resolve` pelo campo `overrides` do npm, que força a versão de uma dependência
indireta.

**Plugin 8.8.74 não serve.** A versão mais recente falha na build com um `import` de `node:module` que o webpack não empacota para o navegador.

**Plugin 8.8.27 não serve.** Nessa versão o compartilhamento de React está comentado no código do próprio plugin, em `DEFAULT_SHARE_SCOPE`. Sem isso o app e o runtime do plugin
carregam duas cópias de React, e a página fica branca com `Invalid hook call` e `Cannot read properties of null (reading 'useLayoutEffect')`. Achei que fosse configuração minha e tentei declarar `shared` à mão, com e sem `singleton`, com `eager` e aplicando o plugin só no cliente. Nada mudou. Testei também com React 18 e o erro foi o mesmo, o que descartou versão do React e me levou ao plugin.

**Conjunto que funcionou.** Plugin 8.8.54, que tem o React compartilhado e não tem o `node:module`. Testei em modo dev e em build de produção com Next 15.5.7, React e React DOM 19.1.2, webpack 5.101.0 como dependência de desenvolvimento e `enhanced-resolve` 5.20.1 no `overrides`.

---

## Segurança e avisos do npm

**CVE-2025-66478.** O `create-next-app` instalou o Next 15.5.3, com essa falha crítica.
Ela atinge apenas App Router com Server Components, então o projeto nunca esteve exposto, mas atualizei para 15.5.7 assim mesmo.

**Avisos do `npm audit`, de 3 para 14.** Subiram depois que instalei o plugin, por causa da árvore de dependências que ele traz. O `npm audit fix` desfaz as versões fixas de que o projeto depende, então deixei como está e registro aqui como limitação
assumida.

**Next 15.5.7 está deprecado.** Todas as versões de 15.5.0 a 15.5.8 estão marcadas como deprecadas no npm por falha de segurança, corrigida a partir da 15.5.9. A linha 15.5.x continua recebendo correções, e existe uma versão mais nova disponível para bump manual,
sem passar para o Next 16. Deixei de fora para não reabrir a validação do conjunto de versões perto da entrega.

---

## Testes feitos

**Micro Cardápio isolado, porta 3001.** Os cinco pratos aparecem com nome, descrição e botão. Escutei o evento global no console com `window.addEventListener("adicionarAoPedido", (e) => console.log(e.detail));` e os cinco cliques logaram o objeto completo do prato.

**Micro Pedido isolado, porta 3002.** Com a lista vazia aparece a mensagem "Nenhum item adicionado ainda.". Disparei o evento à mão no console do DevTools:

```js
window.dispatchEvent(
  new CustomEvent("adicionarAoPedido", {
    detail: { id: 1, nome: "Prego no Pão", descricao: "teste" },
  }),
);
```

Dois disparos deram dois itens na lista, o que confirma que o `removeEventListener` no retorno do `useEffect` evita o listener duplicado do `reactStrictMode` em desenvolvimento.

O `ItemPedido` só recebe o prato por props e exibe nome e descrição, sem estado próprio.

**Versões alinhadas entre os micros.** O `create-next-app` havia instalado React 19.1.0 no pedido, e subi para 19.1.2 para os dois micros compartilharem a mesma versão quando o container carregar os remotes.

**`remoteEntry.js` dos dois micros.** Abri no navegador nos dois casos e o arquivo responde com o JavaScript do runtime do Module Federation, incluindo o `attachShareScopeMap`, que é o mecanismo de compartilhamento de React. Console do DevTools limpo nos dois, sem o `Invalid hook call` que aparecia com a versão anterior do plugin. Disparei o evento à mão no 3002 com o plugin ativo e o item apareceu uma vez só, confirmando que a federação não interferiu na comunicação.

**Os três rodando juntos.** No `localhost:3000` os dois micros aparecem carregados por Module Federation, o cardápio com os cinco pratos e o pedido com a mensagem de vazio.
Dei três cliques em "Adicionar ao pedido" e apareceram três itens na lista, na ordem dos cliques, com o mesmo prato duas vezes por eu ter clicado duas vezes nele. Console do DevTools limpo.

Isso fecha o caminho completo: o componente do cardápio, servido pela porta 3001, dispara o evento global dentro da página do container, e o componente do pedido, servido pela porta 3002, escuta esse evento e atualiza o próprio estado. Os dois micros nunca se importam diretamente.

---

## Ambiente

Terminal em uso: PowerShell.
