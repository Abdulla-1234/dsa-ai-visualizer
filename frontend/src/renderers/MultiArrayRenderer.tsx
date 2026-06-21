import { motion, AnimatePresence } from 'framer-motion'
import type { Step } from '../types/index'

interface Props { step: Step }

function VarBox({ name, value, active }: { name: string; value: any; active: boolean }) {
  return (
    <motion.div
      layout
      animate={{ scale: active ? 1.06 : 1 }}
      className={`flex flex-col items-center border-2 rounded-xl overflow-hidden transition-colors duration-300 ${
        active ? 'border-blue-400' : 'border-gray-600'
      }`}
    >
      <div className={`px-5 py-1.5 text-sm font-mono border-b-2 w-full text-center ${
        active ? 'text-blue-300 border-blue-700 bg-blue-950/30' : 'text-gray-400 border-gray-700'
      }`}>
        {name}
      </div>
      <div className="px-6 py-4 text-3xl font-bold font-mono text-gray-200">
        {String(value)}
      </div>
    </motion.div>
  )
}

function ArrayDisplay({
  label, items, highlights, totalSlots
}: {
  label: string
  items: any[]
  highlights: number[]
  totalSlots: number
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-mono text-blue-300">{label}</span>
      <div className="flex gap-2">
        {Array.from({ length: totalSlots }).map((_, i) => {
          const filled = i < items.length
          const hl = highlights.includes(i)
          return (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: filled ? 1 : 0.3, y: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 280 }}
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-14 h-14 flex items-center justify-center border-2 rounded-xl font-mono font-bold text-base transition-colors duration-300 ${
                filled
                  ? hl
                    ? 'bg-blue-500/25 border-blue-400 text-white shadow-md shadow-blue-500/20'
                    : 'bg-gray-800 border-gray-500 text-gray-200'
                  : 'bg-gray-900/60 border-gray-800 text-transparent'
              }`}>
                {filled ? String(items[i]) : ''}
              </div>
              <span className="text-xs font-mono text-gray-600">{i}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default function MultiArrayRenderer({ step }: Props) {
  const state = step.state ?? []
  const ptrs = step.pointers ?? {}
  const hl = step.highlights ?? []

  // Separate scalar vars from array
  const scalarEntries = Object.entries(ptrs).filter(([k, v]) =>
    typeof v === 'number' && !k.toLowerCase().includes('size') && !k.toLowerCase().includes('len')
  )

  // Check if state contains nested arrays (multi-array scenario)
  const hasNestedArrays = state.some((s: any) => Array.isArray(s))

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8 bg-gray-950">

      {/* Scalar variable boxes */}
      {scalarEntries.length > 0 && (
        <div className="flex gap-3 flex-wrap justify-center">
          {scalarEntries.map(([name, val]) => (
            <VarBox
              key={name}
              name={name}
              value={val}
              active={hl.includes(val as number)}
            />
          ))}
        </div>
      )}

      {/* Arrays */}
      {hasNestedArrays ? (
        <div className="flex flex-col gap-6">
          {state.map((arr: any, idx: number) => (
            Array.isArray(arr) ? (
              <ArrayDisplay
                key={idx}
                label={`arr[${idx}]`}
                items={arr}
                highlights={hl}
                totalSlots={Math.max(arr.length, 4)}
              />
            ) : null
          ))}
        </div>
      ) : (
        <ArrayDisplay
          label="array"
          items={state}
          highlights={hl}
          totalSlots={Math.max(state.length, 4)}
        />
      )}

      <motion.p
        key={step.explanation}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-gray-400 text-center max-w-sm leading-relaxed"
      >
        {step.explanation}
      </motion.p>
    </div>
  )
}