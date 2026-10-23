export const ptBR = {
  primary: { title: 'Carteira principal', empty: 'Você ainda não adicionou uma carteira principal.' },
  secondary: { title: 'Carteira secundária', empty: 'Você ainda não adicionou uma carteira secundária.' },
  fields: { network: 'Rede', address: 'Endereço da carteira', same: 'Igual à carteira principal' },
  networks: { ethereum: 'Ethereum', polygon: 'Polygon', solana: 'Solana' },
  actions: { save: 'Salvar', add: 'Adicionar', retry: 'Tentar novamente' },
  messages: {
    saved: 'Carteira salva',
    loadFailed: 'Não foi possível carregar as carteiras.',
    network: 'Não foi possível conectar. Verifique sua conexão.',
    unexpected: 'Algo deu errado. Tente novamente mais tarde.',
  },
  errors: {
    required: 'Campo obrigatório',
    invalid_address: 'Endereço de carteira inválido',
  },
};
