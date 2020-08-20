import React, { useState } from 'react'

import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import CdliLink from './CdliLink'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import ExternalLink from 'common/ExternalLink'
import './Details.css'
import { Button, Col, Form, OverlayTrigger, Popover } from 'react-bootstrap'
import classNames from 'classnames'
import { genres, parseGenreTrees } from './genres'

type Props = {
  fragment: Fragment
}

type DetailsProps = {
  fragment: Fragment
  fragmentService
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
function Genre({ fragment, fragmentService }: DetailsProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [showOverlay, setShowOverlay] = useState(false)
  const handleChange = (event) => {
    setSelectedGenres((currentState) => [...currentState, event.target.value])
    setShowOverlay(false)
    fragmentService.updateGenre(fragment.number, selectedGenres)
  }
  const popover = (
    <Popover id="popover-basic">
      <Popover.Content>
        <Form.Row>
          <Form.Group as={Col} controlId={'select-genres'}>
            <Form.Control as="select" onChange={handleChange}>
              {parseGenreTrees(genres).map((genre) => {
                let space = ''
                for (let i = 0; i < genre.length - 1; i++) {
                  space = space.concat('\u00a0\u00a0\u00a0\u00a0')
                }
                return (
                  <option
                    key={genre.join('-')}
                    value={genre.join(' \uD83E\uDC02 ')}
                  >
                    {space}
                    {genre[genre.length - 1]}
                  </option>
                )
              })}
            </Form.Control>
          </Form.Group>
        </Form.Row>
      </Popover.Content>
    </Popover>
  )
  return (
    <div>
      Genres:
      <OverlayTrigger
        trigger="click"
        placement="right"
        overlay={popover}
        show={showOverlay}
      >
        <Button
          variant="light"
          className={classNames(['float-right', 'far fa-edit', 'mh-100'])}
          onClick={() => setShowOverlay(!showOverlay)}
        />
      </OverlayTrigger>
      <ul className={classNames(['list-group', 'mt-2'])}>
        {selectedGenres.map((element) => (
          <li className="list-group-item" key={element}>
            {element}
            <Button
              variant="light"
              className={classNames([
                'float-right',
                'fas fa-trash',
                'align-top',
              ])}
              onClick={() => setShowOverlay(!showOverlay)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

function Details({ fragment, fragmentService }: DetailsProps) {
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
        <Genre fragment={fragment} fragmentService={fragmentService} />
      </li>
    </ul>
  )
}

export default Details
