// Configuração do Next e do Module Federation deste micro.
// O plugin roda dentro da função webpack porque o Module Federation é um plugin de Webpack.
import { NextFederationPlugin } from "@module-federation/nextjs-mf";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack(config) {
    config.plugins.push(
      new NextFederationPlugin({
        // Nome pelo qual o container conhece este micro
        name: "pedido",
        // Arquivo publicado com a lista do que este micro oferece
        filename: "static/chunks/remoteEntry.js",
        // Só o componente sai para fora. A página index fica para o teste isolado.
        exposes: {
          "./Pedido": "./src/components/Pedido.jsx",
        },
      })
    );

    return config;
  },
};

export default nextConfig;