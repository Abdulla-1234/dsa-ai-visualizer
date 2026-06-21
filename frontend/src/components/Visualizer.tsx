// frontend/src/components/Visualizer.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useRef } from 'react'

// ── Matches your ACTUAL backend step shape ──────────────────────────────────
export interface VizStep {
  step: number
  line: number
  operation: string                    // 'compare' | 'swap' | 'set' | 'visit' | ...
  ds_type: string                      // 'array' | 'stack' | 'queue' | 'linked_list' | ...
  explanation: string
  state: (number | string)[]           // current array/structure values
  highlights?: number[]                // indices currently highlighted/active
  pointers?: Record<string, number>    // e.g. { i: 2, j: 4 }
}

interface Props {
  steps: VizStep[]
  current: number
  loading: boolean
  error: string | null
}

const BOX_W = 56  // w-14
const GAP = 8      // gap-2
const STEP_X = BOX_W + GAP

// ── Stable-id tracker ──────────────────────────────────────────────────────
// Backend only sends raw values, no ids. We synthesize stable ids by tracking
// each slot's value across renders within ONE step's array, so React/Framer
// Motion can detect "this same box moved from index A to index B" and slide it.
function useStableArrayKeys(values: (number | string)[]) {
  const prevKeysRef = useRef<string[]>([])

  return useMemo(() => {
    const prevValues = prevKeysRef.current
    const used = new Set<number>()
    const keys: string[] = []

    for (let i = 0; i < values.length; i++) {
      const val = values[i]
      // try to find this value's old slot (closest unused match) to reuse its identity
      let matchIdx = -1
      for (let j = 0; j < prevValues.length; j++) {
        if (used.has(j)) continue
        const [, prevVal] = prevValues[j]?.split('::') ?? []
        if (prevVal === String(val)) {
          matchIdx = j
          break
        }
      }
      if (matchIdx !== -1) {
        used.add(matchIdx)
        keys.push(prevValues[matchIdx])
      } else {
        keys.push(`${i}-${Math.random().toString(36).slice(2, 7)}::${val}`)
      }
    }

    prevKeysRef.current = keys
    return keys
  }, [values.join(',')])
}

