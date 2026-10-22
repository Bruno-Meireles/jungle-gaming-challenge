# Mapeando o Figma sem o MCP

**Resposta curta: sim.** O MCP é só uma conveniência sobre a API REST do Figma. Dá para extrair todas as telas e medidas sem ele. A extração já foi executada: o resultado está em `docs/figma/` (`file.json`, `frames.json`, `screens/`). Para refazer: `node --env-file=.env tools/figma-extract.mjs`.

- Arquivo (cópia mais atualizada, modificada em 2026-10-21): `https://www.figma.com/design/OyXYOPplYqCs5qkbUCscuo/Frontend-Challenge--Copy-` (file key `OyXYOPplYqCs5qkbUCscuo`, definida em `FIGMA_FILE_KEY` no `.env`).
- O arquivo original (`Ff0SksUi7UFtPWUO8kyNtw`) foi descartado: frames idênticos; só o ícone de senha do Perfil diferia.

## Opção A (recomendada): API REST do Figma + script

1. Gere um *Personal Access Token* em Figma → Settings → Security (escopo `file_content:read`). Guarde em `FIGMA_TOKEN` (nunca versionar).
2. Árvore completa, com medidas (`absoluteBoundingBox`, `layoutMode`, `itemSpacing`, `padding*`, `cornerRadius`, `fills`, `style` de texto):
   ```bash
   curl -H "X-Figma-Token: $FIGMA_TOKEN" \
     "https://api.figma.com/v1/files/OyXYOPplYqCs5qkbUCscuo?geometry=paths" -o docs/figma/file.json
   ```
3. Um frame específico: `GET /v1/files/:key/nodes?ids=16-1228` (troque `-` por `:` nos ids → `16:1228`).
4. Imagens/assets de referência: `GET /v1/images/:key?ids=<ids>&format=png&scale=2` (e `format=svg` para ícones). Salve em `docs/figma/screens/`.
5. Estilos e componentes: `GET /v1/files/:key/styles`, `/components`. Variáveis (`/v1/files/:key/variables/local`) exigem plano Enterprise; sem ele, derive tokens dos `fills`/`style` do JSON.
6. Um script (`tools/figma-extract.ts`, a criar) percorre o JSON e gera `docs/figma/screens.md` + `tokens.json`: por frame, nome, largura × altura, e para cada nó relevante posição relativa ao frame, tamanho, gap, padding, raio, cor, fonte/peso/tamanho/line-height.

Telas esperadas (enunciado §3): Início, Detalhes do NFT, Carrinho, Pagamento, Confirmação, Login, Cadastro, Perfil, Carteiras — frames desktop e mobile. Perfil, carteiras e confirmação podem não ter frame mobile: derive.

## Opção B: sem token (export manual)

- Dev Mode (aba *Inspect*) em cada frame: copie CSS/medidas; ou exporte frames como PNG @2x e SVG.
- Plugins de export de JSON/design tokens (ex.: "Design Tokens", "Figma to JSON") geram o mesmo conteúdo da Opção A.
- Com os PNGs dos frames, compare no Playwright com `toHaveScreenshot()` e meça o DOM real com `locator.boundingBox()` / `getComputedStyle` contra a tabela de medidas.

## Validação das medidas no código

1. Tokens (cores, tipografia, espaçamento, raios) vão para o pacote do design system (`@jg/design-system`) como variáveis do Tailwind.
2. Para cada tela, um teste Playwright de regressão visual em 1440 e 390 usando o PNG do Figma como referência inicial; depois, baseline versionada.
3. Medidas que não vierem do Figma não devem ser inventadas: registrar em `ARCHITECTURE.md` como desvio.

## Fatos herdados do protótipo (não reverificados aqui)

Fonte: `docs/agents/LEARNINGS.md` do protótipo `Frontend-Marketplace-de-NFTs-1`, consultados nesta mesma cópia — ainda não reverificados contra `docs/figma/file.json`.

- Fonte `Roboto Mono` (400/500/700, licença OFL).
- Cores: foreground `#F5F1EB`, ink `#140D0A`, primary `#D28A4C`, text accent `#E89B55`, secondary `#B39463`, text secondary `#CFB28C`, surface card `#241612`, surface elevated `#2F1D15`, surface dark `#38220F`, border `#3F2319`, border soft `#55321F`.
- CTA: 140 × 40 px, raio 6, texto 16/20 peso 700, fundo `#D28A4C`, texto `#140D0A`.
- Não existe escala de espaçamento nas variáveis; não presumir.
