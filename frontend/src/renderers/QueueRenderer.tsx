import { motion, AnimatePresence } from 'framer-motion'
import type { Step } from '../types/index'

interface Props { step: Step }

export default function QueueRenderer({ step }: Props) {
  const items = Array.isArray(step.state) ? step.state : []
  const hl = step.highlights ?? []
  const isEnqueue = step.operation?.includes('enqueue') || step.operation?.includes('push')
  const isDequeue = step.operation?.includes('dequeue') || step.operation?.includes('pop')

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8 bg-gray-950">

      <motion.div
        key={step.operation}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-xs font-mono px-3 py-1 rounded-full border ${
          isEnqueue ? 'text-green-300 border-green-800 bg-green-950/50'
          : isDequeue ? 'text-red-300 border-red-800 bg-red-950/50'
          : 'text-cyan-300 border-cyan-800 bg-cyan-950/50'
        }`}
      >
        {step.operation?.replace(/_/g, ' ')}
      </motion.div>

      {/* Queue flow */}
      <div className="flex items-center gap-0">
        {/* IN arrow */}
        <div className="flex items-center gap-1 mr-3">
          <span className="text-xs font-mono text-green-400">IN</span>
          <div className="flex items-center">
            <div className="w-5 h-px bg-green-600" />
            <div className="w-0 h-0"
              style={{ borderTop:'4px solid transparent', borderBottom:'4px solid transparent', borderLeft:'6px solid #16a34a' }}
            />
          </div>
        </div>

        {/* Queue items */}
        <div className="flex gap-1 border-2 border-gray-700 rounded-xl p-2 min-h-[56px] min-w-[120px] items-center">
          <AnimatePresence>
            {items.map((val: any, i: number) => {
              const isFront = i === 0
              const isBack = i === items.length - 1
              const isHL = hl.includes(i)

              return (
                <motion.div
                  key={`${i}-${val}`}
                  layout
                  initial={isEnqueue && isBack ? { opacity: 0, x: 30 } : {}}
                  animate={{ opacity: 1, x: 0 }}
                  exit={isDequeue && isFront ? { opacity: 0, x: -30 } : { opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`w-12 h-10 flex items-center justify-center rounded-lg border-2 font-mono font-bold text-sm transition-colors duration-200 ${
                    isFront && (isDequeue || isHL)
                      ? 'bg-red-500/20 border-red-400 text-red-200'
                      : isBack && (isEnqueue || isHL)
                      ? 'bg-green-500/20 border-green-400 text-green-200'
                      : 'bg-gray-800 border-gray-700 text-gray-300'
                  }`}>
                    {String(val)}
                  </div>
                  <span className="text-xs font-mono text-gray-700">{i === 0 ? 'front' : i === items.length - 1 ? 'rear' : ''}</span>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="text-xs font-mono text-gray-600 px-4">empty</div>
          )}
        </div>

        {/* OUT arrow */}
        <div className="flex items-center gap-1 ml-3">
          <div className="flex items-center">
            <div className="w-5 h-px bg-red-600" />
            <div className="w-0 h-0"
              style={{ borderTop:'4px solid transparent', borderBottom:'4px solid transparent', borderLeft:'6px solid #dc2626' }}
            />
          </div>
          <span className="text-xs font-mono text-red-400">OUT</span>
        </div>
      </div>

      <div className="flex gap-4 text-xs font-mono text-gray-600">
        <span>size: <span className="text-cyan-400">{items.length}</span></span>
      </div>

      <p className="text-xs text-gray-600 text-center max-w-xs leading-relaxed">
        {step.explanation}
      </p>
    </div>
  )
}