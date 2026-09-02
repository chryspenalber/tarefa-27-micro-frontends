import styles from "./ItemPedido.module.css";

// Mostra um item do pedido. Não guarda estado nem escuta eventos,
// só recebe o prato pronto do Pedido e exibe.
export default function ItemPedido({ prato }) {
  return (
    // O <ul> em volta é responsabilidade do Pedido.jsx
    <li className={styles.item}>
      <strong className={styles.nome}>{prato.nome}</strong>
      <p className={styles.descricao}>{prato.descricao}</p>
    </li>
  );
}