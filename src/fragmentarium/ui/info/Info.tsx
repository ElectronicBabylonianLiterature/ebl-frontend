import React from 'react'
import ReferenceList from 'bibliography/ui/ReferenceList'
import Details from 'fragmentarium/ui/info/Details'
import Record from 'fragmentarium/ui/info/Record'
import OrganizationLinks from 'fragmentarium/ui/info/OrganizationLinks'
import UncuratedReferences from 'fragmentarium/ui/info/UncuratedReferences'
import { Fragment, UncuratedReference } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
interface Props {
  fragment: Fragment
  fragmentService: FragmentService
  onSave: (updateGenres: any) => any
}
export default function Info({
  fragment,
  fragmentService,
  onSave,
}: Props): JSX.Element {
  const updateGenres = (genres) =>
    onSave(fragmentService.updateGenres(fragment.number, genres))
  return (
    <>
      <Details
        fragment={fragment}
        updateGenres={updateGenres}
        fragmentService={fragmentService}
      />
      <section>
        <h3>References</h3>
        <ReferenceList references={fragment.references} />
        {fragment.hasUncuratedReferences && (
          <UncuratedReferences
            uncuratedReferences={
              fragment.uncuratedReferences as UncuratedReference[]
            }
          />
        )}
      </section>
      <Record record={fragment.uniqueRecord} />
      <OrganizationLinks fragment={fragment} />
    </>
  )
}
