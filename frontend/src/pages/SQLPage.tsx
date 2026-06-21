import { useNavigate } from 'react-router-dom'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import Navbar from '../components/Navbar'

interface Props { dark: boolean; setDark: (v: boolean) => void }

function useDrag(initial: number, min: number, max: number) {
  const [size, setSize] = useState(initial)
  const dragging = useRef(false)
  const onMouseDown = useCallback(() => {
    dragging.current = true
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setSize(prev => Math.min(max, Math.max(min, prev + e.movementX)))
    }
    const onUp = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [min, max])
  return { size, onMouseDown }
}

// ─── SCHEMA ───────────────────────────────────────────────────────────────────
const SCHEMA: Record<string, { columns: { name: string; type: string; pk?: boolean; fk?: boolean }[]; data: Record<string, any>[] }> = {
  Customers: {
    columns: [
      { name: 'customer_id', type: 'int',          pk: true },
      { name: 'first_name',  type: 'varchar(100)' },
      { name: 'last_name',   type: 'varchar(100)' },
      { name: 'age',         type: 'int' },
      { name: 'country',     type: 'varchar(100)' },
    ],
    data: [
      { customer_id: 1, first_name: 'John',   last_name: 'Doe',       age: 31, country: 'USA' },
      { customer_id: 2, first_name: 'Robert', last_name: 'Luna',      age: 22, country: 'USA' },
      { customer_id: 3, first_name: 'David',  last_name: 'Robinson',  age: 22, country: 'UK'  },
      { customer_id: 4, first_name: 'John',   last_name: 'Reinhardt', age: 25, country: 'UK'  },
      { customer_id: 5, first_name: 'Betty',  last_name: 'Doe',       age: 28, country: 'UAE' },
    ],
  },
  Orders: {
    columns: [
      { name: 'order_id',    type: 'integer', pk: true },
      { name: 'item',        type: 'varchar(100)' },
      { name: 'amount',      type: 'integer' },
      { name: 'customer_id', type: 'integer', fk: true },
    ],
    data: [
      { order_id: 1, item: 'Keyboard', amount: 400,   customer_id: 4 },
      { order_id: 2, item: 'Mouse',    amount: 300,   customer_id: 4 },
      { order_id: 3, item: 'Monitor',  amount: 12000, customer_id: 3 },
      { order_id: 4, item: 'Keyboard', amount: 400,   customer_id: 1 },
      { order_id: 5, item: 'Mousepad', amount: 250,   customer_id: 2 },
    ],
  },
  Shippings: {
    columns: [
      { name: 'shipping_id', type: 'integer', pk: true },
      { name: 'status',      type: 'integer' },
      { name: 'customer',    type: 'integer', fk: true },
    ],
    data: [
      { shipping_id: 1, status: 2, customer: 2 },
      { shipping_id: 2, status: 1, customer: 4 },
      { shipping_id: 3, status: 1, customer: 3 },
      { shipping_id: 4, status: 1, customer: 1 },
      { shipping_id: 5, status: 2, customer: 5 },
    ],
  },
}

const EXAMPLES = [
  { label: 'SELECT + WHERE',  sql: `SELECT first_name, age\nFROM Customers\nWHERE age > 25;` },
  { label: 'INNER JOIN',      sql: `SELECT Customers.first_name, Orders.item, Orders.amount\nFROM Customers\nINNER JOIN Orders\nON Customers.customer_id = Orders.customer_id;` },
  { label: 'JOIN + WHERE',    sql: `SELECT Customers.first_name, Orders.amount\nFROM Customers\nINNER JOIN Orders\nON Customers.customer_id = Orders.customer_id\nWHERE Orders.amount > 300;` },
  { label: 'GROUP BY',        sql: `SELECT country, COUNT(*) AS count\nFROM Customers\nGROUP BY country;` },
  { label: 'ORDER BY',        sql: `SELECT first_name, age\nFROM Customers\nORDER BY age DESC;` },
]

