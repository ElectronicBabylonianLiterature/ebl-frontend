import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import './ExternalResources.sass'
import {
  BdtnsLink,
  CdliLink,
  ArchibabLink,
  UrOnlineLink,
  HilprechtJenaLink,
  HilprechtHeidelbergLink,
  AchemenetLink,
  NabuccoLink,
  MetropolitanLink,
  LouvreLink,
  PhiladelphiaLink,
  BmIdLink,
  YalePeabodyLink,
  OraccLinks,
} from './ExternalNumberLink'
import _ from 'lodash'

type ExternalLinkComponent = ({ number }: { number: string }) => JSX.Element

export default function ExternalResources({
  fragment,
}: {
  readonly fragment: Fragment
}): JSX.Element {
  const externalNumbers: ReadonlyArray<[string, ExternalLinkComponent]> = [
    [fragment.getExternalNumber('bmIdNumber'), BmIdLink],
    [fragment.getExternalNumber('cdliNumber'), CdliLink],
    [fragment.getExternalNumber('bdtnsNumber'), BdtnsLink],
    [fragment.getExternalNumber('archibabNumber'), ArchibabLink],
    [fragment.getExternalNumber('urOnlineNumber'), UrOnlineLink],
    [fragment.getExternalNumber('hilprechtJenaNumber'), HilprechtJenaLink],
    [
      fragment.getExternalNumber('hilprechtHeidelbergNumber'),
      HilprechtHeidelbergLink,
    ],
    [fragment.getExternalNumber('achemenetNumber'), AchemenetLink],
    [fragment.getExternalNumber('nabuccoNumber'), NabuccoLink],
    [fragment.getExternalNumber('metropolitanNumber'), MetropolitanLink],
    [fragment.getExternalNumber('louvreNumber'), LouvreLink],
    [fragment.getExternalNumber('philadelphiaNumber'), PhiladelphiaLink],
    [fragment.getExternalNumber('yalePeabodyNumber'), YalePeabodyLink],
  ]
  return (
    <ul className="ExternalResources__items">
      {externalNumbers.map(
        ([number, LinkComponent], index) =>
          number && (
            <li key={index}>
              <LinkComponent number={number} />
            </li>
          )
      )}
      {!_.isEmpty(fragment.oraccNumbers) && (
        <li>
          <OraccLinks
            projects={fragment.oraccNumbers}
            cdliNumber={fragment.getExternalNumber('cdliNumber')}
          />
        </li>
      )}
    </ul>
  )
}
