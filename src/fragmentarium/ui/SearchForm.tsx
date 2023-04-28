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
  ReferenceSearchHelp,
  TransliterationSearchHelp,
  LemmaSearchHelp,
  ScriptSearchHelp,
  GenreSearchHelp,
} from './SearchHelp'
import GenreSearchForm from './GenreSearchForm'

interface State {
  number: string | null
  referenceEntry: {
    id: string
    title: string
    primaryAuthor: string
    year: string
  }
  pages: string | null
  lemmas: string | null
  lemmaOperator: QueryType | null
  transliteration: string | null
  scriptPeriod: PeriodString
  scriptPeriodModifier: PeriodModifierString
  genre: readonly string[] | null
  isValid: boolean
}

type Props = {
  fragmentSearchService: FragmentSearchService
  fragmentService: FragmentService
  fragmentQuery?: FragmentQuery
  wordService: WordService
  history: History
} & RouteComponentProps

class SearchForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const fragmentQuery = this.props.fragmentQuery || {}

    this.state = {
      number: fragmentQuery.number || null,
      referenceEntry: {
        id: fragmentQuery.bibId || '',
        title: fragmentQuery.title || '',
        primaryAuthor: fragmentQuery.author || '',
        year: fragmentQuery.bibYear || '',
      },
      pages: fragmentQuery.pages || null,
      lemmas: fragmentQuery.lemmas || '',
      lemmaOperator: fragmentQuery.lemmaOperator || 'line',
      transliteration: fragmentQuery.transliteration || '',
      scriptPeriod: fragmentQuery.scriptPeriod || '',
      scriptPeriodModifier: fragmentQuery.scriptPeriodModifier || '',
      genre: fragmentQuery.genre || null,
      isValid: this.isValid(''),
    }
  }

  onChange = (name: string) => (value): void => {
    this.setState((prevState) => ({ ...prevState, [name]: value }))
  }

  onChangePages = (value: string): void => {
    this.setState({ pages: value, isValid: this.isValid(value) })
  }
  isValid(pages: string | null | undefined): boolean {
    return !!(Number(pages) || !pages)
  }

  onChangeBibliographyReference = (event: BibliographyEntry) => {
    const newState = produce(this.state, (draftState) => {
      draftState.referenceEntry.title = event.title || ''
      draftState.referenceEntry.id = event.id || ''
      draftState.referenceEntry.primaryAuthor = event.primaryAuthor || ''
      draftState.referenceEntry.year = event.year || ''
    })
    this.setState(newState)
  }

  flattenState(state: State) {
    const cleanedTransliteration = _.trimEnd(state.transliteration || '')
    return _.omitBy(
      {
        number: state.number,
        lemmas: state.lemmas,
        lemmaOperator: state.lemmas ? state.lemmaOperator : '',
        bibId: state.referenceEntry.id,
        title: state.referenceEntry.title,
        author: state.referenceEntry.primaryAuthor,
        bibYear: state.referenceEntry.year,
        pages: state.pages,
        transliteration: replaceTransliteration(cleanedTransliteration),
        scriptPeriodModifier: state.scriptPeriod
          ? state.scriptPeriodModifier
          : '',
        scriptPeriod: state.scriptPeriod,
        genre: _.isEmpty(state.genre) ? null : state.genre,
      },
      (value) => !value
    )
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
            <Col sm={{ span: 10, offset: 2 }}>
              <Form.Control
                type="text"
                name="number"
                value={this.state.number || ''}
                placeholder="Museum, accession, or CDLI number"
                aria-label="Number"
                onChange={(
                  event: React.ChangeEvent<HTMLTextAreaElement>
                ): void => this.onChange('number')(event.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="reference">
            <Col
              sm={2}
              as={Form.Label}
              className="TransliterationSearchForm__label"
            >
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
                  this.onChangePages(event.target.value)
                }
                isInvalid={!this.state.isValid}
              />
              <Form.Control.Feedback type="invalid">
                &quot;Page&quot; should be numeric.
              </Form.Control.Feedback>
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="lemmas">
            <Col
              sm={2}
              as={Form.Label}
              className="TransliterationSearchForm__label"
            >
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
            <Col
              sm={2}
              as={Form.Label}
              className="TransliterationSearchForm__label"
            >
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
          <Form.Group as={Row} controlId="period">
            <Col
              sm={2}
              as={Form.Label}
              className="TransliterationSearchForm__label"
            >
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
            <Col
              sm={2}
              as={Form.Label}
              className="TransliterationSearchForm__label"
            >
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
        </Form>
        <ButtonToolbar>
          <Col sm={{ offset: 2 }}>
            <Button
              className="w-25 m-1"
              onClick={this.search}
              variant="primary"
              disabled={!this.state.isValid}
            >
              Search
            </Button>
            <LuckyButton
              fragmentSearchService={this.props.fragmentSearchService}
            />
            <PioneersButton
              fragmentSearchService={this.props.fragmentSearchService}
            />
          </Col>
        </ButtonToolbar>
      </>
    )
  }
}
export default withRouter(SearchForm)
