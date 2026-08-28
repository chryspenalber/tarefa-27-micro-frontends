// Componente principal do Pedido. Ele fica ouvindo o evento "adicionarAoPedido" que o Cardapio dispara e vai guardando os pratos numa lista.
import { useState, useEffect } from "react";
import ItemPedido from "./ItemPedido";

export default function Pedido() {
  // Lista de pratos que o usuario ja adicionou
  const [itens, setItens] = useState([]);

  useEffect(() => {
    function receberPrato(evento) {
      // e.detail traz o prato que veio do cardapio
      setItens((listaAtual) => [...listaAtual, evento.detail]);
    }

    window.addEventListener("adicionarAoPedido", receberPrato);

    // Remove o listener quando o componente sai da tela para nao registrar o mesmo evento duas vezes
    return () => {
      window.removeEventListener("adicionarAoPedido", receberPrato);
    };
  }, []);

  return (
    <section>
      <h2>Pedido</h2>
      {itens.length === 0 ? (
        <p>Nenhum item adicionado ainda.</p>
      ) : (
        <ul>
          {itens.map((prato, indice) => (
            <ItemPedido key={indice} prato={prato} />
          ))}
        </ul>
      )}
    </section>
  );
}