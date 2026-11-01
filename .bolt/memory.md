# Project memory

## Product intent & audience

- **Cardápio Rápido** é um app web em português (pt-BR) para pequenos donos de restaurantes que desejam entrar no delivery.
- Transforma foto de cardápio físico em um menu digital estruturado e editável, com enriquecimento assistido por IA e exportação para planilhas ou plataformas de delivery.
- O usuário deve conseguir revisar, corrigir e exportar os pratos mesmo quando o enriquecimento por IA falhar.
- Não há autenticação nem persistência de cardápios; o fluxo é individual.

## Brand personality & voice

- Calorosa, acessível e prática para pessoas não técnicas.
- Mensagens em português, claras, encorajadoras e orientadas à ação.
- Erros devem explicar o próximo passo sem expor detalhes técnicos, JSON bruto ou respostas da API.
- Sugestões geradas pela IA devem ser apresentadas como revisáveis, nunca como fatos garantidos.

## Visual design & UX direction

- Experiência mobile-first com estética quente, usando laranja, terracota e creme.
- Tipografia editorial já carregada no `index.html`.
- Componentes centrais: cabeçalho, upload por arrastar/soltar e câmera, estados de processamento, tabela editável por categoria, cards de combos e exportação CSV.
- Após a extração, a tabela aparece imediatamente e permanece editável enquanto o enriquecimento ocorre.
- A tabela permite editar nome, preço, descrição e tags, além de adicionar, remover e reordenar pratos.
- Tags dietéticas sugeridas pela IA — como “vegano”, “sem lactose” e “sem glúten” — aparecem como chips claros, com borda tracejada e indicação explícita de **“Sugestão da IA”**.
  - Clicar em uma sugestão permite confirmá-la ou removê-la.
  - Tags confirmadas devem ter aparência visual distinta das sugestões e são as únicas consideradas na exportação.
- A tag **“mais pedido”** não deve aparecer, pois não pode ser inferida com segurança pela IA.
- Combos aparecem em cards distintos com nome, descrição, itens e preço.
- O progresso é comunicado em duas fases: leitura do cardápio e enriquecimento de descrições/combos.
- Estados de retry devem ser explícitos, incluindo a tentativa atual.
- O resultado exibe o tempo total da análise, incluindo esperas entre tentativas.
- Ícones e logos usam `lucide-react`; não há necessidade de bibliotecas adicionais de UI ou ícones.

## Decisions, constraints & rationale

- Stack atual: Vite + React (JSX), Tailwind CSS e hooks do React.
- Imports internos usam o alias `@/`, apontando para `src/`.
- A extração e o enriquecimento são fluxos distintos:
  - `extract`: envia a imagem e retorna categorias, pratos e preços.
  - `enrich`: recebe o JSON extraído, sem reenviar a imagem, e retorna descrições, tags sugeridas e três combos.
- O modelo de dados separa tags sugeridas pela IA das tags confirmadas pelo dono.
- O CSV exporta exclusivamente tags confirmadas; sugestões não confirmadas jamais devem ser incluídas.
- A IA não solicita nem produz a tag “mais pedido”.
- O enriquecimento deve preservar as categorias existentes no cardápio original e seus pratos, sem criar categorias novas.
- Categorias e pratos extraídos devem continuar disponíveis mesmo se o enriquecimento falhar.
- Chamadas ao Gemini acontecem apenas no servidor, por Supabase Edge Function; a chave permanece em variável de ambiente do servidor.
- A Edge Function faz uma chamada ao Gemini por requisição, com timeout de 40 segundos via `AbortController`.
- Timeout, HTTP 429 e HTTP 503 retornam erro amigável e identificável; retries são controlados pelo frontend, até três tentativas, com três segundos entre chamadas ocupadas.
- As tentativas iniciais usam `gemini-3.5-flash`; a última usa `gemini-2.5-flash` como reserva.
- Imagens são redimensionadas no navegador para no máximo 1600 px no maior lado e convertidas para JPEG com qualidade 0.8.
- Erros de API, timeout e respostas vazias continuam registrados no console, sem expor o corpo bruto ao usuário.
- A atualização que separa sugestões e confirmações, impede “mais pedido” e preserva categorias foi implementada; o build foi verificado com sucesso.

## Open questions & assumptions

- O mecanismo final para reordenar pratos ainda pode ser arrastar/soltar ou botões.
- A persistência de cardápios, autenticação e suporte a múltiplos usuários exigirão evolução arquitetural.
- Formatos CSV específicos de plataformas de delivery ainda não foram definidos; atualmente o foco é Excel/Google Sheets.
- A qualidade da foto e da escrita afeta a extração; não existe fallback específico além das tentativas do frontend.
- Combos ainda dependem da IA e não possuem fallback baseado em regras.
- O limite de imagem e a qualidade JPEG podem precisar de ajuste caso persistam timeouts.
- O comportamento visual para falha após a terceira tentativa e para erros diferentes de 429/503 ainda pode ser refinado.
- É necessário manter clara, em toda a interface, a diferença entre uma tag apenas sugerida e uma tag confirmada pelo dono.