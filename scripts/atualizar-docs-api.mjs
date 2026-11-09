// Copia do servidor (sante-BE) a documentação da API e o esquema do banco para public/data/,
// para as páginas "Documentação da API" e "Diagrama do banco" funcionarem sem servidor (GitHub Pages).
//
//   npm run docs:api                      (servidor em http://localhost:8000)
//   npm run docs:api -- http://outro:8000
//
// O esquema sai sem a contagem de linhas: a cópia publicada mostra só a estrutura, não os dados.
import { writeFile } from 'node:fs/promises'

const base = (process.argv[2] || process.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
const pegar = async (caminho) => {
  const r = await fetch(base + caminho)
  if (!r.ok) throw new Error(`${caminho}: ${r.status}`)
  return r.json()
}

const [openapi, esquema] = await Promise.all([pegar('/openapi.json'), pegar('/api/banco/esquema')])
for (const t of esquema.tabelas) t.linhas = null
await writeFile('public/data/openapi.json', JSON.stringify(openapi, null, 2) + '\n')
await writeFile('public/data/esquema.json', JSON.stringify(esquema, null, 2) + '\n')
console.log(`openapi.json: ${Object.keys(openapi.paths).length} rotas · esquema.json: ${esquema.tabelas.length} tabelas, ${esquema.relacoes.length} relações`)
