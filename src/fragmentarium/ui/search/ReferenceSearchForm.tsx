import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import BibliographySelect from './BibliographySelect'

type Props = {
  fragmentService
  onChange(searchForm: string, searchQuery: string): void
  value_title: string
  value_pages: string
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
              aria-label="BibliographyTitle"
              value={this.props.value_title}
              onChange={this.props.onChange}
              searchBibliography={(query) =>
                this.props.fragmentService.searchBibliography(query)
              }
            />
          </Col>
          <Col sm={5}>
            <Form.Control
              type="text"
              aria-label="Pages"
              value={this.props.value_pages}
              onChange={this.onChangePage}
            />
          </Col>
        </Form.Group>
      </Form>
    )
  }
}

export default ReferenceSearchForm
