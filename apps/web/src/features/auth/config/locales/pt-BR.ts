export const ptBR = {
  fields: {
    username: 'Nome de usuário',
    email: 'E-mail',
    password: 'Senha',
    confirmPassword: 'Confirmar senha',
  },
  actions: {
    login: 'Entrar',
    signup: 'Criar conta',
    forgot: 'Esqueceu a senha?',
    retry: 'Tentar novamente',
    showPassword: 'Mostrar senha',
    hidePassword: 'Ocultar senha',
  },
  social: {
    continueWith: 'Continuar com {{provider}}',
    divider: 'Ou continue com',
    unavailable: 'Login social indisponível nesta demonstração',
  },
  errors: {
    field: {
      required: 'Campo obrigatório',
      invalid_email: 'Informe um e-mail válido',
      password_mismatch: 'As senhas não coincidem',
      email_taken: 'Este e-mail já está em uso',
      username_taken: 'Este nome de usuário já está em uso',
    },
    invalid_credentials: 'E-mail ou senha incorretos',
    account_conflict: 'Não foi possível criar a conta com esses dados',
    network: 'Não foi possível conectar. Verifique sua conexão.',
    unexpected: 'Algo deu errado. Tente novamente mais tarde.',
  },
};
