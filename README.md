# Pauli OS

Um chalé 2D interativo para rotina pessoal e criação de conteúdo. React + TypeScript + Vite, publicado no Cloudflare Pages e conectado ao Supabase existente.

## Desenvolvimento

Node 22 ou mais recente. Execute `npm ci`, `npm run dev`. Build de produção: `npm run build` (saída `dist`). Testes: `npm test`.

## Publicação

GitHub `main` → Cloudflare Pages → Supabase. Preset Vite ou None, comando `npm run build`, saída `dist`, raiz do repositório. `wrangler.toml` registra a saída do Pages. Não há Functions nem dependência de APIs pagas.

## V1

- Supabase Auth com email/senha, cadastro, recuperação e logout.
- Visão geral da casa; selecionar um cômodo oferece expansão opcional; botão para voltar.
- Pauli caminha por toque no chão; Gepetinho passeia automaticamente.
- Diário com registro diário idempotente pela data local, cuidados, notas e contadores manuais.
- Estante física com amostras, upload privado de imagens, meta padrão de seis vídeos, registros de vídeos, ganchos e resultados acumulados.
- Sala e observatório com interações simples. Nenhum gato nesta versão.

## Dados e segurança

Somente a chave publishable é usada no cliente. As tabelas e buckets existentes mantêm RLS por `auth.uid()`. Fotos são salvas em `product-images/<user_id>/...`; URLs assinadas expiram em uma hora e são renovadas enquanto a aplicação permanece aberta. Não há service-role no código.

O Supabase Auth deve permitir o endereço público em URL Configuration para emails de confirmação e recuperação. As contagens manuais do diário são independentes dos vídeos associados às amostras. Resultados são snapshots manuais acumulados, e não somas dos snapshots. O progresso conta vídeos com `posted_at`.

## Limites atuais

Arte 2D com objetos interativos e movimentação simples por pontos de passagem. Expansão aproxima o ambiente e revela ações. Conversas/autonomia de IA, integração automática de métricas, novos cômodos e pets são etapas futuras. Os dados da conta começam vazios.

A arte do chalé foi produzida a partir da referência visual fornecida pela proprietária do projeto.
