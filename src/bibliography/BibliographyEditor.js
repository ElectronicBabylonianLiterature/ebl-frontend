import React, { Component } from 'react'
import Promise from 'bluebird'

import Breadcrumbs from 'common/Breadcrumbs'
import BibliographyEntryForm from './BibliographyEntryForm'
import Spinner from 'common/Spinner'
import ErrorAlert from 'common/ErrorAlert'
import withData from 'http/withData'
import SessionContext from 'auth/SessionContext'

class BibliographyEditor extends Component {
  static contextType = SessionContext

  constructor (props) {
    super(props)
    this.state = {
      error: null,
      saving: false
    }
    this.updatePromise = Promise.resolve()
  }

  componentWillUnmount () {
    this.updatePromise.cancel()
  }

  get disabled () {
    return this.state.saving || !this.context.isAllowedToWriteBibliography()
  }

  updateEntry = entry => {
    this.updatePromise.cancel()
    this.setState({ error: null, saving: true })
    this.updatePromise = this.props.bibliographyRepository
      .update(entry)
      .then(() => this.setState({ error: null, saving: false }))
      .catch(error => {
        this.setState({ error: error, saving: false })
      })
  }

  render () {
    return (
      <section className='App-content'>
        <header>
          <Breadcrumbs section='Bibliography' active={this.props.data.id} />
          <h2>
            Edit {this.props.data.id}
          </h2>
          <Spinner loading={this.state.saving}>Saving...</Spinner>
        </header>
        <BibliographyEntryForm value={this.props.data} onSubmit={this.updateEntry} disabled={this.disabled} />
        <ErrorAlert error={this.state.error} />
      </section>
    )
  }
}

export default withData(
  BibliographyEditor,
  props => props.bibliographyRepository.find(props.match.params.id)
)
