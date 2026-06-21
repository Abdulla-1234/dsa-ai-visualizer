import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

interface Props { dark: boolean; setDark: (v: boolean) => void }

export default function SignInPage({ dark }: Props) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  const bg   = dark ? '#0a0a0f' : '#f9fafb'
  const card = dark ? 'rgba(255,255,255,0.03)' : '#ffffff'
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const txt  = dark ? '#ffffff' : '#111827'
  const sub  = dark ? '#9ca3af' : '#6b7280'
  const inp  = dark ? 'rgba(255,255,255,0.05)' : '#f9fafb'
  const inpB = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: bg, fontFamily: 'system-ui,sans-serif' }}>
      {/* Back link */}
      <button onClick={() => navigate('/')}
        className="absolute top-5 left-6 flex items-center gap-1.5 text-xs font-mono transition-colors"
        style={{ color: sub }}>
        ← Back to dsaviz
      </button>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl p-8 flex flex-col gap-6" style={{ background: card, border: `1px solid ${border}` }}>
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-lg">D</div>
          <span className="font-bold text-lg" style={{ color: txt }}>dsa<span style={{ color: '#a78bfa' }}>viz</span></span>
          <p className="text-xs text-center" style={{ color: sub }}>
            {mode === 'signin' ? 'Sign in to save your progress and visualizations.' : 'Create a free account to get started.'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg p-0.5" style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}>
          {(['signin', 'signup'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all"
              style={{
                background: mode === m ? (dark ? 'rgba(139,92,246,0.3)' : '#ffffff') : 'transparent',
                color: mode === m ? (dark ? '#a78bfa' : '#7c3aed') : sub,
                border: mode === m ? `1px solid ${dark ? 'rgba(139,92,246,0.4)' : 'rgba(124,58,237,0.2)'}` : '1px solid transparent',
              }}>
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3">
          {mode === 'signup' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: sub }}>Full Name</label>
              <input
                type="text" placeholder="John Doe"
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                style={{ background: inp, border: `1px solid ${inpB}`, color: txt }}
                onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                onBlur={e => (e.target.style.borderColor = inpB)}
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: sub }}>Email</label>
            <input
              type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
              style={{ background: inp, border: `1px solid ${inpB}`, color: txt }}
              onFocus={e => (e.target.style.borderColor = '#7c3aed')}
              onBlur={e => (e.target.style.borderColor = inpB)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium" style={{ color: sub }}>Password</label>
              {mode === 'signin' && (
                <button className="text-xs" style={{ color: '#a78bfa' }}>Forgot password?</button>
              )}
            </div>
            <input
              type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
              style={{ background: inp, border: `1px solid ${inpB}`, color: txt }}
              onFocus={e => (e.target.style.borderColor = '#7c3aed')}
              onBlur={e => (e.target.style.borderColor = inpB)}
            />
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/')}
          className="w-full py-2.5 rounded-xl text-white font-bold text-sm transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}>
          {mode === 'signin' ? 'Sign In →' : 'Create Account →'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: border }} />
          <span className="text-xs" style={{ color: sub }}>or continue with</span>
          <div className="flex-1 h-px" style={{ background: border }} />
        </div>

        {/* OAuth */}
        <div className="flex gap-3">
          {[
            { icon: 'G', label: 'Google', color: '#ea4335' },
            { icon: '⌥', label: 'GitHub', color: dark ? '#ffffff' : '#24292e' },
          ].map(p => (
            <button key={p.label}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-colors"
              style={{ background: inp, border: `1px solid ${inpB}`, color: txt }}>
              <span style={{ color: p.color, fontWeight: 'bold' }}>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>

        <p className="text-center text-xs" style={{ color: sub }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} style={{ color: '#a78bfa' }}>
            {mode === 'signin' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>

      <p className="text-xs mt-6" style={{ color: dark ? '#374151' : '#9ca3af' }}>
        No credit card required · Always free for core features
      </p>
    </div>
  )
}