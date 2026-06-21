import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import type { Language } from '../types/index'

const TEMPLATES: Record<Language, string> = {
  python: `arr = [5, 3, 8, 1, 9, 2]

# Bubble Sort
for i in range(len(arr)):
    for j in range(len(arr) - i - 1):
        if arr[j] > arr[j + 1]:
            arr[j], arr[j + 1] = arr[j + 1], arr[j]`,

  javascript: `let arr = [5, 3, 8, 1, 9, 2];

// Bubble Sort
for (let i = 0; i < arr.length; i++) {
  for (let j = 0; j < arr.length - i - 1; j++) {
    if (arr[j] > arr[j + 1]) {
      [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
    }
  }
}`,

  cpp: `#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> arr = {5, 3, 8, 1, 9, 2};
    int n = arr.size();
    for (int i = 0; i < n - 1; i++)
        for (int j = 0; j < n - i - 1; j++)
            if (arr[j] > arr[j + 1])
                swap(arr[j], arr[j + 1]);
    return 0;
}`,
}

interface Props {
  onVisualize: (code: string, language: Language) => void
  loading: boolean
  initialCode?: string
}

export default function CodeEditor({ onVisualize, loading, initialCode }: Props) {
  const [language, setLanguage] = useState<Language>('python')
  const [code, setCode] = useState<string>(initialCode || TEMPLATES.python)
  const [userEdited, setUserEdited] = useState(false)

  // When initialCode changes (from navigation), load it
  useEffect(() => {
    if (initialCode !== undefined) {
      setCode(initialCode || TEMPLATES.python)
      setUserEdited(false)
    }
  }, [initialCode])

  // When language switches, update template only if user hasn't edited
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    if (!userEdited || code.trim() === '') {
      setCode(TEMPLATES[lang])
    }
  }

  const handleCodeChange = (val: string | undefined) => {
    setCode(val || '')
    setUserEdited(true)
  }

  const handleReset = () => {
    setCode(TEMPLATES[language])
    setUserEdited(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800 bg-gray-900 shrink-0">
        {/* Mac dots */}
        <div className="flex gap-1.5 mr-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>

        {/* Language tabs */}
        <div className="flex gap-1">
          {(['python', 'javascript', 'cpp'] as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                language === lang
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JS' : 'Python'}
            </button>
          ))}
        </div>

        {/* Reset template */}
        <button
          onClick={handleReset}
          className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 hover:border-gray-500 px-2 py-1 rounded-md transition-colors font-mono"
          title="Reset to template"
        >
          ↺ reset
        </button>

        {/* Run button */}
        <button
          onClick={() => onVisualize(code, language)}
          disabled={loading}
          className="ml-auto flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500
            disabled:bg-violet-900 disabled:cursor-not-allowed
            text-white text-xs font-semibold px-4 py-1.5 rounded-md transition-colors"
        >
          {loading ? '⟳ Analyzing...' : '▶ Visualize'}
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language === 'javascript' ? 'javascript' : 'python'}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: '"Fira Code", "JetBrains Mono", monospace',
            fontLigatures: true,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 14, bottom: 14 },
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            tabSize: language === 'python' ? 4 : 2,
          }}
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3 px-4 py-1.5 bg-gray-900 border-t border-gray-800 shrink-0">
        <span className="text-xs font-mono text-gray-600">
          {language === 'cpp' ? 'C++' : language === 'javascript' ? 'JavaScript' : 'Python'}
        </span>
        <span className="text-gray-800">·</span>
        <span className="text-xs font-mono text-gray-600">
          {code.split('\n').length} lines
        </span>
        {userEdited && (
          <>
            <span className="text-gray-800">·</span>
            <span className="text-xs font-mono text-amber-600">edited</span>
          </>
        )}
      </div>
    </div>
  )
}