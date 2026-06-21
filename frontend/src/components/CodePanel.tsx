import { motion, AnimatePresence } from 'framer-motion'
import type { Step } from '../types/index'

interface Props {
  code: string
  currentStep: Step | null
  onRun: () => void
  loading: boolean
  btnColor?: string
  label?: string
}

export default function CodePanel({ code, currentStep, onRun, loading, btnColor = 'bg-violet-600 hover:bg-violet-500', label = 'example.py' }: Props) {
  const activeLine = currentStep?.line ?? -1
  const lines = code.split('\n')

  return (
    <div className="flex flex-col w-full h-full bg-gray-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-900 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-mono text-gray-500">{label}</span>
        </div>
        <button
          onClick={onRun}
          disabled={loading}
          className={`flex items-center gap-1.5 ${btnColor} disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors`}
        >
          {loading ? '⟳ Analyzing...' : '▶ Run'}
        </button>
      </div>

      {/* Code with line highlighting */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-7">
        {lines.map((line, i) => {
          const lineNum = i + 1
          const isActive = activeLine === lineNum
          return (
            <motion.div
              key={i}
              animate={{
                backgroundColor: isActive ? 'rgba(124,92,252,0.15)' : 'transparent',
              }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 px-2 -mx-2 rounded relative ${isActive ? 'shadow-sm' : ''}`}
            >
              {/* Active line indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeLine"
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`select-none w-6 text-right shrink-0 text-xs mt-0.5 transition-colors ${isActive ? 'text-violet-400' : 'text-gray-700'}`}>
                {lineNum}
              </span>
              <span className={`transition-colors whitespace-pre ${isActive ? 'text-white' : 'text-gray-300'}`}>
                {line || ' '}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Current step info bar */}
      {currentStep && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-gray-800 bg-gray-900 px-4 py-2 flex items-center gap-3 shrink-0"
        >
          <span className="text-xs font-mono text-violet-400">line {activeLine}</span>
          <span className="text-gray-700">·</span>
          <span className="text-xs font-mono text-gray-500">{currentStep.operation?.replace(/_/g, ' ')}</span>
          <span className="text-gray-700">·</span>
          <span className="text-xs font-mono text-gray-400">{currentStep.ds_type}</span>
        </motion.div>
      )}
    </div>
  )
}