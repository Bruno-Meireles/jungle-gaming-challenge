type Teardown = () => void;

const teardowns = new Set<Teardown>();

/** Registra limpeza de estado privado do viewer (ex.: subscriptions Socket.IO). Retorna o cancelamento do registro. */
export function registerPrivateTeardown(teardown: Teardown): () => void {
  teardowns.add(teardown);
  return () => void teardowns.delete(teardown);
}

/** Executado no logout/troca de usuario; uma falha nao impede as demais limpezas. */
export function runPrivateTeardowns(): void {
  for (const teardown of [...teardowns]) {
    try {
      teardown();
    } catch {
      // limpeza best-effort: o restante precisa rodar
    }
  }
}
