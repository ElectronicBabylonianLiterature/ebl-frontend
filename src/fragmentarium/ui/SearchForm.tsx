import React, { Component } from 'react'
import { useNavigate } from 'react-router-dom'
import { stringify } from 'common/utils/queryString'
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
import SearchFormFields from 'fragmentarium/ui/SearchFormFields'
import {
  SearchFormState,
  SearchFormValue,
  initializeSearchFormState,
  flattenSearchFormState,
  isValidNumber,
} from 'fragmentarium/ui/SearchForm.state'
import 'fragmentarium/ui/SearchForm.sass'

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

export { isValidNumber }

export class SearchForm extends Component<SearchFormProps, SearchFormState> {
  private readonly basepath: string
  private readonly showAdvancedSearch: boolean
  private isComponentMounted = false
  private referenceRequestGeneration = 0

  constructor(props: SearchFormProps) {
    super(props)
    this.basepath = props.project
      ? '/projects/' + props.project.toLowerCase() + '/search/'
      : '/library/search/'
    this.state = initializeSearchFormState(props.fragmentQuery ?? {})
    this.showAdvancedSearch = props.showAdvancedSearch ?? false
  }

  componentDidMount(): void {
    this.isComponentMounted = true
    this.fetchMissingReferenceLabel()
  }

  componentWillUnmount(): void {
    this.isComponentMounted = false
    this.referenceRequestGeneration += 1
  }

  componentDidUpdate(previousProps: SearchFormProps): void {
    if (!_.isEqual(previousProps.fragmentQuery, this.props.fragmentQuery)) {
      this.referenceRequestGeneration += 1
      this.setState(
        initializeSearchFormState(this.props.fragmentQuery ?? {}),
        this.fetchMissingReferenceLabel,
      )
    }
  }

  private fetchMissingReferenceLabel = (): void => {
    if (this.state.referenceEntry.id && !this.state.referenceEntry.label) {
      void this.fetchReferenceLabel()
    }
  }

  private fetchReferenceLabel = async (): Promise<void> => {
    const { id } = this.state.referenceEntry
    const generation = ++this.referenceRequestGeneration
    try {
      const reference = await this.props.bibliographyService.find(id)
      this.setReferenceLabel(id, reference.label, generation)
    } catch {
      this.setReferenceLabel(
        id,
        id,
        generation,
        `Unable to load bibliography entry ${id}. The reference filter is still active.`,
      )
    }
  }

  private setReferenceLabel = (
    id: string,
    label: string,
    generation: number,
    referenceLabelError: string | null = null,
  ): void => {
    if (
      this.isComponentMounted &&
      this.state.referenceEntry.id === id &&
      this.referenceRequestGeneration === generation
    ) {
      this.setState({ referenceEntry: { id, label }, referenceLabelError })
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
    this.referenceRequestGeneration += 1
    this.setState(
      produce(this.state, (state) => {
        state.referenceEntry.label = event.id ? event.label : ''
        state.referenceEntry.id = event.id || ''
        state.referenceLabelError = null
      }),
    )
  }

  private navigateWithState = (state: SearchFormState): void => {
    const query = flattenSearchFormState(state)
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
