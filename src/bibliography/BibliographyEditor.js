import React from 'react'

import AppContent from 'common/AppContent'
import withData from 'http/withData'
import BibliographyEntryFormController from 'bibliography/BibliographyEntryFormController'
import { template } from 'bibliography/BibliographyEntry'

function BibliographyEditor({
  data,
  bibliographyService,
  create = false,
  history
}) {
  function createEntry(entry) {
    return bibliographyService
      .create(entry)
      .then(() => history.push(`/bibliography/${encodeURIComponent(entry.id)}`))
  }

  function updateEntry(entry) {
    return bibliographyService.update(entry)
  }

  return (
    <AppContent
      crumbs={['Bibliography', create ? 'New entry' : data.id]}
      title={create ? 'Create' : `Edit ${data.id}`}
    >
      <BibliographyEntryFormController
        entry={data}
        onSubmit={create ? createEntry : updateEntry}
      />
    </AppContent>
  )
}

export default withData(
  BibliographyEditor,
  props => props.bibliographyService.find(props.match.params.id),
  {
    watch: props => [props.create, props.match.params.id],
    filter: props => !props.create,
    defaultData: template
  }
)
