import { motion, AnimatePresence } from 'framer-motion'
import type { Step } from '../types/index'

interface Props { step: Step }

function getRowKeys(rows: any[]): string[] {
  for (const row of rows) {
    if (row && typeof row === 'object' && !Array.isArray(row)) return Object.keys(row)
  }
  return ['value']
}

function TableBox({
  title, rows, highlightRow, color, delay = 0
}: {
  title: string
  rows: any[]
  highlightRow?: number
  color: string
  delay?: number
}) {
  const keys = getRowKeys(rows)
  const isObj = rows.length > 0 && typeof rows[0] === 'object'

  const colors: Record<string, { header: string; row: string; highlight: string; border: string; title: string }> = {
    blue:   { header: 'bg-blue-900/80',   row: 'bg-gray-900', highlight: 'bg-blue-500/20 border-blue-400', border: 'border-blue-700',   title: 'text-blue-300'   },
    violet: { header: 'bg-violet-900/80', row: 'bg-gray-900', highlight: 'bg-violet-500/20 border-violet-400', border: 'border-violet-700', title: 'text-violet-300' },
    green:  { header: 'bg-green-900/80',  row: 'bg-gray-900', highlight: 'bg-green-500/20 border-green-400', border: 'border-green-700',  title: 'text-green-300'  },
    amber:  { header: 'bg-amber-900/80',  row: 'bg-gray-900', highlight: 'bg-amber-500/20 border-amber-400', border: 'border-amber-700',  title: 'text-amber-300'  },
  }
  const c = colors[color] ?? colors.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 24 }}
      className={`border-2 ${c.border} rounded-xl overflow-hidden shadow-xl min-w-[180px]`}
    >
      {/* Table header bar */}
      <div className={`${c.header} px-3 py-2 flex items-center gap-2`}>
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
        </div>
        <span className={`text-xs font-mono font-bold ${c.title}`}>{title}</span>
      </div>

      {/* Column headers */}
      {isObj && (
        <div className="flex border-b border-gray-700 bg-gray-800/60">
          {keys.map(k => (
            <div key={k} className="flex-1 px-3 py-1.5 text-xs font-mono text-gray-400 uppercase tracking-wide truncate">
              {k}
            </div>
          ))}
        </div>
      )}

      {/* Rows */}
      <div className="flex flex-col">
        <AnimatePresence>
          {rows.slice(0, 6).map((row: any, i: number) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: i * 0.05 }}
              className={`flex border-b border-gray-800 last:border-0 transition-all duration-300 ${
                highlightRow === i
                  ? `${c.highlight} border-l-2`
                  : `${c.row} hover:bg-gray-800/40`
              }`}
            >
              {isObj
                ? keys.map(k => (
                    <div key={k} className={`flex-1 px-3 py-2 text-xs font-mono truncate ${highlightRow === i ? 'text-white' : 'text-gray-400'}`}>
                      {String(row[k] ?? '')}
                    </div>
                  ))
                : (
                  <div className={`flex-1 px-3 py-2 text-xs font-mono ${highlightRow === i ? 'text-white' : 'text-gray-400'}`}>
                    {String(row)}
                  </div>
                )
              }
            </motion.div>
          ))}
        </AnimatePresence>
        {rows.length === 0 && (
          <div className="px-3 py-3 text-xs font-mono text-gray-600 text-center">empty</div>
        )}
      </div>
    </motion.div>
  )
}

function Arrow({ label, direction = 'right' }: { label?: string; direction?: 'right' | 'down' | 'left' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="flex flex-col items-center justify-center gap-1 shrink-0"
    >
      {label && <span className="text-xs font-mono text-blue-400 whitespace-nowrap">{label}</span>}
      <div className="flex items-center gap-0">
        <div className="w-8 h-0.5 bg-blue-500" />
        <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-blue-500" style={{ borderLeftWidth: 8 }} />
      </div>
    </motion.div>
  )
}

export default function TableRenderer({ step }: Props) {
  const rows = Array.isArray(step.state) ? step.state : []
  const highlightIdx = step.highlights?.[0] ?? -1
  const op = step.operation ?? ''

  // Detect operation type for layout
  const isJoin = op.includes('join')
  const isGroup = op.includes('group') || op.includes('count')
  const isFilter = op.includes('filter') || op.includes('scan') || op.includes('rejected')
  const isIndex = op.includes('index') || op.includes('lookup')

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 p-6 overflow-auto">

      {/* Operation badge */}
      <div className="flex items-center gap-2">
        <div className="text-xs font-mono text-blue-400 border border-blue-800 bg-blue-950/50 px-3 py-1 rounded-full">
          {op.replace(/_/g, ' ')}
        </div>
        {step.pointers && Object.entries(step.pointers).slice(0, 2).map(([k, v]) => (
          <div key={k} className="text-xs font-mono text-gray-500 bg-gray-900 border border-gray-700 px-2 py-1 rounded-full">
            {k} = <span className="text-blue-400">{String(v)}</span>
          </div>
        ))}
      </div>

      {/* JOIN layout — two tables with arrow to result */}
      {isJoin && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <TableBox title="left table" rows={rows.slice(0, 3)} color="blue" highlightRow={highlightIdx} />
          <Arrow label="JOIN" />
          <TableBox title="right table" rows={rows.slice(0, 2)} color="violet" delay={0.1} />
          <Arrow label="→" />
          <TableBox title="result" rows={rows} highlightRow={highlightIdx} color="green" delay={0.2} />
        </div>
      )}

      {/* GROUP BY layout — input flowing into groups */}
      {isGroup && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <TableBox title="input rows" rows={rows} color="blue" />
          <Arrow label="GROUP BY" />
          <TableBox title="aggregated" rows={rows} highlightRow={highlightIdx} color="amber" delay={0.15} />
        </div>
      )}

      {/* INDEX SEARCH layout — show index array */}
      {isIndex && (
        <div className="flex flex-col items-center gap-4">
          <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">Index (sorted)</div>
          <div className="flex gap-2 flex-wrap justify-center">
            {rows.map((val: any, i: number) => (
              <motion.div
                key={i}
                layout
                animate={{ scale: step.highlights?.includes(i) ? 1.2 : 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg border-2 font-mono text-sm ${
                  step.highlights?.includes(i)
                    ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                    : 'bg-gray-800 border-gray-700 text-gray-400'
                }`}
              >
                <span className="text-xs font-bold">{String(val)}</span>
                <span className="text-xs text-gray-600">{i}</span>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-3 text-xs font-mono mt-1">
            {Object.entries(step.pointers ?? {}).map(([k, v]) => (
              <span key={k}>
                <span className="text-blue-400">{k}</span>
                <span className="text-gray-600">=</span>
                <span className="text-gray-300">{String(v)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* FILTER / default layout — single result table */}
      {!isJoin && !isGroup && !isIndex && (
        <div className="flex items-start gap-4 flex-wrap justify-center">
          <TableBox
            title="result set"
            rows={rows}
            highlightRow={highlightIdx}
            color="blue"
          />
          {rows.length > 0 && (
            <div className="flex flex-col gap-1 pt-8">
              <div className="text-xs font-mono text-gray-500">rows matched</div>
              <div className="text-3xl font-bold font-mono text-blue-400">{rows.length}</div>
            </div>
          )}
        </div>
      )}

      {/* Explanation */}
      <p className="text-xs text-gray-500 text-center max-w-md leading-relaxed border border-gray-800 bg-gray-900/50 rounded-lg px-4 py-2">
        {step.explanation}
      </p>
    </div>
  )
}