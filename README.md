# Santé Admin

Gestão de ocupação, contratos, despesas e marketing da
[Santé Consultórios](https://santeconsultorios.com.br/) (Jatiúca, Maceió), que aluga consultórios
para profissionais de saúde.

Feito em Vue 3 + Vite + D3.js. Todos os dados ficam num PostgreSQL, pela API do
[sante-BE](https://github.com/igoralves1/sante-BE) (FastAPI). Os números e as fórmulas seguem o documento
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
| **Base de dados** | Situação do banco, importar/exportar a planilha Excel e baixar ou restaurar um backup completo |
| **Diagrama do banco** (`#/dados/diagrama`) | Diagrama das tabelas do PostgreSQL e das chaves estrangeiras, por grupo (cadastro, operação, mercado), numa área infinita como a do draw.io: arraste as tabelas para arrumar (as posições ficam salvas no banco), setas do teclado, zoom, busca, modo "só chaves", detalhes de cada tabela e exportação em Mermaid |
| **Tabelas e consultas** (`#/dados/consultas`) | **Perguntar:** escreva a pergunta em português e o assistente (Claude, no sante-BE) escreve o SQL, roda no banco e mostra o resultado, com perguntas de continuação. Também: navegar nas linhas de cada tabela e um editor de SQL só de leitura. |
| **Documentação da API** (`#/documentacao-api`) | Swagger UI com todas as rotas do sante-BE, exemplos, respostas e erros. Dá para testar as rotas direto na página (**Try it out**) |

## Como os dados funcionam

Tudo vem do banco, pela API do sante-BE. Nenhum dado fica em arquivo no site nem no navegador.

- **Ao abrir:** o site lê `GET /api/dados` (espaços, turnos, agenda, contratos, locatários, custos, metas e campanhas)
  e `GET /api/mercado/*` (Análise de mercado e Monitor social).
- **Ao editar:** cada alteração é enviada à API na hora, só o que mudou (`src/lib/api.js`). Se a API recusar algo
  (por exemplo, um turno já ocupado), aparece um aviso e a tela volta ao que está gravado.
- **Outras pessoas:** a tela busca mudanças a cada 20 segundos e ao voltar para a aba.
- **Sem API:** o site mostra uma tela de erro com o botão "Tentar de novo".
- **Planilha e backup:** em **Base de dados**, importe ou exporte a planilha Excel e baixe ou restaure um backup completo (JSON).

### Endereço da API

O front chama a API no **mesmo endereço** do site (`/api`, `/openapi.json`, `/docs`, `/redoc`):

- no `npm run dev`, o Vite repassa essas rotas para `http://localhost:8000` (mude com `API_PROXY=...`);
- em produção (por exemplo, AWS ECS/Fargate atrás de um load balancer), o load balancer manda essas rotas para o
  container da API e o resto para o container do front;
- se a API ficar em outro domínio, defina `VITE_API_URL` no build e libere o domínio do front em `CORS_ORIGINS` na API.

## Cálculos

- **Capacidade mensal**: turnos que abrem em cada dia do mês na agenda (ex.: 71 turnos em novembro de 2026), menos os marcados como "Não disponível". Salas por hora contam horas; salas mensais e o administrativo usam a capacidade cadastrada.
- **Contrato**: quantidade por mês × preço unitário = valor mensal. Duração = meses entre início e término (inclusive). Valor total = valor mensal × duração. Sem término, o contrato segue vigente e fica fora da soma de valor total.
- **Ocupação do espaço** = unidades dos contratos vigentes no mês ÷ capacidade (cancelados não contam).
- **Ocupação geral** = receita ocupada ÷ receita potencial. Horas, turnos e contratos são unidades diferentes; a ponderação pela receita é a mesma usada no “Potencial Santé”.
- **Resultado do espaço** = receita do mês − despesas associadas ao espaço.
- **Ponto de equilíbrio** = (custos gerais + despesas dos espaços) ÷ (1 − impostos − comissões).
- **Projeção** = contratos vigentes em cada mês futuro. **Cenário** = cada espaço abaixo do alvo passa a ter o alvo de ocupação.

## Desenvolvimento

Suba o banco e a API (pasta sante-BE) e depois o front:

```bash
cd ../sante-BE && docker compose up -d
```

```bash
npm install
npm run dev
```

```bash
npm run build
```

O build gera arquivos estáticos em `dist/`, que podem ser servidos por qualquer servidor web (nginx, por exemplo).
