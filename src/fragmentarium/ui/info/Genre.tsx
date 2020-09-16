import { Fragment } from 'fragmentarium/domain/fragment'
import React, { useEffect, useRef, useState } from 'react'
import {
  Button,
  Overlay,
  OverlayTrigger,
  Popover,
  Tooltip,
} from 'react-bootstrap'
import Select from 'react-select'
import classNames from 'classnames'
import { usePrevious } from 'common/usePrevious'
import withData from 'http/withData'
import _ from 'lodash'

type Props = {
  fragment: Fragment
  updateGenre: (genre: any) => void
  genreOptions: readonly string[][]
}

function Genre({ fragment, updateGenre, genreOptions }: Props): JSX.Element {
  const [genre, setGenre] = useState(fragment.genre)
  const prevGenre = usePrevious(genre)
  const [isSelectDisplayed, setIsSelectDisplayed] = useState(false)
  const [
    isDuplicateWarningDisplayed,
    setIsDuplicateWarningDisplayed,
  ] = useState(false)
  const target = useRef(null)

  function handleChange(event) {
    if (!isGenreAlreadyPresent(event.value)) {
      setGenre((currentGenre) =>
        _.sortBy([...currentGenre, event.value], function (item) {
          return JSON.stringify(genreOptions).indexOf(JSON.stringify(item))
        })
      )
      setIsSelectDisplayed(false)
    } else {
      setIsDuplicateWarningDisplayed(true)
    }
  }
  useEffect(() => {
    if (JSON.stringify(prevGenre) !== JSON.stringify(genre)) {
      updateGenre(genre)
    }
  })
  useEffect(() => {
    if (isDuplicateWarningDisplayed) {
      setTimeout(() => {
        setIsDuplicateWarningDisplayed(false)
      }, 2500)
    }
  })

  function isGenreAlreadyPresent(selectedGenre: string[]): boolean {
    return genre.some(
      (element) => JSON.stringify(element) === JSON.stringify(selectedGenre)
    )
  }

  function switchIsSelectDisplayed() {
    setIsSelectDisplayed(!isSelectDisplayed)
  }

  function deleteGenre(genreToDelete) {
    setGenre(
      genre.filter(
        (elem) => JSON.stringify(elem) !== JSON.stringify(genreToDelete)
      )
    )
  }
  function genreToString(genreItem: readonly string[]): string {
    return genreItem.join('-').replace(' ', '_')
  }

  const options = genreOptions.map((genreItem: string[]) => {
    return {
      value: genreItem,
      label: genreItem.join(' ➝ '),
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
        show={isDuplicateWarningDisplayed}
        overlay={
          <Tooltip id="already-selected-tooltip">
            <strong>This option is already selected</strong>
          </Tooltip>
        }
      >
        <Popover.Content>
          <Select
            aria-label="select genre"
            options={options}
            onChange={(event) => handleChange(event)}
            isSearchable={true}
          />
        </Popover.Content>
      </OverlayTrigger>
    </Popover>
  )

  return (
    <div>
      Genres:
      <Button
        variant="light"
        ref={target}
        className={classNames(['float-right', 'far fa-edit', 'mh-100'])}
        onClick={() => switchIsSelectDisplayed()}
      />
      <Overlay
        target={target.current}
        placement="right"
        show={isSelectDisplayed}
        rootClose={true}
        onHide={() => setIsSelectDisplayed(false)}
      >
        {popover}
      </Overlay>
      <ul className={classNames(['list-group', 'mt-2'])}>
        {genre.map((genreItem) => {
          return (
            <li className="list-group-item" key={genreToString(genreItem)}>
              {genreItem.join(' ➝ ')}
              <Button
                variant="light"
                data-testid="delete-button"
                className={classNames([
                  'float-right',
                  'fas fa-trash',
                  'align-top',
                ])}
                onClick={() => deleteGenre(genreItem)}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default withData<
  { fragment: Fragment; updateGenre: (genre: string[][]) => void },
  { fragmentService: any },
  readonly string[][]
>(
  ({ fragment, updateGenre, data }) => (
    <Genre fragment={fragment} updateGenre={updateGenre} genreOptions={data} />
  ),
  (props) => props.fragmentService.fetchGenre()
)
