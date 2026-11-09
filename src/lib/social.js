// Análise do monitor social (estilo Social Bearing) sobre a coleta guardada no banco (/api/mercado/social).
// Tudo roda no navegador: busca por palavra, @perfil ou #hashtag, filtros e métricas.

export const HOJE_COLETA = (base) => base.coletadoEm

const semAcento = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// ---------- busca ----------
// "@transmutar.harmony #alugueldesalas depoimento" -> perfis, hashtags e palavras (todas precisam bater)
export function interpretar(q) {
  const termos = (q || '').trim().split(/\s+/).filter(Boolean)
  return {
    perfis: termos.filter((t) => t.startsWith('@')).map((t) => semAcento(t.slice(1))),
    tags: termos.filter((t) => t.startsWith('#')).map((t) => semAcento(t.slice(1))),
    palavras: termos.filter((t) => !/^[@#]/.test(t)).map(semAcento),
  }
}

export const hashtagsDe = (txt) => [...new Set((txt.match(/#[\p{L}\p{N}_]+/gu) || []).map((h) => semAcento(h)))]

export function filtrarPosts(posts, perfis, { q = '', redes = [], dias = 0, tipo = '', ref }) {
  const f = interpretar(q)
  const porId = Object.fromEntries(perfis.map((p) => [p.id, p]))
  const limite = dias ? addDias(ref, -dias) : ''
  return posts.filter((p) => {
    const pf = porId[p.perfil]
    if (redes.length && !redes.includes(p.rede)) return false
    if (limite && p.data < limite) return false
    if (tipo && p.tipo !== tipo) return false
    if (f.perfis.length && !f.perfis.some((h) => semAcento(pf?.handle).includes(h) || semAcento(pf?.nome).includes(h))) return false
    const txt = semAcento(p.legenda)
    if (f.tags.length && !f.tags.every((t) => hashtagsDe(p.legenda).some((h) => h.includes(t)))) return false
    if (f.palavras.length && !f.palavras.every((w) => txt.includes(w) || semAcento(temaDe(p)).includes(w) || semAcento(pf?.nome).includes(w))) return false
    return true
  })
}

function addDias(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  const x = new Date(y, m - 1, d + n)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

// ---------- tema do post (regras simples sobre a legenda) ----------
export const TEMAS = ['Profissionais da casa', 'Preço e oferta', 'Tour e estrutura', 'Conteúdo e dica', 'Data comemorativa', 'Institucional']
export function temaDe(p) {
  const t = semAcento(p.legenda)
  if (/\[profissional\]|escolheu a|recomenda|chegada de|esta crescendo|reforco|apresentar a nossa|lista de profissionais/.test(t)) return TEMAS[0]
  if (/#dia|dia do medico|dia dos|celebramos|comeca com escolhas/.test(t)) return TEMAS[4]
  if (/r\$|preco|nossos planos|valores/.test(t)) return TEMAS[1]
  if (/tour|consultorio \d|sala \d|novas salas|nova sala|360|cada sala|salas amplas|espaco amplo|distribuidas|salas prontas/.test(t)) return TEMAS[2]
  if (/voce sabia|psicologia ja|esta gerando receita|corpo grita|endereco profissional/.test(t)) return TEMAS[3]
  return TEMAS[5]
}

// ---------- tom da legenda (dicionário simples, como o Social Bearing fazia com tweets) ----------
const POS = ['conforto', 'confortavel', 'acolhedor', 'acolhimento', 'excelente', 'excelencia', 'melhor', 'alegria', 'liberdade', 'impecavel', 'ideal', 'cuidado', 'praticidade', 'pratica', 'sofisticacao', 'qualidade', 'incriveis', 'recomenda', 'valoriza', 'confianca', 'seguranca', 'crescendo', 'novidade', 'amor', 'talento']
const NEG = ['burocracia', 'complicado', 'preocupar', 'despesas', 'custos fixos', 'estresse', 'cansaco', 'tensao', 'dores de cabeca', 'cansado', 'grita', 'dificeis', 'vazia']
export function tomDe(p) {
  const t = semAcento(p.legenda)
  const pos = POS.filter((w) => t.includes(w)).length
  const neg = NEG.filter((w) => t.includes(w)).length
  if (neg && neg >= pos) return 'Dor do cliente'
  if (pos >= 2) return 'Positivo'
  return 'Neutro'
}

// ---------- palavras mais usadas ----------
const STOP = new Set(('a o e de da do das dos em no na nos nas um uma para por com sem que se seu sua seus suas voce voces nosso nossa nossos nossas mais muito ja ou ao aos as os como quando onde aqui isso esse essa este esta estao ser ter tem tudo todo toda todos todas cada pelo pela entre ainda mesmo sobre ate apos sao foi vai pode podem quer saber dia hoje agora la tambem so nao sim nem mas porem fale conheca venha chama link descricao').split(' '))
export function palavras(posts, n = 40) {
  const c = {}
  posts.forEach((p) => {
    const txt = p.legenda.replace(/#[\p{L}\p{N}_]+/gu, ' ').replace(/@[\w.]+/g, ' ').replace(/\[profissional\]/g, ' ')
    ;(txt.match(/\p{L}{4,}/gu) || []).forEach((w) => {
      const k = semAcento(w)
      if (STOP.has(k)) return
      c[k] ||= { w: w.toLowerCase(), n: 0 }
      c[k].n++
    })
  })
  return Object.values(c).sort((a, b) => b.n - a.n).slice(0, n)
}

// ---------- métricas ----------
const media = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null)
export const curtidasValidas = (ps) => ps.map((p) => p.curtidas).filter((v) => v != null)

export function porPerfil(perfis, posts, ref) {
  const lim90 = addDias(ref, -90)
  return perfis.map((pf) => {
    const ps = posts.filter((p) => p.perfil === pf.id).sort((a, b) => b.data.localeCompare(a.data))
    const cs = curtidasValidas(ps)
    const m = media(cs)
    return {
      ...pf,
      analisados: ps.length,
      mediaCurtidas: m,
      engajamento: m != null && pf.seguidores ? m / pf.seguidores : null,
      ult90: ps.filter((p) => p.data >= lim90).length,
      ultimo: ps[0]?.data || null,
    }
  })
}

export function porGrupo(posts, chave) {
  const g = {}
  posts.forEach((p) => {
    const k = chave(p)
    ;(Array.isArray(k) ? k : [k]).forEach((kk) => {
      g[kk] ||= { k: kk, posts: [], curtidas: [] }
      g[kk].posts.push(p)
      if (p.curtidas != null) g[kk].curtidas.push(p.curtidas)
    })
  })
  return Object.values(g).map((x) => ({ ...x, n: x.posts.length, media: media(x.curtidas) }))
}

export const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const diaDaSemana = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}
