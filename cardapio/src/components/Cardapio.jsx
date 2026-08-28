import { pratos } from "@/data/pratos";
import PratoItem from "./PratoItem";

// Componente principal que sera exposto via Module Federation para o container.
export default function Cardapio() {
  function adicionarAoPedido(prato) {
    window.dispatchEvent(new CustomEvent("adicionarAoPedido", { detail: prato }));
  }

  return (
    <section>
      <h2>Cardápio</h2>
      <ul>
        {pratos.map((prato) => (
          <PratoItem key={prato.id} prato={prato} aoAdicionar={adicionarAoPedido} />
        ))}
      </ul>
    </section>
  );
}