import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import BibliographySelect from '../../../bibliography/ui/BibliographySelect'
import BibliographyEntry from '../../../bibliography/domain/BibliographyEntry'

type Props = {
  handleChanges(searchForm: string, searchQuery: string): void
  getUserInput(key: string): string
  searchBibliography: (query: string) => ReadonlyArray<BibliographyEntry>
}

class ReferenceSearchForm extends Component<Props> {
  onChangeId = (event) => {
    console.log(event)
    //this.props.handleChanges('id', event.target.value || '')
  }

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
              value={{
                type: 'DISCUSSION',
                pages: '',
                notes: '',
                linesCited: [],
                document: {
                  cslData: {},
                },
              }}
              searchBibliography={this.props.searchBibliography}
              onChange={this.onChangeId}
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
