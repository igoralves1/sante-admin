<script setup>
import Icon from '../components/Icon.vue'
import { state } from '../lib/store'

const meta = state.data.meta

const secoes = [
  { to: '/painel', icon: 'painel', t: 'Painel', d: 'Ocupação do mês por espaço, receita, dinheiro parado e evolução mensal.' },
  { to: '/situacao', icon: 'reservas', t: 'Situação atual', d: 'Contratos de cada espaço: duração, valor total, despesas e resultado. Criar, editar e encerrar.' },
  { to: '/espacos/novo', icon: 'espacos', t: 'Cadastrar espaço', d: 'Novas salas, piscina ou áreas: modalidade, capacidade, preço e despesas.' },
  { to: '/estatisticas', icon: 'stats', t: 'Estatísticas e estimativas', d: 'Projeção de 12 meses, linha do tempo dos contratos, cenários e ponto de equilíbrio.' },
  { to: '/marketing', icon: 'marketing', t: 'Marketing', d: 'Campanhas, funil de leads e retorno. Estratégia Primeiro Consultório para recém-formados, com orçamento, métricas e simulador.' },
  { to: '/concorrentes', icon: 'users', t: 'Concorrentes', d: 'Quem mais aluga consultórios em Maceió: preços, Instagram, Google Maps, sites, análise e ações sugeridas.' },
  { to: '/financeiro', icon: 'financeiro', t: 'Financeiro', d: 'Custos gerais, impostos, comissões e receita necessária para empatar.' },
]

const fontes = [
  { url: 'https://santeconsultorios.com.br/', t: 'santeconsultorios.com.br', d: 'Site oficial: estrutura, modalidades, preços, horário e endereço' },
  { url: 'https://santeconsultorios.com.br/consultorio-por-hora/', t: 'Consultório por hora', d: 'Hora avulsa e itens incluídos' },
  { url: 'https://santeconsultorios.com.br/especialidades/', t: 'Especialidades', d: 'Profissões atendidas' },
  { url: 'https://www.instagram.com/santeconsultoriosmaceio/', t: 'Instagram @santeconsultoriosmaceio', d: '7.214 seguidores em 03/11/2026' },
  { url: 'https://www.facebook.com/clinicasantemaceio/', t: 'Facebook Clínica Santé', d: 'Mesma razão social e endereço' },
  { url: 'https://github.com/igoralves1/sante-admin/blob/main/docs/REFERENCIAS.md', t: 'docs/REFERENCIAS.md', d: 'Registro completo da pesquisa, no repositório' },
]
</script>

