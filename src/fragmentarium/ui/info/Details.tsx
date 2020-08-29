import React, { Component } from 'react'

import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import CdliLink from './CdliLink'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import ExternalLink from 'common/ExternalLink'
import './Details.css'
import { Button, Col, Form, OverlayTrigger, Popover } from 'react-bootstrap'
import classNames from 'classnames'
import { genres, parseGenreTrees } from './genres'
import FragmentService from 'fragmentarium/application/FragmentService'

type Props = {
  fragment: Fragment
}

type DetailsProps = {
  fragment: Fragment
  fragmentService: FragmentService
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
type State = {
  selectedGenres: string[][]
  isOverlayDisplayed: boolean
}
class Genre extends Component<DetailsProps, State> {
  constructor(props) {
    super(props)
    this.state = {
      selectedGenres: this.props.fragment.genre.map((elem) => elem.slice()),
      isOverlayDisplayed: false,
    }
  }
  handleChange = (event) => {
    const newSelectedGenres = this.state.selectedGenres.slice()
    newSelectedGenres.push(event.target.value.split('-'))
    this.setState({
      selectedGenres: newSelectedGenres,
      isOverlayDisplayed: false,
    })
  }

  switchIsOverlayDisplayed() {
    this.setState({ isOverlayDisplayed: !this.state.isOverlayDisplayed })
  }
  deleteSelectedGenre(genreToDelete) {
    const newSelectedGenre = this.state.selectedGenres.filter(
      (elem) => JSON.stringify(elem) !== JSON.stringify(genreToDelete)
    )
    this.setState({ selectedGenres: newSelectedGenre })
  }

  componentDidUpdate(
    prevProps: Readonly<DetailsProps>,
    prevState: Readonly<State>
  ) {
    if (
      JSON.stringify(prevState.selectedGenres) !==
      JSON.stringify(this.state.selectedGenres)
    ) {
      this.props.fragmentService.updateGenre(
        this.props.fragment.number,
        this.state.selectedGenres
      )
    }
  }

  render(): JSX.Element {
    const genreToString = (genre) => genre.join('-').replace(' ', '_')
    const popover = (
      <Popover id="popover-basic">
        <Popover.Content>
          <Form.Row>
            <Form.Group as={Col} controlId={'select-genres'}>
              <Form.Control as="select" onChange={this.handleChange}>
                {parseGenreTrees(genres).map((genre) => {
                  let space = ''
                  for (let i = 0; i < genre.length - 1; i++) {
                    space = space.concat('\u00a0\u00a0\u00a0\u00a0')
                  }
                  return (
                    <option
                      key={genreToString(genre)}
                      value={genreToString(genre)}
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
          show={this.state.isOverlayDisplayed}
        >
          <Button
            variant="light"
            className={classNames(['float-right', 'far fa-edit', 'mh-100'])}
            onClick={() => this.switchIsOverlayDisplayed()}
          />
        </OverlayTrigger>
        <ul className={classNames(['list-group', 'mt-2'])}>
          {this.state.selectedGenres.map((genre) => {
            return (
              <li
                className="list-group-item"
                key={genreToString(genre)}
                aria-label={genreToString(genre)}
              >
                {genre.join(' \uD83E\uDC02 ')}
                <Button
                  variant="light"
                  className={classNames([
                    'float-right',
                    'fas fa-trash',
                    'align-top',
                  ])}
                  onClick={() => this.deleteSelectedGenre(genre)}
                />
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}

function Details({ fragment, fragmentService }: DetailsProps): JSX.Element {
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
