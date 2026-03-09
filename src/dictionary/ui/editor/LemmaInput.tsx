import React, { ChangeEvent, Component } from 'react'
import { Form, InputGroup } from 'react-bootstrap'
import _ from 'lodash'

class LemmaInput extends Component<{
  value: { lemma: readonly string[]; attested?: boolean }
  onChange: (lemma) => void
}> {
  private readonly inputId = _.uniqueId('LemmaInput-')
  private readonly attestedId = _.uniqueId('LemmaInput-attested-')

  get hasAttested(): boolean {
    return _.has(this.props.value, 'attested')
  }

  lemmaFormControl = (): JSX.Element => (
    <Form.Control
      type="text"
      id={this.inputId}
      value={this.props.value.lemma.join(' ')}
      onChange={this.lemmaChanged}
    />
  )

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
      <Form.Group controlId={this.inputId}>
        <Form.Label htmlFor={this.inputId}>Lemma</Form.Label>
        {_.has(this.props.value, 'attested') ? (
          <InputGroup>
            <InputGroup.Text>
              <Form.Check
                type="checkbox"
                id={this.attestedId}
                aria-label="attested"
                checked={this.props.value.attested}
                onChange={this.attestedChanged}
              />
            </InputGroup.Text>
            <this.lemmaFormControl />
          </InputGroup>
        ) : (
          <this.lemmaFormControl />
        )}
      </Form.Group>
    )
  }
}

export default LemmaInput
