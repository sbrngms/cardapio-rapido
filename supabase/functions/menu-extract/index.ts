const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PRIMARY_MODEL = "gemini-3.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_TIMEOUT_MS = 40000;

const SHARED_RULES = `REGRAS COMPARTILHADAS (todos os agentes seguem exatamente as mesmas regras):
1. Nomes de pratos NUNCA incluem numeração inicial. Remova números, hifens e travessões no início (ex: "01 - Fritas" vira "Fritas"). A ausência de numeração NÃO é um erro — é a regra.
2. Preços são sempre números decimais com 2 casas (ex: 25.90, não 25.9).
3. Não crie, renomeie ou remova categorias. Use exatamente as que aparecem no cardápio.
4. Se um prato tem descrição visível no cardápio, extraia-a exatamente como aparece e nunca a altere. Se não houver, deixe string vazia.
5. Todo o texto deve ser em português brasileiro.`;

const EXTRACT_PROMPT = `Você é um especialista em cardápios de restaurantes brasileiro.

Analise a foto do cardápio e extraia TODAS as informações visíveis: categorias, pratos e preços.

Para cada categoria visível (ex: Entradas, Pratos Principais, Sobremesas, Bebidas), liste todos os pratos com seus respectivos preços.

Para cada prato:
- name: o nome do prato (sem numeração inicial, conforme as regras).
- price: o preço como número decimal (ex: 29.90). Se não houver preço visível, use 0.
- description: se houver uma descrição visível no cardápio, extraia-a exatamente como aparece. Se não houver, deixe string vazia.
- tags: array vazio

${SHARED_RULES}

Se não conseguir ler o cardápio, retorne categorias vazias.`;

const EXTRACT_SCHEMA = {
  type: "OBJECT",
  properties: {
    categories: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          dishes: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                price: { type: "NUMBER" },
                description: { type: "STRING" },
                tags: { type: "ARRAY", items: { type: "STRING" } },
              },
              required: ["name", "price", "description", "tags"],
            },
          },
        },
        required: ["name", "dishes"],
      },
    },
  },
  required: ["categories"],
};

const REVIEW_PROMPT = `Você é um revisor meticuloso de cardápios de restaurantes brasileiro.

Você recebe a imagem do cardápio e o JSON extraído por outro agente. Sua tarefa é conferir item por item e apontar apenas PROBLEMAS REAIS que violem as regras compartilhadas ou que divergem da imagem.

${SHARED_RULES}

O QUE VERIFICAR (apenas isso é considerado erro):
- Preço que diverge da imagem (ex: imagem mostra 25,90 e o JSON tem 25.9, ou um prato principal por R$ 1,50).
- Nome escrito errado em relação à imagem (ex: "Filé" extraído como "File"). Diferença de numeração NÃO é erro — os nomes sem numeração estão corretos por definição.
- Prato que aparece na imagem mas falta no JSON.
- Categoria que aparece na imagem mas falta no JSON.

O QUE NÃO É ERRO (não corrija):
- Nomes sem numeração inicial — isso é a regra, não um problema.
- Descrições originais do cardápio mantidas como estão.
- Preços com 2 casas decimais que batem com a imagem.

Para cada item corrigido, inclua "reviewNote" com o motivo em português, ex: "Revisor: preço corrigido de 25,9 para 25,90". Para itens sem alteração, deixe "reviewNote" como string vazia.

Se NENHUM item precisou de correção, inclua um campo "overallNote" com o texto "Revisor: nenhum problema encontrado".

Use exatamente as categorias que aparecem na imagem. Não crie categorias novas.

Retorne o JSON completo com as mesmas categorias e pratos, agora com reviewNote em cada prato.`;

const REVIEW_SCHEMA = {
  type: "OBJECT",
  properties: {
    categories: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          dishes: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                price: { type: "NUMBER" },
                description: { type: "STRING" },
                tags: { type: "ARRAY", items: { type: "STRING" } },
                reviewNote: { type: "STRING" },
              },
              required: ["name", "price", "description", "tags", "reviewNote"],
            },
          },
        },
        required: ["name", "dishes"],
      },
    },
    overallNote: { type: "STRING" },
  },
  required: ["categories"],
};

const WRITE_PROMPT = `Você é um redator de marketing gastronômico brasileiro.

Receba o JSON de um cardápio já revisado. Para cada prato:
- description: se o prato já tiver uma descrição não vazia, mantenha-a exatamente como está. Se estiver vazia, crie uma descrição curta (máximo 120 caracteres), atrativa e vendedora.
- tags: atribua apenas tags sugeridas dentre: "vegetariano", "vegano", "sem glúten", "sem lactose", "picante", "caseiro", "fit". Nunca use "mais pedido".
- reviewNote: mantenha o campo reviewNote do prato sem alterar.

${SHARED_RULES}

Use exatamente as categorias e os pratos recebidos. Não crie, renomeie ou remova categorias.

Depois, sugira exatamente 3 combos criativos:
- name, description, items (nomes dos pratos), price (com desconto).

Mantenha os nomes e preços originais. Todo o texto em português brasileiro.`;

const WRITE_SCHEMA = {
  type: "OBJECT",
  properties: {
    categories: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          dishes: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                price: { type: "NUMBER" },
                description: { type: "STRING" },
                tags: { type: "ARRAY", items: { type: "STRING" } },
                reviewNote: { type: "STRING" },
              },
              required: ["name", "price", "description", "tags", "reviewNote"],
            },
          },
        },
        required: ["name", "dishes"],
      },
    },
    combos: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          description: { type: "STRING" },
          items: { type: "ARRAY", items: { type: "STRING" } },
          price: { type: "NUMBER" },
        },
        required: ["name", "description", "items", "price"],
      },
    },
  },
  required: ["categories", "combos"],
};

