import { motion } from 'framer-motion'
import { useMemo } from 'react'
import type { Step } from '../types/index'

interface Props { step: Step }

interface TNode { val: any; id: number; left?: TNode; right?: TNode }
interface Pos { node: TNode; x: number; y: number; px?: number; py?: number }

function buildTree(arr: any[]): TNode | null {
  if (!arr?.length || arr[0] == null) return null
  const nodes: (TNode | null)[] = arr.map((v, i) =>
    v != null ? { val: v, id: i } : null
  )
  nodes.forEach((n, i) => {
    if (!n) return
    const l = 2 * i + 1, r = 2 * i + 2
    if (l < nodes.length && nodes[l]) n.left = nodes[l]!
    if (r < nodes.length && nodes[r]) n.right = nodes[r]!
  })
  return nodes[0]
}

function layout(node: TNode | null, x: number, y: number, gap: number, out: Pos[], px?: number, py?: number) {
  if (!node) return
  out.push({ node, x, y, px, py })
  layout(node.left ?? null, x - gap, y + 70, gap / 2, out, x, y)
  layout(node.right ?? null, x + gap, y + 70, gap / 2, out, x, y)
}

export default function TreeRenderer({ step }: Props) {
  const state = step.state ?? []
  const hl = step.highlights ?? []
  const ptrs = step.pointers ?? {}
  const currentId = typeof ptrs['current'] === 'number' ? ptrs['current'] : -1

  // Detect if this is traversal (visited list) or BST (level-order)
  const isTraversal = state.length > 0 && state.every((v: any) => typeof v !== 'object')
  const isBST = !isTraversal

  // For traversal: build tree from pointers or keep previous
  // For BST: state IS the level-order array
  const treeArray = isBST ? state : state

  const positions = useMemo<Pos[]>(() => {
    const root = buildTree(treeArray)
    const out: Pos[] = []
    if (root) layout(root, 200, 36, 90, out)
    return out
  }, [JSON.stringify(treeArray)])

  const svgH = positions.length > 0
    ? Math.max(...positions.map(p => p.y)) + 50
    : 120

  const visitedList = isTraversal ? state as any[] : []

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-6 bg-gray-950">

      {/* Operation badge */}
      <motion.div
        key={step.operation}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs font-mono text-green-300 border border-green-800 bg-green-950/50 px-3 py-1 rounded-full shrink-0"
      >
        {step.operation?.replace(/_/g, ' ')}
      </motion.div>

      {/* Tree — stays visible, just updates node colors */}
      <div className="flex-1 flex items-center justify-center w-full">
        <svg
          width={400}
          height={svgH}
          viewBox={`0 0 400 ${svgH}`}
          className="overflow-visible"
        >
          {/* Edges */}
          {positions.map(({ node, x, y, px, py }) =>
            px !== undefined ? (
              <line
                key={`e-${node.id}`}
                x1={px} y1={py}
                x2={x} y2={y}
                stroke="#374151"
                strokeWidth="1.5"
              />
            ) : null
          )}

          {/* Nodes — no enter/exit animation, just color changes */}
          {positions.map(({ node, x, y }) => {
            const isHL = hl.includes(node.id)
            const isCurrent = node.id === currentId
            const isVisited = visitedList.includes(node.val)

            const fill = isCurrent
              ? '#7c3aed44' : isVisited
              ? '#16a34a33' : isHL
              ? '#1d4ed833' : '#1f2937'

            const stroke = isCurrent
              ? '#7c3aed' : isVisited
              ? '#16a34a' : isHL
              ? '#3b82f6' : '#4b5563'

            const textFill = isCurrent
              ? '#c4b5fd' : isVisited
              ? '#4ade80' : isHL
              ? '#93c5fd' : '#9ca3af'

            return (
              <g key={`n-${node.id}`}>
                {/* Glow ring for current */}
                {isCurrent && (
                  <motion.circle
                    cx={x} cy={y} r={26}
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="1.5"
                    strokeOpacity={0.4}
                    animate={{ r: [24, 28, 24] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                )}
                <motion.circle
                  cx={x} cy={y} r={20}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isCurrent ? 2.5 : 1.5}
                  animate={{ fill, stroke }}
                  transition={{ duration: 0.3 }}
                />
                <text
                  x={x} y={y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill={textFill}
                >
                  {String(node.val)}
                </text>
                {/* Pointer labels */}
                {isCurrent && (
                  <text x={x} y={y - 27} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#a78bfa">
                    curr
                  </text>
                )}
                {Object.entries(ptrs)
                  .filter(([k, v]) => k !== 'current' && v === node.id)
                  .map(([k]) => (
                    <text key={k} x={x + 24} y={y - 10} fontSize="8" fontFamily="monospace" fill="#60a5fa">
                      {k}
                    </text>
                  ))}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Traversal visited list */}
      {visitedList.length > 0 && (
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="text-xs font-mono text-gray-600 uppercase tracking-widest">Visited</div>
          <div className="flex gap-1.5 flex-wrap justify-center">
            {visitedList.map((v: any, i: number) => (
              <motion.div
                key={`${i}-${v}`}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border font-mono text-xs font-bold ${
                  i === visitedList.length - 1
                    ? 'bg-green-500/20 border-green-500 text-green-300'
                    : 'bg-gray-800 border-gray-700 text-gray-400'
                }`}
              >
                {String(v)}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-600 text-center max-w-sm leading-relaxed shrink-0">
        {step.explanation}
      </p>
    </div>
  )
}