import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

interface Props { dark: boolean; setDark: (v: boolean) => void }

// ── Topics ─────────────────────────────────────────────────────────────────────
const TOPICS = [
  {
    id: 'lru',
    icon: '⟳',
    label: 'LRU Cache',
    color: '#f59e0b',
    badge: 'Popular',
    desc: 'Least Recently Used cache with O(1) get/put using a hash map + doubly linked list.',
    tags: ['HashMap', 'Doubly LinkedList', 'O(1)', 'Eviction'],
    diagram: LruDiagram,
  },
  {
    id: 'loadbalancer',
    icon: '⇌',
    label: 'Load Balancer',
    color: '#22d3ee',
    badge: 'Core',
    desc: 'Distribute incoming requests across multiple servers using Round Robin or Least Connections.',
    tags: ['Round Robin', 'Least Conn', 'Health Check', 'Failover'],
    diagram: LoadBalancerDiagram,
  },
  {
    id: 'ratelimiter',
    icon: '⏱',
    label: 'Rate Limiter',
    color: '#a78bfa',
    badge: 'Core',
    desc: 'Token Bucket and Sliding Window algorithms to limit API request rates per user.',
    tags: ['Token Bucket', 'Sliding Window', 'Redis', 'Throttle'],
    diagram: RateLimiterDiagram,
  },
  {
    id: 'messagequeue',
    icon: '⊡',
    label: 'Message Queue',
    color: '#4ade80',
    badge: 'Core',
    desc: 'Producers push messages; consumers pull. Async decoupling via Kafka or RabbitMQ patterns.',
    tags: ['Producer', 'Consumer', 'Kafka', 'Async'],
    diagram: MessageQueueDiagram,
  },
  {
    id: 'cdn',
    icon: '⊕',
    label: 'CDN & Caching',
    color: '#fb923c',
    badge: 'Advanced',
    desc: 'Edge servers cache static assets globally. Cache invalidation, TTL, and origin pull-through.',
    tags: ['Edge Cache', 'TTL', 'Invalidation', 'Origin'],
    diagram: CdnDiagram,
  },
  {
    id: 'consistent-hashing',
    icon: '◎',
    label: 'Consistent Hashing',
    color: '#e879f9',
    badge: 'Advanced',
    desc: 'Distribute keys across nodes minimizing remapping when nodes join or leave the ring.',
    tags: ['Hash Ring', 'Virtual Nodes', 'Replication', 'Partition'],
    diagram: ConsistentHashDiagram,
  },
]

// ── SVG Diagrams ───────────────────────────────────────────────────────────────
function LruDiagram() {
  const cache = [{ k: 'C', v: 3, mru: false }, { k: 'A', v: 1, mru: false }, { k: 'B', v: 2, mru: true }]
  return (
    <svg viewBox="0 0 300 140" className="w-full h-full">
      <text x="12" y="16" fontSize="9" fontFamily="monospace" fill="#f59e0b">LRU Cache (capacity = 3)</text>
      {/* Doubly linked list */}
      {[{ label: 'HEAD', col: '#374151' }, { label: 'C:3', col: '#44403c' }, { label: 'A:1', col: '#44403c' }, { label: 'B:2', col: '#92400e' }, { label: 'TAIL', col: '#374151' }].map((n, i) => (
        <g key={i}>
          <rect x={12 + i * 56} y={28} width={46} height={26} rx="6"
            fill={n.col} stroke={i === 3 ? '#f59e0b' : '#374151'} strokeWidth={i === 3 ? 1.5 : 1} />
          <text x={35 + i * 56} y={44} textAnchor="middle" fontSize="8" fontFamily="monospace"
            fill={i === 3 ? '#fbbf24' : '#9ca3af'}>{n.label}</text>
          {i < 4 && <text x={60 + i * 56} y={44} textAnchor="middle" fontSize="10" fill="#374151">↔</text>}
        </g>
      ))}
      <text x="12" y="68" fontSize="7" fontFamily="monospace" fill="#78716c">MRU ←——————————————————— LRU</text>
      {/* HashMap visualization */}
      <text x="12" y="84" fontSize="9" fontFamily="monospace" fill="#f59e0b">HashMap (O(1) lookup)</text>
      {[['A', '→ node(A:1)'], ['B', '→ node(B:2)'], ['C', '→ node(C:3)']].map(([k, v], i) => (
        <g key={i}>
          <rect x={12} y={90 + i * 15} width={16} height={12} rx="3" fill="#1c1917" stroke="#44403c" strokeWidth="1" />
          <text x={20} y={100 + i * 15} textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#f59e0b">{k}</text>
          <text x={34} y={100 + i * 15} fontSize="7" fontFamily="monospace" fill="#78716c">{v}</text>
        </g>
      ))}
      <text x="12" y="138" fontSize="7" fontFamily="monospace" fill="#78716c">get("B") → move B to MRU · evict LRU on capacity overflow</text>
    </svg>
  )
}

