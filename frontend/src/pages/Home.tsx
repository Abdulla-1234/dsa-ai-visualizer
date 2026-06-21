import { useNavigate } from 'react-router-dom'

interface Props { dark: boolean; setDark: (v: boolean) => void }

const TOPICS = [
  {
    id: 'dsa', path: '/dsa', badge: 'Core',
    title: 'Data Structures & Algorithms',
    desc: 'Master arrays, trees, graphs, sorting and searching. Every concept animated step-by-step with AI explanations.',
    color: 'violet',
    tags: ['Arrays', 'Trees', 'Graphs', 'Sorting', 'Searching', 'Linked Lists'],
    diagram: DsaDiagram,
  },
  {
    id: 'sql', path: '/sql', badge: 'Interactive',
    title: 'SQL & Databases',
    desc: 'Watch SQL queries execute in real time — SELECT, JOIN, GROUP BY, indexing, and optimization techniques.',
    color: 'cyan',
    tags: ['SELECT', 'JOIN', 'GROUP BY', 'WHERE', 'Indexing'],
    diagram: SqlDiagram,
  },
  {
    id: 'dp', path: '/category/dp', badge: 'Coming Soon',
    title: 'Dynamic Programming',
    desc: 'See how DP breaks hard problems into subproblems. Fibonacci, Coin Change, Knapsack, LCS — all animated.',
    color: 'amber',
    tags: ['Memoization', 'Coin Change', 'Knapsack', 'LCS'],
    diagram: DpDiagram,
  },
  {
    id: 'system', path: '/system-design', badge: 'New',
    title: 'System Design',
    desc: 'Visualize distributed systems — LRU Cache, Rate Limiting, Load Balancing, message queues and more.',
    color: 'green',
    tags: ['LRU Cache', 'Rate Limiter', 'Load Balancer', 'Queues'],
    diagram: SystemDiagram,
  },
]

const GLOW: Record<string, string> = {
  violet: 'rgba(139,92,246,0.15)', cyan: 'rgba(34,211,238,0.12)',
  amber: 'rgba(245,158,11,0.12)', green: 'rgba(34,197,94,0.12)',
}
const BORDER: Record<string, string> = {
  violet: '#7c3aed', cyan: '#06b6d4', amber: '#f59e0b', green: '#16a34a',
}
const TEXT: Record<string, string> = {
  violet: '#a78bfa', cyan: '#67e8f9', amber: '#fbbf24', green: '#4ade80',
}
const TAG_BG: Record<string, string> = {
  violet: 'rgba(139,92,246,0.12)', cyan: 'rgba(34,211,238,0.1)',
  amber: 'rgba(245,158,11,0.1)', green: 'rgba(34,197,94,0.1)',
}

// ── Logo SVG ──────────────────────────────────────────────────────────────────
function DSAVizLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {/* Hexagon background */}
      <path d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z" fill="url(#logoGrad)" opacity="0.15" />
      <path d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z" fill="none" stroke="url(#logoGrad)" strokeWidth="1.5" />
      {/* Array bars inside */}
      <rect x="8"  y="19" width="3" height="7"  rx="1" fill="#a78bfa" opacity="0.9" />
      <rect x="12" y="15" width="3" height="11" rx="1" fill="#8b5cf6" opacity="0.9" />
      <rect x="16" y="11" width="3" height="15" rx="1" fill="#7c3aed" opacity="0.9" />
      <rect x="20" y="17" width="3" height="9"  rx="1" fill="#22d3ee" opacity="0.9" />
      {/* Connecting dot on top of tallest bar */}
      <circle cx="17.5" cy="10" r="1.5" fill="#22d3ee" />
    </svg>
  )
}

