# Validação administrativa InMed — 2026-11-05

## Ambiente
- Supabase: InMed (projeto `qozaarjaqonggtktqtxh`)
- Repositório: `eradinho-max/inmedpy`, ramo `feat/admin-session-seo-readiness-20261105`
- Vercel: preview da feature branch READY; produção permanece em `main`
- Catálogo: 12 produtos / 6 categorias; IDs de produtos e categorias únicos

## Correção implementada no banco
Migração `inmed_restrict_store_table_privileges_20261105`:
- `anon`: SELECT exclusivamente em `public.store_state`
- `authenticated`: SELECT em `store_state`/`store_admins`, UPDATE em `store_state` condicionado por RLS
- TRUNCATE, DELETE, INSERT e privilégios administrativos excedentes revogados de ambos os papéis.
- RLS permanece ativo nas duas tabelas.

## Testes executados
- `anon` consegue ler a linha de catálogo: 1 linha.
- `anon` não possui SELECT em `store_admins`.
- `anon` tentar UPDATE em `store_state`: erro SQL 42501 de permissão (esperado).
- `authenticated` sem sessão/membership, UPDATE com RLS: nenhuma linha retornada; a instrução foi executada em transação com ROLLBACK.
- Nenhuma linha de produtos e categorias modificada na validação.
- Supabase Security Advisor: sem lints retornados.
- Conteúdo: 12 produtos ativos com imagens, nomes preenchidos e sem preço negativo; 6 categorias.

## Interface revisada em código (ainda NÃO comprovada end-to-end)
- Login exige vínculo em `store_admins`.
- Renovação de access token por refresh token e limpeza de sessão.
- Troca de senha com verificação da senha atual.
- Controle de versão `updated_at` em salvamento concorrente.
- Aviso ao sair com alterações não salvas.
- Tamanho da mídia limitado antes de upload e token atualizado.

## Pendências obrigatórias
1. Criar usuário Auth com e-mail efetivamente autorizado via interface segura do Supabase.
2. Cadastrar `auth.users.id` em `public.store_admins` pelo administrador do projeto.
3. Testar manualmente login, sessão expirada, troca de senha, logout e negação a um usuário não admin.
4. Testar adição/edição/remoção de produto, salvar, recarregar, upload e preview da imagem (preferencialmente com item de teste oculto).
5. Testar conflitos de edição em duas abas; garantir nenhum dado perdido.
6. Validar interface desktop/mobile e remover eventuais falhas antes de mesclar PR.
7. Preservar `X-Robots-Tag: noindex, nofollow` global no ambiente provisório, preparar SEO apenas no lançamento.

**Não criar usuários mediante manipulação direta de `auth.users` por SQL nem inventar endereço de e-mail ou senha.**
