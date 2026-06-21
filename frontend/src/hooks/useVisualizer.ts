import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import type { Step, Language } from '../types/index'

export function useVisualizer(externalSpeed?: number) {
  const [steps, setSteps] = useState<Step[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [internalSpeed, setSpeed] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [inputSource, setInputSource] = useState<'user' | 'inferred'>('user')
  const [inferredInputNote, setInferredInputNote] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const speed = externalSpeed ?? internalSpeed

  useEffect(() => {
    if (!playing) return
    timer.current = setInterval(() => {
      setCurrent(c => {
        if (c >= steps.length - 1) {
          setPlaying(false)
          return c
        }
        return c + 1
      })
    }, 900 / speed)

    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [playing, speed, steps.length])

  const visualize = async (code: string, language: Language, category = 'dsa') => {
    setLoading(true)
    setError(null)
    setPlaying(false)
    setCurrent(0)
    setSteps([])
    setInputSource('user')
    setInferredInputNote(null)
    try {
      const base = import.meta.env.VITE_API_URL ?? ''
      const res = await axios.post(`${base}/api/visualize`, { code, language, category })
      setSteps(res.data.steps)
      setInputSource(res.data.input_source ?? 'user')
      setInferredInputNote(res.data.inferred_input_note ?? null)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const next = () => setCurrent(c => Math.min(steps.length - 1, c + 1))
  const prev = () => setCurrent(c => Math.max(0, c - 1))
  const reset = () => { setPlaying(false); setCurrent(0) }

  return {
    steps, current, loading, playing, speed, error,
    inputSource, inferredInputNote,
    setPlaying, setSpeed, visualize, next, prev, reset, setCurrent
  }
}