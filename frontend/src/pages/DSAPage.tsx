import { useNavigate } from 'react-router-dom'
import { useState, useRef, useCallback } from 'react'
import { DSA_SUBCATEGORIES } from '../data/categories'
import type { Example } from '../data/categories'
import { useVisualizer } from '../hooks/useVisualizer'
import Visualizer from '../components/Visualizer'
import StepControls from '../components/StepControls'
import ExplainPanel from '../components/ExplainPanel'
import Navbar from '../components/Navbar'
import CodePanel from '../components/CodePanel'

interface Props { dark: boolean; setDark: (v: boolean) => void }

const SUB_COLORS: Record<number, { border: string; title: string; icon: string; tag: string; btn: string }> = {
  0: { border: 'hover:border-violet-500', title: 'text-violet-500', icon: 'bg-violet-950 text-violet-400', tag: 'bg-violet-950/60 text-violet-300 border border-violet-800', btn: 'bg-violet-600 hover:bg-violet-500' },
  1: { border: 'hover:border-blue-500',   title: 'text-blue-500',   icon: 'bg-blue-950 text-blue-400',     tag: 'bg-blue-950/60 text-blue-300 border border-blue-800',     btn: 'bg-blue-600 hover:bg-blue-500'   },
  2: { border: 'hover:border-cyan-500',   title: 'text-cyan-500',   icon: 'bg-cyan-950 text-cyan-400',     tag: 'bg-cyan-950/60 text-cyan-300 border border-cyan-800',     btn: 'bg-cyan-700 hover:bg-cyan-600'   },
  3: { border: 'hover:border-amber-500',  title: 'text-amber-500',  icon: 'bg-amber-950 text-amber-400',   tag: 'bg-amber-950/60 text-amber-300 border border-amber-800',  btn: 'bg-amber-600 hover:bg-amber-500' },
  4: { border: 'hover:border-green-500',  title: 'text-green-500',  icon: 'bg-green-950 text-green-400',   tag: 'bg-green-950/60 text-green-300 border border-green-800',  btn: 'bg-green-700 hover:bg-green-600' },
  5: { border: 'hover:border-pink-500',   title: 'text-pink-500',   icon: 'bg-pink-950 text-pink-400',     tag: 'bg-pink-950/60 text-pink-300 border border-pink-800',     btn: 'bg-pink-700 hover:bg-pink-600'   },
}

function ArrayPreview() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-full">
      {[5,3,8,1,9,2].map((v,i) => (
        <g key={i}>
          <rect x={8+i*32} y={18} width={26} height={26} rx="5"
            fill={i===1||i===2?'#7c3aed33':'#1e1b4b22'}
            stroke={i===1||i===2?'#7c3aed':'#4338ca'} strokeWidth="1.5"/>
          <text x={21+i*32} y={35} textAnchor="middle" fontSize="11" fontFamily="monospace"
            fill={i===1||i===2?'#a78bfa':'#818cf8'}>{v}</text>
          <text x={21+i*32} y={55} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#4338ca">{i}</text>
        </g>
      ))}
      <text x="8" y="72" fontSize="8" fontFamily="monospace" fill="#6366f1">bubble sort · comparing i=1, j=2</text>
    </svg>
  )
}

function SortPreview() {
  const bars = [60,30,80,20,90,45,70]
  return (
    <svg viewBox="0 0 200 80" className="w-full h-full">
      {bars.map((h,i) => (
        <g key={i}>
          <rect x={10+i*26} y={74-h*0.65} width={20} height={h*0.65} rx="3"
            fill={i===2||i===4?'#3b82f633':'#1e293b'}
            stroke={i===2||i===4?'#3b82f6':'#334155'} strokeWidth="1.5"/>
          <text x={20+i*26} y={72} textAnchor="middle" fontSize="7" fontFamily="monospace"
            fill={i===2||i===4?'#60a5fa':'#475569'}>{h}</text>
        </g>
      ))}
      <text x="8" y="10" fontSize="8" fontFamily="monospace" fill="#3b82f6">selection sort · finding min</text>
    </svg>
  )
}

