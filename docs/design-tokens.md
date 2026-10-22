# Inventario de design tokens

Gerado a partir de `packages/design-system/src/styles/tokens.css` (fonte unica, ADR-04). Cada token com `figma:` e conferido contra `docs/figma/file.json` por `tests/tokens.node.test.ts`.

## Cores (29 Figma + 14 aliases semanticos)

| Token | Valor | Origem |
|---|---|---|
| `--color-foreground` | `#F5F1EB` | figma:70323:306 |
| `--color-text-accent` | `#E89B55` | figma:70330:306 |
| `--color-primary` | `#D28A4C` | figma:70323:301 |
| `--color-ink` | `#140D0A` | figma:70323:314 |
| `--color-text-secondary` | `#CFB28C` | figma:70330:305 |
| `--color-surface-card` | `#241612` | figma:70323:312 |
| `--color-secondary` | `#B39463` | figma:70323:310 |
| `--color-border` | `#3F2319` | figma:70323:318 |
| `--color-background-elevated` | `#FBFBFB` | figma:70323:307 |
| `--color-surface-dark` | `#38220F` | figma:70323:317 |
| `--color-border-soft` | `#55321F` | figma:70323:319 |
| `--color-surface-raised` | `#2F1D15` | figma:70323:313 |
| `--color-black` | `#000000` | figma:70323:309 |
| `--color-text-coral` | `#F0805F` | figma:70323:305 |
| `--color-logo-google-green` | `#59C36A` | figma:70323:326 |
| `--color-success` | `#00A66C` | figma:70323:321 |
| `--color-logo-google-yellow` | `#FFDA2D` | figma:70323:327 |
| `--color-logo-google-blue` | `#4086F4` | figma:70323:325 |
| `--color-logo-blue` | `#4175DF` | figma:70323:328 |
| `--color-logo-orange` | `#FF641A` | figma:70323:323 |
| `--color-logo-facebook` | `#3B5999` | figma:70323:324 |
| `--color-gray-light` | `#EDEDED` | figma:70323:320 |
| `--color-amber` | `#E3A44E` | figma:70323:304 |
| `--color-error` | `#ED1B2E` | figma:70323:322 |
| `--color-white` | `#FFFFFF` | figma:70323:308 |
| `--color-logo-light-blue` | `#03A9F4` | figma:70323:329 |
| `--color-logo-indigo` | `#283593` | figma:70323:330 |
| `--color-primary-light` | `#DD9A5F` | figma:70323:302 |
| `--color-primary-dark` | `#C47B3E` | figma:70323:303 |
| `--color-background` | `var(--color-ink)` | derivado |
| `--color-focus` | `var(--color-primary)` | derivado |
| `--color-input-border` | `var(--color-secondary)` | derivado |
| `--color-destructive-text` | `var(--color-text-coral)` | derivado |
| `--color-destructive` | `var(--color-error)` | derivado |
| `--color-surface` | `var(--color-surface-card)` | derivado |
| `--color-text` | `var(--color-foreground)` | derivado |
| `--color-text-muted` | `var(--color-text-secondary)` | derivado |
| `--color-accent` | `var(--color-primary)` | derivado |
| `--color-primary-hover` | `var(--color-primary-light)` | derivado |
| `--color-primary-active` | `var(--color-primary-dark)` | derivado |
| `--color-disabled-bg` | `var(--color-border-soft)` | derivado |
| `--color-disabled-text` | `var(--color-secondary)` | derivado |
| `--color-link` | `var(--color-text-accent)` | derivado |

## Tipografia (59 estilos TEXT)

Cada token tem tambem `--line-height`, `--font-weight` e `--letter-spacing`. Valor = tamanho / line-height / peso / letter-spacing.

