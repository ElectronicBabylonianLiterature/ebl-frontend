import React, { Component } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Button, ButtonToolbar, Col, Form, Row } from 'react-bootstrap'
import { stringify } from 'query-string'
import _ from 'lodash'
import produce from 'immer'
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
import LuckyButton from 'fragmentarium/ui/front-page/LuckyButton'
import PioneersButton from 'fragmentarium/ui/PioneersButton'
import GenreSearchForm from 'fragmentarium/ui/search/SearchFormGenre'
import LemmaSearchForm from 'fragmentarium/ui/search/SearchFormLemma'
import MuseumSearchForm from 'fragmentarium/ui/search/SearchFormMuseum'
import NumberSearchForm from 'fragmentarium/ui/search/SearchFormNumber'
import PeriodSearchForm from 'fragmentarium/ui/search/SearchFormPeriod'
import ProvenanceSearchForm from 'fragmentarium/ui/search/SearchFormProvenance'
import ReferenceSearchForm from 'fragmentarium/ui/search/SearchFormReference'
import TransliterationSearchForm from 'fragmentarium/ui/search/SearchFormTransliteration'
import './SearchForm.sass'

interface State {
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
}

type SearchFormValue =
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
} & RouteComponentProps

export function isValidNumber(number?: string): boolean {
  return !number || !/^\[.*\]+$/.test(number.trim())
}

export const helpColSize = 1

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

    this.state = this.initializeState(fragmentQuery)
    this.showAdvancedSearch = props.showAdvancedSearch ?? false

    if (
      this.state.referenceEntry.id &&
      this.state.referenceEntry.label === ''
    ) {
      this.fetchReferenceLabel()
    }
  }

  initializeState(fragmentQuery): State {
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

  onChange = (name: string) => (value: SearchFormValue): void => {
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

  flattenState(state: State): FragmentQuery {
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
        site: state.site ? state.site.split(/\[|\]/)[0] : '',
        project: state.project,
        museum: state.museum,
      },
      (value) => !value
    )
    return _.omit(stateWithoutNull, 'isValid')
  }

  search = (
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent
  ): void => {
    event.preventDefault()
    const updatedState = this.flattenState(this.state)
    this.onChange('transliteration')(updatedState.transliteration)

    this.props.history.push({
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
    stateKey: string
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
        <Form onKeyDown={this.handleKeyDown} className={'SearchForm__wrapper'}>
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
            </Col>
            {this.showAdvancedSearch && (
              <Col md={6}>
                {this.renderSearchField(
                  GenreSearchForm,
                  this.state.genre,
                  'genre'
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
                    'scriptPeriodModifier'
                  )}
                  fragmentService={this.props.fragmentService}
                />
                {this.renderSearchField(
                  ProvenanceSearchForm,
                  this.state.site,
                  'site'
                )}
              </Col>
            )}
          </Row>
        </Form>
        <ButtonToolbar>
          <Col sm={{ offset: 1 }} className="SearchForm__ButtonToolbar">
            <Button
              className="w-25 m-1"
              onClick={this.search}
              variant="primary"
              disabled={!this.state.isValid}
            >
              {this.props.project
                ? `Search in ${this.props.project}`
                : 'Search'}
            </Button>
            {!this.props.project && (
              <>
                <LuckyButton
                  fragmentSearchService={this.props.fragmentSearchService}
                />
                <PioneersButton
                  fragmentSearchService={this.props.fragmentSearchService}
                />
              </>
            )}
          </Col>
        </ButtonToolbar>
      </>
    )
  }
}

export default withRouter(SearchForm)
