# Pauli OS

Um chalé 2D habitável para vida pessoal, TikTok e trabalho profissional. React + TypeScript + Vite. GitHub main → Cloudflare Pages → Supabase.

## Desenvolvimento e publicação
Node 22+. `npm ci`, `npm run dev`, `npm test`, `npm run build`. Cloudflare Pages usa `npm run build`, pasta `dist`, raiz do repositório. Produção: https://pauli-os.pages.dev.

## A casa
O mapa preserva o chalé original. As placas selecionam um ambiente e oferecem entrada opcional. As cenas expandidas mostram apenas o ambiente escolhido. Cozinha, biblioteca e porão são alas acessadas no jardim; Café Work tem uma cena externa própria.

- Quarto pessoal: cama, rotina, yoga, diário por data e Daily Remembers. Sem tarefas de TikTok.
- Estúdio: sentar no computador abre o hub TikTok, com briefing, tarefas/planejamento e os produtos, vídeos, hooks e métricas existentes.
- Sala: sofá utilizável e lareira com estado persistente.
- Cozinha: preparar, carregar, tomar e guardar café; mesa utilizável; jornal manual paginado e rádio preparado.
- Biblioteca: livros para abrir briefings e Daily Remembers antigos e ideias.
- Porão: caixa persistente de experimentos.
- Café Work: mesa/computador e caderno de tarefas profissionais, separado do TikTok.
- Gepetinho: poltrona, mural de ideias e interface de conversa desativada. O NPC usa cozinha, sofá, biblioteca, estúdio, café e seu quarto. Nunca entra no quarto da Pauli.

## Arquitetura do mundo
`World.tsx` registra objetos com posição de aproximação, pose e ação. `inhabitants.mjs` centraliza permissões, aproximação, chegada, saída e trajetos pelo corredor/escada. Avatares têm estados idle, walking, sitting, lying, using e drinking; `Avatar.tsx` é o ponto único para substituir a arte/sprites. As transições são locais e não usam IA. Animações respeitam prefers-reduced-motion.

Lareira e rádio persistem em `house_state`. Poses e xícaras são efêmeras da sessão. O diário fica em `journal_entries` com unicidade por usuário/data. `house_records` guarda yoga, lembretes, ideias, notícias, tarefas TikTok, tarefas profissionais e experimentos. `briefings` foi reutilizada, com categorias, fontes e confirmação explícita de leitura. Abrir registra `opened_at`; ler registra `read_at`; concluir uma tarefa registra `completed_at`, independentemente. Conteúdo manual não ganha data de geração por IA.

As migrations em `supabase/migrations` reproduzem as versões aplicadas no projeto. O teste transacional em `supabase/tests` cria usuários temporários, verifica CRUD/isolamento e reverte tudo. Novas tabelas têm RLS por auth.uid(), sem acesso anon. A proteção opcional do Auth contra senhas vazadas permanece na configuração existente; não foi habilitado nenhum plano pago.

## Conteúdo e integrações
- Yoga: escolha manualmente título, URL, duração e data. O vídeo abre na fonte; a conclusão usa daily_checkins.yoga_done. A estrutura aceita futuros produtores automáticos de conteúdo.
- Briefing: inserir/editar manualmente no computador. Fontes são links; abrir não confirma leitura. Editar invalida a confirmação anterior. Histórico acessível pela biblioteca.
- Jornal: notícias manuais com data, imagem opcional, fonte e link. Não há manchetes inventadas nem busca automática nesta versão.
- Daily Remembers: páginas pessoais com abertura, leitura e conclusão explícitas. Sem integração automática com conversas do ChatGPT nesta fase.
- Rádio: ligar/desligar e volume persistem visualmente. Não reproduz áudio por enquanto. A integração Spotify exige um aplicativo OAuth e backend/proxy apropriado no futuro; nenhum segredo foi incluído.
- Clima: Open-Meteo público, coordenadas fixas de Birigui (-21.2886,-50.3400), atualização a cada 15 minutos. Dia/noite, nuvens, chuva e tempestade no mapa. Falhas usam horário America/Sao_Paulo e atmosfera normal. Sem geolocalização do dispositivo. API gratuita para uso pessoal não comercial, sem chave; dados com atribuição Open-Meteo. Não há assinatura nem fallback pago.
- IA: `agents.ts` define interface independente de provider; provider desativado. Não há requisições OpenAI/Grok ou vínculo técnico com assinatura ChatGPT.

## Segurança e limites
Somente publishable key no frontend. Fotos existentes continuam no bucket privado product-images com URLs assinadas. Nenhuma service-role, segredo ou nova dependência foi adicionada. Conteúdos pessoais são isolados por usuário. Links aceitam somente HTTP(S), sem HTML executável.

As novas alas usam ilustração vetorial leve e os cômodos originais preservam a arte do protótipo. A movimentação usa pontos de passagem, não física completa ou detecção de colisão por pixel. Métricas, notícias, briefings e tarefas ainda são manuais; calendário, pomodoro, integrações automáticas e agentes autônomos são extensões futuras. Nenhum gato foi adicionado.
