# InMed — SEO e migração: critérios para o lançamento (05/11/2026)

## Regra de publicação
O ambiente Vercel de validação mantém `X-Robots-Tag: noindex, nofollow` global. **Não remover** enquanto domínio canônico, catálogo, páginas e redirecionamentos não estiverem validados. Não pedir indexação do ambiente de testes.

## Diagnóstico do código atual
- `index.html` e `blog/index.html` ainda apontam canonical/OG para `https://inmed-py.github.io/kit-de-sutura-paraguay/`.
- `robots.txt` e `sitemap.xml` ainda referenciam URLs do site original.
- O blog histórico foi recuperado em 04/11/2026; preservar URLs e conteúdo durante a migração.
- Na Vercel, `vercel.json` usa `X-Robots-Tag: noindex, nofollow` para TODAS as respostas. **Não remover até o lançamento**.

## Checklist de migração
1. Confirmar domínio público definitivo e inventariar URLs históricas do Search Console e sitemap anterior.
2. Montar mapa URL antiga → URL nova, preservar slug quando possível e testar redirecionamentos permanentes 301/308 com destino equivalente.
3. Atualizar meta canonical, hreflang, Open Graph, JSON-LD, links internos, `robots.txt` e `sitemap.xml` para o domínio definitivo, somente no momento certo.
4. Páginas de produtos e categorias: indexar quando publicadas, únicas e úteis. Evitar URLs vazias, filtros duplicados, buscas internas, login, carrinho e admin.
5. Validar HTML renderizado com Googlebot, links navegáveis sem JS quando necessário, status HTTP e ausência de `noindex` nas páginas estratégicas.
6. Aplicar `noindex` por rota a admin/áreas privadas; não depender de `robots.txt` para desindexação.
7. Testar redirects, canonical e cobertura antes de alterar o DNS; depois enviar sitemap e monitorar Search Console.
8. Em Search Console, 'Rastreada, no indexada' não é necessariamente erro. Investigar primeiro as URLs comerciais e artigos prioritários; não perseguir indexação de 100% de URLs.

## Restrições
- Não apontar canonical do domínio novo antes de decidir se ele substitui ou complementa o antigo.
- Não publicar sitemap de staging.
- Não apagar o site legado como rollback até estabilização do tráfego orgânico e das rotas.
- Evitar datas artificiais em `lastmod`; atualizar quando o conteúdo da URL for efetivamente alterado.
