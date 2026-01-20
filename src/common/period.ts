import _ from 'lodash'

export const PeriodModifiers = {
  None: { name: 'None', displayName: '-' },
  Early: { name: 'Early', displayName: 'Early' },
  Middle: { name: 'Middle', displayName: 'Middle' },
  Late: { name: 'Late', displayName: 'Late' },
} as const
export type PeriodModifier = typeof PeriodModifiers[keyof typeof PeriodModifiers]
export const periodModifiers = [
  PeriodModifiers.None,
  PeriodModifiers.Early,
  PeriodModifiers.Middle,
  PeriodModifiers.Late,
] as const

export const Periods = {
  'Uruk IV': {
    name: 'Uruk IV',
    abbreviation: 'Uruk4',
    description: '(ca. 3600-3300 BCE)',
    displayName: null,
    parent: null,
  },
  'Uruk III-Jemdet Nasr': {
    name: 'Uruk III-Jemdet Nasr',
    abbreviation: 'JN',
    description: '(ca. 3300-3000 BCE)',
    displayName: 'Uruk III/Jemdet Nasr',
    parent: null,
  },
  'Proto-Elamite': {
    name: 'Proto-Elamite',
    abbreviation: 'PElam',
    description: '(ca. 3200 – ca. 2700 BCE)',
    displayName: null,
    parent: null,
  },
  'ED I-II': {
    name: 'ED I-II',
    abbreviation: 'ED1-2',
    description: '(ca. 3000-2600 BCE)',
    displayName: 'ED I/II',
    parent: null,
  },
  Fara: {
    name: 'Fara',
    abbreviation: 'Fara',
    description: '(ca. 2600-2475 BCE)',
    displayName: null,
    parent: null,
  },
  'Old Elamite': {
    name: 'Old Elamite',
    abbreviation: 'OElam',
    description: '(ca. 2600 – ca. 1500 BCE)',
    displayName: null,
    parent: null,
  },
  Presargonic: {
    name: 'Presargonic',
    abbreviation: 'PSarg',
    description: '(ca. 2475-2300 BCE)',
    displayName: null,
    parent: null,
  },
  Sargonic: {
    name: 'Sargonic',
    abbreviation: 'Sarg',
    description: '(ca. 2300-2180 BCE)',
    displayName: null,
    parent: null,
  },
  'Ur III': {
    name: 'Ur III',
    abbreviation: 'Ur3',
    description: '(ca. 2100–2002 BCE)',
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
  'Old Assyrian': {
    name: 'Old Assyrian',
    abbreviation: 'OA',
    description: '(ca. 1950–1850 BCE)',
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
  'Middle Elamite': {
    name: 'Middle Elamite',
    abbreviation: 'MElam',
    description: '(ca. 1450 – ca. 1100 BCE)',
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
  'Neo-Elamite': {
    name: 'Neo-Elamite',
    abbreviation: 'NElam',
    description: '(ca. 743 – 500 BCE)',
    displayName: null,
    parent: null,
  },
  'Late Babylonian': {
    name: 'Late Babylonian',
    abbreviation: 'LB',
    description: '(ca. 539 BCE – ca. 100 CE)',
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
  Aramaic: {
    name: 'Aramaic',
    abbreviation: 'Aram',
    description: '(ca. 900 BCE – ca. 100 CE)',
    displayName: null,
    parent: null,
  },
  Luwian: {
    name: 'Luwian',
    abbreviation: 'Luw',
    description: '(ca. 1300 BCE – ca. 600 BCE)',
    displayName: null,
    parent: null,
  },
  Parthian: {
    name: 'Parthian',
    abbreviation: 'Par',
    description: '(141 BCE – ca. 100 CE)',
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
  None: {
    name: 'None',
    abbreviation: '',
    description: '',
    displayName: '-',
    parent: null,
  },
} as const
export type Period = typeof Periods[keyof typeof Periods]
export const periods = [
  Periods['Uruk IV'],
  Periods['Uruk III-Jemdet Nasr'],
  Periods['Proto-Elamite'],
  Periods['ED I-II'],
  Periods.Fara,
  Periods['Old Elamite'],
  Periods.Presargonic,
  Periods.Sargonic,
  Periods['Ur III'],
  Periods['Old Babylonian'],
  Periods['Old Assyrian'],
  Periods['Middle Babylonian'],
  Periods['Middle Assyrian'],
  Periods.Hittite,
  Periods['Middle Elamite'],
  Periods['Neo-Assyrian'],
  Periods['Neo-Babylonian'],
  Periods['Neo-Elamite'],
  Periods['Late Babylonian'],
  Periods.Persian,
  Periods.Hellenistic,
  Periods.Parthian,
  Periods.Luwian,
  Periods.Aramaic,
  Periods.Uncertain,
  Periods.None,
] as const

export const Stages = {
  ...Periods,
  'Standard Babylonian': {
    name: 'Standard Babylonian',
    abbreviation: 'SB',
    description: '',
    displayName: null,
    parent: null,
  },
} as const
export type Stage = typeof Stages[keyof typeof Stages]
export const stages = [...periods, Stages['Standard Babylonian']] as const

export const periodFromAbbreviation = (abbr: string): any => {
  const matchingStage = _.filter(Stages, (s) => s.abbreviation === abbr)
  if (matchingStage.length < 1) {
    throw new Error(`Unknown stage abbreviation: ${abbr}`)
  }
  return matchingStage[0]
}

export const stageFromAbbreviation = (abbr: string): string => {
  const matchingStage = _.findKey(Stages, (s) => s.abbreviation === abbr)
  if (!matchingStage) {
    throw new Error(`Unknown stage abbreviation: ${abbr}`)
  }
  return matchingStage
}

export const stageToAbbreviation = (stageName: string): string => {
  if (!Stages[stageName]) {
    throw new Error(`Unknown stage: ${stageName}`)
  } else {
    return Stages[stageName].abbreviation
  }
}
