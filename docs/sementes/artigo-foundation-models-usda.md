# Semente de artigo: Time Series Foundation Models vs USDA

> **Semente para artigo futuro (série GJO).** Origem: card "Time Series Foundation
> Models" da antiga seção "Ciência de Ponta Aplicada", cortada da Research (Etapa 6
> da reorganização). Tema único (foundation models vs USDA em previsão de preço de
> commodities), não coberto pelos 14 artigos atuais do catálogo. A escrever com
> abstract, seções, referências e assinatura, no padrão dos artigos do catálogo
> (`src/lib/researchData.ts`, interface `ResearchPaper`).

## Conteúdo original do card (semente)

**Eyebrow / referência:** Wang et al. 2026 · arXiv:2601.06371

**Texto:**
Combinamos métodos clássicos (ARIMA) com os novíssimos Time Series Foundation Models
(2024 a 2026). Os modelos Time-MoE, Chronos e Moirai superaram as previsões oficiais
do USDA em 45% a 55% de precisão para milho, soja e trigo. O Time-MoE melhorou 54,9%
no trigo e 18,5% no milho em relação aos modelos tradicionais.

**Números-âncora:**
- Melhoria USDA (Trigo): +54,9%
- Melhoria USDA (Milho): +18,5%
- Ganho de precisão vs USDA (milho, soja, trigo): 45% a 55%

## Notas para a redação futura

- Ângulo único: foundation models de séries temporais aplicados à previsão de PREÇO
  de commodities agrícolas, batendo o benchmark do USDA. Não confundir com o artigo
  `previsao-volatilidade` (que é sobre volatilidade, com ceticismo sobre IA) nem com
  `garch-evt-commodities`.
- Tag sugerida: "Quantitativo" (série GJO).
- Estrutura no padrão `ResearchPaper`: id, date, tag, title, desc, author, readTime,
  isPublic, sections[] (abstract, heading, paragraph, callout, table, stat-grid...).
- Para aparecer público na listagem: adicionar o id ao `PUBLIC_IDS` em
  `src/pages/dashboard/Research.tsx` (ou marcar `isPublic: true`) e garantir
  `sections` não vazio (o ArticleReader exige sections para renderizar).
- Regras da casa na redação: sem travessões, decimais em vírgula, termos técnicos em
  inglês preservados (Time-MoE, Chronos, Moirai, foundation models, ARIMA).
- Verificar a referência arXiv:2601.06371 (Wang et al. 2026) antes de publicar.
