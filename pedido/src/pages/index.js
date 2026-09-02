// Página de teste do micro Pedido rodando sozinho na 3002,
// antes da integração via Module Federation com o container.
import Pedido from "@/components/Pedido";

export default function Home() {
  return (
    <main>
      <h1>Rui dos Pregos</h1>
      <Pedido />
    </main>
  );
}