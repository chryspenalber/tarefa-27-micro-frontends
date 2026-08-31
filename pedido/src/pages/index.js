// Página de teste do micro rodando sozinho na 3002, antes de ligar o Module Federation.
import Pedido from "@/components/Pedido";

export default function Home() {
  return (
    <main>
      <h1>Micro Pedido, teste isolado</h1>
      <Pedido />
    </main>
  );
}