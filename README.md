# 🍴 Cardápio Rápido

**Do cardápio de papel ao delivery em segundos.**

Web app que transforma a foto de um cardápio (papel, quadro ou arte de Instagram) em um cardápio digital organizado, revisado e pronto para exportar, com análise de preços e uma automação que preenche uma planilha sozinha.

🔗 **App:** https://card-pio-r-pido-web-1gt7.bolt.host

📄 **Case completo:** https://sabrinajgomes.notion.site/Sabrina-Gomes-Projetos-com-IA-40b1cad9f4568193a8b6e7a124af3b42

---

## O problema

Muitos restaurantes pequenos têm o cardápio só no papel. Para entrar no delivery, alguém precisa digitar prato por prato, com preço e descrição. É uma etapa lenta, sujeita a erro de digitação, que atrasa a entrada do restaurante na plataforma.

## Como funciona

O dono do restaurante envia uma foto. Três agentes de IA trabalham em sequência, orquestrados pelo frontend, e um quarto agente pode ser chamado na aba de análise:

| Agente | O que faz |
| --- | --- |
| **Extrator** | Lê a imagem e organiza categorias, pratos, preços e descrições originais |
| **Revisor** | Confere a extração contra a imagem e corrige divergências, mostrando o motivo |
| **Redator** | Escreve descrições só para pratos sem descrição, sugere tags de dieta e monta combos |
| **Analista** | Sob demanda, lê os números do cardápio e sugere de 3 a 5 ações para o restaurante |

Todos seguem um bloco de **regras compartilhadas** (nomes sem numeração, preço com 2 casas, sem categorias inventadas, descrição original preservada, nenhum prato ou preço inventado).

O resultado aparece numa tabela editável e pode ser exportado em **CSV**.

## Análise do cardápio

A aba **Análise** calcula os números no navegador, sem IA, para que sejam exatos:

- total de pratos, preço médio, prato mais caro e mais barato
- gráfico e tabela com preço médio, mínimo e máximo por categoria
- **alertas de preço** para pratos 40% acima ou abaixo da média da categoria
- economia do cliente em cada combo sugerido

Os números se atualizam quando um preço é editado. O agente **Analista** só interpreta esses dados; as contas são feitas pelo código.

## Automação com Make

Fluxo para quem não quer abrir o app:

```
Foto no Google Drive → Make baixa a imagem → Extrator → Revisor → Redator → uma linha por prato no Google Sheets
```

No teste, uma foto gerou **16 linhas na planilha** (data, arquivo, categoria, prato, preço e descrição), sem digitação.

## Resultados

Teste com foto de celular inclinada, tirada de uma tela com reflexo:

- **16 de 16 pratos** e **4 de 4 categorias** extraídos
- **Todos os preços corretos**
- **Menos de 1 minuto** para a análise completa com os 3 agentes (cerca de 20 s em condições normais)

## Decisões de produto

- **A IA sugere, o dono decide.** Tags de dieta ("vegano", "sem glúten") aparecem como sugestão e só entram no CSV depois de confirmadas. Em delivery, uma informação de alergia errada é um risco real.
- **Nada inventado.** Sem tag "mais pedido" (a IA não tem esse dado) e sem categorias que não existem no cardápio.
- **Conta é trabalho do código.** Os números da análise são calculados pelo app; a IA só interpreta.
- **Resiliência.** Se o modelo estiver sobrecarregado, o app e a automação tentam de novo e usam um modelo reserva.

## Desafios resolvidos

| Problema | Causa | Solução |
| --- | --- | --- |
| Erro 404 | Nome de modelo desatualizado | Atualização para o modelo atual do Gemini |
| Erro 504 (timeout) | Uma chamada fazendo tudo de uma vez | Fluxo dividido em etapas e imagem reduzida antes do envio |
| Erro 503 (sobrecarga) | Alta demanda no serviço | Novas tentativas no frontend + modelo reserva |
| Agentes se contradizendo | Regras diferentes em cada agente | Bloco de regras compartilhadas |
| Erro 400 no Make | Imagem enviada como arquivo bruto | Conversão para base64 + tipo de arquivo padrão |
| Preço mudando sozinho | Rodinha do mouse alterava o campo numérico | Campo ignora a rodinha, aceita vírgula ou ponto e seleciona o valor ao clicar |

## Tecnologias

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Recharts
- **Backend:** Supabase Edge Functions
- **IA:** Google Gemini API (visão + JSON estruturado)
- **Automação:** Make + Google Drive + Google Sheets
- **Construído com:** Bolt (vibe coding)

## Próximos passos

- [x] Análise do cardápio: preço médio por categoria e itens fora da faixa
- [x] Automação: foto no Drive → cardápio pronto numa planilha
- [ ] Gerar artes de divulgação no Canva pela automação
- [ ] Teste com restaurantes reais

---

Feito por **Sabrina Gomes** · [LinkedIn](https://www.linkedin.com/in/sabrinajgomes/)
