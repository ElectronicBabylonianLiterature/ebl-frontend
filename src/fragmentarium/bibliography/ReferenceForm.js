import React, { Component } from 'react'
import { FormGroup, FormLabel, FormControl, Col } from 'react-bootstrap'
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
      <FormGroup controlId={`${this.id}-Entry`}>
        <label id={this.documentLabelId}>Document</label>
        <BibliographySelect
          aria-labelledby={this.documentLabelId}
          value={this.props.value.document}
          searchBibliography={this.props.searchBibliography}
          onChange={this.handleChange('setDocument')} />
      </FormGroup>
      <FormGroup>
        <Col md={4}>
          <FormGroup controlId={`${this.id}-Pages`}>
            <FormLabel>Pages</FormLabel>
            <FormControl
              type='text'
              value={this.props.value.pages}
              onChange={this.handleEvent('setPages')} />
          </FormGroup>
        </Col>
        <Col md={4}>
          <FormGroup controlId={`${this.id}-Type`}>
            <FormLabel>Type</FormLabel>
            <FormControl
              as='select'
              value={this.props.value.type}
              onChange={this.handleEvent('setType')}
              required >
              <option value='EDITION'>Edition</option>
              <option value='DISCUSSION'>Discussion</option>
              <option value='COPY'>Copy</option>
              <option value='PHOTO'>Photo</option>
            </FormControl>
          </FormGroup>
        </Col>
        <Col md={4}>
          <ArrayInput
            separator=','
            value={this.props.value.linesCited}
            onChange={this.handleChange('setLinesCited')}>
            Lines Cited
          </ArrayInput>
        </Col>
      </FormGroup>
      <FormGroup controlId={`${this.id}-Notes`}>
        <FormLabel>Notes</FormLabel>
        {' '}
        <HelpTrigger overlay={NotesHelp()} />
        <FormControl
          type='text'
          defaultValue={this.props.value.notes}
          onChange={this.handleEvent('setNotes')} />
      </FormGroup>
    </>)
  }
}
