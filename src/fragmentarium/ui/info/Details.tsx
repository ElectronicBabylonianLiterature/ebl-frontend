import React from 'react'
import _ from 'lodash'
import { Fragment, Script } from 'fragmentarium/domain/fragment'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import ExternalLink from 'common/ExternalLink'
import './Details.css'
import GenreSelection from 'fragmentarium/ui/info/GenreSelection'
import { Genres } from 'fragmentarium/domain/Genres'
import ScriptSelection from 'fragmentarium/ui/info/ScriptSelection'
import DateSelection from 'chronology/application/DateSelection'
import FragmentService from 'fragmentarium/application/FragmentService'
import Bluebird from 'bluebird'
import { MesopotamianDate } from 'chronology/domain/Date'
import DatesInTextSelection from 'chronology/ui/DateEditor/DatesInTextSelection'
import { DateRange, PartialDate } from 'fragmentarium/domain/archaeology'

interface Props {
  readonly fragment: Fragment
}

function Collection({ fragment: { collection } }: Props): JSX.Element {
  return <>{collection && `(${collection} Collection)`}</>
}

function MuseumName({ fragment: { museum } }: Props): JSX.Element {
  return museum.url ? (
    <ExternalLink href={museum.url}>{museum.name}</ExternalLink>
  ) : (
    <>{museum.name}</>
  )
}

function Joins({ fragment: { number, joins } }: Props): JSX.Element {
  return (
    <div className="Details-joins">
      Joins:
      {_.isEmpty(joins) ? (
        ' -'
      ) : (
        <ol className="Details-joins__list">
          {joins.map((group, groupIndex) =>
            group.map((join, index) => (
              <li
                className="Details-joins__join"
                key={`${groupIndex}-${index}`}
              >
                {join.isEnvelope ? (
                  <>
                    <br />
                    <i
                      className="fa fa-envelope"
                      aria-label="envelope icon"
                    ></i>
                  </>
                ) : index > 0 ? (
                  <>
                    <br />+{!join.isChecked && <sup>?</sup>}
                  </>
                ) : groupIndex > 0 ? (
                  <>
                    <br />
                    (+{!join.isChecked && <sup>?</sup>})
                  </>
                ) : (
                  ''
                )}{' '}
                {!join.isInFragmentarium || number === join.museumNumber ? (
                  join.museumNumber
                ) : (
                  <FragmentLink number={join.museumNumber}>
                    {join.museumNumber}
                  </FragmentLink>
                )}{' '}
                <sup>{_.compact([join.date, join.joinedBy]).join(', ')}</sup>
              </li>
            ))
          )}
        </ol>
      )}
    </div>
  )
}

function Measurements({ fragment: { measures } }: Props): JSX.Element {
  const measurementEntries = [
    { measure: measures.length, label: 'L' },
    { measure: measures.width, label: 'W' },
    { measure: measures.thickness, label: 'T' },
  ]

  const measurements = _(measurementEntries)
    .filter((entry) => entry.measure != null)
    .map(({ measure, label }) => `${measure} (${label})`)
    .join(' × ')

  return <>{measurements ? `${measurements} cm` : ''}</>
}

function Accession({ fragment }: Props): JSX.Element {
  return <>Accession no.: {fragment.accession || '-'}</>
}

function Excavation({ fragment }: Props): JSX.Element {
  return <>Excavation no.: {fragment.archaeology?.excavationNumber || '-'}</>
}

function Provenance({ fragment }: Props): JSX.Element {
  return <>Provenance: {fragment.archaeology?.site?.name || '-'}</>
}

function ExcavationDate({ fragment }: Props): JSX.Element {
  const isRegularExcavation = fragment.archaeology?.isRegularExcavation
  const date = fragment.archaeology?.date
  const dateNotes = date?.notes

  const formatDate = (date: DateRange) => {
    const locale = navigator.language
    const start = new PartialDate(
      date.start.year,
      date.start.month,
      date.start.day
    ).toLocaleString(locale)
    const end = date.end
      ? new PartialDate(
          date.end.year,
          date.end.month,
          date.end.day
        ).toLocaleString(locale)
      : ''
    return end ? `${start} – ${end}` : start
  }

  return (
    <>
      {isRegularExcavation && (
        <>
          Regular Excavation
          {date && <> ({formatDate(date)})</>}
          {dateNotes && <>, {dateNotes}</>}
        </>
      )}
    </>
  )
}

interface DetailsProps {
  readonly fragment: Fragment
  readonly updateGenres: (genres: Genres) => void
  readonly updateScript: (script: Script) => Bluebird<Fragment>
  readonly updateDate: (date?: MesopotamianDate) => Bluebird<Fragment>
  readonly updateDatesInText: (
    datesInText: readonly MesopotamianDate[]
  ) => Bluebird<Fragment>
  readonly fragmentService: FragmentService
}

function Details({
  fragment,
  updateGenres,
  updateScript,
  updateDate,
  updateDatesInText,
  fragmentService,
}: DetailsProps): JSX.Element {
  const findspotString = fragment.archaeology?.findspot?.toString()
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
      <li className="Details__item--provenance">
        <Excavation fragment={fragment} />
      </li>
      <li className="Details__item--provenance">
        <ExcavationDate fragment={fragment} />
      </li>
      <li className="Details__item--provenance">{`Findspot: ${
        findspotString || '-'
      }`}</li>
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
        <DateSelection dateProp={fragment?.date} updateDate={updateDate} />
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