function LinkedListPreview() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-full">
      {[12,99,37,55].map((v,i) => (
        <g key={i}>
          <rect x={8+i*47} y={25} width={36} height={26} rx="5"
            fill={i===0?'#0891b233':'#1e293b'}
            stroke={i===0?'#06b6d4':'#334155'} strokeWidth="1.5"/>
          <text x={26+i*47} y={41} textAnchor="middle" fontSize="11" fontFamily="monospace"
            fill={i===0?'#67e8f9':'#94a3b8'}>{v}</text>
          {i<3 && <text x={46+i*47} y={41} textAnchor="middle" fontSize="13" fill="#475569">→</text>}
        </g>
      ))}
      <text x={8+3*47+40} y={41} fontSize="10" fontFamily="monospace" fill="#475569">∅</text>
      <text x="8" y="68" fontSize="8" fontFamily="monospace" fill="#0891b2">traversal · curr = head.next</text>
    </svg>
  )
}

function StackQueuePreview() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-full">
      {[40,30,20,10].map((v,i) => (
        <rect key={i} x={10} y={8+i*16} width={60} height={14} rx="3"
          fill={i===0?'#7c3aed33':'#1e1b4b22'}
          stroke={i===0?'#7c3aed':'#4338ca'} strokeWidth="1"/>
      ))}
      {[40,30,20,10].map((v,i) => (
        <text key={i} x={40} y={19+i*16} textAnchor="middle" fontSize="8" fontFamily="monospace"
          fill={i===0?'#a78bfa':'#818cf8'}>{v}</text>
      ))}
      <text x="10" y="78" fontSize="8" fontFamily="monospace" fill="#7c3aed">stack (LIFO)</text>
      {['A','B','C','D'].map((v,i) => (
        <g key={i}>
          <rect x={90+i*26} y={28} width={22} height={22} rx="4"
            fill={i===0?'#22d3a033':'#1e293b'}
            stroke={i===0?'#22d3a0':'#334155'} strokeWidth="1.5"/>
          <text x={101+i*26} y={43} textAnchor="middle" fontSize="10" fontFamily="monospace"
            fill={i===0?'#6ee7b7':'#94a3b8'}>{v}</text>
        </g>
      ))}
      <text x="90" y="78" fontSize="8" fontFamily="monospace" fill="#22d3a0">queue (FIFO)</text>
    </svg>
  )
}

function TreePreview() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-full">
      <line x1="100" y1="14" x2="60" y2="40" stroke="#ffffff22" strokeWidth="1"/>
      <line x1="100" y1="14" x2="140" y2="40" stroke="#ffffff22" strokeWidth="1"/>
      <line x1="60" y1="40" x2="38" y2="64" stroke="#ffffff22" strokeWidth="1"/>
      <line x1="60" y1="40" x2="82" y2="64" stroke="#ffffff22" strokeWidth="1"/>
      <line x1="140" y1="40" x2="162" y2="64" stroke="#ffffff22" strokeWidth="1"/>
      <circle cx="100" cy="14" r="12" fill="#16a34a33" stroke="#16a34a" strokeWidth="1.5"/>
      <text x="100" y="18" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#4ade80">8</text>
      <circle cx="60" cy="40" r="11" fill="#7c3aed33" stroke="#7c3aed" strokeWidth="1.5"/>
      <text x="60" y="44" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#a78bfa">3</text>
      <circle cx="140" cy="40" r="11" fill="#7c3aed33" stroke="#7c3aed" strokeWidth="1.5"/>
      <text x="140" y="44" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#a78bfa">11</text>
      <circle cx="38" cy="64" r="9" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
      <text x="38" y="68" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#64748b">1</text>
      <circle cx="82" cy="64" r="9" fill="#0891b233" stroke="#06b6d4" strokeWidth="1.5"/>
      <text x="82" y="68" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#67e8f9">6</text>
      <circle cx="162" cy="64" r="9" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
      <text x="162" y="68" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#64748b">13</text>
    </svg>
  )
}