function LoadBalancerDiagram() {
  return (
    <svg viewBox="0 0 300 140" className="w-full h-full">
      <text x="12" y="14" fontSize="9" fontFamily="monospace" fill="#22d3ee">Load Balancer — Round Robin</text>
      {/* Clients */}
      {[30, 60, 90].map((y, i) => (
        <g key={i}>
          <rect x="12" y={y} width="40" height="18" rx="5" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <text x="32" y={y + 12} textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#94a3b8">Client {i + 1}</text>
          <line x1="52" y1={y + 9} x2="90" y2="70" stroke="#22d3ee33" strokeWidth="1" strokeDasharray="3 2" />
        </g>
      ))}
      {/* LB */}
      <rect x="90" y="52" width="60" height="36" rx="8" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" />
      <text x="120" y="66" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#22d3ee">Load</text>
      <text x="120" y="78" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#22d3ee">Balancer</text>
      {/* Servers */}
      {[['S1', 28, '#22d3ee', '32%'], ['S2', 62, '#4ade80', '35%'], ['S3', 96, '#22d3ee', '33%']].map(([s, y, col, pct]) => (
        <g key={s as string}>
          <line x1="150" y1="70" x2="188" y2={(y as number) + 9} stroke={`${col}55`} strokeWidth="1.5" />
          <rect x="188" y={y as number} width="54" height="18" rx="5" fill="#0f172a" stroke={col as string} strokeWidth="1.5" />
          <text x="215" y={(y as number) + 12} textAnchor="middle" fontSize="7" fontFamily="monospace" fill={col as string}>{s}: {pct}</text>
        </g>
      ))}
      {/* DB */}
      <line x1="242" y1="62" x2="268" y2="62" stroke="#818cf844" strokeWidth="1" strokeDasharray="2 2" />
      <rect x="268" y="50" width="24" height="24" rx="4" fill="#0f172a" stroke="#818cf8" strokeWidth="1" />
      <text x="280" y="65" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#818cf8">DB</text>
      <text x="12" y="128" fontSize="7" fontFamily="monospace" fill="#78716c">Algorithm: Round Robin · each request cycles: S1→S2→S3→S1…</text>
    </svg>
  )
}

