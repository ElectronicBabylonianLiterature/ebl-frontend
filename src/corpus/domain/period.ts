export type PeriodModifier = {
  readonly name: string
  readonly displayName: string
}
export const periodModifiers: ReadonlyMap<string, PeriodModifier> = new Map([
  ['None', { name: 'None', displayName: '-' }],
  ['Early', { name: 'Early', displayName: 'Early' }],
  ['Late', { name: 'Late', displayName: 'Late' }],
])

export type Period = {
  readonly name: string
  readonly abbreviation: string
  readonly description: string
  readonly parent?: string
  readonly displayName?: string
}
export const periods: ReadonlyMap<string, Period> = new Map([
  [
    'None',
    {
      name: 'None',
      abbreviation: '',
      description: '',
      displayName: '-',
    },
  ],
  [
    'Ur III',
    {
      name: 'Ur III',
      abbreviation: 'Ur3',
      description: '(ca. 2100–2002 BCE)',
    },
  ],
  [
    'Old Assyrian',
    {
      name: 'Old Assyrian',
      abbreviation: 'OA',
      description: '(ca. 1950–1850 BCE)',
    },
  ],
  [
    'Old Babylonian',
    {
      name: 'Old Babylonian',
      abbreviation: 'OB',
      description: '(ca. 2002–1595 BCE)',
    },
  ],
  [
    'Middle Babylonian',
    {
      name: 'Middle Babylonian',
      abbreviation: 'MB',
      description: '(ca. 1595–1000 BCE)',
    },
  ],
  [
    'Middle Assyrian',
    {
      name: 'Middle Assyrian',
      abbreviation: 'MA',
      description: '(ca. 1595–1000 BCE)',
    },
  ],
  [
    'Hittite',
    {
      name: 'Hittite',
      abbreviation: 'Hit',
      description: '(ca. 1500–1100 BCE)',
    },
  ],
  [
    'Neo-Assyrian',
    {
      name: 'Neo-Assyrian',
      abbreviation: 'NA',
      description: '(ca. 1000–609 BCE)',
    },
  ],
  [
    'Neo-Babylonian',
    {
      name: 'Neo-Babylonian',
      abbreviation: 'NB',
      description: '(ca. 1000–539 BCE)',
    },
  ],
  [
    'Late Babylonian',
    {
      name: 'Late Babylonian',
      abbreviation: 'LB',
      description: '(ca. 539 BCE–ca. 100 CE)',
    },
  ],
  [
    'Persian',
    {
      name: 'Persian',
      abbreviation: 'Per',
      description: '(539–331 BCE)',
      parent: 'Late Babylonian',
    },
  ],
  [
    'Hellenistic',
    {
      name: 'Hellenistic',
      abbreviation: 'Hel',
      description: '(331–141 BCE)',
      parent: 'Late Babylonian',
    },
  ],
  [
    'Parthian',
    {
      name: 'Parthian',
      abbreviation: 'Par',
      description: '(141 BCE–ca. 100 CE)',
      parent: 'Late Babylonian',
    },
  ],
  ['Uncertain', { name: 'Uncertain', abbreviation: 'Unc', description: '' }],
])
