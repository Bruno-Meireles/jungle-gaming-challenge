/*
 * Medidas dos frames mobile do Figma (414x896): CTA principal em pilula 60px de altura com raio 40 e gradiente
 * primary -> primary/80 (Checkout Button 70397:251, Confirm Button 70398:249, Frame 435 70410:4211); acima de `tablet`
 * volta ao botao do desktop (40px, raio 3, cor solida). Campos: 50px com raio 10 (Frame 445/444 do Login).
 */
export const MOBILE_PILL_CTA = 'h-60 rounded-40 bg-linear-to-br from-primary to-primary/80 tablet:h-40 tablet:rounded-3 tablet:bg-none disabled:bg-none';
export const MOBILE_FIELD = 'h-50 rounded-10 tablet:h-40 tablet:rounded-5';
