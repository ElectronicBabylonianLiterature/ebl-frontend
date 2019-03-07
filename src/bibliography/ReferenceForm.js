import React, { Component } from 'react'
import { Form, Col } from 'react-bootstrap'
import _ from 'lodash'

import ArrayInput from 'common/ArrayInput'
import HelpTrigger from 'common/HelpTrigger'
import BibliographySelect from 'bibliography/BibliographySelect'
import NotesHelp from './NotesHelp'

export default class ReferenceForm extends Component {
  constructor (props) {
    super(props)
    this.id = _.uniqueId('ReferenceForm-')
    this.documentLabelId = _.uniqueId('ReferenceForm-Document-')
  }

  handleChange = setter => value => this.props.onChange(this.props.value[setter](value))

  handleEvent = setter => ({ target: { value } }) => this.handleChange(setter)(value)

  render () {
    return (<>
      <Form.Group controlId={`${this.id}-Entry`}>
        <label id={this.documentLabelId}>Document</label>
        <BibliographySelect
          aria-labelledby={this.documentLabelId}
          value={this.props.value.document}
          searchBibliography={this.props.searchBibliography}
          onChange={this.handleChange('setDocument')} />
      </Form.Group>
      <Form.Row>
        <Col>
          <Form.Group controlId={`${this.id}-Pages`}>
            <Form.Label>Pages</Form.Label>
            <Form.Control
              type='text'
              value={this.props.value.pages}
              onChange={this.handleEvent('setPages')} />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId={`${this.id}-Type`}>
            <Form.Label>Type</Form.Label>
            <Form.Control
              as='select'
              value={this.props.value.type}
              onChange={this.handleEvent('setType')}
              required >
              <option value='EDITION'>Edition</option>
              <option value='DISCUSSION'>Discussion</option>
              <option value='COPY'>Copy</option>
              <option value='PHOTO'>Photo</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <ArrayInput
            separator=','
            value={this.props.value.linesCited}
            onChange={this.handleChange('setLinesCited')}>
            Lines Cited
          </ArrayInput>
        </Col>
      </Form.Row>
      <Form.Group controlId={`${this.id}-Notes`}>
        <Form.Label>Notes</Form.Label>
        {' '}
        <HelpTrigger overlay={NotesHelp()} />
        <Form.Control
          type='text'
          value={this.props.value.notes}
          onChange={this.handleEvent('setNotes')} />
      </Form.Group>
    </>)
  }
}
