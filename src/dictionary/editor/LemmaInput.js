import React, { Component } from 'react'
import { FormGroup, ControlLabel, FormControl, InputGroup } from 'react-bootstrap'
import _ from 'lodash'

class LemmaInput extends Component {
  render () {
    return _.has(this.props.value, 'attested') ? (
      <FormGroup controlId={`${this.props.id}`}>
        <ControlLabel>Lemma</ControlLabel>
        <InputGroup>
          <InputGroup.Addon>
            <input type='checkbox' aria-label='attested' checked={this.props.value.attested} onChange={_.noop} />
          </InputGroup.Addon>
          <FormControl
            type='text'
            value={this.props.value.lemma.join(' ')}
            onChange={_.noop} />
        </InputGroup>
      </FormGroup>
    ) : (
      <FormGroup controlId={`${this.props.id}-lemma`}>
        <ControlLabel>Lemma</ControlLabel>
        <FormControl
          type='text'
          value={this.props.value.lemma.join(' ')}
          onChange={_.noop} />
      </FormGroup>
    )
  }
}

export default LemmaInput