function RateLimiterDiagram() {
  return (
    <svg viewBox="0 0 300 140" className="w-full h-full">
      <text x="12" y="14" fontSize="9" fontFamily="monospace" fill="#a78bfa">Token Bucket Rate Limiter</text>
      {/* Bucket */}
      <rect x="90" y="22" width="60" height="70" rx="6" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="1.5" />
      <text x="120" y="36" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#a78bfa">Bucket</text>
      {/* Tokens */}
      {[0, 1, 2].map(i => (
        <circle key={i} cx={106 + i * 14} cy="58" r="7" fill="#7c3aed44" stroke="#a78bfa" strokeWidth="1" />
      ))}
      <text x="120" y="62" textAnchor="middle" fontSize="6" fontFamily="monospace" fill="#c4b5fd">3/5</text>
      <text x="120" y="84" textAnchor="middle" fontSize="6" fontFamily="monospace" fill="#6366f1">refill: 1/sec</text>
      {/* Incoming requests */}
      {[['req1', 20, '#4ade80', '✓'], ['req2', 46, '#4ade80', '✓'], ['req3', 72, '#ef4444', '✗']].map(([r, y, col, status]) => (
        <g key={r as string}>
          <rect x="12" y={y as number} width="46" height="16" rx="4" fill="#0f172a" stroke={col as string} strokeWidth="1" />
          <text x="35" y={(y as number) + 11} textAnchor="middle" fontSize="7" fontFamily="monospace" fill={col as string}>{r} {status}</text>
          <line x1="58" y1={(y as number) + 8} x2="90" y2="58" stroke={`${col}55`} strokeWidth="1" strokeDasharray="3 2" />
        </g>
      ))}
      {/* Output */}
      <line x1="150" y1="58" x2="188" y2="58" stroke="#a78bfa66" strokeWidth="1.5" />
      <rect x="188" y="44" width="60" height="28" rx="6" fill="#0f172a" stroke="#a78bfa" strokeWidth="1" />
      <text x="218" y="56" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#a78bfa">API</text>
      <text x="218" y="66" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#6366f1">Server</text>
      <text x="12" y="112" fontSize="7" fontFamily="monospace" fill="#78716c">capacity=5 tokens · consume 1/request · refill 1/sec</text>
      <text x="12" y="124" fontSize="7" fontFamily="monospace" fill="#78716c">429 Too Many Requests when bucket empty</text>
    </svg>
  )
}

function MessageQueueDiagram() {
  return (
    <svg viewBox="0 0 300 140" className="w-full h-full">
      <text x="12" y="14" fontSize="9" fontFamily="monospace" fill="#4ade80">Message Queue (Kafka pattern)</text>
      {/* Producers */}
      {['Producer A', 'Producer B'].map((p, i) => (
        <g key={i}>
          <rect x="12" y={28 + i * 36} width="60" height="22" rx="5" fill="#0f172a" stroke="#4ade80" strokeWidth="1" />
          <text x="42" y={42 + i * 36} textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#4ade80">{p}</text>
          <line x1="72" y1={39 + i * 36} x2="100" y2="55" stroke="#4ade8055" strokeWidth="1.5" />
        </g>
      ))}
      {/* Queue */}
      <rect x="100" y="24" width="90" height="66" rx="6" fill="#0f172a" stroke="#4ade80" strokeWidth="1.5" />
      <text x="145" y="38" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#4ade80">Topic: orders</text>
      {['msg1', 'msg2', 'msg3', 'msg4'].map((m, i) => (
        <g key={i}>
          <rect x="108" y={42 + i * 12} width="74" height="10" rx="2"
            fill={i === 0 ? '#14532d44' : '#1f2937'} stroke={i === 0 ? '#4ade80' : '#374151'} strokeWidth="0.5" />
          <text x="145" y={50 + i * 12} textAnchor="middle" fontSize="6" fontFamily="monospace"
            fill={i === 0 ? '#4ade80' : '#6b7280'}>{m}</text>
        </g>
      ))}
      {/* Consumers */}
      {['Consumer 1', 'Consumer 2'].map((c, i) => (
        <g key={i}>
          <line x1="190" y1="55" x2="218" y2={34 + i * 36} stroke="#4ade8055" strokeWidth="1.5" />
          <rect x="218" y={24 + i * 36} width="64" height="22" rx="5" fill="#0f172a" stroke="#22d3ee" strokeWidth="1" />
          <text x="250" y={38 + i * 36} textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#22d3ee">{c}</text>
        </g>
      ))}
      <text x="12" y="108" fontSize="7" fontFamily="monospace" fill="#78716c">offset-based consumption · consumer groups · at-least-once delivery</text>
      <text x="12" y="120" fontSize="7" fontFamily="monospace" fill="#78716c">durable storage · horizontal scaling · replay support</text>
    </svg>
  )
}

