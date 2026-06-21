import type { Step } from '../types/index'

interface Props {
  steps: Step[]
  current: number
  playing: boolean
  speed: number
  onNext: () => void
  onPrev: () => void
  onReset: () => void
  onPlayPause: () => void
  onSpeedChange: (s: number) => void
}

export default function StepControls({
  steps, current, playing, speed,
  onNext, onPrev, onReset, onPlayPause, onSpeedChange
}: Props) {
  const progress = steps.length > 0 ? ((current + 1) / steps.length) * 100 : 0

  return (
    <div className="border-t border-gray-800 bg-gray-900 px-4 py-3">
      <div className="w-full bg-gray-800 rounded-full h-1 mb-3">
        <div
          className="bg-violet-500 h-1 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onReset} className="text-gray-400 hover:text-white transition-colors">⏮</button>
        <button onClick={onPrev} className="text-gray-400 hover:text-white transition-colors">◀</button>
        <button
          onClick={onPlayPause}
          className="bg-violet-600 hover:bg-violet-500 text-white w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors"
        >
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={onNext} className="text-gray-400 hover:text-white transition-colors">▶</button>
        <span className="text-xs font-mono text-gray-400 ml-1">
          Step <span className="text-white">{current + 1}</span> / {steps.length}
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-500 font-mono">Speed</span>
          {[0.5, 1, 2, 3].map(s => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`text-xs font-mono px-2 py-0.5 rounded transition-colors ${
                speed === s ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}