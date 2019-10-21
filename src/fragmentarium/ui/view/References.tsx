import React, { Component } from 'react'
import { Button, Form } from 'react-bootstrap'
import _ from 'lodash'
import Reference from 'bibliography/domain/Reference';
import ReferencesForm, {
  defaultReference
} from 'bibliography/ui/ReferencesForm'

function References({
  searchBibliography,
  references,
  onChange,
  onSubmit,
  disabled
}) {
  return (
    <Form onSubmit={onSubmit} data-testid="references-form">
      <ReferencesForm
        value={references}
        onChange={onChange}
        searchBibliography={searchBibliography}
      />
      <Button type="submit" variant="primary" disabled={disabled}>
        Save
      </Button>
    </Form>
  )
}

type Props = {
  references: readonly Reference[]
  searchBibliography,
  updateReferences,
  disabled: boolean
}
type State = {
  references: readonly Reference[]
}
export default class ReferencesController extends Component<Props, State> {
  static defaultProps = {
    disabled: false
  }

  constructor(props) {
    super(props)
    this.state = {
      references: _.isEmpty(props.references)
        ? [defaultReference()]
        : props.references
    }
  }

  handleChange = value => this.setState({ references: value })

  submit = event => {
    event.preventDefault()
    this.props.updateReferences(this.state.references)
  }

  render() {
    return (
      <>
        <References
          searchBibliography={this.props.searchBibliography}
          references={this.state.references}
          onChange={this.handleChange}
          onSubmit={this.submit}
          disabled={
            this.props.disabled ||
            _.isEqual(this.props.references, this.state.references)
          }
        />
      </>
    )
  }
}
