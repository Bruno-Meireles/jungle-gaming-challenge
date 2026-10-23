import { accountHandlers } from './account';
import { authHandlers } from './auth';
import { cartHandlers } from './cart';
import { createCatalogHandler } from './catalog';
import { commerceControlHandlers } from './commerce-control';
import { favoritesHandlers } from './favorites';
import { highlightsHandler } from './highlights';
import { orderHandlers } from './orders';

export const createHandlers = () => [
  createCatalogHandler(),
  highlightsHandler,
  ...authHandlers,
  ...accountHandlers,
  ...cartHandlers,
  ...orderHandlers,
  ...favoritesHandlers,
  ...commerceControlHandlers,
];
