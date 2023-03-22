import { DateTime, Interval } from 'luxon'

const historicalTransliteration = 'HistoricalTransliteration'

type RecordType =
  | typeof historicalTransliteration
  | 'Revision'
  | 'Transliteration'
  | 'Collation'

export class RecordEntry {
  readonly user: string
  readonly date: string
  readonly type: RecordType

  constructor({
    user,
    date,
    type,
  }: {
    user: string
    date: string
    type: RecordType
  }) {
    this.user = user
    this.date = date
    this.type = type
  }

  get moment(): DateTime | Interval {
    return this.isHistorical
      ? Interval.fromISO(this.date)
      : DateTime.fromISO(this.date)
  }

  get isHistorical(): boolean {
    return this.type === historicalTransliteration
  }

  dateEquals(other: RecordEntry): boolean {
    const differentUser = this.user !== other.user
    const differentType = this.type !== other.type

    return differentUser || differentType || this.isHistorical
      ? false
      : (this.moment as DateTime).hasSame(other.moment as DateTime, 'day')
  }
}
