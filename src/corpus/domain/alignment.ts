export type AlignmentToken =
  | {
      value: string
      alignment?: null
      variant?: ''
      language?: string
      isNormalized?: boolean
    }
  | {
      value: string
      alignment: number | null
      variant: string
      language: string
      isNormalized: boolean
    }

export type Alignment = readonly AlignmentToken[][][]
