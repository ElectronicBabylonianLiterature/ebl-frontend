import React from 'react'
import { Fragment, Script } from 'fragmentarium/domain/fragment'
import './Details.sass'
import GenreSelection from 'fragmentarium/ui/info/GenreEditor'
import { Genres } from 'fragmentarium/domain/Genres'
import ScriptSelection from 'fragmentarium/ui/info/ScriptSelection'
import DateSelection from 'chronology/application/DateSelection'
import FragmentService from 'fragmentarium/application/FragmentService'
import { MesopotamianDate } from 'chronology/domain/Date'
import DatesInTextSelection from 'chronology/ui/DateEditor/DatesInTextSelection'
import FragmentDossierRecordsDisplay from 'dossiers/ui/DossiersDisplay'
import DossiersService from 'dossiers/application/DossiersService'
import {
  Accession,
  Collection,
  Excavation,
  ExcavationDate,
  Joins,
  Measurements,
  MuseumName,
  Provenance,
} from 'fragmentarium/ui/info/DetailsFields'

export { formatMeasurements } from 'fragmentarium/ui/info/DetailsFields'

interface DetailsProps {
  readonly fragment: Fragment
  readonly updateGenres: (genres: Genres) => void
  readonly updateScript: (script: Script) => Promise<Fragment>
  readonly updateDate: (date?: MesopotamianDate) => Promise<Fragment>
  readonly updateDatesInText: (
    datesInText: readonly MesopotamianDate[],
  ) => Promise<Fragment>
  readonly fragmentService: FragmentService
  readonly dossiersService: DossiersService
}

function Details({
  fragment,
  updateGenres,
  updateScript,
  updateDate,
  updateDatesInText,
  fragmentService,
  dossiersService,
}: DetailsProps): JSX.Element {
  const findspotString = fragment.archaeology?.findspot?.toString()
  const isFindspotUncertain = fragment.archaeology?.isFindspotUncertain
  const findspotDisplay = findspotString
    ? `${findspotString}${isFindspotUncertain ? ' (?)' : ''}`
    : null
  return (
    <ul className="Details">
      <li className="Details__item">
        <MuseumName fragment={fragment} />
      </li>
      <li className="Details__item">
        <Collection fragment={fragment} />
      </li>
      <li className="Details__item">
        <Joins fragment={fragment} />
      </li>
      <li className="Details__item Details-item--extra-margin">
        <Measurements fragment={fragment} />
      </li>
      <li className="Details__item">
        <Accession fragment={fragment} />
      </li>
      <li className="Details__item">
        <Provenance fragment={fragment} />
      </li>
      <ul className="Details__item--provenance">
        <li>
          <Excavation fragment={fragment} />
        </li>
        {fragment.archaeology?.date && (
          <li>
            <ExcavationDate fragment={fragment} />
          </li>
        )}
        <li>{`Findspot: ${findspotDisplay || '-'}`}</li>
      </ul>
      <li className="Details__item">
        <FragmentDossierRecordsDisplay
          dossiersService={dossiersService}
          fragment={fragment}
        />
      </li>
      {fragment.acquisition && (
        <li className="Details__item">
          Acquisition: From {fragment.acquisition.toString()}
        </li>
      )}
      <li className="Details__item">
        <GenreSelection
          fragment={fragment}
          updateGenres={updateGenres}
          fragmentService={fragmentService}
        />
      </li>
      <li className="Details__item">
        <ScriptSelection
          fragment={fragment}
          updateScript={updateScript}
          fragmentService={fragmentService}
        />
      </li>
      <li className="Details__item">
        <DateSelection
          dateProp={fragment?.date}
          updateDate={(date) => updateDate(date)}
        />
      </li>
      <li className="Details__item">
        <DatesInTextSelection
          datesInText={fragment?.datesInText ? fragment?.datesInText : []}
          updateDatesInText={updateDatesInText}
        />
      </li>
    </ul>
  )
}

export default Details
