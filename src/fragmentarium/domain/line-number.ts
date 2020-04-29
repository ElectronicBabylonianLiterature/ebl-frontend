export interface LineNumber {
  number: number
  hasPrime: boolean
  prefixModifier: string | null
  suffixModifier: string | null
  type?: 'LineNumber'
}

export interface LineNumberRange {
  start: LineNumber
  end: LineNumber
  type: 'LineNumberRange'
}
