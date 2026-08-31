// Mostra um item do pedido. Não guarda estado nem escuta eventos, só recebe o prato pronto do Pedido e exibe.
export default function ItemPedido({ prato }) {
  return (
    // O <ul> em volta é responsabilidade do Pedido.jsx
    <li style={{ marginBottom: 12 }}>
      <strong>{prato.nome}</strong>
      <p style={{ margin: "4px 0 0" }}>{prato.descricao}</p>
    </li>
  );
}