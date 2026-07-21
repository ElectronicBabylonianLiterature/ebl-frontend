import React, { Component } from 'react'

import BibliographyEntryForm from './BibliographyEntryForm'
import Spinner from 'common/ui/Spinner'
import ErrorAlert from 'common/errors/ErrorAlert'
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

  private abortController: AbortController

  constructor(props: Props) {
    super(props)
    this.state = {
      error: null,
      saving: false,
    }
    this.abortController = new AbortController()
  }
  componentWillUnmount(): void {
    this.abortController.abort()
  }

  get disabled(): boolean {
    return this.state.saving || !this.context.isAllowedToWriteBibliography()
  }

  handleSubmit = (entry: BibliographyEntry): void => {
    this.abortController.abort()
    this.abortController = new AbortController()
    const { signal } = this.abortController
    this.setState({ error: null, saving: true })
    this.props
      .onSubmit(entry)
      .then(() => {
        if (!signal.aborted) {
          this.setState({ error: null, saving: false })
        }
      })
      .catch((error) => {
        if (!signal.aborted) {
          this.setState({ error: error, saving: false })
        }
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
