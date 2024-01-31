export interface Join {
  readonly museumNumber: string
  readonly isChecked: boolean
  readonly joinedBy: string
  readonly date: string
  readonly note: string
  readonly legacyData: string
  readonly isInFragmentarium: boolean
  readonly isEnvelope: boolean
}

export type Joins = ReadonlyArray<ReadonlyArray<Join>>
