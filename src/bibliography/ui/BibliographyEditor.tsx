import React from 'react'

import AppContent from 'common/AppContent'
import withData, { WithoutData } from 'http/withData'
import BibliographyEntryFormController from 'bibliography/ui/BibliographyEntryFormController'
import BibliographyEntry, {
  template
} from 'bibliography/domain/BibliographyEntry'
import { History } from 'history'
import { match } from 'react-router'

type Props = {
  data: BibliographyEntry
  bibliographyService
  create?: boolean
  history: History
}
function BibliographyEditor({
  data,
  bibliographyService,
  create,
  history
}: Props) {
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
BibliographyEditor.defaultProps = {
  create: false
}

export default withData<
  WithoutData<Props>,
  { match: match },
  BibliographyEntry
>(
  BibliographyEditor,
  props => props.bibliographyService.find(props.match.params['id']),
  {
    watch: props => [props.create, props.match.params['id']],
    filter: props => !props.create,
    defaultData: template
  }
)
