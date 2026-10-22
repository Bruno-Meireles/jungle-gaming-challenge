import { createCatalogHandler } from './catalog';
import { highlightsHandler } from './highlights';

export const createHandlers = () => [createCatalogHandler(), highlightsHandler];
