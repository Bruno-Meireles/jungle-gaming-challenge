const LOGIN_PATH = '/login';

function isSafeInternalPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}

export function buildLoginRedirect(currentPath: string): string {
  return isSafeInternalPath(currentPath)
    ? `${LOGIN_PATH}?redirect=${encodeURIComponent(currentPath)}`
    : LOGIN_PATH;
}
