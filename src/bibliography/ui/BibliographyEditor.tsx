import React from 'react'
import AppContent from 'common/AppContent'
import withData, { WithoutData } from 'http/withData'
import BibliographyEntryFormController from 'bibliography/ui/BibliographyEntryFormController'
import BibliographyEntry, {
  template,
} from 'bibliography/domain/BibliographyEntry'
import { History } from 'history'
import { match } from 'react-router'
import { Crumb, SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import Promise from 'bluebird'
import { Button } from 'react-bootstrap'

type Props = {
  data: BibliographyEntry
  bibliographyService: {
    create(entry: BibliographyEntry): Promise<BibliographyEntry>
    find(id: string): Promise<BibliographyEntry>
    update(entry: BibliographyEntry): Promise<BibliographyEntry>
  }
  create?: boolean
  history: History
  match: match<{ id: string }>
}

function BibliographyEditor({
  data,
  bibliographyService,
  create = false,
  history,
  match,
}: Props): JSX.Element {
  function createEntry(entry: BibliographyEntry): Promise<void> {
    return bibliographyService
      .create(entry)
      .then(() =>
        history.push(`/bibliography/references/${encodeURIComponent(entry.id)}`)
      )
  }

  function updateEntry(entry: BibliographyEntry): Promise<BibliographyEntry> {
    return bibliographyService.update(entry)
  }

  return (
    <AppContent
      crumbs={
        [
          new SectionCrumb('Bibliography'),
          new SectionCrumb('References'),
          new TextCrumb(create ? 'New entry' : data.id),
          !create && new TextCrumb('Edit'),
        ].filter(Boolean) as Crumb[]
      } // Type assertion here
      title={create ? 'Create' : `Edit ${data.id}`}
      actions={
        !create && (
          <Button
            variant="outline-primary"
            onClick={() =>
              history.push(`/bibliography/references/${match.params.id}`)
            }
          >
            View
          </Button>
        )
      }
    >
      <BibliographyEntryFormController
        entry={data}
        onSubmit={create ? createEntry : updateEntry}
      />
    </AppContent>
  )
}

export default withData<
  WithoutData<Props>,
  { match: match<{ id: string }> },
  BibliographyEntry
>(
  BibliographyEditor,
  (props) => {
    const decodedId = decodeURIComponent(props.match.params['id'])
    return props.bibliographyService.find(decodedId)
  },
  {
    watch: (props) => [
      props.create,
      decodeURIComponent(props.match.params['id']),
    ],
    filter: (props) => !props.create,
    defaultData: () => template,
  }
)
