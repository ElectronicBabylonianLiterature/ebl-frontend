import React, { ChangeEvent, Component, FormEvent } from 'react'
import { Form } from 'react-bootstrap'
import Template from './Template'

import HelpTrigger from 'common/HelpTrigger'
import TemplateHelp from './TemplateHelp'

class TemplateForm extends Component<
  { onSubmit },
  { template: Template; isValid: boolean }
> {
  state = {
    template: new Template(''),
    isValid: false,
  }

  onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const template = new Template(event.target.value)

    this.setState({
      template: template,
      isValid: template.isValid,
    })
  }

  submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (this.state.isValid) {
      const generatedTemplate = this.state.template.generate()
      this.props.onSubmit(generatedTemplate)
    }
  }

  render(): JSX.Element {
    return (
      <Form noValidate onSubmit={this.submit}>
        <Form.Group controlId="template">
          <Form.Label>
            <HelpTrigger overlay={TemplateHelp()} />
          </Form.Label>
          &nbsp;
          <Form.Control
            type="text"
            value={this.state.template.pattern}
            placeholder="obv, rev"
            onChange={this.onChange}
            aria-label="Template"
            isValid={this.state.isValid}
            isInvalid={!(this.state.isValid || this.state.template.isEmpty)}
          />
        </Form.Group>
      </Form>
    )
  }
}

export default TemplateForm