function stripMarkdownFence(text: string): string {
  let cleaned = text.trim();
  const fenceMatch = cleaned.match(/^```(?:json)?\s*\n([\s\S]*?)\n```\s*$/i);
  if (fenceMatch) cleaned = fenceMatch[1].trim();
  return cleaned;
}

interface GeminiResult {
  data: Record<string, unknown> | null;
  error: string | null;
  finishReason: string | null;
  raw: string;
}

function isTransientStatus(status: number): boolean {
  return status === 429 || status === 503 || status === 504;
}

function busyError(): GeminiResult {
  return {
    data: null,
    error: "O serviço de IA está ocupado agora. Tente novamente em instantes.",
    finishReason: null,
    raw: "",
  };
}

async function callGemini(
  apiKey: string,
  body: Record<string, unknown>,
  requestedModel: unknown,
): Promise<{ result: GeminiResult; status: number }> {
  const model = requestedModel === FALLBACK_MODEL ? FALLBACK_MODEL : PRIMARY_MODEL;
  const endpoint = `${GEMINI_BASE_URL}/${model}:generateContent`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Gemini][${model}] HTTP ${res.status}:`, errText);
      if (isTransientStatus(res.status)) return { result: busyError(), status: res.status };
      return {
        result: { data: null, error: `Erro HTTP ${res.status}.`, finishReason: null, raw: "" },
        status: res.status,
      };
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const finishReason = candidate?.finishReason || data?.promptFeedback?.blockReason || null;
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      const bodyStr = JSON.stringify(data);
      console.error(`[Gemini][${model}] Resposta sem texto — finishReason: ${finishReason || "desconhecido"}`, bodyStr);
      return {
        result: { data: null, error: `Resposta vazia (finishReason: ${finishReason || "desconhecido"}).`, finishReason, raw: bodyStr },
        status: res.status,
      };
    }

    const cleaned = stripMarkdownFence(text);
    try {
      return { result: { data: JSON.parse(cleaned), error: null, finishReason, raw: text }, status: res.status };
    } catch {
      console.error(`[Gemini][${model}] Falha ao parsear JSON:`, text);
      return {
        result: { data: null, error: `JSON inválido (finishReason: ${finishReason || "desconhecido"}).`, finishReason, raw: text },
        status: res.status,
      };
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error(`[Gemini][${model}] Timeout após ${GEMINI_TIMEOUT_MS / 1000}s.`);
      return { result: busyError(), status: 504 };
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY não configurada no servidor." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const step: string = payload.step;

    if (step === "extract") {
      const { image, mimeType } = payload;
      if (!image || typeof image !== "string") {
        return new Response(
          JSON.stringify({ error: "Imagem não fornecida." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      console.log("[extract] mimeType:", mimeType, "base64 length:", image.length);

      const response = await callGemini(apiKey, {
        contents: [
          { parts: [
            { text: EXTRACT_PROMPT },
            { inline_data: { mime_type: mimeType || "image/jpeg", data: image } },
          ] },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: EXTRACT_SCHEMA,
          thinkingConfig: { thinkingLevel: "low" },
          temperature: 0.3,
        },
      }, payload.model);

      const result = response.result;
      if (!result.data) {
        return new Response(
          JSON.stringify({ error: result.error, finishReason: result.finishReason }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(JSON.stringify({ categories: (result.data as Record<string, unknown>).categories || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (step === "review") {
      const { image, mimeType, menu } = payload;
      if (!image || !menu) {
        return new Response(
          JSON.stringify({ error: "Imagem e cardápio são obrigatórios para revisão." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      console.log("[review] base64 length:", image.length);

      const response = await callGemini(apiKey, {
        contents: [
          { parts: [
            { text: REVIEW_PROMPT },
            { inline_data: { mime_type: mimeType || "image/jpeg", data: image } },
            { text: `JSON extraído:\n${JSON.stringify(menu)}` },
          ] },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: REVIEW_SCHEMA,
          thinkingConfig: { thinkingLevel: "low" },
          temperature: 0.2,
        },
      }, payload.model);

      const result = response.result;
      if (!result.data) {
        return new Response(
          JSON.stringify({ error: result.error, finishReason: result.finishReason }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const reviewData = result.data as Record<string, unknown>;
      return new Response(JSON.stringify({
        categories: reviewData.categories || [],
        overallNote: typeof reviewData.overallNote === "string" ? reviewData.overallNote : "",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (step === "write") {
      const { menu } = payload;
      if (!menu) {
        return new Response(
          JSON.stringify({ error: "Cardápio não fornecido para redação." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const response = await callGemini(apiKey, {
        contents: [
          { parts: [
            { text: WRITE_PROMPT },
            { text: `Cardápio em JSON:\n${JSON.stringify(menu)}` },
          ] },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: WRITE_SCHEMA,
          thinkingConfig: { thinkingLevel: "low" },
          temperature: 0.7,
        },
      }, payload.model);

      const result = response.result;
      if (!result.data) {
        return new Response(
          JSON.stringify({ error: result.error, finishReason: result.finishReason }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const enriched = result.data as Record<string, unknown>;
      return new Response(
        JSON.stringify({ categories: enriched.categories || [], combos: enriched.combos || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "Passo desconhecido. Use 'extract', 'review' ou 'write'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Erro interno do servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
