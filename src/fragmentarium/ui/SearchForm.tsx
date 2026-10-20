import React, { Component } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { stringify } from 'query-string'
import { produce } from 'immer'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import GenreSearchForm from 'fragmentarium/ui/search/SearchFormGenre'
import LemmaSearchForm from 'fragmentarium/ui/search/SearchFormLemma'
import MuseumSearchForm from 'fragmentarium/ui/search/SearchFormMuseum'
import NumberSearchForm from 'fragmentarium/ui/search/SearchFormNumber'
import PeriodSearchForm from 'fragmentarium/ui/search/SearchFormPeriod'
import ProvenanceSearchForm from 'fragmentarium/ui/search/SearchFormProvenance'
import ReferenceSearchForm from 'fragmentarium/ui/search/SearchFormReference'
import TransliterationSearchForm from 'fragmentarium/ui/search/SearchFormTransliteration'
import SearchFormDossier from './search/SearchFormDossier'
import './SearchForm.sass'
import SearchFormButtons from 'fragmentarium/ui/SearchFormButtons'
import {
  State,
  SearchFormValue,
  SearchFormProps,
  helpColSize,
  isValidNumber,
  initializeState,
  flattenState,
} from 'fragmentarium/ui/SearchForm.state'
export { helpColSize, isValidNumber } from 'fragmentarium/ui/SearchForm.state'
export type { SearchFormProps } from 'fragmentarium/ui/SearchForm.state'

const SearchField = <T extends React.ElementType>({
  component: Component,
  ...props
}: { component: T } & React.ComponentProps<T>) => {
  return <Component {...props} />
}

class SearchForm extends Component<SearchFormProps, State> {
  basepath: string
  private showAdvancedSearch: boolean

  constructor(props: SearchFormProps) {
    super(props)
    this.basepath = props.project
      ? `/projects/${props.project.toLowerCase()}/search/`
      : '/library/search/'

    const fragmentQuery = this.props.fragmentQuery || {}

    this.state = initializeState(fragmentQuery)
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
      draftState.referenceEntry.label = event.label || ''
      draftState.referenceEntry.id = event.id || ''
    })
    this.setState(newState)
  }

  search = (
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent,
  ): void => {
    event.preventDefault()
    const updatedState = flattenState(this.state)
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

  renderSearchField = (
    component: React.ElementType,
    stateValue: string | null,
    stateKey: string,
  ) => (
    <SearchField
      component={component}
      value={stateValue}
      onChange={this.onChange(stateKey)}
      fragmentService={this.props.fragmentService}
    />
  )

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
              <Col md={6}>
                {this.renderSearchField(
                  GenreSearchForm,
                  this.state.genre,
                  'genre',
                )}
                <SearchField
                  component={MuseumSearchForm}
                  value={this.state.museum}
                  onChange={this.onChange('museum')}
                />
                <PeriodSearchForm
                  scriptPeriod={this.state.scriptPeriod}
                  scriptPeriodModifier={this.state.scriptPeriodModifier}
                  onChangeScriptPeriod={this.onChange('scriptPeriod')}
                  onChangeScriptPeriodModifier={this.onChange(
                    'scriptPeriodModifier',
                  )}
                  fragmentService={this.props.fragmentService}
                />
                {this.renderSearchField(
                  ProvenanceSearchForm,
                  this.state.site,
                  'site',
                )}
                <SearchFormDossier
                  ariaLabel="Dossier"
                  value={this.state.dossier}
                  searchSuggestions={(inputValue: string, filters) =>
                    this.props.dossiersService.searchSuggestions(
                      inputValue,
                      filters,
                    )
                  }
                  onChange={this.onChange('dossier')}
                  isClearable={true}
                  filters={{
                    provenance: this.state.site,
                    scriptPeriod: this.state.scriptPeriod,
                    genre: this.state.genre,
                  }}
                />
              </Col>
            )}
          </Row>
          <Row>
            <Col>
              <SearchFormButtons
                project={this.props.project}
                fragmentSearchService={this.props.fragmentSearchService}
                isValid={this.state.isValid}
                onSearch={this.search}
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