function CdnDiagram() {
  return (
    <svg viewBox="0 0 300 140" className="w-full h-full">
      <text x="12" y="14" fontSize="9" fontFamily="monospace" fill="#fb923c">CDN — Content Delivery Network</text>
      {/* Origin */}
      <rect x="126" y="22" width="54" height="28" rx="6" fill="#0f172a" stroke="#fb923c" strokeWidth="1.5" />
      <text x="153" y="33" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#fb923c">Origin</text>
      <text x="153" y="43" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#78716c">Server</text>
      {/* Edge nodes */}
      {[['US Edge', 30, 70, '#4ade80'], ['EU Edge', 136, 70, '#22d3ee'], ['APAC Edge', 230, 70, '#a78bfa']].map(([label, x, y, col]) => (
        <g key={label as string}>
          <line x1="153" y1="50" x2={(x as number) + 30} y2={y as number} stroke={`${col}44`} strokeWidth="1" strokeDasharray="3 2" />
          <rect x={x as number} y={y as number} width="60" height="22" rx="5" fill="#0f172a" stroke={col as string} strokeWidth="1.5" />
          <text x={(x as number) + 30} y={(y as number) + 12} textAnchor="middle" fontSize="7" fontFamily="monospace" fill={col as string}>{label}</text>
          {/* Users */}
          <circle cx={(x as number) + 30} cy={(y as number) + 38} r="10" fill="#1f2937" stroke={col as string} strokeWidth="1" />
          <text x={(x as number) + 30} y={(y as number) + 42} textAnchor="middle" fontSize="7" fontFamily="monospace" fill={col as string}>👤</text>
          <line x1={(x as number) + 30} y1={(y as number) + 22} x2={(x as number) + 30} y2={(y as number) + 28} stroke={`${col}66`} strokeWidth="1" />
        </g>
      ))}
      <text x="12" y="128" fontSize="7" fontFamily="monospace" fill="#78716c">cache-hit: serve from edge · cache-miss: pull from origin, cache response</text>
    </svg>
  )
}

function ConsistentHashDiagram() {
  return (
    <svg viewBox="0 0 300 140" className="w-full h-full">
      <text x="12" y="14" fontSize="9" fontFamily="monospace" fill="#e879f9">Consistent Hashing — Ring</text>
      {/* Ring */}
      <circle cx="150" cy="76" r="50" fill="none" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="4 2" />
      {/* Nodes on ring */}
      {[
        { label: 'N1', angle: -90, col: '#e879f9' },
        { label: 'N2', angle: 30,  col: '#22d3ee' },
        { label: 'N3', angle: 150, col: '#4ade80' },
      ].map(({ label, angle, col }) => {
        const rad = (angle * Math.PI) / 180
        const nx = 150 + 50 * Math.cos(rad)
        const ny = 76  + 50 * Math.sin(rad)
        return (
          <g key={label}>
            <circle cx={nx} cy={ny} r="12" fill="#1f2937" stroke={col} strokeWidth="1.5" />
            <text x={nx} y={ny + 4} textAnchor="middle" fontSize="8" fontFamily="monospace" fill={col}>{label}</text>
          </g>
        )
      })}
      {/* Keys on ring */}
      {[
        { label: 'k1', angle: -30, col: '#fbbf24' },
        { label: 'k2', angle: 90,  col: '#fbbf24' },
        { label: 'k3', angle: 200, col: '#fbbf24' },
      ].map(({ label, angle, col }) => {
        const rad = (angle * Math.PI) / 180
        const kx = 150 + 50 * Math.cos(rad)
        const ky = 76  + 50 * Math.sin(rad)
        return (
          <g key={label}>
            <circle cx={kx} cy={ky} r="7" fill="#78350f44" stroke={col} strokeWidth="1" />
            <text x={kx} y={ky + 3} textAnchor="middle" fontSize="6" fontFamily="monospace" fill={col}>{label}</text>
          </g>
        )
      })}
      <text x="12" y="128" fontSize="7" fontFamily="monospace" fill="#78716c">keys map clockwise to next node · only ~k/n keys remap on node change</text>
    </svg>
  )
}