| Token | Valor | Origem |
|---|---|---|
| `--text-body-14-bold-lh-auto` | `14px / normal / 700 / 0.1em` | figma:70321:344 |
| `--text-body-large-16-bold-lh-auto` | `16px / normal / 700 / 0` | figma:70321:328 |
| `--text-body-large-16-regular-lh-auto` | `16px / normal / 400 / 0` | figma:70321:329 |
| `--text-tiny-10-medium` | `10px / normal / 500 / 0` | figma:70321:366 |
| `--text-body-large-16-medium-lh-auto` | `16px / normal / 500 / 0` | figma:70321:330 |
| `--text-body-14-medium-lh-16` | `14px / 16px / 500 / 0.1em` | figma:70321:345 |
| `--text-display-43-bold` | `43px / 70px / 700 / 0` | figma:70321:301 |
| `--text-body-14-regular-lh-24` | `14px / 24px / 400 / 0` | figma:70321:346 |
| `--text-body-large-16-bold-lh-20` | `16px / 20px / 700 / 0` | figma:70321:331 |
| `--text-body-large-18-bold-lh-16` | `18px / 16px / 700 / 0` | figma:70321:319 |
| `--text-body-15-regular-lh-40` | `15px / 40px / 400 / 0` | figma:70321:338 |
| `--text-body-15-bold-lh-40` | `15px / 40px / 700 / 0` | figma:70321:339 |
| `--text-body-15-regular-lh-16` | `15px / normal / 400 / 0` | figma:70321:337 |
| `--text-body-15-medium` | `15px / 16px / 500 / 0` | figma:70321:336 |
| `--text-body-large-16-regular-lh-16` | `16px / 16px / 400 / 0` | figma:70321:332 |
| `--text-body-large-18-regular` | `18px / 16px / 400 / 0` | figma:70321:320 |
| `--text-body-large-18-bold-lh-24` | `18px / 24px / 700 / 0` | figma:70321:322 |
| `--text-body-14-medium-lh-20` | `14px / 20px / 500 / 0` | figma:70321:349 |
| `--text-caption-12-bold` | `12px / 14px / 700 / 0` | figma:70321:364 |
| `--text-heading-24-bold` | `24px / normal / 700 / 0` | figma:70321:307 |
| `--text-body-large-17-bold` | `17px / 16px / 700 / 0` | figma:70321:325 |
| `--text-body-14-regular-lh-22` | `14px / 22px / 400 / 0` | figma:70321:348 |
| `--text-body-14-regular-lh-16` | `14px / 16px / 400 / 0` | figma:70321:351 |
| `--text-caption-13-regular-lh-22` | `13px / 22px / 400 / 0` | figma:70321:358 |
| `--text-body-14-regular-lh-30` | `14px / 30px / 400 / 0` | figma:70321:350 |
| `--text-tiny-9-bold` | `9px / normal / 700 / 0.0111em` | figma:70321:367 |
| `--text-body-15-bold-lh-16` | `15px / 16px / 700 / 0` | figma:70321:340 |
| `--text-heading-28-bold` | `28px / normal / 700 / 0` | figma:70321:304 |
| `--text-title-22-bold` | `22px / 16px / 700 / 0` | figma:70321:310 |
| `--text-body-14-medium-lh-16-ls-0` | `14px / 16px / 500 / 0` | figma:70321:347 |
| `--text-title-20-regular-lh-10` | `20px / 28px / 400 / 0` | figma:70321:314 |
| `--text-body-14-bold-lh-20` | `14px / 20px / 700 / 0` | figma:70321:353 |
| `--text-body-large-17-regular-lh-16` | `17px / 16px / 400 / 0` | figma:70321:326 |
| `--text-body-14-bold-lh-24` | `14px / 24px / 700 / 0` | figma:70321:352 |
| `--text-body-large-16-bold-lh-16` | `16px / 16px / 700 / 0` | figma:70321:334 |
| `--text-body-large-16-medium-lh-16` | `16px / 16px / 500 / 0` | figma:70321:333 |
| `--text-body-large-17-regular-lh-10` | `17px / 24px / 400 / 0` | figma:70321:327 |
| `--text-body-14-bold-lh-16` | `14px / 16px / 700 / 0` | figma:70321:354 |
| `--text-caption-12-regular-lh-16` | `12px / 16px / 400 / 0` | figma:70321:362 |
| `--text-body-15-regular-lh-15` | `15px / 15px / 400 / 0` | figma:70321:341 |
| `--text-title-22-regular` | `22px / 29px / 400 / 0` | figma:70321:311 |
| `--text-body-14-regular-lh-15` | `14px / 15px / 400 / 0` | figma:70321:355 |
| `--text-title-20-medium` | `20px / 16px / 500 / 0` | figma:70321:316 |
| `--text-caption-13-regular-lh-16` | `13px / 16px / 400 / 0` | figma:70321:359 |
| `--text-caption-13-medium` | `13px / 16px / 500 / 0` | figma:70321:360 |
| `--text-body-15-regular-lh-45` | `15px / 45px / 400 / 0` | figma:70321:342 |
| `--text-body-15-bold-lh-15` | `15px / 15px / 700 / 0` | figma:70321:343 |
| `--text-caption-12-regular-lh-18` | `12px / 18px / 400 / 0` | figma:70321:363 |
| `--text-title-20-bold-lh-16` | `20px / 16px / 700 / 0` | figma:70321:317 |
| `--text-body-large-18-medium` | `18px / 25px / 500 / 0` | figma:70321:324 |
| `--text-body-large-16-regular-lh-10` | `16px / 22px / 400 / 0` | figma:70321:335 |
| `--text-title-21-regular` | `21px / 16px / 400 / 0` | figma:70321:312 |
| `--text-body-14-bold-lh-auto-ls-0` | `14px / normal / 700 / 0` | figma:70321:356 |
| `--text-display-32-bold` | `32px / normal / 700 / 0.1em` | figma:70321:302 |
| `--text-heading-26-bold` | `26px / 32px / 700 / 0` | figma:70321:306 |
| `--text-title-23-bold` | `23px / 16px / 700 / 0` | figma:70321:309 |
| `--text-body-large-19-bold` | `19px / 29px / 700 / 0` | figma:70321:318 |
| `--text-body-large-18-light` | `18px / 16px / 300 / 0` | figma:70321:321 |
| `--text-tiny-11-medium` | `11px / 16px / 500 / 0` | figma:70321:365 |

