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
  BmIdLink,
  YaleBabylonianLink,
} from './ExternalNumberLink'

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
    [fragment.accession, YaleBabylonianLink],
  ]
  return (
    <ul className="ExternalResources__items">
      {externalNumbers.map(
        ([number, LinkComponent], index) =>
          number && (
            <li>
              <LinkComponent number={number} key={index} />
            </li>
          )
      )}
    </ul>
  )
}
