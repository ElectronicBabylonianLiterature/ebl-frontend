import React from 'react'
import ReferenceList from 'bibliography/ui/ReferenceList'
import Details from 'fragmentarium/ui/info/Details'
import { TruncatedRecord } from 'fragmentarium/ui/info/Record'
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
import { MesopotamianDate } from 'chronology/domain/Date'
import Bluebird from 'bluebird'

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
  const updateDate = (date) =>
    fragmentService.updateDate(fragment.number, date.toDto())
  const updateDatesInText = (
    datesInText: readonly MesopotamianDate[],
  ): Bluebird<Fragment> =>
    fragmentService.updateDatesInText(
      fragment.number,
      datesInText.filter((date) => date).map((date) => date.toDto()),
    )

  return (
    <div className="info">
      <div className="info__section">
        <Details
          fragment={fragment}
          updateGenres={updateGenres}
          updateScript={updateScript}
          updateDate={updateDate}
          updateDatesInText={updateDatesInText}
          fragmentService={fragmentService}
          dossiersService={dossiersService}
        />
      </div>
      <div className="info__section">
        <div className="info__section-header">
          <h3 className="info__section-title">References</h3>
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
      </div>
      {!_.isEmpty(fragment.colophon) && (
        <div className="info__section">
          <div className="info__section-header">
            <h3 className="info__section-title">Colophon</h3>
          </div>
          <ColophonInfo fragment={fragment} />
        </div>
      )}
      <div className="info__section">
        <div className="info__section-header">
          <h3 className="info__section-title">AfO-Register</h3>
        </div>
        <AfoRegisterFragmentRecords
          afoRegisterService={afoRegisterService}
          fragment={fragment}
        />
      </div>
      {!_.isEmpty(fragment.projects) && (
        <div className="info__section">
          <div className="info__section-header">
            <h3 className="info__section-title">Projects</h3>
          </div>
          <ProjectList projects={fragment.projects} />
        </div>
      )}
      {fragment.hasExternalResources && (
        <div className="info__section">
          <div className="info__section-header">
            <h3 className="info__section-title">Resources</h3>
          </div>
          <ExternalResources fragment={fragment} />
        </div>
      )}
      <div className="info__section info__section--muted">
        <TruncatedRecord
          record={fragment.uniqueRecord}
          number={fragment.number}
        />
      </div>
    </div>
  )
}
