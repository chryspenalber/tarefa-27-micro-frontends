// Configuração do Next e do Module Federation do container.
// Aqui não há exposes, só remotes: este app consome os dois micros.
import { NextFederationPlugin } from "@module-federation/nextjs-mf";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack(config, options) {
    // O plugin gera dois remoteEntry, um para o navegador e outro para o servidor.
    // A pasta muda conforme o lado que está sendo compilado.
    const pasta = options.isServer ? "ssr" : "chunks";

    config.plugins.push(
      new NextFederationPlugin({
        name: "container",
        filename: "static/chunks/remoteEntry.js",
        // A chave é o nome usado no import. O valor é nome@endereço do remoteEntry.
        remotes: {
          cardapio: `cardapio@http://localhost:3001/_next/static/${pasta}/remoteEntry.js`,
          pedido: `pedido@http://localhost:3002/_next/static/${pasta}/remoteEntry.js`,
        },
      })
    );

    return config;
  },
};

export default nextConfig;