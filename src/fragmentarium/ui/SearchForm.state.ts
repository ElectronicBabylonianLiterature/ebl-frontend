import _ from 'lodash'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyService from 'bibliography/application/BibliographyService'
import WordService from 'dictionary/application/WordService'
import DossiersService from 'dossiers/application/DossiersService'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import {
  FragmentQuery,
  PeriodModifierString,
  PeriodString,
  QueryType,
} from 'query/FragmentQuery'
import { ResearchProjects } from 'research-projects/researchProject'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'

export interface State {
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
  findspotId: number | string | null
}

export type SearchFormValue =
  | string
  | null
  | undefined
  | QueryType
  | BibliographyEntry
  | keyof typeof ResearchProjects

export type SearchFormProps = {
  fragmentSearchService: FragmentSearchService
  fragmentService: FragmentService
  dossiersService: DossiersService
  bibliographyService: BibliographyService
  fragmentQuery?: FragmentQuery
  wordService: WordService
  project?: keyof typeof ResearchProjects | null
  showAdvancedSearch?: boolean
  navigate: (options: { pathname: string; search: string }) => void
}

export function isValidNumber(number?: string): boolean {
  return !number || !/^\[.*\]+$/.test(number.trim())
}

export const helpColSize = 1

export function initializeState(fragmentQuery: FragmentQuery): State {
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
    findspotId: fragmentQuery.findspotId || null,
  }
}

export function flattenState(state: State): FragmentQuery {
  const cleanedTransliteration = _.trimEnd(state.transliteration || '')
  const stateWithoutNull = _.omitBy(
    {
      number: state.number,
      lemmas: state.lemmas,
      lemmaOperator: state.lemmas ? state.lemmaOperator : '',
      bibId: state.referenceEntry.id,
      label: state.referenceEntry.label,
      pages: state.pages,
      transliteration: replaceTransliteration(cleanedTransliteration) ?? '',
      scriptPeriodModifier: state.scriptPeriod
        ? state.scriptPeriodModifier
        : '',
      scriptPeriod: state.scriptPeriod,
      genre: state.genre,
      site: state.site ?? '',
      project: state.project,
      museum: state.museum,
      dossier: state.dossier,
      findspotId: state.findspotId,
    },
    (value) => !value,
  )
  return _.omit(stateWithoutNull, 'isValid')
}
