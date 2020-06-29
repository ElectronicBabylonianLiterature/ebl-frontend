import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import BibliographySelect from './BibliographySelect'

type Props = {
  fragmentService
  onChange(searchForm: string, searchQuery: string): void
  getState(key: string): string
}

class ReferenceSearchForm extends Component<Props> {
  onChangePage = (event) => {
    this.props.onChange('pages', event.target.value || '')
  }

  render() {
    return (
      <Form>
        <Form.Group as={Row} controlId="reference">
          <Col sm={{ span: 5, offset: 2 }}>
            <BibliographySelect
              aria-label="FragmentId"
              value={this.props.getState('title')}
              onChange={this.props.onChange}
              searchBibliography={(query) =>
                this.props.fragmentService.searchBibliography(query)
              }
            />
          </Col>
          <Col sm={5}>
            <Form.Control
              type="text"
              aria-label="FragmentPage"
              value={this.props.getState('pages')}
              onChange={this.onChangePage}
            />
          </Col>
        </Form.Group>
      </Form>
    )
  }
}

export default ReferenceSearchForm
