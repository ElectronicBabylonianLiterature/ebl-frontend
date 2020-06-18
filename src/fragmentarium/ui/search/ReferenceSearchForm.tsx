import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import BibliographyEntry from '../../../bibliography/domain/BibliographyEntry'
import BibliographySelect from './BibliographySelect'
import Reference from '../../../bibliography/domain/Reference'

type Props = {
  fragmentService
  handleChanges(searchForm: string, searchQuery: string): void
  getUserInput(key: string): string
}

class ReferenceSearchForm extends Component<Props> {
  onChangePage = (event) => {
    this.props.handleChanges('pages', event.target.value || '')
  }

  render() {
    return (
      <Form>
        <Form.Group as={Row} controlId="reference">
          <Col sm={{ span: 5, offset: 2 }}>
            <BibliographySelect
              aria-label="FragmentId"
              value={this.props.getUserInput('title')}
              onChange={this.props.handleChanges}
              searchBibliography={(query) =>
                this.props.fragmentService.searchBibliography(query)
              }
            />
          </Col>
          <Col sm={5}>
            <Form.Control
              type="text"
              aria-label="FragmentPage"
              value={this.props.getUserInput('pages')}
              onChange={this.onChangePage}
            />
          </Col>
        </Form.Group>
      </Form>
    )
  }
}

export default ReferenceSearchForm
