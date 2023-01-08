import React, { Component } from 'react'
import LuckyButton from 'fragmentarium/ui/front-page/LuckyButton'
import PioneersButton from 'fragmentarium/ui/PioneersButton'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Button, ButtonToolbar, Col, Form, Popover, Row } from 'react-bootstrap'
import { stringify } from 'query-string'
import BibliographySelect from 'bibliography/ui/BibliographySelect'
import HelpTrigger from 'common/HelpTrigger'
import _ from 'lodash'
import produce from 'immer'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import { FragmentQuery, QueryType, QueryTypes } from 'query/QueryRepository'
import Select from 'react-select'

interface State {
  number: string | null
  lemmas: string | null
  referenceEntry: {
    id: string
    title: string
    primaryAuthor: string
    year: string
  }
  isValid: boolean
  pages: string | null
  transliteration: string | null
  lemmaOperator: QueryType | null
}

type Props = {
  fragmentSearchService: FragmentSearchService
  fragmentService: FragmentService
  fragmentQuery: FragmentQuery
  history: History
} & RouteComponentProps

class SearchForm extends Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      number: this.props.fragmentQuery.number || null,
      referenceEntry: {
        id: this.props.fragmentQuery.bibId || '',
        title: this.props.fragmentQuery.title || '',
        primaryAuthor: this.props.fragmentQuery.author || '',
        year: this.props.fragmentQuery.bibYear || '',
      },
      isValid: this.isValid(''),
      lemmas: this.props.fragmentQuery.lemmas || null,
      lemmaOperator: this.props.fragmentQuery.lemmaOperator || null,
      pages: this.props.fragmentQuery.pages || null,
      transliteration: this.props.fragmentQuery.transliteration || '',
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
        bibId: state.referenceEntry.id,
        title: state.referenceEntry.title,
        author: state.referenceEntry.primaryAuthor,
        bibYear: state.referenceEntry.year,
        pages: state.pages,
        transliteration: cleanedTransliteration
          ? replaceTransliteration(cleanedTransliteration)
          : '',
        lemmaOperator: state.lemmaOperator,
      },
      (value) => !value
    )
  }
  search = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    this.props.history.push(
      `/fragmentarium/search/?${stringify(this.flattenState(this.state))}`
    )
  }
  ReferenceSearchHelp(): JSX.Element {
    return (
      <Popover
        id={_.uniqueId('ReferenceSearchHelp-')}
        title="Search References"
      >
        <Popover.Content>
          Search for Author and Year <br />
          (e.g. <code>George 20</code> or <code>George 2003</code>) or
          Abbreviation (and Number) <br />
          (e.g. <code>BWL</code> or <code>CT 13</code>)
        </Popover.Content>
      </Popover>
    )
  }
  TransliterationSearchHelp(): JSX.Element {
    return (
      <Popover
        id={_.uniqueId('TransliterationSearchHelp-')}
        title="Search transliterations"
      >
        <Popover.Content>
          <ul>
            <li>
              Sequences of signs are retrieved regardless of the values entered:
              e.g., <code>me lik</code> will retrieve <code>šip taš</code>,{' '}
              <code>me ur</code>, etc.
            </li>
            <li>
              Signs in consecutive lines can be searched by entering them in
              consecutive lines of the search field.
            </li>
            <li>
              Text with diacritics (e.g. <code>ša₂</code>, <code>á</code>) or
              without them (e.g. <code>sza2</code> or <code>ca2</code>,{' '}
              <code>s,a3</code>, <code>t,a4</code>) can be entered.
            </li>
            <li>
              Accepted Wildcards: <code>?</code> (any one sign); <code>*</code>{' '}
              (any sign or sequence of signs in a line); <code>[a|b]</code>{' '}
              (alternative signs, e.g. <code>[bu|ba]</code>).
            </li>
          </ul>
        </Popover.Content>
      </Popover>
    )
  }

  render(): JSX.Element {
    const rows = this.state.number?.split('\n').length ?? 0
    return (
      <>
        <Form>
          <Form.Group as={Row} controlId="lemmas">
            <Col sm={{ span: 8, offset: 2 }}>
              <Form.Control
                type="text"
                name="lemmas"
                value={this.state.lemmas || ''}
                placeholder="Search lemmas"
                aria-label="Lemmas"
                onChange={(
                  event: React.ChangeEvent<HTMLTextAreaElement>
                ): void => this.onChange('lemmas')(event.target.value)}
              />
            </Col>
            <Col>
              <Select
                aria-label="select-lemma-operator"
                options={QueryTypes.map((queryType) => ({
                  value: queryType,
                  label: queryType,
                }))}
                value={{
                  value: this.state.lemmaOperator || 'and',
                  label: this.state.lemmaOperator || 'and',
                }}
                onChange={(event): void =>
                  this.onChange('lemmaOperator')(event?.value || 'and')
                }
                className={'script-selection__selection'}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="number">
            <Col sm={{ span: 10, offset: 2 }}>
              <Form.Control
                type="text"
                name="number"
                value={this.state.number || ''}
                placeholder="Search museum, accession, or CDLI number"
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
              <HelpTrigger overlay={this.ReferenceSearchHelp()} />
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
          <Form.Group as={Row} controlId="transliteration">
            <Col
              sm={2}
              as={Form.Label}
              className="TransliterationSearchForm__label"
            >
              <HelpTrigger overlay={this.TransliterationSearchHelp()} />
            </Col>
            <Col sm={10}>
              <Form.Control
                as="textarea"
                value={this.state.transliteration || ''}
                rows={Math.max(2, rows)}
                placeholder="Search transliterations (in Corpus and Fragmentarium)"
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
