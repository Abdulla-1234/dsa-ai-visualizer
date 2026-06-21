import { motion, AnimatePresence } from 'framer-motion'
import type { Step } from '../types/index'

interface Props { step: Step }

export default function LinkedListRenderer({ step }: Props) {
  const state = Array.isArray(step.state) ? step.state : []
  const hl = step.highlights ?? []
  const ptrs = step.pointers ?? {}

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8 bg-gray-950">

      <motion.div
        key={step.operation}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs font-mono text-blue-300 border border-blue-800 bg-blue-950/50 px-3 py-1 rounded-full"
      >
        {step.operation?.replace(/_/g, ' ')}
      </motion.div>

      {/* Linked chain — horizontal */}
      <div className="flex items-center gap-0 flex-wrap justify-center">
        <AnimatePresence>
          {state.map((val: any, i: number) => {
            const isHL = hl.includes(i)
            const ptrNames = Object.entries(ptrs)
              .filter(([, v]) => v === i)
              .map(([k]) => k)

            return (
              <motion.div
                key={`${i}-${val}`}
                layout
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7, x: -20 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="flex items-center"
              >
                {/* Node */}
                <div className="flex flex-col items-center gap-1">
                  {/* Pointer label */}
                  <div className="h-4 flex items-center justify-center gap-0.5">
                    {ptrNames.map(p => (
                      <span key={p} className="text-xs font-mono text-cyan-400">{p}</span>
                    ))}
                  </div>
                  {/* Box — two-part: val | next */}
                  <motion.div
                    animate={{ scale: isHL ? 1.1 : 1 }}
                    className={`flex border-2 rounded-lg overflow-hidden transition-colors duration-200 ${
                      isHL ? 'border-cyan-400' : 'border-gray-600'
                    }`}
                  >
                    {/* Value part */}
                    <div className={`px-4 py-2.5 font-mono font-bold text-sm border-r ${
                      isHL ? 'bg-cyan-500/20 border-cyan-700 text-cyan-200' : 'bg-gray-800 border-gray-600 text-gray-300'
                    }`}>
                      {String(val)}
                    </div>
                    {/* Next pointer part */}
                    <div className={`px-2 py-2.5 flex items-center ${
                      isHL ? 'bg-cyan-950/40' : 'bg-gray-900'
                    }`}>
                      <span className={`text-xs font-mono ${isHL ? 'text-cyan-500' : 'text-gray-600'}`}>
                        {i < state.length - 1 ? '→' : '∅'}
                      </span>
                    </div>
                  </motion.div>
                  <span className="text-xs font-mono text-gray-700">{i}</span>
                </div>

                {/* Arrow between nodes */}
                {i < state.length - 1 && (
                  <div className="flex items-center px-1 pb-5">
                    <div className="w-4 h-px bg-gray-600" />
                    <div className="w-0 h-0"
                      style={{
                        borderTop: '4px solid transparent',
                        borderBottom: '4px solid transparent',
                        borderLeft: '6px solid #4b5563',
                      }}
                    />
                  </div>
                )}
              </motion.div>
            )
          })}

          {/* Null terminator */}
          <motion.div
            layout
            className="flex items-center pl-1 pb-5"
          >
            <div className="w-4 h-px bg-gray-700" />
            <span className="text-xs font-mono text-gray-600 ml-1">null</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-xs text-gray-600 text-center max-w-sm leading-relaxed">
        {step.explanation}
      </p>
    </div>
  )
}