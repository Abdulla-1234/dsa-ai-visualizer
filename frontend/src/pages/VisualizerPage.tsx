import { useNavigate, useLocation } from 'react-router-dom'
import { useRef, useCallback, useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useVisualizer } from '../hooks/useVisualizer'
import Visualizer from '../components/Visualizer'
import InferredInputBanner from '../components/InferredInputBanner'
import type { Language } from '../types/index'
import type * as Monaco from 'monaco-editor'
import axios from 'axios'

// ── Horizontal Drag Hook (resizable panels columns) ──────────────────────────
function useDrag(initial: number, min: number, max: number, inverted = false) {
  const [size, setSize] = useState(initial)
  const dragging = useRef(false)
  const onMouseDown = useCallback(() => {
    dragging.current = true
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setSize(prev => Math.min(max, Math.max(min, prev + (inverted ? -e.movementX : e.movementX))))
    }
    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [min, max, inverted])
  return { size, setSize, onMouseDown }
}

// ── ✅ FIXED: Added missing vertical Drag Hook helper (resizable rows panels) ──
function useDragY(initial: number, min: number, max: number, inverted = false) {
  const [size, setSize] = useState(initial)
  const dragging = useRef(false)
  const onMouseDown = useCallback(() => {
    dragging.current = true
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setSize(prev => Math.min(max, Math.max(min, prev + (inverted ? -e.movementY : e.movementY))))
    }
    const onUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [min, max, inverted])
  return { size, setSize, onMouseDown }
}

// ── System Design templates ────────────────────────────────────────────────
const SYSDESIGN_TEMPLATES: Record<string, string> = {
  'LRU Cache': `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cache = OrderedDict()
        self.capacity = capacity

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)

lru = LRUCache(3)
lru.put(1, 'A')
lru.put(2, 'B')
lru.put(3, 'C')
lru.get(1)
lru.put(4, 'D')`,

  'Rate Limiter': `from collections import deque
import time

class RateLimiter:
    def __init__(self, max_requests, window_seconds):
        self.max_requests = max_requests
        self.window = window_seconds
        self.requests = deque()

    def allow_request(self, timestamp):
        while self.requests and self.requests[0] <= timestamp - self.window:
            self.requests.popleft()
        if len(self.requests) < self.max_requests:
            self.requests.append(timestamp)
            return True
        return False

limiter = RateLimiter(3, 10)
for t in [1, 2, 3, 4, 12, 13]:
    limiter.allow_request(t)`,

  'Load Balancer': `class LoadBalancer:
    def __init__(self, servers):
        self.servers = servers
        self.index = 0

    def get_server(self):
        server = self.servers[self.index]
        self.index = (self.index + 1) % len(self.servers)
        return server

lb = LoadBalancer(['Server-A', 'Server-B', 'Server-C'])
for request in range(6):
    target = lb.get_server()`,

  'Consistent Hashing': `import hashlib

class ConsistentHash:
    def __init__(self):
        self.ring = {}
        self.nodes = []

    def add_node(self, node):
        h = int(hashlib.md5(node.encode()).hexdigest(), 16) % 360
        self.ring[h] = node
        self.nodes.append(h)
        self.nodes.sort()

    def get_node(self, key):
        h = int(hashlib.md5(key.encode()).hexdigest(), 16) % 360
        for node_hash in self.nodes:
            if h <= node_hash:
                return self.ring[node_hash]
        return self.ring[self.nodes[0]]

ch = ConsistentHash()
ch.add_node('cache-1')
ch.add_node('cache-2')
ch.add_node('cache-3')
ch.get_node('user_123')
ch.get_node('user_456')`,
}

const SYSDESIGN_EXAMPLE_GROUPS = [
  { label: 'Caching', items: ['LRU Cache', 'Consistent Hashing'] },
  { label: 'Traffic Control', items: ['Rate Limiter', 'Load Balancer'] },
]

// ── DSA templates ─────────────────────────────────────────────────────────────
const DSA_TEMPLATES: Record<Language, string> = {
  python: `arr = [5, 3, 8, 1, 9, 2]\n\n# Bubble Sort\nfor i in range(len(arr)):\n    for j in range(len(arr) - i - 1):\n        if arr[j] > arr[j + 1]:\n            arr[j], arr[j + 1] = arr[j + 1], arr[j]`,
  javascript: `let arr = [5, 3, 8, 1, 9, 2];\n\n// Bubble Sort\nfor (let i = 0; i < arr.length; i++) {\n  for (let j = 0; j < arr.length - i - 1; j++) {\n    if (arr[j] > arr[j + 1]) {\n      [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n    }\n  }\n}`,
  cpp: `#include <vector>\nusing namespace std;\nint main() {\n    vector<int> arr = {5, 3, 8, 1, 9, 2};\n    int n = arr.size();\n    for (int i = 0; i < n-1; i++)\n        for (int j = 0; j < n-i-1; j++)\n            if (arr[j] > arr[j+1])\n                swap(arr[j], arr[j+1]);\n    return 0;\n}`,
}

// ── SQL examples & schema ─────────────────────────────────────────────────────
const SQL_EXAMPLES = [
  { label: 'SELECT + WHERE',  sql: `SELECT first_name, age\nFROM Customers\nWHERE age > 25;` },
  { label: 'INNER JOIN',      sql: `SELECT Customers.first_name, Orders.item, Orders.amount\nFROM Customers\nINNER JOIN Orders\nON Customers.customer_id = Orders.customer_id;` },
  { label: 'JOIN + WHERE',    sql: `SELECT Customers.first_name, Orders.amount\nFROM Customers\nINNER JOIN Orders\nON Customers.customer_id = Orders.customer_id\nWHERE Orders.amount > 300;` },
  { label: 'GROUP BY',        sql: `SELECT country, COUNT(*) AS count\nFROM Customers\nGROUP BY country;` },
  { label: 'ORDER BY',        sql: `SELECT first_name, age\nFROM Customers\nORDER BY age DESC;` },
]

