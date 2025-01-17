import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import './ExternalResources.sass'
import {
  BdtnsLink,
  CdliLink,
  ChicagoIsacLink,
  ArchibabLink,
  UrOnlineLink,
  HilprechtJenaLink,
  HilprechtHeidelbergLink,
  AchemenetLink,
  NabuccoLink,
  DigitaleKeilschriftBibliothekLink,
  MetropolitanLink,
  pierpontMorganLink,
  LouvreLink,
  dublinTcdLink,
  cambridgeMaaLink,
  alalahHpmLink,
  australianinstituteofarchaeologyLink,
  PhiladelphiaLink,
  BmIdLink,
  YalePeabodyLink,
  OraccLinks,
  SealLinks,
} from './ExternalNumberLink'
import _ from 'lodash'

type ExternalLinkComponent = ({ number }: { number: string }) => JSX.Element

type ExternalLinkTypes = {
  number: string
  LinkComponent: ExternalLinkComponent
}

const ExternalLink = ({ number, LinkComponent }: ExternalLinkTypes) => {
  return number ? <LinkComponent number={number} /> : null
}
export default function ExternalResources({
  fragment,
}: {
  readonly fragment: Fragment
}): JSX.Element {
  const externalNumbers: ReadonlyArray<[string, ExternalLinkComponent]> = [
    [fragment.getExternalNumber('bmIdNumber'), BmIdLink],
    [fragment.getExternalNumber('cdliNumber'), CdliLink],
    [fragment.getExternalNumber('bdtnsNumber'), BdtnsLink],
    [fragment.getExternalNumber('chicagoIsacNumber'), ChicagoIsacLink],
    [fragment.getExternalNumber('archibabNumber'), ArchibabLink],
    [fragment.getExternalNumber('urOnlineNumber'), UrOnlineLink],
    [fragment.getExternalNumber('hilprechtJenaNumber'), HilprechtJenaLink],
    [
      fragment.getExternalNumber('hilprechtHeidelbergNumber'),
      HilprechtHeidelbergLink,
    ],
    [fragment.getExternalNumber('achemenetNumber'), AchemenetLink],
    [fragment.getExternalNumber('nabuccoNumber'), NabuccoLink],
    [
      fragment.getExternalNumber('digitaleKeilschriftBibliothekNumber'),
      DigitaleKeilschriftBibliothekLink,
    ],
    [fragment.getExternalNumber('metropolitanNumber'), MetropolitanLink],
    [fragment.getExternalNumber('pierpontMorganNumber'), pierpontMorganLink],
    [fragment.getExternalNumber('louvreNumber'), LouvreLink],
    [fragment.getExternalNumber('dublinTcdNumber'), dublinTcdLink],
    [fragment.getExternalNumber('cambridgeMaaNumber'), cambridgeMaaLink],
    [fragment.getExternalNumber('alalahHpmNumber'), alalahHpmLink],
    [
      fragment.getExternalNumber('australianinstituteofarchaeologyNumber'),
      australianinstituteofarchaeologyLink,
    ],
    [fragment.getExternalNumber('philadelphiaNumber'), PhiladelphiaLink],
    [fragment.getExternalNumber('yalePeabodyNumber'), YalePeabodyLink],
  ]

  return (
    <ul className="ExternalResources__items">
      {externalNumbers
        .filter(([number]) => !_.isEmpty(number))
        .map(([number, LinkComponent], index) => (
          <li key={index}>
            <ExternalLink number={number} LinkComponent={LinkComponent} />
          </li>
        ))}
      {!_.isEmpty(fragment.oraccNumbers) && (
        <li>
          <OraccLinks
            projects={fragment.oraccNumbers}
            cdliNumber={fragment.getExternalNumber('cdliNumber')}
          />
        </li>
      )}
      {!_.isEmpty(fragment.sealNumbers) && (
        <li>
          <SealLinks sealTextNumbers={fragment.sealNumbers} />
        </li>
      )}
    </ul>
  )
}
