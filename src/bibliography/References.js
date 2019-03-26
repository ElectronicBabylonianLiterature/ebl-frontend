import React, { Component } from 'react'
import { Button, Form } from 'react-bootstrap'
import _ from 'lodash'
import { List } from 'immutable'
import ListForm from 'common/List'
import ReferenceForm from './ReferenceForm'
import Reference from 'bibliography/Reference'

const defaultReference = new Reference()

function References ({ searchBibliography, references, onChange, onSubmit, disabled }) {
  return (
    <Form onSubmit={onSubmit} data-testid='references-form'>
      <ListForm
        value={references}
        onChange={onChange}
        noun='Reference'
        default={defaultReference}>
        {references.map((reference, index) =>
          <ReferenceForm
            searchBibliography={searchBibliography}
            key={index}
            value={reference} />
        )}
      </ListForm>
      <Button
        type='submit'
        variant='primary'
        disabled={disabled}>
        Save
      </Button>
    </Form>
  )
}

class ReferencesController extends Component {
  constructor (props) {
    super(props)
    this.state = {
      references: props.references.isEmpty()
        ? List.of(defaultReference)
        : props.references
    }
  }

  handleChange = value => this.setState({ references: value })

  submit = event => {
    event.preventDefault()
    this.props.updateReferences(this.state.references)
  }

  render () {
    return <>
      <References
        searchBibliography={this.props.searchBibliography}
        references={this.state.references}
        onChange={this.handleChange}
        onSubmit={this.submit}
        disabled={this.props.disabled || _.isEqual(this.props.references, this.state.references)} />
    </>
  }
}

export default ReferencesController
