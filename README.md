[Versão em Português](#portugues) | [English Version](#english)

---

<a id="portugues"></a>

# Versão em Português

# Rui dos Pregos — Micro Frontends
**Projeto desenvolvido por Chrys Penalber**

Aplicação de pedidos de restaurante dividida em três projetos independentes e integrados com Webpack Module Federation. Projeto desenvolvido durante o curso de Engenharia Front-End da EBAC, na tarefa sobre Micro Frontends.

O cardápio e o pedido rodam em servidores separados, cada um com o próprio build e as próprias dependências. O container carrega os dois em tempo de execução, sem ter o código deles dentro de si.

![Aplicação com o cardápio e o pedido carregados no container](preview.png)

---

## Objetivos

- Dividir uma aplicação web em micro frontends independentes.
- Integrar os micros por meio de uma aplicação container.
- Configurar o Webpack Module Federation em cada projeto.
- Expor componentes de um projeto e consumi-los em outro.
- Comunicar os micros sem que um dependa do outro.
- Importar os módulos remotos com `React.lazy` e `Suspense`.
- Manter cada micro funcional também quando executado sozinho.
- Organizar os diretórios por responsabilidade.

---

## Links

- **Repositório no GitHub:** *https://github.com/chryspenalber/tarefa-27-micro-frontends*

O projeto depende de três servidores locais, e os endereços dos módulos remotos estão fixados em `localhost`. Publicar exigiria três deploys e endereços absolutos entre eles, o que está fora do escopo da tarefa.

---

## Principais Funcionalidades

- Cardápio com cinco pratos, cada um com nome, descrição e botão de adicionar.
- Pedido que começa vazio e lista os pratos conforme os botões são clicados.
- O mesmo prato pode ser adicionado mais de uma vez.
- Container que exibe os dois micros na mesma tela, sem lógica de negócio própria.
- Carregamento dos módulos remotos sob demanda, com estado de carregamento visível.
- Comunicação entre os micros por evento global do navegador.
- Página individual em cada micro para execução isolada.

---

## Estrutura do Projeto

Monorepo com um único repositório Git na raiz. Cada pasta é um projeto Next completo, com o próprio `package.json`, o próprio `node_modules` e o próprio `next.config.mjs`.

| Aplicação | Papel | Porta |
| --------- | ----- | ----- |
| `container` | Aplicação principal, importa os dois micros | 3000 |
| `cardapio` | Lista de pratos com botão de adicionar | 3001 |
| `pedido` | Mostra os itens escolhidos | 3002 |

```text
tarefa-27-micro-frontends/
│
├── container/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CardapioRemoto.jsx
│   │   │   └── PedidoRemoto.jsx
│   │   ├── pages/
│   │   └── styles/
│   └── next.config.mjs
│
├── cardapio/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Cardapio.jsx
│   │   │   └── PratoItem.jsx
│   │   ├── data/
│   │   │   └── pratos.js
│   │   ├── pages/
│   │   └── styles/
│   └── next.config.mjs
│
├── pedido/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Pedido.jsx
│   │   │   └── ItemPedido.jsx
│   │   ├── pages/
│   │   └── styles/
│   └── next.config.mjs
│
└── ANOTACOES.md
```

Cada componente tem o próprio arquivo de CSS Module ao lado. Os dados dos pratos ficam separados da interface, em `cardapio/src/data/pratos.js`.

---

## Tecnologias

- React 19
- Next.js 15 com Pages Router
- Webpack Module Federation, pelo plugin `@module-federation/nextjs-mf`
- JavaScript
- CSS Modules

---

## Integração com Module Federation

Cada micro expõe apenas o seu componente principal, não a página inteira. As páginas `index` continuam existindo só para a execução isolada.

| Micro | Nome | Exposto | Arquivo publicado |
| ----- | ---- | ------- | ----------------- |
| `cardapio` | `cardapio` | `./Cardapio` | `localhost:3001/_next/static/chunks/remoteEntry.js` |
| `pedido` | `pedido` | `./Pedido` | `localhost:3002/_next/static/chunks/remoteEntry.js` |

O container declara os dois como `remotes` no `next.config.mjs` e não expõe nada. Cada micro tem um wrapper em `container/src/components` que faz o `React.lazy` e o `Suspense` internamente. A página importa esse wrapper com `next/dynamic` e `ssr: false`, porque o módulo remoto vem de outro servidor e não existe durante a renderização no servidor.

O plugin publica o `remoteEntry.js` em duas pastas, `static/chunks` para o navegador e `static/ssr` para o servidor. Por isso o `next.config.mjs` do container monta o endereço com `options.isServer ? "ssr" : "chunks"`. Sem essa troca, um dos lados busca um endereço que não existe.

O estilo de cada micro fica em CSS Modules dentro do próprio componente, e não no `globals.css`. O motivo é que o `globals.css` do micro não é carregado quando o componente roda dentro do container, enquanto o CSS Module viaja junto com o componente pela federação. É o que mantém cada micro apresentável também na execução isolada.

---

## Comunicação entre os Micros

Os dois micros não se conhecem. Nenhum importa o outro, e nenhum recebe props do container. A comunicação acontece por um evento global do navegador, que é a forma sugerida pelo enunciado.

O fluxo é este:

1. O usuário clica em "Adicionar ao pedido" num card do cardápio.
2. O `Cardapio.jsx` dispara `window.dispatchEvent(new CustomEvent("adicionarAoPedido", { detail: prato }))`.
3. O `Pedido.jsx`, que registrou um `addEventListener` para esse mesmo nome, recebe o evento.
4. Ele lê o prato em `evento.detail` e adiciona à própria lista de estado.

O acordo entre os dois é só o nome do evento e o formato do conteúdo:

| Item | Valor |
| ---- | ----- |
| Nome do evento | `adicionarAoPedido` |
| Conteúdo em `detail` | o prato inteiro, `{ id, nome, descricao }` |

Como esse acordo não está garantido por nenhum import, ele fica documentado em comentário nos dois componentes. Renomear o evento de um lado sem renomear do outro quebra a comunicação sem gerar erro no console, o botão simplesmente para de fazer efeito.

O `useEffect` que registra o listener devolve o `removeEventListener` na limpeza. Sem isso, o `reactStrictMode` monta o efeito duas vezes em desenvolvimento e cada clique adiciona o item duplicado.

Uma alternativa seria o container manter o estado do pedido e passar tudo por props, mas aí os micros deixariam de ser independentes e o container acumularia lógica de negócio. O evento global mantém cada um responsável pelo próprio estado.

---

## Como executar

Requer Node.js 18.18 ou superior.

### Clonar o repositório

```bash
git clone https://github.com/chryspenalber/tarefa-27-micro-frontends.git
cd tarefa-27-micro-frontends
```

### Instalar as dependências

Uma vez em cada pasta, porque cada projeto tem o próprio `node_modules`:

```bash
cd cardapio && npm install
cd ../pedido && npm install
cd ../container && npm install
```

### Executar cada micro

Cada aplicação ocupa um terminal, porque o `npm run dev` fica rodando enquanto o servidor está de pé.

Terminal 1, micro Cardápio:

```bash
cd cardapio
npm run dev
```

Terminal 2, micro Pedido:

```bash
cd pedido
npm run dev
```

Terminal 3, container:

```bash
cd container
npm run dev
```

A ordem importa. O cardápio e o pedido precisam estar de pé antes do container, porque ele busca o `remoteEntry.js` dos dois quando a página carrega. Se abrir na ordem errada, basta recarregar a página do container depois.

Com os três rodando, a aplicação integrada fica em `http://localhost:3000`.

### Executar cada micro isolado

Cada micro tem uma página `index` que serve para testá-lo sem depender do container:

- `http://localhost:3001` mostra o cardápio.
- `http://localhost:3002` mostra o pedido, que responde a eventos disparados pelo console.

Para simular um clique do cardápio no console do micro Pedido:

```js
window.dispatchEvent(new CustomEvent("adicionarAoPedido", { detail: { id: 1, nome: "Prego no Pão", descricao: "teste" } }));
```

### Sobre os scripts

Os scripts `dev` e `build` definem a variável `NEXT_PRIVATE_LOCAL_WEBPACK=true` com o `cross-env`. O plugin do Module Federation precisa dela para usar o webpack instalado no projeto em vez da cópia interna do Next. O `cross-env` está aí para o comando funcionar igual no Windows, no macOS e no Linux.

---

## Testes Realizados

- Cardápio isolado na 3001, com os cinco pratos exibindo nome, descrição e botão.
- Evento global do cardápio verificado no console, com o objeto completo do prato em `detail`.
- Pedido isolado na 3002, com a mensagem de lista vazia.
- Evento disparado à mão no pedido, resultando em um item por disparo, sem duplicação.
- `remoteEntry.js` dos dois micros aberto no navegador, respondendo com o runtime do plugin.
- Build de produção das três aplicações, sem erro.
- Os três rodando juntos, com os micros carregados no container por Module Federation.
- Cliques sucessivos em "Adicionar ao pedido", com os itens aparecendo na ordem dos cliques e o mesmo prato repetindo quando clicado mais de uma vez.
- Console do DevTools limpo nas três aplicações.

---

## Limitações Conhecidas

O projeto está no Next 15.5.7 e o `npm audit` aponta 14 avisos. O `npm audit fix` não resolve, porque leva o Next para a versão 16, incompatível com Module Federation, e desfaz o `enhanced-resolve` fixado no `overrides`, necessário para o plugin funcionar. Os avisos são de recursos que este projeto não usa, como App Router, Server Actions e otimização de imagem.

O hot reload funciona dentro de cada aplicação, mas não atravessa a fronteira entre elas. Se um micro for editado com o container aberto, o container continua servindo o chunk que baixou antes. Nesse caso, parar os servidores, apagar a pasta `.next` do micro alterado e a do container, e subir tudo de novo.

Se um micro estiver fora do ar, o `React.lazy` do container falha e a página inteira quebra. Isolar cada micro com um Error Boundary resolveria, mas não faz parte do que o enunciado pede.

O `ANOTACOES.md` na raiz registra as decisões técnicas, os erros que apareceram no caminho e o motivo de cada escolha de versão.

---

## Contato

- GitHub — https://github.com/chryspenalber
- LinkedIn — https://www.linkedin.com/in/chrystiana-penalber/

---

<a id="english"></a>

# English Version

# Rui dos Pregos — Micro Frontends
**Project developed by Chrys Penalber**

Restaurant ordering application split into three independent projects and integrated with Webpack Module Federation. Project developed during the Front-End Engineering course at EBAC, for the Micro Frontends assignment.

The menu and the order run on separate servers, each with its own build and its own dependencies. The container loads both at runtime, without holding their code inside itself.

![Application with the menu and the order loaded in the container](preview.png)

---

## Goals

- Split a web application into independent micro frontends.
- Integrate the micro frontends through a container application.
- Configure Webpack Module Federation in each project.
- Expose components from one project and consume them in another.
- Let the micro frontends communicate without depending on each other.
- Import the remote modules with `React.lazy` and `Suspense`.
- Keep each micro frontend working when run on its own.
- Organise the directories by responsibility.

---

## Links

- **GitHub Repository:** *https://github.com/chryspenalber/tarefa-27-micro-frontends*

The project depends on three local servers, and the remote module addresses are pinned to `localhost`. Publishing it would require three deploys and absolute addresses between them, which is outside the scope of the assignment.

---

## Key Features

- Menu with five dishes, each one with name, description and an add button.
- Order that starts empty and lists the dishes as the buttons are clicked.
- The same dish can be added more than once.
- Container that displays both micro frontends on the same screen, with no business logic of its own.
- Remote modules loaded on demand, with a visible loading state.
- Communication between the micro frontends through a global browser event.
- An individual page in each micro frontend for standalone execution.

---

## Project Structure

Monorepo with a single Git repository at the root. Each folder is a complete Next project, with its own `package.json`, its own `node_modules` and its own `next.config.mjs`.

| Application | Role | Port |
| ----------- | ---- | ---- |
| `container` | Main application, imports both micro frontends | 3000 |
| `cardapio` | Dish list with an add button | 3001 |
| `pedido` | Shows the chosen items | 3002 |

```text
tarefa-27-micro-frontends/
│
├── container/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CardapioRemoto.jsx
│   │   │   └── PedidoRemoto.jsx
│   │   ├── pages/
│   │   └── styles/
│   └── next.config.mjs
│
├── cardapio/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Cardapio.jsx
│   │   │   └── PratoItem.jsx
│   │   ├── data/
│   │   │   └── pratos.js
│   │   ├── pages/
│   │   └── styles/
│   └── next.config.mjs
│
├── pedido/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Pedido.jsx
│   │   │   └── ItemPedido.jsx
│   │   ├── pages/
│   │   └── styles/
│   └── next.config.mjs
│
└── ANOTACOES.md
```

Each component has its own CSS Module file next to it. The dish data is kept separate from the interface, in `cardapio/src/data/pratos.js`.

---

## Technologies

- React 19
- Next.js 15 with Pages Router
- Webpack Module Federation, through the `@module-federation/nextjs-mf` plugin
- JavaScript
- CSS Modules

---

## Module Federation Integration

Each micro frontend exposes only its main component, not the whole page. The `index` pages exist only for standalone execution.

| Micro frontend | Name | Exposed | Published file |
| -------------- | ---- | ------- | -------------- |
| `cardapio` | `cardapio` | `./Cardapio` | `localhost:3001/_next/static/chunks/remoteEntry.js` |
| `pedido` | `pedido` | `./Pedido` | `localhost:3002/_next/static/chunks/remoteEntry.js` |

The container declares both as `remotes` in `next.config.mjs` and exposes nothing. Each micro frontend has a wrapper in `container/src/components` that handles `React.lazy` and `Suspense` internally. The page imports that wrapper with `next/dynamic` and `ssr: false`, because the remote module comes from another server and does not exist during server rendering.

The plugin publishes `remoteEntry.js` in two folders, `static/chunks` for the browser and `static/ssr` for the server. That is why the container's `next.config.mjs` builds the address with `options.isServer ? "ssr" : "chunks"`. Without that switch, one of the sides requests an address that does not exist.

Each micro frontend's styling lives in CSS Modules inside the component itself, not in `globals.css`. The reason is that the micro frontend's `globals.css` is not loaded when the component runs inside the container, while the CSS Module travels along with the component through federation. That is what keeps each micro frontend presentable in standalone execution too.

---

## Communication Between the Micro Frontends

The two micro frontends do not know each other. Neither imports the other, and neither receives props from the container. Communication happens through a global browser event, which is the approach suggested by the assignment.

The flow is this:

1. The user clicks "Adicionar ao pedido" on a card in the menu.
2. `Cardapio.jsx` fires `window.dispatchEvent(new CustomEvent("adicionarAoPedido", { detail: prato }))`.
3. `Pedido.jsx`, which registered an `addEventListener` for that same name, receives the event.
4. It reads the dish from `evento.detail` and adds it to its own state list.

The agreement between the two is only the event name and the payload format:

| Item | Value |
| ---- | ----- |
| Event name | `adicionarAoPedido` |
| Content in `detail` | the whole dish, `{ id, nome, descricao }` |

Since no import enforces that agreement, it is documented in a comment in both components. Renaming the event on one side without renaming it on the other breaks the communication without raising a console error, the button simply stops having any effect.

The `useEffect` that registers the listener returns `removeEventListener` in its cleanup. Without it, `reactStrictMode` mounts the effect twice in development and every click adds the item twice.

An alternative would be for the container to hold the order state and pass everything down as props, but then the micro frontends would stop being independent and the container would accumulate business logic. The global event keeps each one responsible for its own state.

---

## Running the Project

Requires Node.js 18.18 or higher.

### Clone the repository

```bash
git clone https://github.com/chryspenalber/tarefa-27-micro-frontends.git
cd tarefa-27-micro-frontends
```

### Install the dependencies

Once in each folder, because each project has its own `node_modules`:

```bash
cd cardapio && npm install
cd ../pedido && npm install
cd ../container && npm install
```

### Run each micro frontend

Each application takes one terminal, because `npm run dev` keeps running while the server is up.

Terminal 1, menu micro frontend:

```bash
cd cardapio
npm run dev
```

Terminal 2, order micro frontend:

```bash
cd pedido
npm run dev
```

Terminal 3, container:

```bash
cd container
npm run dev
```

The order matters. The menu and the order need to be up before the container, because it fetches both `remoteEntry.js` files when the page loads. If they are started in the wrong order, reloading the container page afterwards is enough.

With all three running, the integrated application is at `http://localhost:3000`.

### Run each micro frontend standalone

Each micro frontend has an `index` page for testing it without the container:

- `http://localhost:3001` shows the menu.
- `http://localhost:3002` shows the order, which reacts to events fired from the console.

To simulate a menu click in the order micro frontend console:

```js
window.dispatchEvent(new CustomEvent("adicionarAoPedido", { detail: { id: 1, nome: "Prego no Pão", descricao: "teste" } }));
```

### About the scripts

The `dev` and `build` scripts set `NEXT_PRIVATE_LOCAL_WEBPACK=true` with `cross-env`. The Module Federation plugin needs it in order to use the webpack installed in the project instead of the copy bundled with Next. `cross-env` is there so the command behaves the same on Windows, macOS and Linux.

---

## Tests Performed

- Menu standalone on port 3001, with the five dishes showing name, description and button.
- Menu global event checked in the console, with the complete dish object in `detail`.
- Order standalone on port 3002, showing the empty list message.
- Event fired manually in the order, producing one item per dispatch, with no duplication.
- `remoteEntry.js` of both micro frontends opened in the browser, responding with the plugin runtime.
- Production build of all three applications, with no errors.
- All three running together, with the micro frontends loaded in the container through Module Federation.
- Successive clicks on "Adicionar ao pedido", with items appearing in click order and the same dish repeating when clicked more than once.
- Clean DevTools console in all three applications.

---

## Known Limitations

The project is on Next 15.5.7 and `npm audit` reports 14 warnings. `npm audit fix` does not solve it, because it moves Next to version 16, which is incompatible with Module Federation, and undoes the `enhanced-resolve` version pinned in `overrides`, which the plugin needs. The warnings concern features this project does not use, such as App Router, Server Actions and image optimisation.

Hot reload works inside each application but does not cross the boundary between them. If a micro frontend is edited while the container is open, the container keeps serving the chunk it downloaded earlier. In that case, stop the servers, delete the `.next` folder of the edited micro frontend and of the container, and start everything again.

If a micro frontend is down, the container's `React.lazy` fails and the whole page breaks. Isolating each micro frontend with an Error Boundary would solve it, but that is not part of what the assignment asks for.

`ANOTACOES.md` at the root records the technical decisions, the errors that came up along the way and the reason behind each version choice.

---

## Contact

- GitHub — https://github.com/chryspenalber
- LinkedIn — https://www.linkedin.com/in/chrystiana-penalber/