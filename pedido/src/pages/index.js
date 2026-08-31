// Página de teste do micro rodando sozinho na 3002, antes de ligar o Module Federation.
import Pedido from "@/components/Pedido";

export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Micro Pedido, teste isolado</h1>
      <Pedido />
    </main>
  );
}