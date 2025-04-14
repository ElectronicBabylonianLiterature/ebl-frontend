import { Fragment } from 'fragmentarium/domain/fragment'
import React, { useRef, useState } from 'react'
import { Button, Form, ListGroup, Overlay, Popover } from 'react-bootstrap'
import Select from 'react-select'
import withData from 'http/withData'
import { Genre, Genres } from 'fragmentarium/domain/Genres'
import {
  MetaEditButton,
  MetaDeleteButton,
} from 'fragmentarium/ui/info/MetaEditButton'
import _ from 'lodash'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Link } from 'react-router-dom'

type Props = {
  fragment: Fragment
  updateGenres: (genres: Genres) => void
  genreOptions: readonly string[][]
}

function DisplayGenre({ genreItem }: { genreItem: Genre }): JSX.Element {
  return (
    <>
      {genreItem.category.map((subGenre, subIndex) => {
        return (
          <React.Fragment key={subIndex}>
            {subIndex > 0 && ' ➝ '}
            <Link
              to={`/library/search/?genre=${encodeURIComponent(
                genreItem.category.slice(0, subIndex + 1).join(':')
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {subGenre}
            </Link>
          </React.Fragment>
        )
      })}
      {genreItem.uncertain && ' (?)'}
    </>
  )
}

function GenreSelection({
  fragment,
  updateGenres,
  genreOptions,
}: Props): JSX.Element {
  const [isDisplayed, setIsDisplayed] = useState(false)
  const [selected, setSelected] = useState<Genre | null>(null)
  const [genres, setGenres] = useState(fragment.genres)
  const [isUncertain, setIsUncertain] = useState(false)
  const target = useRef(null)

  function addGenre(genre: Genre) {
    if (!genres.has(genre)) {
      const newGenres = genres.insertWithOrder(genre, genreOptions)
      setGenres(newGenres)
      updateGenres(newGenres)
      setIsUncertain(false)
    }
    setSelected(null)
  }

  function removeGenre(genre: Genre) {
    const newGenres = genres.delete(genre)
    setGenres(newGenres)
    updateGenres(newGenres)
  }

  const options = genreOptions
    .filter((genreItem: string[]) => {
      return !genres.has(new Genre(genreItem, isUncertain))
    })
    .map((genreItem: string[]) => {
      return {
        value: genreItem,
        label: `${genreItem.join(' ➝ ')}${isUncertain ? ' (?)' : ''}`,
      }
    })

  const popover = (
    <Popover
      id="popover-select-genre"
      className={'w-100 GenreSelection__overlay'}
    >
      <Popover.Content>
        {!_.isEmpty(genres.genres) && (
          <ListGroup variant={'flush'} className={'GenreSelection__list'}>
            {genres.genres.map((genreItem, index) => {
              return (
                <ListGroup.Item key={index}>
                  <div>{genreItem.toString()}</div>
                  <div>
                    <MetaDeleteButton
                      aria-label={'delete-genre'}
                      onClick={() => removeGenre(genreItem)}
                    />
                  </div>
                </ListGroup.Item>
              )
            })}
          </ListGroup>
        )}
        <Form>
          <Form.Group className={'GenreSelection__select'}>
            <Select
              placeholder="Select..."
              aria-label="select-genre"
              options={options}
              onChange={(event) => {
                if (event) {
                  setSelected(new Genre(event.value, isUncertain))
                }
              }}
              isSearchable={true}
              autoFocus={true}
              value={
                selected
                  ? {
                      value: [...selected.category],
                      label: selected.toString(),
                    }
                  : null
              }
            />
            <Form.Check
              type="checkbox"
              aria-label="toggle-uncertain"
              label="Uncertain"
              checked={isUncertain}
              onChange={() => {
                if (selected) {
                  setSelected(selected.setUncertain(!isUncertain))
                }
                setIsUncertain(!isUncertain)
              }}
            />
          </Form.Group>
          <Form.Group>
            <Button
              disabled={!selected}
              onClick={() => {
                if (selected) {
                  addGenre(selected)
                }
              }}
            >
              Add
            </Button>
          </Form.Group>
        </Form>
      </Popover.Content>
    </Popover>
  )

  return (
    <div>
      <h6>
        {`Genre${genres.genres.length > 1 ? 's' : ''}: `}
        {_.isEmpty(genres.genres) && '-'}
        <MetaEditButton
          onClick={() => setIsDisplayed(true)}
          target={target}
          aria-label={'edit-genre'}
        />
      </h6>
      {genres.genres.map((genreItem, index) => (
        <span key={index} className={'GenreSelection__item'}>
          {index > 0 && ' | '}
          <DisplayGenre genreItem={genreItem} />
        </span>
      ))}
      <Overlay
        target={target.current}
        placement="right"
        show={isDisplayed}
        rootClose={true}
        rootCloseEvent={'click'}
        onHide={() => {
          setIsUncertain(false)
          setIsDisplayed(false)
        }}
      >
        {popover}
      </Overlay>
    </div>
  )
}

export default withData<
  { fragment: Fragment; updateGenres: (genres: Genres) => void },
  { fragmentService: FragmentService },
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
