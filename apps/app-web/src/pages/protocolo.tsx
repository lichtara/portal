import { useMemo, useState } from 'react'

type Visualizacao = {
  x_label: string
  y_label: string
  original: { f: number; a: number }[]
  ressonante: { f: number; a: number }[]
}

type Resposta = {
  relatorio_sincronizado: string
  visualizacao_vibracional: Visualizacao
  coerencia_vibracional: number
  validacao_critica: { aprovado: boolean; limiar: number }
  meta?: any
  erro?: string
}

const BASE = (import.meta.env.VITE_SYNTARIS_BASE_URL as string | undefined) || '/api/syntaris'

export default function ProtocoloPage() {
  const [dados, setDados] = useState<string>(
    JSON.stringify(
      [
        { frequencia: 430.2, amplitude: 0.8 },
        { frequencia: 432.0, amplitude: 1.0 },
        450.5,
        864.0,
      ],
      null,
      2,
    ),
  )
  const [f0, setF0] = useState<string>('432')
  const [limiar, setLimiar] = useState<string>('0.6')
  const [bandaRel, setBandaRel] = useState<string>('0.05')
  const [loading, setLoading] = useState(false)
  const [resposta, setResposta] = useState<Resposta | undefined>()
  const [erro, setErro] = useState<string | undefined>()

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro(undefined)
    setResposta(undefined)
    try {
      const payload = {
        dados_campo_informacional: JSON.parse(dados),
        intencao_operador_humano: {
          frequencia_coerencia: Number(f0),
          banda_relativa: Number(bandaRel),
        },
        limiar_coerencia_minimo: Number(limiar),
      }
      const r = await fetch(`${BASE}/protocolo/alinhar-consciencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await r.json()) as Resposta
      if (!r.ok) throw new Error(data?.erro || r.statusText)
      setResposta(data)
    } catch (err: any) {
      setErro(String(err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <h1>PROTOCOLO — Alinhamento de Consciência</h1>
      <p>Executa o pipeline no serviço Syntaris e exibe o relatório e gráfico de frequências.</p>
      <form onSubmit={enviar} style={{ display: 'grid', gap: 12 }}>
        <label>
          Dados do campo informacional (JSON array):
          <textarea
            value={dados}
            onChange={(e) => setDados(e.target.value)}
            rows={8}
            style={{ width: '100%', fontFamily: 'monospace' }}
          />
        </label>
        <div style={{ display: 'flex', gap: 12 }}>
          <label>
            f0 (frequência coerência)
            <input type="number" step="0.001" value={f0} onChange={(e) => setF0(e.target.value)} />
          </label>
          <label>
            banda relativa
            <input type="number" step="0.001" value={bandaRel} onChange={(e) => setBandaRel(e.target.value)} />
          </label>
          <label>
            limiar coerência
            <input type="number" step="0.01" value={limiar} onChange={(e) => setLimiar(e.target.value)} />
          </label>
        </div>
        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Processando…' : 'Executar protocolo'}
          </button>
        </div>
      </form>

      {erro && (
        <p style={{ color: 'crimson' }}>Erro: {erro}</p>
      )}

      {resposta && (
        <section style={{ marginTop: 24 }}>
          <h2>Relatório</h2>
          <pre style={{ background: '#111', color: '#ddd', padding: 12, whiteSpace: 'pre-wrap' }}>
            {resposta.relatorio_sincronizado}
          </pre>
          <p>
            Coerência vibracional: <strong>{Math.round(resposta.coerencia_vibracional * 1000) / 10}%</strong> —
            {resposta.validacao_critica.aprovado ? ' aprovado' : ' reprovado'} (limiar {resposta.validacao_critica.limiar})
          </p>
          <h2>Gráfico</h2>
          <Grafico visualizacao={resposta.visualizacao_vibracional} />
        </section>
      )}
    </main>
  )
}

function Grafico({ visualizacao }: { visualizacao: Visualizacao }) {
  const w = 720
  const h = 280
  const pad = 30
  const pontosO = visualizacao.original
  const pontosR = visualizacao.ressonante

  const [minF, maxF, maxA] = useMemo(() => {
    const all = [...pontosO]
    const minF = all.length ? Math.min(...all.map((p) => p.f)) : 0
    const maxF = all.length ? Math.max(...all.map((p) => p.f)) : 1
    const maxA = all.length ? Math.max(...all.map((p) => p.a)) : 1
    return [minF, maxF, maxA]
  }, [pontosO])

  function sx(f: number) {
    return pad + ((f - minF) / (maxF - minF || 1)) * (w - pad * 2)
  }
  function sy(a: number) {
    return h - pad - (a / (maxA || 1)) * (h - pad * 2)
  }

  return (
    <svg width={w} height={h} style={{ background: '#0a0a0a', border: '1px solid #333' }}>
      {/* axes */}
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#555" />
      <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#555" />
      {/* labels */}
      <text x={w / 2} y={h - 6} fill="#aaa" textAnchor="middle">
        {visualizacao.x_label}
      </text>
      <text x={14} y={16} fill="#aaa" textAnchor="start">
        {visualizacao.y_label}
      </text>
      {/* original points */}
      {pontosO.map((p, i) => (
        <circle key={`o-${i}`} cx={sx(p.f)} cy={sy(p.a)} r={3} fill="#5ab4ff" opacity={0.6} />
      ))}
      {/* ressonant points */}
      {pontosR.map((p, i) => (
        <circle key={`r-${i}`} cx={sx(p.f)} cy={sy(p.a)} r={4} fill="#63e6be" />
      ))}
      {/* legend */}
      <g>
        <circle cx={pad + 10} cy={pad} r={3} fill="#5ab4ff" opacity={0.6} />
        <text x={pad + 20} y={pad + 4} fill="#aaa">original</text>
        <circle cx={pad + 90} cy={pad} r={4} fill="#63e6be" />
        <text x={pad + 100} y={pad + 4} fill="#aaa">ressonante</text>
      </g>
    </svg>
  )
}

