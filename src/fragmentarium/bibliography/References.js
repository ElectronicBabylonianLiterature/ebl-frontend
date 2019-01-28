import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import _ from 'lodash'
import { Promise } from 'bluebird'
import List from 'common/List'
import ErrorAlert from 'common/ErrorAlert'
import ReferenceForm from './ReferenceForm'

export default class References extends Component {
  constructor (props) {
    super(props)
    this.state = {
      references: props.fragment.references,
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
      .updateReferences(this.props.fragment._id, this.state.references)
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
    return (
      <form onSubmit={this.submit}>
        <List
          label='References'
          value={this.state.references}
          onChange={this.handleChange}
          noun='Reference'
          default={{
            id: '',
            type: '',
            pages: '',
            notes: '',
            linesCited: []
          }}>
          {this.state.references.map((reference, index) =>
            <ReferenceForm
              key={index}
              value={reference} />
          )}
        </List>
        <Button
          type='submit'
          bsStyle='primary'
          disabled={this.state.saving || this.hasChanges}>
          Save
        </Button>
        <ErrorAlert error={this.state.error} />
      </form>
    )
  }
}
