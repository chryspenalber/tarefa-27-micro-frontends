import { pratos } from "@/data/pratos";
import PratoItem from "./PratoItem";
import styles from "./Cardapio.module.css";

// Componente principal, exposto via Module Federation para o container.
export default function Cardapio() {
  // Contrato com o micro Pedido, que escuta esse mesmo nome de evento.
  // Nome: "adicionarAoPedido"
  // Conteúdo em detail: o prato inteiro, { id, nome, descricao }
  // Os dois micros não se importam, o acordo é só o nome e o formato.
  // Renomear de um lado sem renomear do outro quebra tudo sem dar erro.
  function adicionarAoPedido(prato) {
    window.dispatchEvent(new CustomEvent("adicionarAoPedido", { detail: prato }));
  }

  return (
    <section className={styles.cardapio}>
      <h2 className={styles.titulo}>Cardápio</h2>
      <ul className={styles.lista}>
        {pratos.map((prato) => (
          <PratoItem key={prato.id} prato={prato} aoAdicionar={adicionarAoPedido} />
        ))}
      </ul>
    </section>
  );
}