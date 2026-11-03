// Importa/exporta no layout da planilha Sistema_Controle_Sante.xlsx
// (título na linha 1, cabeçalho na linha 4, dados a partir da linha 5).
// Aceita a aba antiga "Reservas" (uma linha por mês) e a nova "Contratos" (com início e fim).
import * as XLSX from 'xlsx'
import { clone, uid } from './format'
import { duracaoMeses, fimDoMes, valorMensal, valorTotal } from './calc'

const linhas = (ws) => XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null })
const n = (v) => (v === null || v === '' || isNaN(Number(v)) ? 0 : Number(v))
const txt = (v) => (v === null || v === undefined ? '' : String(v).trim())

// Datas chegam como número serial do Excel: lido sem fuso horário
function isoData(v) {
  if (typeof v === 'number') {
    const p = XLSX.SSF.parse_date_code(v)
    return `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`
  }
  if (typeof v === 'string') {
    const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
    if (m) return `${m[3]}-${m[2]}-${m[1]}`
    return v.slice(0, 10)
  }
  return ''
}
// número serial do Excel para uma data AAAA-MM-DD
function serial(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return (Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000
}

export async function importarXLSX(file, atual) {
  const wb = XLSX.read(await file.arrayBuffer())
  if (!wb.Sheets.Cadastro) throw new Error('A planilha não tem a aba Cadastro')
  if (!wb.Sheets.Contratos && !wb.Sheets.Reservas) throw new Error('A planilha não tem a aba Contratos nem Reservas')

  const idAntigo = Object.fromEntries(atual.espacos.map((e) => [e.nome, e]))
  const espacos = linhas(wb.Sheets.Cadastro)
    .slice(4)
    // só linhas com capacidade numérica (ignora a legenda de modalidades abaixo)
    .filter((r) => r[0] && r[1] && r[2] !== null && r[2] !== '' && !isNaN(Number(r[2])))
    .map((r) => {
      const nome = txt(r[0])
      const antes = idAntigo[nome]
      return {
        id: antes?.id || uid('e'),
        nome,
        modalidade: r[1] || 'Turno',
        capacidade: n(r[2]),
        preco: n(r[3]),
        obs: txt(r[6]),
        tipo: txt(r[7]) || antes?.tipo || '',
        descricao: txt(r[8]) || antes?.descricao || '',
        despesas: antes?.despesas || [],
      }
    })
  const porNome = Object.fromEntries(espacos.map((e) => [e.nome, e.id]))
  const campPorNome = Object.fromEntries(atual.campanhas.map((c) => [c.nome, c.id]))

  let contratos
  if (wb.Sheets.Contratos) {
    contratos = linhas(wb.Sheets.Contratos)
      .slice(4)
      .filter((r) => r[0] && r[2])
      .map((r) => ({
        id: uid('ct'),
        inicio: isoData(r[0]),
        fim: r[1] ? isoData(r[1]) : '',
        espacoId: porNome[txt(r[2])] || '',
        cliente: txt(r[3]),
        modalidade: r[4] || '',
        quantidade: n(r[5]),
        preco: n(r[6]),
        status: r[7] || 'Confirmada',
        campanha: campPorNome[txt(r[11])] || '',
        obs: txt(r[12]),
      }))
  } else {
    contratos = linhas(wb.Sheets.Reservas)
      .slice(4)
      .filter((r) => r[0] && r[1])
      .map((r) => {
        const inicio = isoData(r[0])
        return {
          id: uid('ct'),
          inicio,
          fim: fimDoMes(inicio),
          espacoId: porNome[txt(r[1])] || '',
          cliente: txt(r[2]),
          modalidade: r[3] || '',
          quantidade: n(r[4]),
          preco: n(r[5]),
          status: r[6] || 'Confirmada',
          campanha: campPorNome[txt(r[10])] || '',
          obs: txt(r[9]),
        }
      })
  }

  if (wb.Sheets.Despesas) {
    espacos.forEach((e) => (e.despesas = []))
    linhas(wb.Sheets.Despesas)
      .slice(4)
      .filter((r) => r[0] && r[1])
      .forEach((r) => {
        const e = espacos.find((x) => x.nome === txt(r[0]))
        if (e) e.despesas.push({ id: uid('d'), descricao: txt(r[1]), valor: n(r[2]) })
      })
  }

  const custos = clone(atual.custos)
  if (wb.Sheets.Custos) {
    const fixos = []
    for (const r of linhas(wb.Sheets.Custos).slice(4)) {
      if (!r || !r[1]) continue
      if (r[3] === 'Percentual') {
        if (/imposto/i.test(r[1])) custos.impostos = n(r[2])
        else custos.comissoes = n(r[2])
      } else if (r[0] === 'Fixo' || r[3] === 'Fixo') {
        fixos.push({ id: uid('c'), descricao: r[1], valor: n(r[2]) })
      }
    }
    if (fixos.length) custos.fixos = fixos
  }

  return { ...clone(atual), espacos, contratos, custos }
}

function aba(titulo, subtitulo, cabecalho, dados, datas = []) {
  const ws = XLSX.utils.aoa_to_sheet([[titulo], [subtitulo], [], cabecalho, ...dados])
  ws['!cols'] = cabecalho.map((h) => ({ wch: Math.max(14, h.length + 2) }))
  // colunas de data: número serial com formato dd/mm/aaaa
  for (const col of datas) {
    for (let r = 4; r < dados.length + 4; r++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c: col })]
      if (cell && typeof cell.v === 'number') cell.z = 'dd/mm/yyyy'
    }
  }
  return ws
}

