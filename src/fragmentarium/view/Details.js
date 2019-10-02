// @flow
import React from 'react'
import _ from 'lodash'

import type { Fragment } from 'fragmentarium/fragment'
import CdliLink from './CdliLink'
import FragmentLink from 'fragmentarium/FragmentLink'
import ExternalLink from 'common/ExternalLink'

import './Details.css'

const museums = {
  'The British Museum': 'https://britishmuseum.org/'
}

type Props = { fragment: Fragment }

function Collection({ fragment }: Props) {
  return fragment.collection && `(${fragment.collection} Collection)`
}

function Museum({ fragment }: Props) {
  const museum = fragment.museum
  const museumUrl = museums[museum]
  return <ExternalLink href={museumUrl}>{museum}</ExternalLink>
}

function Joins({ fragment }: Props) {
  return (
    <>
      Joins:{' '}
      {_.isEmpty(fragment.joins) ? (
        '-'
      ) : (
        <ul className="Details-joins">
          {fragment.joins.map(join => (
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
    fragment.measures.thickness
  ])
    .compact()
    .join(' × ')

  return `${measurements}${_.isEmpty(measurements) ? '' : ' cm'}`
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

function Details({ fragment }: Props) {
  return (
    <ul className="Details">
      <li className="Details__item">
        <Museum fragment={fragment} />
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
    </ul>
  )
}

export default Details
