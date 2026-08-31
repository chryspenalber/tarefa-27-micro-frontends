// Página principal do container. Junta os dois micros na mesma tela.
import dynamic from "next/dynamic";

// O next/dynamic com ssr: false garante que os wrappers só carreguem no navegador.
// É necessário porque o módulo remoto vem de outro servidor e não existe durante o SSR.
const CardapioRemoto = dynamic(() => import("@/components/CardapioRemoto"), { ssr: false });
const PedidoRemoto = dynamic(() => import("@/components/PedidoRemoto"), { ssr: false });

export default function Home() {
  return (
    <main>
      <h1>Rui dos Pregos</h1>
      <CardapioRemoto />
      <PedidoRemoto />
    </main>
  );
}