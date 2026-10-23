// Apenas material derivado (SHA-256 com sal por usuario). Nenhuma senha em claro no estado dos mocks.
// Mock didatico: em producao seria bcrypt/argon2 no servidor.
const encoder = new TextEncoder();

export async function hashPassword(salt: string, password: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${salt}:${password}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(salt: string, hash: string, password: string): Promise<boolean> {
  return (await hashPassword(salt, password)) === hash;
}

export function newSalt(): string {
  return crypto.randomUUID();
}
