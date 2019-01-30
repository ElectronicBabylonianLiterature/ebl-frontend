import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import _ from 'lodash'
import { Promise } from 'bluebird'
import List from 'common/List'
import ErrorAlert from 'common/ErrorAlert'
import withData from 'http/withData'
import ReferenceForm from './ReferenceForm'

const defaultReference = {
  id: '',
  type: 'DISCUSSION',
  pages: '',
  notes: '',
  linesCited: []
}

function References ({ fragmentService, references, onChange, onSubmit, error, disabled }) {
  return (
    <form onSubmit={onSubmit}>
      <List
        label='References'
        value={references}
        onChange={onChange}
        noun='Reference'
        default={defaultReference}>
        {references.map((reference, index) =>
          <ReferenceForm
            fragmentService={fragmentService}
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
      <ErrorAlert error={error} />
    </form>
  )
}

class ReferencesController extends Component {
  constructor (props) {
    super(props)
    this.state = {
      references: props.data,
      saving: false,
      error: null
    }
    this.updatePromise = Promise.resolve()
  }

  get hasChanges () {
    return _.isEqual(this.props.fragment.references, this.state.references)
  }

  componentWillUnmount () {
    this.updatePromise.cancel()
  }

  handleChange = value => this.setState({ references: value })

  submit = event => {
    event.preventDefault()
    this.updatePromise.cancel()
    this.setState({
      ...this.state,
      saving: true,
      error: null
    })
    this.updatePromise = this.props.fragmentService
      .updateReferences(
        this.props.fragment._id,
        this.state.references.map(reference => _.omit(reference, 'document'))
      )
      .then(() => this.setState({
        ...this.state,
        saving: false
      }))
      .catch(error => this.setState({
        ...this.state,
        saving: false,
        error: error
      }))
  }

  render () {
    return <>
      <References
        fragmentService={this.props.fragmentService}
        references={this.state.references}
        onChange={this.handleChange}
        onSubmit={this.submit}
        error={this.state.error}
        disabled={this.state.saving || this.hasChanges} />
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
  ({ fragment, fragmentService }) => hydrateReferences(fragment.references, fragmentService)
)
