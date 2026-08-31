// Wrapper do micro Pedido, mesmo padrão do CardapioRemoto.
import { lazy, Suspense } from "react";

// "pedido" é o nome do remote no next.config, "./Pedido" é o que ele expõe.
const Pedido = lazy(() => import("pedido/Pedido"));

export default function PedidoRemoto() {
  return (
    <Suspense fallback={<p>Carregando pedido...</p>}>
      <Pedido />
    </Suspense>
  );
}