<template>
  <div class="home">
    <section class="hero">
      <span class="eyebrow">Projeto Santé Admin</span>
      <h1>Gestão de ocupação e marketing da Santé Consultórios</h1>
      <p class="lead">
        A Santé aluga consultórios equipados para profissionais de saúde na Jatiúca, em Maceió.
        Este projeto reúne num só lugar o que está ocupado, o que está livre, quanto cada espaço
        rende e custa, e o que o marketing está fazendo para preencher o que sobra.
      </p>
      <div class="toolbar">
        <RouterLink to="/painel" class="btn primary">Abrir o painel</RouterLink>
        <RouterLink to="/situacao" class="btn">Ver situação atual</RouterLink>
      </div>
    </section>

    <section class="grid cols-2 about">
      <div class="card">
        <h2>A clínica</h2>
        <p class="txt">
          A Santé não marca consultas nem atende pacientes: ela <strong>loca consultórios</strong>.
          Psicólogos, nutricionistas, fisioterapeutas, médicos e outros profissionais alugam por hora,
          por turno, por pacote ou por mês, com energia, água, internet, climatização e limpeza diária incluídas.
          A estrutura tem consultórios no térreo e no primeiro piso, recepção e estacionamento privativo.
        </p>
        <ul class="facts">
          <li><Icon name="map" :size="16" /><span>{{ meta.endereco }}</span></li>
          <li><Icon name="clock" :size="16" /><span>Seg a sex, 08h–18h · sábado, 08h–12h</span></li>
          <li><Icon name="phone" :size="16" /><a :href="meta.whatsapp" target="_blank" rel="noopener">{{ meta.telefone }} · WhatsApp da recepção</a></li>
          <li><Icon name="insta" :size="16" /><a :href="meta.instagram" target="_blank" rel="noopener">@santeconsultoriosmaceio</a></li>
          <li><Icon name="link" :size="16" /><a :href="meta.site" target="_blank" rel="noopener">santeconsultorios.com.br</a></li>
        </ul>
        <p class="small muted">{{ meta.razaoSocial }} · informações públicas consultadas em 03/11/2026.</p>
      </div>
      <div class="card">
        <h2>Modalidades divulgadas</h2>
        <dl class="prices">
          <div><dt>Hora avulsa</dt><dd>R$ 50 / hora</dd></div>
          <div><dt>Turno de 4h</dt><dd>R$ 150 <span class="muted small">(condição especial; normal R$ 300)</span></dd></div>
          <div><dt>Pacote de turnos</dt><dd>a partir de R$ 120 / turno <span class="muted small">(4 por R$ 540 · 8 por R$ 960)</span></dd></div>
          <div><dt>Mensal, sala exclusiva</dt><dd>sob consulta · contrato a partir de 3 meses</dd></div>
        </dl>
        <div class="note small">
          O site público não menciona a <strong>piscina</strong> nem o <strong>espaço administrativo</strong>,
          que estão no estudo de potencial e somam uma parte grande da receita ainda disponível.
        </div>
      </div>
    </section>

    <section class="card why">
      <h2>Por que este projeto</h2>
      <p class="txt">
        O estudo “Potencial Santé” mapeou 12 espaços (10 salas, a piscina e o administrativo), cada um com
        sua modalidade e capacidade mensal (horas, turnos ou contratos). Somados, eles podem gerar perto de
        <strong>R$ 108 mil por mês</strong>. A ocupação registrada, porém, era uma fração disso, com salas inteiras
        sem nenhuma reserva. Para mudar esse quadro é preciso enxergar, mês a mês, onde está a capacidade
        livre, quanto vale, quando os contratos vencem e se as ações de divulgação estão trazendo novos
        profissionais.
      </p>
    </section>

    <section>
      <h2 class="sec-title">O que você encontra aqui</h2>
      <div class="grid cols-3">
        <RouterLink v-for="s in secoes" :key="s.to" :to="s.to" class="card link-card">
          <span class="ic"><Icon :name="s.icon" /></span>
          <strong>{{ s.t }}</strong>
          <span class="muted">{{ s.d }}</span>
        </RouterLink>
      </div>
    </section>

    <section class="grid cols-2">
      <div class="card">
        <h2>Como os dados funcionam</h2>
        <ol class="steps">
          <li><strong>Um arquivo publicado.</strong> Todos que abrem o link veem o mesmo arquivo de dados do repositório.</li>
          <li><strong>Edição no navegador.</strong> Cadastrar espaços, contratos ou campanhas salva na hora, no seu navegador.</li>
          <li><strong>Publicar.</strong> Em <RouterLink to="/dados">Dados</RouterLink>, exporte o arquivo e envie ao GitHub; o link se atualiza em cerca de 1 minuto. A planilha Excel também pode ser importada e exportada.</li>
        </ol>
      </div>
      <div class="card">
        <h2>Referências</h2>
        <ul class="refs">
          <li v-for="f in fontes" :key="f.url">
            <a :href="f.url" target="_blank" rel="noopener">{{ f.t }}</a>
            <span class="muted small">{{ f.d }}</span>
          </li>
          <li><span>Documentos internos</span><span class="muted small">“Potencial Santé” (PDF) e “Sistema_Controle_Sante.xlsx”</span></li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home { display: grid; gap: 20px; }
.hero { padding: 36px 32px; border-radius: 20px; background: linear-gradient(135deg, #0d366b, #1c5cab 60%, #2a78d6); color: #fff; display: grid; gap: 14px; }
.eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.8; }
.hero h1 { font-size: clamp(26px, 4vw, 40px); line-height: 1.15; letter-spacing: -0.02em; max-width: 760px; }
.lead { margin: 0; max-width: 720px; font-size: 16px; line-height: 1.6; opacity: 0.92; }
.hero .btn { border-color: rgba(255, 255, 255, 0.35); background: rgba(255, 255, 255, 0.1); color: #fff; }
.hero .btn.primary { background: #fff; color: #0d366b; border-color: #fff; }
.card h2 { margin-bottom: 10px; }
.txt { margin: 0 0 14px; color: var(--text-2); line-height: 1.65; }
.txt strong { color: var(--text); }
.facts { list-style: none; padding: 0; margin: 0 0 12px; display: grid; gap: 8px; }
.facts li { display: flex; gap: 10px; align-items: center; color: var(--text-2); }
.facts svg { color: var(--accent-ink); flex: none; }
.prices { margin: 0 0 14px; display: grid; gap: 10px; }
.prices div { display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 12px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
.prices div:last-child { border-bottom: 0; padding-bottom: 0; }
.prices dt { color: var(--text-2); }
.prices dd { margin: 0; font-weight: 500; }
@media (max-width: 560px) { .prices div { grid-template-columns: minmax(0, 1fr); gap: 2px; } .hero { padding: 24px 20px; } }
.why .txt { margin: 0; max-width: 900px; }
.sec-title { font-size: 17px; margin-bottom: 12px; }
.link-card { display: grid; gap: 6px; text-decoration: none; color: var(--text); transition: border-color 0.15s; }
.link-card:hover { border-color: var(--accent); }
.ic { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent-ink); margin-bottom: 4px; }
.steps { margin: 0; padding-left: 20px; display: grid; gap: 10px; color: var(--text-2); }
.steps strong { color: var(--text); }
.refs { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.refs li { display: grid; gap: 1px; }
</style>
