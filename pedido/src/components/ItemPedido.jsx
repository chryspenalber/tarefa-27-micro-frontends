// Mostra um item do pedido. Não guarda estado nem escuta eventos, só recebe o prato pronto do Pedido e exibe.
export default function ItemPedido({ prato }) {
  return (
    // O <ul> em volta é responsabilidade do Pedido.jsx
    <li>
      <strong>{prato.nome}</strong>
      <p>{prato.descricao}</p>
    </li>
  );
}