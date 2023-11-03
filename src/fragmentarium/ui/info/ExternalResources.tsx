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
    [fragment.bmIdNumber, BmIdLink],
    [fragment.cdliNumber, CdliLink],
    [fragment.bdtnsNumber, BdtnsLink],
    [fragment.archibabNumber, ArchibabLink],
    [fragment.urOnlineNumber, UrOnlineLink],
    [fragment.hilprechtJenaNumber, HilprechtJenaLink],
    [fragment.hilprechtHeidelbergNumber, HilprechtHeidelbergLink],
    [fragment.achemenetNumber, AchemenetLink],
    [fragment.yalePeabodyNumber, YalePeabodyLink],
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
            cdliNumber={fragment.cdliNumber}
          />
        </li>
      )}
    </ul>
  )
}
