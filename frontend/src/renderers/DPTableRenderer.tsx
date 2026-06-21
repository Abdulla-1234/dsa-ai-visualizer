import { motion } from 'framer-motion'
import type { Step } from '../types/index'

interface Props { step: Step }

export default function DPTableRenderer({ step }: Props) {
  const state = Array.isArray(step.state) ? step.state : []
  const isInfinity = (v: any) => v === null || v === undefined || v === 1e308 || v === Infinity || v > 1e100

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
      <div className="text-xs font-mono text-amber-400 border border-amber-800 bg-amber-950/50 px-3 py-1 rounded-full">
        {step.operation?.replace(/_/g, ' ')}
      </div>

      {/* DP table */}
      <div className="flex flex-col gap-1">
        {/* Index row */}
        <div className="flex gap-1 mb-1">
          <div className="w-8 shrink-0" />
          {state.map((_: any, i: number) => (
            <div key={i} className="w-12 text-center text-xs font-mono text-gray-600">{i}</div>
          ))}
        </div>
        {/* Values row */}
        <div className="flex gap-1 items-center">
          <div className="w-8 shrink-0 text-xs font-mono text-gray-600 text-right pr-1">dp</div>
          {state.map((val: any, i: number) => {
            const isHighlighted = step.highlights?.includes(i)
            const isPointer = Object.values(step.pointers || {}).includes(i)
            const isEmpty = isInfinity(val)
            return (
              <motion.div
                key={i}
                layout
                animate={{
                  scale: isHighlighted ? 1.15 : 1,
                  y: isHighlighted ? -4 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-mono font-bold text-sm transition-all duration-300 ${
                  isHighlighted
                    ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                    : isPointer
                    ? 'bg-violet-500/20 border-violet-400 text-violet-300'
                    : isEmpty
                    ? 'bg-gray-900 border-gray-700 text-gray-700'
                    : 'bg-gray-800 border-gray-600 text-gray-300'
                }`}
              >
                {isEmpty ? '∞' : String(val)}
              </motion.div>
            )
          })}
        </div>
        {/* Pointer labels */}
        <div className="flex gap-1 mt-1">
          <div className="w-8 shrink-0" />
          {state.map((_: any, i: number) => {
            const ptrs = Object.entries(step.pointers || {}).filter(([, v]) => v === i).map(([k]) => k)
            return (
              <div key={i} className="w-12 text-center">
                {ptrs.map(p => (
                  <span key={p} className="text-xs font-mono text-amber-400 block">{p}</span>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Formula hint */}
      <div className="text-xs font-mono text-gray-600 text-center">
        {step.operation?.includes('fill') && 'dp[i] computed from previous values'}
      </div>
    </div>
  )
}