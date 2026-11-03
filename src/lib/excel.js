// Importa/exporta no mesmo layout da planilha Sistema_Controle_Sante.xlsx
// (título na linha 1, cabeçalho na linha 4, dados a partir da linha 5).
import * as XLSX from 'xlsx'
import { clone, uid } from './format'

function linhas(ws) {
  return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null })
}

function isoData(v) {
  // Datas chegam como número serial do Excel: lido sem fuso horário
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

const n = (v) => (v === null || v === '' || isNaN(Number(v)) ? 0 : Number(v))

export async function importarXLSX(file, atual) {
  const wb = XLSX.read(await file.arrayBuffer())
  const falta = ['Cadastro', 'Reservas'].filter((s) => !wb.Sheets[s])
  if (falta.length) throw new Error(`A planilha não tem a(s) aba(s): ${falta.join(', ')}`)

  const espacos = linhas(wb.Sheets.Cadastro)
    .slice(4)
    // só linhas com capacidade numérica (ignora a legenda de modalidades abaixo)
    .filter((r) => r[0] && r[1] && r[2] !== null && r[2] !== '' && !isNaN(Number(r[2])))
    .map((r, i) => ({
      id: `e${i + 1}`,
      nome: String(r[0]).trim(),
      modalidade: r[1] || 'Turno',
      capacidade: n(r[2]),
      preco: n(r[3]),
      obs: r[6] || '',
    }))

  const reservas = linhas(wb.Sheets.Reservas)
    .slice(4)
    .filter((r) => r[0] && r[1])
    .map((r) => ({
      id: uid('r'),
      data: isoData(r[0]),
      espaco: String(r[1]).trim(),
      cliente: r[2] || '',
      modalidade: r[3] || '',
      quantidade: n(r[4]),
      preco: n(r[5]),
      status: r[6] || 'Confirmada',
      campanha: '',
      obs: r[9] || '',
    }))

  const custos = clone(atual.custos)
  if (wb.Sheets.Custos) {
    const c = linhas(wb.Sheets.Custos)
    const fixos = []
    for (let i = 4; i < c.length; i++) {
      const r = c[i]
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

  return { ...clone(atual), espacos, reservas, custos }
}

function aba(titulo, subtitulo, cabecalho, dados) {
  const ws = XLSX.utils.aoa_to_sheet([[titulo], [subtitulo], [], cabecalho, ...dados])
  ws['!cols'] = cabecalho.map((h) => ({ wch: Math.max(14, h.length + 2) }))
  return ws
}

export function exportarXLSX(data) {
  const wb = XLSX.utils.book_new()
  const camp = Object.fromEntries(data.campanhas.map((c) => [c.id, c.nome]))

  XLSX.utils.book_append_sheet(
    wb,
    aba('CADASTRO DE ESPAÇOS E CAPACIDADE', 'Exportado do site Santé · Ocupação',
      ['Espaço', 'Modalidade padrão', 'Capacidade mensal', 'Preço unitário (R$)', 'Ocupação inicial', 'Receita potencial (R$)', 'Observações'],
      data.espacos.map((e) => [e.nome, e.modalidade, e.capacidade, e.preco, null, e.capacidade * e.preco, e.obs])),
    'Cadastro',
  )

  XLSX.utils.book_append_sheet(
    wb,
    aba('AGENDA DE RESERVAS E CONTRATOS', 'Uma linha por reserva/contrato.',
      ['Data', 'Espaço', 'Cliente/profissional', 'Modalidade', 'Quantidade', 'Preço unitário (R$)', 'Status', 'Total (R$)', 'Mês referência', 'Observações', 'Campanha'],
      data.reservas.map((r) => [
        new Date(`${r.data}T12:00:00`), r.espaco, r.cliente, r.modalidade, r.quantidade, r.preco, r.status,
        r.quantidade * r.preco, r.data.slice(0, 7), r.obs, camp[r.campanha] || '',
      ])),
    'Reservas',
  )

  XLSX.utils.book_append_sheet(
    wb,
    aba('CUSTOS MENSAIS E PREMISSAS FINANCEIRAS', 'Percentuais em fração (0,06 = 6%).',
      ['Categoria', 'Descrição', 'Valor mensal (R$) / %', 'Tipo', 'Observações'],
      [
        ...data.custos.fixos.map((c) => ['Fixo', c.descricao, c.valor, 'Fixo', '']),
        ['Variável', 'Impostos sobre faturamento', data.custos.impostos, 'Percentual', ''],
        ['Variável', 'Comissões/taxas sobre faturamento', data.custos.comissoes, 'Percentual', ''],
      ]),
    'Custos',
  )

  XLSX.utils.book_append_sheet(
    wb,
    aba('CAMPANHAS DE MARKETING', 'Resultados calculados a partir das reservas atribuídas.',
      ['Campanha', 'Canal', 'Espaços', 'Início', 'Fim', 'Orçamento (R$)', 'Leads', 'Visitas', 'Status', 'Observações'],
      data.campanhas.map((c) => [c.nome, c.canal, c.espacos.join(', '), c.inicio, c.fim, c.orcamento, c.leads, c.visitas, c.status, c.obs])),
    'Campanhas',
  )

  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx', cellDates: true })
  return new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}
