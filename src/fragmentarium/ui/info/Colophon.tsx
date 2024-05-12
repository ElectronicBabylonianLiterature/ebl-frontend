import React from 'react'
import { Colophon } from 'fragmentarium/domain/Colophon'
import { Fragment } from 'fragmentarium/domain/fragment'
import _ from 'lodash'
import './Colophon.sass'

const getGeneralInfoItems = (colophon: Colophon) =>
  ['colophonStatus', 'colophonOwnership', 'notesToScribalProcess']
    .map((key) => [key, colophon[key]])
    .filter(([key, value]) => !!value)
    .map(([key, value]) => `${_.startCase(key)}: ${value}`)

const getLocationItems = (colophon: Colophon) =>
  ['originalFrom', 'writtenIn']
    .map((key) => [key, colophon[key]?.value])
    .filter(([key, value]) => !!value)
    .map(([key, value]) => `${_.startCase(key)}: ${value}`)

const getTypesItem = (colophon: Colophon) =>
  colophon?.colophonTypes
    ? [`Types: ${colophon?.colophonTypes.join(', ')}`]
    : []

const getIndividualsItems = (colophon: Colophon) =>
  colophon?.individuals
    ?.map((individual) => individual.toString())
    .filter((value) => !!value) ?? []

const ColophonInfo = ({ fragment }: { fragment: Fragment }): JSX.Element => {
  const { colophon } = fragment
  if (!colophon) {
    return <></>
  }

  return (
    <ul className="ColophonInfo__items">
      {[
        ...getGeneralInfoItems(colophon),
        ...getTypesItem(colophon),
        ...getLocationItems(colophon),
        ...getIndividualsItems(colophon),
      ].map((text, index) => (
        <li key={index}>{text}</li>
      ))}
    </ul>
  )
}

export default ColophonInfo
