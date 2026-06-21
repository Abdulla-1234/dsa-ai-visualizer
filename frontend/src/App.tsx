import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/Home'
import DSAPage from './pages/DSAPage'
import CategoryPage from './pages/CategoryPage'
import VisualizerPage from './pages/VisualizerPage'
import SQLPage from './pages/SQLPage'
import SignInPage from './pages/SignInPage'
import SystemDesignPage from './pages/SystemDesignPage'

export default function App() {
  const [dark, setDark] = useState(true)

  return (
    <div className={dark ? 'dark' : ''} style={{ colorScheme: dark ? 'dark' : 'light' }}>
      <div className="min-h-screen w-full transition-colors overflow-x-hidden" style={{ background: dark ? '#0a0a0f' : '#ffffff' }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home dark={dark} setDark={setDark} />} />
            <Route path="/dsa" element={<DSAPage dark={dark} setDark={setDark} />} />
            <Route path="/category/:id" element={<CategoryPage dark={dark} setDark={setDark} />} />
            <Route path="/visualizer" element={<VisualizerPage />} />
            <Route path="/sql" element={<SQLPage dark={dark} setDark={setDark} />} />
            
            {/* ✅ FIXED: Routes /system-design to your CategoryPage component with id="system-design" */}
            <Route path="/system-design" element={<SystemDesignPage dark={dark} setDark={setDark} />} />
            
            {/* Make sure you have created SignInPage.tsx inside your pages folder, or comment it out if not yet implemented */}
            <Route path="/signin" element={<SignInPage dark={dark} setDark={setDark} />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  )
}