import React, { Component } from 'react'
import { Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import _ from 'lodash'

import HelpTrigger from 'common/HelpTrigger'
import TemplateHelp from './TemplateHelp'

function parseSide (side) {
  const match = /(\d+)([^\d]*)/.exec(side)
  return {
    rows: Number(match[1]),
    suffix: match[2]
  }
}

function createTemplate ({ rows, suffix = '' }) {
  return _.range(1, rows + 1)
    .map(row => `${row}${suffix}. [...]  [...]`)
    .join('\n')
}

class TemplateForm extends Component {
  state = {
    template: '',
    validationState: null
  }

  onChange = event => {
    const template = event.target.value
    this.setState({
      template: template,
      validationState: /^\d+[^,]*(?:,\s*\d+[^,]*)?$/.exec(template)
        ? 'success'
        : template === '' ? null : 'error'
    })
  }

  submit = event => {
    event.preventDefault()
    if (this.state.validationState === 'success') {
      const [obverse, reverse] = this.state.template
        .split(/,\s*/)
        .map(parseSide)
        .map(createTemplate)

      const generatedTemplate = reverse
        ? `@obverse\n${obverse}\n\n@reverse\n${reverse}`
        : obverse
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