function GraphPreview() {
  return (
    <svg viewBox="0 0 200 80" className="w-full h-full">
      <line x1="40" y1="40" x2="100" y2="16" stroke="#f59e0b66" strokeWidth="1.5"/>
      <line x1="40" y1="40" x2="100" y2="62" stroke="#f59e0b66" strokeWidth="1.5"/>
      <line x1="100" y1="16" x2="160" y2="40" stroke="#f59e0b44" strokeWidth="1.5"/>
      <line x1="100" y1="62" x2="160" y2="40" stroke="#f59e0b44" strokeWidth="1.5"/>
      <line x1="100" y1="16" x2="100" y2="62" stroke="#f59e0b22" strokeWidth="1" strokeDasharray="3 2"/>
      <circle cx="40" cy="40" r="13" fill="#7c3aed33" stroke="#7c3aed" strokeWidth="1.5"/>
      <text x="40" y="44" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#c4b5fd">A</text>
      <circle cx="100" cy="16" r="12" fill="#f59e0b33" stroke="#f59e0b" strokeWidth="1.5"/>
      <text x="100" y="20" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#fbbf24">B</text>
      <circle cx="100" cy="62" r="12" fill="#0891b233" stroke="#06b6d4" strokeWidth="1.5"/>
      <text x="100" y="66" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#67e8f9">C</text>
      <circle cx="160" cy="40" r="12" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
      <text x="160" y="44" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#64748b">D</text>
      <text x="8" y="78" fontSize="8" fontFamily="monospace" fill="#f59e0b">BFS · visited: A → B → C</text>
    </svg>
  )
}

const PREVIEWS = [ArrayPreview, SortPreview, LinkedListPreview, StackQueuePreview, TreePreview, GraphPreview]

function useDrag(initial: number, min: number, max: number) {
  const [size, setSize] = useState(initial)
  const dragging = useRef(false)

  const onMouseDown = useCallback(() => {
    dragging.current = true
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setSize(prev => Math.min(max, Math.max(min, prev + e.movementX)))
    }
    const onUp = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [min, max])

  return { size, onMouseDown }
}

