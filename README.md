# Santé · Ocupação

Painel de acompanhamento da ocupação, receita e estratégia de marketing da
[Santé Consultórios](https://www.instagram.com/santeconsultoriosmaceio/) (Maceió).

Feito em Vue 3 + Vite, publicado no GitHub Pages. Os números e as fórmulas seguem o documento
“Potencial Santé” e a planilha `Sistema_Controle_Sante.xlsx`.

## O que tem no site

| Página | Para que serve |
|---|---|
| **Painel** | Ocupação do mês ponderada pela receita, ocupação de cada espaço contra a meta, receita disponível para vender, receita por mês e tabela completa |
| **Reservas** | Lançar, editar e filtrar reservas e contratos; ligar cada reserva à campanha que a trouxe; replicar contratos mensais para o mês seguinte |
| **Espaços** | Cadastro de salas, piscina e administrativo: modalidade, capacidade mensal e preço; meta de ocupação |
| **Marketing** | Espaços abaixo da meta e quanto falta em R$, campanhas com funil (leads → visitas → contratos), receita atribuída, CAC e ROI |
| **Financeiro** | Custos fixos, impostos e comissões, ponto de equilíbrio |
| **Dados** | Importar/exportar a planilha Excel e o arquivo `sante.json`; instruções de publicação |

## Como os dados são atualizados

O site é estático. Todo mundo que abre o link vê o arquivo
[`public/data/sante.json`](public/data/sante.json).

1. Edite pelo próprio site (as mudanças ficam salvas no navegador de quem editou) ou importe a planilha em **Dados**.
2. Clique em **Exportar sante.json**.
3. No GitHub, substitua `public/data/sante.json` pelo arquivo exportado e faça o commit.
4. O GitHub Actions publica a nova versão em cerca de 1 minuto.

## Cálculos

- **Capacidade mensal**: 4,33 semanas por mês (ex.: 173,2 horas, 50 turnos, 51,96 turnos na piscina, 16 posições no administrativo).
- **Ocupação do espaço** = unidades reservadas no mês ÷ capacidade (reservas canceladas não contam).
- **Ocupação geral** = receita ocupada ÷ receita potencial. Como horas, turnos e contratos são unidades diferentes, a média simples de unidades não faz sentido; a ponderação pela receita é a mesma usada no documento “Potencial Santé”.
- **Receita confirmada** = reservas com status *Confirmada* ou *Base inicial*. *Proposta* entra na ocupação, mas aparece separada.
- **Ponto de equilíbrio** = custos fixos ÷ (1 − impostos − comissões).

## Desenvolvimento

```bash
npm install
npm run dev
```

```bash
npm run build
```

O deploy roda sozinho a cada push na branch `main` (`.github/workflows/deploy.yml`).
Na primeira vez, em **Settings → Pages**, a fonte precisa estar como **GitHub Actions**.
