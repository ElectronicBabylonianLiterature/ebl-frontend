import React, { Component } from 'react'
import Promise from 'bluebird'

import BibliographyEntryForm from './BibliographyEntryForm'
import Spinner from 'common/Spinner'
import ErrorAlert from 'common/ErrorAlert'
import SessionContext from 'auth/SessionContext'

export default class BibliographyEntryFormController extends Component<
  { entry; onSubmit },
  { error: Error | null; saving: boolean }
> {
  static contextType = SessionContext

  private updatePromise: Promise<any>

  constructor(props) {
    super(props)
    this.state = {
      error: null,
      saving: false
    }
    this.updatePromise = Promise.resolve()
  }
  componentWillUnmount() {
    this.updatePromise.cancel()
  }

  get disabled() {
    return this.state.saving || !this.context.isAllowedToWriteBibliography()
  }

  handleSubmit = entry => {
    this.updatePromise.cancel()
    this.setState({ error: null, saving: true })
    this.updatePromise = this.props
      .onSubmit(entry)
      .then(() => this.setState({ error: null, saving: false }))
      .catch(error => {
        this.setState({ error: error, saving: false })
      })
  }

  render() {
    return (
      <>
        <BibliographyEntryForm
          value={this.props.entry}
          onSubmit={this.handleSubmit}
          disabled={this.disabled}
        />
        <Spinner loading={this.state.saving}>Saving...</Spinner>
        <ErrorAlert error={this.state.error} />
      </>
    )
  }
}