const SCHEMA: Record<string, { columns: { name: string; type: string; pk?: boolean; fk?: boolean }[]; data: Record<string, any>[] }> = {
  Customers: {
    columns: [
      { name: 'customer_id', type: 'int', pk: true },
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

// ── Schema sidebar ────────────────────────────────────────────────────────────
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
            className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-gray-800/50 transition-colors cursor-pointer"
          >
            <span className="text-gray-500 text-xs shrink-0">⊞</span>
            <span className="text-xs font-mono text-gray-200 font-medium truncate">{table}</span>
            <span className="text-gray-600 text-xs ml-auto shrink-0">{open[table] ? '−' : '+'}</span>
          </button>
          {open[table] && (
            <div>
              {columns.map(col => (
                <div key={col.name} className="flex items-center px-5 py-0.5">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    {col.pk && <span className="text-yellow-500 text-xs shrink-0">🔑</span>}
                    <span className="text-xs font-mono text-gray-400 truncate">{col.name}</span>
                  </div>
                  <span className={`text-xs font-mono shrink-0 ml-2 ${col.pk ? 'text-yellow-600' : col.fk ? 'text-blue-500' : 'text-gray-600'}`}>
                    [{col.type}]
                  </span>
                </div>
              ))}
              <div className="h-1" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── JTable (used by SQLVisualization JOIN view) ───────────────────────────────
function JTable({ title, cols, rows, highlight, joinCol, color, active }: any) {
  const border = color === 'cyan' ? 'border-cyan-700' : 'border-violet-700'
  const hdr    = color === 'cyan' ? 'bg-cyan-950/60 text-cyan-300' : 'bg-violet-950/60 text-violet-300'
  const hlRow  = color === 'cyan' ? 'bg-cyan-500/10' : 'bg-violet-500/10'
  const hlTxt  = color === 'cyan' ? 'text-cyan-400 font-bold' : 'text-violet-400 font-bold'
  const dotColor = color === 'cyan' ? 'bg-cyan-400' : 'bg-violet-400'
  const activeRing = active ? 'ring-2 ring-blue-400 shadow-[0_0_18px_rgba(59,130,246,0.45)]' : ''

  return (
    <div className={`border-2 ${border} ${activeRing} rounded-xl overflow-hidden flex-1 transition-all duration-300`}>
      <div className={`px-3 py-1 text-xs font-mono font-semibold ${hdr} border-b ${border} flex items-center gap-2`}>
        Table: {title}
        {active && (
          <span className="ml-auto flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
            scanning
          </span>
        )}
      </div>
      <table className="w-full text-xs font-mono">
        <thead><tr className="border-b border-gray-700 bg-gray-800/50">
          {cols.map((c: string) => <th key={c} className={`px-2 py-1 text-left font-medium ${c === joinCol ? (color === 'cyan' ? 'text-cyan-400' : 'text-violet-400') : 'text-gray-500'}`}>{c}</th>)}
        </tr></thead>
        <tbody>{rows.slice(0, 5).map((row: any, i: number) => (
          <tr key={i} className={`border-b border-gray-800 last:border-0 transition-colors duration-300 ${highlight.includes(i) ? hlRow : ''}`}>
            {cols.map((c: string) => <td key={c} className={`px-2 py-1 ${highlight.includes(i) && c === joinCol ? hlTxt : 'text-gray-400'}`}>{String(row[c] ?? '')}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

// ── SQL Diagram ───────────────────────────────────────────────────────────────
function SQLVisualization({ sql, step }: { sql: string; step: any }) {
  const up = sql.toUpperCase()
  const isJoin   = up.includes('JOIN')
  const isGroup  = up.includes('GROUP BY')
  const isFilter = up.includes('WHERE') && !isJoin
  const state: Record<string, any>[] = Array.isArray(step?.state) && step.state.length > 0
    && typeof step.state[0] === 'object' ? step.state : []

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
    const resultMatchVals = state.map(r => r[leftJoinCol] ?? r[rightJoinCol]).filter(Boolean)
    const hlLeft  = leftData.map((r, i)  => resultMatchVals.includes(r[leftJoinCol])  ? i : -1).filter(i => i >= 0)
    const hlRight = rightData.map((r, i) => resultMatchVals.includes(r[rightJoinCol]) ? i : -1).filter(i => i >= 0)

    return (
      <div className="flex flex-col gap-2 items-center w-full p-3">
        <div className="text-xs font-bold text-violet-400 font-mono mb-1">SQL JOIN</div>
        <div className="flex gap-3 w-full">
          <JTable
            title={leftName} cols={leftCols} rows={leftData}
            highlight={hlLeft} joinCol={leftJoinCol} color="cyan"
            active={hlLeft.length > 0}
          />
          <JTable
            title={rightName} cols={rightCols} rows={rightData}
            highlight={hlRight} joinCol={rightJoinCol} color="violet"
            active={hlRight.length > 0}
          />
        </div>

        {state.length > 0 && (
          <>
            <div className="flex flex-col items-center my-1">
              <div className="w-px h-5 bg-blue-500" />
              <div className="w-0 h-0" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '7px solid #3b82f6' }} />
            </div>
            <div className="border-2 border-blue-700 rounded-xl overflow-hidden w-full">
              <div className="px-3 py-1 text-xs font-mono font-semibold bg-blue-950/60 text-blue-300 border-b border-blue-700">Result ({state.length} rows)</div>
              <table className="w-full text-xs font-mono">
                <thead><tr className="border-b border-gray-700 bg-gray-800/50">
                  {Object.keys(state[0]).map(c => <th key={c} className="px-2 py-1 text-left text-gray-400 font-medium">{c}</th>)}
                </tr></thead>
                <tbody>{state.map((row, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-800 last:border-0 bg-blue-500/10">
                    {Object.values(row).map((v: any, j) => <td key={j} className="px-2 py-1 text-blue-200">{String(v)}</td>)}
                  </motion.tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}
      </div>
    )
  }

  if (isGroup && state.length > 0) {
    const cols = Object.keys(state[0])
    return (
      <div className="flex flex-col gap-2 items-center w-full p-3">
        <div className="text-xs font-bold text-amber-400 font-mono mb-1">GROUP BY result</div>
        <div className="border-2 border-amber-700 rounded-xl overflow-hidden w-full">
          <div className="px-3 py-1 text-xs font-mono font-semibold bg-amber-950/60 text-amber-300 border-b border-amber-700">Aggregated</div>
          <table className="w-full text-xs font-mono">
            <thead><tr className="border-b border-gray-700 bg-gray-800/50">
              {cols.map(c => <th key={c} className="px-3 py-1 text-left text-gray-400 font-medium">{c}</th>)}
            </tr></thead>
            <tbody>{state.map((row, i) => (
              <motion.tr key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="border-b border-gray-800 last:border-0 bg-amber-500/10">
                {cols.map(c => <td key={c} className="px-3 py-1 text-amber-200">{String(row[c] ?? '')}</td>)}
              </motion.tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    )
  }

  if (isFilter) {
    const fromMatch = sql.match(/FROM\s+(\w+)/i)
    const tableName = fromMatch?.[1] ?? 'Customers'
    const allRows   = SCHEMA[tableName]?.data ?? []
    const cols      = SCHEMA[tableName]?.columns.slice(0, 4).map(c => c.name) ?? []
    const filteredIds = new Set(state.map(r => JSON.stringify(Object.fromEntries(cols.map(c => [c, r[c]])))))
    return (
      <div className="flex flex-col gap-2 items-center w-full p-3">
        <div className="text-xs font-bold text-blue-400 font-mono mb-1">WHERE filter</div>
        <div className="border-2 border-cyan-700 rounded-xl overflow-hidden w-full">
          <div className="px-3 py-1 text-xs font-mono font-semibold bg-cyan-950/60 text-cyan-300 border-b border-cyan-700">Table: {tableName}</div>
          <table className="w-full text-xs font-mono">
            <thead><tr className="border-b border-gray-700 bg-gray-800/50">
              {cols.map(c => <th key={c} className="px-2 py-1 text-left text-gray-500 font-medium">{c}</th>)}
            </tr></thead>
            <tbody>{allRows.slice(0, 5).map((row, i) => {
              const key = JSON.stringify(Object.fromEntries(cols.map(c => [c, row[c]])))
              const passed = filteredIds.has(key)
              return (
                <tr key={i} className={`border-b border-gray-800 last:border-0 ${passed ? 'bg-green-500/10' : 'opacity-30'}`}>
                  {cols.map(c => <td key={c} className={`px-2 py-1 ${passed ? 'text-green-300' : 'text-gray-600'}`}>{String(row[c] ?? '')}</td>)}
                </tr>
              )
            })}</tbody>
          </table>
        </div>
        {state.length > 0 && (
          <>
            <div className="flex flex-col items-center my-1">
              <div className="w-px h-5 bg-blue-500" />
              <div className="w-0 h-0" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '7px solid #3b82f6' }} />
            </div>
            <div className="border-2 border-blue-700 rounded-xl overflow-hidden w-full">
              <div className="px-3 py-1 text-xs font-mono font-semibold bg-blue-950/60 text-blue-300 border-b border-blue-700">Filtered ({state.length} rows)</div>
              <table className="w-full text-xs font-mono">
                <thead><tr className="border-b border-gray-700 bg-gray-800/50">
                  {Object.keys(state[0] ?? {}).map(c => <th key={c} className="px-2 py-1 text-left text-gray-400 font-medium">{c}</th>)}
                </tr></thead>
                <tbody>{state.map((row, i) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-800 last:border-0 bg-blue-500/10">
                    {Object.values(row).map((v: any, j) => <td key={j} className="px-2 py-1 text-blue-200">{String(v)}</td>)}
                  </motion.tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}
      </div>
    )
  }

  // Plain result
  if (state.length > 0) {
    const cols = Object.keys(state[0])
    return (
      <div className="p-3 w-full">
        <div className="border-2 border-blue-700 rounded-xl overflow-hidden">
          <div className="px-3 py-1 text-xs font-mono font-semibold bg-blue-950/60 text-blue-300 border-b border-blue-700">Result</div>
          <table className="w-full text-xs font-mono">
            <thead><tr className="border-b border-gray-700 bg-gray-800/50">
              {cols.map(c => <th key={c} className="px-2 py-1 text-left text-gray-400 font-medium">{c}</th>)}
            </tr></thead>
            <tbody>{state.map((row, i) => (
              <tr key={i} className="border-b border-gray-800 last:border-0 bg-blue-500/10">
                {cols.map(c => <td key={c} className="px-2 py-1 text-blue-200">{String(row[c] ?? '')}</td>)}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full text-xs font-mono text-gray-600">
      Run a query to see the visualization
    </div>
  )
}

// ── Drag handle ───────────────────────────────────────────────────────────────
function DragHandle({ onMouseDown, color = 'violet' }: { onMouseDown: () => void; color?: string }) {
  const cls = color === 'blue'
    ? 'w-1 shrink-0 bg-gray-800 hover:bg-blue-500 cursor-col-resize transition-colors z-10'
    : 'w-1 shrink-0 bg-gray-800 hover:bg-violet-500 cursor-col-resize transition-colors z-10'
  return <div onMouseDown={onMouseDown} className={cls} title="Drag to resize" />
}

// ── Vertical Drag handle helper ───────────────────────────────────────────────
function DragHandleY({ onMouseDown, color = 'violet' }: { onMouseDown: () => void; color?: string }) {
  const cls = color === 'blue'
    ? 'h-1 shrink-0 bg-gray-800 hover:bg-blue-500 cursor-row-resize transition-colors z-10 w-full'
    : 'h-1 shrink-0 bg-gray-800 hover:bg-violet-500 cursor-row-resize transition-colors z-10 w-full'
  return <div onMouseDown={onMouseDown} className={cls} title="Drag to resize vertically" />
}

// ── Main VisualizerPage ───────────────────────────────────────────────────────
export default function VisualizerPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const preloadedCode = (location.state as any)?.code ?? ''
  const initMode: 'dsa' | 'sql' | 'sysdesign' =
    (location.state as any)?.mode ??
    (location.pathname === '/sql' ? 'sql' : 'dsa')
  const [mode, setMode] = useState<'dsa' | 'sql' | 'sysdesign'>(initMode)
  const [language, setLanguage] = useState<Language>('python')
  const [code, setCode] = useState(preloadedCode || DSA_TEMPLATES.python)
  const [sql, setSql] = useState(SQL_EXAMPLES[0].sql)
  const [speed, setSpeed] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [sqlVizZoom, setSqlVizZoom] = useState(1)
  const [sqlTableZoom, setSqlTableZoom] = useState(1)

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const decorationsRef = useRef<string[]>([])

  // SQL-specific state
  const [sqlSteps, setSqlSteps] = useState<any[]>([])
  const [sqlLoading, setSqlLoading] = useState(false)
  const [sqlError, setSqlError] = useState<string | null>(null)
  const [sqlCurrentStep, setSqlCurrentStep] = useState(0)
  const [sqlPlaying, setSqlPlaying] = useState(false)
  const sqlTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  // System Design-specific state
  const [sysCode, setSysCode] = useState(SYSDESIGN_TEMPLATES['LRU Cache'])
  const [sysSteps, setSysSteps] = useState<any[]>([])
  const [sysLoading, setSysLoading] = useState(false)
  const [sysError, setSysError] = useState<string | null>(null)
  const [sysCurrentStep, setSysCurrentStep] = useState(0)
  const [sysPlaying, setSysPlaying] = useState(false)
  const sysTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const sysCurrent = sysSteps[sysCurrentStep] ?? null
  const sysProgress = sysSteps.length > 0 ? ((sysCurrentStep + 1) / sysSteps.length) * 100 : 0

  // Resizable panels
  const schemaPanel  = useDrag(180, 120, 280)
  const codePanel    = useDrag(440, 240, 700)
  const vizPanel     = useDrag(360, 200, 600)
  const rightSidebar = useDrag(220, 160, 360, true)

  // ✅ FIXED AND INTEGRATED: Vertical Drag Panel Configurations
  const sqlInputPanel = useDragY(180, 80, 400)
  const sqlOutputPanel = useDragY(280, 120, 600)
  const sqlDiagramPanel = useDragY(260, 140, 500)

  const { steps, current, loading, playing, error,
  inputSource, inferredInputNote,
  setPlaying, visualize, next, prev, reset } = useVisualizer(speed)


  const currentStep = steps[current] ?? null
  const activeLine  = currentStep?.line ?? -1
  const progress    = steps.length > 0 ? ((current + 1) / steps.length) * 100 : 0

  // SQL autoplay
  useEffect(() => {
    if (sysPlaying) {
      sysTimer.current = setInterval(() => {
        setSysCurrentStep(c => {
          if (c >= sysSteps.length - 1) { setSysPlaying(false); return c }
          return c + 1
        })
      }, 900 / speed)
    } else if (sysTimer.current) {
      clearInterval(sysTimer.current)
    }
    return () => { if (sysTimer.current) clearInterval(sysTimer.current) }
  }, [sysPlaying, speed, sysSteps.length])

  // SQL autoplay (actual SQL one)
  useEffect(() => {
    if (sqlPlaying) {
      sqlTimer.current = setInterval(() => {
        setSqlCurrentStep(c => {
          if (c >= sqlSteps.length - 1) { setSqlPlaying(false); return c }
          return c + 1
        })
      }, 900 / speed)
    } else if (sqlTimer.current) {
      clearInterval(sqlTimer.current)
    }
    return () => { if (sqlTimer.current) clearInterval(sqlTimer.current) }
  }, [sqlPlaying, speed, sqlSteps.length])

  // Monaco active line highlight
  useEffect(() => {
    const editor = editorRef.current
    if (!editor || activeLine < 1) return
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [{
      range: { startLineNumber: activeLine, startColumn: 1, endLineNumber: activeLine, endColumn: 1000 },
      options: { isWholeLine: true, className: 'active-line-highlight', glyphMarginClassName: 'active-line-glyph' },
    }])
    editor.revealLineInCenterIfOutsideViewport(activeLine, 0)
  }, [activeLine])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    if (!preloadedCode) setCode(DSA_TEMPLATES[lang])
  }

  const handleDsaRun = () => visualize(code, language, 'dsa')

  const handleSysRun = async () => {
    setSysLoading(true); setSysError(null); setSysCurrentStep(0); setSysSteps([])
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/visualize`, { code: sysCode, language: 'python', category: 'system-design' })
      setSysSteps(res.data.steps)
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? 'Error analyzing code'
      setSysError(msg.includes('rate') || msg.includes('429') ? 'Rate limit reached — wait a minute.' : msg)
    } finally {
      setSysLoading(false)
    }
  }

  const handleSqlRun = async () => {
    setSqlLoading(true); setSqlError(null); setSqlCurrentStep(0); setSqlSteps([])
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/visualize`, { code: sql, language: 'sql', category: 'sql' })
      setSqlSteps(res.data.steps)
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? 'Error analyzing query'
      setSqlError(msg.includes('rate') || msg.includes('429') ? 'Rate limit reached — wait a minute.' : msg)
    } finally {
      setSqlLoading(false)
    }
  }

  const sqlStep     = sqlSteps[sqlCurrentStep] ?? null
  const sqlProgress = sqlSteps.length > 0 ? ((sqlCurrentStep + 1) / sqlSteps.length) * 100 : 0

  // ══════════════════════════════════════════════════════════════════════════
  // SQL MODE
  // ══════════════════════════════════════════════════════════════════════════
  if (mode === 'sql') {
    return (
      <div className="flex flex-col h-screen w-full bg-gray-950 text-white overflow-hidden select-none">
        {/* TOP BAR */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-800 bg-gray-900 shrink-0 w-full">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer">
            ← Back
          </button>
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-violet-400 font-bold">⬡</span>
            <span className="font-mono font-bold text-white text-sm">dsa<span className="text-violet-400">viz</span></span>
          </button>
          <span className="text-gray-700 text-xs font-mono">/</span>
          
          {/* Mode toggle */}
          <div className="flex gap-1 bg-gray-800 rounded-lg p-0.5">
            <button onClick={() => setMode('dsa')}
              className="px-3 py-1 text-xs font-mono rounded-md transition-colors text-gray-400 hover:text-white cursor-pointer">
              DSA
            </button>
            <button onClick={() => setMode('sql')}
              className="px-3 py-1 text-xs font-mono rounded-md transition-colors bg-blue-600 text-white cursor-pointer">
              SQL
            </button>
            <button onClick={() => setMode('sysdesign' as any)}
              className="px-3 py-1 text-xs font-mono rounded-md transition-colors text-gray-400 hover:text-white cursor-pointer">
              System Design
          </button>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-600 font-mono hidden lg:block">Groq · Llama 3.3</span>
            
            {/* Examples dropdown */}
            <select
              value=""
              onChange={e => { if (e.target.value) setSql(e.target.value) }}
              className="text-xs font-mono bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1.5 rounded-lg outline-none cursor-pointer"
            >
              <option value="">Examples…</option>
              {SQL_EXAMPLES.map(q => <option key={q.label} value={q.sql}>{q.label}</option>)}
            </select>
            <button onClick={handleSqlRun} disabled={sqlLoading}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer">
              {sqlLoading ? '⟳ Running…' : '▶ Run SQL'}
            </button>
          </div>
        </div>

        {/* THREE-PANEL EDGE-TO-EDGE VIEWPORT BODY */}
        <div className="flex flex-1 overflow-hidden w-full">

          {/* Schema sidebar — resizable */}
          <div className="shrink-0 border-r border-gray-800 bg-gray-900/50 flex flex-col overflow-hidden" style={{ width: schemaPanel.size }}>
            <div className="px-3 py-2 border-b border-gray-800 shrink-0 flex items-center justify-between">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Schema</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SchemaSidebar />
            </div>
          </div>
          <DragHandle onMouseDown={schemaPanel.onMouseDown} color="blue" />

          {/* SQL Editor Area with Dynamic useDragY Height Constraints */}
          <div className="shrink-0 flex flex-col overflow-hidden border-r border-gray-800" style={{ width: codePanel.size }}>
            <div className="flex items-center px-4 py-1.5 border-b border-gray-800 bg-gray-900 shrink-0">
              <span className="text-xs font-mono text-gray-400 font-medium">SQL Query</span>
            </div>
            <div className="border-b border-gray-800 bg-gray-950 shrink-0 overflow-hidden" style={{ height: sqlInputPanel.size }}>
              <textarea
                value={sql}
                onChange={e => setSql(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-transparent font-mono text-sm text-gray-200 px-5 py-3 outline-none resize-none leading-relaxed"
                placeholder="-- Write your SQL query here&#10;SELECT * FROM Customers;"
              />
            </div>
            <DragHandleY onMouseDown={sqlInputPanel.onMouseDown} color="blue" />

            {/* Output area — handles remaining interior block dimensions */}
            <div className="flex-1 overflow-auto bg-gray-950/60" style={{ height: sqlOutputPanel.size }}>
              {sqlLoading && (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-mono text-gray-500">Analyzing query…</p>
                </div>
              )}
              {sqlError && !sqlLoading && (
                <div className="m-4 bg-red-950/50 border border-red-800 rounded-xl p-4">
                  <div className="text-xs font-mono text-red-400 mb-1">Error</div>
                  <p className="text-xs text-red-300 leading-relaxed">{sqlError}</p>
                </div>
              )}
              {!sqlLoading && !sqlError && sqlSteps.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-700">
                  <span className="text-3xl">⊞</span>
                  <p className="text-sm font-mono">Write a SQL query and click Run SQL</p>
                </div>
              )}
              {!sqlLoading && sqlSteps.length > 0 && (() => {
                const outputCols = sqlStep?.state?.[0] ? Object.keys(sqlStep.state[0]) : []
                return (
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-200">Output</span>
                      <span className="text-xs font-mono text-gray-600">step {sqlCurrentStep + 1} / {sqlSteps.length}</span>
                    </div>
                    {Array.isArray(sqlStep?.state) && sqlStep.state.length > 0 && outputCols.length > 0 && (
                      <div className="border border-gray-700 rounded-xl overflow-hidden shadow bg-gray-950">
                        <table className="w-full text-sm font-mono">
                          <thead><tr className="bg-gray-800/70 border-b border-gray-700">
                            {outputCols.map(k => <th key={k} className="px-4 py-2 text-left text-gray-300 font-medium text-xs">{k}</th>)}
                          </tr></thead>
                          <tbody>
                            <AnimatePresence mode="sync">
                              {sqlStep.state.map((row: any, i: number) => {
                                const isHL = sqlStep.highlights?.includes(i)
                                return (
                                  <motion.tr key={i} layout initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className={`border-b border-gray-800 last:border-0 ${isHL ? 'bg-blue-500/12' : 'hover:bg-gray-800/20'}`}>
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
                    )}
                    {sqlStep?.explanation && (
                      <div className="flex items-start gap-2 text-xs font-mono text-gray-400 bg-gray-900/50 border border-gray-800 px-3 py-2 rounded-xl">
                        <span className="text-blue-400 shrink-0">→</span>
                        <span className="leading-relaxed">{sqlStep.explanation}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => setSqlCurrentStep(0)} className="text-gray-500 hover:text-white transition-colors cursor-pointer">⏮</button>
                      <button onClick={() => setSqlCurrentStep(c => Math.max(0, c - 1))} className="text-gray-500 hover:text-white transition-colors cursor-pointer">◀</button>
                      <button onClick={() => setSqlPlaying(p => !p)}
                        className="w-6 h-6 flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded-full text-white text-xs transition-colors cursor-pointer">
                        {sqlPlaying ? '⏸' : '▶'}
                      </button>
                      <div className="flex-1 bg-gray-800 rounded-full h-1">
                        <div className="bg-blue-500 h-1 rounded-full transition-all duration-300" style={{ width: `${sqlProgress}%` }} />
                      </div>
                      <button onClick={() => setSqlCurrentStep(c => Math.min(sqlSteps.length - 1, c + 1))} className="text-gray-500 hover:text-white transition-colors cursor-pointer">▶</button>
                      <span className="text-xs font-mono text-gray-500 min-w-[48px] text-right">{sqlCurrentStep + 1} / {sqlSteps.length}</span>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
          <div className="w-1 shrink-0 bg-gray-800 hover:bg-blue-500 cursor-col-resize transition-colors" onMouseDown={codePanel.onMouseDown} />

          {/* Right Area: Dynamic Height Relation Diagram Canvas Section */}          
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-900/30 min-w-0">
            <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-800 bg-gray-900 shrink-0">
              <span className="text-sm font-semibold text-gray-200">Visualization Diagram Canvas</span>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs font-mono text-gray-500">Zoom</span>
                <button onClick={() => setSqlVizZoom(z => Math.max(0.5, +(z - 0.1).toFixed(1)))}
                  className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white border border-gray-700 rounded transition-colors text-xs">−</button>
                <input type="range" min={0.5} max={2} step={0.1} value={sqlVizZoom}
                  onChange={e => setSqlVizZoom(Number(e.target.value))}
                  className="w-20 accent-blue-500 cursor-pointer" style={{ height: 2 }} />
                <button onClick={() => setSqlVizZoom(z => Math.min(2, +(z + 0.1).toFixed(1)))}
                  className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white border border-gray-700 rounded transition-colors text-xs">+</button>
                <span className="text-xs font-mono text-gray-500 min-w-[32px]">{sqlVizZoom.toFixed(1)}×</span>
                {sqlSteps.length > 0 && (
                  <span className="text-xs font-mono text-gray-600 ml-2">Step {sqlCurrentStep + 1}/{sqlSteps.length}</span>
                )}
              </div>
            </div>

            {/* Animation Canvas floor with resizable support wireup bounds layout */}
            <div className="border-b border-gray-800 bg-gray-950 overflow-auto shrink-0" style={{ height: sqlDiagramPanel.size }}>
              {sqlSteps.length > 0 && sqlStep ? (

                <div
                  style={{
                    transform: `scale(${sqlVizZoom})`,
                    transformOrigin: 'top left',
                    transition: 'transform 0.15s ease-out',
                  }}
                >
                  <SQLVisualization sql={sql} step={sqlStep} />
                </div>

              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-700 min-h-[140px]">
                  <span className="text-2xl">⊞</span>
                  <span className="text-xs font-mono">Run SQL to see visualization</span>
                </div>
              )}
            </div>

            <DragHandleY onMouseDown={sqlDiagramPanel.onMouseDown} color="blue" />

            {/* Static Database table snapshots */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-4 pt-3 pb-2 shrink-0">
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Available Snapshot Tables</span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">Zoom</span>
                  <button onClick={() => setSqlTableZoom(z => Math.max(0.5, +(z - 0.1).toFixed(1)))}
                    className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white border border-gray-700 rounded transition-colors text-xs">−</button>
                  <input type="range" min={0.5} max={2} step={0.1} value={sqlTableZoom}
                    onChange={e => setSqlTableZoom(Number(e.target.value))}
                    className="w-20 accent-blue-500 cursor-pointer" style={{ height: 2 }} />
                  <button onClick={() => setSqlTableZoom(z => Math.min(2, +(z + 0.1).toFixed(1)))}
                    className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white border border-gray-700 rounded transition-colors text-xs">+</button>
                  <span className="text-xs font-mono text-gray-500 min-w-[32px]">{sqlTableZoom.toFixed(1)}×</span>
                </div>
              </div>

              <div className="flex-1 overflow-auto px-4 pb-3">
                <div
                  style={{
                    transform: `scale(${sqlTableZoom})`,
                    transformOrigin: 'top left',
                    transition: 'transform 0.15s ease-out',
                  }}
                >
                  {Object.entries(SCHEMA).map(([name, { data }]) => {
                    const keys = data.length > 0 ? Object.keys(data[0]) : []
                    return (
                      <div key={name} className="mb-4">
                        <div className="text-xs font-semibold text-gray-300 mb-1">{name}</div>
                        <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-950">
                          <table className="w-full text-xs font-mono">
                            <thead><tr className="bg-gray-800/70 border-b border-gray-700">
                              {keys.map(k => <th key={k} className="px-2 py-1.5 text-left text-gray-400 font-medium whitespace-nowrap">{k}</th>)}
                            </tr></thead>
                            <tbody>{data.map((row, i) => (
                              <tr key={i} className="border-b border-gray-800/60 last:border-0 hover:bg-gray-800/20">
                                {keys.map(k => <td key={k} className="px-2 py-1.5 text-gray-300 whitespace-nowrap">{String(row[k])}</td>)}
                              </tr>
                            ))}</tbody>
                          </table>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM GLOBAL TIMELINE PROGRESS TRACK CONTROL BAR */}
        <div className="border-t border-gray-800 bg-gray-900 px-4 py-1.5 flex items-center gap-3 shrink-0 w-full">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setSqlCurrentStep(0)} className="text-gray-600 hover:text-white transition-colors cursor-pointer">⏮</button>
            <button onClick={() => setSqlCurrentStep(c => Math.max(0, c - 1))} className="text-gray-600 hover:text-white transition-colors cursor-pointer">◀</button>
            <button onClick={() => setSqlPlaying(p => !p)}
              className="w-6 h-6 flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded-full text-white text-xs transition-colors cursor-pointer">
              {sqlPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={() => setSqlCurrentStep(c => Math.min(sqlSteps.length - 1, c + 1))} className="text-gray-600 hover:text-white transition-colors cursor-pointer">▶</button>
          </div>
          <div className="flex-1 bg-gray-800 rounded-full h-1">
            <div className="bg-blue-500 h-1 rounded-full transition-all duration-300" style={{ width: `${sqlProgress}%` }} />
          </div>
          <span className="text-xs font-mono text-gray-600 min-w-[44px] text-right">{sqlSteps.length > 0 ? `${sqlCurrentStep + 1} / ${sqlSteps.length}` : ''}</span>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-gray-600 font-mono">Speed</span>
            <input type="range" min={0.5} max={5} step={0.5} value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="w-20 accent-blue-500 cursor-pointer" style={{ height: 2 }} />
            <span className="text-xs font-mono text-gray-600">{speed}×</span>
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SYSTEM DESIGN MODE
  // ══════════════════════════════════════════════════════════════════════════

  if (mode === 'sysdesign') {
    return (
      <div className="flex flex-col h-screen w-full bg-gray-950 text-white overflow-hidden select-none">
        {/* TOP BAR */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-800 bg-gray-900 shrink-0 w-full">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer">
            ← Back
          </button>
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-violet-400 font-bold">⬡</span>
            <span className="font-mono font-bold text-white text-sm">dsa<span className="text-violet-400">viz</span></span>
          </button>
          <span className="text-gray-700 text-xs font-mono">/</span>

          <div className="flex gap-1 bg-gray-800 rounded-lg p-0.5">
            <button onClick={() => setMode('dsa')}
              className="px-3 py-1 text-xs font-mono rounded-md transition-colors text-gray-400 hover:text-white cursor-pointer">DSA</button>
            <button onClick={() => setMode('sql')}
              className="px-3 py-1 text-xs font-mono rounded-md transition-colors text-gray-400 hover:text-white cursor-pointer">SQL</button>
            <button onClick={() => setMode('sysdesign')}
              className="px-3 py-1 text-xs font-mono rounded-md transition-colors bg-emerald-600 text-white cursor-pointer">System Design</button>
          </div>

          {/* Examples dropdown */}
          <select
            value=""
            onChange={e => { if (e.target.value) setSysCode(SYSDESIGN_TEMPLATES[e.target.value]) }}
            className="text-xs font-mono bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1.5 rounded-lg outline-none cursor-pointer"
          >
            <option value="">Examples…</option>
            {SYSDESIGN_EXAMPLE_GROUPS.map(group => (
              <optgroup key={group.label} label={group.label}>
                {group.items.map(item => <option key={item} value={item}>{item}</option>)}
              </optgroup>
            ))}
          </select>

          <button onClick={handleSysRun} disabled={sysLoading}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer">
            {sysLoading ? '⟳ Running…' : '▶ Run'}
          </button>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-600 font-mono hidden lg:block">Groq · Llama 3.3</span>
          </div>
        </div>

        {/* BODY — code left, visualization right (matches SQL mode pattern) */}
        <div className="flex flex-1 overflow-hidden w-full">

          {/* Code editor */}
          <div className="shrink-0 flex flex-col overflow-hidden border-r border-gray-800" style={{ width: codePanel.size }}>
            <div className="flex items-center px-4 py-1.5 border-b border-gray-800 bg-gray-900 shrink-0">
              <span className="text-xs font-mono text-gray-400 font-medium">Code</span>
            </div>
            <textarea
              value={sysCode}
              onChange={e => setSysCode(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full bg-gray-950 font-mono text-sm text-gray-200 px-5 py-4 outline-none resize-none leading-relaxed"
              placeholder="-- Write Python class-based system design code here"
            />
          </div>
          <div className="w-1 shrink-0 bg-gray-800 hover:bg-emerald-500 cursor-col-resize transition-colors" onMouseDown={codePanel.onMouseDown} />

          {/* Visualization */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-900/30 min-w-0">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 bg-gray-900 shrink-0">
              <span className="text-sm font-semibold text-gray-200">Visualization</span>
              {sysSteps.length > 0 && (
                <span className="ml-auto text-xs font-mono text-gray-600">Step {sysCurrentStep + 1}/{sysSteps.length}</span>
              )}
            </div>

            <div className="flex-1 overflow-auto">
              {sysLoading && (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-mono text-gray-500">Analyzing system design…</p>
                </div>
              )}
              {sysError && !sysLoading && (
                <div className="m-4 bg-red-950/50 border border-red-800 rounded-xl p-4">
                  <div className="text-xs font-mono text-red-400 mb-1">Error</div>
                  <p className="text-xs text-red-300 leading-relaxed">{sysError}</p>
                </div>
              )}
              {!sysLoading && !sysError && sysSteps.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-700">
                  <span className="text-3xl">🏗️</span>
                  <p className="text-sm font-mono">Write or pick an example, then click Run</p>
                </div>
              )}
              {!sysLoading && sysCurrent && (
                <div className="p-4 flex flex-col gap-3">
                  {/* State snapshot */}
                  <div className="border border-gray-700 rounded-xl overflow-hidden bg-gray-950">
                    <div className="px-3 py-1.5 text-xs font-mono font-semibold bg-emerald-950/60 text-emerald-300 border-b border-emerald-800">
                      {sysCurrent.operation ?? 'State'}
                    </div>
                    <pre className="p-3 text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(sysCurrent.state, null, 2)}
                    </pre>
                  </div>
                  {sysCurrent.explanation && (
                    <div className="flex items-start gap-2 text-xs font-mono text-gray-400 bg-gray-900/50 border border-gray-800 px-3 py-2.5 rounded-xl">
                      <span className="text-emerald-400 shrink-0">→</span>
                      <span className="leading-relaxed">{sysCurrent.explanation}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => setSysCurrentStep(0)} className="text-gray-500 hover:text-white transition-colors text-sm">⏮</button>
                    <button onClick={() => setSysCurrentStep(c => Math.max(0, c - 1))} className="text-gray-500 hover:text-white transition-colors">◀</button>
                    <button onClick={() => setSysPlaying(p => !p)}
                      className="w-6 h-6 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 rounded-full text-white text-xs transition-colors">
                      {sysPlaying ? '⏸' : '▶'}
                    </button>
                    <div className="flex-1 bg-gray-800 rounded-full h-1">
                      <div className="bg-emerald-500 h-1 rounded-full transition-all duration-300" style={{ width: `${sysProgress}%` }} />
                    </div>
                    <button onClick={() => setSysCurrentStep(c => Math.min(sysSteps.length - 1, c + 1))} className="text-gray-500 hover:text-white transition-colors">▶</button>
                    <span className="text-xs font-mono text-gray-500 min-w-[48px] text-right">{sysCurrentStep + 1} / {sysSteps.length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-gray-800 bg-gray-900 px-4 py-1.5 flex items-center gap-3 shrink-0 w-full">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setSysCurrentStep(0)} className="text-gray-600 hover:text-white transition-colors">⏮</button>
            <button onClick={() => setSysCurrentStep(c => Math.max(0, c - 1))} className="text-gray-600 hover:text-white transition-colors">◀</button>
            <button onClick={() => setSysPlaying(p => !p)}
              className="w-6 h-6 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 rounded-full text-white text-xs transition-colors">
              {sysPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={() => setSysCurrentStep(c => Math.min(sysSteps.length - 1, c + 1))} className="text-gray-600 hover:text-white transition-colors">▶</button>
          </div>
          <div className="flex-1 bg-gray-800 rounded-full h-1">
            <div className="bg-emerald-500 h-1 rounded-full transition-all duration-300" style={{ width: `${sysProgress}%` }} />
          </div>
          <span className="text-xs font-mono text-gray-600">{sysSteps.length > 0 ? `${sysCurrentStep + 1} / ${sysSteps.length}` : ''}</span>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-gray-600 font-mono">Speed</span>
            <input type="range" min={0.5} max={5} step={0.5} value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="w-20 accent-emerald-500 cursor-pointer" style={{ height: 2 }} />
            <span className="text-xs font-mono text-gray-600">{speed}×</span>
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DSA MODE (Unchanged Core Layout Base Structure Flow Router Execution)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden select-none w-full">
      {/* TOP BAR */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-800 bg-gray-900 shrink-0 w-full">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer">
          ← Back
        </button>
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 cursor-pointer">
          <span className="text-violet-400 font-bold">⬡</span>
          <span className="font-mono font-bold text-white text-sm">dsa<span className="text-violet-400">viz</span></span>
        </button>
        <span className="text-gray-700 text-xs font-mono">/</span>

        {/* Mode toggle */}
        <div className="flex gap-1 bg-gray-800 rounded-lg p-0.5">
          <button onClick={() => setMode('dsa')}
            className="px-3 py-1 text-xs font-mono rounded-md transition-colors bg-violet-600 text-white cursor-pointer">
            DSA
          </button>
          <button onClick={() => setMode('sql')}
            className="px-3 py-1 text-xs font-mono rounded-md transition-colors text-gray-400 hover:text-white cursor-pointer">
            SQL
          </button>
          <button onClick={() => setMode('sysdesign' as any)}
            className="px-3 py-1 text-xs font-mono rounded-md transition-colors text-gray-400 hover:text-white cursor-pointer">
            System Design
          </button>
        </div>

        {/* Language tabs */}
        <div className="flex gap-1 ml-2">
          {(['python', 'javascript', 'cpp'] as Language[]).map(lang => (
            <button key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                language === lang ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JS' : 'Python'}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-gray-600 font-mono hidden lg:block">Groq · Llama 3.3</span>

          {/* Examples dropdown */}

          <select
            value=""
            onChange={e => { if (e.target.value) setCode(e.target.value) }}
            className="text-xs font-mono bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1.5 rounded-lg outline-none cursor-pointer max-w-[160px]"
          >
            <option value="">Examples…</option>
            <optgroup label="Arrays & Sorting">
              <option value={`arr = [5, 3, 8, 1, 9, 2]
          for i in range(len(arr)):
              for j in range(len(arr) - i - 1):
                  if arr[j] > arr[j + 1]:
                      arr[j], arr[j + 1] = arr[j + 1], arr[j]`}>Bubble Sort</option>
              <option value={`arr = [1, 3, 5, 7, 9, 11, 13]
          target = 7
          left, right = 0, len(arr) - 1
          while left <= right:
              mid = (left + right) // 2
              if arr[mid] == target:
                  break
              elif arr[mid] < target:
                  left = mid + 1
              else:
                  right = mid - 1`}>Binary Search</option>
              <option value={`arr = [64, 25, 12, 22, 11]
          n = len(arr)
          for i in range(n):
              min_idx = i
              for j in range(i + 1, n):
                  if arr[j] < arr[min_idx]:
                      min_idx = j
              arr[i], arr[min_idx] = arr[min_idx], arr[i]`}>Selection Sort</option>
              <option value={`arr = [1, 2, 3, 4, 5, 6]
          target = 7
          left, right = 0, len(arr) - 1
          pairs = []
          while left < right:
              s = arr[left] + arr[right]
              if s == target:
                  pairs.append((arr[left], arr[right]))
                  left += 1
                  right -= 1
              elif s < target:
                  left += 1
              else:
                  right -= 1`}>Two Pointers</option>
            </optgroup>
            <optgroup label="Stack & Queue">
              <option value={`stack = []
          for val in [10, 20, 30, 40, 50]:
              stack.append(val)
          while stack:
              top = stack.pop()
              print(top)`}>Stack Push/Pop</option>
              <option value={`from collections import deque
          queue = deque()
          for val in ['A', 'B', 'C', 'D', 'E']:
              queue.append(val)
          while queue:
              first = queue.popleft()
              print(first)`}>Queue FIFO</option>
            </optgroup>
            <optgroup label="Linked List">
              <option value={`class Node:
              def __init__(self, val):
                  self.val = val
                  self.next = None

          head = Node(1)
          head.next = Node(2)
          head.next.next = Node(3)
          head.next.next.next = Node(4)

          curr = head
          while curr:
              print(curr.val)
              curr = curr.next`}>Linked List Traversal</option>
            </optgroup>
            <optgroup label="Trees & Graphs">
              <option value={`class Node:
              def __init__(self, val):
                  self.val = val
                  self.left = None
                  self.right = None

          root = Node(8)
          root.left = Node(3)
          root.right = Node(11)
          root.left.left = Node(1)
          root.left.right = Node(6)
          root.right.right = Node(13)`}>BST Insert</option>
              <option value={`from collections import deque
          graph = {
              'A': ['B', 'C'],
              'B': ['D', 'E'],
              'C': ['F'],
              'D': [], 'E': [], 'F': []
          }
          visited = []
          queue = deque(['A'])
          while queue:
              node = queue.popleft()
              if node not in visited:
                  visited.append(node)
                  for n in graph[node]:
                      queue.append(n)`}>BFS Graph</option>
            </optgroup>
            <optgroup label="System Design">
              <option value={`from collections import OrderedDict

          class LRUCache:
              def __init__(self, cap):
                  self.cap = cap
                  self.cache = OrderedDict()
              def get(self, key):
                  if key in self.cache:
                      self.cache.move_to_end(key)
                      return self.cache[key]
                  return -1
              def put(self, key, val):
                  self.cache[key] = val
                  self.cache.move_to_end(key)
                  if len(self.cache) > self.cap:
                      self.cache.popitem(last=False)

          lru = LRUCache(3)
          lru.put(1, 'A')
          lru.put(2, 'B')
          lru.put(3, 'C')
          lru.get(1)
          lru.put(4, 'D')`}>LRU Cache</option>
            </optgroup>
          </select>

          <button onClick={handleDsaRun} disabled={loading}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer">
            {loading ? '⟳ Analyzing…' : '▶ Visualize Your Code'}
          </button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex flex-1 overflow-hidden w-full">
        {/* CODE EDITOR — resizable */}
        <div className="shrink-0 flex flex-col overflow-hidden relative" style={{ width: codePanel.size }}>
          <style>{`
            .active-line-highlight { background: rgba(59,130,246,0.15) !important; border-left: 2px solid #3b82f6; }
            .active-line-glyph { background: #3b82f6; width: 3px !important; }
          `}</style>
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language === 'javascript' ? 'javascript' : 'python'}
              value={code}
              onChange={v => setCode(v || '')}
              theme="vs-dark"
              onMount={(editor, monaco) => {
                editorRef.current = editor
                monaco.editor.defineTheme('dsaviz', {
                  base: 'vs-dark', inherit: true, rules: [],
                  colors: { 'editor.background': '#030712', 'editor.lineHighlightBackground': '#0a0a1a' }
                })
                monaco.editor.setTheme('dsaviz')
              }}
              options={{
                fontSize: 14, fontFamily: '"Fira Code","JetBrains Mono",monospace',
                fontLigatures: true, minimap: { enabled: false }, lineNumbers: 'on',
                scrollBeyondLastLine: false, padding: { top: 12, bottom: 12 },
                renderLineHighlight: 'none', wordWrap: 'off', automaticLayout: true,
              }}
            />
          </div>
          <div className="flex items-center gap-4 px-4 py-1 bg-gray-900 border-t border-gray-800 shrink-0 text-xs font-mono">
            <span className="text-gray-600">{language === 'cpp' ? 'C++' : language === 'javascript' ? 'JavaScript' : 'Python'}</span>
            <span className="text-gray-800">·</span>
            <span className="text-gray-600">{code.split('\n').length} lines</span>
            {activeLine > 0 && steps.length > 0 && <><span className="text-gray-800">·</span><span className="text-blue-400">line {activeLine}</span></>}
            {steps.length > 0 && <><span className="text-gray-800">·</span><span className="text-violet-400">{current + 1}/{steps.length} steps</span></>}
          </div>

          {/* Loading overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-950/70 flex flex-col items-center justify-center gap-3 z-30">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-mono text-gray-400">AI is analyzing your code…</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DragHandle onMouseDown={codePanel.onMouseDown} color="violet" />

        {/* VISUALIZATION PANEL — resizable */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-800 min-w-0">
        {/*<div className="shrink-0 flex flex-col overflow-hidden border-r border-gray-800" style={{ width: vizPanel.size }}>*/}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 bg-gray-900 shrink-0">
            <span className="text-xs font-mono text-violet-400 uppercase tracking-widest">Visualization</span>
            {steps.length > 0 && (
              <span className="text-xs font-mono text-gray-600">step {current + 1}/{steps.length}</span>
            )}
          </div>

          <div className="flex-1 overflow-auto flex flex-col">
            <InferredInputBanner
              inputSource={inputSource}
              inferredInputNote={inferredInputNote}
              visible={!loading && steps.length > 0}
            />
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                width: `${100 / zoom}%`,
                transition: 'transform 0.15s ease-out',
              }}
            >
              <Visualizer steps={steps} current={current} loading={false} error={error} />
            </div>
          </div>

          {/* Step explanation */}
          {currentStep?.explanation && (
            <div className="px-3 py-2 border-t border-gray-800 bg-gray-900/60 shrink-0">
              <div className="flex items-start gap-2 text-xs font-mono text-gray-400">
                <span className="text-violet-400 shrink-0">→</span>
                <span className="leading-relaxed line-clamp-2">{currentStep.explanation}</span>
              </div>
            </div>
          )}
          {/* Error */}
          {error && !loading && (
            <div className="m-3 bg-red-950/50 border border-red-800 rounded-xl p-3 shrink-0">
              <p className="text-xs font-mono text-red-400 leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/*<DragHandle onMouseDown={vizPanel.onMouseDown} color="violet" />*/}

        {/* RIGHT SIDEBAR — resizable */}
        <div className="shrink-0 border-l border-gray-800 bg-gray-900 flex flex-col overflow-hidden" style={{ width: rightSidebar.size }}>
          <div className="flex flex-col overflow-y-auto h-full" style={{ width: rightSidebar.size }}>
            <div className="px-3 py-2 border-b border-gray-800 shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Speed</span>
                <span className="text-xs font-mono text-gray-500">{speed}×</span>
              </div>
              <input type="range" min={0.5} max={5} step={0.5} value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer" style={{ height: 2 }} />
            </div>
            <div className="px-3 py-2 border-b border-gray-800 shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Zoom</span>
                <span className="text-xs font-mono text-gray-500">{zoom.toFixed(1)}×</span>
              </div>
              <input type="range" min={0.5} max={2} step={0.1} value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer" style={{ height: 2 }} />
            </div>
            <div className="px-3 py-2 border-b border-gray-800 shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Step</span>
                <span className="text-xs font-mono text-gray-500">{steps.length > 0 ? `${current + 1}/${steps.length}` : '—'}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1">
                <div className="bg-violet-500 h-1 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="px-3 py-2 border-b border-gray-800 shrink-0">
              <div className="flex items-center justify-center gap-2">
                <button onClick={reset} className="text-gray-500 hover:text-white transition-colors cursor-pointer">⏮</button>
                <button onClick={prev} className="text-gray-500 hover:text-white transition-colors cursor-pointer">◀</button>
                <button onClick={() => setPlaying(p => !p)}
                  className="w-9 h-9 flex items-center justify-center bg-violet-600 hover:bg-violet-500 rounded-full text-white transition-colors text-sm cursor-pointer">
                  {playing ? '⏸' : '▶'}
                </button>
                <button onClick={next} className="text-gray-500 hover:text-white transition-colors cursor-pointer">▶</button>
                <button onClick={reset} className="text-gray-500 hover:text-white transition-colors text-sm cursor-pointer">↺</button>
              </div>
            </div>
            <div className="px-3 py-2 flex-1">
              <div className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-2">What's happening</div>
              {currentStep ? (
                <div className="flex flex-col gap-2">
                  <div className="bg-gray-950 border border-gray-800 rounded-lg p-2">
                    <p className="text-xs text-gray-200 leading-relaxed">{currentStep.explanation}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs font-mono bg-violet-950/60 border border-violet-800 text-violet-300 px-2 py-0.5 rounded-full">
                      {currentStep.operation?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono bg-blue-950/60 border border-blue-800 text-blue-300 px-2 py-0.5 rounded-full">
                      ln {currentStep.line}
                    </span>
                    <span className="text-xs font-mono bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
                      {currentStep.ds_type}
                    </span>
                  </div>
                  {steps.length > 1 && (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="text-xs font-mono text-gray-700 uppercase tracking-widest mb-0.5">Recent</div>
                      {steps.slice(Math.max(0, current - 2), current + 1).reverse().map((s, i) => (
                        <div key={i} className={`text-xs font-mono px-2 py-1 rounded-lg border ${
                          i === 0 ? 'bg-violet-950/30 border-violet-800/60 text-violet-300' : 'bg-gray-900 border-gray-800 text-gray-600'
                        }`}>
                          <span className="text-gray-700 mr-1">#{s.step}</span>
                          {s.operation?.replace(/_/g, ' ')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                  <span className="text-2xl text-gray-800">⬡</span>
                  <p className="text-xs text-gray-700 font-mono leading-relaxed">Run code to see explanations</p>
                </div>
              )}
            </div>
            <div className="px-3 py-2 border-t border-gray-800 shrink-0">
              <div className="flex gap-1">
                {(['python', 'javascript', 'cpp'] as Language[]).map(lang => (
                  <button key={lang} onClick={() => handleLanguageChange(lang)}
                    className={`flex-1 py-1 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
                      language === lang ? 'bg-violet-600 border-violet-500 text-white' : 'border-gray-700 text-gray-500 hover:border-gray-500'
                    }`}>
                    {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JS' : 'Py'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="border-t border-gray-800 bg-gray-900 px-4 py-1.5 flex items-center gap-3 shrink-0 w-full">
        <div className="flex items-center gap-1.5">
          <button onClick={reset} className="text-gray-600 hover:text-white transition-colors cursor-pointer">⏮</button>
          <button onClick={prev} className="text-gray-600 hover:text-white transition-colors cursor-pointer">◀</button>
          <button onClick={() => setPlaying(p => !p)}
            className="w-8 h-8 flex items-center justify-center bg-violet-600 hover:bg-violet-500 rounded-full text-white text-sm transition-colors cursor-pointer">
            {playing ? '⏸' : '▶'}
          </button>
          <button onClick={next} className="text-gray-600 hover:text-white transition-colors cursor-pointer">▶</button>
          <button onClick={reset} className="text-gray-500 hover:text-white transition-colors text-sm cursor-pointer">↺</button>
        </div>
        <div className="flex-1 bg-gray-800 rounded-full h-1">
          <div className="bg-violet-500 h-1 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs font-mono text-gray-600">{steps.length > 0 ? `${current + 1} / ${steps.length}` : ''}</span>
        {steps.length === 0 && !loading && (
          <button onClick={handleDsaRun}
            className="text-xs text-violet-400 hover:text-violet-300 font-mono border border-violet-800 px-3 py-1 rounded-lg transition-colors cursor-pointer">
            ▶ Run to visualize
          </button>
        )}
      </div>
    </div>
  )
}