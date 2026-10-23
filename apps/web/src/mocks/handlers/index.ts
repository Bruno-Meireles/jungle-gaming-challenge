import { accountHandlers } from './account';
import { authHandlers } from './auth';
import { cartHandlers } from './cart';
import { createCatalogHandler } from './catalog';
import { commerceControlHandlers } from './commerce-control';
import { favoritesHandlers } from './favorites';
import { highlightsHandler } from './highlights';
import { nftDetailHandlers } from './nft-detail';
import { orderHandlers } from './orders';
import { realtimeHandlers } from '../realtime/socket-handler';
import { walletConnectionHandlers } from './wallet-connection';

export const createHandlers = () => [
  createCatalogHandler(),
  highlightsHandler,
  ...nftDetailHandlers,
  ...authHandlers,
  ...accountHandlers,
  ...cartHandlers,
  ...orderHandlers,
  ...favoritesHandlers,
  ...commerceControlHandlers,
  ...realtimeHandlers,
  ...walletConnectionHandlers,
];