## Raios (29)

| Token | Valor | Origem |
|---|---|---|
| `--radius-0` | `0px` | figma:5:112 |
| `--radius-2p12` | `2.12px` | figma:I70492:696;70491:1280 |
| `--radius-3` | `3px` | figma:70386:262 |
| `--radius-4` | `4px` | figma:70342:2820 |
| `--radius-5` | `5px` | figma:70381:242 |
| `--radius-6` | `6px` | figma:I70522:3240;70504:3015;70486:524 |
| `--radius-7` | `7px` | figma:70410:3799 |
| `--radius-8` | `8px` | figma:70353:239 |
| `--radius-10` | `10px` | figma:70410:4124 |
| `--radius-11` | `11px` | figma:11:1177 |
| `--radius-12` | `12px` | figma:70395:240 |
| `--radius-13` | `13px` | figma:4:280 |
| `--radius-14` | `14px` | figma:70410:4122 |
| `--radius-15` | `15px` | figma:4:137 |
| `--radius-16` | `16px` | figma:I70522:3671;70504:3225 |
| `--radius-17` | `17px` | figma:4:423 |
| `--radius-17p5` | `17.5px` | figma:70410:4156 |
| `--radius-18` | `18px` | figma:4:428 |
| `--radius-20` | `20px` | figma:70402:3303 |
| `--radius-22` | `22px` | figma:70410:3798 |
| `--radius-24` | `24px` | figma:70342:2673 |
| `--radius-25` | `25px` | figma:9:1581 |
| `--radius-29` | `29px` | figma:70410:3800 |
| `--radius-30` | `30px` | figma:14:5291 |
| `--radius-31` | `31px` | figma:16:402 |
| `--radius-32` | `32px` | figma:15:5689 |
| `--radius-33` | `33px` | figma:70410:4190 |
| `--radius-37` | `37px` | figma:I70492:696;70491:795 |
| `--radius-40` | `40px` | figma:14:5226 |

