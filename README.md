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
| **Início** | Apresentação do projeto e da clínica, com referências |
| **Painel** | Ocupação do mês (ponderada pela receita), ocupação por espaço contra a meta, receita disponível, receita mês a mês e tabela ordenável |
| **Situação atual** | CRUD dos contratos por espaço: período, **duração**, valor mensal, **valor total do contrato**, status, vigência, **despesas e resultado de cada espaço**; renovação de contratos |
| **Espaços** | Lista dos espaços; **Cadastrar novo espaço** e edição com modalidade, capacidade, preço, descrição e **despesas associadas** |
| **Estatísticas** | Média, mediana e desvio da ocupação, ticket médio, concentração, projeção de 12 meses, linha do tempo dos contratos, potencial × ocupação, curva de equilíbrio e simulador de cenários |
| **Marketing** | Espaços abaixo da meta, campanhas com funil (leads → visitas → contratos), receita atribuída, CAC e ROI |
| **Financeiro** | Custos gerais, impostos, comissões e ponto de equilíbrio (inclui as despesas dos espaços) |
| **Dados** | Importar/exportar Excel e `sante.json`; instruções de publicação |

## Como os dados são atualizados

O site é estático. Todo mundo que abre o link vê o arquivo
[`public/data/sante.json`](public/data/sante.json).

1. Edite pelo próprio site (as mudanças ficam salvas no navegador de quem editou) ou importe a planilha em **Dados**.
2. Clique em **Exportar sante.json**.
3. No GitHub, substitua `public/data/sante.json` pelo arquivo exportado e faça o commit.
4. O GitHub Actions publica a nova versão em cerca de 1 minuto.

## Cálculos

- **Capacidade mensal**: 4,33 semanas por mês (ex.: 173,2 horas, 50 turnos, 51,96 turnos na piscina, 16 posições no administrativo).
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
