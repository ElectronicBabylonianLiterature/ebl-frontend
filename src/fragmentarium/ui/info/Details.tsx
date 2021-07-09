import React from 'react'

import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import CdliLink from './CdliLink'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import ExternalLink from 'common/ExternalLink'
import './Details.css'
import GenreSelection from 'fragmentarium/ui/info/GenreSelection'
import { Genres } from 'fragmentarium/domain/Genres'

interface Props {
  readonly fragment: Fragment
}

function Collection({ fragment: { collection } }: Props): JSX.Element {
  return <>{collection && `(${collection} Collection)`}</>
}

function MuseumName({ fragment: { museum } }: Props): JSX.Element {
  return museum.hasUrl ? (
    <ExternalLink href={museum.url}>{museum.name}</ExternalLink>
  ) : (
    <>{museum.name}</>
  )
}

function Joins({ fragment: { joins } }: Props): JSX.Element {
  return (
    <>
      Joins:{' '}
      {_.isEmpty(joins) ? (
        '-'
      ) : (
        <ul className="Details-joins">
          {joins.flat().map((join, index) => (
            <li className="Details-joins__join" key={index}>
              <FragmentLink number={join.museumNumber}>
                {join.museumNumber}
              </FragmentLink>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function Measurements({ fragment: { measures } }: Props): JSX.Element {
  const measurements = _([measures.length, measures.width, measures.thickness])
    .compact()
    .join(' × ')

  return <>{_.isEmpty(measurements) ? '' : `${measurements}  cm`}</>
}

function CdliNumber({ fragment: { cdliNumber } }: Props): JSX.Element {
  return (
    <>
      CDLI:{' '}
      {cdliNumber ? (
        <CdliLink cdliNumber={cdliNumber}>{cdliNumber}</CdliLink>
      ) : (
        '-'
      )}
    </>
  )
}

function Accession({ fragment }: Props): JSX.Element {
  return <>Accession: {fragment.accession || '-'}</>
}

interface DetailsProps {
  readonly fragment: Fragment
  readonly updateGenres: (genres: Genres) => void
  readonly fragmentService: any
}

function Details({
  fragment,
  updateGenres,
  fragmentService,
}: DetailsProps): JSX.Element {
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
        <CdliNumber fragment={fragment} />
      </li>
      <li className="Details__item">
        <Accession fragment={fragment} />
      </li>
      <li className="Details__item">
        <GenreSelection
          fragment={fragment}
          updateGenres={updateGenres}
          fragmentService={fragmentService}
        />
      </li>
    </ul>
  )
}

export default Details