## Sombras (7)

| Token | Valor | Origem |
|---|---|---|
| `--shadow-x0-y0-b20-a45-0a0604` | `0px 0px 20px rgba(10, 6, 4, 0.45)` | figma:I70492:696;70491:1237 |
| `--shadow-x0-y6p6-b19p8-sn3p3-a15-140d0a` | `0px 6.6px 19.8px -3.3px rgba(20, 13, 10, 0.15)` | figma:70410:4190 |
| `--shadow-x0-y4-b12-sn2-a15-140d0a` | `0px 4px 12px -2px rgba(20, 13, 10, 0.15)` | figma:70402:3303 |
| `--shadow-x0-yn10-b30-a45-0a0604` | `0px -10px 30px rgba(10, 6, 4, 0.45)` | figma:15:5504 |
| `--shadow-x0-y6-b20-a45-0a0604` | `0px 6px 20px rgba(10, 6, 4, 0.45)` | figma:16:657 |
| `--shadow-x0-y20-b20-a45-0a0604` | `0px 20px 20px rgba(10, 6, 4, 0.45)` | figma:16:987 |
| `--shadow-x0-y0-b40-a45-0a0604` | `0px 0px 40px rgba(10, 6, 4, 0.45)` | figma:16:858 |

## Fontes, spacing e breakpoints

| Token | Valor | Origem |
|---|---|---|
| `--breakpoint-tablet` | `768px` | prompt.md §8 |
| `--breakpoint-desktop` | `1440px` | prompt.md §8 |
| `--font-sans` | `"Roboto Mono", ui-monospace, monospace` | derivado (ADR-04: 1 unidade = 1px) |
| `--font-mono` | `"Roboto Mono", ui-monospace, monospace` | derivado (ADR-04: 1 unidade = 1px) |
| `--spacing` | `1px` | derivado (ADR-04: 1 unidade = 1px) |

## Larguras de stroke distintas (informativo)

Tailwind v4 nao tem tema de border-width; usar valores arbitrarios (`border-[1.5px]`) ou o padrao.

0.22px, 0.3px, 1px, 1.2px, 1.3px, 1.5px, 2px, 3px, 4px, 4.24px

## Lacunas e desvios

- **Text/Primary** (estilo FILL): sem hex resolvivel no file.json (Lacuna Q11); sem token.
- **Cantos assimetricos** (sem token `--radius-*`; usar classes por canto quando o componente exigir): `0,3,3,0` (70402:3334), `0,6,6,0` (I70493:2519;70491:1239), `14,0,0,14` (22:1346), `31,31,0,0` (70396:242), `40,40,0,0` (70397:245) — ordem [tl,tr,br,bl].
- **`--color-overlay`**: o file.json nao tem nenhum fill SOLID translucido (nem no Order Confirmation Modal 11:4385; o frame "Page Content (behind overlay)" so e nome); sem token.
- **`--color-surface-raised`** ja e cor Figma (70323:313); nao ha alias duplicado. `--color-success` tambem e cor Figma.
- **`--color-link`**: alias de `--color-text-accent` (Forgot Link 70381:244 e 70399:242); "Signup/Login Link" usam Text/Secondary — evidencia mista, ver componentes.
- **Contraste**: `--color-disabled-text` x `--color-disabled-bg` = 3.94:1 (< 4.5; texto desabilitado e isento do WCAG 1.4.3). `--color-error` x ink = 4.39:1: nao usar como cor de texto.
- **Raio 2.12px**: `cornerRadius` 2.1180124282836914 (I70492:696;70491:1280) arredondado a 2 casas (`--radius-2p12`). Numeros de sombras tambem a 2 casas (ex.: 6.6px, 19.8px, 0.45 de alfa).
- **Mobile**: Figma mobile = 414; breakpoints seguem prompt.md §8 (390 base, 768, 1440); desvio Q14.
