# 🍴 Cardápio Rápido

**Do cardápio de papel ao delivery em segundos.**

Web app que transforma a foto de um cardápio (papel, quadro ou arte de Instagram) em um cardápio digital organizado, revisado e pronto para exportar.

🔗 **App:** https://card-pio-r-pido-web-1gt7.bolt.host

---

## O problema

Muitos restaurantes pequenos têm o cardápio só no papel. Para entrar no delivery, alguém precisa digitar prato por prato, com preço e descrição. É uma etapa lenta, sujeita a erro de digitação, que atrasa a entrada do restaurante na plataforma.

## Como funciona

O dono do restaurante envia uma foto. Três agentes de IA trabalham em sequência, orquestrados pelo frontend:

| Agente | O que faz |
| --- | --- |
| **Extrator** | Lê a imagem e organiza categorias, pratos, preços e descrições originais |
| **Revisor** | Confere a extração contra a imagem e corrige divergências, mostrando o motivo |
| **Redator** | Escreve descrições só para pratos sem descrição, sugere tags de dieta e monta combos |

Os três seguem um bloco de **regras compartilhadas** (nomes sem numeração, preço com 2 casas, sem categorias inventadas, descrição original preservada).

O resultado aparece numa tabela editável e pode ser exportado em **CSV**.

## Resultados

Teste com foto de celular inclinada, tirada de uma tela com reflexo:

- **16 de 16 pratos** e **4 de 4 categorias** extraídos
- **Todos os preços corretos**
- **19,1 segundos** para a análise completa com os 3 agentes

## Decisões de produto

- **A IA sugere, o dono decide.** Tags de dieta ("vegano", "sem glúten") aparecem como sugestão e só entram no CSV depois de confirmadas. Em delivery, uma informação de alergia errada é um risco real.
- **Nada inventado.** Sem tag "mais pedido" (a IA não tem esse dado) e sem categorias que não existem no cardápio.
- **Resiliência.** Se o modelo estiver sobrecarregado, o app tenta de novo automaticamente e usa um modelo reserva.

## Desafios resolvidos

| Problema | Causa | Solução |
| --- | --- | --- |
| Erro 404 | Nome de modelo desatualizado | Atualização para o modelo atual do Gemini |
| Erro 504 (timeout) | Uma chamada fazendo tudo de uma vez | Fluxo dividido em etapas e imagem reduzida antes do envio |
| Erro 503 (sobrecarga) | Alta demanda no serviço | Novas tentativas no frontend + modelo reserva |
| Agentes se contradizendo | Regras diferentes em cada agente | Bloco de regras compartilhadas |

## Tecnologias

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase Edge Functions
- **IA:** Google Gemini API (visão + JSON estruturado)
- **Construído com:** Bolt (vibe coding)

## Próximos passos

- [ ] Automação com n8n: foto enviada por formulário → cardápio pronto por e-mail e numa planilha
- [ ] Análise do cardápio: preço médio por categoria e itens fora da faixa
- [ ] Teste com restaurantes reais

---

Feito por **Sabrina Gomes** · [LinkedIn](https://www.linkedin.com/in/sabrinajgomes/)
