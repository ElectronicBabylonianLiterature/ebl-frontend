import React from 'react'
import ReferenceList from 'bibliography/ReferenceList'
import Details from 'fragmentarium/ui/info/Details'
import Record from 'fragmentarium/ui/info/Record'
import OrganizationLinks from 'fragmentarium/ui/info/OrganizationLinks'
import UncuratedReferences from 'fragmentarium/ui/info/UncuratedReferences'

export default function Info({ fragment }) {
  return (
    <>
      <Details fragment={fragment} />
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
