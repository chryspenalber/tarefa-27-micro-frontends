// Página de teste do micro Cardápio rodando sozinho na 3001,
// antes da integração via Module Federation com o container.
import Cardapio from "@/components/Cardapio";

export default function Home() {
  return (
    <main>
      <h1>Rui dos Pregos</h1>
      <Cardapio />
    </main>
  );
}