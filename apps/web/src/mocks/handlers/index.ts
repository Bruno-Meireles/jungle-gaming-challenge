import { accountHandlers } from './account';
import { authHandlers } from './auth';
import { createCatalogHandler } from './catalog';
import { highlightsHandler } from './highlights';

export const createHandlers = () => [
  createCatalogHandler(),
  highlightsHandler,
  ...authHandlers,
  ...accountHandlers,
];