// ── Preview SVGs ──────────────────────────────────────────────────────────────
function DsaDiagram() {
  return (
    <svg viewBox="0 0 320 160" className="w-full h-full">
      <text x="14" y="18" fontSize="9" fontFamily="monospace" fill="#6366f1">Two Pointers</text>
      {[5,3,8,1,9,2].map((v,i) => (
        <g key={i}>
          <rect x={14+i*36} y={24} width={30} height={28} rx="5"
            fill={i===1||i===2?'#7c3aed33':'#1e1b4b'}
            stroke={i===1||i===2?'#7c3aed':'#312e81'} strokeWidth="1.5"/>
          <text x={29+i*36} y={42} textAnchor="middle" fontSize="12" fontFamily="monospace"
            fill={i===1||i===2?'#a78bfa':'#6366f1'}>{v}</text>
        </g>
      ))}
      <text x="14" y="64" fontSize="8" fontFamily="monospace" fill="#4338ca">left=1  right=2  comparing...</text>
      <text x="186" y="18" fontSize="9" fontFamily="monospace" fill="#22d3ee">Binary Tree</text>
      <line x1="254" y1="38" x2="226" y2="60" stroke="#22d3ee44" strokeWidth="1.5"/>
      <line x1="254" y1="38" x2="282" y2="60" stroke="#22d3ee44" strokeWidth="1.5"/>
      <line x1="226" y1="60" x2="213" y2="78" stroke="#22d3ee33" strokeWidth="1"/>
      <line x1="226" y1="60" x2="238" y2="78" stroke="#22d3ee33" strokeWidth="1"/>
      <circle cx="254" cy="38" r="12" fill="#0e7490" stroke="#22d3ee" strokeWidth="2"/>
      <text x="254" y="42" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#cffafe">8</text>
      <circle cx="226" cy="60" r="11" fill="#0c4a6e" stroke="#0ea5e9" strokeWidth="1.5"/>
      <text x="226" y="64" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#7dd3fc">3</text>
      <circle cx="282" cy="60" r="11" fill="#0c4a6e" stroke="#0ea5e9" strokeWidth="1.5"/>
      <text x="282" y="64" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#7dd3fc">11</text>
      <circle cx="213" cy="78" r="9" fill="#172554" stroke="#1e3a8a" strokeWidth="1"/>
      <text x="213" y="82" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#818cf8">1</text>
      <circle cx="238" cy="78" r="9" fill="#0891b233" stroke="#06b6d4" strokeWidth="1.5"/>
      <text x="238" y="82" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#67e8f9">6</text>
      <text x="14" y="98" fontSize="9" fontFamily="monospace" fill="#7c3aed">Stack (LIFO)</text>
      {[40,30,20,10].map((v,i) => (
        <g key={i}>
          <rect x={14} y={104+i*15} width={64} height={13} rx="3"
            fill={i===0?'#7c3aed33':'#1e1b4b'} stroke={i===0?'#7c3aed':'#312e81'} strokeWidth="1"/>
          <text x={46} y={114+i*15} textAnchor="middle" fontSize="8" fontFamily="monospace"
            fill={i===0?'#a78bfa':'#6366f1'}>{v}</text>
        </g>
      ))}
      <text x="120" y="98" fontSize="9" fontFamily="monospace" fill="#f59e0b">Graph BFS</text>
      {[['A',140,112],['B',174,98],['C',174,128],['D',208,112]].map(([l,cx,cy]) => (
        <g key={l as string}>
          <circle cx={cx as number} cy={cy as number} r="11"
            fill={l==='A'?'#7c3aed33':'#1c1917'}
            stroke={l==='A'?'#7c3aed':l==='B'?'#f59e0b':'#44403c'} strokeWidth="1.5"/>
          <text x={cx as number} y={(cy as number)+4} textAnchor="middle" fontSize="9" fontFamily="monospace"
            fill={l==='A'?'#c4b5fd':l==='B'?'#fbbf24':'#78716c'}>{l}</text>
        </g>
      ))}
      {[[140,112,174,98],[140,112,174,128],[174,98,208,112],[174,128,208,112]].map(([x1,y1,x2,y2],i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b44" strokeWidth="1.5"/>
      ))}
      <text x="120" y="155" fontSize="8" fontFamily="monospace" fill="#78716c">visited: A → B → C</text>
    </svg>
  )
}

