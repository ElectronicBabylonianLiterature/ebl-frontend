import { DateTime, Interval } from 'luxon'
import {
  atEleven,
  atTen,
  historicalTransliteration,
  on21thOctober,
  on22ndOctober,
  revision,
  revisionAtEleven,
  transliteration,
  transliterationAtTen,
  userAlice,
  userBob,
  year2017,
  year2018,
} from 'test-support/record-fixtures'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'

describe('RecordEntry', () => {
  test.each([
    [atTen, atEleven, true],
    [on21thOctober, on22ndOctober, false],
    [userAlice, userBob, false],
    [year2017, year2018, false],
    [transliterationAtTen, revisionAtEleven, false],
    [historicalTransliteration, transliteration, false],
    [transliteration, revision, false],
    [
      historicalTransliteration,
      new RecordEntry({
        user: 'User1',
        date: '1998-01-17T11:50:36.127247/1999-04-17T10:29:39.127247',
        type: 'HistoricalTransliteration',
      }),
      false,
    ],
    [
      historicalTransliteration,
      new RecordEntry({
        user: 'User1',
        date: '1998-01-17T10:50:36.127247/1999-04-17T12:29:39.127247',
        type: 'HistoricalTransliteration',
      }),
      false,
    ],
    [
      historicalTransliteration,
      new RecordEntry({
        user: 'User1',
        date: '1998-01-18T10:50:36.127247/1999-04-17T10:29:39.127247',
        type: 'HistoricalTransliteration',
      }),
      false,
    ],
    [
      historicalTransliteration,
      new RecordEntry({
        user: 'User1',
        date: '1998-01-17T10:50:36.127247/1999-05-17T10:29:39.127247',
        type: 'HistoricalTransliteration',
      }),
      false,
    ],
  ] as [RecordEntry, RecordEntry, boolean][])(
    '%s dateEquals %s is %p',
    (first, second, expected) => {
      expect(first.dateEquals(second)).toBe(expected)
      expect(second.dateEquals(first)).toBe(expected)
    },
  )

  test.each([
    [transliteration, DateTime.fromISO(transliteration.date)],
    [revision, DateTime.fromISO(revision.date)],
    [
      historicalTransliteration,
      Interval.fromISO(historicalTransliteration.date),
    ],
  ] as [RecordEntry, DateTime | Interval][])(
    '%s.moment is %s',
    (recordEntry, expected) => {
      expect(recordEntry.moment).toEqual(expected)
    },
  )

  test.each([
    [transliteration, false],
    [revision, false],
    [historicalTransliteration, true],
  ] as [RecordEntry, boolean][])(
    '%s.isHistorical is %s',
    (recordEntry, expected) => {
      expect(recordEntry.isHistorical).toEqual(expected)
    },
  )
})
