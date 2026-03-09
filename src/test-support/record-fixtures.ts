import { produce, Draft } from 'immer'

import { RecordEntry } from 'fragmentarium/domain/RecordEntry'

const setDate = produce((draft: Draft<RecordEntry>, date: string) => {
  draft.date = date
})

const setUser = produce((draft: Draft<RecordEntry>, user: string) => {
  draft.user = user
})

const setUserAndDate = produce(
  (draft: Draft<RecordEntry>, user: string, date: string) => {
    draft.user = user
    draft.date = date
  },
)

export const historicalTransliteration = new RecordEntry({
  user: 'User',
  date: '1998-01-17T10:50:36.127247/1999-04-17T10:29:39.127247',
  type: 'HistoricalTransliteration',
})
export const revision = new RecordEntry({
  user: 'User',
  date: '1998-01-17T10:50:36.127247',
  type: 'Revision',
})
export const transliteration = new RecordEntry({
  user: 'User',
  date: '1998-01-17T10:50:36.127247',
  type: 'Transliteration',
})
export const atTen = setUserAndDate(
  transliteration,
  'Same Date',
  '2018-11-21T10:27:36.127247',
)
export const atEleven = setDate(atTen, '2018-11-21T11:27:36.127248')
export const atTwelve = setDate(atTen, '2018-11-21T12:27:36.127248')
export const on21thOctober = setUserAndDate(
  transliteration,
  'Different Day',
  '2018-11-21T10:27:36.127247',
)
export const on22ndOctober = setDate(
  on21thOctober,
  '2018-11-22T10:27:36.127247',
)
export const on21stDecember = setDate(
  on21thOctober,
  '2018-12-22T10:27:36.127247',
)
export const userBob = setUser(revision, 'Bob')
export const userAlice = setUser(revision, 'Alice')
export const year2017 = setUserAndDate(
  transliteration,
  'Different Year',
  '2017-11-21T10:27:36.127247',
)
export const year2018 = setDate(year2017, '2018-11-22T10:27:36.127247')
export const transliterationAtTen = setUserAndDate(
  transliteration,
  'Alternating Types',
  '2018-11-21T10:27:36.127247',
)
export const revisionAtEleven = setUserAndDate(
  revision,
  'Alternating Types',
  '2018-11-21T11:00:36.127247',
)
export const transliterationAtElevenThirty = setDate(
  transliteration,
  '2018-11-21T11:30:36.127247',
)
