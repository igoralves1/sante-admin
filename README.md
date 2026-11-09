# Santé Admin

Gestão de ocupação, contratos, despesas e marketing da
[Santé Consultórios](https://santeconsultorios.com.br/) (Jatiúca, Maceió), que aluga consultórios
para profissionais de saúde.

**Site:** https://igoralves1.github.io/sante-admin/

Feito em Vue 3 + Vite + D3.js, publicado no GitHub Pages. Os números e as fórmulas seguem o documento
“Potencial Santé” e a planilha `Sistema_Controle_Sante.xlsx`. As informações públicas sobre a clínica
e suas fontes estão em [`docs/REFERENCIAS.md`](docs/REFERENCIAS.md).

## Páginas

| Página | Para que serve |
|---|---|
| **Visão geral** (Início) | Apresentação do projeto e da clínica, com referências |
| **Painel gerencial** | Ocupação do mês (ponderada pela receita), ocupação por espaço contra a meta, receita disponível, receita mês a mês e tabela ordenável |
| **Carteira de contratos** | CRUD dos contratos por espaço: período, **duração**, valor mensal, **valor total do contrato**, status, vigência, **despesas e resultado de cada espaço**; renovação de contratos |
| **Centros de custo** (Espaços) | Lista dos espaços; **Cadastrar novo espaço** e edição com modalidade, capacidade, preço, descrição e **despesas associadas** |
| **Página do espaço** (`#/espacos/:id`) | Aberta pelo nome do espaço. Valor pedido por turno (vira a receita potencial), agenda em turnos (turnos da Santé guardados no bloco `turnos` do `sante.json`; editáveis com Salvar, que atualiza todos os espaços) com clique ou arraste para reservar, histórico por ano, comparativo anual, uso por dia × turno, receita por profissional e movimentação |
| **Locatários** (Profissionais) | Cadastro de quem aluga: profissão, registro, contato, ano de formatura e redes sociais (Instagram, LinkedIn, TikTok, Facebook, YouTube, X e outras). Usado na lista da agenda |
| **Projeções e cenários** | Média, mediana e desvio da ocupação, ticket médio, concentração, projeção de 12 meses, linha do tempo dos contratos, potencial × ocupação, curva de equilíbrio e simulador de cenários |
| **Comercial** (Marketing) | Espaços abaixo da meta, campanhas com funil (leads → visitas → contratos), receita atribuída, CAC e ROI |
| **Estratégia: recém-formados** | Plano Primeiro Consultório: público-alvo, personas, oferta, 16 redes e canais, calendário, orçamento em 3 cenários, simulador de custo-benefício e métricas (dentro de Marketing) |
| **Monitor social** (`#/marketing/social`) | Busca por palavra, @perfil ou #hashtag nos posts da Santé e dos concorrentes no Instagram, Facebook e YouTube, no estilo Social Bearing: linha do tempo, engajamento por perfil, temas, hashtags, palavras, dia da semana e tom |
| **Análise de mercado** (Concorrentes) | Mapa dos concorrentes em Maceió: preços, Instagram, Google Maps, sites (Lighthouse), Similarweb, análise SWOT e ações sugeridas |
| **Custos e equilíbrio** | Custos gerais, impostos, comissões e ponto de equilíbrio (inclui as despesas dos espaços) |
| **Base de dados** | Importar/exportar Excel e `sante.json`; instruções de publicação |

## Como os dados são atualizados

O site é estático. Todo mundo que abre o link vê o arquivo
[`public/data/sante.json`](public/data/sante.json).

1. Edite pelo próprio site (as mudanças ficam salvas no navegador de quem editou) ou importe a planilha em **Dados**.
2. Clique em **Exportar sante.json**.
3. No GitHub, substitua `public/data/sante.json` pelo arquivo exportado e faça o commit.
4. O GitHub Actions publica a nova versão em cerca de 1 minuto.

### Com servidor (sante-BE)

O backend [sante-BE](https://github.com/igoralves1/sante-BE) (FastAPI + PostgreSQL) guarda os dados num banco compartilhado.

- **Como conectar:** o `npm run dev` já conecta a `http://localhost:8000` (arquivo `.env.development`). Em qualquer versão do site também dá para conectar em **Base de dados → Servidor**.
- **Como funciona conectado:**
  - os dados vêm de `GET /api/dados`;
  - cada alteração é enviada à API na hora, só o que mudou (`src/lib/api.js`);
  - a tela busca mudanças de outras pessoas a cada 20 segundos e ao voltar para a aba;
  - se a API recusar algo (por exemplo, um turno já ocupado), aparece um aviso e a tela volta ao que está gravado.
- **Se o servidor não responder:** o site usa o `sante.json` e a cópia do navegador, como antes, e mostra um aviso.
- **No GitHub Pages:** o build publicado não define `VITE_API_URL`, então o link público continua funcionando sem servidor.

## Cálculos

- **Capacidade mensal**: turnos que abrem em cada dia do mês na agenda (ex.: 71 turnos em novembro de 2026), menos os marcados como "Não disponível". Salas por hora contam horas; salas mensais e o administrativo usam a capacidade cadastrada.
- **Contrato**: quantidade por mês × preço unitário = valor mensal. Duração = meses entre início e término (inclusive). Valor total = valor mensal × duração. Sem término, o contrato segue vigente e fica fora da soma de valor total.
- **Ocupação do espaço** = unidades dos contratos vigentes no mês ÷ capacidade (cancelados não contam).
- **Ocupação geral** = receita ocupada ÷ receita potencial. Horas, turnos e contratos são unidades diferentes; a ponderação pela receita é a mesma usada no “Potencial Santé”.
- **Resultado do espaço** = receita do mês − despesas associadas ao espaço.
- **Ponto de equilíbrio** = (custos gerais + despesas dos espaços) ÷ (1 − impostos − comissões).
- **Projeção** = contratos vigentes em cada mês futuro. **Cenário** = cada espaço abaixo do alvo passa a ter o alvo de ocupação.

## Desenvolvimento

```bash
npm install
npm run dev
```

```bash
npm run build
```

O deploy roda sozinho a cada push na branch `main` (`.github/workflows/deploy.yml`).
