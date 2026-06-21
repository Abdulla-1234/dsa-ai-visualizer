import { motion, AnimatePresence } from 'framer-motion'
import type { Step } from '../types/index'

interface Props { step: Step }

export default function HashmapRenderer({ step }: Props) {
  const raw = step.state ?? []
  const entries: { key: string; value?: string; highlighted: boolean }[] = raw.map((item: any, i: number) => ({
    key: typeof item === 'object' && item !== null ? String(item.key ?? JSON.stringify(item)) : String(item),
    value: typeof item === 'object' && item !== null && item.value !== undefined ? String(item.value) : undefined,
    highlighted: step.highlights?.includes(i) ?? false,
  }))

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <div className="text-xs font-mono text-pink-400 border border-pink-800 bg-pink-950/50 px-3 py-1 rounded-full">
        {step.operation?.replace(/_/g, ' ') ?? 'operation'}
      </div>

      <div className="w-full max-w-md flex flex-col gap-2">
        {entries.length === 0 && (
          <div className="text-center text-gray-600 text-sm font-mono py-8">empty cache</div>
        )}
        <AnimatePresence>
          {entries.map(({ key, value, highlighted }, i) => (
            <motion.div
              key={`${key}-${i}`}
              layout
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28, delay: i * 0.04 }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 border-2 transition-all duration-300 ${
                highlighted
                  ? 'bg-pink-500/20 border-pink-400'
                  : 'bg-gray-800/60 border-gray-700'
              }`}
            >
              <span className="text-xs font-mono text-gray-600 w-6 text-right shrink-0">{i}</span>
              <div className="w-px h-5 bg-gray-700 shrink-0" />
              <span className={`text-sm font-mono font-bold flex-1 ${highlighted ? 'text-pink-300' : 'text-gray-300'}`}>
                {key}
              </span>
              {value !== undefined && (
                <>
                  <span className="text-gray-600 text-xs font-mono">→</span>
                  <span className={`text-sm font-mono ${highlighted ? 'text-pink-200' : 'text-gray-400'}`}>{value}</span>
                </>
              )}
              {highlighted && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ml-auto text-xs text-pink-400 font-mono bg-pink-950/60 px-2 py-0.5 rounded-full shrink-0"
                >
                  {step.operation?.replace(/_/g, ' ')}
                </motion.span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {Object.keys(step.pointers ?? {}).length > 0 && (
        <div className="flex gap-4 text-xs font-mono flex-wrap justify-center">
          {Object.entries(step.pointers ?? {}).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1">
              <span className="text-pink-400">{k}</span>
              <span className="text-gray-600">=</span>
              <span className="text-gray-300">{String(v)}</span>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 text-center max-w-sm leading-relaxed">{step.explanation}</p>
    </div>
  )
}