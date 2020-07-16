import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import BibliographySelect from '../../../bibliography/ui/BibliographySelect'

type Props = {
  fragmentService
  onChangePages(value: any): void
  onChangeBibliographyReference(value: any): void
  valueBibReference: any
  valuePages: string | null | undefined
}

class ReferenceSearchForm extends Component<Props> {
  render() {
    return (
      <Form>
        <Form.Group as={Row} controlId="reference">
          <Col sm={{ span: 5, offset: 2 }}>
            <BibliographySelect
              aria-labelledby={'BibliographyTitle'}
              value={this.props.valueBibReference}
              onChange={this.props.onChangeBibliographyReference}
              searchBibliography={(query) =>
                this.props.fragmentService.searchBibliography(query)
              }
            />
          </Col>
          <Col sm={5}>
            <Form.Control
              type="text"
              name="pages"
              aria-label="Pages"
              value={this.props.valuePages || ''}
              onChange={this.props.onChangePages}
            />
          </Col>
        </Form.Group>
      </Form>
    )
  }
}

export default ReferenceSearchForm
