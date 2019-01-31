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

function References ({ searchBibliography, references, onChange, onSubmit, error, disabled }) {
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
      <ErrorAlert error={error} />
    </form>
  )
}

class ReferencesController extends Component {
  constructor (props) {
    super(props)
    this.state = {
      references: _.isEmpty(props.data)
        ? [_.cloneDeep(defaultReference)]
        : props.data,
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

  searchBibliography = query => this.props.fragmentService.searchBibliography(query)

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
        searchBibliography={this.searchBibliography}
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
