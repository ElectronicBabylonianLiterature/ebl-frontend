import React, { Component, FormEvent } from 'react'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import { Button, Col, Form, FormControl, Row } from 'react-bootstrap'
import { FragmentQueryService } from 'search/application/FragmentQueryService'
import { QueryResult } from 'search/infrastructure/QueryResult'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'

interface Props {
  queryService: FragmentQueryService
}
interface State {
  lemma: string
  result: QueryResult | null
}

export default class FullTextSearch extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      lemma: '',
      result: null,
    }
  }

  submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    this.state.lemma.includes('+')
      ? this.props.queryService
          .queryPhrase(this.state.lemma.split('+'))
          .then((result) => this.setState({ ...this.state, result: result }))
      : this.props.queryService
          .query(this.state.lemma)
          .then((result) => this.setState({ ...this.state, result: result }))
  }

  updateQuery = (lemma: string): void => {
    this.setState({
      ...this.state,
      lemma: lemma,
    })
  }

  onChangeValue = (lemma: string): void => {
    this.updateQuery(lemma)
  }

  render(): JSX.Element {
    return (
      <AppContent
        crumbs={[new SectionCrumb('Search')]}
        title="Full Text Search Test"
      >
        <Form onSubmit={this.submit}>
          <Form.Group as={Row} controlId="query">
            <Form.Label column sm={2}>
              Lemma
            </Form.Label>
            <Col sm={6}>
              <FormControl
                type="text"
                placeholder="test"
                onChange={(event) => this.onChangeValue(event.target.value)}
              />
            </Col>
            <Col sm={4}>
              <Button type="submit" variant="primary">
                Query
              </Button>
            </Col>
          </Form.Group>
        </Form>
        {this.state.result?.matchCountTotal ? (
          <section>
            <h4>
              {`Found ${this.state.result?.matchCountTotal} matching lines in ${this.state.result.items.length} fragments`}
            </h4>
            <ul>
              {this.state.result.items.map((queryItem, index) => (
                <li key={index}>
                  {`${queryItem.matchCount} matches in ${museumNumberToString(
                    queryItem.museumNumber
                  )}`}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p>Not found</p>
        )}
      </AppContent>
    )
  }
}
