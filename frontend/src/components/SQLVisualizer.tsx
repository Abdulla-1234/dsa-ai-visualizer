import { motion } from 'framer-motion'

interface Props {
  step: any
  schema: Record<string, { columns: any[]; data: any[] }>
  sql: string
}

function MiniTable({
  title, columns, data, highlightIds, highlightCol, color
}: {
  title: string
  columns: string[]
  data: any[]
  highlightIds?: number[]
  highlightCol?: string
  color: 'blue' | 'violet' | 'green' | 'amber'
}) {
  const colors = {
    blue:   { header: 'text-blue-400',   border: 'border-blue-700',   hl: 'bg-blue-500/15 text-blue-200',   title: 'bg-blue-950/60 border-blue-800' },
    violet: { header: 'text-violet-400', border: 'border-violet-700', hl: 'bg-violet-500/15 text-violet-200', title: 'bg-violet-950/60 border-violet-800' },
    green:  { header: 'text-green-400',  border: 'border-green-700',  hl: 'bg-green-500/15 text-green-200',  title: 'bg-green-950/60 border-green-800' },
    amber:  { header: 'text-amber-400',  border: 'border-amber-700',  hl: 'bg-amber-500/15 text-amber-200',  title: 'bg-amber-950/60 border-amber-800' },
  }
  const c = colors[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 ${c.border} rounded-xl overflow-hidden`}
    >
      <div className={`px-3 py-1.5 border-b ${c.title} ${c.header}`}>
        <span className="text-xs font-mono font-semibold">Table: {title}</span>
      </div>
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-800/60">
            {columns.map(col => (
              <th key={col} className={`px-2 py-1.5 text-left font-medium ${
                col === highlightCol ? c.header : 'text-gray-500'
              }`}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 5).map((row, i) => {
            const isHL = highlightIds?.includes(i)
            return (
              <motion.tr
                key={i}
                layout
                animate={{ backgroundColor: isHL ? 'rgba(59,130,246,0.1)' : 'transparent' }}
                className={`border-b border-gray-800 last:border-0 transition-colors ${isHL ? c.hl : 'text-gray-400'}`}
              >
                {columns.map(col => (
                  <td key={col} className={`px-2 py-1.5 ${
                    isHL && col === highlightCol ? `font-bold ${c.header} underline` : ''
                  }`}>
                    {String(row[col] ?? '')}
                  </td>
                ))}
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </motion.div>
  )
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-2">
      <span className="text-xs font-mono text-blue-400">{label}</span>
      <div className="flex flex-col items-center">
        <div className="w-px h-6 bg-blue-500" />
        <div className="w-0 h-0"
          style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '7px solid #3b82f6' }}
        />
      </div>
    </div>
  )
}

export default function SQLVisualizer({ step, schema, sql }: Props) {
  const sqlUpper = sql.toUpperCase()
  const isJoin = sqlUpper.includes('JOIN')
  const isGroup = sqlUpper.includes('GROUP BY')
  const isFilter = sqlUpper.includes('WHERE') && !isJoin
  const isOrder = sqlUpper.includes('ORDER BY') && !isJoin

  const state = Array.isArray(step?.state) ? step.state : []
  const highlights = step?.highlights ?? []

  // Detect tables involved
  const tables = Object.keys(schema).filter(t => sqlUpper.includes(t.toUpperCase()))
  const leftTable = tables[0] ?? 'Customers'
  const rightTable = tables[1] ?? 'Orders'

  const leftData = schema[leftTable]?.data ?? []
  const rightData = schema[rightTable]?.data ?? []
  const leftCols = schema[leftTable]?.columns.slice(0, 3).map(c => c.name) ?? []
  const rightCols = schema[rightTable]?.columns.slice(0, 3).map(c => c.name) ?? []
  const resultCols = state.length > 0 && typeof state[0] === 'object'
    ? Object.keys(state[0])
    : []

  // Find join column
  const joinMatch = sql.match(/ON\s+\w+\.(\w+)\s*=\s*\w+\.(\w+)/i)
  const leftJoinCol  = joinMatch?.[1]
  const rightJoinCol = joinMatch?.[2]

  // Which left rows are highlighted in result
  const resultVals = state.filter((_: any, i: number) => highlights.includes(i))
    .map((r: any) => r[leftJoinCol ?? ''] ?? r[rightJoinCol ?? ''])
  const leftHL = leftData.map((r, i) =>
    resultVals.includes(r[leftJoinCol ?? '']) ? i : -1).filter(i => i >= 0)
  const rightHL = rightData.map((r, i) =>
    resultVals.includes(r[rightJoinCol ?? '']) ? i : -1).filter(i => i >= 0)

  if (isJoin) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <MiniTable title={leftTable}  columns={leftCols}  data={leftData}  highlightIds={leftHL}  highlightCol={leftJoinCol}  color="blue" />
          <MiniTable title={rightTable} columns={rightCols} data={rightData} highlightIds={rightHL} highlightCol={rightJoinCol} color="violet" />
        </div>
        <Arrow label="JOIN result" />
        {state.length > 0 && resultCols.length > 0 && (
          <MiniTable title="Result" columns={resultCols} data={state} highlightIds={highlights} color="green" />
        )}
      </div>
    )
  }

  if (isFilter || isGroup || isOrder) {
    return (
      <div className="flex flex-col gap-2">
        <MiniTable title={leftTable} columns={leftCols.slice(0, 3)} data={leftData} color="blue" />
        <Arrow label={isGroup ? 'GROUP BY' : isFilter ? 'WHERE filter' : 'ORDER BY'} />
        {state.length > 0 && resultCols.length > 0 && (
          <MiniTable title="Result" columns={resultCols} data={state} highlightIds={highlights} color="green" />
        )}
      </div>
    )
  }

  // Plain SELECT
  return (
    <div className="flex flex-col gap-2">
      {state.length > 0 && resultCols.length > 0 && (
        <MiniTable title="Result" columns={resultCols} data={state} highlightIds={highlights} color="blue" />
      )}
    </div>
  )
}