export function exportarXLSX(data) {
  const wb = XLSX.utils.book_new()
  const nome = Object.fromEntries(data.espacos.map((e) => [e.id, e.nome]))
  const camp = Object.fromEntries(data.campanhas.map((c) => [c.id, c.nome]))

  XLSX.utils.book_append_sheet(wb, aba('CADASTRO DE ESPAÇOS E CAPACIDADE', 'Exportado do Santé Admin',
    ['Espaço', 'Modalidade padrão', 'Capacidade mensal', 'Preço unitário (R$)', 'Ocupação inicial', 'Receita potencial (R$)', 'Observações', 'Tipo', 'Descrição'],
    data.espacos.map((e) => [e.nome, e.modalidade, e.capacidade, e.preco, null, e.capacidade * e.preco, e.obs, e.tipo, e.descricao])), 'Cadastro')

  XLSX.utils.book_append_sheet(wb, aba('CONTRATOS E RESERVAS', 'Quantidade e preço são mensais. Sem data de fim = contrato sem término definido.',
    ['Início', 'Fim', 'Espaço', 'Cliente/profissional', 'Modalidade', 'Quantidade/mês', 'Preço unitário (R$)', 'Status', 'Valor mensal (R$)', 'Duração (meses)', 'Valor total (R$)', 'Campanha', 'Observações'],
    data.contratos.map((c) => [serial(c.inicio), serial(c.fim), nome[c.espacoId] || '', c.cliente, c.modalidade, c.quantidade, c.preco, c.status,
      valorMensal(c), duracaoMeses(c), valorTotal(c), camp[c.campanha] || '', c.obs]), [0, 1]), 'Contratos')

  XLSX.utils.book_append_sheet(wb, aba('DESPESAS POR ESPAÇO', 'Valores mensais associados a cada espaço.',
    ['Espaço', 'Descrição', 'Valor mensal (R$)'],
    data.espacos.flatMap((e) => (e.despesas || []).map((d) => [e.nome, d.descricao, d.valor]))), 'Despesas')

  XLSX.utils.book_append_sheet(wb, aba('CUSTOS MENSAIS E PREMISSAS FINANCEIRAS', 'Custos gerais da clínica. Percentuais em fração (0,06 = 6%).',
    ['Categoria', 'Descrição', 'Valor mensal (R$) / %', 'Tipo', 'Observações'],
    [
      ...data.custos.fixos.map((c) => ['Fixo', c.descricao, c.valor, 'Fixo', '']),
      ['Variável', 'Impostos sobre faturamento', data.custos.impostos, 'Percentual', ''],
      ['Variável', 'Comissões/taxas sobre faturamento', data.custos.comissoes, 'Percentual', ''],
    ]), 'Custos')

  XLSX.utils.book_append_sheet(wb, aba('CAMPANHAS DE MARKETING', 'Resultados calculados a partir dos contratos atribuídos.',
    ['Campanha', 'Canal', 'Espaços', 'Início', 'Fim', 'Orçamento (R$)', 'Leads', 'Visitas', 'Status', 'Observações'],
    data.campanhas.map((c) => [c.nome, c.canal, c.espacos.map((id) => nome[id] || id).join(', '), serial(c.inicio), serial(c.fim), c.orcamento, c.leads, c.visitas, c.status, c.obs]), [3, 4]), 'Campanhas')

  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
