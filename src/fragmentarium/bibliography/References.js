import React, { Component } from 'react'
import { Button, Form } from 'react-bootstrap'
import _ from 'lodash'
import List from 'common/List'
import ReferenceForm from './ReferenceForm'

const defaultReference = {
  id: '',
  type: 'DISCUSSION',
  pages: '',
  notes: '',
  linesCited: [],
  document: null
}

function References ({ searchBibliography, references, onChange, onSubmit, disabled }) {
  return (
    <Form onSubmit={onSubmit} data-testid='references-form'>
      <List
        label='References'
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
      </List>
      <Button
        type='submit'
        bsStyle='primary'
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
      references: _.isEmpty(props.references)
        ? [_.cloneDeep(defaultReference)]
        : props.references
    }
  }

  searchBibliography = query => this.props.fragmentService.searchBibliography(query)

  handleChange = value => this.setState({ references: value })

  submit = event => {
    event.preventDefault()
    this.props.updateReferences(this.state.references)
  }

  render () {
    return <>
      <References
        searchBibliography={this.searchBibliography}
        references={this.state.references}
        onChange={this.handleChange}
        onSubmit={this.submit}
        disabled={this.props.disabled || _.isEqual(this.props.references, this.state.references)} />
    </>
  }
}

export default ReferencesController