// ─── SCHEMA SIDEBAR ───────────────────────────────────────────────────────────
function SchemaSidebar() {
  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(SCHEMA).map(k => [k, true]))
  )

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {Object.entries(SCHEMA).map(([table, { columns }]) => (
        <div key={table} className="border-b border-gray-800 last:border-0">
          <button
            onClick={() => setOpen(o => ({ ...o, [table]: !o[table] }))}
            className="flex items-center gap-2 px-3 py-2.5 w-full text-left hover:bg-gray-800/50 transition-colors"
          >
            <span className="text-gray-500 text-xs shrink-0">⊞</span>
            <span className="text-sm font-mono text-gray-200 font-medium truncate">{table}</span>
            <span className="text-gray-600 text-xs ml-auto shrink-0">{open[table] ? '−' : '+'}</span>
          </button>
          <AnimatePresence initial={false}>
            {open[table] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                {columns.map(col => (
                  <div key={col.name} className="flex items-center px-5 py-1">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {col.pk && <span className="text-yellow-500 text-xs shrink-0">🔑</span>}
                      <span className="text-xs font-mono text-gray-400 truncate">{col.name}</span>
                    </div>
                    <span className={`text-xs font-mono shrink-0 ml-2 ${
                      col.pk ? 'text-yellow-600' : col.fk ? 'text-blue-500' : 'text-gray-600'
                    }`}>
                      [{col.type}]
                    </span>
                  </div>
                ))}
                <div className="h-1.5" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

// ─── STATIC TABLE (right panel) ───────────────────────────────────────────────
function StaticTable({ name, data }: { name: string; data: Record<string, any>[] }) {
  const keys = data.length > 0 ? Object.keys(data[0]) : []
  return (
    <div className="mb-6">
      <div className="text-sm font-semibold text-gray-200 mb-2">{name}</div>
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="bg-gray-800/70 border-b border-gray-700">
              {keys.map(k => (
                <th key={k} className="px-3 py-2 text-left text-gray-400 font-medium whitespace-nowrap">{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-gray-800/60 last:border-0 hover:bg-gray-800/20 transition-colors">
                {keys.map(k => (
                  <td key={k} className="px-3 py-1.5 text-gray-300 whitespace-nowrap">{String(row[k])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── JOIN DIAGRAM (image 2 style) ────────────────────────────────────────────
function JoinDiagram({
  leftName, rightName, leftCols, rightCols, leftData, rightData,
  result, highlightLeft, highlightRight, joinColLeft, joinColRight
}: {
  leftName: string; rightName: string
  leftCols: string[]; rightCols: string[]
  leftData: Record<string, any>[]; rightData: Record<string, any>[]
  result: Record<string, any>[]; highlightLeft: number[]; highlightRight: number[]
  joinColLeft: string; joinColRight: string
}) {
  const resultCols = result.length > 0 ? Object.keys(result[0]) : []

  function JoinTable({
    title, cols, rows, highlight, joinCol, color
  }: {
    title: string; cols: string[]; rows: Record<string, any>[]
    highlight: number[]; joinCol: string
    color: 'cyan' | 'violet'
  }) {
    const border = color === 'cyan' ? 'border-cyan-700' : 'border-violet-700'
    const headerBg = color === 'cyan' ? 'bg-cyan-950/60 text-cyan-300' : 'bg-violet-950/60 text-violet-300'
    const hlCls = color === 'cyan' ? 'text-cyan-400 font-bold underline' : 'text-violet-400 font-bold underline'
    const hlRowCls = color === 'cyan' ? 'bg-cyan-500/10' : 'bg-violet-500/10'

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-2 ${border} rounded-xl overflow-hidden flex-1`}
      >
        <div className={`px-3 py-1.5 text-xs font-mono font-semibold ${headerBg} border-b ${border}`}>
          Table: {title}
        </div>
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              {cols.map(c => (
                <th key={c} className={`px-2 py-1.5 text-left font-medium ${c === joinCol ? (color === 'cyan' ? 'text-cyan-400' : 'text-violet-400') : 'text-gray-500'}`}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 5).map((row, i) => (
              <tr key={i} className={`border-b border-gray-800 last:border-0 transition-colors ${highlight.includes(i) ? hlRowCls : ''}`}>
                {cols.map(c => (
                  <td key={c} className={`px-2 py-1.5 ${
                    highlight.includes(i) && c === joinCol ? hlCls : 'text-gray-400'
                  }`}>
                    {String(row[c] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-0 items-center w-full">
      {/* Title */}
      <div className="text-sm font-bold text-violet-400 mb-4 font-mono">SQL JOIN</div>

      {/* Two source tables side by side */}
      <div className="flex gap-4 w-full">
        <JoinTable title={leftName}  cols={leftCols}  rows={leftData}  highlight={highlightLeft}  joinCol={joinColLeft}  color="cyan" />
        <JoinTable title={rightName} cols={rightCols} rows={rightData} highlight={highlightRight} joinCol={joinColRight} color="violet" />
      </div>

      {/* Arrow down */}
      {result.length > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            className="flex flex-col items-center my-2"
          >
            <div className="w-px h-6 bg-blue-500" />
            <div className="w-0 h-0"
              style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #3b82f6' }}
            />
          </motion.div>

          {/* Result table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="border-2 border-blue-700 rounded-xl overflow-hidden w-full"
          >
            <div className="px-3 py-1.5 text-xs font-mono font-semibold bg-blue-950/60 text-blue-300 border-b border-blue-700">
              Result
            </div>
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  {resultCols.map(c => (
                    <th key={c} className="px-2 py-1.5 text-left text-gray-400 font-medium">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="border-b border-gray-800 last:border-0 bg-blue-500/10"
                  >
                    {resultCols.map(c => (
                      <td key={c} className="px-2 py-1.5 text-blue-200">{String(row[c] ?? '')}</td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </>
      )}
    </div>
  )
}

// ─── FILTER DIAGRAM ───────────────────────────────────────────────────────────
function FilterDiagram({ tableName, allRows, filteredRows, cols }: {
  tableName: string; allRows: Record<string, any>[]
  filteredRows: Record<string, any>[]; cols: string[]
}) {
  const filteredIds = new Set(filteredRows.map(r => JSON.stringify(r)))
  return (
    <div className="flex flex-col gap-0 items-center w-full">
      <div className="text-sm font-bold text-blue-400 mb-3 font-mono">WHERE filter</div>
      <div className="border-2 border-cyan-700 rounded-xl overflow-hidden w-full">
        <div className="px-3 py-1.5 text-xs font-mono font-semibold bg-cyan-950/60 text-cyan-300 border-b border-cyan-700">
          Table: {tableName}
        </div>
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              {cols.map(c => <th key={c} className="px-2 py-1.5 text-left text-gray-500 font-medium">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {allRows.slice(0, 5).map((row, i) => {
              const passed = filteredIds.has(JSON.stringify(row)) || filteredRows.some(r => Object.values(r).join() === Object.values(row).slice(0, Object.keys(r).length).join())
              return (
                <tr key={i} className={`border-b border-gray-800 last:border-0 transition-colors ${passed ? 'bg-green-500/10' : 'opacity-40'}`}>
                  {cols.map(c => (
                    <td key={c} className={`px-2 py-1.5 ${passed ? 'text-green-300' : 'text-gray-600'}`}>
                      {String(row[c] ?? '')}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {filteredRows.length > 0 && (
        <>
          <div className="flex flex-col items-center my-2">
            <div className="w-px h-5 bg-blue-500" />
            <div className="w-0 h-0" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '7px solid #3b82f6' }} />
          </div>
          <div className="border-2 border-blue-700 rounded-xl overflow-hidden w-full">
            <div className="px-3 py-1.5 text-xs font-mono font-semibold bg-blue-950/60 text-blue-300 border-b border-blue-700">
              Filtered result ({filteredRows.length} rows)
            </div>
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  {Object.keys(filteredRows[0] ?? {}).map(c => (
                    <th key={c} className="px-2 py-1.5 text-left text-gray-400 font-medium">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-800 last:border-0 bg-blue-500/10">
                    {Object.values(row).map((v: any, j) => (
                      <td key={j} className="px-2 py-1.5 text-blue-200">{String(v)}</td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// ─── GROUP BY DIAGRAM ─────────────────────────────────────────────────────────
function GroupByDiagram({ groups }: { groups: Record<string, any>[] }) {
  if (!groups.length) return null
  const cols = Object.keys(groups[0])
  return (
    <div className="flex flex-col gap-0 items-center w-full">
      <div className="text-sm font-bold text-amber-400 mb-3 font-mono">GROUP BY result</div>
      <div className="border-2 border-amber-700 rounded-xl overflow-hidden w-full">
        <div className="px-3 py-1.5 text-xs font-mono font-semibold bg-amber-950/60 text-amber-300 border-b border-amber-700">
          Aggregated
        </div>
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              {cols.map(c => <th key={c} className="px-3 py-1.5 text-left text-gray-400 font-medium">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {groups.map((row, i) => (
              <motion.tr key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="border-b border-gray-800 last:border-0 bg-amber-500/10">
                {cols.map(c => (
                  <td key={c} className="px-3 py-1.5 text-amber-200">{String(row[c] ?? '')}</td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── SMART DIAGRAM PICKER ────────────────────────────────────────────────────
function SmartDiagram({ sql, step }: { sql: string; step: any }) {
  const up = sql.toUpperCase()
  const isJoin    = up.includes('JOIN')
  const isGroup   = up.includes('GROUP BY')
  const isFilter  = up.includes('WHERE') && !isJoin
  const state: Record<string, any>[] = Array.isArray(step?.state) && step.state.length > 0 &&
    typeof step.state[0] === 'object' ? step.state : []

  // ── JOIN ──
  if (isJoin) {
    const joinMatch = sql.match(/FROM\s+(\w+)\s+(?:INNER\s+)?JOIN\s+(\w+)\s+ON\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/i)
    const leftName  = joinMatch?.[1] ?? 'Customers'
    const rightName = joinMatch?.[2] ?? 'Orders'
    const leftJoinCol  = joinMatch?.[4] ?? 'customer_id'
    const rightJoinCol = joinMatch?.[6] ?? 'customer_id'

    const leftData  = SCHEMA[leftName]?.data  ?? []
    const rightData = SCHEMA[rightName]?.data ?? []
    const leftCols  = SCHEMA[leftName]?.columns.slice(0, 3).map(c => c.name)  ?? []
    const rightCols = SCHEMA[rightName]?.columns.slice(0, 3).map(c => c.name) ?? []

    // Find which rows are highlighted in result
    const resultMatchVals = state.map(r => r[leftJoinCol] ?? r[rightJoinCol]).filter(Boolean)
    const hlLeft  = leftData.map((r, i)  => resultMatchVals.includes(r[leftJoinCol])  ? i : -1).filter(i => i >= 0)
    const hlRight = rightData.map((r, i) => resultMatchVals.includes(r[rightJoinCol]) ? i : -1).filter(i => i >= 0)

    return (
      <JoinDiagram
        leftName={leftName} rightName={rightName}
        leftCols={leftCols} rightCols={rightCols}
        leftData={leftData} rightData={rightData}
        result={state}
        highlightLeft={hlLeft} highlightRight={hlRight}
        joinColLeft={leftJoinCol} joinColRight={rightJoinCol}
      />
    )
  }

  // ── GROUP BY ──
  if (isGroup) {
    return <GroupByDiagram groups={state} />
  }

  // ── WHERE filter ──
  if (isFilter) {
    const fromMatch = sql.match(/FROM\s+(\w+)/i)
    const tableName = fromMatch?.[1] ?? 'Customers'
    const allRows   = SCHEMA[tableName]?.data ?? []
    const cols      = SCHEMA[tableName]?.columns.slice(0, 4).map(c => c.name) ?? []
    return (
      <FilterDiagram
        tableName={tableName} allRows={allRows}
        filteredRows={state} cols={cols}
      />
    )
  }

  // ── Plain SELECT ──
  if (state.length > 0) {
    const cols = Object.keys(state[0])
    return (
      <div className="border-2 border-blue-700 rounded-xl overflow-hidden w-full">
        <div className="px-3 py-1.5 text-xs font-mono font-semibold bg-blue-950/60 text-blue-300 border-b border-blue-700">
          Result
        </div>
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              {cols.map(c => <th key={c} className="px-2 py-1.5 text-left text-gray-400 font-medium">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {state.map((row, i) => (
              <tr key={i} className="border-b border-gray-800 last:border-0 bg-blue-500/10">
                {cols.map(c => <td key={c} className="px-2 py-1.5 text-blue-200">{String(row[c] ?? '')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="text-xs font-mono text-gray-600 text-center py-6">
      Run a query to see the diagram
    </div>
  )
}

// ─── SQL SUBCATEGORIES ────────────────────────────────────────────────────────
const SQL_SUBCATEGORIES = [
  {
    id: 'select',
    label: 'SELECT & Filtering',
    icon: '⊞',
    color: 'blue',
    desc: 'Query rows with SELECT, WHERE, ORDER BY, and LIMIT. The foundation of every SQL query.',
    tags: ['SELECT *', 'WHERE', 'ORDER BY', 'LIMIT'],
    examples: EXAMPLES.filter(e => ['SELECT + WHERE', 'ORDER BY'].includes(e.label)),
    defaultSql: EXAMPLES.find(e => e.label === 'SELECT + WHERE')!.sql,
  },
  {
    id: 'joins',
    label: 'JOINs',
    icon: '⟕',
    color: 'violet',
    desc: 'Combine rows from two or more tables using INNER JOIN, LEFT JOIN, and more.',
    tags: ['INNER JOIN', 'LEFT JOIN', 'ON clause', 'Multi-table'],
    examples: EXAMPLES.filter(e => e.label.includes('JOIN')),
    defaultSql: EXAMPLES.find(e => e.label === 'INNER JOIN')!.sql,
  },
  {
    id: 'groupby',
    label: 'GROUP BY & Aggregates',
    icon: '∑',
    color: 'amber',
    desc: 'Aggregate rows into groups and compute COUNT, SUM, AVG, MIN, and MAX.',
    tags: ['GROUP BY', 'COUNT(*)', 'SUM', 'AVG'],
    examples: EXAMPLES.filter(e => e.label === 'GROUP BY'),
    defaultSql: EXAMPLES.find(e => e.label === 'GROUP BY')!.sql,
  },
]

const SQL_COLORS: Record<string, { border: string; title: string; tag: string; btn: string; glow: string; icon: string }> = {
  blue: {
    border: 'hover:border-blue-600 dark:hover:border-blue-500',
    title: 'text-blue-600 dark:text-blue-400',
    tag: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
    btn: 'bg-blue-600 hover:bg-blue-500',
    glow: 'from-blue-600/20',
    icon: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  },
  violet: {
    border: 'hover:border-violet-600 dark:hover:border-violet-500',
    title: 'text-violet-600 dark:text-violet-400',
    tag: 'bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800',
    btn: 'bg-violet-600 hover:bg-violet-500',
    glow: 'from-violet-600/20',
    icon: 'bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400',
  },
  amber: {
    border: 'hover:border-amber-500 dark:hover:border-amber-500',
    title: 'text-amber-600 dark:text-amber-400',
    tag: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    btn: 'bg-amber-500 hover:bg-amber-400',
    glow: 'from-amber-600/20',
    icon: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
  },
}

// ─── PREVIEW SVGs ─────────────────────────────────────────────────────────────
function SelectPreview() {
  return (
    <svg viewBox="0 0 280 140" className="w-full h-full">
      <rect x="10" y="10" width="150" height="100" rx="6" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5"/>
      <rect x="10" y="10" width="150" height="22" rx="6" fill="#1e3a5f"/>
      <text x="85" y="25" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#60a5fa">Customers</text>
      {['id·name·age','1·John·31','2·Robert·22','3·David·22','4·John·25'].map((r,i) => (
        <text key={i} x="18" y={46+i*16} fontSize="8" fontFamily="monospace"
          fill={i===0?'#475569': i===1||i===3?'#22d3ee':'#64748b'}>{r}</text>
      ))}
      <rect x="170" y="40" width="100" height="60" rx="5" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5"/>
      <rect x="170" y="40" width="100" height="18" rx="5" fill="#0c2a3a"/>
      <text x="220" y="53" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#67e8f9">WHERE age {'>'} 25</text>
      {['John·31','John·25'].map((r,i) => (
        <text key={i} x="178" y={72+i*15} fontSize="8" fontFamily="monospace" fill="#22d3ee">{r}</text>
      ))}
      <text x="20" y="125" fontSize="8" fontFamily="monospace" fill="#3b82f6">SELECT name, age FROM Customers WHERE age {'>'} 25</text>
    </svg>
  )
}

function JoinPreview() {
  return (
    <svg viewBox="0 0 280 140" className="w-full h-full">
      <rect x="8" y="12" width="100" height="72" rx="6" fill="#0f172a" stroke="#7c3aed" strokeWidth="1.5"/>
      <rect x="8" y="12" width="100" height="20" rx="5" fill="#2e1065"/>
      <text x="58" y="25" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#a78bfa">Customers</text>
      {['id·name','1·John','2·Bob','3·Carol'].map((r,i) => (
        <text key={i} x="16" y={44+i*14} fontSize="8" fontFamily="monospace" fill={i===0?'#6d28d9':'#94a3b8'}>{r}</text>
      ))}
      <text x="112" y="60" fontSize="18" fill="#7c3aed">⟕</text>
      <text x="110" y="75" fontSize="7" fontFamily="monospace" fill="#7c3aed">JOIN</text>
      <rect x="130" y="12" width="100" height="72" rx="6" fill="#0f172a" stroke="#7c3aed" strokeWidth="1.5"/>
      <rect x="130" y="12" width="100" height="20" rx="5" fill="#2e1065"/>
      <text x="180" y="25" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#a78bfa">Orders</text>
      {['cid·item','1·Keyboard','2·Mouse','3·Monitor'].map((r,i) => (
        <text key={i} x="138" y={44+i*14} fontSize="8" fontFamily="monospace" fill={i===0?'#6d28d9':'#94a3b8'}>{r}</text>
      ))}
      <rect x="8" y="96" width="264" height="32" rx="5" fill="#0f172a" stroke="#4f46e5" strokeWidth="1.5"/>
      <text x="140" y="109" textAnchor="middle" fontSize="7.5" fontFamily="monospace" fill="#818cf8">John·Keyboard | Bob·Mouse | Carol·Monitor</text>
      <text x="8" y="138" fontSize="7" fontFamily="monospace" fill="#7c3aed">INNER JOIN ON customer_id</text>
    </svg>
  )
}

function GroupByPreview() {
  return (
    <svg viewBox="0 0 280 140" className="w-full h-full">
      <text x="14" y="18" fontSize="8" fontFamily="monospace" fill="#f59e0b">GROUP BY country</text>
      {[['USA','John','Robert'],['UK','David','John'],['UAE','Betty','']].map(([country,...names],gi) => (
        <g key={gi}>
          <rect x={8+gi*92} y={25} width={84} height={names.filter(Boolean).length*16+22} rx="5"
            fill="#0f172a" stroke={gi===0?'#f59e0b':gi===1?'#a78bfa':'#34d399'} strokeWidth="1.5"/>
          <rect x={8+gi*92} y={25} width={84} height={16} rx="4"
            fill={gi===0?'#92400e44':gi===1?'#4c1d9544':'#065f4644'}/>
          <text x={50+gi*92} y={37} textAnchor="middle" fontSize="8" fontFamily="monospace"
            fill={gi===0?'#fbbf24':gi===1?'#c4b5fd':'#6ee7b7'}>{country} ({names.filter(Boolean).length})</text>
          {names.filter(Boolean).map((n,ni) => (
            <text key={ni} x={16+gi*92} y={52+ni*16} fontSize="8" fontFamily="monospace" fill="#94a3b8">{n}</text>
          ))}
        </g>
      ))}
      <rect x="8" y="110" width="264" height="22" rx="5" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5"/>
      <text x="14" y="124" fontSize="8" fontFamily="monospace" fill="#fbbf24">USA:2 | UK:2 | UAE:1</text>
      <text x="210" y="124" fontSize="7" fontFamily="monospace" fill="#78716c">COUNT(*)</text>
    </svg>
  )
}

const SQL_PREVIEWS: Record<string, React.ReactNode> = {
  select: <SelectPreview />,
  joins: <JoinPreview />,
  groupby: <GroupByPreview />,
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SQLPage({ dark, setDark }: Props) {
  const navigate = useNavigate()
  const [view, setView] = useState<'grid' | 'detail'>('grid')
  const [selectedCat, setSelectedCat] = useState<typeof SQL_SUBCATEGORIES[0] | null>(null)
  const [sql, setSql]               = useState(EXAMPLES[0].sql)
  const [steps, setSteps]           = useState<any[]>([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const handleRun = async () => {
    setLoading(true); setError(null); setCurrentStep(0); setSteps([])
    try {
      const code = [
        `# SQL query to trace:`,
        `# ${sql.replace(/\n/g, '\n# ')}`,
        `#`,
        `# Schema:`,
        `# Customers(customer_id INT PK, first_name VARCHAR, last_name VARCHAR, age INT, country VARCHAR)`,
        `# - Rows: (1,John,Doe,31,USA),(2,Robert,Luna,22,USA),(3,David,Robinson,22,UK),(4,John,Reinhardt,25,UK),(5,Betty,Doe,28,UAE)`,
        `# Orders(order_id INT PK, item VARCHAR, amount INT, customer_id INT FK)`,
        `# - Rows: (1,Keyboard,400,4),(2,Mouse,300,4),(3,Monitor,12000,3),(4,Keyboard,400,1),(5,Mousepad,250,2)`,
        `# Shippings(shipping_id INT PK, status INT, customer INT FK)`,
        ``,
        sql,
      ].join('\n')
      const res = await axios.post('/api/visualize', { code, language: 'python', category: 'sql' })
      setSteps(res.data.steps)
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? 'Error analyzing SQL'
      const isRate = msg.includes('rate') || msg.includes('429')
      setError(isRate ? 'Rate limit reached — wait a minute or try a shorter query.' : msg)
    } finally { setLoading(false) }
  }

  const schemaPanel = useDrag(208, 140, 320)
  const rightPanel  = useDrag(340, 220, 520)

  // Viz zoom
  const [vizZoom, setVizZoom] = useState(1)
  // Table zoom
  const [tableZoom, setTableZoom] = useState(1)
  // Right panel vertical split: viz height vs tables
  const [vizHeight, setVizHeight] = useState(300)
  const vizDragging = useRef(false)
  const handleVizResizeDown = useCallback(() => {
    vizDragging.current = true
    const onMove = (e: MouseEvent) => {
      if (!vizDragging.current) return
      setVizHeight(h => Math.min(600, Math.max(120, h + e.movementY)))
    }
    const onUp = () => { vizDragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  const step = steps[currentStep] ?? null
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0
  const outputCols = step?.state?.[0] ? Object.keys(step.state[0]) : []

  // ── GRID VIEW ─────────────────────────────────────────────────────────────
  if (view === 'grid') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
        <Navbar dark={dark} setDark={setDark} showBack={true} />

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 px-8 py-2.5 border-b border-gray-200 dark:border-gray-800 text-xs font-mono text-gray-400">
          <button onClick={() => navigate('/')} className="hover:text-blue-500 transition-colors">Home</button>
          <span>/</span>
          <span className="text-blue-500">SQL & Databases</span>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="flex flex-col gap-5 lg:col-span-2 justify-center h-full">
              <div className="text-xs font-mono text-blue-500 uppercase tracking-widest">SQL & Databases</div>
              <h1 className="text-4xl font-bold tracking-tight leading-tight">
                Visualize SQL queries,<br />
                <span className="text-blue-500">step by step</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xl">
                Choose a topic below to explore preloaded SQL examples, or write your own SQL query and run it instantly with AI visualization.
              </p>

              <div className="flex flex-wrap gap-2 mt-1">
                {['Select & Filtering', 'Joins', 'Group By & Aggregations'].map(t => (
                  <span key={t} className="text-[10px] font-mono px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(129, 155, 216, 0.08)', color: '#3b82f6', border: '1px solid rgba(67, 98, 172, 0.2)' }}>{t}</span>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-2 flex-wrap">

                <button
                  onClick={() => navigate('/visualizer', { state: { mode: 'sql' } })}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>▶</span> Visualize Your Own Code
                </button>

                <p className="text-xs text-gray-400 font-mono">Write any SQL · AI traces every step</p>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm max-w-sm ml-auto w-full">
              <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3.5 font-bold">
                How it works
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { step: '01', icon: '⊞', title: 'Pick a topic', desc: 'Choose SELECT, JOIN, or GROUP BY examples.' },
                  { step: '02', icon: '⬡', title: 'AI analyzes it', desc: 'Llama 3.3 traces every clause and step.' },
                  { step: '03', icon: '▶', title: 'Watch it animate', desc: 'Tables highlight as rows are filtered or joined.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800/60 rounded-xl p-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                        <span className="text-[10px] font-mono text-gray-400 mr-1">{item.step}</span>
                        {item.title}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-8 pt-6 pb-3">
          <div className="flex items-center gap-4">
          </div>
        </div>

        {/* Topic grid */}
        <section className="px-8 pb-16 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Explore Preloaded Examples</h2>
            <p className="text-gray-500 text-sm mt-1.5">Each topic has preloaded SQL examples with step-by-step visualizations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SQL_SUBCATEGORIES.map((cat) => {
              const c = SQL_COLORS[cat.color]
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCat(cat)
                    setSql(cat.defaultSql)
                    setView('detail')
                  }}
                  className={`group text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col h-full cursor-pointer ${c.border}`}
                >
                  {/* Preview diagram */}
                  <div className="h-36 bg-gray-950 border-b border-gray-200 dark:border-gray-800 p-4 overflow-hidden flex items-center justify-center w-full">
                    <div className="w-full max-w-[320px] h-full">
                      {SQL_PREVIEWS[cat.id]}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between w-full">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-lg ${c.title}`}>{cat.icon}</span>
                        <h3 className={`text-sm font-bold ${c.title}`}>{cat.label}</h3>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{cat.desc}</p>
                      <div className="flex gap-1.5 flex-wrap mb-4">
                        {cat.tags.map(tag => (
                          <span key={tag} className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-medium ${c.tag}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800/60 pt-3 w-full">
                      <span className="text-[11px] text-gray-400 font-medium group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors">
                        {cat.examples.length} example{cat.examples.length !== 1 ? 's' : ''} · Click to explore →
                      </span>
                      <span className={`text-xs font-mono font-semibold px-4 py-1.5 rounded-xl text-white transition-colors shadow-sm ${c.btn}`}>
                        Explore
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <footer className="border-t border-gray-200 dark:border-gray-800 px-8 py-5 flex items-center justify-between">
          <div className="font-mono text-sm text-gray-400"><span className="text-violet-500">dsa</span>viz</div>
          <div className="text-xs text-gray-400 font-mono">© 2026</div>
        </footer>
      </div>
    )
  }

  // ── DETAIL / IDE VIEW ─────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">

      {/* ── TOP NAV ── */}
      <nav className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-800 bg-gray-900/90 backdrop-blur shrink-0">
        <button onClick={() => { setView('grid'); setSteps([]); setError(null) }}
          className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-2.5 py-1.5 rounded-lg transition-colors">
          ← Back
        </button>
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5">
          <span className="text-violet-400 font-bold text-base">⬡</span>
          <span className="font-mono font-bold text-white">dsa<span className="text-violet-400">viz</span></span>
        </button>
        <span className="text-gray-700 text-xs font-mono">/</span>
        <button onClick={() => { setView('grid'); setSteps([]); setError(null) }} className="text-blue-400 text-xs font-mono hover:text-blue-300 transition-colors">SQL & Databases</button>
        {selectedCat
          ? <><span className="text-gray-700 text-xs font-mono">/</span><span className="text-gray-400 text-xs font-mono">{selectedCat.label}</span></>
          : <><span className="text-gray-700 text-xs font-mono">/</span><span className="text-gray-400 text-xs font-mono">Custom Query</span></>
        }

        {/* Right side: examples + run grouped together */}
        <div className="ml-auto flex items-center gap-2">
          <select
            value=""
            onChange={e => { if (e.target.value) setSql(e.target.value) }}
            className="text-xs font-mono bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1.5 rounded-lg outline-none cursor-pointer"
          >
            <option value="">Examples…</option>
            {(selectedCat ? selectedCat.examples : EXAMPLES).map(q => <option key={q.label} value={q.sql}>{q.label}</option>)}
          </select>
          <button
            onClick={handleRun}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
          >
            {loading
              ? <><span className="animate-spin inline-block">⟳</span> Running…</>
              : <>▶ Run SQL</>}
          </button>
          <button
            onClick={() => navigate('/visualizer', { state: { code: '', mode: 'sql' } })}
            className="text-xs text-gray-500 hover:text-blue-400 border border-gray-700 hover:border-blue-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            Open Visualizer ↗
          </button>
        </div>
      </nav>

      {/* ── THREE-PANEL BODY ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Schema sidebar — resizable ── */}
        <div className="shrink-0 border-r border-gray-800 bg-gray-900/50 flex flex-col overflow-hidden" style={{ width: schemaPanel.size }}>
          <div className="px-3 py-2 border-b border-gray-800 shrink-0">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Schema</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SchemaSidebar />
          </div>
        </div>
        <div onMouseDown={schemaPanel.onMouseDown} className="w-1 shrink-0 bg-gray-800 hover:bg-blue-500 cursor-col-resize transition-colors" title="Drag to resize" />

        {/* ── CENTER: SQL editor + output (like image 1 center) ── */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-800">

          {/* "Input" label bar — like image 1 */}
          <div className="flex items-center px-4 py-1.5 border-b border-gray-800 bg-gray-900 shrink-0">
            <span className="text-xs font-mono text-gray-400 font-medium">Input</span>
          </div>

          {/* SQL textarea */}
          <div className="border-b border-gray-800 bg-gray-950 shrink-0">
            <textarea
              value={sql}
              onChange={e => setSql(e.target.value)}
              spellCheck={false}
              rows={6}
              className="w-full bg-transparent font-mono text-sm text-gray-200 px-5 py-4 outline-none resize-none leading-relaxed"
              placeholder="-- Write your SQL query here
SELECT * FROM Customers;"
            />
          </div>

          {/* Output area */}
          <div className="flex-1 overflow-auto bg-gray-950/60">

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono text-gray-500">Analyzing query...</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="m-4 bg-red-950/50 border border-red-800 rounded-xl p-4">
                <div className="text-xs font-mono text-red-400 mb-1">Error</div>
                <p className="text-xs text-red-300 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && steps.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-700">
                <span className="text-3xl">⊞</span>
                <p className="text-sm font-mono">Write a SQL query and click Run SQL</p>
              </div>
            )}

            {/* Output table */}
            {!loading && steps.length > 0 && (
              <div className="p-4 flex flex-col gap-3">
                {/* Output label — like image 1 */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-200">Output</span>
                  <span className="text-xs font-mono text-gray-600">
                    step {currentStep + 1} / {steps.length}
                  </span>
                </div>

                {/* Result table */}
                {Array.isArray(step?.state) && step.state.length > 0 && outputCols.length > 0 ? (
                  <div className="border border-gray-700 rounded-xl overflow-hidden shadow">
                    <table className="w-full text-sm font-mono">
                      <thead>
                        <tr className="bg-gray-800/70 border-b border-gray-700">
                          {outputCols.map(k => (
                            <th key={k} className="px-4 py-2.5 text-left text-gray-300 font-medium text-xs">
                              {k}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence mode="sync">
                          {step.state.map((row: any, i: number) => {
                            const isHL = step.highlights?.includes(i)
                            return (
                              <motion.tr
                                key={i}
                                layout
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className={`border-b border-gray-800 last:border-0 transition-colors ${
                                  isHL ? 'bg-blue-500/12' : 'hover:bg-gray-800/20'
                                }`}
                              >
                                {outputCols.map(k => (
                                  <td key={k} className={`px-4 py-2 ${isHL ? 'text-blue-200 font-medium' : 'text-gray-300'}`}>
                                    {String(row[k] ?? '')}
                                  </td>
                                ))}
                              </motion.tr>
                            )
                          })}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  step?.state?.length === 0 && (
                    <div className="border border-gray-800 rounded-xl p-6 text-center text-gray-600 text-xs font-mono">
                      No rows at this step
                    </div>
                  )
                )}

                {/* Explanation */}
                {step?.explanation && (
                  <div className="flex items-start gap-2 text-xs font-mono text-gray-400 bg-gray-900/50 border border-gray-800 px-3 py-2.5 rounded-xl">
                    <span className="text-blue-400 shrink-0">→</span>
                    <span className="leading-relaxed">{step.explanation}</span>
                  </div>
                )}

                {/* Step controls inline */}
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => setCurrentStep(0)} className="text-gray-500 hover:text-white transition-colors text-sm">⏮</button>
                  <button onClick={() => setCurrentStep(c => Math.max(0, c - 1))} className="text-gray-500 hover:text-white transition-colors">◀</button>
                  <div className="flex-1 bg-gray-800 rounded-full h-1">
                    <div className="bg-blue-500 h-1 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <button onClick={() => setCurrentStep(c => Math.min(steps.length - 1, c + 1))} className="text-gray-500 hover:text-white transition-colors">▶</button>
                  <span className="text-xs font-mono text-gray-500 min-w-[48px] text-right">
                    {currentStep + 1} / {steps.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Visualization + Available Tables — resizable ── */}
        <div onMouseDown={rightPanel.onMouseDown} className="w-1 shrink-0 bg-gray-800 hover:bg-blue-500 cursor-col-resize transition-colors" title="Drag to resize" />
        <div className="shrink-0 flex flex-col overflow-hidden bg-gray-900/30" style={{ width: rightPanel.size }}>

          {/* Visualization section header */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 bg-gray-900 shrink-0">
            <span className="text-xs font-semibold text-gray-200 font-mono uppercase tracking-widest">Visualization</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] text-gray-600 font-mono">zoom</span>
              <input type="range" min={0.5} max={2} step={0.1} value={vizZoom}
                onChange={e => setVizZoom(Number(e.target.value))}
                className="w-20 accent-blue-500 cursor-pointer" style={{ height: 2 }} />
              <span className="text-[10px] font-mono text-gray-500 min-w-[28px]">{vizZoom.toFixed(1)}×</span>
              <button onClick={() => setVizZoom(1)} className="text-[10px] text-gray-600 hover:text-gray-300 transition-colors border border-gray-700 px-1.5 py-0.5 rounded">1×</button>
            </div>
          </div>

          {/* Visualization content — resizable height */}
          <div className="shrink-0 overflow-y-auto border-b border-gray-800 bg-gray-950 relative" style={{ height: vizHeight }}>
            {steps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-700">
                <span className="text-2xl">⊞</span>
                <span className="text-xs font-mono">Run SQL to see visualization</span>
              </div>
            ) : step ? (
              <div style={{ transform: `scale(${vizZoom})`, transformOrigin: 'top left', width: `${100 / vizZoom}%` }}>
                <div className="p-3">
                  <SmartDiagram sql={sql} step={step} />
                </div>
              </div>
            ) : null}
          </div>

          {/* Vertical drag handle */}
          <div onMouseDown={handleVizResizeDown}
            className="h-1 shrink-0 bg-gray-800 hover:bg-blue-500 cursor-row-resize transition-colors" title="Drag to resize" />

          {/* Step nav for visualization */}
          {steps.length > 0 && (
            <div className="px-3 py-2 border-b border-gray-800 shrink-0 flex items-center gap-2">
              <button onClick={() => setCurrentStep(0)} className="text-gray-600 hover:text-white transition-colors text-xs">⏮</button>
              <button onClick={() => setCurrentStep(c => Math.max(0, c - 1))} className="text-gray-600 hover:text-white transition-colors text-xs">◀</button>
              <div className="flex-1 bg-gray-800 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <button onClick={() => setCurrentStep(c => Math.min(steps.length - 1, c + 1))} className="text-gray-600 hover:text-white transition-colors text-xs">▶</button>
              <span className="text-xs font-mono text-gray-500">{currentStep + 1}/{steps.length}</span>
            </div>
          )}

          {/* Available Tables — fills remaining space, scrollable */}
          <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 bg-gray-900/60 sticky top-0 shrink-0">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Available Tables</span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-[10px] text-gray-600 font-mono">zoom</span>
                <input type="range" min={0.7} max={1.5} step={0.05} value={tableZoom}
                  onChange={e => setTableZoom(Number(e.target.value))}
                  className="w-16 accent-blue-500 cursor-pointer" style={{ height: 2 }} />
                <span className="text-[10px] font-mono text-gray-500 min-w-[26px]">{tableZoom.toFixed(1)}×</span>
                <button onClick={() => setTableZoom(1)} className="text-[10px] text-gray-600 hover:text-gray-300 border border-gray-700 px-1 py-0.5 rounded transition-colors">1×</button>
              </div>
            </div>
            <div className="px-3 py-3 overflow-y-auto" style={{ transform: `scale(${tableZoom})`, transformOrigin: 'top left', width: `${100 / tableZoom}%` }}>
              {Object.entries(SCHEMA).map(([name, { data }]) => (
                <StaticTable key={name} name={name} data={data} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}