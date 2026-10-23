import type { Messages } from '../../shared/lib/i18n/locale-parity';
import { nftLocales } from '../../entities/nft';
import { pageHomeLocales } from '../../pages/home';
import { pageLoginLocales } from '../../pages/login';
import { pageSignupLocales } from '../../pages/signup';
import { authSurfaceLocales } from '../../widgets/auth-surface';
import { pageAccountLocales } from '../../pages/account';
import { accountNavLocales } from '../../widgets/account-nav';
import { editProfileLocales } from '../../features/edit-profile';
import { manageWalletsLocales } from '../../features/manage-wallets';
import { pageNotFoundLocales } from '../../pages/not-found';
import { pageUnavailableLocales } from '../../pages/unavailable';
import { sharedLocales } from '../../shared/config';
import { searchLocales } from '../../features/catalog-search';
import { sortLocales } from '../../features/catalog-sort';
import { viewTabsLocales } from '../../features/catalog-view-tabs';
import { filtersLocales } from '../../features/catalog-filters';
import { authLocales } from '../../features/auth';
import { catalogLocales } from '../../widgets/catalog';
import { featuredLocales } from '../../widgets/featured-nft';
import { heroLocales } from '../../widgets/hero';
import { footerLocales } from '../../widgets/footer';
import { bottomNavLocales } from '../../widgets/bottom-nav';
import { headerLocales } from '../../widgets/header';
import { editionPickerLocales } from '../../features/select-edition';
import { addToCartLocales } from '../../features/add-to-cart';
import { toggleFavoriteLocales } from '../../features/toggle-favorite';
import { nftGalleryLocales } from '../../widgets/nft-gallery';
import { nftInfoTabsLocales } from '../../widgets/nft-info-tabs';
import { purchasePanelLocales } from '../../widgets/nft-purchase-panel';
import { pageNftDetailLocales } from '../../pages/nft-detail';
import { collectorFormLocales } from '../../features/collector-form';
import { placeOrderLocales } from '../../features/place-order';
import { walletConnectLocales } from '../../features/wallet-connect';
import { checkoutLocales } from '../../widgets/checkout';
import { orderReceiptLocales } from '../../widgets/order-receipt';
import { pageCheckoutLocales } from '../../pages/checkout';
import { pageOrderReceiptLocales } from '../../pages/order-receipt';
import { cartLinesLocales } from '../../widgets/cart-lines';
import { cartSummaryLocales } from '../../widgets/cart-summary';
import { cartLineControlsLocales } from '../../features/cart-line-controls';
import { cartCouponLocales } from '../../features/cart-coupon';
import { checkoutCtaLocales } from '../../features/checkout-cta';
import { pageCartLocales } from '../../pages/cart';
import { relatedNftsLocales } from '../../widgets/related-nfts';
import { promoBannersLocales } from '../../widgets/promo-banners';
import { journalLocales } from '../../widgets/journal';

export type Resources = { 'pt-BR': Record<string, Messages>; en: Record<string, Messages> };

