import { Fragment, Genre } from 'fragmentarium/domain/fragment'
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
import FragmentService from 'fragmentarium/application/FragmentService'

type Props = {
  fragment: Fragment
  updateGenres: (genres: Genre[]) => void
  genreOptions: readonly string[][]
}

function GenreSelection({
  fragment,
  updateGenres,
  genreOptions,
}: Props): JSX.Element {
  const [selectedGenre, setSelectedGenre] = useState<Genre | undefined>(
    undefined
  )
  const [genres, setGenres] = useState(fragment.genres)
  const prevGenres = usePrevious(genres)
  const [isSelectDisplayed, setIsSelectDisplayed] = useState(false)
  const [isSelectedGenreUncertain, setIsSelectedGenreUncertain] = useState(
    false
  )
  const target = useRef(null)

  function handleChange(event) {
    const newSelection: Genre = event.value
    setSelectedGenre(newSelection)
    if (!isGenreAlreadyPresent(newSelection)) {
      setGenres((currentGenres) =>
        _.sortBy([...currentGenres, newSelection], function (genre) {
          return JSON.stringify(genreOptions).indexOf(
            JSON.stringify(genre.category)
          )
        })
      )
    } else {
      const duplicateGenre = _.find(genres, {
        category: newSelection.category,
      }) as Genre
      setSelectedGenre(duplicateGenre)
      setIsSelectedGenreUncertain(duplicateGenre.uncertain)
    }
  }
  useEffect(() => {
    if (
      JSON.stringify(prevGenres) !== JSON.stringify(genres) &&
      prevGenres !== undefined
    ) {
      updateGenres(genres as Genre[])
    }
  })

  function isGenreAlreadyPresent(selectedGenre: Genre): boolean {
    return genres.some(
      (element) =>
        JSON.stringify(element.category) ===
        JSON.stringify(selectedGenre.category)
    )
  }

  function deleteGenre(genreToDelete) {
    setGenres(
      genres.filter(
        (elem) => JSON.stringify(elem) !== JSON.stringify(genreToDelete)
      )
    )
  }
  function genreToString(genreItem: readonly string[]): string {
    return genreItem.join('-').replace(' ', '_')
  }
  function toggleUncertain() {
    if (selectedGenre) {
      setIsSelectedGenreUncertain(!isSelectedGenreUncertain)
      const updatedGenre = {
        ...selectedGenre,
        uncertain: !selectedGenre.uncertain,
      }
      setSelectedGenre(updatedGenre)
      const genresCopy = _.cloneDeep(genres as Genre[])
      genresCopy.splice(
        _.findIndex(genresCopy, { category: updatedGenre.category }),
        1,
        updatedGenre
      )
      setGenres(genresCopy)
      setIsSelectDisplayed(false)
    }
  }

  const options = genreOptions.map((genreItem: string[]) => {
    return {
      value: {
        category: genreItem,
        uncertain: false,
      },
      label: genreItem.join(' ➝ '),
    }
  })

  const popover = (
    <Popover
      style={{ maxWidth: '600px' }}
      id="popover-select-genre"
      className={'w-100'}
    >
      <Popover.Content>
        <Select
          aria-label="select-genre"
          options={options}
          onChange={(event) => handleChange(event)}
          isSearchable={true}
        />
        <div
          style={{
            color: 'hsl(0, 0%, 40%)',
            display: 'inline-block',
            fontSize: 12,
            fontStyle: 'italic',
            marginTop: '1em',
            marginLeft: '0.2em',
          }}
        >
          <input
            type="checkbox"
            checked={isSelectedGenreUncertain}
            onChange={toggleUncertain}
          />
          &nbsp;Uncertain
        </div>
      </Popover.Content>
    </Popover>
  )

  return (
    <div>
      Genres:
      <Button
        variant="light"
        ref={target}
        className={classNames(['float-right', 'far fa-edit', 'mh-100'])}
        onClick={() => setIsSelectDisplayed(true)}
      />
      <Overlay
        target={target.current}
        placement="right"
        show={isSelectDisplayed}
        rootClose={true}
        rootCloseEvent={'click'}
        onHide={() => {
          setIsSelectDisplayed(false)
          setSelectedGenre(undefined)
          setIsSelectedGenreUncertain(false)
        }}
      >
        {popover}
      </Overlay>
      <ul className={classNames(['list-group', 'mt-2'])}>
        {genres.map((genreItem) => {
          const uncertain = genreItem.uncertain ? '(?)' : ''
          return (
            <li
              className="list-group-item"
              key={genreToString(genreItem.category)}
            >
              {`${genreItem.category.join(' ➝ ')} ${uncertain}`}
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
  { fragment: Fragment; updateGenres: (genres: Genre[]) => void },
  { fragmentService },
  readonly string[][]
>(
  ({ fragment, updateGenres, data }) => (
    <GenreSelection
      fragment={fragment}
      updateGenres={updateGenres}
      genreOptions={data}
    />
  ),
  (props) => props.fragmentService.fetchGenres()
)