function SqlDiagram() {
  return (
    <svg viewBox="0 0 320 160" className="w-full h-full">
      <rect x="10" y="10" width="110" height="88" rx="7" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5"/>
      <rect x="10" y="10" width="110" height="22" rx="7" fill="#1e3a5f"/>
      <text x="65" y="25" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#60a5fa">Customers</text>
      {['id·name·age','1·John·31','2·Robert·22','3·David·22','4·John·25','5·Betty·28'].map((r,i) => (
        <text key={i} x="18" y={42+i*14} fontSize="7.5" fontFamily="monospace"
          fill={i===0?'#3b82f6':i===1?'#22d3ee':'#475569'}>{r}</text>
      ))}
      <text x="126" y="56" fontSize="20" fill="#3b82f6">⟕</text>
      <text x="122" y="70" fontSize="7" fontFamily="monospace" fill="#3b82f6">JOIN</text>
      <rect x="150" y="10" width="110" height="70" rx="7" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5"/>
      <rect x="150" y="10" width="110" height="22" rx="7" fill="#1e3a5f"/>
      <text x="205" y="25" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#60a5fa">Orders</text>
      {['cid·item·amount','4·Keyboard·400','4·Mouse·300','3·Monitor·12000'].map((r,i) => (
        <text key={i} x="157" y={42+i*14} fontSize="7.5" fontFamily="monospace"
          fill={i===0?'#3b82f6':'#475569'}>{r}</text>
      ))}
      <rect x="10" y="108" width="300" height="36" rx="6" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5"/>
      <rect x="10" y="108" width="300" height="16" rx="6" fill="#0c2a3a"/>
      <text x="160" y="120" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#67e8f9">Result (INNER JOIN on customer_id)</text>
      <text x="18" y="136" fontSize="7.5" fontFamily="monospace" fill="#22d3ee">John·Keyboard·400 | Bob·Mouse·300 | Carol·Monitor·12000</text>
    </svg>
  )
}

function DpDiagram() {
  const dp = [0,1,1,2,3,5,8,13]
  return (
    <svg viewBox="0 0 320 160" className="w-full h-full">
      <text x="14" y="18" fontSize="9" fontFamily="monospace" fill="#f59e0b">Fibonacci — dp table</text>
      {dp.map((v,i) => (
        <g key={i}>
          <rect x={14+i*36} y={26} width={30} height={28} rx="4"
            fill={i>=6?'#92400e44':'#1c1917'} stroke={i>=6?'#f59e0b':'#44403c'} strokeWidth="1.5"/>
          <text x={29+i*36} y={35} textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#78716c">dp[{i}]</text>
          <text x={29+i*36} y={49} textAnchor="middle" fontSize="11" fontFamily="monospace"
            fill={i>=6?'#fbbf24':'#a8a29e'}>{v}</text>
        </g>
      ))}
      {[2,3,4,5,6,7].map(i => (
        <path key={i} d={`M${29+(i-1)*36},56 Q${29+(i-0.5)*36},72 ${29+i*36},56`}
          fill="none" stroke="#f59e0b55" strokeWidth="1"/>
      ))}
      <text x="14" y="86" fontSize="8" fontFamily="monospace" fill="#78716c">dp[n] = dp[n-1] + dp[n-2]</text>
      <text x="14" y="106" fontSize="9" fontFamily="monospace" fill="#a78bfa">Coin Change — min coins for 11</text>
      {[0,1,1,2,2,3,3,4,4,5,5,3].map((v,i) => (
        <g key={i}>
          <rect x={14+i*24} y={112} width={20} height={20} rx="3"
            fill={i===11?'#7c3aed44':'#1e1b4b'} stroke={i===11?'#7c3aed':'#312e81'} strokeWidth="1"/>
          <text x={24+i*24} y={126} textAnchor="middle" fontSize="8" fontFamily="monospace"
            fill={i===11?'#a78bfa':'#6366f1'}>{v}</text>
        </g>
      ))}
      <text x="14" y="148" fontSize="8" fontFamily="monospace" fill="#44403c">coins=[1,5,6,9] · dp[11]=3</text>
    </svg>
  )
}

