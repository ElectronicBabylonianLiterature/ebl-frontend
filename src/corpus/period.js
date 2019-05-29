import type { RecordFactory, RecordOf } from 'immutable'
import { OrderedMap, Record } from 'immutable'

type PeriodModifierProps = { name: string, displayName: string }
const createPeriodModifier: RecordFactory<PeriodModifierProps> = Record({
  name: '',
  displayName: ''
})
export type PeriodModifier = RecordOf<PeriodModifierProps>
export const periodModifiers: OrderedMap<string, PeriodModifier> = OrderedMap({
  None: createPeriodModifier({ name: 'None', displayName: '-' }),
  Early: createPeriodModifier({ name: 'Early', displayName: 'Early' }),
  Late: createPeriodModifier({ name: 'Late', displayName: 'Late' })
})

type PeriodProps = {
  name: string,
  abbreviation: string,
  description: string,
  parent: ?string
}
const createPeriod: RecordFactory<PeriodProps> = Record({
  name: '',
  abbreviation: '',
  description: '',
  parent: null
})
export type Period = RecordOf<PeriodProps>
export const periods: OrderedMap<string, Period> = OrderedMap({
  'Ur III': createPeriod({
    name: 'Ur III',
    abbreviation: 'Ur3',
    description: '(ca. 2100–2002 BCE)'
  }),
  'Old Assyrian': createPeriod({
    name: 'Old Assyrian',
    abbreviation: 'OA',
    description: '(ca. 1950–1850 BCE)'
  }),
  'Old Babylonian': createPeriod({
    name: 'Old Babylonian',
    abbreviation: 'OB',
    description: '(ca. 2002–1595 BCE)'
  }),
  'Middle Babylonian': createPeriod({
    name: 'Middle Babylonian',
    abbreviation: 'MB',
    description: '(ca. 1595–1000 BCE)'
  }),
  'Middle Assyrian': createPeriod({
    name: 'Middle Assyrian',
    abbreviation: 'MA',
    description: '(ca. 1595–1000 BCE)'
  }),
  Hittite: createPeriod({
    name: 'Hittite',
    abbreviation: 'Hit',
    description: '(ca. 1500–1100 BCE)'
  }),
  'Neo-Assyrian': createPeriod({
    name: 'Neo-Assyrian',
    abbreviation: 'NA',
    description: '(ca. 1000–609 BCE)'
  }),
  'Neo-Babylonian': createPeriod({
    name: 'Neo-Babylonian',
    abbreviation: 'NB',
    description: '(ca. 1000–539 BCE)'
  }),
  'Late Babylonian': createPeriod({
    name: 'Late Babylonian',
    abbreviation: 'LB',
    description: '(ca. 539 BCE–ca. 100 CE)'
  }),
  Persian: createPeriod({
    name: 'Persian',
    abbreviation: 'Per',
    description: '(539–331 BCE)',
    parent: 'Late Babylonian'
  }),
  Hellenistic: createPeriod({
    name: 'Hellenistic',
    abbreviation: 'Hel',
    description: '(331–141 BCE)',
    parent: 'Late Babylonian'
  }),
  Parthian: createPeriod({
    name: 'Parthian',
    abbreviation: 'Par',
    description: '(141 BCE–ca. 100 CE)',
    parent: 'Late Babylonian'
  }),
  Uncertain: createPeriod({
    name: 'Uncertain',
    abbreviation: 'Unc',
    description: ''
  })
})
