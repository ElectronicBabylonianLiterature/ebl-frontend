import React, { Component } from 'react'
import { FormGroup, ControlLabel, FormControl, InputGroup } from 'react-bootstrap'
import _ from 'lodash'

class LemmaInput extends Component {
  get hasAttested () {
    return _.has(this.props.value, 'attested')
  }

  get lemmaFormControl () {
    return <FormControl
      type='text'
      value={this.props.value.lemma.join(' ')}
      onChange={this.lemmaChanged} />
  }

  filterChange = change => {
    this.props.onChange(
      this.hasAttested
        ? change
        : _.omit(change, 'attested')
    )
  }

  lemmaChanged = event => {
    this.filterChange({
      lemma: event.target.value.split(' '),
      attested: this.props.value.attested
    })
  }

  attestedChanged = event => {
    this.filterChange({
      lemma: this.props.value.lemma,
      attested: event.target.checked
    })
  }

  render () {
    return (
      <FormGroup controlId={`${this.props.id}`}>
        <ControlLabel>Lemma</ControlLabel>
        {_.has(this.props.value, 'attested') ? (
          <InputGroup>
            <InputGroup.Addon>
              <input
                type='checkbox'
                aria-label='attested'
                checked={this.props.value.attested}
                onChange={this.attestedChanged} />
            </InputGroup.Addon>
            {this.lemmaFormControl}
          </InputGroup>
        )
          : this.lemmaFormControl
        }
      </FormGroup>
    )
  }
}

export default LemmaInput
