import { useParams, useNavigate } from 'react-router-dom'
import { useState, useRef, useCallback } from 'react'
import { CATEGORIES, COLOR_MAP } from '../data/categories'
import type { Example } from '../data/categories'
import { useVisualizer } from '../hooks/useVisualizer'
import Visualizer from '../components/Visualizer'
import StepControls from '../components/StepControls'
import ExplainPanel from '../components/ExplainPanel'
import Navbar from '../components/Navbar'
import CodePanel from '../components/CodePanel'

interface Props { dark: boolean; setDark: (v: boolean) => void }

function useDrag(initial: number, min: number, max: number) {
  const [size, setSize] = useState(initial)
  const dragging = useRef(false)
  const onMouseDown = useCallback(() => {
    dragging.current = true
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setSize(prev => Math.min(max, Math.max(min, prev + e.movementX)))
    }
    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [min, max])
  return { size, onMouseDown }
}

const CATEGORY_META: Record<string, {
  howItWorks: { icon: string; title: string; desc: string }[]
  animationNote: string
}> = {
  'system-design': {
    howItWorks: [
      { icon: '⬡', title: 'Pick a pattern', desc: 'Choose LRU Cache, Rate Limiter, Priority Queue or more.' },
      { icon: '▶', title: 'AI traces state', desc: 'Watch cache evictions, queue dequeues, and priority reorders.' },
      { icon: '◎', title: 'Understand design', desc: 'Each step explains the why — capacity, eviction policy, ordering.' },
    ],
    animationNote: 'Animations show hashmap state, queue FIFO flow, and eviction events.',
  },
  'dp': {
    howItWorks: [
      { icon: '▦', title: 'Pick a DP problem', desc: 'Coin Change, Knapsack, LCS, Fibonacci and more.' },
      { icon: '⬡', title: 'Watch table fill', desc: 'Each cell fills one by one as subproblems are solved.' },
      { icon: '▶', title: 'See the formula', desc: 'AI explains which previous cells contributed to each value.' },
    ],
    animationNote: 'DP table cells animate one by one, highlighting the recurrence relation at each step.',
  },
  'sql': {
    howItWorks: [
      { icon: '⊞', title: 'Pick a SQL pattern', desc: 'SELECT, JOIN, GROUP BY, Index Search and more.' },
      { icon: '⬡', title: 'Row-by-row trace', desc: 'Watch each row get filtered, joined, or grouped step by step.' },
      { icon: '▶', title: 'See query logic', desc: 'AI explains which rows pass the condition and why.' },
    ],
    animationNote: 'Rows animate in and out of the result table as conditions are evaluated.',
  },
}

