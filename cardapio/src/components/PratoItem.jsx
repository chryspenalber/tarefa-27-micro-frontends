import styles from "./PratoItem.module.css";

// Componente reaproveitável que representa um único prato do cardápio.
// Recebe o prato por props e avisa o componente pai quando o botão é clicado.
export default function PratoItem({ prato, aoAdicionar }) {
  return (
    <li className={styles.card}>
      <h3 className={styles.nome}>{prato.nome}</h3>
      <p className={styles.descricao}>{prato.descricao}</p>
      <button className={styles.botao} onClick={() => aoAdicionar(prato)}>
        Adicionar ao pedido
      </button>
    </li>
  );
}