// ── Detail views ───────────────────────────────────────────────────────────────
function LruDetail() {
  const [capacity] = useState(3)
  const [cache, setCache] = useState<{ k: string; v: number }[]>([
    { k: 'A', v: 1 }, { k: 'B', v: 2 }, { k: 'C', v: 3 }
  ])
  const [log, setLog] = useState<string[]>(['Cache initialized with A, B, C'])
  const [input, setInput] = useState('')

  const get = (k: string) => {
    const idx = cache.findIndex(x => x.k === k)
    if (idx === -1) { setLog(l => [`get("${k}") → MISS`, ...l.slice(0, 7)]); return }
    const item = cache[idx]
    const newCache = [...cache.filter((_, i) => i !== idx), item]
    setCache(newCache)
    setLog(l => [`get("${k}") → HIT (${item.v}) · moved to MRU`, ...l.slice(0, 7)])
  }
  const put = (k: string, v: number) => {
    const idx = cache.findIndex(x => x.k === k)
    if (idx !== -1) {
      const newCache = [...cache.filter((_, i) => i !== idx), { k, v }]
      setCache(newCache)
      setLog(l => [`put("${k}", ${v}) → updated, moved to MRU`, ...l.slice(0, 7)])
    } else if (cache.length < capacity) {
      setCache(c => [...c, { k, v }])
      setLog(l => [`put("${k}", ${v}) → added (${cache.length + 1}/${capacity})`, ...l.slice(0, 7)])
    } else {
      const evicted = cache[0]
      setCache(c => [...c.slice(1), { k, v }])
      setLog(l => [`put("${k}", ${v}) → evicted LRU "${evicted.k}", added`, ...l.slice(0, 7)])
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xs text-gray-400 leading-relaxed">
        LRU Cache uses a <span className="text-amber-400">HashMap + Doubly LinkedList</span>. GET moves the node to MRU. PUT evicts the LRU (tail) when at capacity. Both operations are <span className="text-green-400">O(1)</span>.
      </div>
      {/* Cache visual */}
      <div>
        <div className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Cache (capacity {capacity}) · left=LRU · right=MRU</div>
        <div className="flex gap-2 flex-wrap">
          {cache.map((item, i) => (
            <div key={i} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg border transition-all ${i === cache.length - 1 ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-gray-800/50'}`}>
              <span className="text-xs font-mono font-bold text-amber-400">{item.k}</span>
              <span className="text-xs font-mono text-gray-400">{item.v}</span>
              <span className="text-[9px] font-mono text-gray-600">{i === cache.length - 1 ? 'MRU' : i === 0 ? 'LRU' : ''}</span>
            </div>
          ))}
          {Array.from({ length: capacity - cache.length }).map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center px-4 py-2 rounded-lg border border-gray-800 bg-gray-900/30 w-[60px]">
              <span className="text-gray-700 text-xs">—</span>
            </div>
          ))}
        </div>
      </div>
      {/* Controls */}
      <div className="flex gap-2 flex-wrap">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder='key or "key,val"'
          className="bg-gray-800 border border-gray-700 text-gray-200 text-xs font-mono px-3 py-1.5 rounded-lg outline-none w-36"
          onFocus={e => (e.target.style.borderColor = '#f59e0b')}
          onBlur={e => (e.target.style.borderColor = '#374151')} />
        <button onClick={() => { if (input) get(input.trim()) }}
          className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">GET</button>
        <button onClick={() => {
          const [k, v] = input.split(',').map(x => x.trim())
          if (k && v) put(k, parseInt(v) || 0)
        }} className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">PUT</button>
        <button onClick={() => { setCache([{ k: 'A', v: 1 }, { k: 'B', v: 2 }, { k: 'C', v: 3 }]); setLog(['Cache reset']) }}
          className="border border-gray-700 text-gray-400 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors">Reset</button>
      </div>
      {/* Log */}
      <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 max-h-36 overflow-y-auto">
        {log.map((l, i) => (
          <div key={i} className={`text-xs font-mono ${i === 0 ? 'text-amber-400' : 'text-gray-600'}`}>
            {i === 0 ? '→ ' : '  '}{l}
          </div>
        ))}
      </div>
    </div>
  )
}

function ComingSoonDetail({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
      <div className="text-3xl text-gray-700">⬡</div>
      <p className="text-sm font-semibold text-gray-400">{label} — Interactive Demo</p>
      <p className="text-xs text-gray-600 max-w-xs">Full step-by-step visualization coming soon. For now explore the diagram and description.</p>
    </div>
  )
}

