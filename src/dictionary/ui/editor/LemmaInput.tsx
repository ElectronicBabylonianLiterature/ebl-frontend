import React, { ChangeEvent, Component } from 'react'
import { FormGroup, FormLabel, FormControl, InputGroup } from 'react-bootstrap'
import _ from 'lodash'

class LemmaInput extends Component<{
  value: { lemma: readonly string[]; attested?: boolean }
  onChange: (lemma) => void
}> {
  get hasAttested(): boolean {
    return _.has(this.props.value, 'attested')
  }

  lemmaFormControl = (): JSX.Element => {
    return (
      <FormControl
        type="text"
        value={this.props.value.lemma.join(' ')}
        onChange={this.lemmaChanged}
      />
    )
  }

  lemmaChanged = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    this.props.onChange({
      ...this.props.value,
      lemma: event.target.value.split(' '),
    })
  }

  attestedChanged = (event: ChangeEvent<HTMLInputElement>): void => {
    this.props.onChange({
      ...this.props.value,
      attested: event.target.checked,
    })
  }

  render(): JSX.Element {
    return (
      <FormGroup controlId={_.uniqueId('LemmaInput-')}>
        <FormLabel>Lemma</FormLabel>
        {_.has(this.props.value, 'attested') ? (
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Checkbox
                type="checkbox"
                aria-label="attested"
                checked={this.props.value.attested}
                onChange={this.attestedChanged}
              />
            </InputGroup.Prepend>
            <this.lemmaFormControl />
          </InputGroup>
        ) : (
          <this.lemmaFormControl />
        )}
      </FormGroup>
    )
  }
}

export default LemmaInput