export default function CategoryPage({ dark, setDark }: Props) {
  const { id } = useParams()
  const navigate = useNavigate()
  const cat = CATEGORIES.find(c => c.id === id)
  const [selected, setSelected] = useState<Example | null>(cat?.examples[0] ?? null)
  const [view, setView] = useState<'grid' | 'detail'>('grid')
  const c = COLOR_MAP[cat?.color ?? 'violet']
  const sidebar = useDrag(200, 140, 320)
  const codePanel = useDrag(420, 260, 640)

  const { steps, current, loading, playing, speed, error,
    setPlaying, setSpeed, visualize, next, prev, reset } = useVisualizer()

  if (!cat) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <span>Category not found.</span>
      <button onClick={() => navigate('/')} className="ml-2 text-violet-500">← Home</button>
    </div>
  )

  const meta = CATEGORY_META[cat.id] ?? CATEGORY_META['system-design']

  const handleSelect = (ex: Example) => { setSelected(ex); reset() }
  const handleVisualize = () => { if (selected) visualize(selected.code, 'python', cat.id) }
  const handleCardClick = (ex: Example) => { setSelected(ex); setView('detail'); reset() }
  const handleBack = () => {
    if (view === 'detail') { setView('grid'); reset() }
    else navigate(-1)
  }

  // ── GRID VIEW ──────────────────────────────────────────
  if (view === 'grid') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
        <Navbar dark={dark} setDark={setDark} showBack={true} />

        <div className="flex items-center gap-2 px-8 py-2.5 border-b border-gray-200 dark:border-gray-800 text-xs font-mono text-gray-400">
          <button onClick={() => navigate('/')} className="hover:text-violet-500 transition-colors">Home</button>
          <span>/</span>
          <span className={c.text}>{cat.title}</span>
        </div>

        {/* Hero — two column */}
        <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-8 py-14 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left */}
            <div className="flex flex-col gap-5">
              <div className={`text-xs font-mono uppercase tracking-widest ${c.text}`}>{cat.title}</div>
              <h1 className="text-4xl font-bold tracking-tight leading-tight">
                {cat.title},<br />
                <span className={c.text}>step by step</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-md">{cat.desc}</p>
              <div className={`text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 max-w-sm`}>
                💡 {meta.animationNote}
              </div>
              <div className="flex flex-col gap-2 max-w-xs mt-1">
                <button
                  onClick={() => navigate('/visualizer', { state: { code: '' } })}
                  className={`w-full text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 ${c.btn}`}
                >
                  ▶ Visualize Your Own Code
                </button>
                <p className="text-xs text-gray-400 font-mono text-center">Python · JavaScript · C++</p>
              </div>
            </div>

            {/* Right — how it works */}
            <div className="flex flex-col gap-2">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">How it works</div>
              {meta.howItWorks.map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${c.icon}`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                  <div className="ml-auto text-xs font-mono text-gray-600">0{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <div className="text-xs font-mono text-gray-400 uppercase tracking-widest px-3">preloaded examples</div>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>

        {/* Example cards */}
        <section className="px-8 pb-24 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Choose an example</h2>
            <p className="text-gray-500 text-sm mt-1.5">{cat.examples.length} preloaded examples with step-by-step animations.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cat.examples.map(ex => (
              <button
                key={ex.label}
                onClick={() => handleCardClick(ex)}
                className={`group text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${c.card}`}
              >
                {/* Code preview */}
                <div className="bg-gray-950 border-b border-gray-800 p-4 h-28 overflow-hidden">
                  <pre className="font-mono text-xs text-gray-500 leading-relaxed overflow-hidden">
                    {ex.code.split('\n').slice(0, 5).map((line, i) => (
                      <div key={i} className="truncate">{line || ' '}</div>
                    ))}
                    {ex.code.split('\n').length > 5 && <div className="text-gray-700">...</div>}
                  </pre>
                </div>
                <div className="p-4">
                  <div className={`text-xs font-mono mb-1 ${c.text}`}>{ex.ds.replace(/_/g, ' ')}</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{ex.label}</div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{ex.description}</p>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                    <span>Click to explore</span>
                    <span className="font-mono">▶ run</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <footer className="border-t border-gray-200 dark:border-gray-800 px-8 py-5 flex items-center justify-between">
          <div className="font-mono text-sm text-gray-400"><span className="text-violet-500">dsa</span>viz</div>
          <div className="text-xs text-gray-400 font-mono">© 2026</div>
        </footer>
      </div>
    )
  }

  // ── DETAIL VIEW ─────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur shrink-0">
        <button onClick={handleBack}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg transition-colors">
          ← Back
        </button>
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5">
          <span className="text-violet-500 font-bold">⬡</span>
          <span className="font-mono font-bold text-gray-900 dark:text-white">dsa<span className="text-violet-500">viz</span></span>
        </button>
        <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 ml-1">
          <span>/</span>
          <button onClick={() => setView('grid')} className={`hover:${c.text} transition-colors`}>{cat.title}</button>
          <span>/</span>
          <span className="text-gray-500">{selected?.label}</span>
        </div>
        <button onClick={() => navigate('/visualizer', { state: { code: selected?.code ?? '' } })}
          className="ml-auto text-xs text-gray-400 hover:text-violet-500 border border-gray-200 dark:border-gray-700 hover:border-violet-500 px-3 py-1.5 rounded-lg transition-colors">
          Edit in visualizer ↗
        </button>
      </div>

      {/* Resizable layout */}
      <div className="flex flex-1 overflow-hidden select-none">

        {/* Sidebar */}
        <div className="flex shrink-0 overflow-hidden" style={{ width: sidebar.size }}>
          <div className="flex flex-col overflow-y-auto w-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40">
            <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 shrink-0">
              <div className={`text-xs font-semibold ${c.text}`}>{cat.title}</div>
              <div className="text-xs text-gray-400 font-mono mt-0.5">{cat.examples.length} examples</div>
            </div>
            {cat.examples.map(ex => (
              <button key={ex.label} onClick={() => handleSelect(ex)}
                className={`w-full text-left px-4 py-3.5 border-b border-gray-100 dark:border-gray-800/60 transition-colors ${
                  selected?.label === ex.label
                    ? `bg-violet-50 dark:bg-violet-950/40 border-l-2 ${c.border}`
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                }`}>
                <div className={`text-xs font-semibold ${selected?.label === ex.label ? c.text : 'text-gray-700 dark:text-gray-300'}`}>{ex.label}</div>
                <div className="text-xs text-gray-400 mt-0.5 font-mono">{ex.ds.replace(/_/g, ' ')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Drag handle 1 */}
        <div onMouseDown={sidebar.onMouseDown}
          className="w-1 shrink-0 bg-gray-200 dark:bg-gray-800 hover:bg-violet-400 dark:hover:bg-violet-600 cursor-col-resize transition-colors" />

        {/*}
        {/* Code panel 
        <div className="flex shrink-0 overflow-hidden" style={{ width: codePanel.size }}>
          <div className="flex flex-col w-full border-r border-gray-200 dark:border-gray-800 bg-gray-950">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-900 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs font-mono text-gray-500">{selected?.label ?? 'example'}.py</span>
              </div>
              <button onClick={handleVisualize} disabled={loading}
                className={`flex items-center gap-1.5 ${c.btn} disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors`}>
                {loading ? '⟳ Analyzing...' : '▶ Run'}
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              {selected ? (
                <pre className="font-mono text-sm leading-7 text-gray-300 whitespace-pre">
                  {selected.code.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-4 hover:bg-white/5 px-2 -mx-2 rounded group">
                      <span className="text-gray-700 select-none w-5 text-right shrink-0 text-xs mt-0.5 group-hover:text-gray-500">{i + 1}</span>
                      <span>{line || ' '}</span>
                    </div>
                  ))}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600 text-sm">Select an example</div>
              )}
            </div>
          </div>
        </div>
        */}
        {/* Code panel — resizable */}
        <div className="flex shrink-0 overflow-hidden" style={{ width: codePanel.size }}>
          <CodePanel
            code={selected?.code ?? ''}
            currentStep={steps.length > 0 ? steps[current] : null}
            onRun={handleVisualize}
            loading={loading}
            btnColor={c.btn}
            label={`${selected?.label ?? 'example'}.py`}
          />
        </div>

        {/* Drag handle 2 */}
        <div onMouseDown={codePanel.onMouseDown}
          className="w-1 shrink-0 bg-gray-200 dark:bg-gray-800 hover:bg-violet-400 dark:hover:bg-violet-600 cursor-col-resize transition-colors" />

        {/* Right panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {steps.length > 0 ? (
            <>
              <div className="flex-1 overflow-hidden">
                <Visualizer steps={steps} current={current} loading={loading} error={error} />
              </div>
              <ExplainPanel step={steps[current] ?? null} />
              <StepControls
                steps={steps} current={current} playing={playing} speed={speed}
                onNext={next} onPrev={prev} onReset={reset}
                onPlayPause={() => setPlaying((p: boolean) => !p)}
                onSpeedChange={setSpeed}
              />
            </>
          ) : (
            <div className="flex flex-col h-full overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-mono text-gray-500">AI is analyzing your code...</p>
                </div>
              ) : selected ? (
                <div className="flex flex-col h-full p-8">
                  <div className="flex-1">
                    <div className={`text-xs font-mono uppercase tracking-widest mb-2 ${c.text}`}>{cat.title}</div>
                    <h2 className="text-2xl font-bold mb-2">{selected.label}</h2>
                    <div className={`w-10 h-0.5 rounded mb-5 ${c.btn}`} />
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">{selected.description}</p>
                    <div className="flex gap-2 mb-4">
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 px-3 py-1 rounded-full font-mono">Python</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-mono ${c.badge}`}>{selected.ds.replace(/_/g, ' ')}</span>
                    </div>
                    <div className={`text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2`}>
                      💡 {meta.animationNote}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 mt-6">
                    <button onClick={handleVisualize}
                      className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition-colors ${c.btn}`}>
                      ▶ Visualize this example
                    </button>
                    <button onClick={() => navigate('/visualizer', { state: { code: selected.code } })}
                      className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-violet-500 hover:text-violet-500 text-xs font-semibold transition-colors">
                      Edit & run your own version →
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}