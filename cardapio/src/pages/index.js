// Pagina de teste isolado do micro Cardapio.
// Serve para rodar o micro sozinho na porta 3001, antes da integracao
// via Module Federation com o container.
import Cardapio from "@/components/Cardapio";

export default function Home() {
  return (
    <main>
      <h1>Rui dos Pregos</h1>
      <Cardapio />
    </main>
  );
}