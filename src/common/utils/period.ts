import _ from 'lodash'
import { Periods } from 'common/utils/periodDefinitions'

export { Periods }

export const PeriodModifiers = {
  None: { name: 'None', displayName: '-' },
  Early: { name: 'Early', displayName: 'Early' },
  Middle: { name: 'Middle', displayName: 'Middle' },
  Late: { name: 'Late', displayName: 'Late' },
} as const
export type PeriodModifier =
  (typeof PeriodModifiers)[keyof typeof PeriodModifiers]
export const periodModifiers = [
  PeriodModifiers.None,
  PeriodModifiers.Early,
  PeriodModifiers.Middle,
  PeriodModifiers.Late,
] as const

export type Period = (typeof Periods)[keyof typeof Periods]
export const periods = [
  Periods['Uruk IV'],
  Periods['Uruk III-Jemdet Nasr'],
  Periods['Proto-Elamite'],
  Periods['ED I-II'],
  Periods.Fara,
  Periods['Old Elamite'],
  Periods.Presargonic,
  Periods.Sargonic,
  Periods['Lagash II'],
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
export type Stage = (typeof Stages)[keyof typeof Stages]
export const stages = [...periods, Stages['Standard Babylonian']] as const

export const periodFromAbbreviation = (abbr: string): Stage => {
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
