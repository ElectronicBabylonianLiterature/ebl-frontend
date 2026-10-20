import _ from 'lodash'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import {
  FragmentQuery,
  PeriodModifierString,
  PeriodString,
  QueryType,
} from 'query/FragmentQuery'
import { ResearchProjects } from 'research-projects/researchProject'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'

export interface SearchFormState {
  number: string | null
  referenceEntry: { id: string; label: string }
  pages: string | null
  lemmas: string | null
  lemmaOperator: QueryType | null
  transliteration: string | null
  scriptPeriod: PeriodString
  scriptPeriodModifier: PeriodModifierString
  genre: string | null
  project: keyof typeof ResearchProjects | null
  isValid: boolean
  site: string | null
  museum: string | null
  dossier: string | null
}

export type SearchFormValue =
  | string
  | null
  | undefined
  | QueryType
  | BibliographyEntry
  | keyof typeof ResearchProjects

export function isValidNumber(number?: string): boolean {
  return !number || !/^\[.*\]+$/.test(number.trim())
}

export function initializeSearchFormState(
  fragmentQuery: FragmentQuery,
): SearchFormState {
  return {
    number: fragmentQuery.number || null,
    referenceEntry: {
      id: fragmentQuery.bibId || '',
      label: fragmentQuery.bibLabel || '',
    },
    pages: fragmentQuery.pages || null,
    lemmas: fragmentQuery.lemmas || '',
    lemmaOperator: fragmentQuery.lemmaOperator || 'line',
    transliteration: fragmentQuery.transliteration || '',
    scriptPeriod: fragmentQuery.scriptPeriod || '',
    scriptPeriodModifier: fragmentQuery.scriptPeriodModifier || '',
    genre: fragmentQuery.genre || '',
    site: fragmentQuery.site || '',
    isValid: isValidNumber(fragmentQuery.number),
    project: fragmentQuery.project || null,
    museum: fragmentQuery.museum || null,
    dossier: fragmentQuery.dossier || null,
  }
}

export function flattenSearchFormState(state: SearchFormState): FragmentQuery {
  const cleanedTransliteration = _.trimEnd(state.transliteration || '')
  const stateWithoutNull = _.omitBy(
    {
      number: state.number,
      lemmas: state.lemmas,
      lemmaOperator: state.lemmas ? state.lemmaOperator : '',
      bibId: state.referenceEntry.id,
      label: state.referenceEntry.label,
      pages: state.pages,
      transliteration: replaceTransliteration(cleanedTransliteration),
      scriptPeriodModifier: state.scriptPeriod
        ? state.scriptPeriodModifier
        : '',
      scriptPeriod: state.scriptPeriod,
      genre: state.genre,
      site: state.site,
      project: state.project,
      museum: state.museum,
      dossier: state.dossier,
    },
    (value) => !value,
  )
  return _.omit(stateWithoutNull, 'isValid')
}
