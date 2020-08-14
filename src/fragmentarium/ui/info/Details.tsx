import React, { useRef, useState } from 'react'

import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import CdliLink from './CdliLink'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import ExternalLink from 'common/ExternalLink'
import './Details.css'
import {
  Button,
  Col,
  Form,
  Overlay,
  OverlayTrigger,
  Popover,
  PopoverContent,
  Tooltip,
} from 'react-bootstrap'
import HelpTrigger from '../../../common/HelpTrigger'
import classNames from 'classnames'
import { provenances } from '../../../corpus/provenance'

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
function Genre({ fragment }: Props) {
  const handleChange = (event) => console.log('asd')
  const popover = (
    <Popover id="popover-basic">
      <Popover.Content>
        <Form.Row>
          <Form.Group as={Col} controlId={'select-genre'}>
            <Form.Control as="select" value={'asd'} onChange={handleChange} />
          </Form.Group>
        </Form.Row>
      </Popover.Content>
    </Popover>
  )
  return (
    <div>
      Genre:
      <OverlayTrigger trigger="click" placement="right" overlay={popover}>
        <Button
          variant="light"
          className={classNames(['float-right', 'far fa-edit'])}
        />
      </OverlayTrigger>
    </div>
  )
}

function Details({ fragment }: Props) {
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
        <Genre fragment={fragment} />
      </li>
    </ul>
  )
}

export default Details
