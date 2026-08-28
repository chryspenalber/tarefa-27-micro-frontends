// Componente reaproveitavel que representa um unico prato do cardapio.
// Recebe o prato por props e avisa o componente pai quando o botao é clicado.
export default function PratoItem({ prato, aoAdicionar }) {
  return (
    <li>
      <h3>{prato.nome}</h3>
      <p>{prato.descricao}</p>
      <button onClick={() => aoAdicionar(prato)}>Adicionar ao pedido</button>
    </li>
  );
}
