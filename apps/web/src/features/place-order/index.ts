export { locales as placeOrderLocales } from './config/locales';
export {
  checkoutReducer,
  initialCheckoutState,
  type CheckoutState,
  type CheckoutEvent,
  type CheckoutNotice as CheckoutNoticeKind,
  type SubmitFailure,
} from './model/domain/checkout-machine';
export { CheckoutNotice } from './ui/CheckoutNotice';
export { ConfirmPurchaseButton, type ConfirmPhase } from './ui/ConfirmPurchaseButton';
