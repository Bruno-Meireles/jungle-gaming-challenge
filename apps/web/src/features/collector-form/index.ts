export { locales as collectorFormLocales } from './config/locales';
export {
  validateCollector,
  type CollectorValues,
  type CollectorErrors,
  type CollectorField,
  type CollectorData,
} from './model/collector-schema';
export { createDraftStore, type CheckoutDraft } from './model/checkout-draft';
export { CollectorForm, type CollectorFormProps } from './ui/CollectorForm';
