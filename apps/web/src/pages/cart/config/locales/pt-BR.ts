export const ptBR = {
  title: 'Carrinho — Kurio',
  description: 'Revise os itens, aplique um cupom e finalize a compra.',
  heading: 'Carrinho',
  empty: { body: 'Seu carrinho está vazio.', cta: 'Continuar explorando' },
  error: { body: 'Não foi possível carregar o carrinho.', retry: 'Tentar novamente' },
  mutationError: {
    availability_conflict: 'A quantidade pedida não está disponível (restam {{available}}).',
    not_found: 'Este item não está mais no carrinho.',
    network: 'Não foi possível atualizar o carrinho. Verifique a conexão.',
    unexpected: 'Algo deu errado ao atualizar o carrinho.',
  },
};
