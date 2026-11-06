# InMed — Migração de SEO GitHub Pages → Vercel (06/11/2026)

## Domínio definitivo aprovado
- Produção e URL canônica: https://inmedpy.vercel.app/
- Site antigo: https://inmed-py.github.io/kit-de-sutura-paraguay/
- Área privada: https://inmedpy.vercel.app/gestion-inmed/ (manter `noindex, nofollow`).
- A indexação pública estava anteriormente desativada por `X-Robots-Tag` global; a migração altera a política para permitir páginas públicas. O URL da área privada permanece bloqueado.
- Não foi comprado nem configurado domínio personalizado.

## Baseline Search Console: 01–31/10/2026
Export fornecido pelo proprietário em 05/11/2026:
- 69 cliques, 2.893 impressões, CTR de 2,39%.
- 53 cliques mobile; 51 cliques do Paraguai.
- Resultados classificados como "Snippets do produto": 44 cliques e 711 impressões (recorte, não adição aos totais).
- Página antiga principal: 50 cliques, 852 impressões, CTR 5,87%, posição 4,62.
- Blog `tipos-de-sutura.html`: 8 cliques, 1.236 impressões, CTR 0,65%, posição 8,49.
- Blog `instrumental-quirurgico-basico.html`: 6 cliques, 187 impressões, CTR 3,21%.
- Principal consulta "kit de sutura paraguay": 14 cliques / 44 impressões / CTR 31,82% / posição 2,23.
Os recortes de "Páginas" podem apresentar soma de impressões diferente da série diária por agrupamento de URLs e fragmentos.

## Implementação no novo site
1. Canonical da home passa a `https://inmedpy.vercel.app/` e mantém title/description relevantes para produtos médicos no Paraguai.
2. Canonicals e links internos do blog apontam para as novas URLs, sem alterar os slugs históricos.
3. Nova página comercial `/kit-de-sutura-paraguay/` para a consulta prioritária e kit de 19 peças; usa os dados vigentes do Supabase para exibir preço e estoque, evitando preços fixos.
4. Sitemap com 18 URLs: home, landing comercial, índice do blog e 15 artigos; não há `lastmod` fictício.
5. `robots.txt` aponta ao sitemap novo. O `vercel.json` libera páginas públicas da antiga política global de `noindex`, mas preserva `noindex` na área administrativa.
6. Dados estruturados de organização e de produto; o preço e disponibilidade do produto são incorporados ao JSON-LD somente após consulta ao banco no navegador.
7. Removidos CTAs com preço antigo Gs. 249.000 de artigos do blog; redirecionados para a página comercial nova.
8. GA4 histórico preservado.

## Pendências EXTERNAS, não executadas
- **Redirecionamento da origem:** o repositório `inmed-py/kit-de-sutura-paraguay` está acessível com `pull=true` e `push=false` na conta GitHub conectada. Não foi alterado. Implementar mapeamento da raiz antiga para `https://inmedpy.vercel.app/kit-de-sutura-paraguay/` e de cada artigo antigo para o mesmo slug em `https://inmedpy.vercel.app/blog/...`. GitHub Pages não disponibiliza um servidor HTTP próprio para configurar um 301 por arquivo; se não for possível um redirect HTTP, usar redirect client-side em cada documento como último recurso. Evitar apontar todos os artigos para a home.
- **Imagens:** os HTMLs migrados ainda referenciam os assets `/img/...` do host antigo, para não introduzir links quebrados. Antes de alterar os paths ou substituir o site antigo, copiar os 17 arquivos de imagem referenciados ao novo projeto e atualizar URLs. Não direcionar URLs das imagens antigas para rotas HTML.
- **Search Console:** confirmar propriedade URL-prefix de `https://inmedpy.vercel.app/` no Google Search Console e enviar `https://inmedpy.vercel.app/sitemap.xml`. O usuário precisa verificar a propriedade; não houve submissão automatizada. A ferramenta "Alteração de endereço" pode não ser adequada para um site antigo hospedado como subcaminho de `github.io` compartilhado. Não prometer seu funcionamento.
- **Coerência do catálogo:** o produto `p1` está intitulado "Kit de Sutura InMed — 19 piezas", mas o primeiro item de `features` no banco ainda descreve "25 piezas organizadas en estuche". Corrigir esse campo no painel após conferência física; o SEO da landing utiliza o título atual de 19 peças. Nenhum produto ou preço foi alterado nesta migração.
- **Dados estruturados e rich results:** o HTML estático contém Produto sem oferta; o navegador atualiza a marcação com oferta e estoque quando recebe o catálogo do Supabase. Validar no teste de resultados avançados do Google. O renderizador de busca pode ignorar scripts assíncronos em algumas condições. Caso necessário, evoluir para entrega de dados estruturados no HTML gerado no servidor.
- Monitorar relatórios de indexação, rich results, CWV, CTR, impressões e posição por 4–12 semanas, comparando com a base de outubro/2026.

## Riscos e política
- Rankings podem variar durante a migração; canonical e sitemap são sinais, não garantia de transferência sem redirect equivalente.
- Não remover conteúdo/conta GitHub Pages até completar migração de imagens e redirecionamentos e estabilizar SEO.
- Evitar utilizar a mesma marcação e URL canonical em páginas sem conteúdo equivalente.
- Se o host de imagens antigo for desativado, fotos do blog migrado deixam de carregar até mover os arquivos.
