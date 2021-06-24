export const PeriodModifiers = {
  None: { name: 'None', displayName: '-' },
  Early: { name: 'Early', displayName: 'Early' },
  Late: { name: 'Late', displayName: 'Late' },
} as const
export type PeriodModifier = typeof PeriodModifiers[keyof typeof PeriodModifiers]
export const periodModifiers = [
  PeriodModifiers.None,
  PeriodModifiers.Early,
  PeriodModifiers.Late,
] as const

export const Periods = {
  None: {
    name: 'None',
    abbreviation: '',
    description: '',
    displayName: '-',
    parent: null,
  },
  'Ur III': {
    name: 'Ur III',
    abbreviation: 'Ur3',
    description: '(ca. 2100–2002 BCE)',
    displayName: null,
    parent: null,
  },
  'Old Assyrian': {
    name: 'Old Assyrian',
    abbreviation: 'OA',
    description: '(ca. 1950–1850 BCE)',
    displayName: null,
    parent: null,
  },
  'Old Babylonian': {
    name: 'Old Babylonian',
    abbreviation: 'OB',
    description: '(ca. 2002–1595 BCE)',
    displayName: null,
    parent: null,
  },
  'Middle Babylonian': {
    name: 'Middle Babylonian',
    abbreviation: 'MB',
    description: '(ca. 1595–1000 BCE)',
    displayName: null,
    parent: null,
  },
  'Middle Assyrian': {
    name: 'Middle Assyrian',
    abbreviation: 'MA',
    description: '(ca. 1595–1000 BCE)',
    displayName: null,
    parent: null,
  },
  Hittite: {
    name: 'Hittite',
    abbreviation: 'Hit',
    description: '(ca. 1500–1100 BCE)',
    displayName: null,
    parent: null,
  },
  'Neo-Assyrian': {
    name: 'Neo-Assyrian',
    abbreviation: 'NA',
    description: '(ca. 1000–609 BCE)',
    displayName: null,
    parent: null,
  },
  'Neo-Babylonian': {
    name: 'Neo-Babylonian',
    abbreviation: 'NB',
    description: '(ca. 1000–539 BCE)',
    displayName: null,
    parent: null,
  },
  'Late Babylonian': {
    name: 'Late Babylonian',
    abbreviation: 'LB',
    description: '(ca. 539 BCE–ca. 100 CE)',
    displayName: null,
    parent: null,
  },
  Persian: {
    name: 'Persian',
    abbreviation: 'Per',
    description: '(539–331 BCE)',
    displayName: null,
    parent: 'Late Babylonian',
  },
  Hellenistic: {
    name: 'Hellenistic',
    abbreviation: 'Hel',
    description: '(331–141 BCE)',
    displayName: null,
    parent: 'Late Babylonian',
  },
  Parthian: {
    name: 'Parthian',
    abbreviation: 'Par',
    description: '(141 BCE–ca. 100 CE)',
    displayName: null,
    parent: 'Late Babylonian',
  },
  Uncertain: {
    name: 'Uncertain',
    abbreviation: 'Unc',
    description: '',
    displayName: null,
    parent: null,
  },
} as const
export type Period = typeof Periods[keyof typeof Periods]
export const periods = [
  Periods.None,
  Periods['Ur III'],
  Periods['Old Assyrian'],
  Periods['Old Babylonian'],
  Periods['Middle Babylonian'],
  Periods['Middle Assyrian'],
  Periods.Hittite,
  Periods['Neo-Assyrian'],
  Periods['Neo-Babylonian'],
  Periods['Late Babylonian'],
  Periods.Persian,
  Periods.Hellenistic,
  Periods.Parthian,
  Periods.Uncertain,
] as const
