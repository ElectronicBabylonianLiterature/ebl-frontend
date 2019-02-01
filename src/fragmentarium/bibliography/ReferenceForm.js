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

  handleDocumentChange = entry => this.props.onChange({
    ...this.props.value,
    id: entry.id,
    document: entry
  })

  handleChange = property => value => this.props.onChange({
    ...this.props.value,
    [property]: value
  })

  handleEvent = property => ({ target }) => this.handleChange(property)(target.value)

  render () {
    return (<>
      <FormGroup controlId={`${this.id}-Entry`}>
        <label id={this.documentLabelId}>Document</label>
        <BibliographySelect
          aria-labelledby={this.documentLabelId}
          value={this.props.value.document}
          searchBibliography={this.props.searchBibliography}
          onChange={this.handleDocumentChange} />
      </FormGroup>
      <FormGroup>
        <Col md={4}>
          <FormGroup controlId={`${this.id}-Pages`}>
            <FormLabel>Pages</FormLabel>
            <FormControl
              type='text'
              value={this.props.value.pages}
              onChange={this.handleEvent('pages')} />
          </FormGroup>
        </Col>
        <Col md={4}>
          <FormGroup controlId={`${this.id}-Type`}>
            <FormLabel>Type</FormLabel>
            <FormControl
              as='select'
              value={this.props.value.type}
              onChange={this.handleEvent('type')}
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
            onChange={this.handleChange('linesCited')}>
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
          onChange={this.handleEvent('notes')} />
      </FormGroup>
    </>)
  }
}
