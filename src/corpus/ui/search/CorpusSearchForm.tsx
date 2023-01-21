import React, { Component } from 'react'
import TextService from 'corpus/application/TextService'
import WordService from 'dictionary/application/WordService'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { CorpusQuery } from './CorpusSearch'
import HelpTrigger from 'common/HelpTrigger'
import { LemmaSearchForm } from 'fragmentarium/ui/LemmaSearchForm'
import { LemmaSearchHelp } from 'fragmentarium/ui/SearchHelp'
import { Form, Row, Col, ButtonToolbar, Button } from 'react-bootstrap'
import _ from 'lodash'
import { stringify } from 'query-string'

interface State {
  lemmas: string | null
}
type Props = {
  textService: TextService
  corpusQuery?: CorpusQuery
  wordService: WordService
  history: History
} & RouteComponentProps

class SearchForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const corpusQuery = this.props.corpusQuery || {}

    this.state = {
      lemmas: corpusQuery.lemmas || '',
    }
  }

  onChange = (name: string) => (value): void => {
    this.setState((prevState) => ({ ...prevState, [name]: value }))
  }

  flattenState(state: State) {
    return _.omitBy(
      {
        lemmas: state.lemmas,
      },
      (value) => !value
    )
  }

  search = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    this.props.history.push(
      `/corpus/search/?${stringify(this.flattenState(this.state))}`
    )
  }

  render() {
    return (
      <>
        <Form>
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
          </Form.Group>
        </Form>
        <ButtonToolbar>
          <Col sm={{ offset: 2 }}>
            <Button
              className="w-25 m-1"
              onClick={this.search}
              variant="primary"
            >
              Search
            </Button>
          </Col>
        </ButtonToolbar>
      </>
    )
  }
}

export default withRouter(SearchForm)
