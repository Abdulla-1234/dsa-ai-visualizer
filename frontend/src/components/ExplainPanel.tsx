import type { Step } from '../types/index'

interface Props { step: Step | null }

export default function ExplainPanel({ step }: Props) {
  if (!step) return null
  return (
    <div className="border-t border-gray-800 bg-gray-900/50 px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="text-violet-400 text-xs font-mono mt-0.5 shrink-0">AI</span>
        <div>
          <p className="text-sm text-gray-200 leading-relaxed">{step.explanation}</p>
          <div className="flex gap-3 mt-1 text-xs font-mono text-gray-600">
            <span>line {step.line}</span>
            <span>·</span>
            <span>{step.operation?.replace(/_/g, ' ')}</span>
            <span>·</span>
            <span>{step.ds_type}</span>
          </div>
        </div>
      </div>
    </div>
  )
}