export default function DSAPage({ dark, setDark }: Props) {
  const navigate = useNavigate()
  const [selectedSub, setSelectedSub] = useState<number | null>(null)
  const [selectedEx, setSelectedEx] = useState<Example | null>(null)
  const [view, setView] = useState<'grid' | 'detail'>('grid')

  const sidebar = useDrag(208, 140, 320)
  const codePanel = useDrag(420, 260, 640)

  const { steps, current, loading, playing, speed, error,
    setPlaying, setSpeed, visualize, next, prev, reset } = useVisualizer()

  const handleCardClick = (idx: number) => {
    setSelectedSub(idx)
    setSelectedEx(DSA_SUBCATEGORIES[idx].examples[0])
    setView('detail')
    reset()
  }

  const handleExampleSelect = (ex: Example) => { setSelectedEx(ex); reset() }
  const handleVisualize = () => { if (selectedEx) visualize(selectedEx.code, 'python', 'dsa') }
  const handleBack = () => {
    if (view === 'detail') { setView('grid'); setSelectedSub(null); setSelectedEx(null); reset() }
    else navigate(-1)
  }

  // ── GRID VIEW ──────────────────────────────────────────────
  if (view === 'grid') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
        <Navbar dark={dark} setDark={setDark} showBack={true} />

        <div className="flex items-center gap-2 px-8 py-2.5 border-b border-gray-200 dark:border-gray-800 text-xs font-mono text-gray-400">
          <button onClick={() => navigate('/')} className="hover:text-violet-500 transition-colors">Home</button>
          <span>/</span>
          <span className="text-violet-500">Data Structures & Algorithms</span>
        </div>

        {/* Hero Section Layout */}
        <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none" />
          
          {/* UPDATED: Changed items-start to items-center for unified vertical centering */}
          <div className="relative max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">

            {/* Left Area: Title, Descriptions, and CTA (Now perfectly centered vertically) */}
            <div className="flex flex-col gap-5 lg:col-span-2 justify-center h-full">
              <div className="text-xs font-mono text-violet-500 uppercase tracking-widest">Data Structures & Algorithms</div>
              <h1 className="text-4xl font-bold tracking-tight leading-tight">
                Visualize every concept,<br />
                <span className="text-violet-500">step by step</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xl">
                Choose a topic below to explore preloaded examples with AI-generated step-by-step animations, or paste your own code to visualize it instantly.
              </p>

              <div className="flex flex-wrap gap-2 mt-1">
                {['Arrays', 'Sorting', 'Linked Lists','Stacks', 'Queues', 'Trees', 'Graphs'].map(t => (
                  <span key={t} className="text-[10px] font-mono px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(165, 116, 180, 0.08)', color: '#7c3aed', border: '1px solid rgba(156, 101, 173, 0.2)' }}>{t}</span>
                ))}
              </div>

              <div className="flex flex-col gap-2 max-w-xs mt-2">
                <button
                  onClick={() => navigate('/visualizer', { state: { code: '', mode: 'dsa' } })}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>▶</span> {`Visualize Your Own Code`}
                </button>
                <p className="text-xs text-gray-400 font-mono text-center">Python · JavaScript · C++</p>
              </div>
            </div>

            {/* How it works (Right side clean vertical layout container) */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm max-w-sm ml-auto w-full">
              <div className="text-[10px] font-mono text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3.5 font-bold">
                How it works
              </div>
              
              <div className="flex flex-col gap-3">
                {[
                  { step: '01', icon: '{}', title: 'Paste your code', desc: 'Paste code in Python, JS, or C++.' },
                  { step: '02', icon: '⬡', title: 'Al analyzes it', desc: 'Llama 3.3 maps out an execution plan.' },
                  { step: '03', icon: '▶', title: 'Watch it animate', desc: 'Steps animate with node explanations.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800/60 rounded-xl p-2.5">
                    <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                        <span className="text-[10px] font-mono text-gray-400 mr-1">{item.step}</span>
                        {item.title}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-8 tenderness-container pt-6 pb-3">
          <div className="flex items-center gap-4">
          </div>
        </div>

        {/* Topic grid */}
        <section className="px-8 pb-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-4"></div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Explore Preloaded Examples</h2>
            <p className="text-gray-500 text-sm mt-1.5">Each topic has preloaded examples with step-by-step animations and AI explanations.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DSA_SUBCATEGORIES.map((sub, idx) => {
              const c = SUB_COLORS[idx]
              const Preview = PREVIEWS[idx]
              return (
                <button key={sub.id} onClick={() => handleCardClick(idx)}
                  className={`group text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-2xl flex flex-col h-full cursor-pointer ${c.border}`}>
                  <div className="h-32 bg-gray-950 border-b border-gray-800 p-3 overflow-hidden w-full flex items-center justify-center">
                    <div className="w-full max-w-[240px] h-full">
                      <Preview />
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 justify-between w-full">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold shrink-0 ${c.icon}`}>{sub.icon}</div>
                        <div>
                          <div className={`text-sm font-bold ${c.title}`}>{sub.label}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">{sub.examples.length} examples</div>
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        {sub.examples.map(ex => (
                          <span key={ex.label} className={`text-xs px-2 py-0.5 rounded-full font-mono ${c.tag}`}>{ex.label}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800/40 w-full">
                      <span>Click to explore</span>
                      <span className={`font-mono group-hover:${c.title} transition-colors`}>Explore →</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <footer className="border-t border-gray-200 dark:border-gray-800 px-8 py-5 flex items-center justify-between">
          <div className="font-mono text-sm text-gray-400"><span className="text-violet-500">dsa</span>viz</div>
          <div className="text-xs text-gray-400 font-mono">© 2026</div>
        </footer>
      </div>
    )
  }

  // ── DETAIL VIEW ────────────────────────────────────────────
  const sub = DSA_SUBCATEGORIES[selectedSub!]
  const c = SUB_COLORS[selectedSub!]

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden select-none">

      {/* ── TOP NAV ── */}
      <nav className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-800 bg-gray-900/90 backdrop-blur shrink-0">
        <button onClick={handleBack}
          className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer">
          ← Back
        </button>
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 cursor-pointer">
          <span className="text-violet-400 font-bold text-base">⬡</span>
          <span className="font-mono font-bold text-white">dsa<span className="text-violet-400">viz</span></span>
        </button>
        <span className="text-gray-700 text-xs font-mono">/</span>
        <button onClick={() => setView('grid')} className="text-violet-400 text-xs font-mono hover:text-violet-300 transition-colors">DSA</button>
        <span className="text-gray-700 text-xs font-mono">/</span>
        <span className="text-gray-400 text-xs font-mono">{sub.label}</span>
        {selectedEx && <><span className="text-gray-700 text-xs font-mono">/</span><span className="text-gray-500 text-xs font-mono">{selectedEx.label}</span></>}

        <div className="ml-auto flex items-center gap-2">
          {/* Examples dropdown — grouped by all topics */}
          <select
            value={`${selectedSub}::${selectedEx?.label ?? ''}`}
            onChange={e => {
              const [subIdxStr, label] = e.target.value.split('::')
              const subIdx = parseInt(subIdxStr)
              const targetSub = DSA_SUBCATEGORIES[subIdx]
              const ex = targetSub?.examples.find(x => x.label === label)
              if (ex) {
                if (subIdx !== selectedSub) {
                  setSelectedSub(subIdx)
                }
                handleExampleSelect(ex)
              }
            }}
            className="text-xs font-mono bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1.5 rounded-lg outline-none cursor-pointer max-w-[220px]"
          >
            <option value="" disabled>All examples…</option>
            {DSA_SUBCATEGORIES.map((s, sIdx) => (
              <optgroup key={s.id} label={`${s.icon} ${s.label}`}>
                {s.examples.map(ex => (
                  <option key={ex.label} value={`${sIdx}::${ex.label}`}>{ex.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <button onClick={handleVisualize} disabled={loading}
            className={`flex items-center gap-1.5 ${c.btn} disabled:opacity-50 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer`}>
            {loading ? <><span className="animate-spin inline-block">⟳</span> Analyzing…</> : <>▶ Run</>}
          </button>
          <button onClick={() => navigate('/visualizer', { state: { code: selectedEx?.code ?? '' } })}
            className="text-xs text-gray-400 hover:text-violet-400 border border-gray-700 hover:border-violet-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
            Open in Visualizer ↗
          </button>
        </div>
      </nav>

      {/* ── THREE-PANEL BODY ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: Examples sidebar — resizable */}
        <div className="shrink-0 border-r border-gray-800 bg-gray-900/50 flex flex-col overflow-hidden" style={{ width: sidebar.size }}>
          <div className="px-3 py-2.5 border-b border-gray-800 shrink-0">
            <div className={`text-xs font-semibold ${c.title}`}>{sub.label}</div>
            <div className="text-xs text-gray-600 font-mono mt-0.5">{sub.examples.length} examples</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sub.examples.map(ex => (
              <button key={ex.label} onClick={() => handleExampleSelect(ex)}
                className={`w-full text-left px-3 py-3 border-b border-gray-800/60 transition-colors cursor-pointer ${
                  selectedEx?.label === ex.label
                    ? 'bg-violet-950/40 border-l-2 border-l-violet-500'
                    : 'hover:bg-gray-800/40'
                }`}>
                <div className={`text-xs font-semibold ${selectedEx?.label === ex.label ? 'text-violet-400' : 'text-gray-300'}`}>{ex.label}</div>
                <div className="text-xs text-gray-600 mt-0.5 font-mono">{ex.ds?.replace(/_/g, ' ')}</div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-800 p-3 shrink-0">
            <div className="text-xs text-gray-600 mb-2 font-mono">Other topics</div>
            {DSA_SUBCATEGORIES.filter((_, i) => i !== selectedSub).map(s => (
              <button key={s.id}
                onClick={() => { setSelectedSub(DSA_SUBCATEGORIES.indexOf(s)); setSelectedEx(s.examples[0]); reset() }}
                className="w-full text-left text-xs text-gray-500 hover:text-violet-400 py-1.5 transition-colors flex items-center gap-1.5 cursor-pointer">
                <span>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drag handle 1 */}
        <div onMouseDown={sidebar.onMouseDown}
          className="w-1 shrink-0 bg-gray-800 hover:bg-violet-500 cursor-col-resize transition-colors" />

        {/* CENTER: Code editor — resizable */}
        <div className="shrink-0 flex flex-col overflow-hidden border-r border-gray-800" style={{ width: codePanel.size }}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs font-mono text-gray-500">{selectedEx?.label ?? 'example'}.py</span>
            </div>
            <span className="text-xs font-mono text-gray-600">Python</span>
          </div>
          <div className="flex-1 overflow-auto bg-gray-950">
            {selectedEx ? (
              <pre className="font-mono text-sm leading-7 text-gray-300 whitespace-pre p-5">
                {selectedEx.code.split('\n').map((line, i) => {
                  const isActive = steps.length > 0 && steps[current]?.line === i + 1
                  return (
                    <div key={i} className={`flex gap-4 px-2 -mx-2 rounded group ${isActive ? 'bg-blue-500/15 border-l-2 border-l-blue-500' : 'hover:bg-white/5'}`}>
                      <span className={`select-none w-5 text-right shrink-0 text-xs mt-0.5 ${isActive ? 'text-blue-400' : 'text-gray-700 group-hover:text-gray-500'}`}>{i + 1}</span>
                      <span className={isActive ? 'text-blue-200' : ''}>{line || ' '}</span>
                    </div>
                  )
                })}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600 text-sm font-mono">Select an example</div>
            )}
          </div>
          {/* Description panel */}
          {selectedEx && steps.length === 0 && !loading && (
            <div className="border-t border-gray-800 bg-gray-900/60 p-4 shrink-0">
              <div className="text-xs text-gray-400 leading-relaxed mb-3">{selectedEx.description}</div>
              <button onClick={handleVisualize}
                className={`w-full py-2 rounded-lg text-white text-xs font-bold transition-colors cursor-pointer ${c.btn}`}>
                ▶ Visualize this example
              </button>
            </div>
          )}
        </div>

        {/* Drag handle 2 */}
        <div onMouseDown={codePanel.onMouseDown}
          className="w-1 shrink-0 bg-gray-800 hover:bg-violet-500 cursor-col-resize transition-colors" />

        {/* RIGHT: Visualization — fills rest */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900 shrink-0">
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest">Visualization</span>
            {steps.length > 0 && (
              <span className="text-xs font-mono text-gray-600">step {current + 1} / {steps.length}</span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-3">
              <div className="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono text-gray-500">AI is analyzing your code…</p>
            </div>
          ) : steps.length > 0 ? (
            <>
              <div className="flex-1 overflow-hidden">
                <Visualizer steps={steps} current={current} loading={loading} error={error} />
              </div>
              {/* Explanation */}
              {steps[current]?.explanation && (
                <div className="px-4 py-2.5 border-t border-gray-800 bg-gray-900/60 shrink-0">
                  <div className="flex items-start gap-2 text-xs font-mono text-gray-400">
                    <span className="text-violet-400 shrink-0">→</span>
                    <span className="leading-relaxed">{steps[current].explanation}</span>
                  </div>
                </div>
              )}
              <StepControls
                steps={steps} current={current} playing={playing} speed={speed}
                onNext={next} onPrev={prev} onReset={reset}
                onPlayPause={() => setPlaying((p: boolean) => !p)}
                onSpeedChange={setSpeed}
              />
            </>
          ) : selectedEx ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-8">
              <span className="text-4xl text-gray-800">⬡</span>
              <div>
                <p className="text-sm text-gray-400 font-semibold mb-1">{selectedEx.label}</p>
                <p className="text-xs text-gray-600 max-w-xs">{selectedEx.description}</p>
              </div>
              <button onClick={handleVisualize}
                className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer ${c.btn}`}>
                ▶ Visualize this example
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 text-gray-700 text-sm font-mono">
              Select an example from the sidebar
            </div>
          )}
        </div>
      </div>
    </div>
  )
}