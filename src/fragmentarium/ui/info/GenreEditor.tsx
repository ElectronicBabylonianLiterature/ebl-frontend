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
import ExternalLink from 'common/ExternalLink'

type Props = {
  fragment: Fragment
  updateGenres: (genres: Genres) => void
  genreOptions: readonly string[][]
}

type GenreOption = {
  value: string[]
  label: string
}

function DisplayGenre({ genreItem }: { genreItem: Genre }): JSX.Element {
  return (
    <>
      {genreItem.category.map((subGenre, subIndex) => {
        return (
          <React.Fragment key={subIndex}>
            {subIndex > 0 && ' ➝ '}
            <ExternalLink
              href={`/library/search/?genre=${encodeURIComponent(
                genreItem.category.slice(0, subIndex + 1).join(':'),
              )}`}
              className={'subtle-link'}
            >
              {subGenre}
            </ExternalLink>
          </React.Fragment>
        )
      })}
      {genreItem.uncertain && ' (?)'}
    </>
  )
}

function GenreList({
  genres,
  onDelete,
}: {
  genres: Genres
  onDelete: (genre: Genre) => void
}): JSX.Element {
  return (
    <>
      {!_.isEmpty(genres.genres) && (
        <ListGroup variant={'flush'} className={'GenreSelection__list'}>
          {genres.genres.map((genreItem, index) => {
            return (
              <ListGroup.Item key={index}>
                <div>{genreItem.toString()}</div>
                <div>
                  <MetaDeleteButton
                    aria-label={'delete-genre'}
                    onClick={() => onDelete(genreItem)}
                  />
                </div>
              </ListGroup.Item>
            )
          })}
        </ListGroup>
      )}
    </>
  )
}

function GenreSelectionForm({
  genreOptions,
  genres,
  addGenre,
}: {
  genreOptions: readonly string[][]
  genres: Genres
  addGenre: (genre: Genre) => void
}): JSX.Element {
  const [selected, setSelected] = useState<Genre | null>(null)
  const [isUncertain, setIsUncertain] = useState(false)

  const options: GenreOption[] = genreOptions
    .filter((genreItem: string[]) => {
      return !genres.has(new Genre(genreItem, isUncertain))
    })
    .map((genreItem: string[]) => {
      return {
        value: genreItem,
        label: `${genreItem.join(' ➝ ')}${isUncertain ? ' (?)' : ''}`,
      }
    })

  function handleAdd() {
    if (selected) {
      addGenre(selected)
      setIsUncertain(false)
      setSelected(null)
    }
  }

  return (
    <Form>
      <Form.Group className={'GenreSelection__select'}>
        <Select
          isClearable={true}
          placeholder="Select..."
          aria-label="select-genre"
          options={options}
          onChange={(option) =>
            setSelected(option ? new Genre(option.value, isUncertain) : null)
          }
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
            setSelected(selected?.setUncertain(!isUncertain) || null)
            setIsUncertain(!isUncertain)
          }}
        />
      </Form.Group>
      <Form.Group>
        <Button
          aria-label={'add-genre'}
          disabled={!selected}
          onClick={() => handleAdd()}
        >
          Add
        </Button>
      </Form.Group>
    </Form>
  )
}

function GenreEditor({
  fragment,
  updateGenres,
  genreOptions,
}: Props): JSX.Element {
  const [isDisplayed, setIsDisplayed] = useState(false)
  const [genres, setGenres] = useState(fragment.genres)
  const target = useRef(null)

  function addGenre(genre: Genre) {
    if (!genres.has(genre)) {
      const newGenres = genres.insertWithOrder(genre, genreOptions)
      setGenres(newGenres)
      updateGenres(newGenres)
    }
  }

  function removeGenre(genre: Genre) {
    const newGenres = genres.delete(genre)
    setGenres(newGenres)
    updateGenres(newGenres)
  }

  const popover = (
    <Popover
      id="popover-select-genre"
      className={'w-100 GenreSelection__overlay'}
    >
      <Popover.Body>
        <GenreList genres={genres} onDelete={removeGenre} />
        <GenreSelectionForm
          genreOptions={genreOptions}
          genres={genres}
          addGenre={addGenre}
        />
      </Popover.Body>
    </Popover>
  )

  return (
    <div>
      <h6>
        {`Genre${genres.genres.length > 1 ? 's' : ''}:`}
        {_.isEmpty(genres.genres) && ' -'}
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
        onHide={() => setIsDisplayed(false)}
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
    <GenreEditor
      fragment={fragment}
      updateGenres={updateGenres}
      genreOptions={data}
    />
  ),
  (props) => props.fragmentService.fetchGenres(),
)