export const ptBRResources = {
  shared: sharedLocales['pt-BR'],
  header: headerLocales['pt-BR'],
  bottomNav: bottomNavLocales['pt-BR'],
  nft: nftLocales['pt-BR'],
  catalog: catalogLocales['pt-BR'],
  footer: footerLocales['pt-BR'],
  hero: heroLocales['pt-BR'],
  featured: featuredLocales['pt-BR'],
  auth: authLocales['pt-BR'],
  filters: filtersLocales['pt-BR'],
  sort: sortLocales['pt-BR'],
  search: searchLocales['pt-BR'],
  viewTabs: viewTabsLocales['pt-BR'],
  pageHome: pageHomeLocales['pt-BR'],
  pageUnavailable: pageUnavailableLocales['pt-BR'],
  pageNotFound: pageNotFoundLocales['pt-BR'],
  pageLogin: pageLoginLocales['pt-BR'],
  pageSignup: pageSignupLocales['pt-BR'],
  authSurface: authSurfaceLocales['pt-BR'],
  collectorForm: collectorFormLocales['pt-BR'],
  placeOrder: placeOrderLocales['pt-BR'],
  walletConnect: walletConnectLocales['pt-BR'],
  checkout: checkoutLocales['pt-BR'],
  orderReceipt: orderReceiptLocales['pt-BR'],
  pageCheckout: pageCheckoutLocales['pt-BR'],
  pageOrderReceipt: pageOrderReceiptLocales['pt-BR'],
  pageAccount: pageAccountLocales['pt-BR'],
  accountNav: accountNavLocales['pt-BR'],
  editProfile: editProfileLocales['pt-BR'],
  manageWallets: manageWalletsLocales['pt-BR'],
  editionPicker: editionPickerLocales['pt-BR'],
  addToCart: addToCartLocales['pt-BR'],
  toggleFavorite: toggleFavoriteLocales['pt-BR'],
  nftGallery: nftGalleryLocales['pt-BR'],
  nftInfoTabs: nftInfoTabsLocales['pt-BR'],
  purchasePanel: purchasePanelLocales['pt-BR'],
  pageNftDetail: pageNftDetailLocales['pt-BR'],
  promoBanners: promoBannersLocales['pt-BR'],
  journal: journalLocales['pt-BR'],
  cartLines: cartLinesLocales['pt-BR'],
  cartSummary: cartSummaryLocales['pt-BR'],
  cartLineControls: cartLineControlsLocales['pt-BR'],
  cartCoupon: cartCouponLocales['pt-BR'],
  checkoutCta: checkoutCtaLocales['pt-BR'],
  pageCart: pageCartLocales['pt-BR'],
  relatedNfts: relatedNftsLocales['pt-BR'],
};

const enResources = {
  shared: sharedLocales.en,
  header: headerLocales.en,
  bottomNav: bottomNavLocales.en,
  nft: nftLocales.en,
  catalog: catalogLocales.en,
  footer: footerLocales.en,
  hero: heroLocales.en,
  featured: featuredLocales.en,
  auth: authLocales.en,
  filters: filtersLocales.en,
  sort: sortLocales.en,
  search: searchLocales.en,
  viewTabs: viewTabsLocales.en,
  pageHome: pageHomeLocales.en,
  pageUnavailable: pageUnavailableLocales.en,
  pageNotFound: pageNotFoundLocales.en,
  pageLogin: pageLoginLocales.en,
  pageSignup: pageSignupLocales.en,
  authSurface: authSurfaceLocales.en,
  collectorForm: collectorFormLocales.en,
  placeOrder: placeOrderLocales.en,
  walletConnect: walletConnectLocales.en,
  checkout: checkoutLocales.en,
  orderReceipt: orderReceiptLocales.en,
  pageCheckout: pageCheckoutLocales.en,
  pageOrderReceipt: pageOrderReceiptLocales.en,
  pageAccount: pageAccountLocales.en,
  accountNav: accountNavLocales.en,
  editProfile: editProfileLocales.en,
  manageWallets: manageWalletsLocales.en,
  editionPicker: editionPickerLocales.en,
  addToCart: addToCartLocales.en,
  toggleFavorite: toggleFavoriteLocales.en,
  nftGallery: nftGalleryLocales.en,
  nftInfoTabs: nftInfoTabsLocales.en,
  purchasePanel: purchasePanelLocales.en,
  pageNftDetail: pageNftDetailLocales.en,
  promoBanners: promoBannersLocales.en,
  journal: journalLocales.en,
  cartLines: cartLinesLocales.en,
  cartSummary: cartSummaryLocales.en,
  cartLineControls: cartLineControlsLocales.en,
  cartCoupon: cartCouponLocales.en,
  checkoutCta: checkoutCtaLocales.en,
  pageCart: pageCartLocales.en,
  relatedNfts: relatedNftsLocales.en,
} satisfies typeof ptBRResources;

export const resources: Resources = { 'pt-BR': ptBRResources, en: enResources };
