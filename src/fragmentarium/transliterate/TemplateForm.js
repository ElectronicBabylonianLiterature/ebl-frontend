import React, { Component } from 'react'
import { Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import Template from './Template'

import HelpTrigger from 'common/HelpTrigger'
import TemplateHelp from './TemplateHelp'

class TemplateForm extends Component {
  state = {
    template: new Template(''),
    validationState: null
  }

  onChange = event => {
    const template = new Template(event.target.value)

    this.setState({
      template: template,
      validationState: template.isValid
        ? 'success'
        : template.isEmpty ? null : 'error'
    })
  }

  submit = event => {
    event.preventDefault()
    if (this.state.validationState === 'success') {
      const generatedTemplate = this.state.template.generate()
      this.props.onSubmit(generatedTemplate)
    }
  }

  render () {
    return (
      <Form inline onSubmit={this.submit}>
        <FormGroup controlId='template' validationState={this.state.validationState}>
          <ControlLabel>
            <HelpTrigger overlay={TemplateHelp()} />
          </ControlLabel>
          {' '}
          <FormControl
            type='text'
            size={8}
            value={this.state.template}
            placeholder='obv, rev'
            onChange={this.onChange}
            aria-label='Template' />
        </FormGroup>
      </Form>
    )
  }
}

export default TemplateForm