// ── Variable / pointer summary cards ─────────────────────────────────────────
function PointerCards({ pointers }: { pointers: Record<string, number> }) {
  const entries = Object.entries(pointers || {})
  if (entries.length === 0) return null

  return (
    <div className="flex gap-3 mb-6 flex-wrap">
      <AnimatePresence mode="popLayout">
        {entries.map(([key, idx]) => (
          <motion.div
            key={key}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 min-w-[80px]"
          >
            <div className="text-[11px] font-mono text-gray-500 mb-1">{key}</div>
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-mono font-semibold text-gray-100"
            >
              {idx}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ── Array renderer with glide-swap + glide-pointer ───────────────────────────
function ArrayRenderer({ step }: { step: VizStep }) {
  const values = step.state ?? []
  const highlights = step.highlights ?? []
  const pointers = step.pointers ?? {}
  const isSwapOp = step.operation === 'swap'

  const keys = useStableArrayKeys(values)

  const pointersByIndex = useMemo(() => {
    const map: Record<number, string[]> = {}
    for (const [name, idx] of Object.entries(pointers)) {
      if (idx == null || idx < 0 || idx >= values.length) continue
      if (!map[idx]) map[idx] = []
      map[idx].push(name)
    }
    return map
  }, [pointers, values.length])

  return (
    <div className="relative pt-2 pb-12">
      <div className="flex gap-2">
        <AnimatePresence initial={false}>
          {values.map((val, idx) => {
            const isHighlighted = highlights.includes(idx)
            const isSwapping = isSwapOp && isHighlighted
            const isPointed = !!pointersByIndex[idx]

            return (
              <motion.div
                key={keys[idx]}
                layout
                initial={false}
                animate={{
                  scale: isSwapping ? 1.1 : 1,
                  y: isSwapping ? -8 : 0,
                }}
                transition={{
                  layout: { type: 'spring', stiffness: 420, damping: 34 },
                  scale: { duration: 0.18, ease: 'easeOut' },
                  y: { duration: 0.18, ease: 'easeOut' },
                }}
                className={`relative w-14 h-14 flex items-center justify-center rounded-lg border text-lg font-mono select-none
                  ${isSwapping
                    ? 'bg-amber-500/25 border-amber-400 text-amber-100 shadow-lg shadow-amber-500/25 z-10'
                    : isHighlighted
                    ? 'bg-blue-500/15 border-blue-400 text-blue-100'
                    : isPointed
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-200'
                    : 'bg-gray-800 border-gray-700 text-gray-200'}
                `}
              >
                {val}
                <span className="absolute -bottom-5 text-[10px] text-gray-500 font-mono">{idx}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Glide pointer labels — one persistent element per pointer name */}
      <div className="absolute left-0 -bottom-1 w-full h-6">
        {Object.entries(pointers).map(([name, idx]) => {
          if (idx == null || idx < 0 || idx >= values.length) return null
          return (
            <motion.div
              key={`pointer-${name}`}
              layoutId={`pointer-${name}`}
              initial={false}
              animate={{ left: idx * STEP_X + BOX_W / 2 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="absolute -translate-x-1/2 text-[11px] font-mono font-semibold text-blue-400 whitespace-nowrap"
              style={{ top: 0 }}
            >
              {name}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── Stack renderer ────────────────────────────────────────────────────────────
function StackRenderer({ step }: { step: VizStep }) {
  const values = step.state ?? []
  const keys = useStableArrayKeys(values)
  return (
    <div className="flex flex-col-reverse gap-2 items-start">
      <AnimatePresence initial={false}>
        {values.map((val, idx) => (
          <motion.div
            key={keys[idx]}
            layout
            initial={{ opacity: 0, x: -16, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className={`min-w-[120px] px-4 py-2.5 rounded-lg border text-sm font-mono
              ${idx === values.length - 1
                ? 'bg-violet-500/15 border-violet-400 text-violet-100'
                : 'bg-gray-800 border-gray-700 text-gray-200'}
            `}
          >
            {val}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ── Queue renderer ───────────────────────────────────────────────────────────
function QueueRenderer({ step }: { step: VizStep }) {
  const values = step.state ?? []
  const keys = useStableArrayKeys(values)
  return (
    <div className="flex gap-2 items-center">
      <AnimatePresence initial={false}>
        {values.map((val, idx) => (
          <motion.div
            key={keys[idx]}
            layout
            initial={{ opacity: 0, x: 16, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -16, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className={`min-w-[56px] h-14 flex items-center justify-center rounded-lg border text-sm font-mono
              ${idx === 0
                ? 'bg-cyan-500/15 border-cyan-400 text-cyan-100'
                : 'bg-gray-800 border-gray-700 text-gray-200'}
            `}
          >
            {val}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ── Linked list renderer ──────────────────────────────────────────────────────
function LinkedListRenderer({ step }: { step: VizStep }) {
  const values = step.state ?? []
  const pointers = step.pointers ?? {}
  const keys = useStableArrayKeys(values)

  const pointersByIndex = useMemo(() => {
    const map: Record<number, string[]> = {}
    for (const [name, idx] of Object.entries(pointers)) {
      if (idx == null) continue
      if (!map[idx]) map[idx] = []
      map[idx].push(name)
    }
    return map
  }, [pointers])

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <AnimatePresence initial={false}>
        {values.map((val, idx) => (
          <motion.div key={keys[idx]} layout className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              {pointersByIndex[idx] && (
                <div className="flex gap-1">
                  {pointersByIndex[idx].map(p => (
                    <span key={p} className="text-[10px] font-mono text-blue-400 font-semibold">{p}</span>
                  ))}
                </div>
              )}
              <motion.div
                layout
                initial={false}
                animate={{ scale: pointersByIndex[idx] ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className={`w-14 h-14 flex items-center justify-center rounded-lg border text-sm font-mono
                  ${pointersByIndex[idx]
                    ? 'bg-blue-500/15 border-blue-400 text-blue-100'
                    : 'bg-gray-800 border-gray-700 text-gray-200'}
                `}
              >
                {val}
              </motion.div>
            </div>
            {idx < values.length - 1 && (
              <span className="text-gray-600 text-lg font-mono mb-6">→</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      {values.length > 0 && (
        <span className="text-gray-600 text-sm font-mono ml-1 mb-6">→ null</span>
      )}
    </div>
  )
}

// ── Renderer dispatch ──────────────────────────────────────────────────────────
function StepRenderer({ step }: { step: VizStep }) {
  switch (step.ds_type) {
    case 'stack':
      return <StackRenderer step={step} />
    case 'queue':
      return <QueueRenderer step={step} />
    case 'linked_list':
      return <LinkedListRenderer step={step} />
    case 'array':
    default:
      return <ArrayRenderer step={step} />
  }
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Visualizer({ steps, current, loading, error }: Props) {
  const step = steps[current]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-gray-400">AI is analyzing your code...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 max-w-md">
          <p className="text-sm font-mono text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  if (!steps.length || !step) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-700">
        <span className="text-3xl">⊞</span>
        <p className="text-sm font-mono">Run your code to see the visualization</p>
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col h-full overflow-auto">
      <PointerCards pointers={step.pointers ?? {}} />

      <div className="flex-1 flex items-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.ds_type}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <StepRenderer step={step} />
          </motion.div>
        </AnimatePresence>
      </div>

      {step.explanation && (
        <div className="mt-4 px-3 py-2 bg-gray-900/60 border border-gray-800 rounded-lg">
          <p className="text-xs font-mono text-gray-400">{step.explanation}</p>
        </div>
      )}
    </div>
  )
}