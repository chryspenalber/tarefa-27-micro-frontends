// Componente principal do Pedido, exposto via Module Federation para o container.
import { useState, useEffect } from "react";
import ItemPedido from "./ItemPedido";
import styles from "./Pedido.module.css";

export default function Pedido() {
  const [itens, setItens] = useState([]);

  // Contrato com o micro Cardápio, que dispara esse mesmo nome de evento.
  // Nome: "adicionarAoPedido"
  // Conteúdo em detail: o prato inteiro, { id, nome, descricao }
  // O nome aparece duas vezes aqui, no addEventListener e no removeEventListener.
  // Se os dois não forem idênticos, o listener nunca é removido.
  useEffect(() => {
    function receberPrato(evento) {
      setItens((listaAtual) => [...listaAtual, evento.detail]);
    }

    window.addEventListener("adicionarAoPedido", receberPrato);

    // Remove o listener quando o componente sai da tela.
    // Sem isso, o reactStrictMode monta o efeito duas vezes em desenvolvimento
    // e cada clique adiciona o item duplicado.
    return () => {
      window.removeEventListener("adicionarAoPedido", receberPrato);
    };
  }, []);

  return (
    <section className={styles.pedido}>
      <h2 className={styles.titulo}>Pedido</h2>
      {itens.length === 0 ? (
        <p className={styles.vazio}>Nenhum item adicionado ainda.</p>
      ) : (
        <ul className={styles.lista}>
          {/* O índice serve de key porque o mesmo prato pode entrar mais de uma vez,
              então o id deixa de ser único. A lista só cresce no fim, nunca reordena. */}
          {itens.map((prato, indice) => (
            <ItemPedido key={indice} prato={prato} />
          ))}
        </ul>
      )}
    </section>
  );
}