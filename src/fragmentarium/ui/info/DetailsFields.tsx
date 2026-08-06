import React from 'react'
import _ from 'lodash'
import { Fragment, Measures } from 'fragmentarium/domain/fragment'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import ExternalLink from 'common/ui/ExternalLink'
import { DateRange, PartialDate } from 'fragmentarium/domain/archaeology'

export interface Props {
  readonly fragment: Fragment
}

export function Collection({ fragment: { collection } }: Props): JSX.Element {
  return <>{collection && `(${collection} Collection)`}</>
}

export function MuseumName({ fragment: { museum } }: Props): JSX.Element {
  return museum.url ? (
    <>
      <ExternalLink
        href={`/library/search/?museum=${museum.key}`}
        className={'subtle-link'}
      >
        {museum.name}
      </ExternalLink>
      &nbsp;
      <ExternalLink
        href={museum.url}
        className={'Details__museum-link subtle-link'}
        aria-label={`Open external museum page for ${museum.name}`}
      >
        <i
          className={'fa-solid fa-arrow-up-right-from-square'}
          aria-hidden="true"
        ></i>
      </ExternalLink>
    </>
  ) : (
    <>{museum.name}</>
  )
}

export function Joins({ fragment: { number, joins } }: Props): JSX.Element {
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
                      className="fa-solid fa-envelope"
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
            )),
          )}
        </ol>
      )}
    </div>
  )
}

export function formatMeasurements(measures: Measures): string {
  const measurementEntries = [
    { measure: measures.length, label: 'L', note: measures.lengthNote },
    { measure: measures.width, label: 'W', note: measures.widthNote },
    { measure: measures.thickness, label: 'T', note: measures.thicknessNote },
  ]

  return _(measurementEntries)
    .filter((entry) => entry.measure != null)
    .map(
      ({ measure, label, note }) =>
        `${measure}${note ? ` ${note}` : ''} (${label})`,
    )
    .join(' × ')
}

export function Measurements({ fragment: { measures } }: Props): JSX.Element {
  const measurements = formatMeasurements(measures)
  return <>{measurements ? `${measurements} cm` : ''}</>
}

export function Accession({ fragment }: Props): JSX.Element {
  return <>Accession no.: {fragment.accession || '-'}</>
}

export function Excavation({ fragment }: Props): JSX.Element {
  return <>Excavation no.: {fragment.archaeology?.excavationNumber || '-'}</>
}

export function Provenance({ fragment }: Props): JSX.Element {
  const provenance = fragment.archaeology?.site?.name
  return (
    <>
      Provenance:{' '}
      {provenance ? (
        <ExternalLink
          href={`/library/search/?site=${encodeURIComponent(provenance)}`}
          className={'subtle-link'}
        >
          {provenance}
        </ExternalLink>
      ) : (
        '-'
      )}
    </>
  )
}

export function ExcavationDate({ fragment }: Props): JSX.Element {
  const isRegularExcavation = fragment.archaeology?.isRegularExcavation
  const date = fragment.archaeology?.date
  const dateNotes = date?.notes

  const formatDate = (date: DateRange) => {
    const locale = navigator.language
    const start = new PartialDate(
      date.start.year,
      date.start.month,
      date.start.day,
    ).toLocaleString(locale)
    const end = date.end
      ? new PartialDate(
          date.end.year,
          date.end.month,
          date.end.day,
        ).toLocaleString(locale)
      : ''
    return end ? `${start} – ${end}` : start
  }

  return (
    <>
      {isRegularExcavation
        ? 'Regular Excavation'
        : date
          ? 'Irregular Excavation'
          : null}
      {date && <> ({formatDate(date)})</>}
      {dateNotes && <>, {dateNotes}</>}
    </>
  )
}
