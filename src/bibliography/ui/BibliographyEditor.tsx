import React from 'react'
import AppContent from 'common/AppContent'
import withData, { WithoutData } from 'http/withData'
import BibliographyEntryFormController from 'bibliography/ui/BibliographyEntryFormController'
import BibliographyEntry, {
  template,
} from 'bibliography/domain/BibliographyEntry'
import { Crumb, SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import Promise from 'bluebird'
import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

type Props = {
  data: BibliographyEntry
  bibliographyService: {
    create(entry: BibliographyEntry): Promise<BibliographyEntry>
    find(id: string): Promise<BibliographyEntry>
    update(entry: BibliographyEntry): Promise<BibliographyEntry>
  }
  create?: boolean
  history?: { push: (path: string) => void }
  match: { params: Record<string, string | undefined> }
}

function BibliographyEditor({
  data,
  bibliographyService,
  create = false,
  history,
  match,
}: Props): JSX.Element {
  const navigate = useNavigate()
  const entryId = match.params.id ?? ''
  const push = (path: string): void => {
    if (history) {
      history.push(path)
    } else {
      navigate(path)
    }
  }

  function createEntry(entry: BibliographyEntry): Promise<void> {
    return bibliographyService
      .create(entry)
      .then(() =>
        push(`/bibliography/references/${encodeURIComponent(entry.id)}`),
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
      }
      title={create ? 'Create' : `Edit ${data.id}`}
      actions={
        !create && (
          <Button
            variant="outline-primary"
            onClick={() => push(`/bibliography/references/${entryId}`)}
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
  { match: { params: Record<string, string | undefined> } },
  BibliographyEntry
>(
  BibliographyEditor,
  (props) => {
    const decodedId = decodeURIComponent(props.match.params['id'] ?? '')
    return props.bibliographyService.find(decodedId)
  },
  {
    watch: (props) => [
      props.create,
      decodeURIComponent(props.match.params['id'] ?? ''),
    ],
    filter: (props) => !props.create,
    defaultData: () => template,
  },
)
