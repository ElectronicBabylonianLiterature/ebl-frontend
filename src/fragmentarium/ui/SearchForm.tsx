import React, { Component } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { stringify } from 'query-string'
import { produce } from 'immer'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import BibliographyService from 'bibliography/application/BibliographyService'
import WordService from 'dictionary/application/WordService'
import DossiersService from 'dossiers/application/DossiersService'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { FragmentQuery } from 'query/FragmentQuery'
import { ResearchProjects } from 'research-projects/researchProject'
import LemmaSearchForm from 'fragmentarium/ui/search/SearchFormLemma'
import NumberSearchForm from 'fragmentarium/ui/search/SearchFormNumber'
import ReferenceSearchForm from 'fragmentarium/ui/search/SearchFormReference'
import TransliterationSearchForm from 'fragmentarium/ui/search/SearchFormTransliteration'
import SearchFormAdvancedFields from 'fragmentarium/ui/SearchFormAdvancedFields'
import SearchFormButtonToolbar from 'fragmentarium/ui/SearchFormButtonToolbar'
import { helpColSize } from 'fragmentarium/ui/searchFormLayout'
import {
  createSearchFormState,
  flattenSearchFormState,
  isValidNumber,
  SearchFormState,
  SearchFormValue,
} from 'fragmentarium/ui/SearchFormState'
import './SearchForm.sass'

export { helpColSize } from 'fragmentarium/ui/searchFormLayout'
export { isValidNumber } from 'fragmentarium/ui/SearchFormState'

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

class SearchForm extends Component<SearchFormProps, SearchFormState> {
  basepath: string
  private showAdvancedSearch: boolean

  constructor(props: SearchFormProps) {
    super(props)
    this.basepath = props.project
      ? `/projects/${props.project.toLowerCase()}/search/`
      : '/library/search/'

    const fragmentQuery = this.props.fragmentQuery || {}

    this.state = createSearchFormState(fragmentQuery)
    this.showAdvancedSearch = props.showAdvancedSearch ?? false

    if (
      this.state.referenceEntry.id &&
      this.state.referenceEntry.label === ''
    ) {
      this.fetchReferenceLabel()
    }
  }

  fetchReferenceLabel = async (): Promise<void> => {
    const { bibliographyService } = this.props
    const { id } = this.state.referenceEntry
    const reference = await bibliographyService.find(id)
    this.setState({
      referenceEntry: {
        id: id,
        label: reference.label,
      },
    })
  }

  onChange =
    (name: string) =>
    (value: SearchFormValue): void => {
      this.setState((prevState) => ({ ...prevState, [name]: value ?? null }))
    }

  onChangeNumber = (value: string): void => {
    this.setState({ number: value, isValid: isValidNumber(value) })
  }

  onChangeBibliographyReference = (event: BibliographyEntry): void => {
    const newState = produce(this.state, (draftState) => {
      draftState.referenceEntry.label = event.label
      draftState.referenceEntry.id = event.id || ''
    })
    this.setState(newState)
  }

  search = (
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent,
  ): void => {
    event.preventDefault()
    const updatedState = flattenSearchFormState(this.state)
    this.onChange('transliteration')(updatedState.transliteration)

    this.props.navigate({
      pathname: this.basepath,
      search: `?${stringify(updatedState)}`,
    })
  }

  handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.ctrlKey && event.key === 'Enter' && this.state.isValid) {
      this.search(event)
    }
  }

  render(): JSX.Element {
    const rows = this.state.number?.split('\n').length ?? 0
    return (
      <>
        <Form
          onKeyDown={this.handleKeyDown}
          className={'SearchForm SearchForm__wrapper'}
        >
          <Row>
            <Col>
              <NumberSearchForm
                value={this.state.number}
                isValid={this.state.isValid}
                onChangeNumber={this.onChangeNumber}
              />
              <ReferenceSearchForm
                referenceEntry={this.state.referenceEntry}
                pages={this.state.pages}
                onChangePages={this.onChange('pages')}
                onChangeBibliographyReference={
                  this.onChangeBibliographyReference
                }
                fragmentService={this.props.fragmentService}
              />
              <LemmaSearchForm
                lemmas={this.state.lemmas}
                lemmaOperator={this.state.lemmaOperator}
                onChange={this.onChange}
                onChangeLemmaOperator={this.onChange('lemmaOperator')}
                wordService={this.props.wordService}
              />
              <TransliterationSearchForm
                value={this.state.transliteration}
                onChangeTransliteration={this.onChange('transliteration')}
                rows={rows}
              />
              {!this.showAdvancedSearch && (
                <Row className={'SearchForm__advanced-link'}>
                  <Col
                    sm={helpColSize}
                    className={'SearchForm__help-col'}
                  ></Col>
                  <Col>
                    <Button variant="link" onClick={this.search}>
                      Advanced Search{' '}
                      <i
                        className={'fas fa-external-link'}
                        aria-hidden="true"
                      ></i>
                    </Button>
                  </Col>
                </Row>
              )}
            </Col>
            {this.showAdvancedSearch && (
              <SearchFormAdvancedFields
                state={this.state}
                onChange={this.onChange}
                fragmentService={this.props.fragmentService}
                dossiersService={this.props.dossiersService}
              />
            )}
          </Row>
          <Row>
            <Col>
              <SearchFormButtonToolbar
                project={this.props.project}
                isValid={this.state.isValid}
                onSearch={this.search}
                fragmentSearchService={this.props.fragmentSearchService}
              />
            </Col>
          </Row>
        </Form>
      </>
    )
  }
}

function SearchFormWithRouter(props: Omit<SearchFormProps, 'navigate'>) {
  const navigate = useNavigate()
  return <SearchForm {...props} navigate={navigate} />
}

export default SearchFormWithRouter
