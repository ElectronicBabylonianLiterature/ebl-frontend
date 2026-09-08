import React, { Component } from 'react'

import BibliographyEntryForm from './BibliographyEntryForm'
import Spinner from 'common/ui/Spinner'
import ErrorAlert from 'common/errors/ErrorAlert'
import SessionContext from 'auth/SessionContext'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import SupersedableOperation from 'common/utils/SupersedableOperation'
import applyWhenCurrent from 'common/utils/applyWhenCurrent'

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

  private readonly submitOperation = new SupersedableOperation()

  constructor(props: Props) {
    super(props)
    this.state = {
      error: null,
      saving: false,
    }
  }
  componentWillUnmount(): void {
    this.submitOperation.supersede()
  }

  get disabled(): boolean {
    return this.state.saving || !this.context.isAllowedToWriteBibliography()
  }

  handleSubmit = (entry: BibliographyEntry): void => {
    this.setState({ error: null, saving: true })
    applyWhenCurrent(() => this.props.onSubmit(entry), {
      onSuccess: () => {
        this.setState({ error: null, saving: false })
      },
      onError: (error) => {
        this.setState({ error: error, saving: false })
      },
    })(this.submitOperation.start())
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
