import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import SignInModal from './SignInModal'

interface Props {
  dark: boolean
  setDark: (v: boolean) => void
  showBack?: boolean
}

const SEARCH_ITEMS = [
  { label: 'Bubble Sort',       path: '/dsa' },
  { label: 'Binary Search',     path: '/dsa' },
  { label: 'Linked List',       path: '/dsa' },
  { label: 'Stack & Queue',     path: '/dsa' },
  { label: 'BFS Traversal',     path: '/dsa' },
  { label: 'DFS Traversal',     path: '/dsa' },
  { label: 'Two Pointers',      path: '/dsa' },
  { label: 'Sliding Window',    path: '/dsa' },
  { label: 'LRU Cache',         path: '/category/system-design' },
  { label: 'Rate Limiter',      path: '/category/system-design' },
  { label: 'Priority Queue',    path: '/category/system-design' },
  { label: 'Load Balancer',     path: '/category/system-design' },
  { label: 'Coin Change DP',    path: '/category/dp' },
  { label: 'Knapsack',          path: '/category/dp' },
  { label: 'Fibonacci DP',      path: '/category/dp' },
  { label: 'LCS',               path: '/category/dp' },
  { label: 'SQL JOIN',          path: '/category/sql' },
  { label: 'Index Search',      path: '/category/sql' },
  { label: 'GROUP BY',          path: '/category/sql' },
  { label: 'SELECT Filter',     path: '/category/sql' },
]

export default function Navbar({ dark, setDark, showBack = true }: Props) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)

  const filtered = search.length > 1
    ? SEARCH_ITEMS.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : []

  return (
    <>
      <nav className="sticky top-0 z-40 flex items-center gap-3 px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur">

        {/* Back button */}
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            ← Back
          </button>
        )}

        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 shrink-0">
          <span className="text-violet-500 text-lg font-bold">⬡</span>
          <span className="font-mono font-bold text-gray-900 dark:text-white text-base">
            dsa<span className="text-violet-500">viz</span>
          </span>
        </button>

        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-1.5 focus-within:border-violet-400 dark:focus-within:border-violet-600 transition-colors">
            <span className="text-gray-400 text-sm shrink-0">⌕</span>
            <input
              type="text"
              placeholder="Search algorithms, topics..."
              value={search}
              onChange={e => { setSearch(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 text-xs shrink-0 transition-colors">✕</button>
            )}
          </div>

          {/* Search dropdown */}
          {open && filtered.length > 0 && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">
              {filtered.map(item => (
                <button
                  key={item.label}
                  onClick={() => { navigate(item.path); setSearch(''); setOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <span className="text-gray-400 text-xs">⌕</span>
                  <span>{item.label}</span>
                  <span className="ml-auto text-xs text-gray-400 font-mono">{item.path.replace('/', '').replace('category/', '')}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Dark mode toggle */}
          <button
            onClick={() => setDark(!dark)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            {dark ? '☀' : '☾'}
          </button>

          {/* Sign in */}
          <button
            onClick={() => setShowSignIn(true)}
            className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400 border border-gray-200 dark:border-gray-800 hover:border-violet-400 dark:hover:border-violet-600 px-4 py-1.5 rounded-lg transition-colors"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* Sign in modal */}
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </>
  )
}