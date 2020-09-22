import React from 'react'

import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import CdliLink from './CdliLink'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import ExternalLink from 'common/ExternalLink'
import './Details.css'
import GenreSelection from 'fragmentarium/ui/info/GenreSelection'
import { Genres } from 'fragmentarium/domain/Genres'

type Props = {
  fragment: Fragment
}

function Collection({ fragment }: Props) {
  return <>{fragment.collection && `(${fragment.collection} Collection)`}</>
}

function MuseumName({ fragment }: Props) {
  const museum = fragment.museum
  return museum.hasUrl ? (
    <ExternalLink href={museum.url}>{museum.name}</ExternalLink>
  ) : (
    <>{museum.name}</>
  )
}

function Joins({ fragment }: Props) {
  return (
    <>
      Joins:{' '}
      {_.isEmpty(fragment.joins) ? (
        '-'
      ) : (
        <ul className="Details-joins">
          {fragment.joins.map((join) => (
            <li className="Details-joins__join" key={join}>
              <FragmentLink number={join}>{join}</FragmentLink>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function Measurements({ fragment }: Props) {
  const measurements = _([
    fragment.measures.length,
    fragment.measures.width,
    fragment.measures.thickness,
  ])
    .compact()
    .join(' × ')

  return <>{`${measurements}${_.isEmpty(measurements) ? '' : ' cm'}`}</>
}

function CdliNumber({ fragment }: Props) {
  const cdliNumber = fragment.cdliNumber
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

function Accession({ fragment }: Props) {
  return <>Accession: {fragment.accession || '-'}</>
}

type DetailsProps = {
  fragment: Fragment
  updateGenres: (genres: Genres) => any
  fragmentService: any
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
