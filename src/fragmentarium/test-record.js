import { RecordEntry } from './fragment'

export const historicalTransliteration = new RecordEntry({
  user: 'User',
  date: '1998-01-17T10:50:36.127247/1999-04-17T10:29:39.127247',
  type: 'HistoricalTransliteration'
})
export const revision = new RecordEntry({
  user: 'User',
  date: '1998-01-17T10:50:36.127247',
  type: 'Revision'
})
export const transliteration = new RecordEntry({
  user: 'User',
  date: '1998-01-17T10:50:36.127247',
  type: 'Transliteration'
})
export const atTen = transliteration
  .set('user', 'Same Date')
  .set('date', '2018-11-21T10:27:36.127247')
export const atEleven = atTen.set('date', '2018-11-21T11:27:36.127248')
export const atTwelve = atTen.set('date', '2018-11-21T12:27:36.127248')
export const on21thOctober = transliteration
  .set('user', 'Different Day')
  .set('date', '2018-11-21T10:27:36.127247')
export const on22ndOctober = on21thOctober.set(
  'date',
  '2018-11-22T10:27:36.127247'
)
export const on21stDecember = on21thOctober.set(
  'date',
  '2018-12-22T10:27:36.127247'
)
export const userBob = revision.set('user', 'Bob')
export const userAlice = revision.set('user', 'Alice')
export const year2017 = transliteration
  .set('user', 'Different Year')
  .set('date', '2017-11-21T10:27:36.127247')
export const year2018 = year2017.set('date', '2018-11-22T10:27:36.127247')
export const transliterationAtTen = transliteration
  .set('user', 'Alternating Types')
  .set('date', '2018-11-21T10:27:36.127247')
export const revisionAtEleven = revision
  .set('user', 'Alternating Types')
  .set('date', '2018-11-21T11:00:36.127247')
export const transliterationAtElevenThirty = transliterationAtTen.set(
  'date',
  '2018-11-21T11:30:36.127247'
)
