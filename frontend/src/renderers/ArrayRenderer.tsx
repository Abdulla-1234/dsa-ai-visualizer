import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { Step } from '../types/index'

interface Props { step: Step }

function isScalar(v: any) {
  return typeof v === 'number' || typeof v === 'string'
}

// Clean variable card — shows single scalar value
function VarCard({ name, value, active }: { name: string; value: any; active: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center rounded-xl border-2 overflow-hidden min-w-[64px] transition-all duration-200 ${
        active ? 'border-blue-500 shadow-md shadow-blue-500/20' : 'border-gray-700'
      }`}
    >
      <div className={`w-full text-center px-3 py-1 text-xs font-mono border-b ${
        active ? 'text-blue-300 border-blue-800 bg-blue-950/40' : 'text-gray-500 border-gray-700 bg-gray-800/40'
      }`}>
        {name}
      </div>
      <div className={`px-4 py-3 text-2xl font-bold font-mono ${active ? 'text-white' : 'text-gray-300'}`}>
        {String(value)}
      </div>
    </motion.div>
  )
}

// Single array node
function ArrayNode({
  val, idx, highlighted, isSwap, isSorted, pointerNames, swapping
}: {
  val: any; idx: number; highlighted: boolean
  isSwap: boolean; isSorted: boolean; pointerNames: string[]; swapping: boolean
}) {
  return (
    <motion.div
      layout
      className="flex flex-col items-center gap-1"
    >
      {/* Pointer label above */}
      <div className="h-4 flex items-center justify-center gap-0.5">
        <AnimatePresence>
          {pointerNames.map(p => (
            <motion.span
              key={p}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs font-mono text-blue-400 leading-none"
            >
              {p}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Box */}
      <motion.div
        animate={
          swapping
            ? { y: [-20, 20, -10, 0], scale: [1, 1.15, 1.1, 1] }
            : highlighted
            ? { scale: 1.08 }
            : { scale: 1, y: 0 }
        }
        transition={
          swapping
            ? { duration: 0.5, ease: 'easeInOut' }
            : { type: 'spring', stiffness: 320, damping: 26 }
        }
        className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 font-mono font-bold text-sm transition-colors duration-200 ${
          isSorted && highlighted
            ? 'bg-green-500/20 border-green-400 text-green-200'
            : swapping
            ? 'bg-red-500/20 border-red-400 text-red-100 shadow-lg shadow-red-500/30'
            : highlighted
            ? 'bg-blue-500/20 border-blue-400 text-white'
            : 'bg-gray-800 border-gray-700 text-gray-300'
        }`}
      >
        {val === null || val === undefined ? '∅' : String(val)}
      </motion.div>

      {/* Index below */}
      <span className="text-xs font-mono text-gray-700">{idx}</span>
    </motion.div>
  )
}

export default function ArrayRenderer({ step }: Props) {
  const state = Array.isArray(step.state) ? step.state : []
  const ptrs = step.pointers ?? {}
  const hl = step.highlights ?? []
  const isSwap = !!(step.operation?.includes('swap'))
  const isSorted = !!(step.operation?.includes('sort') || step.operation?.includes('complete') || step.operation?.includes('done'))

  // Separate scalars (loop vars, accumulators) from array indices
  const scalarVars: [string, number][] = Object.entries(ptrs).filter(
    ([, v]) => typeof v === 'number' && (v < 0 || v >= state.length || !Number.isInteger(v as number))
  ) as [string, number][]

  const indexVars: [string, number][] = Object.entries(ptrs).filter(
    ([, v]) => typeof v === 'number' && Number.isInteger(v as number) && (v as number) >= 0 && (v as number) < state.length
  ) as [string, number][]

  // For swap: which two indices are swapping
  const swapIndices = isSwap && hl.length >= 2 ? [hl[0], hl[1]] : []

  // Chunk array into rows of max 8
  const chunkSize = 8
  const rows: any[][] = []
  for (let i = 0; i < state.length; i += chunkSize) {
    rows.push(state.slice(i, i + chunkSize))
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-6 bg-gray-950">

      {/* Operation badge */}
      <motion.div
        key={step.operation + step.step}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-xs font-mono px-3 py-1 rounded-full border ${
          isSwap
            ? 'text-red-300 border-red-800 bg-red-950/50'
            : isSorted
            ? 'text-green-300 border-green-800 bg-green-950/50'
            : 'text-violet-300 border-violet-800 bg-violet-950/50'
        }`}
      >
        {step.operation?.replace(/_/g, ' ')}
      </motion.div>

      {/* Scalar variable cards — only show if there are real scalars */}
      {scalarVars.length > 0 && (
        <div className="flex gap-3 flex-wrap justify-center">
          {scalarVars.map(([name, val]) => (
            <VarCard key={name} name={name} value={val} active={hl.includes(val)} />
          ))}
        </div>
      )}

      {/* Array rows */}
      <div className="flex flex-col gap-4 items-center">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-2 justify-center flex-wrap">
            {row.map((val, colIdx) => {
              const globalIdx = rowIdx * chunkSize + colIdx
              const isHl = hl.includes(globalIdx)
              const isSwapping = swapIndices.includes(globalIdx)
              const ptrNames = indexVars.filter(([, v]) => v === globalIdx).map(([k]) => k)
              return (
                <ArrayNode
                  key={globalIdx}
                  val={val}
                  idx={globalIdx}
                  highlighted={isHl}
                  isSwap={isSwap}
                  isSorted={isSorted}
                  pointerNames={ptrNames}
                  swapping={isSwapping}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs font-mono text-gray-600 flex-wrap justify-center">
        {[
          { cls: 'bg-blue-500/30 border-blue-500',   label: 'active'    },
          { cls: 'bg-red-500/30 border-red-400',     label: 'swapping'  },
          { cls: 'bg-green-500/30 border-green-400', label: 'sorted'    },
        ].map(({ cls, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded border ${cls} inline-block`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}