function SystemDiagram() {
  return (
    <svg viewBox="0 0 320 160" className="w-full h-full">
      <text x="14" y="16" fontSize="9" fontFamily="monospace" fill="#22d3ee">Client-Server · Load Balancer</text>
      <rect x="10" y="60" width="50" height="30" rx="6" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5"/>
      <text x="35" y="78" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#22d3ee">Client</text>
      <line x1="60" y1="75" x2="90" y2="75" stroke="#22d3ee" strokeWidth="1.5"/>
      <rect x="90" y="56" width="64" height="38" rx="6" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5"/>
      <text x="122" y="72" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#22d3ee">Load</text>
      <text x="122" y="84" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#22d3ee">Balancer</text>
      {[0,1,2].map(i => (
        <g key={i}>
          <line x1="154" y1="75" x2="180" y2={46+i*30} stroke="#34d399" strokeWidth="1" strokeDasharray="3 2"/>
          <rect x="180" y={34+i*30} width="52" height="22" rx="5" fill="#0f172a" stroke="#34d399" strokeWidth="1.5"/>
          <text x="206" y={48+i*30} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#34d399">Server {i+1}</text>
        </g>
      ))}
      <rect x="244" y="57" width="52" height="36" rx="6" fill="#0f172a" stroke="#818cf8" strokeWidth="1.5"/>
      <text x="270" y="72" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#818cf8">Database</text>
      <text x="270" y="84" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#6366f1">↕ sync</text>
      <text x="14" y="118" fontSize="9" fontFamily="monospace" fill="#f59e0b">LRU Cache</text>
      <text x="14" y="132" fontSize="8" fontFamily="monospace" fill="#78716c">capacity=3  |  get/put O(1)  |  evict LRU on full</text>
      {['A','B','C'].map((k,i) => (
        <g key={k}>
          <rect x={14+i*70} y={138} width={60} height={16} rx="3"
            fill={i===0?'#92400e44':'#1c1917'} stroke={i===0?'#f59e0b':'#44403c'} strokeWidth="1"/>
          <text x={44+i*70} y={149} textAnchor="middle" fontSize="8" fontFamily="monospace"
            fill={i===0?'#fbbf24':'#78716c'}>{k} {i===0?'← MRU':i===2?'← LRU':''}</text>
        </g>
      ))}
    </svg>
  )
}

const HOW_STEPS = [
  { n:'01', icon:'</>',  title:'Paste your code',     desc:'Write or paste any DSA, SQL or algorithm in Python, JavaScript, or C++.' },
  { n:'02', icon:'⬡',   title:'AI traces every step', desc:'Groq Llama 3.3 maps each operation — comparisons, swaps, pointer moves — into a step plan.' },
  { n:'03', icon:'▶',   title:'Watch it animate',     desc:'Steps animate with highlighted nodes and plain-English explanations at your own pace.' },
]

