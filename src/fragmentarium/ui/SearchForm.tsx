import React, { Component } from 'react'
import LuckyButton from 'fragmentarium/ui/front-page/LuckyButton'
import PioneersButton from 'fragmentarium/ui/PioneersButton'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Button, ButtonToolbar, Col, Form, Row } from 'react-bootstrap'
import { stringify } from 'query-string'
import BibliographySelect from 'bibliography/ui/BibliographySelect'
import HelpTrigger from 'common/HelpTrigger'
import _ from 'lodash'
import produce from 'immer'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import {
  FragmentQuery,
  PeriodModifierString,
  PeriodString,
  QueryType,
} from 'query/FragmentQuery'
import WordService from 'dictionary/application/WordService'
import { LemmaQueryTypeForm, LemmaSearchForm } from './LemmaSearchForm'
import { PeriodSearchForm, PeriodModifierSearchForm } from './ScriptSearchForm'
import {
  MuseumSearchHelp,
  ReferenceSearchHelp,
  TransliterationSearchHelp,
  LemmaSearchHelp,
  ScriptSearchHelp,
  GenreSearchHelp,
} from './SearchHelp'
import GenreSearchForm from './GenreSearchForm'
import BibliographyService from 'bibliography/application/BibliographyService'
import { ResearchProjects } from 'research-projects/researchProject'
import './SearchForm.sass'

interface State {
  number: string | null
  referenceEntry: {
    id: string
    label: string
  }
  pages: string | null
  lemmas: string | null
  lemmaOperator: QueryType | null
  transliteration: string | null
  scriptPeriod: PeriodString
  scriptPeriodModifier: PeriodModifierString
  genre: string | null
  project: keyof typeof ResearchProjects | null
  isValid: boolean
}

type Props = {
  fragmentSearchService: FragmentSearchService
  fragmentService: FragmentService
  bibliographyService: BibliographyService
  fragmentQuery?: FragmentQuery
  wordService: WordService
  history: History
  project?: keyof typeof ResearchProjects | null
} & RouteComponentProps

export function isValidNumber(number?: string): boolean {
  return !number || !/^[.*]+$/.test(number.trim())
}

class SearchForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const fragmentQuery = this.props.fragmentQuery || {}

    this.state = {
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
      isValid: isValidNumber(fragmentQuery.number),
      project: fragmentQuery.project || props.project || null,
    }

    if (
      this.state.referenceEntry.id &&
      this.state.referenceEntry.label === ''
    ) {
      this.fetchReferenceLabel()
    }
  }

  fetchReferenceLabel = async () => {
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

  onChange = (name: string) => (value): void => {
    this.setState((prevState) => ({ ...prevState, [name]: value }))
  }

  onChangeNumber = (value: string): void => {
    this.setState({ number: value, isValid: isValidNumber(value) })
  }

  onChangeBibliographyReference = (event: BibliographyEntry) => {
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
        transliteration: replaceTransliteration(cleanedTransliteration),
        scriptPeriodModifier: state.scriptPeriod
          ? state.scriptPeriodModifier
          : '',
        scriptPeriod: state.scriptPeriod,
        genre: state.genre,
        project: state.project,
      },
      (value) => !value
    )
    return _.omit(stateWithoutNull, 'isValid')
  }
  search = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    const updatedState = this.flattenState(this.state)
    this.onChange('transliteration')(updatedState.transliteration)
    this.props.history.push(`/fragmentarium/search/?${stringify(updatedState)}`)
  }

  render(): JSX.Element {
    const rows = this.state.number?.split('\n').length ?? 0
    return (
      <>
        <Form>
          <Form.Group as={Row} controlId="number">
            <Col sm={2} as={Form.Label}>
              <HelpTrigger overlay={MuseumSearchHelp()} />
            </Col>
            <Col>
              <Form.Control
                type="text"
                name="number"
                value={this.state.number || ''}
                placeholder="Museum, accession, CDLI, or excavation number"
                aria-label="Number"
                onChange={(
                  event: React.ChangeEvent<HTMLTextAreaElement>
                ): void => this.onChangeNumber(event.target.value)}
                isInvalid={!this.state.isValid}
              />
              <Form.Control.Feedback type="invalid">
                At least one of prefix, number or suffix must be specified.
              </Form.Control.Feedback>
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="reference">
            <Col sm={2} as={Form.Label}>
              <HelpTrigger overlay={ReferenceSearchHelp()} />
            </Col>
            <Col>
              <BibliographySelect
                isClearable={true}
                ariaLabel="Select bibliography reference"
                value={this.state.referenceEntry}
                onChange={this.onChangeBibliographyReference}
                searchBibliography={(query) =>
                  this.props.fragmentService.searchBibliography(query)
                }
              />
            </Col>
            <Col sm={5}>
              <Form.Control
                type="text"
                name="pages"
                placeholder="Page"
                aria-label="Pages"
                value={this.state.pages || ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
                  this.onChange('pages')(event.target.value)
                }
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="period">
            <Col sm={2} as={Form.Label}>
              <HelpTrigger overlay={ScriptSearchHelp()} />
            </Col>
            <Col>
              <PeriodModifierSearchForm
                onChange={this.onChange('scriptPeriodModifier')}
                value={this.state.scriptPeriodModifier}
              />
            </Col>
            <Col>
              <PeriodSearchForm
                fragmentService={this.props.fragmentService}
                onChange={this.onChange('scriptPeriod')}
                value={this.state.scriptPeriod}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="genre">
            <Col sm={2} as={Form.Label}>
              <HelpTrigger overlay={GenreSearchHelp()} />
            </Col>
            <Col>
              <GenreSearchForm
                fragmentService={this.props.fragmentService}
                onChange={this.onChange('genre')}
                value={this.state.genre}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="lemmas">
            <Col sm={2} as={Form.Label}>
              <HelpTrigger overlay={LemmaSearchHelp()} />
            </Col>
            <Col>
              <LemmaSearchForm
                wordService={this.props.wordService}
                onChange={this.onChange}
                lemmas={this.state.lemmas ?? ''}
              />
            </Col>
            <Col sm={3}>
              <LemmaQueryTypeForm
                value={this.state.lemmaOperator || 'line'}
                onChange={this.onChange('lemmaOperator')}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="transliteration">
            <Col sm={2} as={Form.Label}>
              <HelpTrigger overlay={TransliterationSearchHelp()} />
            </Col>
            <Col sm={10}>
              <Form.Control
                as="textarea"
                value={this.state.transliteration || ''}
                rows={Math.max(2, rows)}
                placeholder="Transliterations"
                aria-label="Transliteration"
                name="transliteration"
                onChange={(
                  event: React.ChangeEvent<HTMLTextAreaElement>
                ): void => this.onChange('transliteration')(event.target.value)}
              />
            </Col>
          </Form.Group>
        </Form>
        <ButtonToolbar>
          <Col sm={{ offset: 2 }} className="SearchForm__ButtonToolbar">
            <Button
              className="w-25 m-1"
              onClick={this.search}
              variant="primary"
              disabled={!this.state.isValid}
            >
              Search
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
