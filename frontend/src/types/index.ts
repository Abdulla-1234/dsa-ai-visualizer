export type Language = 'python' | 'javascript' | 'cpp'

export interface Step {
  step: number
  line: number
  operation: string
  ds_type: string
  state: any[]
  highlights: number[]
  pointers: Record<string, number>
  explanation: string
}