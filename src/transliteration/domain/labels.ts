export type Status = 'PRIME' | 'UNCERTAIN' | 'CORRECTION' | 'COLLATION'

export interface Label {
  readonly status: readonly Status[]
  readonly abbreviation: string
}

export interface ColumnLabel extends Label {
  readonly column: number
}

export interface SurfaceLabel extends Label {
  readonly surface: string
  readonly text: string
}

export interface ObjectLabel extends Label {
  readonly object: string
  readonly text: string
}

export function statusAbbreviation(status: Status): string {
  switch (status) {
    case 'PRIME':
      return "'"
    case 'UNCERTAIN':
      return '?'
    case 'CORRECTION':
      return '!'
    case 'COLLATION':
      return '*'
  }
}
