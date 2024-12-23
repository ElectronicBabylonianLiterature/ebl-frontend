import React from 'react'
import ReferenceList from 'bibliography/ui/ReferenceList'
import Details from 'fragmentarium/ui/info/Details'
import Record from 'fragmentarium/ui/info/Record'
import ExternalResources from 'fragmentarium/ui/info/ExternalResources'
import UncuratedReferences from 'fragmentarium/ui/info/UncuratedReferences'
import {
  Fragment,
  Script,
  UncuratedReference,
} from 'fragmentarium/domain/fragment'
import { Genres } from 'fragmentarium/domain/Genres'
import FragmentService from 'fragmentarium/application/FragmentService'
import { ReferencesHelp } from 'bibliography/ui/ReferencesHelp'
import './info.sass'
import { ProjectList } from 'fragmentarium/ui/info/ResearchProjects'
import _ from 'lodash'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import AfoRegisterFragmentRecords from 'afo-register/ui/AfoRegisterFragmentRecords'
import ColophonInfo from './Colophon'
import DossiersService from 'dossiers/application/DossiersService'

interface Props {
  fragment: Fragment
  fragmentService: FragmentService
  dossiersService: DossiersService
  afoRegisterService: AfoRegisterService
  onSave: (fragment: Promise<Fragment>) => void
}

export default function Info({
  fragment,
  fragmentService,
  dossiersService,
  afoRegisterService,
  onSave,
}: Props): JSX.Element {
  const updateGenres = (genres: Genres) =>
    onSave(fragmentService.updateGenres(fragment.number, genres))
  const updateScript = (script: Script) =>
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
        dossiersService={dossiersService}
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
      {!_.isEmpty(fragment.colophon) && (
        <section>
          <h3>Colophon</h3>
          <ColophonInfo fragment={fragment} />
        </section>
      )}
      <section>
        <h3>AfO-Register</h3>
        <AfoRegisterFragmentRecords
          afoRegisterService={afoRegisterService}
          fragment={fragment}
        />
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
          <ExternalResources fragment={fragment} />
        </section>
      )}
      <Record record={fragment.uniqueRecord} />
    </>
  )
}
