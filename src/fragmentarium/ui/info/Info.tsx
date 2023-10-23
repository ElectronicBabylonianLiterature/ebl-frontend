import React from 'react'
import ReferenceList from 'bibliography/ui/ReferenceList'
import Details from 'fragmentarium/ui/info/Details'
import Record from 'fragmentarium/ui/info/Record'
import OrganizationLinks from 'fragmentarium/ui/info/OrganizationLinks'
import UncuratedReferences from 'fragmentarium/ui/info/UncuratedReferences'
import { Fragment, UncuratedReference } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ReferencesHelp } from 'bibliography/ui/ReferencesHelp'
import './info.sass'
import { ProjectList } from 'fragmentarium/ui/info/ResearchProjects'
import _ from 'lodash'

interface Props {
  fragment: Fragment
  fragmentService: FragmentService
  onSave: (fragment: Promise<Fragment>) => void
}

export default function Info({
  fragment,
  fragmentService,
  onSave,
}: Props): JSX.Element {
  const updateGenres = (genres) =>
    onSave(fragmentService.updateGenres(fragment.number, genres))
  const updateScript = (script) =>
    fragmentService.updateScript(fragment.number, script)
  const updateDate = (date) => fragmentService.updateDate(fragment.number, date)
  const updateDatesInText = (datesInText) =>
    fragmentService.updateDatesInText(fragment.number, datesInText)

  return (
    <>
      <Details
        fragment={fragment}
        updateGenres={updateGenres}
        updateScript={updateScript}
        updateDate={updateDate}
        updateDatesInText={updateDatesInText}
        fragmentService={fragmentService}
      />
      <section>
        <div className="info__header">
          <h3>References</h3>
          <ReferencesHelp className="info__help" />
        </div>
        <ReferenceList references={fragment.references} />
        {fragment.hasUncuratedReferences && (
          <UncuratedReferences
            uncuratedReferences={
              fragment.uncuratedReferences as UncuratedReference[]
            }
          />
        )}
      </section>
      {!_.isEmpty(fragment.projects) && (
        <section>
          <h3>Projects</h3>
          <ProjectList projects={fragment.projects} />
        </section>
      )}
      {fragment.hasExternalResources && (
        <section>
          <h3>Resources</h3>
          <OrganizationLinks fragment={fragment} />
        </section>
      )}
      <Record record={fragment.uniqueRecord} />
    </>
  )
}
