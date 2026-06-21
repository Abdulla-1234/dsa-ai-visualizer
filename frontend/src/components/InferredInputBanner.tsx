// frontend/src/components/InferredInputBanner.tsx
import { motion } from 'framer-motion'

interface Props {
  inputSource: 'user' | 'inferred'
  inferredInputNote: string | null
  visible: boolean
}

export default function InferredInputBanner({ inputSource, inferredInputNote, visible }: Props) {
  if (!visible || inputSource !== 'inferred' || !inferredInputNote) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-3 mt-3 mb-1 px-3 py-2.5 bg-blue-500/10 border bg-blue-500/30 rounded-lg flex items-start gap-2.5 shrink-0"
    >
      <span className="text-amber-400 text-sm shrink-0 mt-0.5">⚠</span>
      <p className="text-xs font-mono text-amber-200 leading-relaxed">
        <span className="font-semibold">No input detected in your code.</span>{' '}
        {inferredInputNote}
      </p>
    </motion.div>
  )
}