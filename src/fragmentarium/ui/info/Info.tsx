import React from 'react'
import ReferenceList from 'bibliography/ui/ReferenceList'
import Details from 'fragmentarium/ui/info/Details'
import Record from 'fragmentarium/ui/info/Record'
import OrganizationLinks from 'fragmentarium/ui/info/OrganizationLinks'
import UncuratedReferences from 'fragmentarium/ui/info/UncuratedReferences'
import serializeReference from 'bibliography/application/serializeReference'

export default function Info({ fragment, fragmentService, onSave }) {
  const updateGenre = (genre) =>
    onSave(fragmentService.updateGenre(fragment.number, genre))
  return (
    <>
      <Details fragment={fragment} updateGenre={updateGenre} />
      <section>
        <h3>References</h3>
        <ReferenceList references={fragment.references} />
        {fragment.hasUncuratedReferences && (
          <UncuratedReferences
            uncuratedReferences={fragment.uncuratedReferences}
          />
        )}
      </section>
      <Record record={fragment.uniqueRecord} />
      <OrganizationLinks fragment={fragment} />
    </>
  )
}
