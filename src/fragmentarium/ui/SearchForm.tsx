import React, { Component } from 'react'
import { useNavigate } from 'react-router-dom'
import { stringify } from 'query-string'
import _ from 'lodash'
import { produce } from 'immer'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyService from 'bibliography/application/BibliographyService'
import WordService from 'dictionary/application/WordService'
import DossiersService from 'dossiers/application/DossiersService'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { FragmentQuery } from 'query/FragmentQuery'
import { ResearchProjects } from 'research-projects/researchProject'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import SearchFormFields, {
  type SearchFormState,
  type SearchFormValue,
} from 'fragmentarium/ui/SearchFormFields'
import './SearchForm.sass'

export { helpColSize } from 'fragmentarium/ui/search/searchFormLayout'

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

export class SearchForm extends Component<SearchFormProps, SearchFormState> {
  private readonly basepath: string
  private readonly showAdvancedSearch: boolean
  private isComponentMounted = false

  constructor(props: SearchFormProps) {
    super(props)
    this.basepath = props.project
      ? '/projects/' + props.project.toLowerCase() + '/search/'
      : '/library/search/'
    this.state = this.initializeState(props.fragmentQuery ?? {})
    this.showAdvancedSearch = props.showAdvancedSearch ?? false
  }

  componentDidMount(): void {
    this.isComponentMounted = true
    this.fetchMissingReferenceLabel()
  }

  componentWillUnmount(): void {
    this.isComponentMounted = false
  }

  componentDidUpdate(previousProps: SearchFormProps): void {
    if (!_.isEqual(previousProps.fragmentQuery, this.props.fragmentQuery)) {
      this.setState(
        this.initializeState(this.props.fragmentQuery ?? {}),
        this.fetchMissingReferenceLabel,
      )
    }
  }

  private initializeState(fragmentQuery: FragmentQuery): SearchFormState {
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
      findspotId: fragmentQuery.findspotId ?? null,
    }
  }

  private fetchMissingReferenceLabel = (): void => {
    if (this.state.referenceEntry.id && !this.state.referenceEntry.label) {
      void this.fetchReferenceLabel()
    }
  }

  private fetchReferenceLabel = async (): Promise<void> => {
    const { id } = this.state.referenceEntry
    const reference = await this.props.bibliographyService.find(id)
    if (this.isComponentMounted && this.state.referenceEntry.id === id) {
      this.setState({ referenceEntry: { id, label: reference.label } })
    }
  }

  private onChange =
    (name: string) =>
    (value: SearchFormValue): void => {
      this.setState((state) => ({ ...state, [name]: value ?? null }))
    }

  private onChangeNumber = (value: string): void => {
    this.setState({ number: value, isValid: isValidNumber(value) })
  }

  private onChangeBibliographyReference = (event: BibliographyEntry): void => {
    this.setState(
      produce(this.state, (state) => {
        state.referenceEntry.label = event.label || ''
        state.referenceEntry.id = event.id || ''
      }),
    )
  }

  private flattenState(state: SearchFormState): FragmentQuery {
    const transliteration = _.trimEnd(state.transliteration || '')
    return _.omitBy(
      {
        number: state.number,
        lemmas: state.lemmas,
        lemmaOperator: state.lemmas ? state.lemmaOperator : '',
        bibId: state.referenceEntry.id,
        label: state.referenceEntry.label,
        pages: state.pages,
        transliteration: replaceTransliteration(transliteration) ?? '',
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
      (value) => value === null || value === undefined || value === '',
    )
  }

  private navigateWithState = (state: SearchFormState): void => {
    const query = this.flattenState(state)
    this.onChange('transliteration')(query.transliteration)
    this.props.navigate({
      pathname: this.basepath,
      search: '?' + stringify(query),
    })
  }

  private search = (
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent,
  ): void => {
    event.preventDefault()
    this.navigateWithState(this.state)
  }

  private clearFindspotConstraint = (): void => {
    const state = { ...this.state, findspotId: null }
    this.setState({ findspotId: null })
    this.navigateWithState(state)
  }

  private handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.ctrlKey && event.key === 'Enter' && this.state.isValid) {
      this.search(event)
    }
  }

  render(): JSX.Element {
    return (
      <SearchFormFields
        state={this.state}
        showAdvancedSearch={this.showAdvancedSearch}
        project={this.props.project}
        fragmentSearchService={this.props.fragmentSearchService}
        fragmentService={this.props.fragmentService}
        dossiersService={this.props.dossiersService}
        wordService={this.props.wordService}
        onChange={this.onChange}
        onChangeNumber={this.onChangeNumber}
        onChangeBibliographyReference={this.onChangeBibliographyReference}
        onSearch={this.search}
        onClearFindspot={this.clearFindspotConstraint}
        onKeyDown={this.handleKeyDown}
      />
    )
  }
}

function SearchFormWithRouter(props: Omit<SearchFormProps, 'navigate'>) {
  const navigate = useNavigate()
  return <SearchForm {...props} navigate={navigate} />
}

export default SearchFormWithRouter