export default function Home({ dark, setDark }: Props) {
  const navigate = useNavigate()

  const navBg  = dark ? 'rgba(10,10,15,0.93)' : 'rgba(255,255,255,0.93)'
  const navBdr = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'
  const txt    = dark ? '#ffffff' : '#111827'
  const sub    = dark ? '#9ca3af' : '#6b7280'

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'system-ui,sans-serif', background: dark ? '#0a0a0f' : '#f9fafb', color: txt }}>

      {/* ── NAVBAR ── */}
      <nav className="flex items-center gap-4 px-8 py-3 border-b sticky top-0 z-50 backdrop-blur"
        style={{ background: navBg, borderColor: navBdr }}>

        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 shrink-0 group cursor-pointer">
          <DSAVizLogo size={34} />
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-sm tracking-tight" style={{ color: txt }}>
              dsa<span style={{ color: '#a78bfa' }}>viz</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color: dark ? '#4b5563' : '#9ca3af' }}>
              visualizer
            </span>
          </div>
        </button>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 text-sm ml-2">
          {[
            { label: 'DSA', path: '/dsa' },
            { label: 'SQL', path: '/sql' },
            { label: 'System Design', path: '/system-design' },
            { label: 'Visualizer', path: '/visualizer', state: { code: '' } },
          ].map(item => (
            <button key={item.label}
              onClick={() => navigate(item.path, item.state ? { state: item.state } : undefined)}
              className="px-3 py-1.5 rounded-lg transition-colors text-xs font-medium"
              style={{ color: sub }}
              onMouseEnter={e => { e.currentTarget.style.color = txt; e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.color = sub; e.currentTarget.style.background = 'transparent' }}>
              {item.label}
            </button>
          ))}
        </div>

        {/* Search — pushed right with ml-auto */}
        <div className="ml-auto flex-1 max-w-xs">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: dark ? '#4b5563' : '#9ca3af' }}>🔍</span>
            <input
              type="text"
              placeholder="Search algorithms, SQL, topics…"
              className="w-full text-xs rounded-xl pl-8 pr-4 py-2 outline-none transition-all"
              style={{
                background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
                color: dark ? '#d1d5db' : '#374151',
              }}
              onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 2px rgba(124,58,237,0.15)' }}
              onBlur={e => { e.target.style.borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setDark(!dark)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-sm"
            style={{ color: sub }}
            onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            title={dark ? 'Light mode' : 'Dark mode'}>
            {dark ? '☀️' : '🌙'}
          </button>
          <button onClick={() => navigate('/signin')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
            style={{ color: sub, borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
            onMouseEnter={e => { e.currentTarget.style.color = txt; e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.color = sub; e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/visualizer', { state: { code: '' } })}
            className="px-4 py-1.5 text-xs font-bold rounded-lg text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 14px rgba(124,58,237,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 22px rgba(124,58,237,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 14px rgba(124,58,237,0.3)' }}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center text-center px-6 pt-20 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-5">
          <div className="flex items-center gap-2 rounded-full px-4 py-1 text-xs font-mono"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: '#a78bfa' }} />
            Free · No signup · Powered by Groq Llama 3.3
          </div>

          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]" style={{ letterSpacing: '-1px', color: txt }}>
            Master{' '}
            <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              algorithms
            </span>
            <br />by watching them run
          </h1>

          <p className="text-base max-w-xl leading-relaxed" style={{ color: sub }}>
            Paste any algorithm — AI traces every step and animates it with{' '}
            <strong style={{ color: txt }}>plain-English explanations</strong>.
          </p>

          <div className="flex gap-3 flex-wrap justify-center mt-2">
            <button onClick={() => navigate('/visualizer', { state: { code: '' } })}
              className="font-bold px-8 py-3 rounded-xl transition-all text-sm text-white active:scale-95 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 24px rgba(139,92,246,0.35)' }}>
              ▶ Start Visualizing — Free
            </button>
            <button onClick={() => navigate('/dsa')}
              className="font-semibold px-6 py-3 rounded-xl transition-all text-sm cursor-pointer"
              style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, color: dark ? '#e5e7eb' : '#374151' }}>
              Browse Examples →
            </button>
          </div>
          <div className="flex items-center gap-6 text-xs mt-1" style={{ color: dark ? '#374151' : '#9ca3af' }}>
            <span>✓ Python · JS · C++</span>
            <span>✓ DSA + SQL + System Design</span>
            <span>✓ Step-by-step animations</span>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-8 py-12 max-w-6xl mx-auto w-full" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}` }}>
        <div className="text-center mb-10">
          <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: '#a78bfa' }}>How it works</div>
          <h2 className="text-2xl font-bold" style={{ color: txt }}>From code to animation in seconds</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_STEPS.map((s, i) => (
            <div key={i} className="relative flex flex-col gap-3 rounded-2xl p-6 transition-colors"
              style={{ background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-mono font-bold shrink-0"
                  style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                  {s.icon}
                </div>
                <div className="text-xs font-mono" style={{ color: dark ? '#4b5563' : '#9ca3af' }}>{s.n}</div>
              </div>
              <div className="text-sm font-bold" style={{ color: txt }}>{s.title}</div>
              <div className="text-xs leading-relaxed" style={{ color: sub }}>{s.desc}</div>
              {i < HOW_STEPS.length - 1 && (
                <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 text-lg hidden md:block z-10" style={{ color: dark ? '#374151' : '#d1d5db' }}>→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── TOPICS GRID ── */}
      <section className="px-8 py-12 max-w-6xl mx-auto w-full" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}` }}>
        <div className="text-center mb-10">
          <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: '#a78bfa' }}>Topics</div>
          <h2 className="text-2xl font-bold" style={{ color: txt }}>Choose a topic</h2>
          <p className="text-sm mt-1.5" style={{ color: sub }}>Each has preloaded examples with AI-powered step-by-step animations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TOPICS.map(topic => {
            const Diagram = topic.diagram
            const borderCol = BORDER[topic.color]
            const textCol   = TEXT[topic.color]
            const tagBg     = TAG_BG[topic.color]
            const glowCol   = GLOW[topic.color]
            const cardBg    = dark ? 'linear-gradient(145deg, #0f0f1a 0%, #0a0a0f 100%)' : '#ffffff'

            return (
              <button key={topic.id} onClick={() => navigate(topic.path)}
                className="group text-left rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                style={{ background: cardBg, border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}` }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${borderCol}55`
                  e.currentTarget.style.boxShadow = `0 0 40px ${glowCol}, 0 8px 32px rgba(0,0,0,0.15)`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
                  e.currentTarget.style.boxShadow = 'none'
                }}>
                <div className="h-44 border-b flex items-center justify-center p-5 overflow-hidden relative"
                  style={{ background: dark ? '#060608' : '#f8fafc', borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }}>
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${glowCol} 0%, transparent 70%)` }} />
                  <div className="w-full max-w-[360px] h-full relative z-10"><Diagram /></div>
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                      style={{ color: textCol, borderColor: `${borderCol}44`, background: `${borderCol}11` }}>
                      {topic.badge}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <h3 className="text-sm font-bold" style={{ color: textCol }}>{topic.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: sub }}>{topic.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {topic.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                        style={{ background: tagBg, color: textCol, border: `1px solid ${borderCol}33` }}>{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}` }}>
                    <span className="text-xs" style={{ color: sub }}>Explore →</span>
                    <span className="text-xs font-mono px-3 py-1 rounded-lg font-semibold"
                      style={{ background: `${borderCol}22`, border: `1px solid ${borderCol}44`, color: textCol }}>
                      Open
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="px-8 py-16 text-center" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}` }}>
        <div className="max-w-xl mx-auto flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold" style={{ color: txt }}>Have your own code to visualize?</h2>
          <p className="text-sm" style={{ color: sub }}>Paste any algorithm — AI traces and animates every step for free. No signup needed.</p>
          <button onClick={() => navigate('/visualizer', { state: { code: '' } })}
            className="font-bold px-10 py-3.5 rounded-xl transition-all text-sm mt-2 active:scale-95 text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 24px rgba(139,92,246,0.3)' }}>
            ▶ Start Visualizing for Free
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-8 py-8 text-xs font-mono" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}` }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: logo + stack */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <DSAVizLogo size={20} />
              <span style={{ color: dark ? '#6b7280' : '#9ca3af' }}>
                <span style={{ color: '#a78bfa' }}>dsa</span>viz · React + FastAPI + Groq Llama 3.3
              </span>
            </div>
            <div style={{ color: dark ? '#374151' : '#d1d5db' }}>
              Open source · MIT License · © 2026
            </div>
          </div>

          {/* Center: credit */}
          <div className="flex flex-col items-start md:items-center gap-1">
            <div style={{ color: dark ? '#6b7280' : '#9ca3af' }}>Built &amp; designed by</div>
            <div className="flex flex-col items-start md:items-center">
              <span className="font-bold text-sm" style={{ color: dark ? '#e5e7eb' : '#111827', fontFamily: 'system-ui,sans-serif' }}>
                Mohammad Abdulla
              </span>
              <a href="mailto:mohammadabdulla20march@gmail.com"
                className="transition-colors mt-0.5"
                style={{ color: '#a78bfa' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#c4b5fd' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#a78bfa' }}>
                mohammadabdulla20march@gmail.com
              </a>
            </div>
          </div>

          {/* Right: links */}
          <div className="flex items-center gap-4" style={{ color: dark ? '#374151' : '#d1d5db' }}>
            {['DSA', 'SQL', 'System Design', 'Visualizer'].map(l => (
              <button key={l}
                className="transition-colors"
                style={{ color: dark ? '#4b5563' : '#9ca3af' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#a78bfa' }}
                onMouseLeave={e => { e.currentTarget.style.color = dark ? '#4b5563' : '#9ca3af' }}
                onClick={() => navigate(l === 'DSA' ? '/dsa' : l === 'SQL' ? '/sql' : l === 'System Design' ? '/system-design' : '/visualizer', l === 'Visualizer' ? { state: { code: '' } } : undefined)}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}