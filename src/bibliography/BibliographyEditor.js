import React from 'react'

import Breadcrumbs from 'common/Breadcrumbs'
import withData from 'http/withData'
import BibliographyEntryFormController from 'bibliography/BibliographyEntryFormController'

function BibliographyEditor ({ data, bibliographyRepository }) {
  return (
    <section className='App-content'>
      <header>
        <Breadcrumbs section='Bibliography' active={data.id} />
        <h2>
          Edit {data.id}
        </h2>
      </header>
      <BibliographyEntryFormController entry={data} onSubmit={entry => bibliographyRepository.update(entry)} />
    </section>
  )
}

export default withData(
  BibliographyEditor,
  props => props.bibliographyRepository.find(props.match.params.id)
)
