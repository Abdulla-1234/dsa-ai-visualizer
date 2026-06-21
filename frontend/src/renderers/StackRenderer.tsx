import { motion, AnimatePresence } from 'framer-motion'
import type { Step } from '../types/index'

interface Props { step: Step }

export default function StackRenderer({ step }: Props) {
  const items = Array.isArray(step.state) ? [...step.state].reverse() : []
  const hl = step.highlights ?? []
  const isPush = step.operation?.includes('push')
  const isPop = step.operation?.includes('pop')

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8 bg-gray-950">

      <motion.div
        key={step.operation}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-xs font-mono px-3 py-1 rounded-full border ${
          isPush ? 'text-green-300 border-green-800 bg-green-950/50'
          : isPop ? 'text-red-300 border-red-800 bg-red-950/50'
          : 'text-amber-300 border-amber-800 bg-amber-950/50'
        }`}
      >
        {step.operation?.replace(/_/g, ' ')}
      </motion.div>

      {/* Stack visual */}
      <div className="flex flex-col items-center gap-1 min-w-[140px]">
        {/* Top label */}
        <div className="text-xs font-mono text-gray-500 mb-1">← TOP</div>

        <AnimatePresence>
          {items.map((val: any, i: number) => {
            const origIdx = items.length - 1 - i
            const isTop = i === 0
            const isHL = hl.includes(origIdx)

            return (
              <motion.div
                key={`${origIdx}-${val}`}
                layout
                initial={isPush && isTop ? { opacity: 0, y: -30, scale: 0.8 } : { opacity: 1 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={isPop && isTop ? { opacity: 0, y: -30, scale: 0.8 } : { opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                className={`flex items-center justify-center w-36 h-10 rounded-lg border-2 font-mono font-bold text-sm transition-colors duration-200 ${
                  isTop
                    ? isHL || isPush || isPop
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-violet-500/20 border-violet-400 text-violet-200'
                    : 'bg-gray-800 border-gray-700 text-gray-400'
                }`}
              >
                {String(val)}
                {isTop && <span className="ml-2 text-xs text-gray-600">← top</span>}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="w-36 h-10 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg text-xs font-mono text-gray-600">
            empty
          </div>
        )}

        {/* Bottom label */}
        <div className="text-xs font-mono text-gray-600 mt-1">BOTTOM</div>
      </div>

      {/* Size indicator */}
      <div className="flex items-center gap-2 text-xs font-mono text-gray-600">
        <span>size:</span>
        <span className="text-amber-400">{items.length}</span>
      </div>

      <p className="text-xs text-gray-600 text-center max-w-xs leading-relaxed">
        {step.explanation}
      </p>
    </div>
  )
}