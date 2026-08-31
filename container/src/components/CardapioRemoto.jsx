// Wrapper do micro Cardápio. Existe para fazer o React.lazy e o Suspense num só lugar, deixando a página do container limpa.
import { lazy, Suspense } from "react";

// "cardapio" é o nome do remote no next.config, "./Cardapio" é o que ele expõe.
// O import só acontece quando o componente aparece na tela.
const Cardapio = lazy(() => import("cardapio/Cardapio"));

export default function CardapioRemoto() {
  return (
    // O fallback é o que aparece enquanto o micro está sendo baixado.
    <Suspense fallback={<p>Carregando cardápio...</p>}>
      <Cardapio />
    </Suspense>
  );
}