import React from 'react'

import Breadcrumbs from 'common/Breadcrumbs'
import withData from 'http/withData'
import BibliographyEntryFormController from 'bibliography/BibliographyEntryFormController'
import { template } from 'bibliography/bibliographyEntry'

function BibliographyEditor ({ data, bibliographyService, create = false, history }) {
  function createEntry (entry) {
    return bibliographyService.create(entry).then(() => history.push(`/bibliography/${encodeURIComponent(entry.id)}`))
  }

  function updateEntry (entry) {
    return bibliographyService.update(entry)
  }

  return (
    <section className='App-content'>
      <header>
        <Breadcrumbs section='Bibliography' active={create ? 'New entry' : data.id} />
        <h2>
          {create ? 'Create' : `Edit ${data.id}`}
        </h2>
      </header>
      <BibliographyEntryFormController entry={data} onSubmit={create ? createEntry : updateEntry} />
    </section>
  )
}

export default withData(
  BibliographyEditor,
  props => props.bibliographyService.find(props.match.params.id),
  {
    shouldUpdate: (prevProps, props) => prevProps.create !== props.create || prevProps.match.params.id !== props.match.params.id,
    filter: props => !props.create,
    defaultData: template
  }
)
