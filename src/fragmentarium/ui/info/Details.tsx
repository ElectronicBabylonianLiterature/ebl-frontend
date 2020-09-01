import React, { Component } from 'react'

import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import CdliLink from './CdliLink'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import ExternalLink from 'common/ExternalLink'
import './Details.css'
import { Button, OverlayTrigger, Popover, Tooltip } from 'react-bootstrap'
import classNames from 'classnames'
import { genres, parseGenreTrees } from './genres'
import Select from 'react-select'

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
  updateGenre: (genre: readonly string[][]) => any
}

type State = {
  selectedGenres: string[][]
  isOverlayDisplayed: boolean
  isAlreadySelected: boolean
}
class Genre extends Component<DetailsProps, State> {
  constructor(props) {
    super(props)
    this.state = {
      selectedGenres: this.props.fragment.genre.map((elem) => elem.slice()),
      isOverlayDisplayed: false,
      isAlreadySelected: false,
    }
  }
  handleChange = (event) => {
    const newSelectedGenres = this.state.selectedGenres.slice()
    newSelectedGenres.push(event.value)
    if (!this.isGenreAlreadySelected(event.value)) {
      this.setState({
        selectedGenres: newSelectedGenres,
        isOverlayDisplayed: false,
      })
    } else {
      this.setState({ isAlreadySelected: true }, () => {
        setTimeout(() => {
          this.setState({ isAlreadySelected: false })
        }, 3000)
      })
    }
  }
  isGenreAlreadySelected = (genre: string[]): boolean => {
    return this.state.selectedGenres.some(
      (element) => JSON.stringify(element) === JSON.stringify(genre)
    )
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
      this.props.updateGenre(this.state.selectedGenres)
    }
  }

  render(): JSX.Element {
    const genreToString = (genre) => genre.join('-').replace(' ', '_')
    const options = parseGenreTrees(genres).map((genre: string[]) => {
      return {
        value: genre,
        label: genre.join(' -> '),
      }
    })

    const popover = (
      <Popover
        style={{ maxWidth: '600px' }}
        id="popover-select-genre"
        className={'w-100'}
      >
        <OverlayTrigger
          placement="top"
          show={this.state.isAlreadySelected}
          overlay={
            <Tooltip id="already selected">
              <strong>This option is already selected</strong>
            </Tooltip>
          }
        >
          <Popover.Content>
            <Select
              aria-label="select genre"
              options={options}
              onChange={(event) => this.handleChange(event)}
              isSearchable={true}
            />
          </Popover.Content>
        </OverlayTrigger>
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
              <li className="list-group-item" key={genreToString(genre)}>
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

function Details({ fragment, updateGenre }: DetailsProps): JSX.Element {
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
        <Genre fragment={fragment} updateGenre={updateGenre} />
      </li>
    </ul>
  )
}

export default Details
