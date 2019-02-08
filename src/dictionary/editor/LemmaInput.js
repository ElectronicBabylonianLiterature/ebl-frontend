import React, { Component } from 'react'
import { FormGroup, FormLabel, FormControl, InputGroup } from 'react-bootstrap'
import _ from 'lodash'

class LemmaInput extends Component {
  get hasAttested () {
    return _.has(this.props.value, 'attested')
  }

  lemmaFormControl = () => {
    return <FormControl
      type='text'
      value={this.props.value.lemma.join(' ')}
      onChange={this.lemmaChanged} />
  }

  lemmaChanged = event => {
    this.props.onChange({
      ...this.props.value,
      lemma: event.target.value.split(' ')
    })
  }

  attestedChanged = event => {
    this.props.onChange({
      ...this.props.value,
      attested: event.target.checked
    })
  }

  render () {
    return (
      <FormGroup controlId={`${this.props.id}`}>
        <FormLabel>Lemma</FormLabel>
        {_.has(this.props.value, 'attested') ? (
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Checkbox
                type='checkbox'
                aria-label='attested'
                checked={this.props.value.attested}
                onChange={this.attestedChanged} />
            </InputGroup.Prepend>
            <this.lemmaFormControl />
          </InputGroup>
        )
          : <this.lemmaFormControl />
        }
      </FormGroup>
    )
  }
}

export default LemmaInput
