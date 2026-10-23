import { SESSION_TOKEN_STORAGE_KEY } from '../../../shared/api/contracts/auth';

// localStorage pode lancar (modo privado, bloqueio): a sessao degrada para anonima.
export function readToken(): string | null {
  try {
    return localStorage.getItem(SESSION_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeToken(token: string): void {
  try {
    localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
  } catch {
    // sem persistencia: a sessao vale apenas ate o refresh
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
  } catch {
    // nada a limpar
  }
}
