import React, { Component } from 'react'
import Promise from 'bluebird'

import BibliographyEntryForm from './BibliographyEntryForm'
import Spinner from 'common/Spinner'
import ErrorAlert from 'common/ErrorAlert'
import SessionContext from 'auth/SessionContext'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

interface Props {
  entry: BibliographyEntry
  onSubmit: (
    entry: BibliographyEntry,
  ) => Promise<BibliographyEntry | void | unknown>
}
export default class BibliographyEntryFormController extends Component<
  Props,
  { error: Error | null; saving: boolean }
> {
  static contextType = SessionContext
  context!: React.ContextType<typeof SessionContext>

  private updatePromise: Promise<void>

  constructor(props: Props) {
    super(props)
    this.state = {
      error: null,
      saving: false,
    }
    this.updatePromise = Promise.resolve()
  }
  componentWillUnmount(): void {
    this.updatePromise.cancel()
  }

  get disabled(): boolean {
    return this.state.saving || !this.context.isAllowedToWriteBibliography()
  }

  handleSubmit = (entry: BibliographyEntry): void => {
    this.updatePromise.cancel()
    this.setState({ error: null, saving: true })
    this.updatePromise = this.props
      .onSubmit(entry)
      .then(() => this.setState({ error: null, saving: false }))
      .catch((error) => {
        this.setState({ error: error, saving: false })
      })
  }

  render(): JSX.Element {
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
