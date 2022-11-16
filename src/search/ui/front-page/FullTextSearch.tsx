import React, { Component, FormEvent } from 'react'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import { Button, Col, Form, FormControl, Row } from 'react-bootstrap'
import { FragmentQueryService } from 'search/application/FragmentQueryService'

interface Props {
  queryService: FragmentQueryService
}
interface State {
  lemma: string
}

export default class FullTextSearch extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      lemma: '',
    }
  }

  submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    console.log('submitted!')
    this.props.queryService
      .query(this.state.lemma)
      .then((result) => console.log(result))
  }

  updateQuery = (lemma: string): void => {
    this.setState({
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
      </AppContent>
    )
  }
}