const DETAIL_COMPONENTS: Record<string, React.ReactNode> = {
  lru: <LruDetail />,
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SystemDesignPage({ dark, setDark }: Props) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)

  const topic = TOPICS.find(t => t.id === selected)

  const bg     = dark ? '#0a0a0f' : '#f9fafb'
  const navBg  = dark ? 'rgba(10,10,15,0.92)' : 'rgba(255,255,255,0.92)'
  const navBdr = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'
  const txt    = dark ? '#ffffff' : '#111827'
  const sub    = dark ? '#6b7280' : '#9ca3af'
  const card   = dark ? 'rgba(255,255,255,0.02)' : '#ffffff'
  const cardBdr = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bg, fontFamily: 'system-ui,sans-serif', color: txt }}>

      {/* NAVBAR */}
      <nav className="flex items-center gap-3 px-6 py-3 border-b sticky top-0 z-50 backdrop-blur" style={{ background: navBg, borderColor: navBdr }}>
        <button onClick={() => navigate(-1)} className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors"
          style={{ color: sub, borderColor: dark ? '#374151' : '#d1d5db' }}>← Back</button>
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5">
          <span className="font-bold" style={{ color: txt }}>dsa<span style={{ color: '#a78bfa' }}>viz</span></span>
        </button>
        <span style={{ color: dark ? '#374151' : '#d1d5db' }} className="text-xs font-mono">/</span>
        <span className="text-xs font-mono" style={{ color: '#4ade80' }}>System Design</span>
        {selected && (
          <>
            <span style={{ color: dark ? '#374151' : '#d1d5db' }} className="text-xs font-mono">/</span>
            <span className="text-xs font-mono" style={{ color: sub }}>{topic?.label}</span>
          </>
        )}
        <button onClick={() => setDark(!dark)} className="ml-auto text-sm px-2 py-1 rounded-lg border transition-colors"
          style={{ color: sub, borderColor: 'transparent' }} title="Toggle dark mode">
          {dark ? '☀️' : '🌙'}
        </button>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden border-b px-8 py-10" style={{ borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(74,222,128,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="text-xs font-mono uppercase tracking-widest" style={{ color: '#4ade80' }}>System Design</div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight" style={{ color: txt }}>
              Visualize distributed<br /><span style={{ color: '#4ade80' }}>systems, step by step</span>
            </h1>
            <p className="text-sm leading-relaxed max-w-lg" style={{ color: sub }}>
              Explore LRU Cache, Load Balancers, Rate Limiters, Message Queues and more — each with interactive diagrams and animated walkthroughs.
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {['LRU Cache', 'Load Balancer', 'Rate Limiter', 'Kafka', 'CDN', 'Consistent Hashing'].map(t => (
                <span key={t} className="text-[10px] font-mono px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>{t}</span>
              ))}
            </div>

            {/* ADD THIS — CTA to visualize own code */}
            <button
            onClick={() => navigate('/visualizer', { state: { code: '', mode: 'sysdesign' } })}
            className="w-fit bg-green-600 hover:bg-green-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-lg shadow-green-600/20 flex items-center gap-2 mt-2"
            >
            <span>▶</span> Visualize Your Own Code
            </button>

          </div>
          <div className="rounded-2xl p-5 border" style={{ background: card, borderColor: cardBdr }}>
            <div className="text-[10px] font-mono uppercase tracking-widest mb-4" style={{ color: '#4ade80' }}>Why system design?</div>
            {[
              { icon: '🏗', title: 'FAANG Interviews', desc: 'System design is tested in senior-level interviews at every major tech company.' },
              { icon: '⚡', title: 'Real-world Scale', desc: 'Learn how systems handle millions of requests, failures, and data growth.' },
              { icon: '🧩', title: 'Interactive', desc: 'Click components to see how data flows and what happens at each step.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 mb-3 last:mb-0 p-2.5 rounded-xl border" style={{ background: dark ? 'rgba(255,255,255,0.02)' : '#f9fafb', borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                <span className="text-base shrink-0">{item.icon}</span>
                <div>
                  <div className="text-xs font-bold" style={{ color: txt }}>{item.title}</div>
                  <div className="text-[11px] mt-0.5 leading-snug" style={{ color: sub }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOPIC GRID */}
      {!selected && (
        <section className="px-8 py-10 max-w-6xl mx-auto w-full">
          <div className="text-center mb-8">
            <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: '#4ade80' }}>Topics</div>
            <h2 className="text-2xl font-bold" style={{ color: txt }}>Choose a system design topic</h2>
            <p className="text-sm mt-1.5" style={{ color: sub }}>Interactive diagrams and walkthroughs for every concept.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TOPICS.map(t => {
              const Diagram = t.diagram
              return (
                <button key={t.id} onClick={() => setSelected(t.id)}
                  className="text-left rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 cursor-pointer group"
                  style={{ background: card, border: `1px solid ${cardBdr}` }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${t.color}44`
                    e.currentTarget.style.boxShadow = `0 0 32px ${t.color}14, 0 8px 24px rgba(0,0,0,0.3)`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = cardBdr
                    e.currentTarget.style.boxShadow = 'none'
                  }}>
                  <div className="h-36 border-b flex items-center justify-center p-4 relative overflow-hidden"
                    style={{ background: dark ? '#060608' : '#f3f4f6', borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }}>
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: `radial-gradient(ellipse at 50% 0%, ${t.color}12 0%, transparent 70%)` }} />
                    <div className="w-full max-w-[320px] h-full"><Diagram /></div>
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                        style={{ color: t.color, borderColor: `${t.color}44`, background: `${t.color}11` }}>{t.badge}</span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{t.icon}</span>
                      <span className="text-sm font-bold" style={{ color: t.color }}>{t.label}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: sub }}>{t.desc}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {t.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                          style={{ background: `${t.color}10`, color: t.color, border: `1px solid ${t.color}25` }}>{tag}</span>
                      ))}
                    </div>
                    <div className="mt-auto pt-3 border-t flex items-center justify-between" style={{ borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }}>
                      <span className="text-xs" style={{ color: sub }}>Explore →</span>
                      <span className="text-xs font-mono font-semibold px-3 py-1 rounded-lg"
                        style={{ background: `${t.color}18`, border: `1px solid ${t.color}33`, color: t.color }}>Open</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* DETAIL VIEW */}
      {selected && topic && (
        <section className="px-8 py-8 max-w-6xl mx-auto w-full flex flex-col gap-6">
          <button onClick={() => setSelected(null)} className="text-xs font-mono w-fit px-3 py-1.5 rounded-lg border transition-colors"
            style={{ color: sub, borderColor: dark ? '#374151' : '#d1d5db' }}>
            ← All topics
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: diagram */}
            <div className="rounded-2xl overflow-hidden border" style={{ background: card, borderColor: `${topic.color}33` }}>
              <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: `${topic.color}22`, background: `${topic.color}08` }}>
                <span className="text-lg">{topic.icon}</span>
                <span className="text-sm font-bold" style={{ color: topic.color }}>{topic.label}</span>
                <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full border"
                  style={{ color: topic.color, borderColor: `${topic.color}44`, background: `${topic.color}11` }}>{topic.badge}</span>
              </div>
              <div className="p-6 h-52 flex items-center justify-center">
                <div className="w-full h-full"><topic.diagram /></div>
              </div>
              <div className="px-4 pb-4 flex flex-wrap gap-1.5">
                {topic.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-mono px-2.5 py-0.5 rounded-full"
                    style={{ background: `${topic.color}10`, color: topic.color, border: `1px solid ${topic.color}25` }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Right: interactive */}
            <div className="rounded-2xl border p-5 flex flex-col gap-4" style={{ background: card, borderColor: cardBdr }}>
              <div className="text-sm font-bold" style={{ color: txt }}>Interactive Demo</div>
              {DETAIL_COMPONENTS[selected] ?? <ComingSoonDetail label={topic.label} />}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border p-5" style={{ background: card, borderColor: cardBdr }}>
            <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: topic.color }}>How {topic.label} works</div>
            <p className="text-sm leading-relaxed" style={{ color: sub }}>{topic.desc}</p>
          </div>
        </section>
      )}

      <footer className="border-t mt-auto px-8 py-4 flex items-center justify-between text-xs font-mono" style={{ borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)', color: sub }}>
        <span><span style={{ color: '#a78bfa' }}>dsa</span>viz · System Design</span>
        <span>© 2026</span>
      </footer>
    </div>
  )
}