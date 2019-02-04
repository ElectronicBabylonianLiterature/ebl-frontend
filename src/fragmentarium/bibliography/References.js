import React, { Component } from 'react'
import { Button, Form } from 'react-bootstrap'
import _ from 'lodash'
import { Promise } from 'bluebird'
import List from 'common/List'
import withData from 'http/withData'
import ReferenceForm from './ReferenceForm'

const defaultReference = {
  id: '',
  type: 'DISCUSSION',
  pages: '',
  notes: '',
  linesCited: []
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
      references: _.isEmpty(props.data)
        ? [_.cloneDeep(defaultReference)]
        : props.data
    }
  }

  searchBibliography = query => this.props.fragmentService.searchBibliography(query)

  handleChange = value => this.setState({ references: value })

  submit = event => {
    event.preventDefault()
    this.props.updateReferences(
      this.state.references.map(reference => _.omit(reference, 'document'))
    )
  }

  render () {
    return <>
      <References
        searchBibliography={this.searchBibliography}
        references={this.state.references}
        onChange={this.handleChange}
        onSubmit={this.submit}
        disabled={this.props.disabled || _.isEqual(this.props.data, this.state.references)} />
    </>
  }
}

function hydrateReferences (references, fragmentService) {
  function hydrate (reference) {
    return fragmentService
      .findBibliography(reference.id)
      .then(entry => ({
        ...reference,
        document: entry
      }))
  }
  return Promise.all(references.map(hydrate))
}

export default withData(
  ReferencesController,
  ({ references, fragmentService }) => hydrateReferences(references, fragmentService),
  {
    shouldUpdate: (prevProps, props) => !_.isEqual(prevProps.references, props.references)
  }
)
