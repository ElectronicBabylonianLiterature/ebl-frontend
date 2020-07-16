import React, { Component } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import BibliographySelect from '../../../bibliography/ui/BibliographySelect'

type Props = {
  fragmentService
  onChangeId(value: string): void
  onChangeTitle(value: string): void
  onChangePages(value: any): void
  onChangeValue(value: any): void
  valueTitle: string | null | undefined
  valuePages: string | null | undefined
}
interface State {
  value: any
}
class ReferenceSearchForm extends Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      value: undefined,
    }
  }
  onChange = (event) => {
    this.props.onChangeTitle(event.cslData.title || '')
    this.props.onChangeId(event.cslData.id)
    this.props.onChangeValue(event.cslData)
    this.setState({ value: event.cslData })
  }

  render() {
    return (
      <Form>
        <Form.Group as={Row} controlId="reference">
          <Col sm={{ span: 5, offset: 2 }}>
            <BibliographySelect
              aria-labelledby={'BibliographyTitle'}
              value={this.props.valueTitle}
              onChange={this.onChange}
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
