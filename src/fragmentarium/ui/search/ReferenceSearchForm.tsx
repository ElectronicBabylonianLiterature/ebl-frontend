import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import BibliographySelect from '../../../bibliography/ui/BibliographySelect'

type Props = {
  fragmentService
  onChangeId(value: string): void
  onChangeTitle(value: string): void
  onChangePages(value: string): void
  value_title: string | null | undefined
  value_pages: string | null | undefined
}

class ReferenceSearchForm extends Component<Props> {
  onChangePages = (event) => {
    this.props.onChangePages(event.target.value || '')
  }

  onChange = (event) => {
    console.log(event)
  }

  render() {
    return (
      <Form>
        <Form.Group as={Row} controlId="reference">
          <Col sm={{ span: 5, offset: 2 }}>
            <BibliographySelect
              aria-labelledby={'BibliographyTitle'}
              value={this.props.value_title || ''}
              onChange={this.onChange}
              searchBibliography={(query) =>
                this.props.fragmentService.searchBibliography(query)
              }
            />
          </Col>
          <Col sm={5}>
            <Form.Control
              type="text"
              aria-label="Pages"
              value={this.props.value_pages || ''}
              onChange={this.onChangePages}
            />
          </Col>
        </Form.Group>
      </Form>
    )
  }
}

export default ReferenceSearchForm
